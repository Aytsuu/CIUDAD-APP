import AccountSettings from "@/pages/record/acc-profile/profile-settings";

export const profiling_router = [
    {
        path: "account-settings",
        element: <AccountSettings />
    },
    {
        path: "resident-registration",
        element: <ProfilingForm />
    },
];