import Business from "../(business)";
import HomeScreen from "@/screens/home";
import Complaint from "../(complaint)";
import App from "@/screens/auth/login";
import LoginScreen from "@/screens/auth/login/loginscreen";
import IndividualInformation from "@/screens/auth/signup/individual/IndividualInformation";
import PhoneOTP from "@/screens/auth/signup/account/PhoneOTP";
import AccountDetails from "@/screens/auth/signup/account/AccountDetails";
import AccountSetup from "@/screens/auth/signup/account/AccountSetup";

// Makes the Error Overlay dissapear
// import { LogBox } from 'react-native';

// if (__DEV__) {
//   LogBox.ignoreAllLogs(true);
// }

export default () => {
    return <App/>
}
 