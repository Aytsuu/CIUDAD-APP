import ProfilingMain from "@/pages/ProfilingPages/ProfilingMain";
import { ProfilingForm } from "@/pages/ProfilingPages/FormPage/ProfilingForm";
import ProfilingRequest from "@/pages/ProfilingPages/ProfilingRequests";
import ViewInfo from "@/pages/ProfilingPages/ProfilingViewInfo";

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
        element: <ViewInfo />
    }
];