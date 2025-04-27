import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Prepare headers
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add admin token for admin routes if admin is logged in
  if (url.includes('/admin') && typeof window !== 'undefined') {
    const adminDataStr = localStorage.getItem('adminData');
    if (adminDataStr) {
      try {
        const adminData = JSON.parse(adminDataStr);
        headers['Authorization'] = `Bearer ${adminData.timestamp}`;
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  const { on401: unauthorizedBehavior } = options;
  
  return async ({ queryKey }) => {
    // Extract the URL from the query key (first element)
    const urlString = String(queryKey[0]);
    const headers: Record<string, string> = {};
    
    // Add admin token for admin routes if admin is logged in and in browser environment
    if (urlString.includes('/admin') && typeof window !== 'undefined') {
      const adminDataStr = localStorage.getItem('adminData');
      if (adminDataStr) {
        try {
          const adminData = JSON.parse(adminDataStr);
          headers['Authorization'] = `Bearer ${adminData.timestamp}`;
        } catch (e) {
          console.error('Error parsing admin data:', e);
        }
      }
    }
    
    const res = await fetch(urlString, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return res.json();
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
