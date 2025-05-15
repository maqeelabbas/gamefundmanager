import React from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  StyledView,
  StyledText,
  StyledTouchableOpacity,
} from "../../../utils/StyledComponents";
import { Expense } from "../../../models/expense.model";
import { RootStackParamList } from "../../../navigation/types";

type GroupDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ExpensesTabProps {
  groupId: string;
  expenses: Expense[];
  loadingExpenses: boolean;
  expensesError: Error | null;
  fetchExpenses: () => void;
  currency?: string;
  navigation: GroupDetailsNavigationProp;
}

// SportyApp theme colors
const COLORS = {
  primary: "#0d7377",
};

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  groupId,
  expenses,
  loadingExpenses,
  expensesError,
  fetchExpenses,
  currency = "EUR",
  navigation,
}) => {
  return (
    <StyledView className="px-4 mb-6">
      <StyledView className="flex-row justify-between items-center mb-4">
        <StyledText className="text-lg font-bold text-gray-800">
          Expenses
        </StyledText>
        <StyledTouchableOpacity
          className="bg-primary py-2 px-4 rounded-lg"
          onPress={() => navigation.navigate("AddExpense", { groupId })}
        >
          <StyledText className="text-white font-bold">Add New</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {loadingExpenses ? (
        <StyledView className="items-center justify-center p-10">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <StyledText className="mt-2 text-gray-500">
            Loading expenses...
          </StyledText>
        </StyledView>
      ) : expensesError ? (
        <StyledView className="items-center justify-center p-6">
          <StyledText className="text-red-500 mb-3">
            Failed to load expenses
          </StyledText>
          <StyledTouchableOpacity
            className="bg-primary py-2 px-4 rounded-lg"
            onPress={() => fetchExpenses()}
          >
            <StyledText className="text-white font-bold">Try Again</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      ) : expenses && expenses.length > 0 ? (
        expenses.map((expense) => (
          <StyledView
            key={expense.id}
            className="bg-white p-4 rounded-xl shadow-sm mb-3"
          >
            <StyledView className="flex-row justify-between">
              <StyledText className="font-bold text-gray-800">
                {expense.title}
              </StyledText>
              <StyledText className="font-bold text-red-500">
                {"€"} {expense.amount.toFixed(2)}
              </StyledText>
            </StyledView>

            <StyledView className="flex-row justify-between mt-2">
              <StyledText className="text-gray-500 text-xs">
                Paid by: {expense.paidByUser?.firstName}{" "}
                {expense.paidByUser?.lastName}
              </StyledText>
              <StyledText className="text-gray-500 text-xs">
                {new Date(expense.expenseDate).toLocaleDateString()}
              </StyledText>
            </StyledView>
            {expense.description && (
              <StyledText className="text-gray-600 mt-2 text-sm">
                {expense.description}
              </StyledText>
            )}
          </StyledView>
        ))
      ) : (
        <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
          <StyledText className="text-gray-500">
            No expenses recorded
          </StyledText>
        </StyledView>
      )}
    </StyledView>
  );
};
