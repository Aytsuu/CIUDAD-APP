
import AnnouncementDashboard from "@/pages/announcement/AnnouncementList";
import AnnouncementCreate from "@/pages/announcement/announcementcreate";

export const announcement_route = [
  {
    path: "/announcement",
    element: <AnnouncementDashboard />,
  },
  {
    path: "/announcement/create",
    element: <AnnouncementCreate />,
  },
];
