// src/screens/main/GroupsScreen.tsx
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ListRenderItem, ActivityIndicator } from "react-native";
import {
  StyledView,
  StyledText,
  StyledTextInput,
  StyledFlatList,
  StyledTouchableOpacity
} from "../../utils/StyledComponents";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { groupService } from '../../services';
import { Group } from '../../models';
import { useApi } from '../../hooks';

type GroupsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GroupsScreen: React.FC = () => {
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use our custom hook to fetch groups
  const { 
    data: groups,
    loading,
    error,
    execute: fetchGroups
  } = useApi(() => groupService.getUserGroups(), true);
  
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  // Update filtered groups when groups change - using a different approach
  useEffect(() => {
    if (groups) {
      if (!filteredGroups.length || searchQuery === '') {
        // If we have no filtered groups yet or search query is empty,
        // just set the filtered groups to all groups
        setFilteredGroups(groups);
      } else {
        // If we already have a search query, maintain the filter but with the updated groups
        const filtered = groups.filter((group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredGroups(filtered);
      }
    }
  }, [groups]);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text && groups) {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else if (groups) {
      setFilteredGroups(groups);
    }
  };
  
  const renderGroupItem: ListRenderItem<Group> = ({ item }) => (
    <StyledTouchableOpacity onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}>
      <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
        <StyledView className="flex-row justify-between">
          <StyledText className="text-text font-bold">{item.name}</StyledText>
          <StyledText className="text-primary font-bold">
            {item.currency}{item.balance}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row justify-between mt-2">
          <StyledText className="text-text text-xs">
            {item.memberCount} members • {item.description}
          </StyledText>
          <StyledText className="text-text text-xs">
            Tap to view details
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledTouchableOpacity>
  );
  
  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="dark" />

      <StyledView className="bg-primary p-6 pt-12">
        <StyledText className="text-white text-xl font-bold">
          My Groups
        </StyledText>
        <StyledText className="text-white text-sm opacity-80 mt-1">
          Manage your sports groups
        </StyledText>
      </StyledView>

      <StyledView className="px-4 pt-4">
        <StyledView className="mb-4">
          <StyledTextInput
            className="border border-gray-300 bg-white rounded-lg p-3 text-text"
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </StyledView>
        <StyledView className="flex-row justify-between items-center mb-4">
          <StyledText className="text-text font-bold">
            {filteredGroups.length} Groups
          </StyledText>
          <StyledTouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
            <StyledView className="bg-primary px-4 py-2 rounded-lg">
              <StyledText className="text-white font-bold">
                + Create Group
              </StyledText>
            </StyledView>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
      
      {loading && !groups ? (
        <StyledView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <StyledText className="mt-2 text-text">Loading groups...</StyledText>
        </StyledView>
      ) : error ? (
        <StyledView className="flex-1 justify-center items-center p-4">
          <StyledText className="text-red-500 text-center mb-2">
            Failed to load groups: {error.message}
          </StyledText>
          <StyledTouchableOpacity 
            className="bg-primary px-4 py-2 rounded-lg mt-2"
            onPress={() => fetchGroups()}>
            <StyledText className="text-white font-medium">Try Again</StyledText>
          </StyledTouchableOpacity>
        </StyledView>      ) : (
        <StyledFlatList
          data={filteredGroups as any}
          keyExtractor={(item: any) => item.id}
          renderItem={renderGroupItem as any}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={fetchGroups}
          refreshing={loading}
          ListEmptyComponent={
            <StyledView className="justify-center items-center p-4">
              <StyledText className="text-text text-center">
                You haven't joined any groups yet. Create a new group to get started!
              </StyledText>
            </StyledView>
          }
        />
      )}
    </StyledView>
  );
};

export default GroupsScreen;