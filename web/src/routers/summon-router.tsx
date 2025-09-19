import SummonTrackingView from "@/pages/record/summon-and-case-tracking/summon-tracking-view";
import SummonReqTabs from "@/pages/record/summon-and-case-tracking/tabs/summon-tabs";
import SummonCalendar from "@/pages/record/summon-and-case-tracking/summonCalendar";
import SummonCases from "@/pages/record/summon-and-case-tracking/summon-cases";

export const summon_router = [
    {
        path: '/request-list',
        element: <SummonReqTabs/>
    }, 
    {
        path: '/summon-cases',
        element: <SummonCases/>
    },
    {
        path: '/view-case',
        element: <SummonTrackingView/>  
    },
    {
        path: '/summon-calendar',
        element: <SummonCalendar/>
    }
]