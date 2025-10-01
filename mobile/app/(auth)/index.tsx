import App from "@/screens/auth/login";
import Report from "@/screens/report";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import Tabs from "../(tabs)";
import Personal from "../(account)/personal";
import Account from "@/screens/account";
import HomeScreen from "@/screens/home";

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <HomeScreen/>
}
 
