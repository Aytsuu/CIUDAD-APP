import SummonCalendar from "@/pages/record/summon-and-case-tracking/council-mediation/summonCalendar";
import SummonCases from "@/pages/record/summon-and-case-tracking/council-mediation/summon-cases";
import SummonDetails from "@/pages/record/summon-and-case-tracking/council-mediation/summon-details";
import LuponCases from "@/pages/record/summon-and-case-tracking/lupon-mediation/lupon-cases";

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
    }
]