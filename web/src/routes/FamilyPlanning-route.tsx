import FamilyPlanningForm from "@/pages/familyplanning/FP-page1";
import FamilyPlanningForm2 from "@/pages/familyplanning/FP-page2";
import FamPlanning_table from "@/pages/familyplanning/table";
import FamilyPlanningView from "@/pages/familyplanning/view";

export const famplanning_route = [
    {
        path: '/FamPlanning_view',
        element: <FamilyPlanningView></FamilyPlanningView>
    },
    {
        path: '/FamPlanning_form',
        element: <FamilyPlanningForm></FamilyPlanningForm>
    },
    {
        path: '/FamPlanning_table',
        element: <FamPlanning_table></FamPlanning_table>
    },
    {
        path: '/FamilyPlanning_form2',
        element: <FamilyPlanningForm2></FamilyPlanningForm2>
    }
 ]