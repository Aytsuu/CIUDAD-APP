import SummonCalendar from "@/pages/record/summon-and-case-tracking/council-mediation/summonCalendar";
import SummonCases from "@/pages/record/summon-and-case-tracking/council-mediation/summon-cases";
import SummonDetails from "@/pages/record/summon-and-case-tracking/council-mediation/summon-details";
import LuponCases from "@/pages/record/summon-and-case-tracking/lupon-mediation/lupon-cases";
import SummonRemarksDetails from "@/pages/record/summon-and-case-tracking/summon-remarks/summon-remarks-details";
import SummonRemarksMain from "@/pages/record/summon-and-case-tracking/summon-remarks/summon-remarks-main";

export const summon_router = [
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
    },
    {
        path: '/lupon-cases',
        element: <LuponCases/>
    },
    {
        path: '/summon-remarks',
        element: <SummonRemarksMain/>
    },
    {
        path: '/view-remarks-details',
        element: <SummonRemarksDetails/>  
    },
]