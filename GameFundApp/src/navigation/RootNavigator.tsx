// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { ActivityIndicator, View } from 'react-native';

// Import Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Import Screens
import GroupDetailsScreen from '../screens/main/GroupDetailsScreen';
import AddExpenseScreen from '../screens/main/AddExpenseScreen.new';
import AddContributionScreen from '../screens/main/AddContributionScreen';
import CreateGroupScreen from '../screens/main/CreateGroupScreen';
import UserDetailsScreen from '../screens/main/UserDetailsScreen';

// Import Auth Context
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  // Get authentication state from context
  const { isAuthenticated, isLoading } = useAuth();
    // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="GroupDetails" 
              component={GroupDetailsScreen}
              options={{ headerShown: true, title: 'Group Details' }}
            />
            <Stack.Screen 
              name="AddExpense" 
              component={AddExpenseScreen}
              options={{ headerShown: true, title: 'Add Expense' }}
            />
            <Stack.Screen 
              name="AddContribution" 
              component={AddContributionScreen}
              options={{ headerShown: true, title: 'Add Contribution' }}
            />
            <Stack.Screen 
              name="CreateGroup" 
              component={CreateGroupScreen}
              options={{ headerShown: true, title: 'Create Group' }}
            />
            <Stack.Screen 
              name="UserDetails" 
              component={UserDetailsScreen}
              options={{ headerShown: true, title: 'User Details' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;