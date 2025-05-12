// src/screens/auth/LoginScreen.tsx
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

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      // No need to navigate - RootNavigator will handle this based on isAuthenticated state
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 bg-background p-4">
      <StatusBar style="dark" />
      <StyledView className="flex-1 justify-center">
        <StyledView className="items-center mb-10">
          <StyledText className="text-4xl font-bold text-primary">GameFund</StyledText>
          <StyledText className="text-lg text-text mt-2">Manage your sports contributions</StyledText>
        </StyledView>

        <StyledView className="bg-white p-6 rounded-xl shadow-sm mb-4">
          <StyledText className="text-xl font-bold mb-6 text-text">Login</StyledText>
          
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
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <StyledText className="text-right text-secondary mb-4">Forgot Password?</StyledText>
          </TouchableOpacity>
          
          <StyledTouchableOpacity
            className={`rounded-lg p-4 ${isLoading ? 'bg-gray-400' : 'bg-primary'} items-center`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <StyledText className="text-white font-bold">
              {isLoading ? 'Logging in...' : 'Login'}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
        
        <StyledView className="flex-row justify-center mt-4">
          <StyledText className="text-text">Don't have an account? </StyledText>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <StyledText className="text-primary font-bold">Register</StyledText>
          </TouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default LoginScreen;