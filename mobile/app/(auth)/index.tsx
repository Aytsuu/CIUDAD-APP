import App from "@/screens/auth/login";
import Report from "@/screens/report";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

// Makes the Error Overlay dissapear
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <Report/>
}
 