// src/screens/main/GroupDetailsScreen.final.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, ActivityIndicator } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StyledView, StyledText, StyledScrollView, StyledTouchableOpacity, StyledTextInput } from '../../utils/StyledComponents';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useApi } from '../../hooks';
import { groupService, contributionService, expenseService } from '../../services';
import { Group, CreateGroupRequest } from '../../models';
import { useAuth } from '../../context/AuthContext';
import { MemberList, FinancialSummary } from '../../components';

type GroupDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetails'>;
type GroupDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * COMPLETELY REWRITTEN GroupDetailsScreen with strict adherence to hook rules
 * 
 * Key improvements:
 * 1. All hooks are declared at the top level, with consistent execution order
 * 2. No conditional hook execution
 * 3. Use of stable state values for rendering decisions
 * 4. Careful attention to text rendering within <Text> components
 * 5. Separation of data fetching from rendering
 */
const GroupDetailsScreen: React.FC = () => {
  // SECTION 1: Core hooks for navigation and context
  const navigation = useNavigation<GroupDetailsNavigationProp>();
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const { groupId } = route.params;
  const { user } = useAuth();
  
  // SECTION 2: State declarations - ALL state must be declared here
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'finances'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [groupForm, setGroupForm] = useState<Partial<CreateGroupRequest>>({});
  
  // SECTION 3: API hooks - ALL API hooks must be declared here
  // Group data
  const { 
    data: group, 
    loading: loadingGroup, 
    error: groupError,
    execute: fetchGroup
  } = useApi(() => groupService.getGroupById(groupId), true);

  // Members data - always initialize regardless of active tab
  const {
    data: groupMembers,
    loading: loadingMembers,
    error: membersError,
    execute: fetchMembers
  } = useApi(() => groupService.getGroupMembers(groupId), false);
  
  // Expense data - always initialize regardless of active tab
  const {
    data: expenses,
    loading: loadingExpenses,
    error: expensesError,
    execute: fetchExpenses
  } = useApi(() => expenseService.getGroupExpenses(groupId), false);
  
  // Contributions data - always initialize regardless of active tab
  const {
    data: contributions,
    loading: loadingContributions,
    error: contributionsError,
    execute: fetchContributions
  } = useApi(() => contributionService.getGroupContributions(groupId), false);
  
  // Group management hooks
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
  } = useApi(() => groupService.removeGroupMember(groupId, user?.id || ''), false);
  
  // SECTION 4: Effect hooks - ALL effect hooks must be declared here
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

  // Load data for the active tab when it changes
  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else if (activeTab === 'finances') {
      fetchExpenses();
      fetchContributions();
    }
  }, [activeTab, fetchMembers, fetchExpenses, fetchContributions]);
  
  // SECTION 5: Callback functions - ALL callbacks should be memoized with useCallback
  // Calculate financial info
  const getTotalContributions = useCallback(() => {
    return group?.totalContributions || 0;
  }, [group]);
  
  const getTotalExpenses = useCallback(() => {
    return group?.totalExpenses || 0;
  }, [group]);
  
  const getBalance = useCallback(() => {
    return group?.balance || 0;
  }, [group]);
  
  const getProgressPercentage = useCallback(() => {
    return group?.progressPercentage || 0;
  }, [group]);
  
  // Event handlers
  const handleEditToggle = useCallback(() => {
    if (isEditing && group) {
      // Cancel editing - reset form data
      setGroupForm({
        name: group.name,
        description: group.description,
        targetAmount: group.targetAmount,
        currency: group.currency
      });
    }
    setIsEditing(!isEditing);
  }, [isEditing, group]);
  
  const handleGroupUpdate = useCallback(async () => {
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
  }, [groupForm, updateGroup, fetchGroup]);

  const handleLeaveGroup = useCallback(() => {
    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave this group? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveGroupAPI();
              Alert.alert("Success", "You have left the group");
              navigation.goBack();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to leave group");
            }
          }
        }
      ]
    );
  }, [leaveGroupAPI, navigation]);

  const handleFormChange = useCallback((field: string, value: any) => {
    setGroupForm(prev => ({
      ...prev,
      [field]: field === 'targetAmount' ? parseFloat(value) : value
    }));
  }, []);
  
  const handleMemberPress = useCallback((member: any) => {
    Alert.alert(
      'Member Options', 
      `What would you like to do with this member?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Profile', 
          onPress: () => {
            const memberName = member.user ? 
              `${member.user.firstName} ${member.user.lastName}` : 'Unknown User';
            Alert.alert('Profile', `Navigate to ${memberName}'s profile`);
          } 
        }
      ]
    );
  }, []);
  
  // SECTION 6: Rendering functions - Split into smaller components for clarity
  // Loading view
  const renderLoading = () => (
    <StyledView className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color="#0284c7" />
      <StyledText className="mt-2 text-text">Loading group details...</StyledText>
    </StyledView>
  );
  
  // Error view
  const renderError = () => (
    <StyledView className="flex-1 justify-center items-center bg-background p-4">
      <StyledText className="text-red-500 text-center mb-4">
        Failed to load group details: {groupError?.message}
      </StyledText>
      <StyledTouchableOpacity 
        className="bg-primary px-4 py-2 rounded-lg"
        onPress={() => fetchGroup()}
      >
        <StyledText className="text-white font-medium">Try Again</StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
  
  // Header view
  const renderHeader = () => (
    <StyledView className="bg-primary p-6 pt-12">
      <StyledView className="flex-row items-center">
        <StyledTouchableOpacity
          className="mr-2"
          onPress={() => navigation.goBack()}
        >
          <StyledText className="text-white text-xl">←</StyledText>
        </StyledTouchableOpacity>
        
        <StyledText className="text-white text-xl font-bold">
          {isEditing ? 'Edit Group' : (group?.name || 'Group Details')}
        </StyledText>
      </StyledView>
    </StyledView>
  );
  
  // Tab navigation
  const renderTabs = () => (
    <StyledView className="flex-row border-b border-gray-200 bg-white">
      <StyledTouchableOpacity 
        className={`flex-1 py-3 ${activeTab === 'info' ? 'border-b-2 border-primary' : ''}`}
        onPress={() => setActiveTab('info')}
      >
        <StyledText className={`text-center font-medium ${activeTab === 'info' ? 'text-primary' : 'text-gray-500'}`}>
          Info
        </StyledText>
      </StyledTouchableOpacity>
      
      <StyledTouchableOpacity 
        className={`flex-1 py-3 ${activeTab === 'members' ? 'border-b-2 border-primary' : ''}`}
        onPress={() => setActiveTab('members')}
      >
        <StyledText className={`text-center font-medium ${activeTab === 'members' ? 'text-primary' : 'text-gray-500'}`}>
          Members
        </StyledText>
      </StyledTouchableOpacity>
      
      <StyledTouchableOpacity 
        className={`flex-1 py-3 ${activeTab === 'finances' ? 'border-b-2 border-primary' : ''}`}
        onPress={() => setActiveTab('finances')}
      >
        <StyledText className={`text-center font-medium ${activeTab === 'finances' ? 'text-primary' : 'text-gray-500'}`}>
          Finances
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
  
  // Info tab content
  const renderInfoTab = () => (
    <StyledView style={{ display: activeTab === 'info' ? 'flex' : 'none' }} className="p-4">
      <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <StyledText className="text-lg font-bold text-text mb-2">About</StyledText>
        
        {isEditing ? (
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text h-24"
            placeholder="Group description"
            multiline
            value={groupForm.description || ''}
            onChangeText={(text) => handleFormChange('description', text)}
            textAlignVertical="top"
          />
        ) : (
          <StyledText className="text-text">{group?.description}</StyledText>
        )}
      </StyledView>
      
      <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <StyledText className="text-lg font-bold text-text mb-2">
          {isEditing ? 'Edit Group Details' : 'Group Details'}
        </StyledText>
        
        {isEditing ? (
          <>
            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Group Name *</StyledText>
              <StyledTextInput 
                className="border border-gray-300 rounded-md p-2 w-full"
                value={groupForm.name || ''}
                onChangeText={(text) => handleFormChange('name', text)}
              />
            </StyledView>
            
            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Target Amount</StyledText>
              <StyledTextInput 
                className="border border-gray-300 rounded-md p-2 w-full"
                value={groupForm.targetAmount?.toString() || '0'}
                onChangeText={(text) => handleFormChange('targetAmount', text)}
                keyboardType="numeric"
              />
            </StyledView>
            
            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Currency</StyledText>
              <StyledTextInput 
                className="border border-gray-300 rounded-md p-2 w-full"
                value={groupForm.currency || 'USD'}
                onChangeText={(text) => handleFormChange('currency', text)}
              />
            </StyledView>
          </>
        ) : (
          <>
            <StyledView className="flex-row justify-between mb-2">
              <StyledText className="text-gray-500">Members</StyledText>
              <StyledText className="text-text">{group?.memberCount || 0}</StyledText>
            </StyledView>
            
            <StyledView className="flex-row justify-between mb-2">
              <StyledText className="text-gray-500">Target Amount</StyledText>
              <StyledText className="text-text">
                {group?.currency || 'USD'} {group?.targetAmount || 0}
              </StyledText>
            </StyledView>
            
            <StyledView className="flex-row justify-between mb-2">
              <StyledText className="text-gray-500">Progress</StyledText>
              <StyledText className="text-text">
                {getProgressPercentage().toFixed(0)}%
              </StyledText>
            </StyledView>
              <StyledView className="flex-row justify-between mb-2">
              <StyledText className="text-gray-500">Owner</StyledText>
              <StyledText className="text-text">
                {group?.owner ? `${group.owner.firstName} ${group.owner.lastName}` : 'Unknown'}
              </StyledText>
            </StyledView>
          </>
        )}
      </StyledView>
      
      <StyledView className="flex-row justify-between mb-4">
        {isEditing ? (
          <>
            <StyledTouchableOpacity 
              className="bg-green-600 px-4 py-2 rounded-lg flex-1 mr-2"
              onPress={handleGroupUpdate}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <StyledText className="text-white font-bold text-center">Save Changes</StyledText>
              )}
            </StyledTouchableOpacity>
            
            <StyledTouchableOpacity 
              className="bg-gray-500 px-4 py-2 rounded-lg flex-1 ml-2"
              onPress={handleEditToggle}
              disabled={updateLoading}
            >
              <StyledText className="text-white font-bold text-center">Cancel</StyledText>
            </StyledTouchableOpacity>
          </>
        ) : (
          <>
            <StyledTouchableOpacity 
              className="bg-primary px-4 py-2 rounded-lg flex-1 mr-2"
              onPress={handleEditToggle}
            >
              <StyledText className="text-white font-bold text-center">Edit Group</StyledText>
            </StyledTouchableOpacity>
            
            <StyledTouchableOpacity 
              className="bg-red-500 px-4 py-2 rounded-lg flex-1 ml-2"
              onPress={handleLeaveGroup}
              disabled={leaveLoading}
            >
              {leaveLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <StyledText className="text-white font-bold text-center">Leave Group</StyledText>
              )}
            </StyledTouchableOpacity>
          </>
        )}
      </StyledView>
      
      {updateError && (
        <StyledText className="text-red-500 text-center mb-4">
          {updateError.message}
        </StyledText>
      )}
      
      {leaveError && (
        <StyledText className="text-red-500 text-center mb-4">
          {leaveError.message}
        </StyledText>
      )}
    </StyledView>
  );
  
  // Members tab content
  const renderMembersTab = () => (
    <StyledView style={{ display: activeTab === 'members' ? 'flex' : 'none' }} className="p-4">
      <StyledView className="flex-row justify-between items-center mb-4">
        <StyledText className="text-text font-bold">{group?.memberCount || 0} Members</StyledText>
        {group?.isUserAdmin && (
          <StyledTouchableOpacity 
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => {
              Alert.alert("Invite Members", "This feature will be implemented soon!");
            }}
          >
            <StyledText className="text-white">+ Invite</StyledText>
          </StyledTouchableOpacity>
        )}
      </StyledView>
      
      {loadingMembers ? (
        <StyledView className="items-center py-8">
          <ActivityIndicator size="large" color="#0C6CFA" />
          <StyledText className="text-text mt-2">Loading members...</StyledText>
        </StyledView>
      ) : membersError ? (
        <StyledView className="items-center py-8">
          <StyledText className="text-red-500 mb-4">Failed to load members</StyledText>
          <StyledTouchableOpacity 
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => fetchMembers()}
          >
            <StyledText className="text-white">Try Again</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      ) : (
        // We mount MemberList with static props, avoiding hooks entirely
        <MemberList 
          key={`members-list-${activeTab === 'members' ? 1 : 0}`}
          members={groupMembers || []}
          isUserAdmin={group?.isUserAdmin || false}
          // We don't pass groupId to prevent the MemberList from using useApi internally
          // since we're already fetching the data here
          onMemberPress={handleMemberPress}
        />
      )}
    </StyledView>
  );
  
  // Finances tab content
  const renderFinancesTab = () => (
    <StyledView style={{ display: activeTab === 'finances' ? 'flex' : 'none' }} className="p-4">
      <FinancialSummary 
        key={`financial-summary-${activeTab === 'finances' ? 1 : 0}`}
        groupId={groupId}
        currency={group?.currency}
        // Pass all data directly to avoid hooks in the component
        expenses={Array.isArray(expenses) ? expenses : []}
        contributions={Array.isArray(contributions) ? contributions : []}
        loadingExpenses={loadingExpenses}
        loadingContributions={loadingContributions}
        expensesError={expensesError}
        contributionsError={contributionsError}
        fetchExpenses={fetchExpenses}
        fetchContributions={fetchContributions}
      />
      
      <StyledView className="flex-row justify-between my-6">
        <StyledTouchableOpacity 
          className="bg-primary px-4 py-3 rounded-lg flex-1 mr-2"
          onPress={() => navigation.navigate('AddContribution', { groupId })}
        >
          <StyledText className="text-white font-bold text-center">Add Contribution</StyledText>
        </StyledTouchableOpacity>
        
        <StyledTouchableOpacity 
          className="bg-secondary px-4 py-3 rounded-lg flex-1 ml-2"
          onPress={() => navigation.navigate('AddExpense', { groupId })}
        >
          <StyledText className="text-white font-bold text-center">Add Expense</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
  
  // Main render function
  if (loadingGroup && !group) {
    return (
      <StyledView className="flex-1 bg-background">
        <StatusBar style="dark" />
        {renderLoading()}
      </StyledView>
    );
  }
  
  if (groupError) {
    return (
      <StyledView className="flex-1 bg-background">
        <StatusBar style="dark" />
        {renderError()}
      </StyledView>
    );
  }
  
  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="dark" />
      {renderHeader()}
      {renderTabs()}
      <StyledScrollView className="flex-1">
        {renderInfoTab()}
        {renderMembersTab()}
        {renderFinancesTab()}
      </StyledScrollView>
    </StyledView>
  );
};

export default GroupDetailsScreen;
