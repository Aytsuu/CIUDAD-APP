import IncomeandExpenseTracking from "@/pages/treasurer-income-expense-tracker/treasurer-income-expense-tracker-main";
import IncomeandDisbursementView from "@/pages/treasurer-income-and-disbursement/treasurer-income-and-disbursement-monitoring-view";
import PersonalClearance from "@/pages/treasurer-clearance-requests/treasurer-personalClearance";
import PermitClearance from "@/pages/treasurer-clearance-requests/treasurer-permitClearance";
import ServiceCharge from "@/pages/treasurer-clearance-requests/treasurer-serviceCharge";
import BarangayService from "@/pages/treasurer-clearance-requests/treasurer-barangayService";
import BudgetPlan from "@/pages/treasurer-budgetplan/treasurer-budget-plan-main";
// import AddBudgetPlan from "@/pages/treasurer-budgetplan/treasurer-budgetplan-form";
// import TreasurerDashboard from "@/pages/treasurer-dashboard/sample";


export const treasurer_router = [
    {
        path: "/treasurer-budget-plan",
        element: <BudgetPlan/>,
        // children: [
        //     {
        //         path: 'add-new-plan',
        //         element: <AddBudgetPlan/>
        //     }
        // ]
    },
    {
        path: "/treasurer-income-and-expense-tracking",
        element: <IncomeandExpenseTracking/>
    },
    {
        path: '/treasurer-income-and-disbursement',
        element: <IncomeandDisbursementView/>
    },
    {
        path: '/treasurer-clearance-and-certification',
        element: <PersonalClearance/>,
    },
    {
        path: '/treasurer-permit',
        element: <PermitClearance/>
    },
    {
        path: '/treasurer-service-charge',
        element: <ServiceCharge/>
    },
    {
        path: '/treasurer-barangay-service',
        element: <BarangayService/>
    }
]