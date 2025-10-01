import App from "@/screens/auth/login";
import ComplaintAccepted from "@/screens/my-request/complaint/tabs/complaintAccepted";
// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 
