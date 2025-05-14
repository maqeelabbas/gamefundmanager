import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import { StyledView, StyledText, StyledTouchableOpacity } from '../utils/StyledComponents';
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
  // Always initialize the useApi hook, even if groupId is not provided
  const {
    data: fetchedMembers,
    loading,
    error,
    execute: fetchMembers
  } = useApi(() => groupId ? groupService.getGroupMembers(groupId) : Promise.resolve([]), true);

  // Use provided members if available, otherwise use fetched ones
  const displayMembers = members.length > 0 ? members : (fetchedMembers || []);
  
  if (loading && groupId && !displayMembers.length) {
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
  
  if (!displayMembers || displayMembers.length === 0) {
    return (
      <StyledView className="items-center p-4 bg-white rounded-xl shadow-sm">
        <StyledText className="text-lightText">No members found in this group.</StyledText>
      </StyledView>
    );
  }

  return (
    <StyledView>
      {displayMembers.map((member: GroupMember) => (
        <StyledView key={member.id} className="bg-white p-4 rounded-xl shadow-sm mb-3">
          <StyledView className="flex-row justify-between items-center">
            <StyledView className="flex-row items-center">
              {/* Profile Indicator Circle */}
              <StyledView className="h-10 w-10 rounded-full bg-primary items-center justify-center mr-3">
                <StyledText className="text-white font-bold">
                  {member.user && member.user.firstName ? member.user.firstName.charAt(0).toUpperCase() : '?'}
                </StyledText>
              </StyledView>
              
              <StyledView>
                <StyledText className="text-text font-bold">
                  {member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown User'}
                </StyledText>
                <StyledView className="flex-row items-center">
                  <StyledView className={`h-2 w-2 rounded-full ${!member.isActive ? 'bg-danger' : 'bg-success'} mr-1`} />
                  <StyledText className={`${member.isAdmin ? 'text-primary font-bold' : 'text-lightText'} text-xs`}>
                    {member.isAdmin ? 'Admin' : 'Member'} · {member.isActive ? 'Active' : 'Paused'}
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
      ))}
    </StyledView>
  );
};
