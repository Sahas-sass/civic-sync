import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ChatInput({ 
  value, 
  onChangeText, 
  onSend, 
  keyboardVisible 
}) {
  const handleSend = () => {
    if (value.trim() === '') return;
    onSend();
  };

  return (
    <View style={[
      styles.inputContainer,
      !keyboardVisible && { marginBottom: Platform.OS === 'ios' ? 95 : 85 }
    ]}>
      <TextInput
        style={styles.textInput}
        placeholder="Ask a legal or civic question..."
        placeholderTextColor={colors.textLight}
        value={value}
        onChangeText={onChangeText}
        multiline
      />
      <TouchableOpacity 
        style={[styles.sendButton, !value.trim() && styles.sendButtonDisabled]} 
        onPress={handleSend}
        disabled={!value.trim()}
      >
        <Ionicons 
          name="send" 
          size={18} 
          color={value.trim() ? colors.surface : colors.textLight} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: colors.textDark,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#EAEAEA',
  },
});
