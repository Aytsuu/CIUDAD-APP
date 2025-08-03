import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create the query client instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
})

interface QueryProviderProps {
    children: React.ReactNode
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// Export the client if you need to access it elsewhere
export { queryClient }

// Default export for convenience
export default QueryProvider
