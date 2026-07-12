import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
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
    <View style={styles.passwordChangeSection}>
      <TouchableOpacity 
        style={styles.toggleRow} 
        onPress={() => setShowPasswordChange(!showPasswordChange)}
      >
        <Text style={styles.sectionHeaderTitle}>Security & Password</Text>
        <Ionicons 
          name={showPasswordChange ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.textLight} 
        />
      </TouchableOpacity>

      {showPasswordChange && (
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor={colors.textLight}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={colors.textLight}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleChangePassword}
            disabled={updatingPassword}
          >
            {updatingPassword ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.saveButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  passwordChangeSection: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 24,
    paddingTop: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
  },
  formContainer: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: colors.secondaryBlue,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
