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

// Completely rewritten MainNavigator component to avoid any text rendering issues
function MainNavigator() {
  // Define tab icon generator
  const getTabIcon = (routeName: string, focused: boolean, color: string, size: number) => {
    // Map route names to icon names
    const icons: Record<string, { focused: string; unfocused: string }> = {
      Home: { focused: 'home', unfocused: 'home-outline' },
      Groups: { focused: 'people', unfocused: 'people-outline' },
      Finances: { focused: 'wallet', unfocused: 'wallet-outline' },
      Profile: { focused: 'person', unfocused: 'person-outline' },
    };
    
    // Get the appropriate icon name
    const iconName = focused ? icons[routeName]?.focused : icons[routeName]?.unfocused;
    
    // Return the icon wrapped in a View to prevent rendering issues
    return (
      <View>
        <Ionicons name={iconName as any} size={size} color={color} />
      </View>
    );
  };
  
  // Define tab label renderer
  const getTabLabel = (routeName: string, focused: boolean, color: string) => {
    return (
      <Text style={{ color, fontSize: 10, fontWeight: '500', marginBottom: 3 }}>
        {routeName}
      </Text>
    );
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2b7a0b',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ focused, color, size }) => getTabIcon(route.name, focused, color, size),
        tabBarLabel: ({ focused, color }) => getTabLabel(route.name, focused, color),
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
