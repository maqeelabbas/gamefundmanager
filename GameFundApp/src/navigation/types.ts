// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Navigator Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator Types
export type MainTabParamList = {
  Home: undefined;
  Groups: { refresh?: boolean };
  Finances: undefined;
  Profile: undefined;
};

// Root Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;  GroupDetails: { 
    groupId: string;
    expenseAdded?: boolean;
    expenseAddedAt?: number;
    contributionAdded?: boolean;
    contributionAddedAt?: number;
    initialTab?: string; // Added to support forcing specific tab on navigation
  };
  AddExpense: { groupId?: string };
  AddContribution: { groupId?: string };
  CreateGroup: undefined;
  UserDetails: { userId: string };
  ApiDebug: undefined; // Debug screen for API connectivity
};

// Custom Types for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}