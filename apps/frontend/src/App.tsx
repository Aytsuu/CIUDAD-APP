import { Router } from "lucide-react";
import ProfilingMain from "./components/profiling/ProfilingMain";
import { MainLayout } from "./layout/MainLayout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ResidentRegistration from "./components/profiling/Form/ResidentRegistration";
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
        element: <ResidentRegistration />
      }
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
