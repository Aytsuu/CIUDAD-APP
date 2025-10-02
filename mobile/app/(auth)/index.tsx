import App from "@/screens/auth/login";
import Report from "@/screens/report";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import Tabs from "../(tabs)";
import Personal from "../(account)/personal";
import Account from "@/screens/account";
import HomeScreen from "@/screens/home";
import Request from "@/screens/request";
import MyRequest from "@/screens/my-request";

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <MyRequest/>
}
 
