import React from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WelcomeHeader from '../components/WelcomeHeader';

export default function HomeScreen() {
  const activeRoadmaps = [
    { id: '1', title: 'Small Business Registration', progress: '2 of 4 steps completed', urgent: true },
    { id: '2', title: 'Rental Agreement Verification', progress: '1 of 3 steps completed', urgent: false },
  ];

  const recentDocuments = [
    { id: 'a', name: 'BR_Form_1.pdf', type: 'Form', date: 'Today, 2:40 PM' },
    { id: 'b', name: 'National_ID_Scan.pdf', type: 'ID Document', date: 'Yesterday' },
  ];

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#0066cc" />
      
      {/* Top Header Block Component */}
      <WelcomeHeader activeRoadmapsCount={activeRoadmaps.length} securedDocsCount={5} />

      {/* Main Bottom Content Scroll Window */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}>
        
        {/* Active Roadmaps Section */}
        <View className="flex-row justify-between items-center mb-4 mt-3">
          <Text className="text-lg font-bold text-textDark">Ongoing Navigation</Text>
          <TouchableOpacity><Text className="text-sm text-primaryBlue font-semibold">See All</Text></TouchableOpacity>
        </View>

        {activeRoadmaps.map((item) => (
          <View key={item.id} className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-[#E2E8F0] shadow-sm">
            <View className="w-12 h-12 rounded-xl bg-[#EFF6FF] justify-center items-center mr-4">
              <Ionicons name="git-network-outline" size={24} color="#0066cc" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-textDark">{item.title}</Text>
              <Text className="text-[13px] text-textLight mt-1">{item.progress}</Text>
            </View>
            {item.urgent && <View className="w-2.5 h-2.5 rounded-full bg-primaryBlue" />}
          </View>
        ))}

        {/* Recent Operations Section */}
        <View className="flex-row justify-between items-center mb-4 mt-3">
          <Text className="text-lg font-bold text-textDark">Recent Documents</Text>
          <TouchableOpacity><Text className="text-sm text-primaryBlue font-semibold">See All</Text></TouchableOpacity>
        </View>

        {recentDocuments.map((doc) => (
          <View key={doc.id} className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-[#E2E8F0] shadow-sm">
            <View className="w-12 h-12 rounded-xl bg-[#F0FDF4] justify-center items-center mr-4">
              <Ionicons name="document-text" size={24} color="#0066cc" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-textDark">{doc.name}</Text>
              <Text className="text-[13px] text-textLight mt-1">{doc.type} • {doc.date}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={20} color="#757575" />
            </TouchableOpacity>
          </View>
        ))}
        
      </ScrollView>
    </View>
  );
}