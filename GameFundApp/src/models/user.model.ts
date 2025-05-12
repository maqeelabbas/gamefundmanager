// User-related models

// User model matching backend UserDto
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

// Login request model matching backend LoginUserDto
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request model matching backend RegisterUserDto
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// Auth response model matching backend AuthResponseDto
export interface AuthResponse {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  tokenExpires: Date;
}
