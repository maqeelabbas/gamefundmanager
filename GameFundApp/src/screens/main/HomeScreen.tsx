// src/screens/main/HomeScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity } from "react-native";
import {
  StyledView,
  StyledText,
  StyledScrollView,
} from "../../utils/StyledComponents";
import { useNavigation } from "@react-navigation/native";
import { groupService, contributionService } from "../../services";
import { useApi } from "../../hooks";
import { Group } from "../../models/group.model";
import { Contribution, ContributionStatus } from "../../models/contribution.model";

// Define a helper function for currency formatting
const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  // Use a different symbol based on the currency
  let symbol = '€';
  switch (currency.toUpperCase()) {
    case 'USD':
      symbol = '$';
      break;
    case 'GBP':
      symbol = '£';
      break;
    // Add more currencies as needed
    default:
      symbol = '€'; // Default to Euro
  }

  // Format the number with 2 decimal places
  return `${symbol}${amount.toFixed(2)}`;
};

const HomeScreen = () => {
  const navigation = useNavigation();
  
  // Fetch user's groups
  const { 
    data: groups, 
    loading: loadingGroups, 
    error: groupsError,
    execute: fetchGroups
  } = useApi(() => groupService.getUserGroups(), true);
  
  // Fetch user's contributions
  const { 
    data: contributions, 
    loading: loadingContributions, 
    error: contributionsError,
    execute: fetchContributions
  } = useApi(() => contributionService.getUserContributions(), true);
    // Filter for pending contributions (upcoming payments)
  const upcomingPayments = useMemo(() => {
    if (!contributions || !Array.isArray(contributions)) return [];
    
    return contributions
      .filter(c => c.status === ContributionStatus.Pending)
      .sort((a, b) => new Date(a.contributionDate).getTime() - new Date(b.contributionDate).getTime())
      .slice(0, 5); // Show top 5 upcoming payments
  }, [contributions]);
  
  // Calculate total balance across all groups
  const totalBalance = useMemo(() => {
    if (!groups || !Array.isArray(groups)) return 0;
    
    return groups.reduce((sum, group) => sum + (group.balance || 0), 0);
  }, [groups]);
  
  // Calculate total due payments
  const totalDuePayments = useMemo(() => {
    if (!upcomingPayments) return 0;
    
    return upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [upcomingPayments]);
  
  // Navigate to groups screen
  const handleViewAllGroups = () => {
    // @ts-ignore - Type safety for navigation can be complex
    navigation.navigate('Groups');
  };
  
  // Navigate to group details
  const handleGroupPress = (groupId: string) => {
    // @ts-ignore - Type safety for navigation can be complex
    navigation.navigate('GroupDetails', { groupId });
  };
  
  // Refresh data
  const refreshData = () => {
    fetchGroups();
    fetchContributions();
  };
  
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <StyledView className="bg-primary p-6 pt-12">
        <StyledText className="text-white text-xl font-bold">
          Welcome to GameFund
        </StyledText>
        <StyledText className="text-white text-sm opacity-80 mt-1">
          Your sports contributions, simplified
        </StyledText>
      </StyledView>

      <StyledScrollView className="flex-1 px-4 pt-4">
        {/* Summary Cards */}
        <StyledView className="flex-row justify-between mb-6">
          <StyledView className="bg-white p-4 rounded-xl shadow-sm w-[48%]">
            <StyledText className="text-text text-xs mb-1">
              Total Balance
            </StyledText>
            <StyledText className="text-text text-xl font-bold">
              {formatCurrency(totalBalance)}
            </StyledText>
            <StyledText className="text-green-600 text-xs mt-1">
              Across {groups?.length || 0} groups
            </StyledText>
          </StyledView>

          <StyledView className="bg-white p-4 rounded-xl shadow-sm w-[48%]">
            <StyledText className="text-text text-xs mb-1">
              Due Payments
            </StyledText>
            <StyledText className="text-text text-xl font-bold">
              {formatCurrency(totalDuePayments)}
            </StyledText>
            <StyledText className="text-orange-500 text-xs mt-1">
              {upcomingPayments?.length || 0} upcoming payments
            </StyledText>
          </StyledView>
        </StyledView>
        {/* My Groups */}
        <StyledView className="mb-6">
          <StyledView className="flex-row justify-between items-center mb-3">
            <StyledText className="text-text text-lg font-bold">
              My Groups
            </StyledText>
            <TouchableOpacity onPress={handleViewAllGroups}>
              <StyledText className="text-primary">View All</StyledText>
            </TouchableOpacity>
          </StyledView>
          
          {loadingGroups ? (
            <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3 items-center">
              <StyledText>Loading groups...</StyledText>
            </StyledView>
          ) : groupsError ? (
            <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
              <StyledText className="text-red-500">
                Error loading groups. Pull down to retry.
              </StyledText>
            </StyledView>
          ) : groups && groups.length > 0 ? (
            groups.slice(0, 3).map((group) => (
              <TouchableOpacity key={group.id} onPress={() => handleGroupPress(group.id)}>
                <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
                  <StyledView className="flex-row justify-between items-start">
                    <StyledText
                      className="text-text font-bold flex-1 mr-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {group.name}
                    </StyledText>
                    <StyledText className="text-primary font-bold shrink-0">
                      {formatCurrency(group.balance || 0, group.currency || 'EUR')}
                    </StyledText>
                  </StyledView>
                  <StyledView className="mt-2">
                    <StyledText
                      className="text-text text-xs"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {group.memberCount || 0} members
                    </StyledText>
                  </StyledView>
                </StyledView>
              </TouchableOpacity>
            ))
          ) : (
            <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3 items-center">
              <StyledText>No groups yet. Create your first group!</StyledText>
            </StyledView>
          )}
        </StyledView>
        {/* Upcoming Payments */}
        <StyledView className="mb-6">
          <StyledText className="text-text text-lg font-bold mb-3">
            Upcoming Payments
          </StyledText>
          
          {loadingContributions ? (
            <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3 items-center">
              <StyledText>Loading payments...</StyledText>
            </StyledView>
          ) : contributionsError ? (
            <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
              <StyledText className="text-red-500">
                Error loading payments. Pull down to retry.
              </StyledText>
            </StyledView>
          ) : upcomingPayments && upcomingPayments.length > 0 ? (
            upcomingPayments.map((payment) => (
              <StyledView
                key={payment.id}
                className="bg-white p-4 rounded-xl shadow-sm mb-3"
              >
                <StyledView className="flex-row justify-between items-start">
                  <StyledText
                    className="text-text font-bold flex-1 mr-2"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {/* Look up group name if needed */}
                    {groups?.find(g => g.id === payment.groupId)?.name || "Unknown Group"}
                  </StyledText>
                  <StyledText className="text-orange-500 font-bold shrink-0">
                    {formatCurrency(payment.amount)}
                  </StyledText>
                </StyledView>
                <StyledView className="flex-row justify-between mt-2">
                  <StyledView className="flex-1 mr-3">
                    <StyledText
                      className="text-text text-xs"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Due by: {new Date(payment.contributionDate).toLocaleDateString()}
                    </StyledText>
                  </StyledView>
                  <TouchableOpacity onPress={() => handleGroupPress(payment.groupId)}>
                    <StyledText className="text-primary text-xs shrink-0">
                      View Details
                    </StyledText>
                  </TouchableOpacity>
                </StyledView>
              </StyledView>
            ))
          ) : (
            <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3 items-center">
              <StyledText>No upcoming payments.</StyledText>
            </StyledView>
          )}
        </StyledView>
        
        {/* Recent Activity */}
        <StyledView className="mb-6">
          <StyledText className="text-text text-lg font-bold mb-3">
            Recent Activity
          </StyledText>
          
          {(loadingGroups || loadingContributions) ? (
            <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3 items-center">
              <StyledText>Loading activity...</StyledText>
            </StyledView>
          ) : (
            <>
              {groups && groups.length > 0 && (
                <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
                  <StyledView className="flex-row justify-between items-start">
                    <StyledText
                      className="text-text font-bold flex-1 mr-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {groups[0].name}
                    </StyledText>
                    <StyledText className="text-text text-xs shrink-0">
                      Recent
                    </StyledText>
                  </StyledView>
                  <StyledText
                    className="text-text text-sm mt-1"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    You joined this group
                  </StyledText>
                </StyledView>
              )}
              
              {contributions && contributions.length > 0 && (
                <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
                  <StyledView className="flex-row justify-between items-start">
                    <StyledText
                      className="text-text font-bold flex-1 mr-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {groups?.find(g => g.id === contributions[0].groupId)?.name || "Unknown Group"}
                    </StyledText>
                    <StyledText className="text-text text-xs shrink-0">
                      {new Date(contributions[0].contributionDate).toLocaleDateString()}
                    </StyledText>
                  </StyledView>
                  <StyledText
                    className="text-text text-sm mt-1"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    Contribution {contributions[0].status === ContributionStatus.Paid ? 'paid' : 'recorded'}: {formatCurrency(contributions[0].amount)}
                  </StyledText>
                </StyledView>
              )}
              
              {(!groups || groups.length === 0) && (!contributions || contributions.length === 0) && (
                <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3 items-center">
                  <StyledText>No recent activity yet.</StyledText>
                </StyledView>
              )}
            </>
          )}
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default HomeScreen;
