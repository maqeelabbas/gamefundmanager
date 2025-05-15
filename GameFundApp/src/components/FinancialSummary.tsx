import React from "react";
import { Alert } from "react-native";
import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledImage,
} from "../utils/StyledComponents";
import { useApi } from "../hooks";
import { expenseService, contributionService } from "../services";
import { Expense } from "../models/expense.model";
import { Contribution } from "../models/contribution.model";

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
  lightText: "#5A5A5A", // Light text
};

interface FinancialSummaryProps {
  groupId: string;
  currency?: string;
  onViewAllExpenses?: () => void;
  onViewAllContributions?: () => void;
  // Optional props for pre-fetched data
  expenses?: Expense[];
  contributions?: Contribution[];
  loadingExpenses?: boolean;
  loadingContributions?: boolean;
  expensesError?: Error | null;
  contributionsError?: Error | null;
  fetchExpenses?: () => void;
  fetchContributions?: () => void;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  groupId,
  currency = "EUR",
  onViewAllExpenses,
  onViewAllContributions,
  // Use provided props if available
  expenses: providedExpenses,
  contributions: providedContributions,
  loadingExpenses: providedLoadingExpenses,
  loadingContributions: providedLoadingContributions,
  expensesError: providedExpensesError,
  contributionsError: providedContributionsError,
  fetchExpenses: providedFetchExpenses,
  fetchContributions: providedFetchContributions,
}) => {
  // ALWAYS initialize hooks, regardless of whether we have provided data
  // This ensures consistent hook order across renders
  const {
    data: fetchedExpenses = [] as Expense[],
    loading: expensesLoading,
    error: expensesErr,
    execute: fetchExpensesLocal,
  } = useApi<Expense[]>(
    () => expenseService.getGroupExpenses(groupId),
    !providedExpenses // Only auto-execute if no expenses provided
  );

  const {
    data: fetchedContributions = [] as Contribution[],
    loading: contributionsLoading,
    error: contributionsErr,
    execute: fetchContributionsLocal,
  } = useApi<Contribution[]>(
    () => contributionService.getGroupContributions(groupId),
    !providedContributions // Only auto-execute if no contributions provided
  );

  // Use provided values or fallback to fetched values
  const expenses = providedExpenses || fetchedExpenses || [];
  const contributions = providedContributions || fetchedContributions || [];
  const loadingExpenses =
    providedLoadingExpenses !== undefined
      ? providedLoadingExpenses
      : expensesLoading;
  const loadingContributions =
    providedLoadingContributions !== undefined
      ? providedLoadingContributions
      : contributionsLoading;
  const expensesError = providedExpensesError || expensesErr;
  const contributionsError = providedContributionsError || contributionsErr;
  const fetchExpenses = providedFetchExpenses || fetchExpensesLocal;
  const fetchContributions =
    providedFetchContributions || fetchContributionsLocal;

  const totalExpenses =
    expenses && Array.isArray(expenses)
      ? expenses.reduce(
          (sum: number, expense: Expense) => sum + expense.amount,
          0
        )
      : 0;

  const totalContributions =
    contributions && Array.isArray(contributions)
      ? contributions.reduce(
          (sum: number, contribution: Contribution) =>
            sum + contribution.amount,
          0
        )
      : 0;
  const balance = totalContributions - totalExpenses;

  return (
    <StyledView>
      {/* Financial Summary */}
      <StyledView className="flex-row justify-between mb-6">
        <StyledView className="bg-white p-4 rounded-xl shadow-sm w-[31%]">
          <StyledText className="text-text text-xs mb-1">Collection</StyledText>
          <StyledText className="text-success text-lg font-bold">
            {totalContributions.toFixed(2)}
          </StyledText>
        </StyledView>

        <StyledView className="bg-white p-4 rounded-xl shadow-sm w-[31%]">
          <StyledText className="text-text text-xs mb-1">Expenses</StyledText>
          <StyledText className="text-danger text-lg font-bold">
            {totalExpenses.toFixed(2)}
          </StyledText>
        </StyledView>

        <StyledView className="bg-white p-4 rounded-xl shadow-sm w-[31%]">
          <StyledText className="text-text text-xs mb-1">Balance</StyledText>
          <StyledText
            className={`${
              balance >= 0 ? "text-primary" : "text-red-500"
            } text-lg font-bold`}
          >
            {balance.toFixed(2)}
          </StyledText>
        </StyledView>
      </StyledView>
      {/* Recent Expenses */}
      <StyledView className="mb-6">
        <StyledText className="text-lg font-bold text-text mb-3">
          Recent Expenses
        </StyledText>

        {loadingExpenses ? (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-gray-500">
              Loading expenses...
            </StyledText>
          </StyledView>
        ) : expensesError ? (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-red-500 mb-2">
              Failed to load expenses
            </StyledText>
            <StyledTouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={() => fetchExpenses()}
            >
              <StyledText className="text-white">Try Again</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        ) : expenses && expenses.length > 0 ? (
          expenses.slice(0, 3).map((expense: Expense) => (
            <StyledView
              key={expense.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-3"
            >
              <StyledView className="flex-row justify-between">
                <StyledText className="text-text font-bold">
                  {expense.title}
                </StyledText>
                <StyledText className="text-red-500 font-bold">
                  {"€"} {expense.amount.toFixed(2)}
                </StyledText>
              </StyledView>
              <StyledView className="flex-row justify-between mt-2">
                <StyledText className="text-gray-500 text-xs">
                  Paid by:
                  {expense.paidByUser
                    ? `${expense.paidByUser.firstName} ${expense.paidByUser.lastName}`
                    : "Unknown"}
                </StyledText>
                <StyledText className="text-gray-500 text-xs">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </StyledText>
              </StyledView>
            </StyledView>
          ))
        ) : (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-gray-500">
              No expenses recorded
            </StyledText>
          </StyledView>
        )}

        <StyledTouchableOpacity
          className="mb-3"
          onPress={() => {
            if (onViewAllExpenses) {
              onViewAllExpenses();
            } else {
              Alert.alert(
                "View All Expenses",
                "This would open the full expenses list."
              );
            }
          }}
        >
          <StyledText className="text-primary text-center">
            View All Expenses
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
      {/* Recent Contributions */}
      <StyledView className="mb-4">
        <StyledText className="text-lg font-bold text-text mb-3">
          Recent Contributions
        </StyledText>

        {loadingContributions ? (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-gray-500">
              Loading contributions...
            </StyledText>
          </StyledView>
        ) : contributionsError ? (
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-red-500 mb-2">
              Failed to load contributions
            </StyledText>
            <StyledTouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={() => fetchContributions()}
            >
              <StyledText className="text-white">Try Again</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        ) : contributions && contributions.length > 0 ? (
          contributions.slice(0, 3).map((contribution: Contribution) => (
            <StyledView
              key={contribution.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-3"
            >
              <StyledView className="flex-row justify-between">
                <StyledText className="text-text font-bold">
                  {contribution.contributorUser
                    ? `${contribution.contributorUser.firstName} ${contribution.contributorUser.lastName}`
                    : "Unknown User"}
                </StyledText>
                <StyledText className="text-green-600 font-bold">
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
          <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
            <StyledText className="text-gray-500">
              No contributions recorded
            </StyledText>
          </StyledView>
        )}

        <StyledTouchableOpacity
          className="mb-3"
          onPress={() => {
            if (onViewAllContributions) {
              onViewAllContributions();
            } else {
              Alert.alert(
                "View All Contributions",
                "This would open the full contributions list."
              );
            }
          }}
        >
          <StyledText className="text-primary text-center">
            View All Contributions
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
