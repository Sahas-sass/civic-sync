import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabaseClient';

interface AvatarPickerProps {
  avatarUrl: string | null;
  name: string;
  onUploadSuccess: (url: string) => void;
}

export default function AvatarPicker({ 
  avatarUrl, 
  name, 
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      const fileExt = fileUri.split('.').pop() || 'jpg';
      const fileName = ${user.id}-.;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: image/,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update database profile
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: name,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

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
    <View style={styles.avatarSection}>
      <TouchableOpacity onPress={pickImage} disabled={uploading}>
        <View style={styles.avatarCircle}>
          {uploading ? (
            <ActivityIndicator size="small" color={colors.primaryBlue} />
          ) : avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{name ? name.charAt(0) : 'U'}</Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={pickImage} disabled={uploading}>
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>
      <Text style={styles.userName}>{name || 'User'}</Text>
      <Text style={styles.userStatus}>Verified Citizen Account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primaryBlue,
  },
  changePhotoText: {
    color: colors.secondaryBlue,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: 8,
  },
  userStatus: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '500',
  },
});
