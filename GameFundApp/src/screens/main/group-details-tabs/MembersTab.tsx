import React, { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledScrollView,
} from "../../../utils/StyledComponents";
import { MemberList } from "../../../components";
import { PauseContributionModal } from "../../../components/PauseContributionModal";
import {
  GroupMember,
  PauseMemberContributionRequest,
} from "../../../models/group.model";
import { RootStackParamList } from "../../../navigation/types";
import { useApi } from "../../../hooks";
import { groupService } from "../../../services/group.service";

type MembersTabNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

// Custom params types for the API hooks
type UpdateRoleParams = { memberId: string; isAdmin: boolean };
type PauseContributionParams = { memberId: string; isPaused: boolean };
type RemoveMemberParams = { memberId: string };

export const MembersTab: React.FC<MembersTabProps> = ({
  groupId,
  groupMembers,
  loadingMembers,
  membersError,
  fetchMembers,
  isUserAdmin,
  memberCount,
}) => {
  const navigation = useNavigation<MembersTabNavigationProp>();
  const [showManageOptions, setShowManageOptions] = useState<boolean>(false);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"all" | "admins" | "paused">(
    "all"
  );

  // Debug log to check admin status
  console.log("MembersTab - isUserAdmin:", isUserAdmin);
  console.log("MembersTab - groupId:", groupId);
  console.log("MembersTab - memberCount:", memberCount);

  // API hooks for member management
  const { execute: updateMemberRole, loading: updatingRole } = useApi<
    boolean,
    UpdateRoleParams
  >(
    (params) =>
      groupService.updateMemberRole(groupId, params.memberId, params.isAdmin),
    false
  );
  const { execute: pauseMemberContribution, loading: pausingContribution } =
    useApi<boolean, PauseMemberContributionRequest>(
      (pauseData) => groupService.pauseMemberContribution(groupId, pauseData),
      false
    );

  const { execute: resumeMemberContribution, loading: resumingContribution } =
    useApi<boolean, string>(
      (memberId) => groupService.resumeMemberContribution(groupId, memberId),
      false
    );

  const { execute: removeMember, loading: removingMember } = useApi<
    boolean,
    string
  >((memberId) => groupService.removeGroupMember(groupId, memberId), false);

  // Filter members based on active tab
  const filteredMembers = (() => {
    switch (activeTab) {
      case "admins":
        return groupMembers.filter((member) => member.isAdmin);
      case "paused":
        return groupMembers.filter((member) => member.isContributionPaused);
      default:
        return groupMembers;
    }
  })();

  // Get summary counts
  const adminCount = groupMembers.filter((member) => member.isAdmin).length;
  const pausedCount = groupMembers.filter(
    (member) => member.isContributionPaused
  ).length;

  // Handle role change
  const handleRoleChange = async (memberId: string, isAdmin: boolean) => {
    try {
      await updateMemberRole({ memberId, isAdmin });
      fetchMembers(); // Refresh member list
      Alert.alert("Success", `Member role updated successfully`);
    } catch (error) {
      console.error("Failed to update member role:", error);
      Alert.alert("Error", "Failed to update member role");
    }
  };

  // Handle pausing contribution
  const handlePauseContribution = async (
    memberId: string,
    isPaused: boolean
  ) => {
    try {
      if (isPaused) {
        // If currently active, we want to pause it
        const member = groupMembers.find((m) => m.id === memberId);
        if (member) {
          setSelectedMember(member);
          setShowPauseModal(true);
        }
      } else {
        // If currently paused, we want to resume it
        await resumeMemberContribution(memberId);
        fetchMembers(); // Refresh member list
        Alert.alert("Success", "Member contribution resumed successfully");
      }
    } catch (error) {
      console.error("Failed to update contribution status:", error);
      Alert.alert("Error", "Failed to update contribution status");
    }
  };
  // Handle confirming pause dates
  const handleConfirmPause = async (startDate: Date, endDate: Date) => {
    if (!selectedMember) return;

    try {
      await pauseMemberContribution({
        memberId: selectedMember.id,
        pauseStartDate: startDate,
        pauseEndDate: endDate,
      });

      fetchMembers(); // Refresh member list
      Alert.alert("Success", "Member contribution paused successfully");
    } catch (error) {
      console.error("Failed to pause contribution:", error);
      Alert.alert("Error", "Failed to pause member contribution");
    } finally {
      setShowPauseModal(false);
      setSelectedMember(null);
    }
  };

  // Handle member removal
  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
      fetchMembers(); // Refresh member list
      Alert.alert("Success", "Member removed from group");
    } catch (error) {
      console.error("Failed to remove member:", error);
      Alert.alert("Error", "Failed to remove member from group");
    }
  };

  const getMemberName = (member: GroupMember | null) => {
    if (!member || !member.user) return "Member";
    return `${member.user.firstName} ${member.user.lastName}`;
  };

  return (
    <StyledScrollView className="flex-1">
      <StyledView className="px-4 mb-6">
        <StyledView className="flex-row justify-between items-center mb-4">
          <StyledText className="text-lg font-bold text-gray-800">
            {memberCount} Members
          </StyledText>
          <StyledTouchableOpacity
            className="bg-primary py-2 px-4 rounded-lg"
            onPress={() => {
              console.log(
                "Add Member button clicked, navigating to AddGroupMember with groupId:",
                groupId
              );
              // Use a timeout to prevent potential infinite update loops
              setTimeout(() => {
                navigation.navigate("AddGroupMember", { groupId });
              }, 0);
            }}
          >
            <StyledText className="text-white font-bold">
              + Add Member
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
        {/* Tab navigation */}
        <StyledView className="flex-row mb-4 bg-white rounded-xl overflow-hidden">
          {[
            { id: "all", label: `All (${memberCount})` },
            { id: "admins", label: `Admins (${adminCount})` },
            { id: "paused", label: `Paused (${pausedCount})` },
          ].map((tab) => (
            <StyledTouchableOpacity
              key={tab.id}
              className={`flex-1 py-3 ${
                activeTab === tab.id ? "bg-primary" : "bg-white"
              }`}
              onPress={() =>
                setActiveTab(tab.id as "all" | "admins" | "paused")
              }
            >
              <StyledText
                className={`text-center ${
                  activeTab === tab.id
                    ? "text-white font-bold"
                    : "text-gray-600"
                }`}
              >
                {tab.label}
              </StyledText>
            </StyledTouchableOpacity>
          ))}
        </StyledView>
        {loadingMembers ||
        updatingRole ||
        pausingContribution ||
        resumingContribution ||
        removingMember ? (
          <StyledView className="items-center justify-center p-10">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <StyledText className="mt-2 text-gray-500">
              {loadingMembers ? "Loading members..." : "Updating..."}
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
          <>
            {filteredMembers.length > 0 ? (
              <MemberList
                members={filteredMembers}
                isUserAdmin={isUserAdmin || false}
                groupId={groupId}
                onMemberPress={(member) => {
                  if (isUserAdmin) {
                    setSelectedMember(member);
                    setShowManageOptions(true);
                  } else {
                    navigation.navigate("UserDetails", {
                      userId: member.user.id,
                    });
                  }
                }}
                onRoleChange={handleRoleChange}
                onPauseMemberContribution={handlePauseContribution}
                onDeleteMember={handleRemoveMember}
              />
            ) : (
              <StyledView className="bg-white p-6 rounded-xl shadow-sm items-center">
                <StyledText className="text-lightText text-center">
                  {activeTab === "all"
                    ? "No members found in this group."
                    : activeTab === "admins"
                    ? "No admin members found."
                    : "No members with paused contributions found."}
                </StyledText>
              </StyledView>
            )}
          </>
        )}
        {/* Member Stats Summary */}
        {!loadingMembers && !membersError && groupMembers.length > 0 && (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm mt-6">
            <StyledText className="font-bold mb-2">
              Group Member Stats
            </StyledText>
            <StyledView className="flex-row justify-between">
              <StyledView className="items-center p-2">
                <StyledText className="text-xl font-bold">
                  {memberCount}
                </StyledText>
                <StyledText className="text-xs text-lightText">
                  Total
                </StyledText>
              </StyledView>
              <StyledView className="items-center p-2">
                <StyledText className="text-xl font-bold">
                  {adminCount}
                </StyledText>
                <StyledText className="text-xs text-lightText">
                  Admins
                </StyledText>
              </StyledView>
              <StyledView className="items-center p-2">
                <StyledText className="text-xl font-bold">
                  {memberCount - pausedCount}
                </StyledText>
                <StyledText className="text-xs text-lightText">
                  Active
                </StyledText>
              </StyledView>
              <StyledView className="items-center p-2">
                <StyledText className="text-xl font-bold">
                  {pausedCount}
                </StyledText>
                <StyledText className="text-xs text-lightText">
                  Paused
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>
        )}
      </StyledView>
      {/* Pause Contribution Modal */}
      <PauseContributionModal
        visible={showPauseModal}
        onClose={() => {
          setShowPauseModal(false);
          setSelectedMember(null);
        }}
        onConfirm={handleConfirmPause}
        loading={pausingContribution}
        memberName={selectedMember ? getMemberName(selectedMember) : "member"}
      />
    </StyledScrollView>
  );
};
