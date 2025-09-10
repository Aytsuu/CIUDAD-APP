import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: any) => {
                // Don't retry on auth errors
                if(error?.response.status == 401){
                    return false;
                }
                return failureCount < 3;
            },
            staleTime: 5* 60 * 1000, // 5 mins.
            gcTime: 10 * 60 * 1000, // 10 mins. (formerly cacheTime)
        },
        mutations: {
            retry: false,
        },
    },
});