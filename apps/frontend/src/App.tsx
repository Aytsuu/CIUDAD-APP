import { Router } from "lucide-react";
import ProfilingMain from "./components/profiling/ProfilingMain";
import { MainLayout } from "./layout/MainLayout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProfilingForm } from "./components/profiling/Form/ProfilingForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <ProfilingMain />
      },
      {
        path: "residentRegistration",
        element: <ProfilingForm />
      }
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
