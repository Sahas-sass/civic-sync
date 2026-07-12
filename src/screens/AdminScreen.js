import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  SafeAreaView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
// Assuming you have your colors file, adjust the path if needed:
// import { colors } from '../theme/colors'; 

export default function AdminScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);

  const handlePickAndUpload = async () => {
    try {
      // 1. Open the phone's file browser (restricted to PDFs)
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      // If the user closes the picker without selecting anything
      if (result.canceled || !result.assets) {
        return; 
      }

      const file = result.assets[0];
      setSelectedFileName(file.name);
      setIsUploading(true);

      // 2. Prepare the file to be sent over the network
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });
      formData.append('title', file.name);

      // 3. Send it to your backend API
      // NOTE: Replace this URL with your actual backend URL once Member 4 builds the API Gateway!
      // If testing on a physical device, use your computer's local IP (e.g., http://192.168.1.5:8000/api/ingest)
      const BACKEND_URL = 'http://YOUR_LOCAL_IP:8000/api/ingest'; 

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        Alert.alert('Success!', 'The new legal document has been ingested by CivicSync AI.');
        setSelectedFileName(null);
      } else {
        throw new Error('Upload failed. Check the backend server.');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Upload Error', 'Something went wrong while uploading the document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Data Control Center</Text>
          <Text style={styles.subtitle}>
            Upload official government PDFs to instantly expand the CivicSync AI knowledge base.
          </Text>
        </View>

        <View style={styles.uploadCard}>
          {selectedFileName && (
            <Text style={styles.fileName}>Preparing: {selectedFileName}</Text>
          )}

          <TouchableOpacity 
            style={[styles.button, isUploading && styles.buttonDisabled]} 
            onPress={handlePickAndUpload}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            {isUploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.buttonText}> Processing AI Vectors...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Select & Upload Legal PDF</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA', // Light grey/blue background
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A2530',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    lineHeight: 24,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  fileName: {
    marginBottom: 16,
    fontSize: 14,
    color: '#0052CC',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0052CC',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0BCEB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});