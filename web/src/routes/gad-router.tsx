import BudgetTracker from "@/pages/record/gad/budget-tracker/budget-tracker-table";
import GADBudgetTrackerMain from "@/pages/record/gad/budget-tracker/budget-tracker-main";
import GADProjectProposal from "@/pages/record/gad/project-proposal/project-proposal-main";


export const gad_router = [
    {
        path: '/gad-budget-tracker-table',
        element: <BudgetTracker/>
    },
    {
        path: '/gad-budget-tracker-main',
        element: <GADBudgetTrackerMain/>
    },
    {
        path: '/gad-project-proposal',
        element: <GADProjectProposal/>
    }
]