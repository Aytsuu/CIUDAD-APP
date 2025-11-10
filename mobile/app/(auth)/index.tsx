import App from "@/screens/auth/login";
import ComplaintMainView from "@/screens/my-request/complaint/ComplaintMainView";
// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

// Makes the Error Overlay dissapear
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <ComplaintMainView/>
}
 