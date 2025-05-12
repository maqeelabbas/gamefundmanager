import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';

// Import Main Screen components
import HomeScreen from '../screens/main/HomeScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import FinancesScreen from '../screens/main/FinancesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar component that properly handles text
const CustomTabBarIcon = ({ focused, color, size, iconName }: { 
  focused: boolean; 
  color: string; 
  size: number; 
  iconName: keyof typeof Ionicons.glyphMap;
}) => {
  return <Ionicons name={iconName} size={size} color={color} />;
};

// Custom tab bar label component to properly wrap text
const CustomTabBarLabel = ({ children, color }: { 
  children: string; 
  color: string;
}) => {
  return <Text style={{ color, fontSize: 10, textAlign: 'center', marginTop: 2 }}>{children}</Text>;
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
        if (route.name === 'Home') {
          iconName = 'home-outline';
        } else if (route.name === 'Groups') {
          iconName = 'people-outline';
        } else if (route.name === 'Finances') {
          iconName = 'wallet-outline';
        } else if (route.name === 'Profile') {
          iconName = 'person-outline';
        }

        return {
          headerShown: false,
          tabBarActiveTintColor: '#2b7a0b',
          tabBarInactiveTintColor: '#64748b',
          tabBarIcon: ({ focused, color, size }) => (
            <CustomTabBarIcon 
              focused={focused} 
              color={color} 
              size={size} 
              iconName={focused ? iconName.replace('-outline', '') as keyof typeof Ionicons.glyphMap : iconName} 
            />
          ),          tabBarLabel: ({ color, focused }) => {
            return (
              <Text style={{ 
                color, 
                fontSize: 10,
                fontWeight: focused ? 'bold' : 'normal',
                marginTop: 2,
                textAlign: 'center'
              }}>
                {route.name}
              </Text>
            );
          },
        };
      }}
    >      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarAccessibilityLabel: "Home" }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsScreen}
        options={{ tabBarAccessibilityLabel: "Groups" }}
      />
      <Tab.Screen 
        name="Finances" 
        component={FinancesScreen}
        options={{ tabBarAccessibilityLabel: "Finances" }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarAccessibilityLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}
