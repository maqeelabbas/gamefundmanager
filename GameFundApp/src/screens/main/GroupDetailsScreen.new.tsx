// src/screens/main/GroupDetailsScreen.new.tsx
// This file has been completely rewritten to fix React Hook errors
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import components and services
import { useApi } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/group.service';
import { expenseService } from '../../services/expense.service';
import { contributionService } from '../../services/contribution.service';
import { RootStackParamList } from '../../navigation/types';
import { MemberList } from '../../components';
import { FinancialSummary } from '../../components';
import { CreateGroupRequest } from '../../models';  // Define styles to replace the className props
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333'
  },
  inviteButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  loadingText: {
    marginTop: 10,
    color: '#333'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16
  },
  header: {
    backgroundColor: '#0284c7',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: 8
  },
  backButtonText: {
    color: 'white',
    fontSize: 20
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0284c7'
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#6b7280'
  },
  activeTabText: {
    color: '#0284c7'
  },
  scrollView: {
    flex: 1
  },
  tabContent: {
    padding: 16
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  cardText: {
    color: '#333'
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    color: '#333',
    height: 96,
    textAlignVertical: 'top'
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    color: '#6b7280',
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    width: '100%'
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  detailLabel: {
    color: '#6b7280'
  },
  detailValue: {
    color: '#333'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  primaryButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center'
  },
  leaveButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center'
  },
  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

type GroupDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetails'>;
type GroupDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GroupDetailsScreen: React.FC = () => {
  const navigation = useNavigation<GroupDetailsNavigationProp>();
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const { groupId } = route.params;
  const { user } = useAuth();
  
  // Move ALL state and hooks to the top level
  // Always declare hooks in the same order
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'finances'>('info');  const [isEditing, setIsEditing] = useState(false);
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
    // Initialize finance-related hooks using the correct services
  const {
    data: expenses,
    loading: loadingExpenses,
    error: expensesError,
    execute: fetchExpenses
  } = useApi(() => expenseService.getGroupExpenses(groupId), false);
  
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
  // Load data for the active tab when it changes
  useEffect(() => {
    // Only fetch data when tab changes, don't increment key which causes remounting
    if (activeTab === 'members' && !groupMembers?.length) {
      fetchMembers();
    } else if (activeTab === 'finances') {
      if (fetchExpenses && !expenses?.length) fetchExpenses();
      if (fetchContributions && !contributions?.length) fetchContributions();
    }
  }, [activeTab, fetchMembers, fetchExpenses, fetchContributions, groupMembers?.length, expenses?.length, contributions?.length]);

  // Separate effect for refreshing data that doesn't change component keys
  const refreshCurrentTabData = () => {
    if (activeTab === 'members') {
      fetchMembers();
    } else if (activeTab === 'finances') {
      if (fetchExpenses) fetchExpenses();
      if (fetchContributions) fetchContributions();
    }
  };

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading group details...</Text>
        </View>
      );
    }

    if (groupError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load group details: {groupError.message}
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => fetchGroup()}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Group' : (group?.name || 'Group Details')}
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
              Info
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'members' && styles.activeTab]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
              Members
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'finances' && styles.activeTab]}
            onPress={() => setActiveTab('finances')}
          >
            <Text style={[styles.tabText, activeTab === 'finances' && styles.activeTabText]}>
              Finances
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Using display: none instead of conditional rendering keeps hook order consistent */}
        <ScrollView style={styles.scrollView}>
          {/* Info Tab */}
          <View style={[styles.tabContent, { display: activeTab === 'info' ? 'flex' : 'none' }]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>
              
              {isEditing ? (
                <TextInput
                  style={styles.textArea}
                  placeholder="Group description"
                  multiline
                  value={groupForm.description || ''}
                  onChangeText={(text: string) => handleFormChange('description', text)}
                />
              ) : (
                <Text style={styles.cardText}>{group?.description}</Text>
              )}
            </View>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isEditing ? 'Edit Group Details' : 'Group Details'}
              </Text>
              
              {isEditing ? (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Group Name *</Text>
                    <TextInput 
                      style={styles.input}
                      value={groupForm.name || ''}
                      onChangeText={(text: string) => handleFormChange('name', text)}
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Target Amount</Text>
                    <TextInput 
                      style={styles.input}
                      value={groupForm.targetAmount?.toString() || '0'}
                      onChangeText={(text: string) => handleFormChange('targetAmount', text)}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Currency</Text>
                    <TextInput 
                      style={styles.input}
                      value={groupForm.currency || 'USD'}
                      onChangeText={(text: string) => handleFormChange('currency', text)}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Members</Text>
                    <Text style={styles.detailValue}>{group?.memberCount || 0}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Target Amount</Text>
                    <Text style={styles.detailValue}>
                      {group?.currency || 'USD'} {group?.targetAmount || 0}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Progress</Text>
                    <Text style={styles.detailValue}>
                      {getProgressPercentage().toFixed(0)}%
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Owner</Text>
                    <Text style={styles.detailValue}>
                      {group?.owner ? `${group.owner.firstName} ${group.owner.lastName}` : 'Unknown'}
                    </Text>
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleGroupUpdate}
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleEditToggle}
                    disabled={updateLoading}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={handleEditToggle}
                  >
                    <Text style={styles.buttonText}>Edit Group</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.leaveButton}
                    onPress={handleLeaveGroup}
                    disabled={leaveLoading}
                  >
                    {leaveLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Leave Group</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
            
            {updateError && (
              <Text style={styles.errorText}>
                {updateError.message}
              </Text>
            )}
            
            {leaveError && (
              <Text style={styles.errorText}>
                {leaveError.message}
              </Text>
            )}
          </View>
          
          {/* Members Tab */}          <View style={[styles.tabContent, { display: activeTab === 'members' ? 'flex' : 'none' }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{group?.memberCount || 0} Members</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  style={[styles.primaryButton, { marginRight: 8 }]}
                  onPress={() => fetchMembers()}
                >
                  <Text style={styles.buttonText}>Refresh</Text>
                </TouchableOpacity>
                {group?.isUserAdmin && (
                  <TouchableOpacity 
                    style={styles.inviteButton}
                    onPress={() => {
                      Alert.alert("Invite Members", "This feature will be implemented soon!");
                    }}
                  >
                    <Text style={styles.buttonText}>+ Invite</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {loadingMembers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0C6CFA" />
                <Text style={styles.loadingText}>Loading members...</Text>
              </View>
            ) : membersError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load members</Text>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => fetchMembers()}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <MemberList 
                // Removed dynamic key that causes remounting
                members={groupMembers || []} 
                isUserAdmin={group?.isUserAdmin || false}
                groupId={groupId} // Always pass groupId to ensure consistent hook initialization
                onMemberPress={(member: any) => {
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
          </View>
            {/* Finances Tab */}
          <View style={[styles.tabContent, { display: activeTab === 'finances' ? 'flex' : 'none' }]}>
            <FinancialSummary 
              // Removed dynamic key that causes remounting
              groupId={groupId}
              currency={group?.currency}
              expenses={Array.isArray(expenses) ? expenses : []}
              contributions={Array.isArray(contributions) ? contributions : []}
              loadingExpenses={loadingExpenses}
              loadingContributions={loadingContributions}
              expensesError={expensesError}
              contributionsError={contributionsError}
              fetchExpenses={fetchExpenses}
              fetchContributions={fetchContributions}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('AddContribution', { groupId })}
              >
                <Text style={styles.buttonText}>Add Contribution</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.leaveButton}
                onPress={() => navigation.navigate('AddExpense', { groupId })}
              >
                <Text style={styles.buttonText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderContent()}
    </View>
  );
};

export default GroupDetailsScreen;
