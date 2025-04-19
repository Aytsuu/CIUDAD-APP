import IncomeandExpenseTracking from "@/pages/record/treasurer/treasurer-income-expense-tracker/treasurer-expense-tracker-main";
import IncomeandDisbursementView from "@/pages/record/treasurer/treasurer-income-and-disbursement/treasurer-income-and-disbursement-monitoring-view";
import PersonalClearance from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-personalClearance";
import PermitClearance from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-permitClearance";
import ServiceCharge from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-serviceCharge";
import BarangayService from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-barangayService";
import BudgetPlan from "@/pages/record/treasurer/treasurer-budgetplan/listOfAllBudgetPlans";
import TreasurerDonationTable from "@/pages/record/treasurer/treasurer-donation/treasurer-donation-main";
import BudgetPlanForm from "@/pages/record/treasurer/treasurer-budgetplan/budgetPlanForms/budgetplanMainForm";
import ViewBudgetPlan from "@/pages/record/treasurer/treasurer-budgetplan/viewABudgetPlan";
import RatesForm from "@/pages/record/treasurer/treasurer-clearance-requests/Rates/treasurer-rates-form";
import IncomeTracking from "@/pages/record/treasurer/treasurer-income-expense-tracker/treasurer-income-tracker-main";
import IncomeExpenseMain from "@/pages/record/treasurer/treasurer-income-expense-tracker/treasurer-income-expense-main";
import HeaderAndAllocationEdit from "@/pages/record/treasurer/treasurer-budgetplan/EditBudgetPlanForms/budgetPlanHeaderandAlloctionEdit.tsx";

export const treasurer_router = [
    {
        path: "treasurer-budget-plan",
        element: <BudgetPlan/>,
    },
    {
        path: "treasurer-budgetplan-form",
        element: <BudgetPlanForm/>
    },
    {
        path: 'treasurer-budgetplan-view/:plan_id',
        element: <ViewBudgetPlan/>,
    },
    {
        path: "treasurer-donation",
        element: <TreasurerDonationTable/>
    },
    {
        path: "treasurer-income-expense-main",
        element: <IncomeExpenseMain/>
    },
    {
        path: "treasurer-income-and-expense-tracking",
        element: <IncomeandExpenseTracking/>
    },
    {
        path: "treasurer-income-tracking",
        element: <IncomeTracking/>
    },
    {
        path: 'treasurer-income-and-disbursement',
        element: <IncomeandDisbursementView/>
    },
    {
        path: 'treasurer-personal-and-others',
        element: <PersonalClearance/>,
    },
    {
        path: 'treasurer-permit',
        element: <PermitClearance/>
    },
    {
        path: 'treasurer-service-charge',
        element: <ServiceCharge/>
    },
    {
        path: 'treasurer-barangay-service',
        element: <BarangayService/>
    },
    {
        path: 'treasurer-rates',
        element: <RatesForm/>
    },
    {
        path: 'edit-header-and-allocation/:plan_id',
        element: <HeaderAndAllocationEdit/>
    },
]