import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';

export default function PasswordChangeForm() {
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert('Success', 'Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <View className="border-t border-[#E2E8F0] mt-6 pt-4">
      <TouchableOpacity 
        className="flex-row justify-between items-center" 
        onPress={() => setShowPasswordChange(!showPasswordChange)}
      >
        <Text className="text-[15px] font-bold text-textDark">Security & Password</Text>
        <Ionicons 
          name={showPasswordChange ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#757575" 
        />
      </TouchableOpacity>

      {showPasswordChange && (
        <View className="mt-4">
          <Text className="text-[13px] font-semibold text-textDark mb-2">New Password</Text>
          <TextInput
            className="border border-[#E2E8F0] rounded-lg p-3 text-[15px] text-textDark bg-white mb-4"
            placeholder="Enter new password"
            placeholderTextColor="#757575"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text className="text-[13px] font-semibold text-textDark mb-2">Confirm New Password</Text>
          <TextInput
            className="border border-[#E2E8F0] rounded-lg p-3 text-[15px] text-textDark bg-white mb-4"
            placeholder="Confirm new password"
            placeholderTextColor="#757575"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity 
            className="bg-primaryBlue rounded-lg p-3.5 items-center mt-2" 
            onPress={handleChangePassword}
            disabled={updatingPassword}
          >
            {updatingPassword ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-[15px] font-bold">Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
