import BudgetTracker from "@/pages/record/gad/budget-tracker/budget-tracker-table";
import GADBudgetTrackerMain from "@/pages/record/gad/budget-tracker/budget-tracker-main";
import GADEditEntryForm from "@/pages/record/gad/budget-tracker/budget-tracker-edit-form";
import GADProjectProposal from "@/pages/record/gad/project-proposal/project-proposal-main";
import AnnualDevelopmentPlan from "@/pages/record/gad/annual_development_plan/annual_development_plan_main";
import AnnaualDevelopmentPlanTable from "@/pages/record/gad/annual_development_plan/annual_development_table";
import AnnualDevelopmentPlanCreate from "@/pages/record/gad/annual_development_plan/annual_development_plan_create";
import AnnualDevelopmentPlanEdit from "@/pages/record/gad/annual_development_plan/annual_development_plan_edit";

export const gad_router = [
    {
        // path: '/gad-budget-tracker-table/:year',
        // element: <BudgetTracker/>
        path: '/gad/gad-budget-tracker-table/:year/',
        element: <BudgetTracker/>
    },
    {
        path: 'gad-budget-tracker-entry/:gbud_num/',
        element: <GADEditEntryForm />,
    },
    {
        path: '/gad-budget-tracker-main',
        element: <GADBudgetTrackerMain/>
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
        path: '/gad-annual-development-plan/create',
        element: <AnnualDevelopmentPlanCreate/>
    },
    {
        path: '/gad-annual-development-plan/edit/:devId',
        element: <AnnualDevelopmentPlanEdit/>
    },
    {
        path: '/gad-annual-development-plan-table',
        element: <AnnaualDevelopmentPlanTable/>
    }
]