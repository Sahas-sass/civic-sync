import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const initialDocuments = [
  {
    id: '1',
    title: 'BR_Form_1_AutoFilled.pdf',
    type: 'Official Form',
    date: 'Oct 24, 2026',
    size: '2.4 MB',
    isReady: true,
  },
  {
    id: '2',
    title: 'NIC_Application_Draft.pdf',
    type: 'Draft Form',
    date: 'Oct 22, 2026',
    size: '1.1 MB',
    isReady: false,
  },
  {
    id: '3',
    title: 'National_ID_Front_Scan.jpg',
    type: 'Identity Document',
    date: 'Oct 15, 2026',
    size: '4.8 MB',
    isReady: true,
  },
];

export default function VaultScreen({ navigation }) {
  const [documents, setDocuments] = useState(initialDocuments);

  const renderDocument = ({ item }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-[#E2E8F0]">
      <View className="w-[50px] h-[50px] rounded-xl bg-[#F8FAFC] justify-center items-center mr-4">
        <Ionicons 
          name={item.title.includes('.pdf') ? "document-text" : "image"} 
          size={28} 
          color="#0066cc" 
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

      {/* New Admin Navigation Button */}
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

      <FlatList
        data={documents}
        keyExtractor={item => item.id}
        renderItem={renderDocument}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}