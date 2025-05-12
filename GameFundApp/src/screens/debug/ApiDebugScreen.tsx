import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { authService } from '../../services/auth.service';
import { API_CONFIG } from '../../config/api.config';
import { api } from '../../services/api.service';

/**
 * Debug screen for API connectivity testing
 * This screen will help diagnose API issues by:
 * 1. Showing the current API configuration
 * 2. Testing connectivity to the API server
 * 3. Allowing you to change API URLs on the fly for testing
 */
const ApiDebugScreen = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string>('');
  const [testEndpoint, setTestEndpoint] = useState('/auth/healthcheck');
  const [tempBaseUrl, setTempBaseUrl] = useState(API_CONFIG.BASE_URL);
  
  // Test API connection
  const testConnection = async () => {
    setLoading(true);
    setResults('Testing API connection...\n');
    try {
      const result = await authService.testApiConnection();
      setResults(prev => prev + `\nConnection test completed:\n${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      setResults(prev => prev + `\nConnection test error:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Test a specific API endpoint
  const testEndpointConnection = async () => {
    setLoading(true);
    setResults(`Testing endpoint: ${testEndpoint}...\n`);
    try {
      const result = await api.get(testEndpoint);
      setResults(prev => prev + `\nEndpoint test completed:\n${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      setResults(prev => prev + `\nEndpoint test error:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Temporarily update the API base URL (for testing only)
  const updateApiUrl = () => {
    // This is a hack for testing - in a real app, you'd implement this differently
    // @ts-ignore - Intentionally modifying a readonly property for debugging
    API_CONFIG.BASE_URL = tempBaseUrl;
    Alert.alert('API URL Updated', `Base URL set to: ${API_CONFIG.BASE_URL}`);
    setResults(prev => prev + `\nAPI Base URL updated to: ${API_CONFIG.BASE_URL}`);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Debug Tools</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current API Configuration</Text>
        <Text style={styles.configItem}>Base URL: {API_CONFIG.BASE_URL}</Text>
        <Text style={styles.configItem}>Platform: {Platform.OS}</Text>
        <Text style={styles.configItem}>Timeout: {API_CONFIG.TIMEOUT}ms</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update API URL (Temporary)</Text>
        <TextInput
          style={styles.input}
          value={tempBaseUrl}
          onChangeText={setTempBaseUrl}
          placeholder="Enter new base URL"
        />
        <TouchableOpacity style={styles.button} onPress={updateApiUrl}>
          <Text style={styles.buttonText}>Update URL</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test API Connectivity</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={testConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test General Connectivity'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Specific Endpoint</Text>
        <TextInput
          style={styles.input}
          value={testEndpoint}
          onChangeText={setTestEndpoint}
          placeholder="Enter endpoint path (e.g., /auth/login)"
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={testEndpointConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test Endpoint'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        <View style={styles.resultsContainer}>
          <Text style={styles.results}>{results || 'No tests run yet'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#444',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  configItem: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  resultsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 8,
    minHeight: 200,
  },
  results: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

export default ApiDebugScreen;
