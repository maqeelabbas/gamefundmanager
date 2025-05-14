// Backup of the current MainNavigator.tsx file
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';

// Import Main Screen components
import HomeScreen from '../screens/main/HomeScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import FinancesScreen from '../screens/main/FinancesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon component to ensure proper wrapping
const TabIcon = ({ name, size, color }: { name: any; size: number; color: string }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons name={name} size={size} color={color} />
  </View>
);

// Tab label component to handle text properly
const TabLabel = ({ label, color }: { label: string; color: string }) => (
  <Text style={{ color, fontSize: 10, fontWeight: '500', marginBottom: 3, textAlign: 'center' }}>
    {label}
  </Text>
);

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // Define icon names based on route and focus state
        const getIconName = (routeName: string, focused: boolean): any => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Groups: focused ? 'people' : 'people-outline',
            Finances: focused ? 'wallet' : 'wallet-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return icons[routeName as keyof typeof icons] || 'help-circle';
        };

        return {
          headerShown: false,
          tabBarActiveTintColor: '#2b7a0b',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: { paddingTop: 5 },
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon 
              name={getIconName(route.name, focused)} 
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: ({ color }) => (
            <TabLabel 
              label={route.name} 
              color={color} 
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Finances" component={FinancesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default MainNavigator;
