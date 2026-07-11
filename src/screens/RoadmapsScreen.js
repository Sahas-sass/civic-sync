import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Enable smooth accordion animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RoadmapsScreen() {
  const [expandedId, setExpandedId] = useState(null);

  // Mock data representing the AI-generated execution plans
  const roadmaps = [
    {
      id: '1',
      title: 'Small Business Registration (BR)',
      description: 'Official process for sole proprietorship registration.',
      progress: 0.66,
      steps: [
        { id: 's1', title: 'Name Approval', completed: true, detail: 'Submit 3 proposed names to the Divisional Secretariat.' },
        { id: 's2', title: 'Form Submission', completed: true, detail: 'Fill and submit Form 1 with GS certification.' },
        { id: 's3', title: 'Payment & Collection', completed: false, detail: 'Pay the registration fee and collect the BR certificate.' },
      ]
    },
    {
      id: '2',
      title: 'National Identity Card Replacement',
      description: 'Process for a lost or damaged identification card.',
      progress: 0.25,
      steps: [
        { id: 'n1', title: 'Police Complaint', completed: true, detail: 'Obtain a certified copy of the police report.' },
        { id: 'n2', title: 'Grama Niladhari Certificate', completed: false, detail: 'Get the application certified by the local GS.' },
        { id: 'n3', title: 'Photo Studio', completed: false, detail: 'Obtain ICAO standard photographs with receipt.' },
        { id: 'n4', title: 'Submission at DRP', completed: false, detail: 'Submit all documents to the Department of Registration of Persons.' },
      ]
    }
  ];

  const toggleExpand = (id) => {
    // Triggers a smooth ease-in/ease-out animation when the state changes
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderStep = (step, index, isLast) => (
    <View key={step.id} style={styles.stepContainer}>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepCircle, step.completed && styles.stepCircleCompleted]}>
          {step.completed ? (
            <Ionicons name="checkmark" size={12} color={colors.surface} />
          ) : (
            <Text style={styles.stepNumber}>{index + 1}</Text>
          )}
        </View>
        {/* Only show the connecting line if it's not the final step */}
        {!isLast && <View style={[styles.stepLine, step.completed && styles.stepLineCompleted]} />}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, step.completed && styles.stepTitleCompleted]}>
          {step.title}
        </Text>
        <Text style={styles.stepDetail}>{step.detail}</Text>
      </View>
    </View>
  );

  const renderRoadmap = ({ item }) => {
    const isExpanded = expandedId === item.id;
    
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
            {item.steps.map((step, index) => renderStep(step, index, index === item.steps.length - 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Roadmaps</Text>
        <Text style={styles.headerSubtitle}>Your personalized civic checklists</Text>
      </View>
      
      <FlatList
        data={roadmaps}
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
    marginBottom: 4, // Tightened margin as the line creates vertical rhythm
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
    paddingBottom: 20, // Spacing before the next step
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
});