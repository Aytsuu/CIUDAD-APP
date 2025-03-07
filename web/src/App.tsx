import { createBrowserRouter, RouterProvider } from 'react-router'
import { main_router } from './routes/main-router';

// import FamilyPlanningForm3 from "./pages/familyplanning/FP-page3";

// import FamilyPlanningForm from "./pages/familyplanning/FP-page1";
// import FamilyPlanningMain from "./pages/familyplanning/main";

// import FamilyPlanningForm2 from "./pages/familyplanning/FP-page2";

const router = createBrowserRouter([
  ...main_router,
  { path: "*", element: ""}
])

function App() {

  return <RouterProvider router={router} />
  
  // return <FamilyPlanningForm3></FamilyPlanningForm3>
}
export default App;