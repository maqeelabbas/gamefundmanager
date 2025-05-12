// src/screens/main/ProfileScreen.tsx
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyledView, StyledText, StyledTouchableOpacity, StyledScrollView, StyledTextInput } from '../../utils/StyledComponents';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services';
import { useApi } from '../../hooks';

const ProfileScreen = () => {
  const { user, logout, updateUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Use API hook for profile update
  const { 
    loading: updateLoading,
    error: updateError, 
    execute: updateProfile
  } = useApi<any, any>((userData) => userService.updateUser(user?.id || '', userData), false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
      });
    }
    setIsEditing(!isEditing);
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveProfile = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User ID is missing");
      return;
    }
    
    try {
      const updatedUser = await updateProfile(formData);
      if (updatedUser) {
        updateUserInfo({
          ...user,
          name: formData.name,
          email: formData.email
        });
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="dark" />
      
      {/* Profile Header */}
      <StyledView className="bg-primary p-6 pt-12">
        <StyledText className="text-white text-xl font-bold">Profile</StyledText>
        <StyledText className="text-white text-sm opacity-80 mt-1">Manage your account</StyledText>
      </StyledView>
      
      <StyledScrollView className="flex-1 px-4 pt-4">
        {/* User Info Card */}
        <StyledView className="bg-white rounded-lg p-5 shadow-sm mb-6">
          <StyledView className="items-center mb-4">
            <StyledView className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-3">
              <Ionicons name="person" size={40} color="#666" />
            </StyledView>
            {isEditing ? (
              <>
                <StyledView className="w-full mb-4">
                  <StyledText className="text-gray-600 mb-1">Name</StyledText>
                  <StyledTextInput 
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={formData.name}
                    onChangeText={(text) => handleChange('name', text)}
                  />
                </StyledView>
                <StyledView className="w-full mb-4">
                  <StyledText className="text-gray-600 mb-1">Email (readonly)</StyledText>
                  <StyledTextInput 
                    className="border border-gray-300 rounded-md p-2 w-full bg-gray-100"
                    value={formData.email}
                    editable={false}
                  />
                </StyledView>
              </>
            ) : (
              <>
                <StyledText className="text-xl font-bold">{user?.name || 'User'}</StyledText>
                <StyledText className="text-gray-500">{user?.email || 'email@example.com'}</StyledText>
                <StyledView className="bg-primary-100 px-3 py-1 rounded-full mt-2">
                  <StyledText className="text-primary-700 text-xs">{user?.role?.toUpperCase() || 'PLAYER'}</StyledText>
                </StyledView>
              </>
            )}
          </StyledView>
          
          {/* Edit/Save Profile Button */}
          <StyledTouchableOpacity 
            className={`mt-2 p-3 rounded-md ${isEditing ? 'bg-green-600' : 'bg-blue-500'}`}
            onPress={isEditing ? handleSaveProfile : handleEditToggle}
            disabled={updateLoading}
          >
            {updateLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <StyledText className="text-white text-center font-bold">
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </StyledText>
            )}
          </StyledTouchableOpacity>
          
          {isEditing && (
            <StyledTouchableOpacity 
              className="mt-2 p-3 rounded-md bg-gray-400"
              onPress={handleEditToggle}
            >
              <StyledText className="text-white text-center font-bold">Cancel</StyledText>
            </StyledTouchableOpacity>
          )}
          
          {updateError && (
            <StyledText className="text-red-500 text-center mt-2">
              {updateError.toString()}
            </StyledText>
          )}
        </StyledView>
        
        {/* Settings Section */}
        <StyledView className="bg-white rounded-lg shadow-sm mb-6">
          <StyledTouchableOpacity 
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={handleEditToggle}
          >
            <Ionicons name="person-outline" size={22} color="#0284c7" />
            <StyledText className="ml-3 text-gray-800">Edit Profile</StyledText>
            <Ionicons name="chevron-forward" size={18} color="#999" style={{marginLeft: 'auto'}} />
          </StyledTouchableOpacity>
          
          <StyledTouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="notifications-outline" size={22} color="#0284c7" />
            <StyledText className="ml-3 text-gray-800">Notifications</StyledText>
            <Ionicons name="chevron-forward" size={18} color="#999" style={{marginLeft: 'auto'}} />
          </StyledTouchableOpacity>
          
          <StyledTouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="lock-closed-outline" size={22} color="#0284c7" />
            <StyledText className="ml-3 text-gray-800">Change Password</StyledText>
            <Ionicons name="chevron-forward" size={18} color="#999" style={{marginLeft: 'auto'}} />
          </StyledTouchableOpacity>
          
          <StyledTouchableOpacity className="flex-row items-center p-4">
            <Ionicons name="settings-outline" size={22} color="#0284c7" />
            <StyledText className="ml-3 text-gray-800">App Settings</StyledText>
            <Ionicons name="chevron-forward" size={18} color="#999" style={{marginLeft: 'auto'}} />
          </StyledTouchableOpacity>
        </StyledView>
        
        {/* Logout Button */}
        <StyledTouchableOpacity 
          className="bg-red-500 rounded-lg py-4 items-center mb-10"
          onPress={handleLogout}
        >
          <StyledText className="text-white font-semibold">Logout</StyledText>
        </StyledTouchableOpacity>
        
        <StyledView className="items-center mb-6">
          <StyledText className="text-gray-400 text-xs">GameFund Manager v1.0.0</StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default ProfileScreen;
