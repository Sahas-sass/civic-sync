import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View 
      className="bg-primaryBlue rounded-b-[32px] px-6 pb-6"
      style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}
    >
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-xs text-white/70">Welcome Back,</Text>
          <Text className="text-[22px] font-bold text-white mt-0.5">{userName}</Text>
        </View>
        <TouchableOpacity className="w-11 h-11 rounded-full bg-white/15 justify-center items-center relative">
          <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          <View className="absolute top-[12px] right-[13px] w-2 h-2 rounded-full bg-red-500" />
        </TouchableOpacity>
      </View>

      {/* Quick Summary Grid Cards */}
      <View className="flex-row justify-between gap-4">
        <View className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/15">
          <Text className="text-2xl font-bold text-white">{activeRoadmapsCount}</Text>
          <Text className="text-xs text-white/80 mt-1">Active Roadmaps</Text>
        </View>
        <View className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/15">
          <Text className="text-2xl font-bold text-white">{securedDocsCount}</Text>
          <Text className="text-xs text-white/80 mt-1">Secured Docs</Text>
        </View>
      </View>
    </View>
  );
}
