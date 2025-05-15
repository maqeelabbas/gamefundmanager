// src/screens/main/HomeScreen.tsx
import React from "react";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity } from "react-native";
import {
  StyledView,
  StyledText,
  StyledScrollView,
} from "../../utils/StyledComponents";

const mockGroups = [
  { id: "1", name: "Badminton Group", members: 12, balance: 450 },
  { id: "2", name: "Cricket Team", members: 18, balance: 1200 },
];

const mockUpcomingPayments = [
  { id: "1", group: "Badminton Group", amount: 50, dueDate: "25 May 2025" },
  { id: "2", group: "Cricket Team", amount: 100, dueDate: "01 Jun 2025" },
];

const HomeScreen = () => {
  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <StyledView className="bg-primary p-6 pt-12">
        <StyledText className="text-white text-xl font-bold">
          Welcome to GameFund
        </StyledText>
        <StyledText className="text-white text-sm opacity-80 mt-1">
          Your sports contributions, simplified
        </StyledText>
      </StyledView>

      <StyledScrollView className="flex-1 px-4 pt-4">
        {/* Summary Cards */}
        <StyledView className="flex-row justify-between mb-6">
          <StyledView className="bg-white p-4 rounded-xl shadow-sm w-[48%]">
            <StyledText className="text-text text-xs mb-1">
              Total Balance
            </StyledText>
            <StyledText className="text-text text-xl font-bold">
              ${1650}
            </StyledText>
            <StyledText className="text-green-600 text-xs mt-1">
              Across all groups
            </StyledText>
          </StyledView>

          <StyledView className="bg-white p-4 rounded-xl shadow-sm w-[48%]">
            <StyledText className="text-text text-xs mb-1">
              Due Payments
            </StyledText>
            <StyledText className="text-text text-xl font-bold">
              ${150}
            </StyledText>
            <StyledText className="text-orange-500 text-xs mt-1">
              2 upcoming payments
            </StyledText>
          </StyledView>
        </StyledView>
        {/* My Groups */}
        <StyledView className="mb-6">
          <StyledView className="flex-row justify-between items-center mb-3">
            <StyledText className="text-text text-lg font-bold">
              My Groups
            </StyledText>
            <TouchableOpacity>
              <StyledText className="text-primary">View All</StyledText>
            </TouchableOpacity>
          </StyledView>
          {mockGroups.map((group) => (
            <TouchableOpacity key={group.id}>
              <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
                <StyledView className="flex-row justify-between items-start">
                  <StyledText
                    className="text-text font-bold flex-1 mr-2"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {group.name}
                  </StyledText>
                  <StyledText className="text-primary font-bold shrink-0">
                    ${group.balance}
                  </StyledText>
                </StyledView>
                <StyledView className="mt-2">
                  <StyledText
                    className="text-text text-xs"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {group.members} members
                  </StyledText>
                </StyledView>
              </StyledView>
            </TouchableOpacity>
          ))}
        </StyledView>
        {/* Upcoming Payments */}
        <StyledView className="mb-6">
          <StyledText className="text-text text-lg font-bold mb-3">
            Upcoming Payments
          </StyledText>
          {mockUpcomingPayments.map((payment) => (
            <StyledView
              key={payment.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-3"
            >
              <StyledView className="flex-row justify-between items-start">
                <StyledText
                  className="text-text font-bold flex-1 mr-2"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {payment.group}
                </StyledText>
                <StyledText className="text-orange-500 font-bold shrink-0">
                  ${payment.amount}
                </StyledText>
              </StyledView>
              <StyledView className="flex-row justify-between mt-2">
                <StyledView className="flex-1 mr-3">
                  <StyledText
                    className="text-text text-xs"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Due by: {payment.dueDate}
                  </StyledText>
                </StyledView>
                <TouchableOpacity>
                  <StyledText className="text-primary text-xs shrink-0">
                    Pay Now
                  </StyledText>
                </TouchableOpacity>
              </StyledView>
            </StyledView>
          ))}
        </StyledView>
        {/* Recent Activity */}
        <StyledView className="mb-6">
          <StyledText className="text-text text-lg font-bold mb-3">
            Recent Activity
          </StyledText>
          <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
            <StyledView className="flex-row justify-between items-start">
              <StyledText
                className="text-text font-bold flex-1 mr-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Badminton Group
              </StyledText>
              <StyledText className="text-text text-xs shrink-0">
                2 hours ago
              </StyledText>
            </StyledView>
            <StyledText
              className="text-text text-sm mt-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              New expense added: Court Rental
            </StyledText>
          </StyledView>

          <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
            <StyledView className="flex-row justify-between items-start">
              <StyledText
                className="text-text font-bold flex-1 mr-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Cricket Team
              </StyledText>
              <StyledText className="text-text text-xs shrink-0">
                Yesterday
              </StyledText>
            </StyledView>
            <StyledText
              className="text-text text-sm mt-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              You paid your monthly contribution
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default HomeScreen;
