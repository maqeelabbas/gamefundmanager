import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { API_CONFIG } from '../../config/api.config';

/**
 * Network troubleshooting utility for React Native to help diagnose
 * connectivity issues between the mobile app and API backend
 */
const NetworkTest = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [networkInformation, setNetworkInformation] = useState<{
    ipAddress: string | null;
    connectionType: string | null;
  }>({
    ipAddress: null,
    connectionType: null
  });
  // Add a log to the results
  const addLog = (message: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  // Get network information where available
  useEffect(() => {
    const getNetworkInfo = async () => {
      try {
        // Note: This requires the @react-native-community/netinfo package
        // We're handling this gracefully if the package isn't installed
        try {
          const NetInfo = require('@react-native-community/netinfo');
          const state = await NetInfo.fetch();
          
          setNetworkInformation({
            connectionType: state.type,
            ipAddress: state.details?.ipAddress || null
          });
        } catch (err) {
          console.log('NetInfo package not available');
        }
      } catch (error) {
        console.error('Failed to get network info:', error);
      }
    };
    
    getNetworkInfo();
  }, []);
    // Test HTTP connection (using fetch directly)
  const testConnection = async () => {
    setIsLoading(true);
    addLog(`Starting network test to ${API_CONFIG.BASE_URL}...`);
    
    try {
      // Show network information      addLog(`Device Platform: ${Platform.OS} ${Platform.Version}`);
      addLog(`API Configuration:`);
      addLog(`- BASE_URL: ${API_CONFIG.BASE_URL}`);
      
      // Extract host and port information from BASE_URL
      const urlObj = new URL(API_CONFIG.BASE_URL);
      const host = urlObj.hostname;
      const port = urlObj.port;
      const protocol = urlObj.protocol;
      
      addLog(`- Host: ${host}`);
      addLog(`- Port: ${port || 'default'}`); 
      addLog(`- Protocol: ${protocol}`);
      
      // Show other config if available
      if (API_CONFIG.TIMEOUT !== undefined) {
        addLog(`- TIMEOUT: ${API_CONFIG.TIMEOUT}ms`);
      }
      if (API_CONFIG.CREDENTIALS !== undefined) {
        addLog(`- CREDENTIALS: ${API_CONFIG.CREDENTIALS}`);
      }
      
      // Check for common network configuration issues
      if (Platform.OS === 'android' && host === 'localhost') {
        addLog(`⚠️ Warning: Using 'localhost' on Android. Change to '10.0.2.2' for emulator.`);
      }
      
      if (host.startsWith('192.168') && Platform.OS === 'ios' && !host.includes('simulator')) {
        addLog(`ℹ️ Using local IP (${host}) which should work on iOS physical devices.`);
      }
      
      if (host.includes('.local') && Platform.OS === 'android') {
        addLog(`⚠️ Warning: '.local' hostnames may not resolve on Android.`);
      }
      
      // First try with HEAD to test basic connectivity
      addLog(`Testing HEAD request...`);
      const baseUrl = API_CONFIG.BASE_URL.replace('/api', ''); // Get base URL without /api
      
      const headResponse = await fetch(baseUrl, { 
        method: 'HEAD',
        headers: { 'Accept': 'text/html,application/json' }
      });
      
      addLog(`✅ HEAD request succeeded: ${headResponse.status} ${headResponse.statusText}`);
      
      // Now try a GET request to the healthcheck endpoint
      addLog(`Testing GET to /auth/healthcheck...`);
      const healthcheckUrl = `${API_CONFIG.BASE_URL}/auth/healthcheck`;
      
      const getResponse = await fetch(healthcheckUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (getResponse.ok) {
        const text = await getResponse.text();
        addLog(`✅ GET successful: ${getResponse.status} ${getResponse.statusText}`);
        addLog(`Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      } else {
        addLog(`❌ GET failed with status: ${getResponse.status} ${getResponse.statusText}`);
      }
      
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
        // Help diagnose common React Native network issues
      if (error.message.includes('Network request failed')) {
        addLog(`ℹ️ Common causes for "Network request failed":`);
        addLog(`1. Wrong IP address or hostname in API config`);
        addLog(`2. API server not running or not accessible`);
        addLog(`3. HTTPS certificate issues (try HTTP instead)`);
        addLog(`4. Android emulator needs 10.0.2.2 for localhost`);
        addLog(`5. iOS physical device can't use localhost`);
        
        // Try alternative IP options
        addLog(`\nℹ️ Attempting alternative connection methods...`);
        await testAlternativeConnections();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test different IP configurations
  const testAlternativeConnections = async () => {
    try {
      // Option 1: Try direct IP with port (without /api)
      const ipOnly = API_CONFIG.BASE_URL.split('/')[2].split(':')[0];
      const port = API_CONFIG.BASE_URL.includes(':') ? 
        API_CONFIG.BASE_URL.split(':')[2].split('/')[0] : '8085';
      
      addLog(`Testing direct IP: http://${ipOnly}:${port}`);
      try {
        const ipResponse = await fetch(`http://${ipOnly}:${port}`, {
          method: 'HEAD',
          headers: { 'Accept': 'text/html,application/json' },
        });
        addLog(`✅ Direct IP succeeded: ${ipResponse.status}`);
      } catch (err: any) {
        addLog(`❌ Direct IP failed: ${err.message}`);
      }
      
      // Option 2: Try special Android emulator IP 
      if (Platform.OS === 'android') {
        addLog(`Testing Android emulator special IP: http://10.0.2.2:${port}`);
        try {
          const androidResponse = await fetch(`http://10.0.2.2:${port}`, {
            method: 'HEAD', 
            headers: { 'Accept': 'text/html,application/json' },
          });
          addLog(`✅ Android emulator IP succeeded: ${androidResponse.status}`);
        } catch (err: any) {
          addLog(`❌ Android emulator IP failed: ${err.message}`);
        }
      }
      
      // Option 3: Try localhost 
      addLog(`Testing localhost: http://localhost:${port}`);
      try {
        const localResponse = await fetch(`http://localhost:${port}`, {
          method: 'HEAD',
          headers: { 'Accept': 'text/html,application/json' },
        });
        addLog(`✅ Localhost succeeded: ${localResponse.status}`);
      } catch (err: any) {
        addLog(`❌ Localhost failed: ${err.message}`);
      }
    } catch (error: any) {
      addLog(`Error during alternative tests: ${error.message}`);
    }
  };
  // Test the login endpoint
  const testLogin = async () => {
    setIsLoading(true);
    addLog(`Testing login endpoint...`);
    
    try {
      const loginUrl = `${API_CONFIG.BASE_URL}/auth/login`;
      addLog(`POST request to ${loginUrl}`);
      
      // Build request options with all possible configurations to avoid common issues
      const loginData = { 
        email: 'admin@gamefund.com', 
        password: '123' 
      };
      
      addLog(`Request payload: ${JSON.stringify(loginData)}`);
        const controller = new AbortController();
      
      const fetchOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(loginData),
        mode: 'cors' as RequestMode,
        cache: 'no-cache' as RequestCache,
        credentials: 'include' as RequestCredentials,
        signal: controller.signal
      };
      
      addLog(`Request options: ${JSON.stringify({
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials
      }, null, 2)}`);
      
      // Set timeout to prevent infinite waiting
      const timeoutId = setTimeout(() => {
        controller.abort();
        addLog(`❌ Request timed out after 15 seconds`);
      }, 15000);
      
      addLog(`Sending request, waiting for response...`);
      const response = await fetch(loginUrl, fetchOptions);
      clearTimeout(timeoutId);
      
      addLog(`Response received with status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const text = await response.text();
        addLog(`✅ Login successful: ${response.status}`);
        addLog(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2)}`);
        addLog(`Response body: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
        
        try {
          const json = JSON.parse(text);
          addLog(`✅ Valid JSON response: ${JSON.stringify(json, null, 2).substring(0, 200)}...`);
        } catch (e) {
          addLog(`❌ Invalid JSON response`);
        }
      } else {
        addLog(`❌ Login failed with status: ${response.status} ${response.statusText}`);
        addLog(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2)}`);
        const text = await response.text();
        addLog(`Error response: ${text}`);
      }
    } catch (error: any) {
      addLog(`❌ Login error: ${error.message}`);
      
      if (error.message.includes('Network request failed')) {
        addLog(`\nℹ️ Attempting login with alternative URLs...`);
        await testAlternativeLoginUrls();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test login with alternative URLs
  const testAlternativeLoginUrls = async () => {
    try {
      // Extract parts from current API URL
      const urlParts = API_CONFIG.BASE_URL.split('/');
      const hostWithPort = urlParts[2];
      const host = hostWithPort.split(':')[0];
      const port = hostWithPort.includes(':') ? hostWithPort.split(':')[1] : '8085';
      
      // Option 1: Try with Android's special 10.0.2.2 IP
      if (Platform.OS === 'android') {
        const androidUrl = `http://10.0.2.2:${port}/api/auth/login`;
        addLog(`Testing Android emulator URL: ${androidUrl}`);
        
        try {
          const response = await fetch(androidUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@gamefund.com', password: '123' })
          });
          
          if (response.ok) {
            addLog(`✅ Android emulator URL worked: ${response.status}`);
          } else {
            addLog(`❌ Android emulator URL failed: ${response.status}`);
          }
        } catch (err: any) {
          addLog(`❌ Android emulator URL error: ${err.message}`);
        }
      }
      
      // Option 2: Try without /api path segment
      const noApiUrl = `http://${hostWithPort}/auth/login`;
      addLog(`Testing without /api: ${noApiUrl}`);
      
      try {
        const response = await fetch(noApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@gamefund.com', password: '123' })
        });
        
        if (response.ok) {
          addLog(`✅ URL without /api worked: ${response.status}`);
        } else {
          addLog(`❌ URL without /api failed: ${response.status}`);
        }
      } catch (err: any) {
        addLog(`❌ URL without /api error: ${err.message}`);
      }
    } catch (error: any) {
      addLog(`Error during alternative login tests: ${error.message}`);
    }
  };
  
  // Clear all test results
  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Network Test</Text>
      <Text style={styles.subtitle}>Current API URL: {API_CONFIG.BASE_URL}</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Device Information</Text>
        <Text style={styles.infoText}>Platform: {Platform.OS} {Platform.Version}</Text>
        {networkInformation.connectionType && (
          <Text style={styles.infoText}>Network Type: {networkInformation.connectionType}</Text>
        )}
        {networkInformation.ipAddress && (
          <Text style={styles.infoText}>Device IP: {networkInformation.ipAddress}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Basic Connectivity</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Login Endpoint</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loading} />
      )}

      <ScrollView style={styles.resultContainer}>
        {results.length === 0 ? (
          <Text style={styles.noResults}>No test results yet</Text>
        ) : (
          results.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    width: '48%',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    borderRadius: 6,
    width: '100%',
  },
  clearButtonText: {
    color: '#666',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 6,
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  loading: {
    marginVertical: 10,
  }
});

export default NetworkTest;
