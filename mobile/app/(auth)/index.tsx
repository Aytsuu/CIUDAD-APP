import App from "@/screens/auth/login";
import DriverTasksMain from "@/screens/waste/waste-garbage-pickup-request/driver/garbage-pickup-tasks-main";
import ReceiptPage from "@/screens/treasurer/receipt/receipt-main";
import ResolutionPage from "@/screens/council/resolution/resolution-main";
import WasteCollectionMain from "@/screens/waste/waste-collection/waste-collection-main";
import CaseTracking from "@/screens/my-request/complaint/tabs/complaintView/caseTracking";
import IncomeExpenseMain from "../../screens/treasurer/treasurer-budget-tracker/income-expense-main";
import DisbursementVoucherList from "@/screens/treasurer/disbursement-voucher/disbursement-main";
import IllegalDumpCreateForm from "@/screens/report/illegal-dumping/resident/illegal-dump-create";
import WasteIllegalDumpingResMain from "@/screens/report/illegal-dumping/resident/illegal-dump-main-res";
import WasteIllegalDumping from "@/screens/report/illegal-dumping/staff/illegal-dump-main-staff";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 
