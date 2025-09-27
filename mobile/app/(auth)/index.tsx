import App from "@/screens/auth/login";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import Personal from "../(account)/settings/personal";

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <Personal/>
}
 
