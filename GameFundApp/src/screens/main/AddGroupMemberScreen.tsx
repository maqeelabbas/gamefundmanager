import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  View,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import debounce from "lodash.debounce";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledTextInput,
  StyledScrollView,
  StyledSafeAreaView,
  StyledKeyboardAvoidingView,
} from "../../utils/StyledComponents";
import { useApi } from "../../hooks";
import { userService, UserSearchResult } from "../../services/user.service";
import { groupService } from "../../services/group.service";
import { RootStackParamList } from "../../navigation/types";
import { AddGroupMemberRequest, GroupMember } from "../../models/group.model";

// Define route param type
type AddGroupMemberScreenRouteProp = RouteProp<
  RootStackParamList,
  "AddGroupMember"
>;
type AddGroupMemberNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// SportyApp theme colors
const COLORS = {
  primary: "#0d7377",
  secondary: "#14BDEB",
  accent: "#FF8D29",
  success: "#32CD32",
  danger: "#FF4444",
  background: "#F1F9FF",
  card: "#FFFFFF",
  text: "#323232",
  lightText: "#5A5A5A",
};

const AddGroupMemberScreen: React.FC = () => {
  const navigation = useNavigation<AddGroupMemberNavigationProp>();
  const route = useRoute<AddGroupMemberScreenRouteProp>();
  const { groupId } = route.params;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [contributionStartDate, setContributionStartDate] = useState<Date>(
    new Date()
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [existingGroupMembers, setExistingGroupMembers] = useState<
    GroupMember[]
  >([]);

  // Refs
  const searchInputRef = useRef<any>(null);

  // API hook for searching users with proper type parameters
  const {
    execute: searchUsers,
    loading: searchLoading,
    error: searchError,
  } = useApi<UserSearchResult[], string>(
    (term: string) => userService.searchUsers(term),
    false
  );

  // API hook for adding member with proper type parameters
  const {
    execute: addMember,
    loading: addingMember,
    error: addError,
  } = useApi<GroupMember, AddGroupMemberRequest>(
    (request: AddGroupMemberRequest) =>
      groupService.addGroupMember(groupId, request),
    false
  );
  // API hook for fetching existing group members - set autoExecute to false
  const {
    execute: fetchGroupMembers,
    data: fetchedMembers,
    loading: loadingMembers,
  } = useApi<GroupMember[], void>(
    () => groupService.getGroupMembers(groupId),
    true // Set to true for auto-execution once
  );

  // Update state when members are fetched
  useEffect(() => {
    if (fetchedMembers) {
      setExistingGroupMembers(fetchedMembers);
    }
  }, [fetchedMembers]);
  // Debounced search function - extracted from the hook dependency to avoid recreating on every render
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      // Skip short search terms - this is already checked in the useEffect
      if (!term || term.length < 3) {
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(term);

        if (!results || results.length === 0) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        // Filter out users who are already members of the group
        const filteredResults = results.filter(
          (user) =>
            user &&
            user.id &&
            !existingGroupMembers.some((member) => member.user?.id === user.id)
        );

        setSearchResults(filteredResults);

        if (filteredResults.length === 0 && results.length > 0) {
          // This means all found users are already in the group
          Alert.alert(
            "Note",
            "All users matching this search are already members of the group."
          );
        }
      } catch (error) {
        console.error("Search error:", error);
        Alert.alert(
          "Search Error",
          "Failed to search for users. Please try again."
        );
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [existingGroupMembers] // Only depend on existingGroupMembers, not searchUsers
  );
  // Effect to trigger search when search term changes
  useEffect(() => {
    // Only trigger search if there's an actual term and it's at least 3 characters
    if (searchTerm && searchTerm.length >= 3) {
      debouncedSearch(searchTerm);
    } else if (searchTerm.length === 0) {
      // Clear results if search term is empty
      setSearchResults([]);
    }

    // Cleanup function
    return () => {
      if (debouncedSearch.cancel) {
        debouncedSearch.cancel();
      }
    };
  }, [searchTerm]);

  // Validate the form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!selectedUser) {
      errors.user = "Please select a user to add to the group";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle selecting a user from search results
  const handleSelectUser = (user: UserSearchResult) => {
    if (user && user.id) {
      // Check if user is already in the group
      const isExistingMember = existingGroupMembers.some(
        (member) => member.user?.id === user.id
      );

      if (isExistingMember) {
        Alert.alert(
          "Already a Member",
          "This user is already a member of this group.",
          [{ text: "OK" }]
        );
        return;
      }

      setSelectedUser(user);
      setSearchTerm(""); // Clear search term
      setSearchResults([]); // Clear search results
      setFormErrors((prev) => ({ ...prev, user: "" })); // Clear user error
    } else {
      console.error("Invalid user selected:", user);
      Alert.alert("Error", "Invalid user selected");
    }
  };

  // Handle adding the selected member to the group
  const handleAddMember = async () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedUser || !selectedUser.id) {
      Alert.alert(
        "Selection Required",
        "Please select a valid user to add to the group"
      );
      return;
    }

    try {
      // Log the request details for debugging
      console.log("Adding member with request:", {
        groupId,
        userId: selectedUser.id,
        isAdmin,
        contributionStartDate: contributionStartDate.toISOString(),
      });

      const memberRequest: AddGroupMemberRequest = {
        userId: selectedUser.id,
        isAdmin,
        contributionStartDate,
      };

      const result = await addMember(memberRequest);
      console.log("Add member result:", result);

      Alert.alert(
        "Success",
        `${selectedUser.name} has been added to the group as a ${
          isAdmin ? "admin" : "regular member"
        }`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const errorMsg = error?.message || "Unknown error occurred";
      console.error("Add member error:", errorMsg);

      // Display a more user-friendly error message based on common errors
      if (errorMsg.includes("already a member")) {
        Alert.alert("Error", "This user is already a member of this group");
      } else if (
        errorMsg.includes("401") ||
        errorMsg.includes("unauthorized")
      ) {
        Alert.alert(
          "Authentication Error",
          "You are not authorized to add members to this group"
        );
      } else {
        Alert.alert("Error", `Failed to add member to the group: ${errorMsg}`);
      }
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-background">
      <StyledKeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StyledView className="p-4 border-b border-gray-200 bg-white">
          <StyledView className="flex-row items-center justify-between">
            <StyledTouchableOpacity onPress={() => navigation.goBack()}>
              <StyledText className="text-primary">Cancel</StyledText>
            </StyledTouchableOpacity>
            <StyledText className="text-lg font-bold">
              Add Group Member
            </StyledText>
            <StyledView style={{ width: 50 }} />
          </StyledView>
        </StyledView>

        <StyledScrollView className="flex-1 p-4">
          <StyledView className="mb-4">
            <StyledText className="text-text mb-1">Search for Users</StyledText>
            <StyledTextInput
              ref={searchInputRef}
              className={`bg-white border ${
                formErrors.user ? "border-danger" : "border-gray-300"
              } rounded-lg p-3`}
              placeholder="Search by name or email (min. 3 characters)"
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
            />
            {formErrors.user ? (
              <StyledText className="text-danger mt-1">
                {formErrors.user}
              </StyledText>
            ) : null}
          </StyledView>

          {isSearching && (
            <StyledView className="items-center p-4">
              <ActivityIndicator size="small" color={COLORS.primary} />
              <StyledText className="mt-2 text-lightText">
                Searching...
              </StyledText>
            </StyledView>
          )}

          {searchResults.length > 0 && !selectedUser && (
            <StyledView className="mb-4">
              <StyledText className="text-text mb-2 font-bold">
                Search Results
              </StyledText>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <StyledTouchableOpacity
                    className="bg-white p-3 rounded-lg mb-2 border border-gray-200"
                    onPress={() => handleSelectUser(item)}
                  >
                    <StyledText className="font-bold">{item.name}</StyledText>
                    <StyledText className="text-lightText">
                      {item.email}
                    </StyledText>
                  </StyledTouchableOpacity>
                )}
                style={{ maxHeight: 200 }}
              />
            </StyledView>
          )}

          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <StyledText className="text-lightText mb-4">
              Please enter at least 3 characters to search
            </StyledText>
          )}

          {searchTerm.length >= 3 &&
            searchResults.length === 0 &&
            !isSearching && (
              <StyledView className="bg-white p-3 rounded-lg mb-4 border border-gray-200">
                <StyledText className="text-lightText">
                  No users found. Try a different search term.
                </StyledText>
              </StyledView>
            )}

          {selectedUser && (
            <StyledView className="mb-4">
              <StyledText className="text-text mb-2 font-bold">
                Selected User
              </StyledText>
              <StyledView className="bg-white p-4 rounded-lg border border-gray-200">
                <StyledText className="font-bold">
                  {selectedUser.name}
                </StyledText>
                <StyledText className="text-lightText">
                  {selectedUser.email}
                </StyledText>
                <StyledTouchableOpacity
                  className="mt-2"
                  onPress={() => setSelectedUser(null)}
                >
                  <StyledText className="text-primary">
                    Change Selection
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>
          )}

          {selectedUser && (
            <>
              <StyledView className="mb-4">
                <StyledText className="text-text mb-2">Member Role</StyledText>
                <StyledView className="flex-row">
                  <StyledTouchableOpacity
                    className={`flex-1 p-3 rounded-lg mr-2 ${
                      !isAdmin
                        ? "bg-primary"
                        : "bg-white border border-gray-300"
                    }`}
                    onPress={() => setIsAdmin(false)}
                  >
                    <StyledText
                      className={`text-center ${
                        !isAdmin ? "text-white font-bold" : "text-text"
                      }`}
                    >
                      Regular Member
                    </StyledText>
                  </StyledTouchableOpacity>
                  <StyledTouchableOpacity
                    className={`flex-1 p-3 rounded-lg ${
                      isAdmin ? "bg-primary" : "bg-white border border-gray-300"
                    }`}
                    onPress={() => setIsAdmin(true)}
                  >
                    <StyledText
                      className={`text-center ${
                        isAdmin ? "text-white font-bold" : "text-text"
                      }`}
                    >
                      Admin
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>

              <StyledView className="mb-6">
                <StyledText className="text-text mb-2">
                  Contribution Start Date
                </StyledText>
                <StyledTouchableOpacity
                  className="bg-white border border-gray-300 rounded-lg p-3"
                  onPress={() => setShowDatePicker(true)}
                >
                  <StyledText>
                    {contributionStartDate.toLocaleDateString()}
                  </StyledText>
                </StyledTouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={contributionStartDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === "android") {
                        setShowDatePicker(false);
                      }
                      if (selectedDate) {
                        setContributionStartDate(selectedDate);
                      }
                    }}
                  />
                )}
                <StyledText className="text-lightText mt-1 text-xs">
                  This date determines when the member will start contributing
                  to the group fund.
                </StyledText>
              </StyledView>

              <StyledTouchableOpacity
                className={`p-4 rounded-lg ${
                  selectedUser && !addingMember ? "bg-primary" : "bg-gray-300"
                }`}
                disabled={!selectedUser || addingMember}
                onPress={handleAddMember}
              >
                {addingMember ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <StyledText className="text-white text-center font-bold">
                    Add to Group
                  </StyledText>
                )}
              </StyledTouchableOpacity>

              {addError && (
                <StyledText className="text-danger text-center mt-2">
                  Error: {addError.message || "Failed to add member"}
                </StyledText>
              )}
            </>
          )}
        </StyledScrollView>
      </StyledKeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

export default AddGroupMemberScreen;
