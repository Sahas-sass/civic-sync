import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import AgentScreen from '../screens/AgentScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RoadmapsScreen from '../screens/RoadmapsScreen';
import VaultScreen from '../screens/VaultScreen';
import { colors } from '../theme/colors';


// Placeholder components

const Tab = createBottomTabNavigator();

// Custom Floating Button Component with Glassmorphism
const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.customButtonContainer}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <BlurView intensity={80} tint="light" style={styles.customButtonBlur}>
      {children}
    </BlurView>
  </TouchableOpacity>
);

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: colors.primaryBlue,
          fontWeight: 'bold',
        },
        tabBarShowLabel: false, // Hide labels for a cleaner, minimal look
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: colors.surface,
          borderRadius: 20,
          height: 70,
          shadowColor: colors.primaryBlue,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? colors.primaryBlue : colors.textLight} />
          ),
        }}
      />
      <Tab.Screen 
        name="Roadmaps" 
        component={RoadmapsScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} size={24} color={focused ? colors.primaryBlue : colors.textLight} />
          ),
        }}
      />
      
      {/* Center AI Agent Button */}
      <Tab.Screen 
        name="CivicAI" 
        component={AgentScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name="sparkles" size={28} color={colors.primaryBlue} />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          ),
        }}
      />

      <Tab.Screen 
        name="Vault" 
        component={VaultScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'lock-closed' : 'lock-closed-outline'} size={24} color={focused ? colors.primaryBlue : colors.textLight} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={focused ? colors.primaryBlue : colors.textLight} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  customButtonContainer: {
    top: -20, // Elevate it above the tab bar
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  customButtonBlur: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Base tint for the blur
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
});