import CreateAnnouncement from "@/pages/announcement/add_announcement";
import AnnouncementDashboard from "@/pages/announcement/overall";

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