import Preferences from "@/pages/acc-profile/navItems/account-preference"
import Profile from "@/pages/acc-profile/navItems/profile"
import Security from "@/pages/acc-profile/navItems/security"
import YourActivity from "@/pages/acc-profile/navItems/your-activity"

export const viewprofile_router = [
    {
        path: 'manage/profile',
        element: <Profile /> 
    },
    {
        path: 'manage/security',
        element: <Security /> 
    },
    {
        path: 'manage/preferences',
        element: <Preferences /> 
    },
    {
        path: 'manage/youractivity',
        element: <YourActivity /> 
    }
]