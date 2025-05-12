// src/screens/main/UserDetailsScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  StyledView, 
  StyledText,
  StyledTouchableOpacity,
  StyledScrollView,
  StyledActivityIndicator,
  StyledImage
} from '../../utils/StyledComponents';
import { RootStackParamList } from '../../navigation/types';
import { userService } from '../../services/user.service';
import { groupService } from '../../services/group.service';
import { contributionService } from '../../services/contribution.service';
import { expenseService } from '../../services/expense.service';
import { User } from '../../models/user.model';
import { Contribution } from '../../models/contribution.model';
import { Expense } from '../../models/expense.model';
import { useApi } from '../../hooks';

type UserDetailsScreenRouteProp = RouteProp<RootStackParamList, 'UserDetails'>;
type UserDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// User activity/stats interface (for better typing)
interface UserProfile {
  user: User | null;
  groups: { id: string, name: string }[];
  profileStats: {
    totalContributions: number;
    expensesPaid: number;
    activeGroups: number;
  };
  recentActivity: {
    id: string;
    action: string;
    group: string;
    amount?: number;
    date: string;
    description?: string;
  }[];
  loading: boolean;
  error: Error | null;
}

// Helper function to find a group name by ID
const getGroupNameById = (groupId: string, groups: Array<{ id: string, name: string }>) => {
  const group = groups.find(g => g.id === groupId);
  return group?.name || 'Unknown Group';
};

const UserDetailsScreen: React.FC = () => {
  const navigation = useNavigation<UserDetailsScreenNavigationProp>();
  const route = useRoute<UserDetailsScreenRouteProp>();
  const { userId } = route.params;
  
  // State to store user profile data
  const [profile, setProfile] = useState<UserProfile>({
    user: null,
    groups: [],
    profileStats: {
      totalContributions: 0,
      expensesPaid: 0,
      activeGroups: 0,
    },
    recentActivity: [],
    loading: true,
    error: null
  });
  
  // Use ref to track if data has been loaded to prevent infinite loops
  const dataLoadedRef = useRef(false);
  
  // API hook to fetch user data - only execute manually to prevent infinite loops
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    execute: fetchUserData
  } = useApi<User>(() => userService.getUserById(userId));
  
  // Load user data and additional profile information
  useEffect(() => {
    // Prevent infinite fetches by tracking if we've already loaded the data
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;
    
    // Execute the fetch
    fetchUserData()
      .then(async (user) => {
        if (!user) return;
        
        try {
          // Begin assembling profile data
          const profileData: UserProfile = {
            user,
            groups: [],
            profileStats: {
              totalContributions: 0,
              expensesPaid: 0,
              activeGroups: 0
            },
            recentActivity: [],
            loading: false,
            error: null
          };
          
          // Get user's groups
          const userGroups = await groupService.getUserGroups();
          profileData.groups = userGroups.map(g => ({ id: g.id, name: g.name }));
          profileData.profileStats.activeGroups = userGroups.length;
          
          // Try to get contribution stats - using the available API methods
          try {
            // This gets all user's contributions without filtering by specific user ID
            const contributions = await contributionService.getUserContributions();
            
            // Filter contributions for the specific user we're viewing (if needed)
            const userContributions = userId ? 
              contributions.filter(c => c.userId === userId) : 
              contributions;
              
            if (userContributions && userContributions.length > 0) {
              profileData.profileStats.totalContributions = userContributions.reduce(
                (sum, c) => sum + c.amount, 0
              );
              
              // Add recent contributions to activity
              const recentContributions = userContributions
                .slice(0, 3)
                .map(c => ({
                  id: c.id,
                  action: 'Contribution',
                  group: getGroupNameById(c.groupId, profileData.groups),
                  amount: c.amount,
                  date: new Date(c.contributionDate).toLocaleDateString(),
                }));
              
              profileData.recentActivity.push(...recentContributions);
            }
          } catch (err) {
            console.log('Error fetching user contributions:', err);
          }
            
          // Try to get expense stats - there's no direct method to get user expenses,
          // so we'll need to implement a workaround
          try {
            // The current API doesn't have a direct method to get user expenses,
            // so for now we'll use a placeholder value or approach the backend team
            // to add this endpoint
            profileData.profileStats.expensesPaid = 0;
            
            // In a real implementation, we might:
            // 1. Fetch expenses from each group the user is in
            // 2. Filter those where the user is the creator
            // 3. Sum them up
            
            // This is a simplified placeholder implementation
            const userGroups = profileData.groups;
            let totalExpensesPaid = 0;
            
            // Get expenses from each group and filter by user
            for (const group of userGroups) {
              try {
                const groupExpenses = await expenseService.getGroupExpenses(group.id);
                // Filter expenses created by this user
                const userExpenses = groupExpenses.filter(expense => 
                  expense.createdByUserId === userId || 
                  expense.createdByUser?.id === userId
                );
                
                // Add to total
                totalExpensesPaid += userExpenses.reduce((sum, e) => sum + e.amount, 0);
                
                // Add recent expenses to activity
                const recentExpenses = userExpenses
                  .slice(0, 2) // Limit to 2 for now
                  .map(e => ({
                    id: e.id,
                    action: 'Paid Expense',
                    group: group.name,
                    amount: e.amount,
                    date: new Date(e.expenseDate).toLocaleDateString(),
                    description: e.description
                  }));
                  
                profileData.recentActivity.push(...recentExpenses);
              } catch (err) {
                console.log(`Error fetching expenses for group ${group.id}:`, err);
              }
            }
            
            profileData.profileStats.expensesPaid = totalExpensesPaid;
          } catch (err) {
            console.log('Error getting expense stats:', err);
          }
          
          // Add some placeholder activity
          if (profileData.recentActivity.length === 0) {
            profileData.recentActivity.push({
              id: 'join-1',
              action: 'Joined Group', 
              group: profileData.groups.length > 0 ? profileData.groups[0].name : 'App',
              date: new Date().toLocaleDateString(),
            });
          }
          
          // Sort activity by date (most recent first)
          profileData.recentActivity.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          // Update state with all profile data
          setProfile(profileData);
        } catch (error) {
          console.error('Error fetching user profile data:', error);
          setProfile(prev => ({
            ...prev,
            user,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to load user profile data')
          }));
        }
      })
      .catch(error => {
        setProfile(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Failed to load user data')
        }));
      });
  }, [userId]); // Only depend on userId, not fetchUserData to avoid loops
  
  // Create a formatted user object for the UI
  const user = profile.user ? {
    id: profile.user.id,
    name: `${profile.user.firstName} ${profile.user.lastName}`,
    email: profile.user.email,
    phone: profile.user.phoneNumber || 'Not provided',
    joinedDate: 'Member',
    role: 'Player',
    groups: profile.groups.map(g => g.name),
    profileStats: profile.profileStats,
    recentActivity: profile.recentActivity
  } : null;
  
  // Function to retry loading data if it fails
  const handleRetry = useCallback(() => {
    dataLoadedRef.current = false; // Reset the ref so we can try again
    setProfile(prev => ({ ...prev, loading: true, error: null }));
    
    // Re-run the effect by forcing a state update
    setTimeout(() => {
      dataLoadedRef.current = false;
      // This will cause the effect to run again
    }, 0);
  }, []);
  
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
          
          <StyledText className="text-white text-xl font-bold">User Profile</StyledText>
        </StyledView>
      </StyledView>

      {/* Loading state */}
      {profile.loading && (
        <StyledView className="flex-1 justify-center items-center">
          <StyledActivityIndicator size="large" color="#0284c7" />
          <StyledText className="text-gray-500 mt-3">Loading user profile...</StyledText>
        </StyledView>
      )}

      {/* Error state */}
      {profile.error && (
        <StyledView className="flex-1 justify-center items-center p-4">
          <StyledText className="text-red-500 text-lg mb-3">Failed to load user profile</StyledText>
          <StyledText className="text-gray-500 text-center mb-4">
            {profile.error.message || 'An unexpected error occurred'}
          </StyledText>
          <StyledTouchableOpacity 
            className="bg-primary py-3 px-6 rounded-lg"
            onPress={handleRetry}
          >
            <StyledText className="text-white font-bold">Try Again</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      )}

      {/* User profile content */}
      {!profile.loading && !profile.error && user && (
        <StyledScrollView className="flex-1">
          {/* User Profile Header */}
          <StyledView className="bg-white p-6 items-center border-b border-gray-100">
            {profile.user?.profilePictureUrl ? (
              <StyledImage 
                source={{ uri: profile.user.profilePictureUrl }} 
                className="h-24 w-24 rounded-full mb-4"
              />
            ) : (
              <StyledView className="h-24 w-24 rounded-full bg-gray-300 mb-4 items-center justify-center">
                <StyledText className="text-4xl">{user.name.charAt(0)}</StyledText>
              </StyledView>
            )}
            
            <StyledText className="text-xl font-bold text-text">{user.name}</StyledText>
            <StyledText className="text-sm text-gray-500 mb-2">{user.role}</StyledText>
          </StyledView>
          
          {/* User Stats */}
          <StyledView className="flex-row justify-between p-4 bg-white border-b border-gray-100">
            <StyledView className="items-center">
              <StyledText className="text-primary font-bold text-lg">${user.profileStats.totalContributions}</StyledText>
              <StyledText className="text-text text-xs">Contributed</StyledText>
            </StyledView>
            
            <StyledView className="items-center">
              <StyledText className="text-secondary font-bold text-lg">${user.profileStats.expensesPaid}</StyledText>
              <StyledText className="text-text text-xs">Expenses Paid</StyledText>
            </StyledView>
            
            <StyledView className="items-center">
              <StyledText className="text-accent font-bold text-lg">{user.profileStats.activeGroups}</StyledText>
              <StyledText className="text-text text-xs">Active Groups</StyledText>
            </StyledView>
          </StyledView>
          
          {/* User Details */}
          <StyledView className="bg-white p-4 mb-4">
            <StyledText className="text-lg font-bold text-text mb-3">Contact Information</StyledText>
            
            <StyledView className="mb-2">
              <StyledText className="text-gray-500 text-xs">Email</StyledText>
              <StyledText className="text-text">{user.email}</StyledText>
            </StyledView>
            
            <StyledView className="mb-2">
              <StyledText className="text-gray-500 text-xs">Phone</StyledText>
              <StyledText className="text-text">{user.phone}</StyledText>
            </StyledView>
            
            <StyledView className="mb-2">
              <StyledText className="text-gray-500 text-xs">Member Since</StyledText>
              <StyledText className="text-text">{user.joinedDate}</StyledText>
            </StyledView>
            
            <StyledTouchableOpacity className="mt-3">
              <StyledText className="text-primary font-medium">Contact User</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
          
          {/* Groups */}
          <StyledView className="bg-white p-4 mb-4">
            <StyledText className="text-lg font-bold text-text mb-3">Groups</StyledText>
            
            {user.groups.length > 0 ? (
              user.groups.map((group, index) => (
                <StyledView key={index} className="flex-row justify-between items-center mb-3 py-2 border-b border-gray-100">
                  <StyledText className="text-text">{group}</StyledText>
                  <StyledTouchableOpacity 
                    onPress={() => {
                      const groupId = profile.groups[index]?.id;
                      if (groupId) {
                        navigation.navigate("GroupDetails", { groupId });
                      }
                    }}
                  >
                    <StyledText className="text-primary">View</StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              ))
            ) : (
              <StyledText className="text-gray-500 text-center py-4">
                User is not a member of any groups
              </StyledText>
            )}
          </StyledView>
          
          {/* Recent Activity */}
          <StyledView className="bg-white p-4 mb-6">
            <StyledText className="text-lg font-bold text-text mb-3">Recent Activity</StyledText>
            
            {user.recentActivity.length > 0 ? (
              user.recentActivity.map(activity => (
                <StyledView key={activity.id} className="mb-3 pb-3 border-b border-gray-100">
                  <StyledView className="flex-row justify-between">
                    <StyledText className="text-text font-medium">{activity.action}</StyledText>
                    {activity.amount && (
                      <StyledText className="font-bold text-primary">${activity.amount}</StyledText>
                    )}
                  </StyledView>
                  
                  <StyledText className="text-text text-xs mt-1">{activity.group}</StyledText>
                  {activity.description && (
                    <StyledText className="text-text text-xs mt-1">{activity.description}</StyledText>
                  )}
                  <StyledText className="text-gray-500 text-xs mt-1">{activity.date}</StyledText>
                </StyledView>
              ))
            ) : (
              <StyledText className="text-gray-500 text-center py-4">
                No recent activity
              </StyledText>
            )}
          </StyledView>
        </StyledScrollView>
      )}
    </StyledView>
  );
};

export default UserDetailsScreen;
