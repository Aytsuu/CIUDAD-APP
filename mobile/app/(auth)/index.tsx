
// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import App from "@/screens/auth/login";
import Account from '@/screens/account';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 
