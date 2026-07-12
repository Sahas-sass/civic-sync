import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const initialDocuments = [
  {
    id: '1',
    title: 'BR_Form_1_AutoFilled.pdf',
    type: 'Official Form',
    date: 'Oct 24, 2026',
    size: '2.4 MB',
    isReady: true,
  },
  {
    id: '2',
    title: 'NIC_Application_Draft.pdf',
    type: 'Draft Form',
    date: 'Oct 22, 2026',
    size: '1.1 MB',
    isReady: false,
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

export default function VaultScreen({ navigation }) {
  const [documents, setDocuments] = useState(initialDocuments);

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

      {/* New Admin Navigation Button */}
      <TouchableOpacity 
        style={styles.adminTriggerButton} 
        onPress={() => navigation.navigate('Admin')}
        activeOpacity={0.8}
      >
        <View style={styles.buttonFlexRow}>
          <Text style={styles.plusIcon}>➕</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.adminButtonText}>Add Knowledge Documents</Text>
            <Text style={styles.adminButtonSubtext}>Train the AI on new government rules</Text>
          </View>
        </View>
      </TouchableOpacity>

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
  
  /* --- Admin Button Styles --- */
  adminTriggerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryBlue, 
  },
  adminButtonSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  /* --------------------------- */

  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
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