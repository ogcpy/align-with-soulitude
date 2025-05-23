import { 
  QueryClient, 
  QueryClientProvider as TanstackQueryClientProvider 
} from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import React from 'react';

// Create a query client instance with default settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      networkMode: 'always',
    },
  },
});

// Default query function that works with our API structure
export function getQueryFn(options: { on401?: 'throw' | 'returnNull' } = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const endpoint = queryKey[0];
      const response = await apiRequest(endpoint);
      return response;
    } catch (error: any) {
      // Handle unauthorized errors
      if (error.message.includes('401') && options.on401 === 'returnNull') {
        return null;
      }
      throw error;
    }
  };
}

// Re-export QueryClientProvider with our configured client
export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}

// Export the functions we'll need for API calls
export { apiRequest };