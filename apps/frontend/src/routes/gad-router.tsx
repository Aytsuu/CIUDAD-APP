import BudgetTracker from "@/pages/gad-budget-tracker/budget-tracker-table";
import GADBudgetTrackerMain from "@/pages/gad-budget-tracker/budget-tracker-main";


export const gad_router = [
    {
        path: '/gad-budget-tracker-table',
        element: <BudgetTracker/>
    },
    {
        path: '/gad-budget-tracker-main',
        element: <GADBudgetTrackerMain/>
    }
]