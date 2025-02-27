import ProfilingMain from "./pages/ProfilingPages/ProfilingMain";
import { MainLayout } from "./layout/MainLayout";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ProfilingForm } from "./pages/ProfilingPages/FormPage/ProfilingForm";
import ProfilingRequest from "./pages/ProfilingPages/ProfilingRequests";
import ViewInfo from "./pages/ProfilingPages/ProfilingViewInfo";

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
      },
      {
        path: "profilingRequest",
        element: <ProfilingRequest />
      },
      {
        path: "profilingIndivInfo",
        element: <ViewInfo />
      }
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;