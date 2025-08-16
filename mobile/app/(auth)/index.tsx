import LoginScreen from "@/screens/auth/login";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import IllegalDumpCreateForm from "@/screens/report/illegal-dumping/resident/illegal-dump-create";
import WasteIllegalDumping from "@/screens/report/illegal-dumping/staff/illegal-dump-main-staff";
import IncomeExpenseMain from "@/screens/treasurer/treasurer-budget-tracker/income-expense-main";
import WasteCollectionMain from "@/screens/waste/waste-collection/waste-collection-main";
import GADBudgetTrackerMain from "@/screens/gad/budget-tracker/main-card";
import AnnualDevPlanMain from "@/screens/gad/annual-dev-plan/main";
import Request from "../(request)";
import CertificatesMain from "@/screens/certificates/main";
import ClearanceRequestList from "@/screens/treasurer/clearance-request";

export default () => {
    return <ClearanceRequestList/>
}
