// This file combines the original UI with the React Hook order fixes 
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import components and services
import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledScrollView
} from "../../utils/StyledComponents";
import { useApi } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/group.service';
import { expenseService } from '../../services/expense.service';
import { contributionService } from '../../services/contribution.service';
import { pollService } from '../../services/poll.service';
import { RootStackParamList } from '../../navigation/types';
import { CreateGroupRequest } from '../../models';

// Import tab components
import {
  SummaryTab,
  MembersTab,
  ExpensesTab,
  ContributionsTab,
  PollsTab,
  ChatTab
} from './group-details-tabs';

// SportyApp theme colors
const COLORS = {
  primary: "#0d7377", // Sporty teal/blue
  secondary: "#14BDEB", // Light blue
  accent: "#FF8D29", // Energetic orange
  success: "#32CD32", // Green for positive values
  danger: "#FF4444", // Red for negative values
  background: "#F1F9FF", // Light blue background
  card: "#FFFFFF", // Card background
  text: "#323232", // Main text color
  lightText: "#5A5A5A" // Light text
};

// TypeScript types
type GroupDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetails'>;
type GroupDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Tab types for the group details screen
type TabType =
  | "summary"
  | "members"
  | "expenses"
  | "contributions"
  | "polls"
  | "chat";

const GroupDetailsScreen: React.FC = () => {
  const navigation = useNavigation<GroupDetailsNavigationProp>();
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const { groupId } = route.params;
  const { user } = useAuth();
  
  // IMPORTANT: Always define all state hooks at the top level
  // to ensure consistent hook execution order
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groupForm, setGroupForm] = useState<Partial<CreateGroupRequest>>({});
  
  // Expense and Contribution updates from navigation params
  const { expenseAdded, expenseAddedAt, contributionAdded, contributionAddedAt } = route.params || {};
  
  // Track the last processed timestamps to prevent duplicate refreshes
  const [lastProcessedExpenseTimestamp, setLastProcessedExpenseTimestamp] = useState<number | undefined>(undefined);
  const [lastProcessedContributionTimestamp, setLastProcessedContributionTimestamp] = useState<number | undefined>(undefined);

  // Watch route params to refresh data when returning from add screens with success
  useEffect(() => {
    if (expenseAdded && expenseAddedAt && expenseAddedAt !== lastProcessedExpenseTimestamp) {
      console.log('Expense added, refreshing expense data...', expenseAddedAt);
      // Force refresh group data regardless of tab
      fetchGroup();
      
      // Always refresh expense data when an expense is added
      fetchExpenses();
      
      // Also refresh contributions data to keep the summary view consistent
      fetchContributions();
      
      // Mark this expense addition as processed
      setLastProcessedExpenseTimestamp(expenseAddedAt);
      
      // Reset the loaded flags to ensure fresh data on tab selection
      setExpensesLoaded(false);
      setContributionsLoaded(false);
      
      // Switch to expenses tab to show the newly added expense
      setActiveTab("expenses");
      
      console.log('Expense data refresh complete and switched to expenses tab');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseAdded, expenseAddedAt, lastProcessedExpenseTimestamp]);
  useEffect(() => {
    if (contributionAdded && contributionAddedAt && contributionAddedAt !== lastProcessedContributionTimestamp) {
      console.log('Contribution added, refreshing contribution data...', contributionAddedAt);
      // Force refresh group data regardless of tab
      fetchGroup();
      
      // Always refresh contribution data when a contribution is added
      fetchContributions();
      
      // Mark this contribution addition as processed
      setLastProcessedContributionTimestamp(contributionAddedAt);
      
      // Reset the loaded flags to ensure fresh data on tab selection
      setContributionsLoaded(false);
      
      // Switch to contributions tab to show the newly added contribution
      setActiveTab("contributions");
      
      console.log('Contribution data refresh complete and switched to contributions tab');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributionAdded, contributionAddedAt, lastProcessedContributionTimestamp]);

  // API hooks for group data - always initialize regardless of which tab is active
  const { 
    data: group, 
    loading: loadingGroup, 
    error: groupError,
    execute: fetchGroup
  } = useApi(() => groupService.getGroupById(groupId), true);

  // Members data
  const {
    data: groupMembers,
    loading: loadingMembers,
    error: membersError,
    execute: fetchMembers
  } = useApi(() => groupService.getGroupMembers(groupId), false);
  
  // Expenses data
  const {
    data: expenses,
    loading: loadingExpenses,
    error: expensesError,
    execute: fetchExpenses
  } = useApi(() => expenseService.getGroupExpenses(groupId), false);
    // Contributions data
  const {
    data: contributions,
    loading: loadingContributions,
    error: contributionsError,
    execute: fetchContributions
  } = useApi(() => contributionService.getGroupContributions(groupId), false);

  // Polls data
  const {
    data: polls,
    loading: loadingPolls,
    error: pollsError,
    execute: fetchPolls
  } = useApi(() => pollService.getGroupPolls(groupId), false);
  
  // Group management API hooks
  const {
    loading: updateLoading,
    error: updateError,
    execute: updateGroup
  } = useApi((data: Partial<CreateGroupRequest>) => 
    groupService.updateGroup(groupId, data), false);

  const {
    loading: leaveLoading,
    error: leaveError,
    execute: leaveGroupAPI
  } = useApi(() => 
    groupService.removeGroupMember(groupId, user?.id || ''), false);
  
  // Initialize form data when group is loaded
  useEffect(() => {
    if (group) {
      setGroupForm({
        name: group.name,
        description: group.description,
        targetAmount: group.targetAmount,
        currency: group.currency
      });
    }
  }, [group]);

  // Initial data loading - load expenses and contributions on component mount regardless of tab
  useEffect(() => {
    // Fetch initial data for summary tab on component mount
    if (groupId) {
      console.log('Initial data loading for summary tab');
      fetchExpenses();
      fetchContributions();
      
      // Mark them as loaded so the tab change effect doesn't reload them unnecessarily
      setExpensesLoaded(true);
      setContributionsLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);
  
  // Load data for the active tab when it changes - with data already loaded tracking
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [expensesLoaded, setExpensesLoaded] = useState(false);
  const [contributionsLoaded, setContributionsLoaded] = useState(false);
  const [pollsLoaded, setPollsLoaded] = useState(false);
    // Load data for the active tab when it changes
  useEffect(() => {
    // This ensures we fetch data only once per tab selection
    if (activeTab === "members" && !membersLoaded) {
      fetchMembers();
      setMembersLoaded(true);
    } else if (activeTab === "expenses" && !expensesLoaded) {
      fetchExpenses();
      setExpensesLoaded(true);
    } else if (activeTab === "contributions" && !contributionsLoaded) {
      fetchContributions();
      setContributionsLoaded(true);
    } else if (activeTab === "polls" && !pollsLoaded) {
      fetchPolls();
      setPollsLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    // Removed fetch functions from dependencies to prevent infinite loops
    membersLoaded, expensesLoaded, contributionsLoaded, pollsLoaded
  ]);
  // Refresh active tab data when screen receives focus (e.g., coming back from Add Expense screen)  
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - ensuring data is refreshed for tab:', activeTab);
      
      // Always refresh group data to ensure totals are up-to-date
      fetchGroup();
      console.log('Refreshing group summary data');
      
      // Refresh data for the active tab
      if (activeTab === "expenses") {
        console.log('Refreshing expenses after screen focus');
        fetchExpenses();
        // Reset loaded flag to allow fresh data retrieval
        setExpensesLoaded(false);
      } else if (activeTab === "contributions") {
        console.log('Refreshing contributions after screen focus');
        fetchContributions();
        setContributionsLoaded(false);
      } else if (activeTab === "members") {
        console.log('Refreshing members after screen focus');
        fetchMembers();
        setMembersLoaded(false);
      } else if (activeTab === "polls") {
        console.log('Refreshing polls after screen focus');
        fetchPolls();
        setPollsLoaded(false);
      }
      
      console.log('Screen focus data refresh complete');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab])
  );
    // Helper function to refresh current tab data
  const refreshCurrentTabData = useCallback(() => {
    switch (activeTab) {
      case "summary":
        fetchGroup();
        break;
      case "members":
        fetchMembers();
        // Allow refetching on next tab switch if needed
        setMembersLoaded(false);
        break;
      case "expenses":
        fetchExpenses();
        setExpensesLoaded(false);
        break;
      case "contributions":
        fetchContributions();
        setContributionsLoaded(false);
        break;
      case "polls":
        fetchPolls();
        setPollsLoaded(false);
        break;
      default:
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab
    // Removed fetch functions and setState functions from dependencies to prevent potential infinite loops
  ]);
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshCurrentTabData();
    setRefreshing(false);
  }, [refreshCurrentTabData]);
  
  // Calculate financial info
  const getTotalContributions = () => {
    return group?.totalContributions || 0;
  };
  
  const getTotalExpenses = () => {
    return group?.totalExpenses || 0;
  };
  
  const getBalance = () => {
    return group?.balance || 0;
  };
  
  const getProgressPercentage = () => {
    return group?.progressPercentage || 0;
  };
  
  // Event handlers
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      if (group) {
        setGroupForm({
          name: group.name,
          description: group.description,
          targetAmount: group.targetAmount,
          currency: group.currency
        });
      }
    }
    setIsEditing(!isEditing);
  };
  
  const handleGroupUpdate = async () => {
    try {
      if (!groupForm.name) {
        Alert.alert("Validation Error", "Group name is required");
        return;
      }
      
      const updatedGroup = await updateGroup(groupForm);
      
      if (updatedGroup) {
        setIsEditing(false);
        Alert.alert("Success", "Group updated successfully");
        fetchGroup(); // Refresh group data
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update group");
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave this group? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {          text: "Leave",
          style: "destructive",          onPress: async () => {
            try {
              await leaveGroupAPI();
              Alert.alert("Success", "You have left the group");
              // Navigate back to the main tab with the Groups screen
              navigation.navigate("Main", { screen: "Groups", params: { refresh: true } });
            } catch (error: any) {
              // Format the error message to be more user-friendly
              let errorMessage = "Failed to leave group";
              
              if (error.message) {
                // Clean up any JSON or technical details from the error message
                const cleanMessage = error.message
                  .replace(/[{}[\]"]/g, '') // Remove JSON syntax
                  .replace(/^\s*error:\s*/i, '') // Remove "Error:" prefix
                  .trim();
                
                errorMessage = cleanMessage;
              }
              
              Alert.alert("Error", errorMessage);
            }
          }
        }
      ]
    );
  };

  // Render functions for different tabs
  // All these functions are defined regardless of the active tab to 
  // ensure consistent hook execution order
    // Content for the active tab
  // Content for the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return (
          <SummaryTab
            groupId={groupId}
            group={group}
            expenses={expenses || []}
            contributions={contributions || []}
            loadingExpenses={loadingExpenses}
            loadingContributions={loadingContributions}
            expensesError={expensesError}
            contributionsError={contributionsError}
            fetchExpenses={fetchExpenses}
            fetchContributions={fetchContributions}
            onViewAllExpenses={() => setActiveTab("expenses")}
            onViewAllContributions={() => setActiveTab("contributions")}
            handleEditToggle={handleEditToggle}
            handleLeaveGroup={handleLeaveGroup}
            getTotalContributions={getTotalContributions}
            getProgressPercentage={getProgressPercentage}
          />
        );
      case "members":
        return (
          <MembersTab
            groupId={groupId}
            groupMembers={groupMembers || []}
            loadingMembers={loadingMembers}
            membersError={membersError}
            fetchMembers={fetchMembers}
            isUserAdmin={group?.isUserAdmin}
            memberCount={group?.memberCount || 0}
          />
        );
      case "expenses":
        return (
          <ExpensesTab
            groupId={groupId}
            expenses={expenses || []}
            loadingExpenses={loadingExpenses}
            expensesError={expensesError}
            fetchExpenses={fetchExpenses}
            currency={group?.currency}
            navigation={navigation}
          />
        );
      case "contributions":
        return (
          <ContributionsTab
            groupId={groupId}
            contributions={contributions || []}
            loadingContributions={loadingContributions}
            contributionsError={contributionsError}
            fetchContributions={fetchContributions}
            currency={group?.currency}
            navigation={navigation}
          />
        );
      case "polls":
        return (
          <PollsTab
            polls={polls || []}
            loadingPolls={loadingPolls}
            pollsError={pollsError}
            fetchPolls={fetchPolls}
          />
        );
      case "chat":
        return <ChatTab />;
      default:
        return (
          <SummaryTab
            groupId={groupId}
            group={group}
            expenses={expenses || []}
            contributions={contributions || []}
            loadingExpenses={loadingExpenses}
            loadingContributions={loadingContributions}
            expensesError={expensesError}
            contributionsError={contributionsError}
            fetchExpenses={fetchExpenses}
            fetchContributions={fetchContributions}
            onViewAllExpenses={() => setActiveTab("expenses")}
            onViewAllContributions={() => setActiveTab("contributions")}
            handleEditToggle={handleEditToggle}
            handleLeaveGroup={handleLeaveGroup}
            getTotalContributions={getTotalContributions}
            getProgressPercentage={getProgressPercentage}
          />
        );
    }
  };

  // Loading state
  if (loadingGroup && !group) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StyledText className="mt-4 text-gray-600">
          Loading group details...
        </StyledText>
      </StyledView>
    );
  }

  // Error state
  if (groupError) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-background p-4">
        <StyledText className="text-red-500 text-center mb-4">
          Failed to load group details: {groupError.message}
        </StyledText>
        <StyledTouchableOpacity
          className="bg-primary py-3 px-6 rounded-lg"
          onPress={() => fetchGroup()}
        >
          <StyledText className="text-white font-bold">
            Try Again
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    );
  }

  // Define tabs
  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "members", label: "Members" },
    { id: "expenses", label: "Expenses" },
    { id: "contributions", label: "Contributions" },
    { id: "polls", label: "Polls" },
    { id: "chat", label: "Chat" },
  ];

  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="auto" />
      
      {/* Header */}
      <StyledView className="bg-primary pt-12 pb-3 px-4">
        <StyledView className="flex-row items-center">
          <StyledTouchableOpacity
            className="mr-3"
            onPress={() => navigation.goBack()}
          >
            <StyledText className="text-white text-xl">←</StyledText>
          </StyledTouchableOpacity>
          <StyledText className="text-white text-xl font-bold flex-1">
            {group?.name || 'Group Details'}
          </StyledText>
        </StyledView>
      </StyledView>
      
      {/* Main content */}
      <StyledScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tab bar */}
        <StyledScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 pt-3 pb-2"
        >
          <StyledView className="flex-row">
            {tabs.map((tab) => (
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
    </StyledView>
  );
};

export default GroupDetailsScreen;