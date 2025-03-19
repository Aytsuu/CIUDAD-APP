<<<<<<< HEAD
import BudgetTracker from "@/pages/record/gad-budget-tracker/budget-tracker-table";
import GADBudgetTrackerMain from "@/pages/record/gad-budget-tracker/budget-tracker-main";
=======
import BudgetTracker from "@/pages/record/gad/budget-tracker/budget-tracker-table";
import GADBudgetTrackerMain from "@/pages/record/gad/budget-tracker/budget-tracker-main";
import GADProjectProposal from "@/pages/record/gad/project-proposal/project-proposal-main";
import AnnualDevelopmentPlan from "@/pages/record/gad/annual_development_plan/annual_development_plan_main";
import AnnaualDevelopmentPlanTable from "@/pages/record/gad/annual_development_plan/annual_development_table";
>>>>>>> frontend/feature/treasurer


export const gad_router = [
    {
        path: '/gad-budget-tracker-table',
        element: <BudgetTracker/>
    },
    {
        path: '/gad-budget-tracker-main',
        element: <GADBudgetTrackerMain/>
<<<<<<< HEAD
=======
    },
    {
        path: '/gad-project-proposal',
        element: <GADProjectProposal/>
    },
    {
        path: '/gad-annual-development-plan',
        element: <AnnualDevelopmentPlan/>
    },
    {
        path: '/gad-annual-development-plan-table',
        element: <AnnaualDevelopmentPlanTable/>
>>>>>>> frontend/feature/treasurer
    }
]