import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    StatusBar
} from 'react-native';
import { supabase } from '../services/supabaseClient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);
    if (error) {
      Alert.alert("Error", "Invalid credentials");
    } else {
      console.log('Logged in successfully!');
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="flex-1 justify-center px-6">
        {/* Header Section */}
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-primaryBlue">CivicSync</Text>
          <Text className="text-base text-textLight mt-2 text-center">Your Autonomous Civic Navigator</Text>
        </View>

        {/* Input Form Fields */}
        <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <Text className="text-sm font-semibold text-textDark mb-2">Email Address</Text>
          <TextInput
            className="border border-[#E2E8F0] rounded-lg p-3 text-base text-textDark mb-5 bg-background"
            placeholder="Enter your email"
            placeholderTextColor="#757575"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text className="text-sm font-semibold text-textDark mb-2">Password</Text>
          <TextInput
            className="border border-[#E2E8F0] rounded-lg p-3 text-base text-textDark mb-5 bg-background"
            placeholder="Enter your password"
            placeholderTextColor="#757575"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Login Button */}
          <TouchableOpacity 
            className="bg-primaryBlue rounded-lg p-4 items-center mt-2.5"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold">Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="mt-5 items-center"
            onPress={() => navigation.navigate('Register')}
          >
            <Text className="text-[#757575] text-sm">
              Don't have an account? <Text className="text-primaryBlue font-bold">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}