import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routes/main-router';
import { landing_router } from './routes/landing-router';
import { user_account } from './routes/profile-router';
// import FamilyPlanningForm from "./pages/familyplanning/FP-page1";
// import FamilyPlanningMain from "./pages/familyplanning/main";

// import FamilyPlanningForm2 from "./pages/familyplanning/FP-page2";

const router = createBrowserRouter([
  ...main_router,
  ...user_account,
  { path: "*", element: ""},
  ...landing_router
])

function App() {

  return <RouterProvider router={router} />
  
  // return <FamilyPlanningMa></FamilyPlanningMain>
}
export default App;
