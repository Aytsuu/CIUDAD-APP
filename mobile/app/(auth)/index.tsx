import App from "@/screens/auth/login";
import Report from "@/screens/report";
import IRForm from "@/screens/report/incident/IRForm";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 