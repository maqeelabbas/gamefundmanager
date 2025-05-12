# Token Refresh Mechanism Implementation

## Overview

This document describes the implementation of the token refresh mechanism for the GameFundManager application. The mechanism ensures seamless user experience by automatically refreshing authentication tokens before they expire, preventing 401 Unauthorized errors.

## Backend Implementation

### Endpoints

- **POST /auth/refresh-token**
  - Request Body: `{ "token": "current-jwt-token" }`
  - Response: 
    ```json
    {
      "success": true,
      "message": "Token refreshed successfully",
      "data": {
        "token": "new-jwt-token",
        "tokenExpires": "2025-05-16T10:30:00Z",
        "userId": "user-guid"
      },
      "errors": null
    }
    ```

### Service Methods

1. **ValidateTokenWithoutLifetimeChecks**
   - Validates JWT token signature and structure but ignores expiry time
   - Returns the user ID from token claims if valid

2. **RefreshTokenAsync**
   - Validates the provided token using ValidateTokenWithoutLifetimeChecks
   - If valid, generates a new token for the user
   - Returns the new token and its expiration time

## Frontend Implementation

### Token Service

The token service provides the following functionality:

1. **isTokenExpired**
   - Checks if the token will expire within 5 minutes
   - Sets a default expiry when no expiry information exists

2. **refreshToken**
   - Makes a request to the `/auth/refresh-token` endpoint
   - Implements rate limiting to prevent excessive refresh attempts
   - Updates token storage when successful

3. **validateToken**
   - Validates and refreshes the token if needed before API calls
   - Implements locking mechanism to prevent concurrent refresh operations

### Integration with API Service

The API service automatically:
1. Validates tokens before making requests
2. Retries requests with fresh tokens when encountering auth errors
3. Implements throttling to prevent API call storms

## Error Handling

- Graceful fallback when refresh fails
- Rate limiting for refresh attempts
- Detailed logging for troubleshooting
- Safe handling of network errors

## Security Considerations

- Token validation occurs on both client and server
- Default token expiry to prevent infinite refresh loops
- Protection against replay attacks
