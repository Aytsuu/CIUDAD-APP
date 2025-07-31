import IncomeandExpenseTracking from "@/pages/record/treasurer/treasurer-income-expense-tracker/treasurer-expense-tracker-main";
// import IncomeandDisbursementView from "@/pages/record/treasurer/treasurer-income-and-disbursement/treasurer-income-and-disbursement-monitoring-main";
import PersonalClearance from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-personalClearance";
import PermitClearance from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-permitClearance";
import ServiceCharge from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-serviceCharge";
import BarangayService from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-barangayService";
import BudgetPlan from "@/pages/record/treasurer/treasurer-budgetplan/listOfAllBudgetPlans";
import TreasurerDonationTable from "@/pages/record/treasurer/treasurer-donation/treasurer-donation-main";
import ViewBudgetPlan from "@/pages/record/treasurer/treasurer-budgetplan/viewABudgetPlan";
import RatesForm from "@/pages/record/treasurer/Rates/treasurer-rates-form";
import IncomeTracking from "@/pages/record/treasurer/treasurer-income-expense-tracker/treasurer-income-tracker-main";
import IncomeExpenseMain from "@/pages/record/treasurer/treasurer-income-expense-tracker/treasurer-income-expense-main"; 
import IncomeandDisbursementView from "@/pages/record/treasurer/treasurer-income-and-disbursement/treasurer-income-and-disbursement-monitoring-main";
import ReceiptPage from "@/pages/record/treasurer/Receipts/receipts-main";
import BudgetPlanParent from "@/pages/record/treasurer/treasurer-budgetplan/budgetPlanParent";

export const treasurer_router = [
   {
        path: "treasurer-budget-plan",
        element: <BudgetPlan/>,
    },
    {
        path: 'treasurer-budgetplan-view',
        element: <ViewBudgetPlan/>,
    },
    {
        path: 'budgetplan-forms',
        element: <BudgetPlanParent/>
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
        path: 'treasurer-receipts',
        element: <ReceiptPage/>
    },
    {
        path: 'treasurer-receipts',
        element: <ReceiptPage/>
    },
]