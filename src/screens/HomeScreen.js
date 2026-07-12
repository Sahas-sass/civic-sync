import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabaseClient';

export default function HomeScreen() {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    async function loadUserName() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (data && data.full_name) {
            setUserName(data.full_name);
          } else if (user.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name);
          } else {
            const emailPrefix = user.email ? user.email.split('@')[0] : 'User';
            setUserName(emailPrefix);
          }
        }
      } catch (error) {
        console.log('Error loading user name on home:', error.message);
      }
    }
    loadUserName();
  }, []);

  // Hardcoded dashboard placeholder data for the prototype stage
  const activeRoadmaps = [
    { id: '1', title: 'Small Business Registration', progress: '2 of 4 steps completed', urgent: true },
    { id: '2', title: 'Rental Agreement Verification', progress: '1 of 3 steps completed', urgent: false },
  ];

  const recentDocuments = [
    { id: 'a', name: 'BR_Form_1.pdf', type: 'Form', date: 'Today, 2:40 PM' },
    { id: 'b', name: 'National_ID_Scan.pdf', type: 'ID Document', date: 'Yesterday' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlue} />
      
      {/* Top Authoritative Blue Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back,</Text>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.surface} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Quick Summary Grid Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>2</Text>
            <Text style={styles.summaryLabel}>Active Roadmaps</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>5</Text>
            <Text style={styles.summaryLabel}>Secured Docs</Text>
          </View>
        </View>
      </View>

      {/* Main Bottom Content Scroll Window */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContentContainer}>
        
        {/* Active Roadmaps Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ongoing Navigation</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
        </View>

        {activeRoadmaps.map((item) => (
          <View key={item.id} style={styles.roadmapCard}>
            <View style={styles.roadmapIconContainer}>
              <Ionicons name="git-network-outline" size={24} color={colors.primaryBlue} />
            </View>
            <View style={styles.roadmapInfo}>
              <Text style={styles.roadmapTitle}>{item.title}</Text>
              <Text style={styles.roadmapProgress}>{item.progress}</Text>
            </View>
            {item.urgent && <View style={styles.urgentDot} />}
          </View>
        ))}

        {/* Recent Operations Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
        </View>

        {recentDocuments.map((doc) => (
          <View key={doc.id} style={styles.docRow}>
            <View style={styles.docIconContainer}>
              <Ionicons name="document-text" size={24} color={colors.secondaryBlue} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{doc.name}</Text>
              <Text style={styles.docMeta}>{doc.type} • {doc.date}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        ))}
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBlock: {
    backgroundColor: colors.primaryBlue,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.surface,
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.surface,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100, // Cushion space to prevent overlap with the floating tab bar
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.secondaryBlue,
    fontWeight: '600',
  },
  roadmapCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadmapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roadmapInfo: {
    flex: 1,
  },
  roadmapTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  roadmapProgress: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },
  urgentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondaryBlue,
  },
  docRow: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  docMeta: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },
});