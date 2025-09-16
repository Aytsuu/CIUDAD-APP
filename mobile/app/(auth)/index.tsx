import App from "@/screens/auth/login";
import DriverTasksMain from "@/screens/waste/waste-garbage-pickup-request/driver/garbage-pickup-tasks-main";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 