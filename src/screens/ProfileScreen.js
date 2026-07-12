import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabaseClient';
import AvatarPicker from '../components/AvatarPicker';
import PasswordChangeForm from '../components/PasswordChangeForm';
import DeleteAccountButton from '../components/DeleteAccountButton';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }
      setEmail(user.email || '');

      const { data, error, status } = await supabase
        .from('profiles')
        .select('full_name, nic_number, phone, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setName(data.full_name || user.user_metadata?.full_name || '');
        setNic(data.nic_number || user.user_metadata?.nic_number || '');
        setPhone(data.phone || user.user_metadata?.phone || '');
        setAvatarUrl(data.avatar_url || null);
      } else {
        setName(user.user_metadata?.full_name || '');
        setNic(user.user_metadata?.nic_number || '');
        setPhone(user.user_metadata?.phone || '');
      }
    } catch (error) {
      Alert.alert('Error fetching profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error signing out', error.message);
    }
  };

  // Automatically formats phone numbers to Sri Lankan style: +94 XX XXX XXXX
  const formatPhone = (text) => {
    let cleaned = text.replace(/[^\d]/g, ''); // digits only
    if (cleaned.startsWith('0')) {
      cleaned = '94' + cleaned.substring(1);
    }
    if (cleaned.startsWith('94')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+94' + cleaned;
    }
    cleaned = cleaned.substring(0, 12); // Max length "+94771234567" is 12 chars
    
    // Add spaces for layout: +94 XX XXX XXXX
    if (cleaned.length > 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.length > 5) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length > 3) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Full Name is required.');
      return;
    }

    if (!nic.trim()) {
      Alert.alert('Error', 'NIC number is required.');
      return;
    }

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(nic.trim())) {
      Alert.alert('Error', 'Invalid NIC format. Must be either 9 digits followed by V/X, or 12 digits.');
      return;
    }

    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: name,
          nic_number: nic,
          phone: phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your secure civic details have been saved.');
    } catch (error) {
      Alert.alert('Error updating profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Secure Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {loading && !email ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Avatar Section Component */}
          <AvatarPicker 
            avatarUrl={avatarUrl} 
            name={name} 
            isEditing={isEditing}
            onUploadSuccess={(url) => setAvatarUrl(url)} 
          />

          {/* Data Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Civic Auto-Fill Data</Text>
            <Text style={styles.sectionSubtitle}>
              The AI agent uses this encrypted data to complete your official forms.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Legal Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={name}
                onChangeText={setName}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>National Identity Card (NIC)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={nic}
                onChangeText={(text) => setNic(text.toUpperCase())}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={email}
                editable={false}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={phone}
                onChangeText={(text) => setPhone(formatPhone(text))}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>

            {isEditing && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Password Change Form Component */}
            <PasswordChangeForm />
          </View>

          {/* Logout Section */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Delete Account Button Component */}
          <DeleteAccountButton />
          
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryBlue,
  },
  editButtonText: {
    fontSize: 16,
    color: colors.secondaryBlue,
    fontWeight: '600',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 100, // Bottom navigation padding
  },
  formSection: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 20,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
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
  },
  inputDisabled: {
    backgroundColor: '#F8FAFC',
    color: colors.textLight,
  },
  saveButton: {
    backgroundColor: colors.primaryBlue,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  logoutButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
