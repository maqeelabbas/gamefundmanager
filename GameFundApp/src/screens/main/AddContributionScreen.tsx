// src/screens/main/AddContributionScreen.tsx
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, ActivityIndicator } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import {
  StyledView,
  StyledText,
  StyledTextInput,
  StyledTouchableOpacity,
  StyledScrollView,
} from "../../utils/StyledComponents";
import { RootStackParamList } from "../../navigation/types";
import { groupService } from "../../services";
import { contributionService } from "../../services/contribution.service";
import { Group, CreateContributionRequest } from "../../models";
import { useApi } from "../../hooks";
import { useAuth } from "../../context/AuthContext";

type AddContributionScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
type AddContributionScreenRouteProp = RouteProp<
  RootStackParamList,
  "AddContribution"
>;

const AddContributionScreen: React.FC = () => {
  const navigation = useNavigation<AddContributionScreenNavigationProp>();
  const route = useRoute<AddContributionScreenRouteProp>();
  const { user } = useAuth();

  // Get group ID from route params if available
  const initialGroupId = route.params?.groupId;
  
  // Fetch user's groups
  const {
    data: groups,
    loading: loadingGroups,
    error: groupsError,
    execute: refetchGroups
  } = useApi(() => groupService.getUserGroups(), true);

  const [amount, setAmount] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(
    initialGroupId || null
  );
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddContribution = async () => {
    if (!amount || !selectedGroup) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to add a contribution");
      return;
    }

    setIsLoading(true);
    try {
      // Create contribution data object
      const contributionData: CreateContributionRequest = {
        amount: parseFloat(amount),
        description: notes || "",
        contributionDate: new Date(),
        groupId: selectedGroup,
        transactionReference: `CONTRIB-${Date.now()}`,
      };      // Call the API to add the contribution
      await contributionService.addContribution(contributionData);

      // Show success message
      Alert.alert("Success", "Contribution added successfully!", [
        { 
          text: "OK", 
          onPress: () => {
            // Navigate back with refresh param
            navigation.navigate('GroupDetails', {
              groupId: selectedGroup,
              contributionAdded: true,
              contributionAddedAt: new Date().getTime()
            });
          } 
        },
      ]);
    } catch (error) {
      // Handle errors
      console.error("Error adding contribution:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to add contribution"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="dark" />

      <StyledView className="bg-primary p-6 pt-12">
        <StyledView className="flex-row items-center">
          <StyledTouchableOpacity
            className="mr-2"
            onPress={() => navigation.goBack()}
          >
            <StyledText className="text-white text-xl">←</StyledText>
          </StyledTouchableOpacity>

          <StyledText className="text-white text-xl font-bold">
            Add Contribution
          </StyledText>
        </StyledView>
      </StyledView>

      <StyledScrollView className="flex-1 p-4">
        <StyledView className="bg-white p-6 rounded-xl shadow-sm mb-4">
          {/* Group Selection */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Select Group *
          </StyledText>
          <StyledView className="mb-4">
            {loadingGroups ? (
              <StyledView className="items-center p-3">
                <ActivityIndicator size="small" color="#0000ff" />
                <StyledText className="mt-2">Loading groups...</StyledText>
              </StyledView>
            ) : groupsError ? (
              <StyledView className="items-center p-3">
                <StyledText className="text-red-500">
                  Error loading groups
                </StyledText>
                <StyledTouchableOpacity
                  className="mt-2 p-2 bg-primary rounded-lg"
                  onPress={() => refetchGroups()}
                >
                  <StyledText className="text-white">Retry</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            ) : groups && groups.length > 0 ? (
              groups.map((group: Group) => (
                <StyledTouchableOpacity
                  key={group.id}
                  className={`border p-3 rounded-lg mb-2 ${
                    selectedGroup === group.id
                      ? "border-primary bg-primary bg-opacity-10"
                      : "border-gray-300"
                  }`}
                  onPress={() => setSelectedGroup(group.id)}
                >
                  <StyledText
                    className={`${
                      selectedGroup === group.id
                        ? "text-primary font-medium"
                        : "text-text"
                    }`}
                  >
                    {group.name}
                  </StyledText>
                </StyledTouchableOpacity>
              ))
            ) : (
              <StyledView className="p-3 border border-gray-300 rounded-lg">
                <StyledText className="text-center text-gray-500">
                  You haven't joined any groups yet.
                </StyledText>
              </StyledView>
            )}
          </StyledView>
          
          {/* Amount Input */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Amount (USD) *
          </StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          
          {/* Notes Input */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Notes (Optional)
          </StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text h-24"
            placeholder="Add any additional notes"
            multiline
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
          
          <StyledTouchableOpacity
            className={`rounded-lg p-4 ${
              isLoading ? "bg-gray-400" : "bg-primary"
            } items-center`}
            onPress={handleAddContribution}
            disabled={isLoading}
          >
            <StyledText className="text-white font-bold">
              {isLoading ? "Adding..." : "Add Contribution"}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default AddContributionScreen;
