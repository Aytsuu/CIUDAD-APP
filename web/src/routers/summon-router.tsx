import SummonCalendar from "@/pages/record/summon-and-case-tracking/council-mediation/summonCalendar";
import SummonCases from "@/pages/record/summon-and-case-tracking/council-mediation/summon-cases";
import SummonDetails from "@/pages/record/summon-and-case-tracking/council-mediation/summon-details";
import SummonRemarksDetails from "@/pages/record/summon-and-case-tracking/summon-remarks/summon-remarks-details";
import SummonRemarksMain from "@/pages/record/summon-and-case-tracking/summon-remarks/summon-remarks-main";
import LuponCases from "@/pages/record/summon-and-case-tracking/lupon-conciliation/lupon-cases";
import LuponCaseDetails from "@/pages/record/summon-and-case-tracking/lupon-conciliation/lupon-case-details";

export const summon_router = [
    {
        path: '/summon-cases',
        element: <SummonCases/>
    },
    {
        path: '/view-mediation-details',
        element: <SummonDetails/>  
    },
    {
        path: '/summon-calendar',
        element: <SummonCalendar/>
    },
    {
        path: '/summon-remarks',
        element: <SummonRemarksMain/>
    },
    {
        path: '/view-remarks-details',
        element: <SummonRemarksDetails/>  
    },
    {
        path: '/conciliation-proceedings',
        element: <LuponCases/>
    },
    {
        path:'/view-conciliation-details',
        element: <LuponCaseDetails/>
    }
]