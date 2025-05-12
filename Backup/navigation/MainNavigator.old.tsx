// filepath: c:\VicBts\GameFundManager\GameFundApp\src\navigation\MainNavigator.tsx
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';

// Import Main Screen components
import HomeScreen from '../screens/main/HomeScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import FinancesScreen from '../screens/main/FinancesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Create a simple tab bar label component to ensure text is wrapped properly
const TabBarLabel = ({ label, focused, color }: { label: string; focused: boolean; color: string }) => (
  <Text style={{ 
    color, 
    fontSize: 10, 
    fontWeight: focused ? 'bold' : 'normal',
    textAlign: 'center'
  }}>
    {label}
  </Text>
);

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2b7a0b',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabBarLabel label="Home" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'people' : 'people-outline'} 
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabBarLabel label="Groups" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Finances" 
        component={FinancesScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'wallet' : 'wallet-outline'} 
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabBarLabel label="Finances" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabBarLabel label="Profile" focused={focused} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
