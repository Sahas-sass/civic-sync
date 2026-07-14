import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';

export default function AgentStatus({ status }) {
  if (!status) return null;
  
  return (
    <View className="flex-row items-center justify-center py-2.5 bg-white border-t border-[#F0F0F0]">
      <ActivityIndicator size="small" color="#1E3A8A" />
      <Text className="ml-2 text-sm text-primaryBlue font-semibold">
        {status}
      </Text>
    </View>
  );
}
