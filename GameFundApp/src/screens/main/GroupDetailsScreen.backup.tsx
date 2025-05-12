import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshControl,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledScrollView,
  StyledImage,
} from "../../utils/StyledComponents";
import { MemberList, FinancialSummary } from "../../components";
import { useApi } from "../../hooks";
import { groupService } from "../../services";
import { expenseService } from "../../services/expense.service";
import { contributionService } from "../../services/contribution.service";
import { Expense } from "../../models/expense.model";
import { Contribution } from "../../models/contribution.model";
import { Group, GroupMember } from "../../models/group.model";
import { RootStackParamList } from "../../navigation/types";

// TypeScript types
type GroupDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "GroupDetails"
>;
type GroupDetailsScreenNavigationProp = any; // Using any since we don't have the exact stack navigator type

// Tab types for the group details screen
type TabType =
  | "summary"
  | "members"
  | "expenses"
  | "contributions"
  | "polls"
  | "chat";

const GroupDetailsScreen: React.FC = () => {
  // Navigation and route params
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const navigation = useNavigation<GroupDetailsScreenNavigationProp>();
  const { groupId } = route.params;

  // State variables
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [refreshing, setRefreshing] = useState(false);

  // Use the useApi hook to fetch group details
  const {
    data: group,
    loading,
    error,
    execute: fetchGroupDetails,
  } = useApi<Group>(() => groupService.getGroupById(groupId));

  // Refresh control function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroupDetails().finally(() => setRefreshing(false));
  }, [fetchGroupDetails]);

  // Set screen title when group is loaded
  useEffect(() => {
    if (group) {
      navigation.setOptions({
        title: group.name,
        headerRight: () => (
          <StyledTouchableOpacity
            onPress={() => {
              if (group.isUserAdmin) {
                // Show admin options for the group
                Alert.alert("Group Options", "What would you like to do?", [
                  {
                    text: "Edit Group",
                    onPress: () =>
                      navigation.navigate("CreateGroup", { groupId: group.id }),
                  },
                  {
                    text: "Add Member",
                    onPress: () =>
                      Alert.alert("Add Member", "This feature is coming soon!"),
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }
            }}
            className="mr-4"
          >
            {group.isUserAdmin && (
              <StyledText className="text-primary font-bold">
                Options
              </StyledText>
            )}
          </StyledTouchableOpacity>
        ),
      });
    }
  }, [group, navigation]);
  // Load group details only once when the screen is first focused
  const [groupDetailsLoaded, setGroupDetailsLoaded] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      if (!groupDetailsLoaded) {
        fetchGroupDetails();
        setGroupDetailsLoaded(true);
      }
      return () => {}; // cleanup function
    }, [fetchGroupDetails, groupDetailsLoaded])
  );

  // Render functions for different tabs  const renderSummaryTab = () => (
    <StyledView className="px-4 mb-6">
      <FinancialSummary groupId={groupId} currency={group?.currency || "USD"} />
    </StyledView>
  );
    // Create a ref to store the API state outside the render cycle
  const membersApiRef = React.useRef<{
    api: ReturnType<typeof useApi<GroupMember[]>> | null,
    loaded: boolean
  }>({
    api: null,
    loaded: false
  });
  
  const renderMembersTab = () => {
    // Only initialize the API if it hasn't been initialized yet
    if (!membersApiRef.current.api) {
      membersApiRef.current.api = useApi<GroupMember[]>(
        () => groupService.getGroupMembers(groupId), 
        false
      );
    }
    
    // Get API reference
    const {
      data: members = [] as GroupMember[],
      loading: loadingMembers,
      error: membersError,
      execute: fetchMembers
    } = membersApiRef.current.api;
    
    // Use useEffect to fetch members only once
    useEffect(() => {
      if (!membersApiRef.current.loaded) {
        fetchMembers();
        membersApiRef.current.loaded = true;
      }
    }, []);
    
    return (
      <StyledView className="px-4 mb-6">
        {group ? (
          <>
            {loadingMembers && (
              <StyledView className="w-full items-center py-4">
                <ActivityIndicator size="large" color="#0000ff" />
                <StyledText className="mt-2 text-gray-500">Loading members...</StyledText>
              </StyledView>
            )}
            
            {membersError && (
              <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
                <StyledText className="text-red-500 mb-2">Failed to load members</StyledText>                
                <StyledTouchableOpacity 
                  className="bg-primary px-4 py-2 rounded-lg"
                  onPress={() => fetchMembers()}
                >
                  <StyledText className="text-white">Try Again</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            )}
              
            {!loadingMembers && !membersError && (
              <MemberList
                members={members || []}
                isUserAdmin={group.isUserAdmin}
                onMemberPress={(member) => {
                  navigation.navigate("UserDetails", { userId: member.user.id });
                }}
              />
            )}
          </>
        ) : (
          <StyledView className="w-full items-center py-4">
            <ActivityIndicator size="large" color="#0000ff" />
          </StyledView>
        )}
      </StyledView>
    );
  };

  const renderExpensesTab = () => {
    // Use the expense service to fetch expenses for this group
    const {
      data: expenses = [] as Expense[],
      loading: loadingExpenses,
      error: expenseError,
      execute: fetchExpenses,
    } = useApi<Expense[]>(() => expenseService.getGroupExpenses(groupId), true);

    return (
      <StyledView className="px-4 mb-6">
        <StyledView className="flex-row justify-between mb-4 items-center">
          <StyledText className="text-xl font-bold">Expenses</StyledText>
          <StyledTouchableOpacity
            className="bg-primary px-4 py-2 rounded-full"
            onPress={() => navigation.navigate("AddExpense", { groupId })}
          >
            <StyledText className="text-white font-bold">+ Add</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Loading state */}
        {loadingExpenses && (
          <StyledView className="items-center py-4">
            <ActivityIndicator size="large" color="#0000ff" />
            <StyledText className="text-gray-500 mt-2">
              Loading expenses...
            </StyledText>
          </StyledView>
        )}

        {/* Error state */}
        {expenseError && (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-red-500 mb-2">
              Failed to load expenses
            </StyledText>
            <StyledTouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={() => fetchExpenses()}
            >
              <StyledText className="text-white">Try Again</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}
        {/* Success state with expenses */}
        {!loadingExpenses &&
          !expenseError &&
          expenses &&
          expenses.length > 0 &&
          expenses.map((expense: Expense) => (
            <StyledView
              key={expense.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-3"
            >
              <StyledView className="flex-row justify-between">
                <StyledText className="text-text font-bold">
                  {expense.title}
                </StyledText>
                <StyledText className="font-bold">{`${expense.amount} ${
                  group?.currency || "USD"
                }`}</StyledText>
              </StyledView>
              <StyledText className="text-gray-500 text-sm mt-1">
                {expense.description}
              </StyledText>
              <StyledView className="flex-row justify-between mt-2">
                <StyledText className="text-gray-500 text-xs">
                  {expense.createdByUser
                    ? `${expense.createdByUser.firstName} ${expense.createdByUser.lastName}`
                    : "Unknown user"}
                </StyledText>
                <StyledText className="text-gray-500 text-xs">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </StyledText>
              </StyledView>
            </StyledView>
          ))}

        {/* Empty state */}
        {!loadingExpenses &&
          !expenseError &&
          (!expenses || expenses.length === 0) && (
            <StyledView className="bg-white p-6 rounded-xl shadow-sm items-center">
              <StyledText className="text-center text-gray-400 mb-2">
                No expenses recorded yet.
              </StyledText>
              <StyledText className="text-center text-gray-400 text-sm">
                Add expenses to track group spending.
              </StyledText>
            </StyledView>
          )}
      </StyledView>
    );
  };

  const renderContributionsTab = () => {
    // Use the contribution service to fetch contributions for this group
    const {
      data: contributions = [] as Contribution[],
      loading: loadingContributions,
      error: contributionError,
      execute: fetchContributions,
    } = useApi<Contribution[]>(
      () => contributionService.getGroupContributions(groupId),
      true
    );

    return (
      <StyledView className="px-4 mb-6">
        <StyledView className="flex-row justify-between mb-4 items-center">
          <StyledText className="text-xl font-bold">Contributions</StyledText>
          <StyledTouchableOpacity
            className="bg-primary px-4 py-2 rounded-full"
            onPress={() => navigation.navigate("AddContribution", { groupId })}
          >
            <StyledText className="text-white font-bold">+ Add</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Loading state */}
        {loadingContributions && (
          <StyledView className="items-center py-4">
            <ActivityIndicator size="large" color="#0000ff" />
            <StyledText className="text-gray-500 mt-2">
              Loading contributions...
            </StyledText>
          </StyledView>
        )}

        {/* Error state */}
        {contributionError && (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-red-500 mb-2">
              Failed to load contributions
            </StyledText>
            <StyledTouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={() => fetchContributions()}
            >
              <StyledText className="text-white">Try Again</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}

        {/* Success state with contributions */}
        {!loadingContributions &&
          !contributionError &&
          contributions &&
          contributions.length > 0 &&
          contributions.map((contribution: Contribution) => (
            <StyledView
              key={contribution.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-3"
            >
              <StyledView className="flex-row justify-between">
                <StyledText className="text-text font-bold">
                  {contribution.user
                    ? `${contribution.user.firstName} ${contribution.user.lastName}`
                    : "Unknown user"}
                </StyledText>
                <StyledText className="font-bold text-green-600">{`+${
                  contribution.amount
                } ${group?.currency || "USD"}`}</StyledText>
              </StyledView>
              <StyledText className="text-gray-500 text-sm mt-1">
                {contribution.description}
              </StyledText>
              <StyledView className="flex-row justify-between mt-2">
                <StyledText className="text-gray-500 text-xs">
                  {contribution.paymentMethod || "Cash"}
                </StyledText>
                <StyledText className="text-gray-500 text-xs">
                  {new Date(contribution.contributionDate).toLocaleDateString()}
                </StyledText>
              </StyledView>
            </StyledView>
          ))}

        {/* Empty state */}
        {!loadingContributions &&
          !contributionError &&
          (!contributions || contributions.length === 0) && (
            <StyledView className="bg-white p-6 rounded-xl shadow-sm items-center">
              <StyledText className="text-center text-gray-400 mb-2">
                No contributions recorded yet.
              </StyledText>
              <StyledText className="text-center text-gray-400 text-sm">
                Add contributions to fund group activities.
              </StyledText>
            </StyledView>
          )}
      </StyledView>
    );
  };

  const renderPollsTab = () => (
    <StyledView className="px-4 mb-6">
      <StyledView className="flex-row justify-between mb-4 items-center">
        <StyledText className="text-xl font-bold">Polls</StyledText>
        <StyledTouchableOpacity className="bg-primary px-4 py-2 rounded-full">
          <StyledText className="text-white font-bold">+ Create</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
      <StyledText className="text-gray-500 mb-4">
        Polls and votes for this group will appear here.
      </StyledText>
      {/* Poll list component would go here */}
      <StyledText className="text-center text-gray-400 my-4">
        No polls created yet.
      </StyledText>
    </StyledView>
  );

  const renderChatTab = () => (
    <StyledView className="px-4 mb-6">
      <StyledText className="text-xl font-bold mb-4">Group Chat</StyledText>
      <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-4 items-center">
        <StyledText className="text-gray-500 mb-2">
          Chat is coming soon!
        </StyledText>
        <StyledText className="text-sm text-gray-400">
          Stay tuned for updates.
        </StyledText>
      </StyledView>
    </StyledView>
  );

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return renderSummaryTab();
      case "members":
        return renderMembersTab();
      case "expenses":
        return renderExpensesTab();
      case "contributions":
        return renderContributionsTab();
      case "polls":
        return renderPollsTab();
      case "chat":
        return renderChatTab();
      default:
        return renderSummaryTab();
    }
  };

  // Loading state
  if (loading && !group) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0000ff" />
        <StyledText className="mt-4 text-gray-600">
          Loading group details...
        </StyledText>
      </StyledView>
    );
  }

  // Error state
  if (error) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-background px-4">
        <StyledText className="text-red-500 text-lg mb-4">
          Failed to load group details
        </StyledText>
        <StyledText className="text-gray-500 mb-6">{error.message}</StyledText>
        <StyledTouchableOpacity
          className="bg-primary px-6 py-3 rounded-lg"
          onPress={() => fetchGroupDetails()}
        >
          <StyledText className="text-white font-bold">Try Again</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    );
  }
  return (
    <StyledScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Group header */}
      {group && (
        <StyledView className="bg-primary pt-2 pb-6 px-4 mb-4 rounded-b-3xl shadow-md">
          <StyledView className="flex-row items-center mb-2">
            {group.logoUrl ? (
              <StyledImage
                source={{ uri: group.logoUrl }}
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <StyledView className="w-16 h-16 rounded-full bg-gray-300 justify-center items-center mr-4">
                <StyledText className="text-2xl font-bold text-gray-500">
                  {group.name.substring(0, 1).toUpperCase()}
                </StyledText>
              </StyledView>
            )}
            <StyledView>
              <StyledText className="text-white text-xl font-bold">
                {group.name}
              </StyledText>
              <StyledText className="text-white opacity-80">{`${group.memberCount} members`}</StyledText>
            </StyledView>
          </StyledView>

          {/* Group financial summary card */}
          <StyledView className="bg-white p-4 rounded-xl shadow-sm mt-2">
            <StyledText className="text-gray-600 text-sm mb-1">
              Fund Status:
            </StyledText>
            <StyledView className="flex-row justify-between mb-2">
              <StyledText className="text-lg font-bold">{`${group.balance} ${group.currency}`}</StyledText>
              <StyledText
                className={`${
                  group.balance >= 0 ? "text-green-600" : "text-red-600"
                } font-bold`}
              >
                {group.balance >= 0 ? "Positive" : "Negative"}
              </StyledText>
            </StyledView>

            {/* Progress bar */}
            <StyledView className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
              <StyledView
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, group.progressPercentage)}%` }}
              />
            </StyledView>

            <StyledView className="flex-row justify-between">
              <StyledText className="text-xs text-gray-500">{`Target: ${group.targetAmount} ${group.currency}`}</StyledText>
              <StyledText className="text-xs text-gray-500">{`${Math.round(
                group.progressPercentage
              )}% Complete`}</StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
      )}
      {/* Tab navigation */}
      <StyledScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <StyledView className="flex-row px-4">
          {[
            { id: "summary", label: "Summary" },
            { id: "members", label: "Members" },
            { id: "expenses", label: "Expenses" },
            { id: "contributions", label: "Contributions" },
            { id: "polls", label: "Polls" },
            { id: "chat", label: "Chat" },
          ].map((tab) => (
            <StyledTouchableOpacity
              key={tab.id}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeTab === tab.id ? "bg-primary" : "bg-gray-200"
              }`}
              onPress={() => setActiveTab(tab.id as TabType)}
            >
              <StyledText
                className={`font-medium ${
                  activeTab === tab.id ? "text-white" : "text-gray-700"
                }`}
              >
                {tab.label}
              </StyledText>
            </StyledTouchableOpacity>
          ))}
        </StyledView>
      </StyledScrollView>

      {/* Tab content */}
      {renderTabContent()}
    </StyledScrollView>
  );
};

export default GroupDetailsScreen;
