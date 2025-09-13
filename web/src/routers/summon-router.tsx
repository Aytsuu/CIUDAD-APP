import SummonTrackingView from "@/pages/record/summon-and-case-tracking/summon-tracking-view";
import SummonTabs from "@/pages/record/summon-and-case-tracking/summon-tabs";

export const summon_router = [
    {
        path: '/summon-and-case-tracking',
        element: <SummonTabs/>
    }, 
    {
        path: '/summon-and-case-view',
        element: <SummonTrackingView/>
    }
]