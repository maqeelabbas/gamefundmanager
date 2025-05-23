// src/navigation/MainNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import HomeScreen from "../screens/main/HomeScreen";
import GroupsScreen from "../screens/main/GroupsScreen";
import FinancesScreen from "../screens/main/FinancesScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

// Import types
import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  return (
    <Tab.Navigator      screenOptions={{
        headerShown: false,
        tabBarStyle: { paddingBottom: 2 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{          tabBarIcon: ({color, size}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name="home-outline" size={size} color={color} />
            </View>
          ),
          tabBarLabel: ({color}) => (
            <Text style={{fontSize: 10, color: "#2b7a0b", marginBottom: 3}}>Home</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{          tabBarIcon: ({color, size}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name="people-outline" size={size} color={color} />
            </View>
          ),
          tabBarLabel: ({color}) => (
            <Text style={{fontSize: 10, color: "#2b7a0b", marginBottom: 3}}>Groups</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Finances"
        component={FinancesScreen}
        options={{          tabBarIcon: ({color, size}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name="wallet-outline" size={size} color={color} />
            </View>
          ),
          tabBarLabel: ({color}) => (
            <Text style={{fontSize: 10, color: "#2b7a0b", marginBottom: 3}}>Finances</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{          tabBarIcon: ({color, size}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name="person-outline" size={size} color={color} />
            </View>
          ),
          tabBarLabel: ({color}) => (
            <Text style={{fontSize: 10, color: "#2b7a0b", marginBottom: 3}}>Profile</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
