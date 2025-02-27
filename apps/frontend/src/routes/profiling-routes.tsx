import ProfilingMain from "@/pages/ProfilingPages/ProfilingMain";
import { ProfilingForm } from "@/pages/ProfilingPages/FormPage/ProfilingForm";
import ProfilingRequest from "@/pages/ProfilingPages/ProfilingRequests";
import ViewInfo from "@/pages/ProfilingPages/ProfilingViewInfo";

export const router = [
    {
        path: "",
        element: <ProfilingMain />
    },
    {
        path: "residentRegistration",
        element: <ProfilingForm />
    },
    {
        path: "profilingRequest",
        element: <ProfilingRequest />
    },
    {
        path: "profilingIndivInfo",
        element: <ViewInfo />
    }
];