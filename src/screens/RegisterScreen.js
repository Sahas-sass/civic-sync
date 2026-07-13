import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { supabase } from '../services/supabaseClient';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full Name is required.');
      return;
    }

    if (!nic.trim()) {
      Alert.alert('Error', 'NIC number is required.');
      return;
    }

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(nic.trim())) {
      Alert.alert('Error', 'Invalid NIC format. Must be either 9 digits followed by V/X, or 12 digits.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Password is required.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          nic_number: nic,
        }
      }
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Registration successful! Please check your email to verify your account.');
      navigation.navigate('Login');
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
        className="px-6 py-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-primaryBlue">Create Account</Text>
          <Text className="text-[15px] text-[#757575] mt-2 text-center">Join CivicSync to automate your legal processes</Text>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <Text className="text-sm font-semibold text-textDark mb-2">Full Name</Text>
          <TextInput
            className="border border-[#E2E8F0] rounded-lg p-3 text-base text-textDark mb-5 bg-background"
            placeholder="John Doe"
            placeholderTextColor="#757575"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text className="text-sm font-semibold text-textDark mb-2">National Identity Card (NIC)</Text>
          <TextInput
            className="border border-[#E2E8F0] rounded-lg p-3 text-base text-textDark mb-5 bg-background"
            placeholder="e.g. 199912345678"
            placeholderTextColor="#757575"
            value={nic}
            onChangeText={setNic}
          />

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
            placeholder="Create a strong password"
            placeholderTextColor="#757575"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity 
            className="bg-primaryBlue rounded-lg p-4 items-center mt-2.5"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold">Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="mt-5 items-center"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-[#757575] text-sm">
              Already have an account? <Text className="text-[#0066cc] font-bold">Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}