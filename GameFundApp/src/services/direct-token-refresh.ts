import { API_CONFIG } from '../config/api.config';

// Function to make a direct request to refresh a token
export const makeDirectRefreshRequest = async (token: string): Promise<{ success: boolean, token?: string, tokenExpires?: string }> => {
  try {
    // Make a direct fetch request to refresh the token without using api service
    const url = `${API_CONFIG.BASE_URL}/auth/refresh-token`;
    console.log(`🔄 Making direct refresh request to ${url}`);

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Prepare request options
    const options: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify({ token }),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include'
    };

    // Process URL for development environment
    let processedUrl = url;
    if (__DEV__ && processedUrl.startsWith('https://')) {
      console.log('⚠️ Converting HTTPS to HTTP in development mode');
      processedUrl = processedUrl.replace('https://', 'http://');
      console.log('🔄', url, '->', processedUrl);
    }

    // Make the request
    console.log('🌐 Fetching:', processedUrl);
    const response = await fetch(processedUrl, options);
    console.log('✅ Refresh request completed with status:', response.status);    // Parse response
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
    
    if (!data.success) {
      console.error('❌ Token refresh failed:', data.message || 'API returned success: false');
      return { success: false };
    }

    return {
      success: true,
      token: data.data?.token,
      tokenExpires: data.data?.tokenExpires
    };
  } catch (error) {
    console.error('❌ Error during direct token refresh:', error);
    return { success: false };
  }
}
