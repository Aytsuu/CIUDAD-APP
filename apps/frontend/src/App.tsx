// import FamilyPlanningView from "./pages/familyplanning/view";
// import Announcements from "./pages/announcement/overall";
// import FPForm from "./pages/familyplanning/FP-page1";
// import CreateAnnouncement from "./pages/announcement/add_announcement";
// import AnimalBites from "./pages/animalbites/individual";
// import Viewing from "./pages/animalbites/history";
// import DeleteConfirmationModal from "./pages/announcement/deletemodal";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import { bites_route } from "./routes/AnimalBite-route";
import { announcement_route } from "./routes/Announcement-route";
import { famplanning_route } from "./routes/FamilyPlanning-route";

const router = createBrowserRouter([
  ...bites_route,
  ...announcement_route,
  ...famplanning_route
])

function App() {
  return (
  // <Announcements></Announcements>
    // <Viewing></Viewing>
    // <AnimalBites></AnimalBites>
    // <FamilyPlanningView></FamilyPlanningView>
    // <FPForm></FPForm>
    // <CreateAnnouncement></CreateAnnouncement>
    <RouterProvider router={router} />
  );
}

export default App;