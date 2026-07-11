import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  Image
} from 'react-native';
import { colors } from '../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Branding Center */}
        <View style={styles.logoContainer}>
          {/* If you have a local image, you can use an <Image source={require('../../assets/images/splash-icon.png')} /> here */}
          <View style={styles.placeholderLogo}>
            <Text style={styles.logoText}>CS</Text>
          </View>
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
    backgroundColor: colors.primaryBlue, // Matches your native splash screen background
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
  placeholderLogo: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primaryBlue,
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