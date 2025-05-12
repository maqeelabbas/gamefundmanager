// src/components/GroupListExample.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useApi } from '../hooks';
import { groupService } from '../services';
import { Group } from '../models';

interface GroupListExampleProps {
  onGroupSelect?: (group: Group) => void;
}

export const GroupListExample: React.FC<GroupListExampleProps> = ({ onGroupSelect }) => {
  // Use our custom hook to fetch user groups
  const { 
    data: groups, 
    loading, 
    error, 
    execute: fetchGroups 
  } = useApi(() => groupService.getUserGroups(), true);

  // Function to handle refresh
  const handleRefresh = () => {
    fetchGroups();
  };

  // Render a group item
  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity 
      style={styles.groupCard} 
      onPress={() => onGroupSelect?.(item)}
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupCurrency}>{item.currency}</Text>
      </View>
      
      <Text style={styles.groupDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.groupStats}>
        <Text style={styles.groupStat}>
          Members: <Text style={styles.statValue}>{item.memberCount}</Text>
        </Text>
        <Text style={styles.groupStat}>
          Target: <Text style={styles.statValue}>{item.targetAmount}</Text>
        </Text>
        <Text style={styles.groupStat}>
          Balance: <Text style={styles.statValue}>{item.balance}</Text>
        </Text>
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${Math.min(item.progressPercentage, 100)}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        {item.progressPercentage.toFixed(0)}% of target
      </Text>
    </TouchableOpacity>
  );

  if (loading && !groups) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groups || []}
        renderItem={renderGroupItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't joined any groups yet.
          </Text>
        }
        refreshing={loading}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 20,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupCurrency: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  groupStat: {
    fontSize: 13,
    color: '#666',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

export default GroupListExample;
