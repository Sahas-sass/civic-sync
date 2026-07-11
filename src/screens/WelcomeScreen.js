import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  Image  // <-- 1. Added Image to imports
} from 'react-native';
import { colors } from '../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Logo and Branding Center */}
        <View style={styles.logoContainer}>
          
          {/* 2. Swapped the Text placeholder for the Image component */}
          <Image 
            source={require('../../assets/images/splash-icon.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={styles.appName}>CivicSync</Text>
          <Text style={styles.tagline}>Your AI Legal & Civic Navigator</Text>
        </View>

        {/* Action Button at the Bottom */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlue, 
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 3. Replaced placeholder styles with image dimensions
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.surface,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: colors.primaryBlue,
    fontSize: 18,
    fontWeight: 'bold',
  },
});