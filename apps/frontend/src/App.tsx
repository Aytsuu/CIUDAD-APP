import AddBudgetPlan from "./pages/treasurer-budgetplan/treasurer-budgetplan-form"
import IncomeandExpenseTracking from "./pages/treasurer-income-expense-tracker/treasurer-income-expense-tracker-main"
import ViewBudgetPlan from "./pages/treasurer-budgetplan/treasurer-budgetplan-view"
import PersonalClearance from "./pages/treasurer-clearance-requests/treasurer-personalClearance"
import PermitClearance from "./pages/treasurer-clearance-requests/treasurer-permitClearance"
import ServiceCharge from "./pages/treasurer-clearance-requests/treasurer-serviceCharge"
import BarangayService from "./pages/treasurer-clearance-requests/treasurer-barangayService"
import IncomeandDisbursementView from "./pages/treasurer-income-and-disbursement/treasurer-income-and-disbursement-monitoring-view"

function App() {

  return (
    <div>
      {/* <AddBudgetPlan/> */}
      {/* <IncomeandExpenseTracking/> */}
      {/* <ViewBudgetPlan/> */}
      {/* <PersonalClearance/> */}
      {/* <PermitClearance/> */}
      {/* <ServiceCharge/> */}
      {/* <BarangayService/> */}
      <IncomeandDisbursementView/>
    </div>
  )
}

export default App;
