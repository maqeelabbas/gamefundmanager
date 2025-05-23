import { API_CONFIG } from '../config/api.config';

// Function to make a direct request to refresh a token
export const makeDirectRefreshRequest = async (token: string): Promise<{ success: boolean, token?: string, tokenExpires?: string }> => {
  try {
    // Make a direct fetch request to refresh the token without using api service
    const url = `${API_CONFIG.BASE_URL}/auth/refresh-token`;
    console.log(`🔄 Making direct refresh request to ${url}`);    // Make sure we have a valid token format
    if (!token || token.trim() === '' || !token.includes('.') || token.split('.').length !== 3) {
      console.error('🔄 Invalid token format for refresh:', token ? `${token.substring(0, 15)}...` : 'null');
      return { success: false };
    }

    // Prepare headers - ensure token is properly formatted
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7).trim() : token;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${cleanToken}`
    };    // Prepare request options - include token in the body and Authorization header for backend compatibility
    const options: RequestInit = {
      method: 'POST',
      headers,
      // Include token in body as required by the backend API
      body: JSON.stringify({ token: cleanToken }),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include'
    };    // Process URL for development environment
    let processedUrl = url;
    
    // No need to convert HTTPS to HTTP since we're now using HTTP in api.config.ts

    // Make the request
    console.log('🌐 Fetching:', processedUrl);
    const response = await fetch(processedUrl, options);
    console.log('✅ Refresh request completed with status:', response.status);
    console.log('📄 Response headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
    
    // If status is 401, the token is definitely invalid
    if (response.status === 401) {
      console.error('❌ Token refresh failed with 401 Unauthorized - token is invalid');
      return { success: false };
    }
      // Parse response
    const text = await response.text();
    console.log('🔄 Refresh response text:', text.length > 100 ? `${text.substring(0, 100)}...` : text);
    
    // Check if the response is empty
    if (!text.trim()) {
      console.error('❌ Empty response from refresh token endpoint');
      return { success: false };
    }
      let data;
    try {
      data = JSON.parse(text);
      console.log('🔄 Parsed refresh response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('❌ Failed to parse refresh response as JSON:', text);
      return { success: false };
    }

    if (!response.ok) {
      console.error(`❌ Token refresh HTTP error: ${response.status} ${response.statusText}`);
      return { success: false };
    }
    
    // Check if the response has the expected structure with success flag and data object
    if (!data.success || !data.data) {
      console.error('❌ Token refresh failed: Invalid response format', data);
      return { success: false };
    }
    
    // Make sure we have token and expiry information
    if (!data.data.token) {
      console.error('❌ Token refresh failed: No token in response');
      return { success: false };
    }    return {
      success: true,
      token: data.data.token,
      tokenExpires: data.data.tokenExpires
    };
  } catch (error) {
    console.error('❌ Error during direct token refresh:', error);
    return { success: false };
  }
}
