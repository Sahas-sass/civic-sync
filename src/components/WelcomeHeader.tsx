import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabaseClient';

interface WelcomeHeaderProps {
  activeRoadmapsCount?: number;
  securedDocsCount?: number;
}

export default function WelcomeHeader({ 
  activeRoadmapsCount = 2, 
  securedDocsCount = 5 
}: WelcomeHeaderProps) {
  const [userName, setUserName] = useState<string>('User');

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
      } catch (error: any) {
        console.log('Error loading user name on welcome header:', error.message);
      }
    }
    loadUserName();
  }, []);

  return (
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
          <Text style={styles.summaryNumber}>{activeRoadmapsCount}</Text>
          <Text style={styles.summaryLabel}>Active Roadmaps</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{securedDocsCount}</Text>
          <Text style={styles.summaryLabel}>Secured Docs</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
