import React, { useState, useEffect } from 'react';
import { 
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

  const formatPhone = (text) => {
    let cleaned = text.replace(/[^\d]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '94' + cleaned.substring(1);
    }
    if (cleaned.startsWith('94')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+94' + cleaned;
    }
    cleaned = cleaned.substring(0, 12);
    
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
    <View className="flex-1 bg-background">
      <View 
        className="bg-white pb-4 px-6 border-b border-[#E2E8F0] flex-row justify-between items-center"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30 }}
      >
        <Text className="text-xl font-bold text-primaryBlue">Secure Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text className="text-base text-primaryBlue font-semibold">{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {loading && !email ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Avatar Section Component */}
          <AvatarPicker 
            avatarUrl={avatarUrl} 
            name={name} 
            isEditing={isEditing}
            onUploadSuccess={(url) => setAvatarUrl(url)} 
          />

          {/* Data Form Section */}
          <View className="bg-white p-5 rounded-2xl border border-[#E2E8F0] mb-6 shadow-sm">
            <Text className="text-base font-bold text-textDark mb-1">Civic Auto-Fill Data</Text>
            <Text className="text-[13px] text-textLight mb-5 leading-[18px]">
              The AI agent uses this encrypted data to complete your official forms.
            </Text>

            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-textDark mb-2">Full Legal Name</Text>
              <TextInput
                className={`border border-[#E2E8F0] rounded-lg p-3 text-[15px] ${
                  isEditing ? 'text-textDark bg-white' : 'text-textLight bg-[#F8FAFC]'
                }`}
                value={name}
                onChangeText={setName}
                editable={isEditing}
              />
            </View>

            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-textDark mb-2">National Identity Card (NIC)</Text>
              <TextInput
                className={`border border-[#E2E8F0] rounded-lg p-3 text-[15px] ${
                  isEditing ? 'text-textDark bg-white' : 'text-textLight bg-[#F8FAFC]'
                }`}
                value={nic}
                onChangeText={(text) => setNic(text.toUpperCase())}
                editable={isEditing}
              />
            </View>

            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-textDark mb-2">Email Address</Text>
              <TextInput
                className="border border-[#E2E8F0] rounded-lg p-3 text-[15px] text-textLight bg-[#F8FAFC]"
                value={email}
                editable={false}
                keyboardType="email-address"
              />
            </View>

            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-textDark mb-2">Phone Number</Text>
              <TextInput
                className={`border border-[#E2E8F0] rounded-lg p-3 text-[15px] ${
                  isEditing ? 'text-textDark bg-white' : 'text-textLight bg-[#F8FAFC]'
                }`}
                value={phone}
                onChangeText={(text) => setPhone(formatPhone(text))}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>

            {isEditing && (
              <TouchableOpacity className="bg-primaryBlue rounded-lg p-3.5 items-center mt-2" onPress={handleSave} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-[15px] font-bold">Save Changes</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Password Change Form Component */}
            <PasswordChangeForm />
          </View>

          {/* Logout Section */}
          <TouchableOpacity className="flex-row items-center justify-center bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 mb-5" onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-2 text-base font-semibold text-red-500">Sign Out</Text>
          </TouchableOpacity>

          {/* Delete Account Button Component */}
          <DeleteAccountButton />
          
        </ScrollView>
      )}
    </View>
  );
}
