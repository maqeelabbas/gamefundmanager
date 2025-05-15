// src/screens/main/AddContributionScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, ActivityIndicator, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  StyledView,
  StyledText,
  StyledTextInput,
  StyledTouchableOpacity,
  StyledScrollView,
  StyledActivityIndicator,
} from "../../utils/StyledComponents";
import { RootStackParamList } from "../../navigation/types";
import { groupService } from "../../services";
import { contributionService } from "../../services/contribution.service";
import { GroupMember } from "../../models/group.model";
import { CreateContributionRequest } from "../../models";
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
  const groupId = route.params?.groupId;

  // State for contribution form
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Group members state
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    user?.id || null
  );

  // Dropdown picker state - with zIndex management
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState<
    Array<{ label: string; value: string; icon?: () => React.ReactNode }>
  >([]);

  // Fetch group members using useCallback to avoid recreation on every render
  const fetchGroupMembers = useCallback(async () => {
    if (!groupId) {
      console.log("Cannot fetch members: No groupId provided");
      return;
    }

    console.log("Starting to fetch group members for group:", groupId);
    console.log("Current user ID:", user?.id);
    setLoadingMembers(true);
    try {
      console.log("Calling groupService.getGroupMembers...");
      const members = await groupService.getGroupMembers(groupId);
      console.log("Received members:", members);
      console.log("Members count:", members.length);

      setGroupMembers(members);

      // Format group members data for the dropdown
      const formattedMembers = members.map((member) => ({
        label: `${member.user.firstName} ${member.user.lastName}${
          member.isAdmin ? " (Admin)" : ""
        }${member.user.id === user?.id ? " (You)" : ""}`,
        value: member.user.id,
      }));

      setDropdownItems(formattedMembers);

      // If no member is selected yet and we have members, select current user by default
      if (members.length > 0 && !selectedMemberId) {
        const currentUserMember = members.find(
          (member) => member.user.id === user?.id
        );
        if (currentUserMember) {
          console.log(
            "Setting current user as selected member:",
            currentUserMember.user.id
          );
          setSelectedMemberId(currentUserMember.user.id);
        } else {
          console.log(
            "Current user not found in group members, selecting first member"
          );
          setSelectedMemberId(members[0].user.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch group members:", error);
      Alert.alert("Error", "Failed to load group members");
    } finally {
      setLoadingMembers(false);
    }
  }, [groupId, user?.id]);

  // Navigate back if no groupId is provided and fetch members when component mounts
  useEffect(() => {
    console.log(
      "useEffect running with groupId:",
      groupId,
      "and user:",
      user?.id
    );
    if (!groupId) {
      Alert.alert("Error", "No group specified for this contribution.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      // Fetch group members when component loads
      console.log("Calling fetchGroupMembers() from useEffect");
      fetchGroupMembers();
    }
  }, [groupId, navigation, fetchGroupMembers]);

  // Debug dropdown state changes
  useEffect(() => {
    console.log("Dropdown state changed:", {
      isOpen: dropdownOpen,
      selectedValue: selectedMemberId,
      availableMembers: groupMembers.length,
      itemsCount: dropdownItems.length,
    });

    // When dropdown is closed after member selection, ensure we don't refetch unnecessarily
    if (!dropdownOpen && selectedMemberId) {
      console.log(
        "Member selection completed, selected member ID:",
        selectedMemberId
      );
    }
  }, [
    dropdownOpen,
    selectedMemberId,
    groupMembers.length,
    dropdownItems.length,
  ]);

  const handleAddContribution = async () => {
    if (!amount || !selectedMemberId || !groupId) {
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
        groupId: groupId,
        contributorUserId: selectedMemberId, // Use the selected member as contributor
        transactionReference: `CONTRIB-${Date.now()}`,
      };

      // Call the API to add the contribution
      console.log(
        "Sending contribution data to API:",
        JSON.stringify(contributionData, null, 2)
      );
      const createdContribution = await contributionService.addContribution(
        contributionData
      );

      console.log(
        "API response for created contribution:",
        JSON.stringify(createdContribution, null, 2)
      );

      if (!createdContribution) {
        throw new Error(
          "Failed to create contribution - no data returned from API"
        );
      }

      // Show success message
      setIsLoading(false);
      Alert.alert("Success", "Contribution added successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back with refresh param and explicitly set active tab
            navigation.navigate("GroupDetails", {
              groupId: groupId,
              contributionAdded: true,
              contributionAddedAt: new Date().getTime(),
              initialTab: "contributions", // Force switch to contributions tab
            });
          },
        },
      ]);
    } catch (error) {
      // Handle errors
      setIsLoading(false);
      console.error("Error adding contribution:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to add contribution"
      );
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

      <StyledScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <StyledView className="bg-white p-6 rounded-xl shadow-sm mb-4">
          {/* Amount Input */}
          <StyledText className="text-sm font-medium text-text mb-2">
            Amount ({"€"}) *
          </StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          {/* Contributor Selection - Dropdown Picker */}
          <View style={{ marginBottom: 16, zIndex: 5000 }}>
            <StyledText className="text-sm font-medium text-text mb-2">
              Contributor *
            </StyledText>

            {loadingMembers ? (
              <StyledView className="items-center py-4">
                <ActivityIndicator size="small" color="#0d7377" />
                <StyledText className="text-gray-500 mt-2">
                  Loading members...
                </StyledText>
              </StyledView>
            ) : groupMembers.length > 0 ? (
              <DropDownPicker
                open={dropdownOpen}
                value={selectedMemberId}
                items={dropdownItems}
                setOpen={setDropdownOpen}
                setValue={setSelectedMemberId}
                setItems={setDropdownItems}
                placeholder="Select who made this contribution"
                searchable={true}
                searchPlaceholder="Search for a member..."
                listMode="SCROLLVIEW"
                scrollViewProps={{ nestedScrollEnabled: true }}
                style={{
                  backgroundColor: "white",
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  minHeight: 50,
                }}
                textStyle={{
                  fontSize: 14,
                  color: "#333333",
                }}
                dropDownContainerStyle={{
                  backgroundColor: "white",
                  borderColor: "#d1d5db",
                  borderTopWidth: 0,
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
                listItemContainerStyle={{
                  height: 40,
                }}
                searchContainerStyle={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#d1d5db",
                  padding: 8,
                }}
                searchTextInputStyle={{
                  borderWidth: 0,
                  fontSize: 14,
                }}
                zIndex={5000}
                zIndexInverse={1000}
              />
            ) : (
              <StyledView className="bg-white border border-gray-300 rounded-lg p-4 items-center">
                <StyledText className="text-gray-500">
                  No members found
                </StyledText>
                <StyledText className="text-xs text-gray-500 mb-2">
                  Debug: Members loaded: {groupMembers.length}, Dropdown items:{" "}
                  {dropdownItems.length}
                </StyledText>
                <StyledTouchableOpacity
                  className="bg-primary py-2 px-4 rounded-lg mt-2"
                  onPress={() => {
                    console.log("Manual retry triggered");
                    fetchGroupMembers();
                  }}
                >
                  <StyledText className="text-white">
                    Retry Loading Members
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            )}
          </View>
          {/* Notes Input */}
          <View style={{ zIndex: 1, marginTop: 16 }}>
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
          </View>
          <View style={{ zIndex: 1 }}>
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
          </View>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default AddContributionScreen;
