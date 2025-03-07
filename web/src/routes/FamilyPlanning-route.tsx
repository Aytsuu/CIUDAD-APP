import FamPlanning_table from "@/pages/FamilyPlanning/Table";
import FamilyPlanningView from "@/pages/FamilyPlanning/view";
// import FamilyPlanningForm from "@/pages/familyplanning/FP-page1";
// import FamilyPlanningForm2 from "@/pages/familyplanning/FP-page2";
// import FamilyPlanningForm3 from "@/pages/familyplanning/FP-page3";
// import FamilyPlanning_form4 from "@/pages/familyplanning/FP-page4";
// import FamilyPlanningForm5 from "@/pages/familyplanning/FP-page5";
// import FamilyPlanningForm6 from "@/pages/familyplanning/FP-page6";
import FamilyPlanningMain from "@/pages/FamilyPlanning/Main";

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
    // {
    //     path: '/FamilyPlanning_form2',
    //     element: <FamilyPlanningForm2/>
    // },
    // { 
    //     path: '/FamilyPlanning_form3',
    //     element: <FamilyPlanningForm3/>
    // },
    // {
    //     path: '/FamilyPlanning_form4',
    //     element: <FamilyPlanning_form4/>
    // },
    // {
    //     path: '/FamilyPlanning_form5',
    //     element: <FamilyPlanningForm5/>
    // },
    // {
    //     path: '/FamilyPlanning_form6',
    //     element: <FamilyPlanningForm6/>
    // }
    
 ]