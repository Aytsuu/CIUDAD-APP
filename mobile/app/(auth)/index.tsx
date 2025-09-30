import Account from "@/screens/account";
import App from "@/screens/auth/login";
import HomeScreen from "@/screens/home";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 
