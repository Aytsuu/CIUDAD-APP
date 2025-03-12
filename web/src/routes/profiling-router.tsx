import ProfilingMain from "@/pages/record/profiling/ProfilingMain";
import { ProfilingForm } from "@/pages/record/profiling/FormPage/ProfilingForm";
import ProfilingRequest from "@/pages/record/profiling/ProfilingRequests";
import ProfileViewInfo from "@/pages/record/profiling/ProfilingViewInfo";

export const profiling_router = [
    {
        path: "resident-records",
        element: <ProfilingMain />
    },
    {
        path: "resident-registration",
        element: <ProfilingForm />
    },
    {
        path: "registration-request",
        element: <ProfilingRequest />
    },
    {
        path: "resident-information",
        element: <ProfileViewInfo />
    },
];