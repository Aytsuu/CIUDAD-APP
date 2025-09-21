import App from "@/screens/auth/login";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import Business from "../(business)";

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <Business/>
}
 