import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AnimatePresence } from "framer-motion";
import { main_router } from "./routers/main-router";
import { landing_router } from "./routers/landing-router";
import { LoadingProvider } from "./context/LoadingContext";
import { LinearLoader } from "./components/ui/linear-loader";
import { NotFound } from "./not-found";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { queryClient } from "./lib/queryClient";
import { PersistGate } from "redux-persist/integration/react";
import { IdleProvider } from "./context/IdleContext";
import { IdleModal } from "./IdleModal";
import { useAuth } from "./context/AuthContext";
import { user_guide_router } from "./routers/user-guide-router";

const router = createBrowserRouter([
  ...user_guide_router,
  ...landing_router,
  ...main_router,
  { path: "*", element: <NotFound /> },
]);

function AppContent() {
  const { logout, isAuthenticated } = useAuth();
  
  return (
    <IdleProvider onLogout={logout} isAuthenticated={isAuthenticated}>
      <LoadingProvider>
        <LinearLoader />
        <AnimatePresence mode="wait">
          <RouterProvider router={router} />
        </AnimatePresence>
        <IdleModal />
      </LoadingProvider>
    </IdleProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;