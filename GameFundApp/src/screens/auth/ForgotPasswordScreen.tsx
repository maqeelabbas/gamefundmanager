// src/screens/auth/ForgotPasswordScreen.tsx
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

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // We'll implement this with our auth service later
      setTimeout(() => {
        console.log('Sending reset password to:', email);
        setIsLoading(false);
        setResetSent(true);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email');
      setIsLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 bg-background p-4">
      <StatusBar style="dark" />
      <StyledView className="flex-1 justify-center">
        <StyledView className="items-center mb-8">
          <StyledText className="text-4xl font-bold text-primary">GameFund</StyledText>
          <StyledText className="text-lg text-text mt-2">Reset Your Password</StyledText>
        </StyledView>

        <StyledView className="bg-white p-6 rounded-xl shadow-sm mb-4">
          <StyledText className="text-xl font-bold mb-4 text-text">Forgot Password</StyledText>
          
          {resetSent ? (
            <StyledView className="items-center py-4">
              <StyledText className="text-green-600 text-center mb-4">
                Password reset instructions have been sent to your email address.
              </StyledText>
              <StyledText className="text-text text-center mb-4">
                Please check your inbox and follow the instructions to reset your password.
              </StyledText>
            </StyledView>
          ) : (
            <>
              <StyledText className="text-text mb-4">
                Enter the email address associated with your account, and we'll send you instructions to reset your password.
              </StyledText>
              
              <StyledText className="text-sm font-medium text-text mb-2">Email</StyledText>
              <StyledTextInput
                className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              
              <StyledTouchableOpacity
                className={`rounded-lg p-4 ${isLoading ? 'bg-gray-400' : 'bg-primary'} items-center mt-2`}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <StyledText className="text-white font-bold">
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </StyledText>
              </StyledTouchableOpacity>
            </>
          )}
        </StyledView>
        
        <StyledView className="flex-row justify-center mt-4">
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <StyledText className="text-primary font-bold">Back to Login</StyledText>
          </TouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default ForgotPasswordScreen;