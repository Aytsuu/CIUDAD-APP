import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routes/main-router';
import { landing_router } from './routes/landing-router';

const router = createBrowserRouter([
  ...main_router,
  ...landing_router,
  { path: "*", element: ""}
])

function App() {

  return <RouterProvider router={router} />
}
export default App;