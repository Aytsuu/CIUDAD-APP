import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routers/main-router';
import { landing_router } from './routers/landing-router';
import { settings_router } from './routers/settings';
import { user_account } from './routers/profile-router';

const router = createBrowserRouter([
  ...main_router,
  ...landing_router,
  ...user_account,
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
