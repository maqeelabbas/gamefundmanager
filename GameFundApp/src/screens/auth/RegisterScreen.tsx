// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { 
  StyledView, 
  StyledText, 
  StyledTextInput,
  StyledTouchableOpacity 
} from '../../utils/StyledComponents';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      // No need to navigate - RootNavigator will handle this based on isAuthenticated state
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Registration Failed', 'An error occurred during registration');
      setIsLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 bg-background p-4">
      <StatusBar style="dark" />
      <StyledView className="flex-1 justify-center">
        <StyledView className="items-center mb-8">
          <StyledText className="text-4xl font-bold text-primary">GameFund</StyledText>
          <StyledText className="text-lg text-text mt-2">Create an account</StyledText>
        </StyledView>

        <StyledView className="bg-white p-6 rounded-xl shadow-sm mb-4">
          <StyledText className="text-xl font-bold mb-6 text-text">Register</StyledText>
          
          <StyledText className="text-sm font-medium text-text mb-2">Full Name</StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />
          
          <StyledText className="text-sm font-medium text-text mb-2">Email</StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <StyledText className="text-sm font-medium text-text mb-2">Password</StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Create a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <StyledText className="text-sm font-medium text-text mb-2">Confirm Password</StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Confirm your password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          
          <StyledTouchableOpacity
            className={`rounded-lg p-4 ${isLoading ? 'bg-gray-400' : 'bg-primary'} items-center mt-2`}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <StyledText className="text-white font-bold">
              {isLoading ? 'Creating Account...' : 'Register'}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
        
        <StyledView className="flex-row justify-center mt-4">
          <StyledText className="text-text">Already have an account? </StyledText>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <StyledText className="text-primary font-bold">Login</StyledText>
          </TouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default RegisterScreen;