// src/screens/main/ProfileScreen.tsx
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledScrollView,
  StyledTextInput,
} from "../../utils/StyledComponents";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services";
import { useApi } from "../../hooks";

const ProfileScreen = () => {
  const { user, logout, updateUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });
  // Form validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phoneNumber?: string;
  }>({});

  // Use API hook for profile update
  const {
    loading: updateLoading,
    error: updateError,
    execute: updateProfile,
  } = useApi<any, any>(
    (userData) => userService.updateUser(user?.id || "", userData),
    false
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
      });
      setErrors({}); // Clear errors on cancel
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field: string, value: string) => {
    // Clear error when user starts typing in that field
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate form input
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      phoneNumber?: string;
    } = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone number (optional but must be valid if provided)
    if (formData.phoneNumber.trim()) {
      // Simple validation - should be at least 10 digits
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/[^0-9+]/g, ""))) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User ID is missing");
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }

    try {
      console.log("Saving profile with data:", formData);

      // Call the API to update the user
      const updatedUser = await updateProfile(formData);

      if (updatedUser) {
        // Update local state in the AuthContext
        updateUserInfo({
          ...user,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
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
        <StyledText className="text-white text-xl font-bold">
          Profile
        </StyledText>
        <StyledText className="text-white text-sm opacity-80 mt-1">
          Manage your account
        </StyledText>
      </StyledView>

      <StyledScrollView className="flex-1 px-4 pt-4">
        {/* User Info Card */}
        <StyledView className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <StyledView className="items-center mb-4">
            <StyledView className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-3">
              <View>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            </StyledView>
            
            {isEditing ? (
              <View style={{width: '100%'}}>
                <StyledView className="w-full mb-4">
                  <StyledText className="text-sm font-medium text-text mb-2">Name *</StyledText>
                  <StyledTextInput
                    className={`border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg p-3 w-full text-text`}
                    value={formData.name}
                    onChangeText={(text) => handleChange("name", text)}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <StyledText className="text-red-500 text-xs mt-1">
                      {errors.name}
                    </StyledText>
                  )}
                </StyledView>

                <StyledView className="w-full mb-4">
                  <StyledText className="text-sm font-medium text-text mb-2">
                    Email * (readonly)
                  </StyledText>
                  <StyledTextInput
                    className={`border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg p-3 w-full bg-gray-100 text-text`}
                    value={formData.email}
                    editable={false}
                  />
                  {errors.email && (
                    <StyledText className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </StyledText>
                  )}
                </StyledView>

                <StyledView className="w-full mb-4">
                  <StyledText className="text-sm font-medium text-text mb-2">
                    Phone Number
                  </StyledText>
                  <StyledTextInput
                    className={`border ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    } rounded-lg p-3 w-full text-text`}
                    value={formData.phoneNumber}
                    onChangeText={(text) => handleChange("phoneNumber", text)}
                    keyboardType="phone-pad"
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && (
                    <StyledText className="text-red-500 text-xs mt-1">
                      {errors.phoneNumber}
                    </StyledText>
                  )}
                </StyledView>
                
                <StyledText className="text-gray-500 text-xs mt-2 mb-4">
                  * Required fields
                </StyledText>
              </View>
            ) : (
              <View style={{width: '100%', alignItems: 'center'}}>
                <StyledText className="text-xl font-bold">
                  {user?.name || "User"}
                </StyledText>
                <StyledText className="text-gray-500">
                  {user?.email || "email@example.com"}
                </StyledText>
                {user?.phoneNumber && (
                  <StyledView className="flex-row items-center mt-1">
                    <View>
                      <Ionicons name="call-outline" size={14} color="#666" />
                    </View>
                    <StyledText className="text-gray-500 ml-1">
                      {user.phoneNumber}
                    </StyledText>
                  </StyledView>
                )}
                <StyledView className="bg-primary-100 px-3 py-1 rounded-full mt-2">
                  <StyledText className="text-primary-700 text-xs">
                    {user?.role ? user.role.toUpperCase() : "MEMBER"}
                  </StyledText>
                </StyledView>
              </View>
            )}
          </StyledView>
          
          {/* Edit/Save Profile Button */}
          <StyledTouchableOpacity
            className={`mt-4 p-4 rounded-lg ${
              isEditing ? "bg-green-600" : "bg-primary"
            } items-center`}
            onPress={isEditing ? handleSaveProfile : handleEditToggle}
            disabled={updateLoading}
          >
            {updateLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <StyledText className="text-white text-center font-bold">
                {isEditing ? "Save Profile" : "Edit Profile"}
              </StyledText>
            )}
          </StyledTouchableOpacity>

          {isEditing && (
            <StyledTouchableOpacity
              className="mt-3 p-4 rounded-lg bg-gray-400 items-center"
              onPress={handleEditToggle}
            >
              <StyledText className="text-white text-center font-bold">
                Cancel
              </StyledText>
            </StyledTouchableOpacity>
          )}
          
          {updateError && (
            <StyledText className="text-red-500 text-center mt-2">
              {updateError instanceof Error
                ? updateError.message
                : String(updateError)}
            </StyledText>
          )}
        </StyledView>
        
        {/* Settings Section */}
        <StyledView className="bg-white rounded-lg shadow-sm mb-6">
          <StyledTouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={handleEditToggle}
          >
            <View>
              <Ionicons name="person-outline" size={22} color="#0284c7" />
            </View>
            <StyledText className="ml-3 text-gray-800">Edit Profile</StyledText>
            <StyledView style={{ marginLeft: "auto" }}>
              <View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </View>
            </StyledView>
          </StyledTouchableOpacity>
          
          <StyledTouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View>
              <Ionicons name="notifications-outline" size={22} color="#0284c7" />
            </View>
            <StyledText className="ml-3 text-gray-800">
              Notifications
            </StyledText>
            <StyledView style={{ marginLeft: "auto" }}>
              <View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </View>
            </StyledView>
          </StyledTouchableOpacity>
          
          <StyledTouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View>
              <Ionicons name="lock-closed-outline" size={22} color="#0284c7" />
            </View>
            <StyledText className="ml-3 text-gray-800">
              Change Password
            </StyledText>
            <StyledView style={{ marginLeft: "auto" }}>
              <View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </View>
            </StyledView>
          </StyledTouchableOpacity>
          
          <StyledTouchableOpacity className="flex-row items-center p-4">
            <View>
              <Ionicons name="settings-outline" size={22} color="#0284c7" />
            </View>
            <StyledText className="ml-3 text-gray-800">App Settings</StyledText>
            <StyledView style={{ marginLeft: "auto" }}>
              <View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </View>
            </StyledView>
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
          <StyledText className="text-gray-400 text-xs">
            GameFund Manager v1.0.0
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default ProfileScreen;
