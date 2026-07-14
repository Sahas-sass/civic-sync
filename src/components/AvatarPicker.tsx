import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabaseClient';

interface AvatarPickerProps {
  avatarUrl: string | null;
  name: string;
  isEditing: boolean;
  onUploadSuccess: (url: string) => void;
}

export default function AvatarPicker({ 
  avatarUrl, 
  name, 
  isEditing,
  onUploadSuccess 
}: AvatarPickerProps) {
  const [uploading, setUploading] = useState<boolean>(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your camera roll to set a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (fileUri: string) => {
    try {
      setUploading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      const fileExt = fileUri.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Use FormData to correctly wrap and upload local binaries in React Native
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, formData, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update database profile's avatar_url only
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      onUploadSuccess(publicUrl);
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="items-center mb-8">
      <TouchableOpacity onPress={pickImage} disabled={!isEditing || uploading}>
        <View className="w-20 h-20 rounded-full bg-[#EFF6FF] justify-center items-center mb-3 border-2 border-primaryBlue overflow-hidden">
          {uploading ? (
            <ActivityIndicator size="small" color="#1E3A8A" />
          ) : avatarUrl ? (
            <Image key={avatarUrl} source={{ uri: avatarUrl }} className="w-20 h-20 rounded-full" />
          ) : (
            <Text className="text-3xl font-bold text-primaryBlue">{name ? name.charAt(0) : 'U'}</Text>
          )}
        </View>
      </TouchableOpacity>
      {isEditing && (
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          <Text className="text-primaryBlue text-[13px] font-semibold mt-1">Change Photo</Text>
        </TouchableOpacity>
      )}
      <Text className="text-xl font-bold text-textDark mt-2">{name || 'User'}</Text>
      <Text className="text-sm text-[#10B981] mt-1 font-medium">Verified Citizen Account</Text>
    </View>
  );
}
