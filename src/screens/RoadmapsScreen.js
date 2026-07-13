import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabaseClient';

// Enable smooth accordion animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RoadmapsScreen() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Query Roadmaps with nested relational Roadmap_Steps
      const { data, error } = await supabase
        .from('Roadmaps')
        .select('*, Roadmap_Steps(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .order('step_order', { foreignTable: 'Roadmap_Steps', ascending: true });

      if (error) throw error;

      // Map rows and compute progress percentage dynamically: completed steps / total steps
      const processed = (data || []).map(roadmap => {
        const steps = roadmap.Roadmap_Steps || [];
        const completedCount = steps.filter(s => s.is_completed).length;
        const progress = steps.length > 0 ? completedCount / steps.length : 0;
        return { ...roadmap, progress };
      });

      setRoadmaps(processed);
    } catch (error) {
      console.log('Error fetching roadmaps:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleStep = async (stepId, currentStatus, roadmapId) => {
    // 1. Optimistic Update (instant UI response)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRoadmaps(prevRoadmaps => 
      prevRoadmaps.map(roadmap => {
        if (roadmap.id !== roadmapId) return roadmap;
        
        const updatedSteps = (roadmap.Roadmap_Steps || []).map(step => {
          if (step.id === stepId) {
            return { ...step, is_completed: !currentStatus };
          }
          return step;
        });

        const completedCount = updatedSteps.filter(s => s.is_completed).length;
        const totalCount = updatedSteps.length;
        const progress = totalCount > 0 ? completedCount / totalCount : 0;

        return { ...roadmap, Roadmap_Steps: updatedSteps, progress };
      })
    );

    // 2. Silent database update in background
    try {
      const { error } = await supabase
        .from('Roadmap_Steps')
        .update({ is_completed: !currentStatus })
        .eq('id', stepId);
      
      if (error) throw error;
    } catch (error) {
      console.log('Error updating step in database, reverting state:', error.message);
      Alert.alert('Update Failed', 'Could not sync checklist status with database. Reverting.');
      fetchRoadmaps(); // Revert back to database state
    }
  };

  const renderStep = (step, index, isLast, roadmapId) => (
    <View key={step.id} style={styles.stepContainer}>
      <View style={styles.stepIndicator}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={() => toggleStep(step.id, step.is_completed, roadmapId)}
        >
          <View style={[styles.stepCircle, step.is_completed && styles.stepCircleCompleted]}>
            {step.is_completed ? (
              <Ionicons name="checkmark" size={12} color={colors.surface} />
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
        </TouchableOpacity>
        {/* Only show the connecting line if it's not the final step */}
        {!isLast && <View style={[styles.stepLine, step.is_completed && styles.stepLineCompleted]} />}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, step.is_completed && styles.stepTitleCompleted]}>
          {step.title}
        </Text>
        <Text style={styles.stepDetail}>{step.detail}</Text>
      </View>
    </View>
  );

  const renderRoadmap = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const steps = item.Roadmap_Steps || [];
    
    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardHeader} 
          activeOpacity={0.7} 
          onPress={() => toggleExpand(item.id)}
        >
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            
            {/* Minimalist Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
            </View>
          </View>
          
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={colors.textLight} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            {steps.map((step, index) => renderStep(step, index, index === steps.length - 1, item.id))}
          </View>
        )}
      </View>
    );
  };

  // Sort completed roadmaps (100% progress) to the bottom of the list
  const sortedRoadmaps = [...roadmaps].sort((a, b) => {
    if (a.progress === 1 && b.progress < 1) return 1;
    if (a.progress < 1 && b.progress === 1) return -1;
    return b.created_at.localeCompare(a.created_at);
  });

  if (loading && roadmaps.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Active Roadmaps</Text>
          <Text style={styles.headerSubtitle}>Your personalized civic checklists</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Roadmaps Yet</Text>
          <Text style={styles.emptyText}>
            Chat with CivicSync to generate your first roadmap.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Roadmaps</Text>
        <Text style={styles.headerSubtitle}>Your personalized civic checklists</Text>
      </View>
      
      <FlatList
        data={sortedRoadmaps}
        keyExtractor={item => item.id}
        renderItem={renderRoadmap}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Cushion space for the floating bottom tab bar
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryBlue,
    width: 35,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircleCompleted: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  stepLineCompleted: {
    backgroundColor: colors.primaryBlue,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  stepTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  stepDetail: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});