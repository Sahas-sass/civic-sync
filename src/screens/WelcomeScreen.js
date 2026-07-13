import React from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  Image 
} from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-primaryBlue">
      <View className="flex-1 justify-between items-center py-[60px] px-6">
        
        {/* Logo and Branding Center */}
        <View className="flex-1 justify-center items-center">
          <Image 
            source={require('../../assets/images/splash-icon.png')} 
            className="w-[120px] h-[120px] mb-6"
            resizeMode="contain"
          />

          <Text className="text-4xl font-bold text-white mb-2">CivicSync</Text>
          <Text className="text-base text-white/80 text-center">Your AI Legal & Civic Navigator</Text>
        </View>

        {/* Action Button at the Bottom */}
        <TouchableOpacity 
          className="bg-white w-full py-[18px] rounded-xl items-center shadow"
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text className="text-primaryBlue text-lg font-bold">Continue</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}