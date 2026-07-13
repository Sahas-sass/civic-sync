import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AdminScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);

  const handlePickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets) {
        return; 
      }

      const file = result.assets[0];
      setSelectedFileName(file.name);
      setIsUploading(true);

      const formData = new FormData();
      const safeTitle = file.name ? String(file.name) : 'document.pdf';
      formData.append('title', safeTitle);

      if (Platform.OS === 'web') {
        if (file.file) {
           formData.append('file', file.file);
        } else {
           throw new Error("File object is missing from the picker result on web.");
        }
      } else {
        formData.append('file', {
          uri: file.uri,
          name: safeTitle,
          type: file.mimeType || 'application/pdf',
        });
      }

      const BACKEND_URL = 'https://civic-sync-0zyi.onrender.com/api/ingest'; 

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        Alert.alert('Success!', jsonResponse.message || 'Document ingested.');
        setSelectedFileName(null);
      } else {
        const errorText = await response.text();
        console.error("Backend Error Details:", errorText);
        throw new Error(`Upload failed with status: ${response.status}`);
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Upload Error', error.message || 'Something went wrong while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 justify-center">
        
        <View className="mb-10">
          <Text className="text-2xl font-bold text-textDark mb-3">Data Control Center</Text>
          <Text className="text-base text-textLight leading-6">
            Upload official government PDFs to instantly expand the CivicSync AI knowledge base.
          </Text>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm items-center border border-gray-100">
          {selectedFileName && (
            <Text className="mb-4 text-sm text-primaryBlue font-semibold">Preparing: {selectedFileName}</Text>
          )}

          <TouchableOpacity 
            className={`w-full py-4 rounded-xl items-center ${isUploading ? 'bg-blue-300' : 'bg-primaryBlue'}`}
            onPress={handlePickAndUpload}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            {isUploading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#FFF" size="small" />
                <Text className="text-white text-base font-bold"> Processing AI Vectors...</Text>
              </View>
            ) : (
              <Text className="text-white text-base font-bold">Select & Upload Legal PDF</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}