import LoginScreen from "@/screens/auth/login";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import IllegalDumpCreateForm from "@/screens/report/illegal-dumping/resident/illegal-dump-create";
import WasteIllegalDumping from "@/screens/report/illegal-dumping/staff/illegal-dump-main-staff";
import IncomeExpenseMain from "@/screens/treasurer/treasurer-budget-tracker/income-expense-main";
import WasteCollectionMain from "@/screens/waste/waste-collection/waste-collection-main";
import ResolutionPage from "@/screens/council/resolution/resolution-main";
import TemplateMainPage from "@/screens/council/doc-template/template-main";
import ReceiptPage from "@/screens/treasurer/receipt/receipt-main";
import PurposeAndRatesMain from "@/screens/treasurer/rates/purpose-and-rate-main";

export default () => {
    return <PurposeAndRatesMain/>
}
