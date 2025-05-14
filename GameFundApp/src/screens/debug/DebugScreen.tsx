import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { API_CONFIG } from '../../config/api.config';
import NetworkTest from '../debug/NetworkTest';

/**
 * A simple screen to test API connectivity and troubleshoot network issues
 */
export default function DebugScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>API Connectivity Test</Text>
      <Text style={styles.apiInfo}>API URL: {API_CONFIG.BASE_URL}</Text>
      
      <NetworkTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  apiInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
});
