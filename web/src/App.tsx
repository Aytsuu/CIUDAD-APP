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

function App() {
  return <RouterProvider router={router} />
}
export default App;
