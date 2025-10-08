
// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import App from "@/screens/auth/login";

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 
