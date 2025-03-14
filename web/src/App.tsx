import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routes/main-router';
import { viewprofile_router } from './routes/Account-settings';
import { settings_router } from './routes/settings';
// import { landing_router } from './routes/landing-router';

// import FamilyPlanningForm from "./pages/familyplanning/FP-page1";
// import FamilyPlanningMain from "./pages/familyplanning/main";

// import FamilyPlanningForm2 from "./pages/familyplanning/FP-page2";

const router = createBrowserRouter([
  ...main_router,
  ...viewprofile_router,
  ...settings_router,
  // ...landing_router,
  { path: "*", element: ""}
])

function App() {

  return <RouterProvider router={router} />
  
  // return <FamilyPlanningMa></FamilyPlanningMain>
}
export default App;