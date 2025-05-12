import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { pollService } from "../../services/poll.service";
import { Expense } from "../../models/expense.model";
import { Contribution } from "../../models/contribution.model";
import { Group, GroupMember } from "../../models/group.model";
import { Poll } from "../../models/poll.model";
import { RootStackParamList } from "../../navigation/types";

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

  // Set screen title when group is loaded - removing large header
  useEffect(() => {
    if (group) {
      navigation.setOptions({
        headerShown: false, // Hide the default header for a full-screen experience
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
                      navigation.navigate("AddMember", { groupId: group.id }),
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

  // Render functions for different tabs
  const  renderSummaryTab = () => (
    <StyledView className="px-4 mb-6">
      <FinancialSummary 
        groupId={groupId} 
        currency={group?.currency || "USD"} 
        onViewAllExpenses={() => setActiveTab("expenses")}
        onViewAllContributions={() => setActiveTab("contributions")}
      />
    </StyledView>
  );// Use refs to store data outside of render cycle and prevent infinite API calls
  const membersDataRef = useRef({
    initialized: false,
    loaded: false,
    members: [] as GroupMember[],
    loading: false,
    error: null as Error | null
  });
  
  // State for members tab re-renders, declared at component level instead of inside render function
  const [membersUpdateTrigger, setMembersUpdateTrigger] = useState({});
  
  // Effect for loading members data, declared at component level
  useEffect(() => {
    if (activeTab === 'members' && !membersDataRef.current.initialized) {
      membersDataRef.current.initialized = true;
      membersDataRef.current.loading = true;
      
      // Fetch members data
      groupService.getGroupMembers(groupId)
        .then((result) => {
          membersDataRef.current.members = result;
          membersDataRef.current.loaded = true;
          membersDataRef.current.loading = false;
          setMembersUpdateTrigger({}); // Trigger re-render
        })
        .catch((err) => {
          membersDataRef.current.error = err;
          membersDataRef.current.loading = false;
          setMembersUpdateTrigger({}); // Trigger re-render
        });
    }
  }, [activeTab, groupId]);
  
  // Function to retry fetching members data
  const handleRetryMembersFetch = useCallback(() => {
    membersDataRef.current.loading = true;
    membersDataRef.current.error = null;
    setMembersUpdateTrigger({}); // Update UI to show loading state
    
    groupService.getGroupMembers(groupId)
      .then((result) => {
        membersDataRef.current.members = result;
        membersDataRef.current.loaded = true;
        membersDataRef.current.loading = false;
        setMembersUpdateTrigger({}); // Trigger re-render
      })
      .catch((err) => {
        membersDataRef.current.error = err;
        membersDataRef.current.loading = false;
        setMembersUpdateTrigger({}); // Trigger re-render
      });
  }, [groupId]);
  const renderMembersTab = () => {
    // Get data from ref for rendering
    const { members, loading, error } = membersDataRef.current;
    
    return (
      <StyledView className="px-4 mb-6">
        {group ? (
          <>
            <StyledView className="flex-row justify-between mb-4 items-center">
              <StyledText className="text-xl font-bold">Members ({members ? members.length : 0})</StyledText>
              {group.isUserAdmin && (
                <StyledTouchableOpacity
                  className="bg-accent px-4 py-2 rounded-full"
                  onPress={() => navigation.navigate("AddMember", { groupId })}
                >
                  <StyledText className="text-white font-bold">+ Add Member</StyledText>
                </StyledTouchableOpacity>
              )}
            </StyledView>

            {loading && (
              <StyledView className="w-full items-center py-4">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <StyledText className="mt-2 text-gray-500">Loading members...</StyledText>
              </StyledView>
            )}
            
            {error && (
              <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
                <StyledText className="text-danger mb-2">Failed to load members</StyledText>                
                <StyledTouchableOpacity 
                  className="bg-primary px-4 py-2 rounded-lg"
                  onPress={handleRetryMembersFetch}
                >
                  <StyledText className="text-white">Try Again</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            )}
              
            {!loading && !error && (
              <MemberList
                members={members || []}
                isUserAdmin={group.isUserAdmin || false}
                onMemberPress={(member) => {
                  navigation.navigate("UserDetails", { userId: member.user.id });
                }}
                onRoleChange={group.isUserAdmin ? (memberId, isAdmin) => {
                  Alert.alert(
                    "Change Member Role",
                    `Are you sure you want to make this member ${isAdmin ? "an Admin" : "a regular Player"}?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Confirm",
                        onPress: () => {
                          // Call API to update member role
                          groupService.updateMemberRole(groupId, memberId, isAdmin)
                            .then(() => {
                              // Update local state
                              const updatedMembers = [...membersDataRef.current.members];
                              const index = updatedMembers.findIndex(m => m.id === memberId);
                              if (index !== -1) {
                                updatedMembers[index] = {
                                  ...updatedMembers[index],
                                  isAdmin
                                };
                                membersDataRef.current.members = updatedMembers;
                                setMembersUpdateTrigger({}); // Trigger re-render
                              }
                              
                              Alert.alert("Success", `Member role updated to ${isAdmin ? "Admin" : "Player"} successfully`);
                            })
                            .catch(err => {
                              console.error("Error updating member role:", err);
                              Alert.alert("Error", "Failed to update member role. Please try again.");
                            });
                        }
                      }
                    ]
                  );
                } : undefined}
                onContributionStartMonthSelect={group.isUserAdmin ? (memberId) => {
                  // Get current date
                  const currentDate = new Date();
                  const currentMonth = currentDate.getMonth();
                  const currentYear = currentDate.getFullYear();
                  
                  // Create next month date
                  const nextMonth = new Date(currentYear, currentMonth + 1, 1);
                  
                  Alert.alert(
                    "Set Contribution Start Month",
                    "Choose the month this member should start contributing:",
                    [
                      { 
                        text: "This Month", 
                        onPress: () => {
                          const startDate = new Date(currentYear, currentMonth, 1);
                          groupService.updateMemberContributionStartDate(groupId, memberId, startDate)
                            .then(() => {
                              // Update local state
                              const updatedMembers = [...membersDataRef.current.members];
                              const index = updatedMembers.findIndex(m => m.id === memberId);
                              if (index !== -1) {
                                updatedMembers[index] = {
                                  ...updatedMembers[index],
                                  contributionStartDate: startDate
                                };
                                membersDataRef.current.members = updatedMembers;
                                setMembersUpdateTrigger({}); // Trigger re-render
                              }
                              
                              Alert.alert("Success", "Contribution start month set to this month");
                            })
                            .catch(err => {
                              console.error("Error setting contribution start month:", err);
                              Alert.alert("Error", "Failed to set contribution start month. Please try again.");
                            });
                        } 
                      },
                      { 
                        text: "Next Month", 
                        onPress: () => {
                          groupService.updateMemberContributionStartDate(groupId, memberId, nextMonth)
                            .then(() => {
                              // Update local state
                              const updatedMembers = [...membersDataRef.current.members];
                              const index = updatedMembers.findIndex(m => m.id === memberId);
                              if (index !== -1) {
                                updatedMembers[index] = {
                                  ...updatedMembers[index],
                                  contributionStartDate: nextMonth
                                };
                                membersDataRef.current.members = updatedMembers;
                                setMembersUpdateTrigger({}); // Trigger re-render
                              }
                              
                              Alert.alert("Success", "Contribution start month set to next month");
                            })
                            .catch(err => {
                              console.error("Error setting contribution start month:", err);
                              Alert.alert("Error", "Failed to set contribution start month. Please try again.");
                            });
                        } 
                      },
                      { 
                        text: "Custom", 
                        onPress: () => {
                          // Here you would typically show a date picker
                          // For now, we'll simulate with a simple alert
                          Alert.alert("Date Picker", "This would open a date picker to select a custom start month");
                        } 
                      },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                } : undefined}
                onPauseMemberContribution={group.isUserAdmin ? (memberId, isPaused) => {
                  const action = isPaused ? "pause" : "resume";
                  Alert.alert(
                    `${isPaused ? "Pause" : "Resume"} Contributions`,
                    `Are you sure you want to ${action} contributions for this member?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Confirm",
                        onPress: () => {
                          // Call API to update member contribution status
                          groupService.updateMemberContributionStatus(groupId, memberId, isPaused)
                            .then(() => {
                              // Update local state
                              const updatedMembers = [...membersDataRef.current.members];
                              const index = updatedMembers.findIndex(m => m.id === memberId);
                              if (index !== -1) {
                                updatedMembers[index] = {
                                  ...updatedMembers[index],
                                  contributionsPaused: isPaused
                                };
                                membersDataRef.current.members = updatedMembers;
                                setMembersUpdateTrigger({}); // Trigger re-render
                              }
                              
                              Alert.alert("Success", `Member contributions ${isPaused ? "paused" : "resumed"} successfully`);
                            })
                            .catch(err => {
                              console.error("Error updating member contribution status:", err);
                              Alert.alert("Error", `Failed to ${action} member contributions. Please try again.`);
                            });
                        }
                      }
                    ]
                  );
                } : undefined}
                onDeleteMember={group.isUserAdmin ? (memberId) => {
                  Alert.alert(
                    "Remove Member",
                    "Are you sure you want to remove this member from the group?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => {
                          // Call API to remove member
                          groupService.removeMember(groupId, memberId)
                            .then(() => {
                              // Update local state
                              const updatedMembers = membersDataRef.current.members.filter(
                                m => m.id !== memberId
                              );
                              membersDataRef.current.members = updatedMembers;
                              setMembersUpdateTrigger({}); // Trigger re-render
                              
                              Alert.alert("Success", "Member removed from group successfully");
                            })
                            .catch(err => {
                              console.error("Error removing member:", err);
                              Alert.alert("Error", "Failed to remove member. Please try again.");
                            });
                        }
                      }
                    ]
                  );
                } : undefined}                        }
                      }
                    ]
                  );
                } : undefined}
              />
            )}
          </>
        ) : (
          <StyledView className="w-full items-center py-4">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </StyledView>
        )}
      </StyledView>
    );
  };
  // Expenses tab implementation
  const expensesDataRef = useRef({
    initialized: false,
    loaded: false,
    expenses: [] as Expense[],
    loading: false,
    error: null as Error | null
  });
  
  // State for expenses tab re-renders
  const [expensesUpdateTrigger, setExpensesUpdateTrigger] = useState({});
  
  // Effect for loading expenses data
  useEffect(() => {
    if (activeTab === 'expenses' && !expensesDataRef.current.initialized) {
      expensesDataRef.current.initialized = true;
      expensesDataRef.current.loading = true;
      
      // Fetch expenses data
      expenseService.getGroupExpenses(groupId)
        .then((result) => {
          expensesDataRef.current.expenses = result;
          expensesDataRef.current.loaded = true;
          expensesDataRef.current.loading = false;
          setExpensesUpdateTrigger({}); // Trigger re-render
        })
        .catch((err) => {
          expensesDataRef.current.error = err;
          expensesDataRef.current.loading = false;
          setExpensesUpdateTrigger({}); // Trigger re-render
        });
    }
  }, [activeTab, groupId]);
  
  // Function to retry fetching expenses data
  const handleRetryExpensesFetch = useCallback(() => {
    expensesDataRef.current.loading = true;
    expensesDataRef.current.error = null;
    setExpensesUpdateTrigger({}); // Update UI to show loading state
    
    expenseService.getGroupExpenses(groupId)
      .then((result) => {
        expensesDataRef.current.expenses = result;
        expensesDataRef.current.loaded = true;
        expensesDataRef.current.loading = false;
        setExpensesUpdateTrigger({}); // Trigger re-render
      })
      .catch((err) => {
        expensesDataRef.current.error = err;
        expensesDataRef.current.loading = false;
        setExpensesUpdateTrigger({}); // Trigger re-render
      });
  }, [groupId]);

  const renderExpensesTab = () => {
    // Get data from ref
    const { expenses, loading, error } = expensesDataRef.current;

    return (
      <StyledView className="px-4 mb-6">
        <StyledView className="flex-row justify-between mb-4 items-center">
          <StyledText className="text-xl font-bold">Expenses</StyledText>
          <StyledTouchableOpacity
            className="bg-accent px-4 py-2 rounded-full"
            onPress={() => {
              if (group) {
                navigation.navigate("AddExpense", { 
                  groupId,
                  onExpenseAdded: (newExpense: Expense) => {
                    // Update the local expenses list with the new expense
                    const updatedExpenses = [newExpense, ...expensesDataRef.current.expenses];
                    expensesDataRef.current.expenses = updatedExpenses;
                    setExpensesUpdateTrigger({}); // Trigger re-render
                  }
                });
              }
            }}
          >
            <StyledText className="text-white font-bold">+ Add</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Loading state */}
        {loading && (
          <StyledView className="items-center py-4">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <StyledText className="text-gray-500 mt-2">
              Loading expenses...
            </StyledText>
          </StyledView>
        )}

        {/* Error state */}
        {error && (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-red-500 mb-2">
              Failed to load expenses
            </StyledText>
            <StyledTouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={handleRetryExpensesFetch}
            >
              <StyledText className="text-white">Try Again</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}

        {/* Success state with expenses */}
        {!loading && !error && expenses && expenses.length > 0 && (
          expenses.map((expense: Expense) => (
            <StyledView
              key={expense.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-3"
            >
              <StyledView className="flex-row justify-between">
                <StyledText className="text-text font-bold">
                  {expense.title}
                </StyledText>
                <StyledText className="font-bold text-danger">{`${expense.amount} ${
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
              
              {group?.isUserAdmin && (
                <StyledView className="flex-row justify-end mt-2">
                  <StyledTouchableOpacity 
                    className="bg-gray-100 px-3 py-1 rounded-lg mr-2"
                    onPress={() => {
                      navigation.navigate("EditExpense", { 
                        expense, 
                        groupId,
                        onExpenseUpdated: (updatedExpense: Expense) => {
                          const updatedExpenses = [...expensesDataRef.current.expenses];
                          const index = updatedExpenses.findIndex(e => e.id === updatedExpense.id);
                          if (index !== -1) {
                            updatedExpenses[index] = updatedExpense;
                            expensesDataRef.current.expenses = updatedExpenses;
                            setExpensesUpdateTrigger({}); // Trigger re-render
                          }
                        }
                      });
                    }}
                  >
                    <StyledText className="text-primary text-xs">Edit</StyledText>
                  </StyledTouchableOpacity>
                  
                  <StyledTouchableOpacity
                    className="bg-gray-100 px-3 py-1 rounded-lg"
                    onPress={() => {
                      Alert.alert(
                        "Delete Expense",
                        "Are you sure you want to delete this expense?",
                        [
                          { text: "Cancel", style: "cancel" },
                          { 
                            text: "Delete", 
                            style: "destructive",
                            onPress: () => {
                              expenseService.deleteExpense(expense.id)
                                .then(() => {
                                  // Update local state by filtering out the deleted expense
                                  const updatedExpenses = expensesDataRef.current.expenses.filter(
                                    e => e.id !== expense.id
                                  );
                                  expensesDataRef.current.expenses = updatedExpenses;
                                  setExpensesUpdateTrigger({}); // Trigger re-render
                                  
                                  Alert.alert("Success", "Expense deleted successfully");
                                })
                                .catch(err => {
                                  console.error("Error deleting expense:", err);
                                  Alert.alert("Error", "Failed to delete expense. Please try again.");
                                });
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <StyledText className="text-danger text-xs">Delete</StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              )}
            </StyledView>
          ))
        )}

        {/* Empty state */}
        {!loading && !error && (!expenses || expenses.length === 0) && (
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
  // Contributions tab implementation
  const contributionsDataRef = useRef({
    initialized: false,
    loaded: false,
    contributions: [] as Contribution[],
    loading: false,
    error: null as Error | null
  });
  
  // State for contributions tab re-renders
  const [contributionsUpdateTrigger, setContributionsUpdateTrigger] = useState({});
  
  // Effect for loading contributions data
  useEffect(() => {
    if (activeTab === 'contributions' && !contributionsDataRef.current.initialized) {
      contributionsDataRef.current.initialized = true;
      contributionsDataRef.current.loading = true;
      
      // Fetch contributions data
      contributionService.getGroupContributions(groupId)
        .then((result) => {
          contributionsDataRef.current.contributions = result;
          contributionsDataRef.current.loaded = true;
          contributionsDataRef.current.loading = false;
          setContributionsUpdateTrigger({}); // Trigger re-render
        })
        .catch((err) => {
          contributionsDataRef.current.error = err;
          contributionsDataRef.current.loading = false;
          setContributionsUpdateTrigger({}); // Trigger re-render
        });
    }
  }, [activeTab, groupId]);
  
  // Function to retry fetching contributions data
  const handleRetryContributionsFetch = useCallback(() => {
    contributionsDataRef.current.loading = true;
    contributionsDataRef.current.error = null;
    setContributionsUpdateTrigger({}); // Update UI to show loading state
    
    contributionService.getGroupContributions(groupId)
      .then((result) => {
        contributionsDataRef.current.contributions = result;
        contributionsDataRef.current.loaded = true;
        contributionsDataRef.current.loading = false;
        setContributionsUpdateTrigger({}); // Trigger re-render
      })
      .catch((err) => {
        contributionsDataRef.current.error = err;
        contributionsDataRef.current.loading = false;
        setContributionsUpdateTrigger({}); // Trigger re-render
      });
  }, [groupId]);

  const renderContributionsTab = () => {
    // Get data from ref
    const { contributions, loading, error } = contributionsDataRef.current;

    return (
      <StyledView className="px-4 mb-6">
        <StyledView className="flex-row justify-between mb-4 items-center">
          <StyledText className="text-xl font-bold">Contributions</StyledText>
          <StyledTouchableOpacity
            className="bg-accent px-4 py-2 rounded-full"
            onPress={() => {
              if (group) {
                navigation.navigate("AddContribution", { 
                  groupId,
                  onContributionAdded: (newContribution: Contribution) => {
                    // Update the local contributions list with the new contribution
                    const updatedContributions = [newContribution, ...contributionsDataRef.current.contributions];
                    contributionsDataRef.current.contributions = updatedContributions;
                    setContributionsUpdateTrigger({}); // Trigger re-render
                  }
                });
              }
            }}
          >
            <StyledText className="text-white font-bold">+ Add</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Loading state */}
        {loading && (
          <StyledView className="items-center py-4">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <StyledText className="text-gray-500 mt-2">
              Loading contributions...
            </StyledText>
          </StyledView>
        )}

        {/* Error state */}
        {error && (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-red-500 mb-2">
              Failed to load contributions
            </StyledText>
            <StyledTouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={handleRetryContributionsFetch}
            >
              <StyledText className="text-white">Try Again</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}

        {/* Success state with contributions */}
        {!loading && !error && contributions && contributions.length > 0 && (
          contributions.map((contribution: Contribution) => {
            // Determine status - default to 'pending' if not defined
            const isPaid = contribution.isPaid || contribution.status === 'paid';
            const status = contribution.status || (isPaid ? 'paid' : 'pending');
            
            return (
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
                  <StyledText className="font-bold text-success">{`+${
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
                
                {group?.isUserAdmin && (
                  <StyledView className="flex-row justify-between mt-3 items-center">
                    <StyledView className="flex-row items-center">
                      <StyledText className="text-xs text-gray-500 mr-2">Status:</StyledText>
                      <StyledView 
                        className={`px-2 py-1 rounded-full ${
                          isPaid ? 'bg-green-100' : 'bg-yellow-100'
                        }`}
                      >
                        <StyledText 
                          className={`text-xs ${
                            isPaid ? 'text-success' : 'text-yellow-600'
                          } font-medium`}
                        >
                          {isPaid ? 'Paid' : 'Pending'}
                        </StyledText>
                      </StyledView>
                    </StyledView>
                    
                    <StyledView className="flex-row">
                      {/* Toggle status button */}
                      <StyledTouchableOpacity 
                        className="bg-gray-100 px-3 py-1 rounded-lg mr-2"
                        onPress={() => {
                          const newStatus = isPaid ? 'pending' : 'paid';
                          contributionService.updateContributionStatus(contribution.id, newStatus)
                            .then(() => {
                              // Update local state
                              const updatedContributions = [...contributionsDataRef.current.contributions];
                              const index = updatedContributions.findIndex(c => c.id === contribution.id);
                              if (index !== -1) {
                                updatedContributions[index] = {
                                  ...updatedContributions[index],
                                  status: newStatus,
                                  isPaid: newStatus === 'paid'
                                };
                                contributionsDataRef.current.contributions = updatedContributions;
                                setContributionsUpdateTrigger({}); // Trigger re-render
                              }
                            })
                            .catch((err: Error) => {
                              console.error("Error updating contribution status:", err);
                              Alert.alert("Error", "Failed to update contribution status");
                            });
                        }}
                      >
                        <StyledText className="text-primary text-xs">
                          {isPaid ? 'Mark Pending' : 'Mark Paid'}
                        </StyledText>
                      </StyledTouchableOpacity>
                      
                      <StyledTouchableOpacity
                        className="bg-gray-100 px-3 py-1 rounded-lg"
                        onPress={() => {
                          Alert.alert(
                            "Delete Contribution",
                            "Are you sure you want to delete this contribution?",
                            [
                              { text: "Cancel", style: "cancel" },
                              { 
                                text: "Delete", 
                                style: "destructive",
                                onPress: () => {
                                  contributionService.deleteContribution(contribution.id)
                                    .then(() => {
                                      // Update local state by filtering out the deleted contribution
                                      const updatedContributions = contributionsDataRef.current.contributions.filter(
                                        c => c.id !== contribution.id
                                      );
                                      contributionsDataRef.current.contributions = updatedContributions;
                                      setContributionsUpdateTrigger({}); // Trigger re-render
                                      
                                      Alert.alert("Success", "Contribution deleted successfully");
                                    })
                                    .catch((err: Error) => {
                                      console.error("Error deleting contribution:", err);
                                      Alert.alert("Error", "Failed to delete contribution. Please try again.");
                                    });
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <StyledText className="text-danger text-xs">Delete</StyledText>
                      </StyledTouchableOpacity>
                    </StyledView>
                  </StyledView>
                )}
              </StyledView>
            );
          })
        )}

        {/* Empty state */}
        {!loading && !error && (!contributions || contributions.length === 0) && (
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
  // Polls tab implementation
  const pollsDataRef = useRef({
    initialized: false,
    loaded: false,
    polls: [] as Poll[],
    loading: false,
    error: null as Error | null
  });
  
  // State for polls tab re-renders
  const [pollsUpdateTrigger, setPollsUpdateTrigger] = useState({});
  
  // Effect for loading polls data
  useEffect(() => {
    if (activeTab === 'polls' && !pollsDataRef.current.initialized) {
      pollsDataRef.current.initialized = true;
      pollsDataRef.current.loading = true;
      
      // Fetch polls data
      pollService.getGroupPolls(groupId)
        .then((result) => {
          pollsDataRef.current.polls = result;
          pollsDataRef.current.loaded = true;
          pollsDataRef.current.loading = false;
          setPollsUpdateTrigger({}); // Trigger re-render
        })
        .catch((err) => {
          pollsDataRef.current.error = err;
          pollsDataRef.current.loading = false;
          setPollsUpdateTrigger({}); // Trigger re-render
        });
    }
  }, [activeTab, groupId]);
  
  // Function to retry fetching polls data
  const handleRetryPollsFetch = useCallback(() => {
    pollsDataRef.current.loading = true;
    pollsDataRef.current.error = null;
    setPollsUpdateTrigger({}); // Update UI to show loading state
    
    pollService.getGroupPolls(groupId)
      .then((result) => {
        pollsDataRef.current.polls = result;
        pollsDataRef.current.loaded = true;
        pollsDataRef.current.loading = false;
        setPollsUpdateTrigger({}); // Trigger re-render
      })
      .catch((err) => {
        pollsDataRef.current.error = err;
        pollsDataRef.current.loading = false;
        setPollsUpdateTrigger({}); // Trigger re-render
      });
  }, [groupId]);

  const renderPollsTab = () => {
    // Get data from ref
    const { polls, loading, error } = pollsDataRef.current;

    return (
      <StyledView className="px-4 mb-6">
        <StyledView className="flex-row justify-between mb-4 items-center">
          <StyledText className="text-xl font-bold">Polls</StyledText>
          {group?.isUserAdmin && (
            <StyledTouchableOpacity
              className="bg-accent px-4 py-2 rounded-full"
              onPress={() => {
                navigation.navigate("CreatePoll", { 
                  groupId,
                  onPollCreated: (newPoll: Poll) => {
                    // Update local state with the new poll
                    const updatedPolls = [newPoll, ...pollsDataRef.current.polls];
                    pollsDataRef.current.polls = updatedPolls;
                    setPollsUpdateTrigger({}); // Trigger re-render
                  }
                });
              }}
            >
              <StyledText className="text-white font-bold">+ Create</StyledText>
            </StyledTouchableOpacity>
          )}
        </StyledView>

        <StyledText className="text-gray-500 mb-4">
          Vote on group decisions and see results in real-time.
        </StyledText>

        {/* Loading state */}
        {loading && (
          <StyledView className="items-center py-4">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <StyledText className="text-gray-500 mt-2">
              Loading polls...
            </StyledText>
          </StyledView>
        )}

        {/* Error state */}
        {error && (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-red-500 mb-2">
              Failed to load polls
            </StyledText>
            <StyledTouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={handleRetryPollsFetch}
            >
              <StyledText className="text-white">Try Again</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}

        {/* Success state with polls */}
        {!loading && !error && polls && polls.length > 0 && (
          polls.map((poll: Poll) => (
            <StyledTouchableOpacity
              key={poll.id}
              onPress={() => {
                navigation.navigate("PollDetails", { 
                  pollId: poll.id,
                  groupId,
                  onVoteSubmitted: () => {
                    // Refresh polls after vote is submitted
                    handleRetryPollsFetch();
                  }
                });
              }}
            >
              <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
                <StyledView className="flex-row justify-between items-center">
                  <StyledText className="text-text font-bold text-lg flex-1 mr-2">
                    {poll.title}
                  </StyledText>
                  
                  <StyledView 
                    className={`px-2 py-1 rounded-full ${
                      !poll.isActive ? 'bg-gray-100' :
                      poll.isExpired ? 'bg-red-100' : 'bg-green-100'
                    }`}
                  >
                    <StyledText 
                      className={`text-xs font-medium ${
                        !poll.isActive ? 'text-gray-500' :
                        poll.isExpired ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {!poll.isActive ? 'Inactive' : 
                       poll.isExpired ? 'Expired' : 'Active'}
                    </StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledText className="text-gray-500 text-sm mt-1 mb-2">
                  {poll.description}
                </StyledText>
                
                {/* Poll type badge */}
                <StyledView className="flex-row justify-between mt-2">
                  <StyledView className="flex-row items-center">
                    <StyledText className="text-xs text-gray-500">
                      {poll.pollTypeName} • {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
                    </StyledText>
                  </StyledView>
                  
                  <StyledText className="text-gray-500 text-xs">
                    {poll.isExpired ? 'Ended' : `Ends ${new Date(poll.expiryDate).toLocaleDateString()}`}
                  </StyledText>
                </StyledView>
                
                {/* Only show a preview of options */}
                {poll.options.length > 0 && (
                  <StyledView className="mt-3">
                    <StyledView className="flex-row justify-between items-center mb-2">
                      <StyledText className="font-medium text-sm">{poll.options[0].text}</StyledText>
                      <StyledText className="text-xs text-gray-500">{poll.options[0].votePercentage.toFixed(0)}%</StyledText>
                    </StyledView>
                    <StyledView className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <StyledView
                        className="h-full bg-primary"
                        style={{ width: `${Math.max(poll.options[0].votePercentage, 5)}%` }}
                      />
                    </StyledView>
                    
                    {poll.options.length > 1 && (
                      <StyledText className="text-primary text-xs text-center mt-2">
                        + {poll.options.length - 1} more option{poll.options.length > 2 ? 's' : ''}
                      </StyledText>
                    )}
                  </StyledView>
                )}
              </StyledView>
            </StyledTouchableOpacity>
          ))
        )}

        {/* Empty state */}
        {!loading && !error && (!polls || polls.length === 0) && (
          <StyledView className="bg-white p-6 rounded-xl shadow-sm items-center">
            <StyledText className="text-center text-gray-400 mb-2">
              No polls created yet.
            </StyledText>
            <StyledText className="text-center text-gray-400 text-sm">
              Create polls to gather group opinions.
            </StyledText>
          </StyledView>
        )}
      </StyledView>
    );
  };

  const renderChatTab = () => (
    <StyledView className="px-4 mb-6">
      <StyledText className="text-xl font-bold mb-4">Group Chat</StyledText>
      <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-4 items-center">
        <StyledText className="text-gray-500 mb-2">
          Chat is coming soon!
        </StyledText>
        <StyledText className="text-sm text-gray-400">
          Stay tuned for updates. Group messaging will be available in the next app update.
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
