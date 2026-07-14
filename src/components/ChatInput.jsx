import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, View, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatInput({ 
  value, 
  onChangeText, 
  onSend
}) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = () => {
    if (value.trim() === '') return;
    onSend();
  };

  return (
    <View 
      className="flex-row items-center px-4 py-2.5 bg-white border-t border-[#F0F0F0]"
      style={!keyboardVisible ? { marginBottom: Platform.OS === 'ios' ? 95 : 85 } : { marginBottom: 0 }}
    >
      <TextInput
        className="flex-1 bg-[#F5F5F5] rounded-[24px] px-[18px] py-[10px] text-[15px] text-textDark max-h-[100px]"
        placeholder="Ask a legal or civic question..."
        placeholderTextColor="#757575"
        value={value}
        onChangeText={onChangeText}
        multiline
      />
      <TouchableOpacity 
        className={`w-10 h-10 rounded-full justify-center items-center ml-2.5 ${
          value.trim() ? 'bg-primaryBlue' : 'bg-[#EAEAEA]'
        }`}
        onPress={handleSend}
        disabled={!value.trim()}
      >
        <Ionicons 
          name="send" 
          size={18} 
          color={value.trim() ? '#ffffff' : '#757575'} 
        />
      </TouchableOpacity>
    </View>
  );
}
