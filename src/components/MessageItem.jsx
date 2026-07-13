import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MessageItem({ item }) {
  const isUser = item.sender === 'user';
  
  return (
    <View className={`flex-row my-1.5 items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-primaryBlue justify-center items-center mr-2">
          <Ionicons name="sparkles" size={16} color="#ffffff" />
        </View>
      )}
      <View 
        className={`max-w-[75%] px-4 py-3 rounded-[20px] shadow-sm ${
          isUser 
            ? 'bg-primaryBlue rounded-br-[4px]' 
            : 'bg-white border border-[#E8E8E8] rounded-bl-[4px]'
        }`}
      >
        <Text className={`text-[15px] leading-5 ${isUser ? 'text-white' : 'text-textDark'}`}>
          {item.text}
        </Text>
      </View>
    </View>
  );
}
