import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../theme/colors';

const initialDocuments = [
  {
    id: '1',
    title: 'BR_Form_1_AutoFilled.pdf',
    type: 'Official Form',
    date: 'Oct 24, 2026',
    size: '2.4 MB',
    isReady: true, // Agent has finished filling it
  },
  {
    id: '2',
    title: 'NIC_Application_Draft.pdf',
    type: 'Draft Form',
    date: 'Oct 22, 2026',
    size: '1.1 MB',
    isReady: false, // Agent needs more info
  },
  {
    id: '3',
    title: 'National_ID_Front_Scan.jpg',
    type: 'Identity Document',
    date: 'Oct 15, 2026',
    size: '4.8 MB',
    isReady: true,
  },
];

const ingestEndpoint = process.env.EXPO_PUBLIC_INGEST_URL || 'http://localhost:8000/api/ingest';

const formatFileSize = (size) => {
  if (!size && size !== 0) return 'Unknown size';

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function VaultScreen() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('Select a PDF to upload it to the ingestion pipeline.');

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const pickedFile = result.assets[0];
      const fileName = pickedFile.name || 'document.pdf';

      setUploading(true);
      setSelectedFileName(fileName);
      setUploadStatus(`Uploading ${fileName}...`);

      const formData = new FormData();
      formData.append('file', {
        uri: pickedFile.uri,
        name: fileName,
        type: pickedFile.mimeType || 'application/pdf',
      });
      formData.append('title', fileName);

      const response = await fetch(ingestEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload process failed.');
      }

      const uploadedDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      setDocuments((currentDocuments) => [
        {
          id: `${Date.now()}`,
          title: fileName,
          type: 'Uploaded PDF',
          date: uploadedDate,
          size: formatFileSize(pickedFile.size),
          isReady: false,
        },
        ...currentDocuments,
      ]);

      setUploadStatus(`${fileName} uploaded successfully.`);
      Alert.alert('Success', 'Document successfully ingested into the AI Vector Store!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload error.';
      setUploadStatus('Upload failed.');
      Alert.alert('Ingestion Error', message);
    } finally {
      setUploading(false);
    }
  };

  const renderDocument = ({ item }) => (
    <View style={styles.docCard}>
      <View style={styles.iconWrapper}>
        <Ionicons 
          name={item.title.includes('.pdf') ? "document-text" : "image"} 
          size={28} 
          color={colors.primaryBlue} 
        />
      </View>
      
      <View style={styles.docInfo}>
        <Text style={styles.docTitle} numberOfLines={1} ellipsizeMode="middle">
          {item.title}
        </Text>
        <Text style={styles.docMeta}>
          {item.type} • {item.date} • {item.size}
        </Text>
        
        {/* Status Badge */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, item.isReady ? styles.dotReady : styles.dotPending]} />
          <Text style={item.isReady ? styles.statusTextReady : styles.statusTextPending}>
            {item.isReady ? 'Ready to Print/Submit' : 'Action Required'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="download-outline" size={22} color={colors.textDark} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Document Vault</Text>
        <Text style={styles.headerSubtitle}>Your encrypted civic files and ID scans</Text>
      </View>

      <View style={styles.uploadSection}>
        <View style={styles.uploadCard}>
          <View style={styles.uploadCopy}>
            <Text style={styles.uploadTitle}>Add a new document</Text>
            <Text style={styles.uploadDescription}>
              Pick a PDF and send it to the ingestion backend for indexing.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handlePickDocument}
            disabled={uploading}
            activeOpacity={0.85}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primaryBlue} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color={colors.primaryBlue} />
            )}
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading PDF...' : 'Select & Upload Legal PDF'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.uploadStatus} numberOfLines={2}>
            {uploadStatus}
          </Text>
          {selectedFileName ? (
            <Text style={styles.selectedFile} numberOfLines={1} ellipsizeMode="middle">
              Selected: {selectedFileName}
            </Text>
          ) : null}
        </View>
      </View>

      <FlatList
        data={documents}
        keyExtractor={item => item.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryBlue,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  uploadSection: {
    padding: 20,
    paddingBottom: 10,
  },
  uploadCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  uploadCopy: {
    marginBottom: 14,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textLight,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF', // Light blue tint
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
  },
  uploadButtonDisabled: {
    opacity: 0.75,
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  uploadStatus: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textLight,
  },
  selectedFile: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textDark,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Cushion space for the floating bottom tab bar
  },
  docCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotReady: {
    backgroundColor: '#10B981', // Emerald green
  },
  dotPending: {
    backgroundColor: '#F59E0B', // Amber
  },
  statusTextReady: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  statusTextPending: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});