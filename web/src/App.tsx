import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routes/main-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const router = createBrowserRouter([
  ...main_router,
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