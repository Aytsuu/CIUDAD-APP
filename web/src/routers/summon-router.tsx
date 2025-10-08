import SummonCalendar from "@/pages/record/summon-and-case-tracking/council-mediation/summonCalendar";
import SummonCases from "@/pages/record/summon-and-case-tracking/council-mediation/summon-cases";
import SummonDetails from "@/pages/record/summon-and-case-tracking/summon-details";

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
    }
]