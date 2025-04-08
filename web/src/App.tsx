<<<<<<< HEAD
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import { main_router } from "./routers/main-router";
import { landing_router } from "./routers/landing-router";
import { settings_router } from "./routers/settings";
import { AuthProvider } from "./context/AuthContext";
import { user_account } from "./routers/profile-router";
import { AnimatePresence } from "framer-motion";

const router = createBrowserRouter([
  ...main_router,
  ...user_account,
  ...landing_router,
  ...user_account,
  ...settings_router,
  { path: "*", element: <NotFound /> },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <RouterProvider router={router} />
        </AnimatePresence>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Simple not found component
function NotFound() {
  return <div>Page not found</div>;
}

export default App;
=======
import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routes/main-router';

const router = createBrowserRouter([
  ...main_router,
  { path: "*", element: ""}
])

function App() {
  return <RouterProvider router={router} />
  }
export default App;
>>>>>>> mobile/health/resident
