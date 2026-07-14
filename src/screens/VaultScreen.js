import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

// Import your Supabase client directly
import { supabase } from '../services/supabaseClient';

export default function VaultScreen({ navigation }) {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch documents from Supabase database table matching the specific user
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      // Get currently logged-in user details safely
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      // Fetch private files belonging to this user sorted by uploaded_at
      const { data: dbData, error: dbError } = await supabase
        .from('user_private_files')
        .select('*')
        .order('uploaded_at', { ascending: false }); 

      if (dbError) throw dbError;

      // Format database rows into the UI schema layout
      const formattedDocs = dbData.map(file => ({
        id: file.id,
        title: file.file_name,
        type: file.document_type || 'Document',
        date: new Date(file.uploaded_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        size: 'Securely Stored', 
        isReady: file.is_ready || false, 
      }));

      setDocuments(formattedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Alert.alert("Error", "Could not load your saved files.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger data fetch dynamically when the screen mounts
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Securely pick, convert, and upload a private file
  const handleUploadPrivateFile = async () => {
    try {
      // 1. Open the device document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return; 
      }

      const file = result.assets[0];
      setIsUploading(true);

      // 2. Fetch logged-in user details safely
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Log in required to upload secure files.");
      }

      // 3. Convert the file using modern SDK 54 Object-Oriented API
      const fileInstance = new File(file.uri);
      const base64 = await fileInstance.base64();

      // Simple conversion to an ArrayBuffer binary blob 
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const fileBody = bytes.buffer;

      // 4. Set the correct path inside your private 'user_vault' bucket
      const fileExtension = file.name.split('.').pop();
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const storagePath = `user_${user.id}/${uniqueName}`;

      // 5. Upload directly to the 'user_vault' private bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('user_vault')
        .upload(storagePath, fileBody, {
          contentType: file.mimeType || 'application/octet-stream',
          upsert: false,
        });

      if (storageError) throw storageError;

      // 6. Insert metadata row to match the storage file into 'user_private_files' table
      const { data: dbData, error: dbError } = await supabase
        .from('user_private_files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: storageData.path,
          document_type: file.mimeType?.includes('pdf') ? 'PDF Document' : 'ID Image',
          extracted_data: {} 
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 7. Update UI instantly with the newly uploaded document details
      const newDoc = {
        id: dbData.id,
        title: dbData.file_name,
        type: dbData.document_type,
        date: new Date(dbData.uploaded_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown Size',
        isReady: false, 
      };

      setDocuments(prevDocs => [newDoc, ...prevDocs]);
      Alert.alert("Success", "Private document securely added to your vault!");

    } catch (error) {
      console.error(error);
      Alert.alert("Upload Error", error.message || "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderDocument = ({ item }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-[#E2E8F0]">
      <View className="w-[50px] h-[50px] rounded-xl bg-[#F8FAFC] justify-center items-center mr-4">
        <Ionicons 
          name={item.title.includes('.pdf') ? "document-text" : "image"} 
          size={28} 
          color="#1E3A8A" 
        />
      </View>
      
      <View className="flex-1 justify-center">
        <Text className="text-[15px] font-semibold text-textDark mb-1" numberOfLines={1} ellipsizeMode="middle">
          {item.title}
        </Text>
        <Text className="text-xs text-textLight mb-2">
          {item.type} • {item.date} • {item.size}
        </Text>
        
        {/* Status Badge */}
        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full mr-1.5 ${item.isReady ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
          <Text className={`text-xs font-medium ${item.isReady ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
            {item.isReady ? 'Ready to Print/Submit' : 'Action Required'}
          </Text>
        </View>
      </View>

      <TouchableOpacity className="p-2 ml-2">
        <Ionicons name="download-outline" size={22} color="#1a1a1a" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <View 
        className="bg-white pb-4 px-6 border-b border-[#E2E8F0]"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30 }}
      >
        <Text className="text-xl font-bold text-primaryBlue">Document Vault</Text>
        <Text className="text-sm text-textLight mt-1">Your encrypted civic files and ID scans</Text>
      </View>

      {/* Admin Button */}
      <TouchableOpacity 
        className="bg-white border border-[#E2E8F0] border-dashed rounded-xl p-4 mx-5 mt-5 mb-2 shadow-sm"
        onPress={() => navigation.navigate('Admin')}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <Text className="text-[20px] mr-3">➕</Text>
          <View className="flex-1">
            <Text className="text-base font-semibold text-primaryBlue">Add Knowledge Documents</Text>
            <Text className="text-xs text-textLight mt-0.5">Train the AI on new government rules</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* User Private File Upload Button */}
      <TouchableOpacity 
        className="bg-white border border-[#E2E8F0] border-dashed rounded-xl p-4 mx-5 mb-2 shadow-sm"
        onPress={handleUploadPrivateFile}
        disabled={isUploading}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          {isUploading ? (
            <ActivityIndicator size="small" color="#10B981" className="mr-3" />
          ) : (
            <Text className="text-[20px] mr-3">➕</Text>
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold text-[#10B981]">
              {isUploading ? "Uploading Private File..." : "Upload Private File"}
            </Text>
            <Text className="text-xs text-textLight mt-0.5">Upload personal documents securely</Text>
          </View>
        </View>
      </TouchableOpacity>

      <FlatList
        data={documents}
        keyExtractor={item => item.id}
        renderItem={renderDocument}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={fetchDocuments}
        ListEmptyComponent={() => (
          !isLoading && (
            <View className="items-center justify-center py-20">
              <Text className="text-gray-400 text-base font-medium">No secure documents found</Text>
              <Text className="text-gray-400 text-xs mt-1">Tap the layout buttons above to get started.</Text>
            </View>
          )
        )}
      />
    </View>
  );
}