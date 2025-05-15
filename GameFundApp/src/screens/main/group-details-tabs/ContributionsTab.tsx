import React from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
} from "../../../utils/StyledComponents";
import { Contribution } from "../../../models/contribution.model";
import { RootStackParamList } from "../../../navigation/types";

type GroupDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ContributionsTabProps {
  groupId: string;
  contributions: Contribution[];
  loadingContributions: boolean;
  contributionsError: Error | null;
  fetchContributions: () => void;
  currency?: string;
  navigation: GroupDetailsNavigationProp;
}

// SportyApp theme colors
const COLORS = {
  primary: "#0d7377",
};

export const ContributionsTab: React.FC<ContributionsTabProps> = ({
  groupId,
  contributions,
  loadingContributions,
  contributionsError,
  fetchContributions,
  currency = "EUR",
  navigation,
}) => {
  return (
    <StyledView className="px-4 mb-6">
      <StyledView className="flex-row justify-between items-center mb-4">
        <StyledText className="text-lg font-bold text-gray-800">
          Contributions
        </StyledText>
        <StyledTouchableOpacity
          className="bg-primary py-2 px-4 rounded-lg"
          onPress={() => navigation.navigate("AddContribution", { groupId })}
        >
          <StyledText className="text-white font-bold">Add New</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {loadingContributions ? (
        <StyledView className="items-center justify-center p-10">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <StyledText className="mt-2 text-gray-500">
            Loading contributions...
          </StyledText>
        </StyledView>
      ) : contributionsError ? (
        <StyledView className="items-center justify-center p-6">
          <StyledText className="text-red-500 mb-3">
            Failed to load contributions
          </StyledText>
          <StyledTouchableOpacity
            className="bg-primary py-2 px-4 rounded-lg"
            onPress={() => fetchContributions()}
          >
            <StyledText className="text-white font-bold">Try Again</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      ) : contributions && contributions.length > 0 ? (
        contributions.map((contribution) => (
          <StyledView
            key={contribution.id}
            className="bg-white p-4 rounded-xl shadow-sm mb-3"
          >
            <StyledView className="flex-row justify-between">
              <StyledText className="font-medium text-gray-800">
                {contribution.contributorUser?.firstName}{" "}
                {contribution.contributorUser?.lastName}
              </StyledText>
              <StyledText className="font-bold text-green-500">
                {"€"} {contribution.amount.toFixed(2)}
              </StyledText>
            </StyledView>

            <StyledView className="flex-row justify-between mt-2">
              <StyledText className="text-gray-500 text-xs">
                {contribution.description || "Monthly contribution"}
              </StyledText>
              <StyledText className="text-gray-500 text-xs">
                {new Date(contribution.contributionDate).toLocaleDateString()}
              </StyledText>
            </StyledView>
          </StyledView>
        ))
      ) : (
        <StyledView className="bg-white p-6 rounded-xl shadow-sm items-center">
          <StyledText className="text-gray-500 text-center mb-3">
            No contributions recorded yet. Add a new contribution to get
            started.
          </StyledText>
          <StyledTouchableOpacity
            className="bg-primary py-2 px-4 rounded-lg mt-2"
            onPress={() => navigation.navigate("AddContribution", { groupId })}
          >
            <StyledText className="text-white font-bold">
              Add Contribution
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      )}
    </StyledView>
  );
};
