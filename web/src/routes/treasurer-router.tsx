import IncomeandExpenseTracking from "@/pages/record/treasurer/treasurer-income-expense-tracker/treasurer-income-expense-tracker-main";
import IncomeandDisbursementView from "@/pages/record/treasurer/treasurer-income-and-disbursement/treasurer-income-and-disbursement-monitoring-view";
import PersonalClearance from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-personalClearance";
import PermitClearance from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-permitClearance";
import ServiceCharge from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-serviceCharge";
import BarangayService from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-barangayService";
import BudgetPlan from "@/pages/record/treasurer/treasurer-budgetplan/treasurer-budget-plan-main";
import TreasurerDonationTable from "@/pages/record/treasurer/treasurer-donation/treasurer-donation-main";
import CreateBudgetPlanForm from "@/pages/record/treasurer/treasurer-budgetplan/budgetPlanForms/treasurer-budgetplan-Form";
import ViewBudgetPlan from "@/pages/record/treasurer/treasurer-budgetplan/treasurer-budgetplan-view";
import RatesForm from "@/pages/record/treasurer/treasurer-clearance-requests/Rates/treasurer-rates-form";

export const treasurer_router = [
    {
        path: "/treasurer-budget-plan",
        element: <BudgetPlan/>,
    },
    {
        path: "/treasurer-budgetplan-form",
        element: <CreateBudgetPlanForm/>
    },
    {
        path: '/treasurer-budgetplan-view',
        element: <ViewBudgetPlan/>
    },
    {
        path: "/treasurer-donation",
        element: <TreasurerDonationTable/>
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
        path: '/treasurer-personal-and-others',
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
    },
    {
        path: '/treasurer-rates',
        element: <RatesForm/>
    },
]