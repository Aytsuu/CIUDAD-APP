import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './router/main-router';
import { landing_router } from './router/landing-router';
import { settings_router } from './router/settings';

const router = createBrowserRouter([
  ...main_router,
  ...landing_router,
  ...settings_router,
  { path: "*", element: ""}
])

const queryClient = new QueryClient();


function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
export default App;
