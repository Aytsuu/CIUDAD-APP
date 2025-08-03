import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { AnimatePresence } from "framer-motion";

import { main_router } from "./routers/main-router";
import { landing_router } from "./routers/landing-router";
import { user_account } from "./routers/profile-router";
import { LoadingProvider } from "./context/LoadingContext";
import { LinearLoader } from "./components/ui/linear-loader";

import { NotFound } from "./not-found";

import { NotificationProvider } from "./context/NotificationContext";

const router = createBrowserRouter([
  ...main_router,
  ...landing_router,
  ...user_account,
  { path: "*", element: <NotFound /> },
]);

const queryClient = new QueryClient();

function App() {
  return (
    // <QueryClientProvider client={queryClient}>
    //   <RouterProvider router={router} />
    // </QueryClientProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <LoadingProvider>
            <LinearLoader />
            <AnimatePresence mode="wait">
              <RouterProvider router={router} />
            </AnimatePresence>
          </LoadingProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;
