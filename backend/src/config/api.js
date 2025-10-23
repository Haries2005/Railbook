// src/config/api.ts
// Create this file to centralize API configuration

export const API_CONFIG = {
  // Use environment variable or fallback to localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  endpoints: {
    auth: '/api/auth',
    trains: '/api/trains',
    bookings: '/api/bookings',
    seats: '/api/seats',
    notifications: '/api/notifications'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Export for use in components
export const BACKEND_URL = API_CONFIG.baseURL;