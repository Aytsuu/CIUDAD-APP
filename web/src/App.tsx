import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routes/main-router';
import { landing_router } from './routes/landing-router';
import { settings_router } from './routes/settings';

const router = createBrowserRouter([
  ...main_router,
  ...landing_router,
  ...settings_router,
  { path: "*", element: ""}
])

const queryClient = new QueryClient()
function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
export default App;
