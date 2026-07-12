import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Assuming you have your colors file, adjust the path if needed:
// import { colors } from '../theme/colors'; 

export default function AdminScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);

  const handlePickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets) {
        return; 
      }

      const file = result.assets[0];
      setSelectedFileName(file.name);
      setIsUploading(true);

      const formData = new FormData();

      // Ensure the title is always a string
      const safeTitle = file.name ? String(file.name) : 'document.pdf';
      formData.append('title', safeTitle);

      if (Platform.OS === 'web') {
        // WEB: Append the raw HTML5 File object directly
        // Make sure we are accessing the '.file' property that Expo injects on web
        if (file.file) {
           formData.append('file', file.file);
        } else {
           throw new Error("File object is missing from the picker result on web.");
        }
      } else {
        // MOBILE (iOS/Android): Use the URI formatting
        formData.append('file', {
          uri: file.uri,
          name: safeTitle,
          type: file.mimeType || 'application/pdf',
        });
      }

      const BACKEND_URL = 'http://127.0.0.1:8000/api/ingest'; 

      // Note: Do NOT manually set the 'Content-Type' header to 'multipart/form-data'. 
      // The browser/fetch API must do this automatically so it can calculate the boundary string!
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        // headers: {} <-- Leave headers completely empty!
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        Alert.alert('Success!', jsonResponse.message || 'Document ingested.');
        setSelectedFileName(null);
      } else {
        const errorText = await response.text();
        console.error("Backend Error Details:", errorText);
        throw new Error(`Upload failed with status: ${response.status}`);
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Upload Error', error.message || 'Something went wrong while uploading.');
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