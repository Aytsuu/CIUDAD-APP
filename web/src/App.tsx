import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AnimatePresence } from "framer-motion";
import { main_router } from "./routers/main-router";
import { landing_router } from "./routers/landing-router";
import { LoadingProvider } from "./context/LoadingContext";
import { LinearLoader } from "./components/ui/linear-loader";
import { NotFound } from "./not-found";
import { NotificationProvider } from "./context/NotificationContext";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { queryClient } from "./lib/queryClient";
import { PersistGate } from "redux-persist/integration/react";
import { MobileDetect } from "./pages/device/MobileDetect";

const router = createBrowserRouter([
  ...landing_router,
  ...main_router,
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <LoadingProvider>
              <MobileDetect>
                <LinearLoader />
                <AnimatePresence mode="wait">
                  <RouterProvider router={router} />
                </AnimatePresence>
              </MobileDetect>
            </LoadingProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
