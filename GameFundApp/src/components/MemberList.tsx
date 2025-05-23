import React, { useState, useEffect, useMemo } from 'react';
import { Alert, ActivityIndicator, View, TextInput } from 'react-native';
import { StyledView, StyledText, StyledTouchableOpacity, StyledTextInput } from '../utils/StyledComponents';
import { useApi } from '../hooks';
import { groupService } from '../services';
import { GroupMember } from '../models/group.model';

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

type FilterOption = 'all' | 'active' | 'paused' | 'admin' | 'member';
type SortOption = 'name' | 'role' | 'status' | 'joinedDate';

interface MemberListProps {
  members: GroupMember[];
  isUserAdmin?: boolean;
  onMemberPress?: (member: GroupMember) => void;
  groupId?: string; // Optional to maintain backward compatibility
  onRoleChange?: (memberId: string, isAdmin: boolean) => void;
  onContributionStartMonthSelect?: (memberId: string) => void;
  onPauseMemberContribution?: (memberId: string, isPaused: boolean) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const MemberList: React.FC<MemberListProps> = ({ 
  members = [], 
  isUserAdmin = false, 
  onMemberPress,
  groupId,
  onRoleChange,
  onContributionStartMonthSelect,
  onPauseMemberContribution,
  onDeleteMember
}) => {
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Always initialize the useApi hook, even if groupId is not provided
  const {
    data: fetchedMembers,
    loading,
    error,
    execute: fetchMembers
  } = useApi(() => groupId ? groupService.getGroupMembers(groupId) : Promise.resolve([]), true);

  // Use provided members if available, otherwise use fetched ones
  const allMembers = members.length > 0 ? members : (fetchedMembers || []);
  
  // Filter members based on selected filter option and search query
  const filteredMembers = useMemo(() => {
    let result = [...allMembers];
    
    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(member => {
        const fullName = `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.toLowerCase();
        return fullName.includes(query);
      });
    }
    
    // Apply status/role filter
    switch (filterOption) {
      case 'active':
        return result.filter(member => member.isActive && !member.isContributionPaused);
      case 'paused':
        return result.filter(member => member.isContributionPaused);
      case 'admin':
        return result.filter(member => member.isAdmin);
      case 'member':
        return result.filter(member => !member.isAdmin);
      case 'all':
      default:
        return result;
    }
  }, [allMembers, filterOption, searchQuery]);
  
  // Sort members based on selected sort option
  const sortedMembers = useMemo(() => {
    const direction = sortAscending ? 1 : -1;
    
    return [...filteredMembers].sort((a, b) => {
      switch (sortOption) {
        case 'name':
          const nameA = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase();
          const nameB = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
          return nameA.localeCompare(nameB) * direction;
        
        case 'role':
          return ((a.isAdmin === b.isAdmin) ? 0 : a.isAdmin ? -1 : 1) * direction;
        
        case 'status':
          const statusA = a.isContributionPaused ? 1 : 0;
          const statusB = b.isContributionPaused ? 1 : 0;
          return (statusA - statusB) * direction;
        
        case 'joinedDate':
          const dateA = new Date(a.joinedDate).getTime();
          const dateB = new Date(b.joinedDate).getTime();
          return (dateA - dateB) * direction;
        
        default:
          return 0;
      }
    });
  }, [filteredMembers, sortOption, sortAscending]);
  
  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  
  // Get contribution status display text and color
  const getContributionStatus = (member: GroupMember) => {
    if (member.isContributionPaused) {
      return {
        text: 'Paused',
        color: COLORS.accent,
        detail: member.contributionPauseEndDate ? 
          `Until ${formatDate(member.contributionPauseEndDate)}` : 
          'Indefinitely'
      };
    } else if (!member.isActive) {
      return {
        text: 'Inactive',
        color: COLORS.danger,
        detail: ''
      };
    } else {
      return {
        text: 'Active',
        color: COLORS.success,
        detail: member.contributionStartDate ? 
          `Since ${formatDate(member.contributionStartDate)}` :
          ''
      };
    }
  };
  
  if (loading && groupId && !allMembers.length) {
    return (
      <StyledView className="items-center p-4">
        <ActivityIndicator size="small" color={COLORS.primary} />
        <StyledText className="mt-2 text-text">Loading members...</StyledText>
      </StyledView>
    );
  }
  
  if (error && groupId) {
    return (
      <StyledView className="items-center p-4">
        <StyledText className="text-danger mb-2">Failed to load members</StyledText>
        <StyledTouchableOpacity 
          className="bg-primary px-4 py-2 rounded-lg"
          onPress={() => fetchMembers()}
        >
          <StyledText className="text-white">Try Again</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    );
  }
  
  if (!allMembers || allMembers.length === 0) {
    return (
      <StyledView className="items-center p-4 bg-white rounded-xl shadow-sm">
        <StyledText className="text-lightText">No members found in this group.</StyledText>
      </StyledView>
    );
  }

  return (
    <StyledView>
      {/* Search and filter controls */}
      <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
        <StyledTextInput
          className="border border-gray-200 rounded-lg p-2 mb-2"
          placeholder="Search members..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <StyledView className="flex-row justify-between items-center">
          <StyledTouchableOpacity 
            className="flex-row items-center" 
            onPress={() => setShowFilters(!showFilters)}
          >
            <StyledText className="text-primary font-bold mr-1">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </StyledText>
          </StyledTouchableOpacity>
          
          <StyledView className="flex-row">
            <StyledText className="text-lightText mr-2">Sort:</StyledText>
            <StyledTouchableOpacity onPress={() => setSortAscending(!sortAscending)}>
              <StyledText className="text-primary">
                {sortAscending ? '↑ Asc' : '↓ Desc'}
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
        
        {showFilters && (
          <StyledView className="mt-3">
            <StyledText className="text-lightText mb-1">Filter by:</StyledText>
            <StyledView className="flex-row flex-wrap">
              {(['all', 'active', 'paused', 'admin', 'member'] as FilterOption[]).map(option => (
                <StyledTouchableOpacity
                  key={option}
                  className={`px-3 py-1 rounded-full mr-2 mb-2 ${
                    filterOption === option ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onPress={() => setFilterOption(option)}
                >
                  <StyledText
                    className={`${
                      filterOption === option ? 'text-white' : 'text-lightText'
                    } capitalize`}
                  >
                    {option}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
            
            <StyledText className="text-lightText mb-1 mt-2">Sort by:</StyledText>
            <StyledView className="flex-row flex-wrap">
              {(['name', 'role', 'status', 'joinedDate'] as SortOption[]).map(option => (
                <StyledTouchableOpacity
                  key={option}
                  className={`px-3 py-1 rounded-full mr-2 mb-2 ${
                    sortOption === option ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onPress={() => setSortOption(option)}
                >
                  <StyledText
                    className={`${
                      sortOption === option ? 'text-white' : 'text-lightText'
                    } capitalize`}
                  >
                    {option === 'joinedDate' ? 'Joined Date' : option}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          </StyledView>
        )}
      </StyledView>
      
      {/* Member count summary */}
      <StyledView className="mb-3">
        <StyledText className="text-lightText">
          Showing {sortedMembers.length} of {allMembers.length} members
        </StyledText>
      </StyledView>
      
      {/* Member list */}
      {sortedMembers.map((member: GroupMember) => {
        const status = getContributionStatus(member);
        
        return (
          <StyledView key={member.id} className="bg-white p-4 rounded-xl shadow-sm mb-3">
            <StyledView className="flex-row justify-between items-center">
              <StyledView className="flex-row items-center flex-1">
                {/* Profile Indicator Circle */}
                <StyledView className="h-10 w-10 rounded-full bg-primary items-center justify-center mr-3">
                  <StyledText className="text-white font-bold">
                    {member.user && member.user.firstName ? member.user.firstName.charAt(0).toUpperCase() : '?'}
                  </StyledText>
                </StyledView>
                
                <StyledView className="flex-1">
                  <StyledText className="text-text font-bold">
                    {member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown User'}
                  </StyledText>
                  <StyledView className="flex-row items-center">
                    <StyledView className={`h-2 w-2 rounded-full ${status.color} mr-1`} />
                    <StyledText className={`${member.isAdmin ? 'text-primary font-bold' : 'text-lightText'} text-xs`}>
                      {member.isAdmin ? 'Admin' : 'Member'} · {status.text}
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
              
              {isUserAdmin && (
                <StyledTouchableOpacity 
                  className="px-3 py-1 rounded-full border border-lightText"
                  onPress={() => {
                    Alert.alert(
                      "Member Options",
                      "What would you like to do?",
                      [
                        {
                          text: `Change to ${member.isAdmin ? 'Member' : 'Admin'}`,
                          onPress: () => onRoleChange && onRoleChange(member.id, !member.isAdmin)
                        },
                        {
                          text: `${!member.isActive ? 'Resume' : 'Pause'} Contributions`,
                          onPress: () => onPauseMemberContribution && onPauseMemberContribution(member.id, member.isActive)
                        },
                        {
                          text: "Set Contribution Start Month",
                          onPress: () => onContributionStartMonthSelect && onContributionStartMonthSelect(member.id)
                        },
                        {
                          text: "Remove Member",
                          style: "destructive",
                          onPress: () => {
                            Alert.alert(
                              "Confirm Removal",
                              `Are you sure you want to remove ${member.user?.firstName || 'this member'} from the group?`,
                              [
                                { text: "Cancel", style: "cancel" },
                                { 
                                  text: "Remove", 
                                  style: "destructive",
                                  onPress: () => onDeleteMember && onDeleteMember(member.id)
                                }
                              ]
                            );
                          }
                        },
                        { text: "Cancel", style: "cancel" }
                      ]
                    );
                  }}
                >
                  <StyledText className="text-lightText text-sm">Options</StyledText>
                </StyledTouchableOpacity>
              )}
            </StyledView>
            
            {/* Additional member details */}
            <StyledView className="mt-2 p-2 bg-background rounded-lg">
              <StyledView className="flex-row justify-between">
                <StyledText className="text-lightText text-xs">Joined: {formatDate(member.joinedDate)}</StyledText>
                {status.detail && (
                  <StyledText className="text-xs" style={{color: status.color}}>{status.detail}</StyledText>
                )}
              </StyledView>
            </StyledView>
            
            <StyledView className="flex-row mt-4">
              <StyledTouchableOpacity 
                className="mr-4"
                onPress={() => {
                  // This could open a chat or messaging interface
                  const memberName = member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown User';
                  Alert.alert('Message', `This would open a messaging interface to ${memberName}.`);
                }}
              >
                <StyledText className="text-primary text-sm">Message</StyledText>
              </StyledTouchableOpacity>
                <StyledTouchableOpacity
                onPress={() => {
                  if (onMemberPress) {
                    onMemberPress(member);
                  } else {
                    // If no custom handler is provided, show the default alert
                    const memberName = member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown User';
                    Alert.alert('Profile', `This would open ${memberName}'s profile.`);
                  }
                }}
              >
                <StyledText className="text-secondary text-sm">View Profile</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        );
      })}
    </StyledView>
  );
};
