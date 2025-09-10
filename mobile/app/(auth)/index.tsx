<<<<<<< HEAD
import LoginScreen from "@/screens/auth/login";
import Business from "../(business)";
import HomeScreen from "@/screens/home";

export default () => {
    return <HomeScreen/>
=======
import App from "@/screens/auth/login";
import Business from "../(business)";
import HomeScreen from "@/screens/home";
import Complaint from "../(complaint)";
import SendEmailOTP from "@/screens/auth/signup/EmailOTP";
import LoginScreen from "@/screens/auth/login/loginscreen";
import IndividualInformation from "@/screens/auth/signup/individual/IndividualInformation";

// Makes the Error Overlay dissapear
// import { LogBox } from 'react-native';

// if (__DEV__) {
//   LogBox.ignoreAllLogs(true);
// }

export default () => {
    return <App/>
>>>>>>> frontend/feature/maternal-services
}
 