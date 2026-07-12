import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';

export default function DeleteAccountButton() {
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This will wipe your profile, documents, and active roadmaps. This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setDeleting(true);
              const { error } = await supabase.rpc('delete_user_account');
              if (error) throw error;
              
              // Explicitly clear local session so client redirects to Auth screens
              await supabase.auth.signOut();
              
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
            } catch (error: any) {
              Alert.alert('Error deleting account', error.message);
            } finally {
              setDeleting(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.deleteButton} 
      onPress={handleDeleteAccount}
      disabled={deleting}
    >
      {deleting ? (
        <ActivityIndicator color="#EF4444" />
      ) : (
        <>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete My Account</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
