
import AnnouncementDashboard from "@/pages/announcement/AnnouncementList";
import AnnouncementCreate from "@/pages/announcement/announcementcreate";
import AnnouncementView from "@/pages/announcement/announcementview";

export const announcement_route = [
  {
    path: "/announcement",
    element: <AnnouncementDashboard />,
  },
  {
    path: "/announcement/create",
    element: <AnnouncementCreate />,
  },
  {
    path: "/announcement/:id", // dynamic param
    element: <AnnouncementView />,
  },
];
