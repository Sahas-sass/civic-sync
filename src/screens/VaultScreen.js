import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function VaultScreen() {
  // Mock data for the user's secured documents
  const documents = [
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
    }
  ];

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
        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons name="cloud-upload-outline" size={24} color={colors.primaryBlue} />
          <Text style={styles.uploadButtonText}>Upload New ID/Document</Text>
        </TouchableOpacity>
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
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryBlue,
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