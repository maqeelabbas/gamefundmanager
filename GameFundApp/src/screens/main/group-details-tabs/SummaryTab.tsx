import React from "react";
import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
} from "../../../utils/StyledComponents";
import { FinancialSummary } from "../../../components";
import { Contribution } from "../../../models/contribution.model";
import { Expense } from "../../../models/expense.model";
import { Group } from "../../../models/group.model";

interface SummaryTabProps {
  groupId: string;
  group: Group | null;
  expenses: Expense[];
  contributions: Contribution[];
  loadingExpenses: boolean;
  loadingContributions: boolean;
  expensesError: Error | null;
  contributionsError: Error | null;
  fetchExpenses: () => void;
  fetchContributions: () => void;
  onViewAllExpenses: () => void;
  onViewAllContributions: () => void;
  handleEditToggle: () => void;
  handleLeaveGroup: () => void;
  getTotalContributions: () => number;
  getProgressPercentage: () => number;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  groupId,
  group,
  expenses,
  contributions,
  loadingExpenses,
  loadingContributions,
  expensesError,
  contributionsError,
  fetchExpenses,
  fetchContributions,
  onViewAllExpenses,
  onViewAllContributions,
  handleEditToggle,
  handleLeaveGroup,
  getTotalContributions,
  getProgressPercentage,
}) => {
  // Calculate the total contributions for the progress bar
  const totalContributionsAmount =
    contributions && Array.isArray(contributions)
      ? contributions.reduce(
          (sum, contribution) => sum + contribution.amount,
          0
        )
      : getTotalContributions();
  // Use the group's currency or default to EUR
  const groupCurrency = group?.currency || "EUR";

  // Calculate remaining amount
  const targetAmount = group?.targetAmount || 0;
  const remainingAmount = targetAmount - totalContributionsAmount;

  return (
    <StyledView className="px-4 mb-6">
      {/* Progress Bar Section */}
      <StyledView className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <StyledView className="flex-row justify-between mb-2">
          <StyledText className="text-lg font-bold text-gray-800">
            Group Progress
          </StyledText>
          <StyledView className="flex-row items-center">
            <StyledText className="text-gray-500 mr-2">Members:</StyledText>
            <StyledText className="font-medium">
              {group?.memberCount || 0}
            </StyledText>
          </StyledView>
        </StyledView>
        <StyledText className="text-gray-700 mb-2">
          {"€"} {totalContributionsAmount.toFixed(2)} of{" "}
          {targetAmount.toFixed(2)} {"€"} collected
        </StyledText>
        <StyledView className="bg-gray-200 h-6 rounded-full overflow-hidden mb-1">
          <StyledView
            className="bg-primary h-full rounded-full"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </StyledView>
        <StyledView className="flex-row justify-between">
          <StyledText className="text-gray-500 text-sm">
            {getProgressPercentage().toFixed(2)}% Complete
          </StyledText>
          <StyledText className="text-gray-500 text-sm">
            {"€"} {remainingAmount.toFixed(2)} remaining
          </StyledText>
        </StyledView>
      </StyledView>

      <FinancialSummary
        groupId={groupId}
        currency={groupCurrency}
        expenses={Array.isArray(expenses) ? expenses : []}
        contributions={Array.isArray(contributions) ? contributions : []}
        loadingExpenses={loadingExpenses}
        loadingContributions={loadingContributions}
        expensesError={expensesError}
        contributionsError={contributionsError}
        fetchExpenses={fetchExpenses}
        fetchContributions={fetchContributions}
        onViewAllExpenses={onViewAllExpenses}
        onViewAllContributions={onViewAllContributions}
      />

      <StyledView className="mt-6">
        <StyledView className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <StyledText className="text-lg font-bold text-gray-800 mb-2">
            Group Information
          </StyledText>

          <StyledView className="flex-row justify-between mb-1">
            <StyledText className="text-gray-500">Members</StyledText>
            <StyledText className="font-medium">
              {group?.memberCount || 0}
            </StyledText>
          </StyledView>

          <StyledView className="flex-row justify-between mb-1">
            <StyledText className="text-gray-500">Target Amount</StyledText>
            <StyledText className="font-medium">
              {"€"} {group?.targetAmount || 0}
            </StyledText>
          </StyledView>

          <StyledView className="flex-row justify-between mb-1">
            <StyledText className="text-gray-500">Progress</StyledText>
            <StyledText className="font-medium">
              {getProgressPercentage().toFixed(2)}%
            </StyledText>
          </StyledView>

          {group?.contributionDueDay && (
            <StyledView className="flex-row justify-between mb-1">
              <StyledText className="text-gray-500">Monthly Due Day</StyledText>
              <StyledText className="font-medium">
                {group.contributionDueDayFormatted ||
                  `${group.contributionDueDay}`}
              </StyledText>
            </StyledView>
          )}

          {group?.nextContributionDueDate && (
            <StyledView className="flex-row justify-between mb-1">
              <StyledText className="text-gray-500">Next Due Date</StyledText>
              <StyledText className="font-medium">
                {new Date(group.nextContributionDueDate).toLocaleDateString()}
              </StyledText>
            </StyledView>
          )}

          <StyledView className="flex-row justify-between">
            <StyledText className="text-gray-500">Owner</StyledText>
            <StyledText className="font-medium">
              {group?.owner
                ? `${group.owner.firstName} ${group.owner.lastName}`
                : "Unknown"}
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <StyledText className="text-lg font-bold text-gray-800 mb-2">
            About
          </StyledText>
          <StyledText className="text-gray-700">
            {group?.description || "No description available"}
          </StyledText>
        </StyledView>
      </StyledView>

      <StyledView className="flex-row justify-between mt-3">
        <StyledTouchableOpacity
          className="bg-primary py-2 px-6 rounded-lg flex-1 mr-2 items-center"
          onPress={handleEditToggle}
        >
          <StyledText className="text-white font-bold">Edit Group</StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          className="bg-red-500 py-2 px-6 rounded-lg flex-1 ml-2 items-center"
          onPress={handleLeaveGroup}
        >
          <StyledText className="text-white font-bold">Leave Group</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
