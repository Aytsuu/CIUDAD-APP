import FamPlanning_table from "@/pages/record/health/familyplanning/OverallTable";
import FamilyPlanningView from "@/pages/familyplanning/ViewPage1";
import FamilyPlanningMain from "@/pages/familyplanning/Main";
import FamilyPlanningView2 from "@/pages/familyplanning/ViewPage2";

export const famplanning_route = [
    {
        path: '/FamPlanning_view',
        element: <FamilyPlanningView/>
    },
    {
        path: '/FamPlanning_main',
        element: <FamilyPlanningMain/>
    },
    {
        path: '/FamPlanning_table',
        element: <FamPlanning_table/>
    },
    {
        path: '/FamilyPlanning_view2',
        element: <FamilyPlanningView2/>
    }
   
    
 ]