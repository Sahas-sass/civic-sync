import React, { useState, useEffect } from 'react';
import { 
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
    <View key={step.id} className="flex-row mb-1">
      <View className="items-center mr-4 w-6">
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={() => toggleStep(step.id, step.is_completed, roadmapId)}
        >
          <View 
            className={`w-6 h-6 rounded-full border justify-center items-center z-10 ${
              step.is_completed ? 'bg-primaryBlue border-primaryBlue' : 'bg-[#F1F5F9] border-[#CBD5E1]'
            }`}
          >
            {step.is_completed ? (
              <Ionicons name="checkmark" size={12} color="#ffffff" />
            ) : (
              <Text className="text-xs font-semibold text-textLight">{index + 1}</Text>
            )}
          </View>
        </TouchableOpacity>
        {/* Only show the connecting line if it's not the final step */}
        {!isLast && (
          <View 
            className={`w-[2px] flex-1 -mt-1 -mb-1 z-0 ${
              step.is_completed ? 'bg-primaryBlue' : 'bg-[#E2E8F0]'
            }`} 
          />
        )}
      </View>
      <View className="flex-1 pb-5">
        <Text 
          className={`text-[15px] font-semibold ${
            step.is_completed ? 'line-through text-textLight' : 'text-textDark'
          }`}
        >
          {step.title}
        </Text>
        <Text className="text-[13px] text-textLight mt-1 leading-[18px]">
          {step.detail}
        </Text>
      </View>
    </View>
  );

  const renderRoadmap = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const steps = item.Roadmap_Steps || [];
    
    return (
      <View className="bg-white rounded-2xl mb-4 border border-[#E2E8F0] overflow-hidden shadow-sm">
        <TouchableOpacity 
          className="flex-row p-5 items-center justify-between" 
          activeOpacity={0.7} 
          onPress={() => toggleExpand(item.id)}
        >
          <View className="flex-1 pr-4">
            <Text className="text-[16px] font-bold text-textDark">{item.title}</Text>
            <Text className="text-[13px] text-textLight mt-1 mb-3">{item.description}</Text>
            
            {/* Progress Bar */}
            <View className="flex-row items-center">
              <View className="flex-1 h-[6px] bg-[#E2E8F0] rounded-[3px] mr-3 overflow-hidden">
                <View 
                  className="h-full bg-primaryBlue rounded-[3px]" 
                  style={{ width: `${item.progress * 100}%` }}
                />
              </View>
              <Text className="text-xs font-semibold text-primaryBlue w-[35px]">
                {Math.round(item.progress * 100)}%
              </Text>
            </View>
          </View>
          
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#757575" 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View className="px-5 pb-5">
            <View className="h-[1px] bg-[#E2E8F0] mb-5" />
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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View 
          className="bg-white pb-4 px-6 border-b border-[#E2E8F0]"
          style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30 }}
        >
          <Text className="text-xl font-bold text-primaryBlue">Active Roadmaps</Text>
          <Text className="text-sm text-textLight mt-1">Your personalized civic checklists</Text>
        </View>
        <View className="flex-1 justify-center items-center px-10 pb-20">
          <Ionicons name="clipboard-outline" size={80} color="#CBD5E1" />
          <Text className="text-lg font-bold text-textDark mt-5 mb-2">No Roadmaps Yet</Text>
          <Text className="text-sm text-textLight text-center leading-5">
            Chat with CivicSync to generate your first roadmap.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View 
        className="bg-white pb-4 px-6 border-b border-[#E2E8F0]"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30 }}
      >
        <Text className="text-xl font-bold text-primaryBlue">Active Roadmaps</Text>
        <Text className="text-sm text-textLight mt-1">Your personalized civic checklists</Text>
      </View>
      
      <FlatList
        data={sortedRoadmaps}
        keyExtractor={item => item.id}
        renderItem={renderRoadmap}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}