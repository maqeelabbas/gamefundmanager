// src/screens/debug/SSLBypassTest.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { API_CONFIG } from '../../config/api.config';

/**
 * SSL Certificate Bypass Test Component
 * This component tests various connection methods with SSL certificate validation bypassed
 * ONLY FOR DEVELOPMENT - NEVER USE IN PRODUCTION
 */
const SSLBypassTest = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Test with SSL certificate validation bypassed
  const testBypassSSL = async () => {
    setIsLoading(true);
    addLog('Starting SSL bypass tests...');

    // Extract base information from API config
    const urlObj = new URL(API_CONFIG.BASE_URL);
    const host = urlObj.hostname;
    const port = urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
    
    // Test URLs
    const httpUrl = `http://${host}:8085/api/auth/healthcheck`;
    const httpsUrl = `https://${host}:8086/api/auth/healthcheck`; // Assuming HTTPS is on 8086
    
    addLog(`Testing HTTP endpoint: ${httpUrl}`);
    addLog(`Testing HTTPS endpoint: ${httpsUrl}`);
    
    // First test HTTP which should work without SSL issues
    try {
      addLog('1. Testing basic HTTP connection...');
      const httpResponse = await fetch(httpUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      addLog(`✅ HTTP successful: ${httpResponse.status}`);
      const httpText = await httpResponse.text();
      addLog(`Response: ${httpText}`);
    } catch (err: any) {
      addLog(`❌ HTTP failed: ${err.message}`);
    }
    
    // Now test HTTPS which might fail due to certificate issues
    try {
      addLog('2. Testing basic HTTPS connection...');
      const httpsResponse = await fetch(httpsUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      addLog(`✅ HTTPS successful: ${httpsResponse.status}`);
      const httpsText = await httpsResponse.text();
      addLog(`Response: ${httpsText}`);
    } catch (err: any) {
      addLog(`❌ HTTPS failed: ${err.message}`);
      addLog(`This is expected if you have a self-signed certificate`);
    }
    
    // On Android, try to bypass SSL validation (for development only)
    if (Platform.OS === 'android') {
      try {
        addLog('3. Testing with okhttp for Android...');
        addLog(`⚠️ This requires additional setup in your Android project`);
        addLog(`Look for instructions in the NetworkTest.tsx comments`);
      } catch (err: any) {
        addLog(`❌ Test failed: ${err.message}`);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SSL Certificate Bypass Test</Text>
      <Text style={styles.warning}>⚠️ DEVELOPMENT USE ONLY - NEVER USE IN PRODUCTION</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testBypassSSL}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test SSL Bypass Options'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warning: {
    color: 'red',
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#263238',
    padding: 8,
    borderRadius: 4,
  },
  logText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  resultItem: {
    marginBottom: 8,
  },
});

export default SSLBypassTest;
