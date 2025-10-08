import App from "@/screens/auth/login";
import { LogBox } from 'react-native';

// Remove error popup
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 
