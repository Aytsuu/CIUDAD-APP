import LoginScreen from "@/screens/auth/login";
import IllegalDumpCreateForm from "@/screens/report/illegal-dumping/resident/illegal-dump-create";
import WasteIllegalDumping from "@/screens/report/illegal-dumping/staff/illegal-dump-main-staff";
import IncomeExpenseMain from "@/screens/treasurer/treasurer-budget-tracker/income-expense-main";
import BudgetPlanMain from "@/screens/treasurer/budget-plan/budget-plan-main";
import PurposeAndRatesMain from "@/screens/treasurer/rates/purpose-and-rate-main";
import ReceiptPage from "@/screens/treasurer/receipt/receipt-main";
import TemplateMainPage from "@/screens/council/doc-template/template-main";
import ResolutionPage from "@/screens/council/resolution/resolution-main";
import WasteHotspotMain from "@/screens/waste/waste-hotspot/waste-hotspot-main";
// import GarbagePickupForm from "@/screens/waste/waste-garbage-pickup-request/resident/garbage-pickup-form";
import GarbagePickupMain from "@/screens/waste/waste-garbage-pickup-request/staff/garbage-pickup-request-main";
import WasteCollectionMain from "@/screens/waste/waste-collection/waste-collection-main";
import GADBudgetTrackerMain from "@/screens/gad/budget-tracker/main-card";
import Request from "../(request)";
import SummonAndCaseMain from "@/screens/summon/summon-and-case-main";

export default () => {
    return <ResolutionPage/>
}
