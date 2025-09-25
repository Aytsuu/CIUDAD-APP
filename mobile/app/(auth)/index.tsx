import App from "@/screens/auth/login";
import DriverTasksMain from "@/screens/waste/waste-garbage-pickup-request/driver/garbage-pickup-tasks-main";
import ComplaintMainRequest from "@/screens/my-request/complaint/compMainReq";
// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 
