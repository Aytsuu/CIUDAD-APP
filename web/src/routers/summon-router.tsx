import SummonReqTabs from "@/pages/record/summon-and-case-tracking/tabs/summon-tabs";
import SummonCalendar from "@/pages/record/summon-and-case-tracking/summonCalendar";
import SummonCases from "@/pages/record/summon-and-case-tracking/summon-cases";
import SummonDetails from "@/pages/record/summon-and-case-tracking/summon-details";

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
        element: <SummonDetails/>  
    },
    {
        path: '/summon-calendar',
        element: <SummonCalendar/>
    }
]