import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { StyledView, StyledText, StyledTouchableOpacity } from "../../../utils/StyledComponents";
import { MemberList } from '../../../components';
import { GroupMember } from '../../../models/group.model';

interface MembersTabProps {
  groupId: string;
  groupMembers: GroupMember[];
  loadingMembers: boolean;
  membersError: Error | null;
  fetchMembers: () => void;
  isUserAdmin?: boolean;
  memberCount: number;
}

// SportyApp theme colors
const COLORS = {
  primary: "#0d7377",
};

export const MembersTab: React.FC<MembersTabProps> = ({
  groupId,
  groupMembers,
  loadingMembers,
  membersError,
  fetchMembers,
  isUserAdmin,
  memberCount
}) => {
  return (
    <StyledView className="px-4 mb-6">
      <StyledView className="flex-row justify-between items-center mb-4">
        <StyledText className="text-lg font-bold text-gray-800">
          {memberCount} Members
        </StyledText>
        {isUserAdmin && (
          <StyledTouchableOpacity 
            className="bg-primary py-2 px-4 rounded-lg"
            onPress={() => {
              Alert.alert("Invite Members", "This feature will be implemented soon!");
            }}
          >
            <StyledText className="text-white font-bold">
              + Invite
            </StyledText>
          </StyledTouchableOpacity>
        )}
      </StyledView>
      
      {loadingMembers ? (
        <StyledView className="items-center justify-center p-10">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <StyledText className="mt-2 text-gray-500">
            Loading members...
          </StyledText>
        </StyledView>
      ) : membersError ? (
        <StyledView className="items-center justify-center p-6">
          <StyledText className="text-red-500 mb-3">
            Failed to load members
          </StyledText>
          <StyledTouchableOpacity
            className="bg-primary py-2 px-4 rounded-lg"
            onPress={() => fetchMembers()}
          >
            <StyledText className="text-white font-bold">
              Try Again
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      ) : (
        <MemberList
          members={groupMembers || []}
          isUserAdmin={isUserAdmin || false}
          groupId={groupId}
          onMemberPress={(member) => {
            const memberName = member.user ? 
              `${member.user.firstName} ${member.user.lastName}` : 'Unknown User';
            Alert.alert(
              'Member Options', 
              `What would you like to do with ${memberName}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'View Profile', 
                  onPress: () => {
                    Alert.alert('Profile', `Navigate to ${memberName}'s profile`);
                  } 
                }
              ]
            );
          }}
        />
      )}
    </StyledView>
  );
};
