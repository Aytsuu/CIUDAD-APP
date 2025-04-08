import Settings from "@/pages/record/acc-profile/profile-settings";
import AccountSettings from "@/pages/record/acc-profile/profile";

export const user_account = [
    {
        path: "/account-view-profile",
        element: <AccountSettings />
    },
    {
        path: "/account-settings",
        element: <Settings />
    },
];