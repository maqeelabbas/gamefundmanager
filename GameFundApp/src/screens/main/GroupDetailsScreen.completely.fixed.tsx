// src/screens/main/GroupDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, ActivityIndicator } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StyledView, StyledText, StyledScrollView, StyledTouchableOpacity, StyledTextInput } from '../../utils/StyledComponents';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useApi } from '../../hooks';
import { groupService } from '../../services';
import { Group, CreateGroupRequest } from '../../models';
import { useAuth } from '../../context/AuthContext';
import { MemberList, FinancialSummary } from '../../components';

type GroupDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetails'>;
type GroupDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GroupDetailsScreen: React.FC = () => {
  const navigation = useNavigation<GroupDetailsNavigationProp>();
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const { groupId } = route.params;
  const { user } = useAuth();
  
  // Move ALL state and hooks to the top level
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'finances'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [groupForm, setGroupForm] = useState<Partial<CreateGroupRequest>>({});
  
  // API hooks for group data
  const { 
    data: group, 
    loading: loadingGroup, 
    error: groupError,
    execute: fetchGroup
  } = useApi(() => groupService.getGroupById(groupId), true);

  // Always initialize the members API hook, regardless of which tab is active
  const {
    data: groupMembers,
    loading: loadingMembers,
    error: membersError,
    execute: fetchMembers
  } = useApi(() => groupService.getGroupMembers(groupId), false);
  
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

  // Load members data when tab changes to members
  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    }
  }, [activeTab, fetchMembers]);

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
  };

  const handleFormChange = (field: string, value: any) => {
    setGroupForm(prev => ({
      ...prev,
      [field]: field === 'targetAmount' ? parseFloat(value) : value
    }));
  };

  // The key fix: Don't conditionally render different hooks based on tab
  // Instead, always render all tabs but only display the active one
  // This ensures hooks are always called in the same order
  const renderContent = () => {
    if (loadingGroup && !group) {
      return (
        <StyledView className="flex-1 justify-center items-center bg-background">
          <ActivityIndicator size="large" color="#0284c7" />
          <StyledText className="mt-2 text-text">Loading group details...</StyledText>
        </StyledView>
      );
    }

    if (groupError) {
      return (
        <StyledView className="flex-1 justify-center items-center bg-background p-4">
          <StyledText className="text-red-500 text-center mb-4">
            Failed to load group details: {groupError.message}
          </StyledText>
          <StyledTouchableOpacity 
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => fetchGroup()}
          >
            <StyledText className="text-white font-medium">Try Again</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      );
    }

    return (
      <>
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

        {/* Tab Navigation */}
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

        {/* Always render all contents but only display the active tab */}
        <StyledScrollView className="flex-1">
          {/* Info Tab */}
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
          
          {/* Members Tab */}
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
              <MemberList 
                members={groupMembers || []} 
                isUserAdmin={group?.isUserAdmin || false}
                onMemberPress={(member) => {
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
                }}
              />
            )}
          </StyledView>
          
          {/* Finances Tab */}
          <StyledView style={{ display: activeTab === 'finances' ? 'flex' : 'none' }} className="p-4">
            <FinancialSummary 
              groupId={groupId}
              currency={group?.currency}
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
        </StyledScrollView>
      </>
    );
  };

  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="dark" />
      {renderContent()}
    </StyledView>
  );
};

export default GroupDetailsScreen;
