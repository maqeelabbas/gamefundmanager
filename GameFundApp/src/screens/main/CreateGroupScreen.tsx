// src/screens/main/CreateGroupScreen.tsx
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  StyledView,
  StyledText,
  StyledTextInput,
  StyledTouchableOpacity,
  StyledScrollView,
} from "../../utils/StyledComponents";
import { RootStackParamList } from "../../navigation/types";
import { groupService } from "../../services";
import { CreateGroupRequest } from "../../models";

type CreateGroupScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Mock sport types
const sportTypes = [
  "Badminton",
  "Basketball",
  "Billiards",
  "Bowling",
  "Cricket",
  "Football",
  "Tennis",
  "Volleyball",
  "Other",
];

// Available days for contribution due date
const dueDays = Array.from({ length: 28 }, (_, i) => i + 1);

const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<CreateGroupScreenNavigationProp>();

  const [name, setName] = useState("");
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDueDay, setContributionDueDay] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!name || !selectedSport) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Create group data object
      const groupData: CreateGroupRequest = {
        name,
        description: description || `${name} - ${selectedSport} group`,
        targetAmount: 0, // Default value, could be added as a form field
        currency: "EUR",
        contributionDueDay: contributionDueDay || undefined,
      };

      // Call the API to create the group
      const createdGroup = await groupService.createGroup(groupData);

      // Show success message
      Alert.alert("Success", "Group created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      // Handle errors
      console.error("Error creating group:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create group"
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
            Create New Group
          </StyledText>
        </StyledView>
      </StyledView>

      <StyledScrollView className="flex-1 p-4">
        <StyledView className="bg-white p-6 rounded-xl shadow-sm mb-4">
          {/* Group Name Input */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Group Name *
          </StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Enter group name"
            value={name}
            onChangeText={setName}
          />
          {/* Sport Type Selection */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Sport Type *
          </StyledText>
          <StyledView className="flex-row flex-wrap mb-4">
            {sportTypes.map((sport) => (
              <StyledTouchableOpacity
                key={sport}
                className={`border rounded-full px-4 py-2 mr-2 mb-2 ${
                  selectedSport === sport
                    ? "border-primary bg-primary bg-opacity-10"
                    : "border-gray-300"
                }`}
                onPress={() => setSelectedSport(sport)}
              >
                <StyledText
                  className={`${
                    selectedSport === sport
                      ? "text-primary font-medium"
                      : "text-text"
                  }`}
                >
                  {sport}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
          {/* Description Input */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Group Description
          </StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text h-24"
            placeholder="Describe your group"
            multiline
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          {/* Contribution Amount */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Monthly Contribution Amount (EUR)
          </StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={contributionAmount}
            onChangeText={setContributionAmount}
          />
          {/* Contribution Due Day Selection */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Monthly Due Day
          </StyledText>
          <StyledView className="flex-row flex-wrap mb-4">
            {dueDays.map((day) => (
              <StyledTouchableOpacity
                key={day}
                className={`border rounded-full w-10 h-10 items-center justify-center mr-2 mb-2 ${
                  contributionDueDay === day
                    ? "border-primary bg-primary"
                    : "border-gray-300"
                }`}
                onPress={() => setContributionDueDay(day)}
              >
                <StyledText
                  className={`${
                    contributionDueDay === day
                      ? "text-white font-medium"
                      : "text-text"
                  }`}
                >
                  {day}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
          {/* Target Amount and Currency */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Target Amount (Optional)
          </StyledText>
          <StyledView className="flex-row items-center mb-4">
            <StyledView className="border border-gray-300 rounded-lg p-3 pr-0 w-24 mr-2 justify-center">
              <StyledText className="text-text">{"€"}</StyledText>
            </StyledView>
            <StyledTextInput
              className="border border-gray-300 rounded-lg p-3 flex-1 text-text"
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </StyledView>
          <StyledTouchableOpacity
            className={`rounded-lg p-4 ${
              isLoading ? "bg-gray-400" : "bg-primary"
            } items-center`}
            onPress={handleCreateGroup}
            disabled={isLoading}
          >
            <StyledText className="text-white font-bold">
              {isLoading ? "Creating..." : "Create Group"}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default CreateGroupScreen;
