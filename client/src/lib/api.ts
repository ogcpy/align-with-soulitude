/**
 * API utility functions for making requests to the backend
 */

// Get the API URL from environment variables or use a default
const API_URL = import.meta.env?.VITE_API_URL as string || 'http://localhost:3001';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

/**
 * Make an API request with proper error handling
 */
export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {}
) {
  const { 
    method = 'GET', 
    body = null, 
    headers = {}, 
    credentials = 'include'
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials,
    body: body ? JSON.stringify(body) : null
  };

  try {
    const response = await fetch(url, config);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Helper methods for common request types
 */
export const api = {
  get: (endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, data: any, options: Omit<RequestOptions, 'method'> = {}) => 
    apiRequest(endpoint, { ...options, method: 'POST', body: data }),
    
  put: (endpoint: string, data: any, options: Omit<RequestOptions, 'method'> = {}) => 
    apiRequest(endpoint, { ...options, method: 'PUT', body: data }),
    
  delete: (endpoint: string, options: Omit<RequestOptions, 'method'> = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' })
};

export default api;