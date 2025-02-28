import FamilyPlanningForm from "@/pages/familyplanning/FP-page1";
import FamilyPlanningView from "@/pages/familyplanning/view";

export const famplanning_route = [
    {
        path: '/FamPlanning_view',
        element: <FamilyPlanningView></FamilyPlanningView>
    },
    {
        path: '/FamPlanning_form',
        element: <FamilyPlanningForm></FamilyPlanningForm>
    }
 ]