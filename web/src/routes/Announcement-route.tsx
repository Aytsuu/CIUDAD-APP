import CreateAnnouncement from "@/pages/announcement/AddAnnouncement";
import AnnouncementDashboard from "@/pages/announcement/AnnouncementList";

export const announcement_route = [
    {
        path: '/viewAnnouncement',
        element: <AnnouncementDashboard></AnnouncementDashboard>
    },
    {
        path: '/createAnnouncement',
        element: <CreateAnnouncement></CreateAnnouncement>
    }
]