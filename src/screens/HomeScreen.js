import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import WelcomeHeader from '../components/WelcomeHeader';
import { supabase } from '../services/supabaseClient';

export default function HomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [activeRoadmaps, setActiveRoadmaps] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [totalDocsCount, setTotalDocsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      fetchHomeData();
    }
  }, [isFocused]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      // 1. Fetch active roadmaps from Supabase
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('Roadmaps')
        .select('*, Roadmap_Steps(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (roadmapError) throw roadmapError;

      const processedRoadmaps = (roadmapData || []).map(roadmap => {
        const steps = roadmap.Roadmap_Steps || [];
        const completedCount = steps.filter(s => s.is_completed).length;
        return {
          id: roadmap.id,
          title: roadmap.title,
          progress: `${completedCount} of ${steps.length} steps completed`,
          urgent: completedCount < steps.length && completedCount > 0,
        };
      });
      setActiveRoadmaps(processedRoadmaps.slice(0, 3)); // Display up to 3 active roadmaps

      // 2. Fetch private files count and list from Supabase
      const { data: docData, error: docError } = await supabase
        .from('user_private_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (docError) throw docError;

      setTotalDocsCount(docData ? docData.length : 0);
      const formattedDocs = (docData || []).slice(0, 3).map(file => ({
        id: file.id,
        name: file.file_name,
        type: file.document_type || 'Document',
        date: new Date(file.uploaded_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }));
      setRecentDocuments(formattedDocs);

    } catch (error) {
      console.log('Error loading Home Dashboard:', error.message);
      Alert.alert('Error', 'Could not load your latest dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Top Header Block Component */}
      <WelcomeHeader activeRoadmapsCount={activeRoadmaps.length} securedDocsCount={totalDocsCount} />

      {/* Main Bottom Content Scroll Window */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}>
        
        {/* Active Roadmaps Section */}
        <View className="flex-row justify-between items-center mb-4 mt-3">
          <Text className="text-lg font-bold text-textDark">Ongoing Navigation</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Roadmaps')}>
            <Text className="text-sm text-primaryBlue font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-6 justify-center items-center">
            <ActivityIndicator size="small" color="#1E3A8A" />
          </View>
        ) : activeRoadmaps.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center border border-[#E2E8F0] shadow-sm mb-3">
            <Ionicons name="map-outline" size={32} color="#94A3B8" />
            <Text className="text-sm text-textLight mt-2 text-center">No ongoing navigation roadmaps.</Text>
            <TouchableOpacity 
              className="mt-3 px-4 py-2 bg-primaryBlue rounded-lg"
              onPress={() => navigation.navigate('CivicAI')}
            >
              <Text className="text-white text-xs font-bold">Ask CivicAI to generate one</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeRoadmaps.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-[#E2E8F0] shadow-sm"
              onPress={() => navigation.navigate('Roadmaps')}
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 rounded-xl bg-[#EFF6FF] justify-center items-center mr-4">
                <Ionicons name="git-network-outline" size={24} color="#1E3A8A" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-textDark">{item.title}</Text>
                <Text className="text-[13px] text-textLight mt-1">{item.progress}</Text>
              </View>
              {item.urgent && <View className="w-2.5 h-2.5 rounded-full bg-primaryBlue" />}
            </TouchableOpacity>
          ))
        )}

        {/* Recent Operations Section */}
        <View className="flex-row justify-between items-center mb-4 mt-3">
          <Text className="text-lg font-bold text-textDark">Recent Documents</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Vault')}>
            <Text className="text-sm text-primaryBlue font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-6 justify-center items-center">
            <ActivityIndicator size="small" color="#1E3A8A" />
          </View>
        ) : recentDocuments.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center border border-[#E2E8F0] shadow-sm mb-3">
            <Ionicons name="folder-open-outline" size={32} color="#94A3B8" />
            <Text className="text-sm text-textLight mt-2 text-center">No documents in your vault yet.</Text>
            <TouchableOpacity 
              className="mt-3 px-4 py-2 bg-[#10B981] rounded-lg"
              onPress={() => navigation.navigate('Vault')}
            >
              <Text className="text-white text-xs font-bold">Upload a document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentDocuments.map((doc) => (
            <TouchableOpacity 
              key={doc.id} 
              className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-[#E2E8F0] shadow-sm"
              onPress={() => navigation.navigate('Vault')}
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 rounded-xl bg-[#F0FDF4] justify-center items-center mr-4">
                <Ionicons name="document-text" size={24} color="#1E3A8A" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-textDark">{doc.name}</Text>
                <Text className="text-[13px] text-textLight mt-1">{doc.type} • {doc.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))
        )}
        
      </ScrollView>
    </View>
  );
}