import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';

// Import Main Screen components
import HomeScreen from '../screens/main/HomeScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import FinancesScreen from '../screens/main/FinancesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Fixed version of the MainNavigator component
function MainNavigator() {  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2b7a0b',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ focused, color, size }) => {
          // Use any type for Ionicons to avoid TypeScript errors
          let iconName: any = '';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Finances') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Use Text components for tab labels to avoid "Text strings must be rendered within a <Text> component" error
        tabBarLabel: ({ focused, color }) => (
          <Text style={{ color, fontSize: 10, fontWeight: '500', marginBottom: 3 }}>
            {route.name}
          </Text>
        )
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Finances" component={FinancesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default MainNavigator;
