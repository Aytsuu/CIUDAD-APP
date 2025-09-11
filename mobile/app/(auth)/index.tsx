import App from "@/screens/auth/login";
import IncomeExpenseMain from "@/screens/treasurer/treasurer-budget-tracker/income-expense-main";
import ResolutionPage from "@/screens/council/resolution/resolution-main";
import WasteIllegalDumpingResMain from "@/screens/report/illegal-dumping/resident/illegal-dump-main-res";
import WasteIllegalDumping from "@/screens/report/illegal-dumping/staff/illegal-dump-main-staff";
import IllegalDumpCreateForm from "@/screens/report/illegal-dumping/resident/illegal-dump-create";
import WasteCollectionMain from "@/screens/waste/waste-collection/waste-collection-main";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <WasteCollectionMain/>
}
 