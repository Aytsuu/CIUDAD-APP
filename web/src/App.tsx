import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routes/main-router';
import { settings_router } from './routes/Account-settings';

// import FamilyPlanningForm from "./pages/familyplanning/FP-page1";
// import FamilyPlanningMain from "./pages/familyplanning/main";

// import FamilyPlanningForm2 from "./pages/familyplanning/FP-page2";

const router = createBrowserRouter([
  ...main_router,
  ...settings_router,
  { path: "*", element: ""}
])

function App() {

  return <RouterProvider router={router} />
  
  // return <FamilyPlanningMa></FamilyPlanningMain>
}
export default App;