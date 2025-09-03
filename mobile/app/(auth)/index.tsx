import App from "@/screens/auth/login";
import Business from "../(business)";
import HomeScreen from "@/screens/home";
import Complaint from "../(complaint)";
import SendEmailOTP from "@/screens/auth/signup/EmailOTP";
import LoginScreen from "@/screens/auth/login/loginscreen";
import IndividualInformation from "@/screens/auth/signup/individual/IndividualInformation";
import PurposeAndRatesMain from "@/screens/treasurer/rates/purpose-and-rate-main";
import WasteIllegalDumpingResMain from "@/screens/report/illegal-dumping/resident/illegal-dump-main-res";
import IllegalDumpCreateForm from "@/screens/report/illegal-dumping/resident/illegal-dump-create";
import WasteIllegalDumping from "@/screens/report/illegal-dumping/staff/illegal-dump-main-staff";

// Makes the Error Overlay dissapear
// import { LogBox } from 'react-native';

// if (__DEV__) {
//   LogBox.ignoreAllLogs(true);
// }

export default () => {
    return <WasteIllegalDumpingResMain/>
}
 