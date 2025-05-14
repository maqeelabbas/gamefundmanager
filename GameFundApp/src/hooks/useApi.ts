// src/hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generic hook for API calls
export function useApi<T, P = void>(
  apiFunction: (params: P) => Promise<T>,
  immediate = false,
  initialParams?: P
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);  // Function to execute the API call
  const execute = useCallback(
    async (params?: P) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(params as P);
        setData(result);
        
        return result;      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('API call error:', errorMessage);
        
        // Enhanced error handling
        let enhancedError: Error;
        
        if (err instanceof Error && err.message && 
            (err.message.includes('401') || err.message.includes('authentication'))) {
          enhancedError = new Error('Authentication error: Please log in again');
          
          // Trigger a global auth failure event to be caught by AuthContext          // Use AsyncStorage as an event bus for React Native
          AsyncStorage.setItem('@GameFund:authFailure', Date.now().toString())
            .then(() => console.log('Auth failure event triggered from useApi'))
            .catch(err => console.error('Failed to trigger auth failure event:', err));
        } else {
          enhancedError = err as Error;
        }
        
        setError(enhancedError);
        throw enhancedError;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );// Execute the API call immediately if requested, but only once when the component mounts
  useEffect(() => {
    if (immediate) {
      execute(initialParams as P);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to ensure it only runs once

  return { data, loading, error, execute };
}

// Example usage:
/*
import { groupService } from '../services';
import { useApi } from '../hooks/useApi';

function GroupList() {
  // Get user groups when component mounts
  const { data: groups, loading, error } = useApi(
    () => groupService.getUserGroups(),
    true // execute immediately
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <View>
      {groups?.map(group => (
        <Text key={group.id}>{group.name}</Text>
      ))}
    </View>
  );
}
*/
