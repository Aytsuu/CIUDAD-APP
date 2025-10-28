import { LogBox } from 'react-native';
import App from "@/screens/auth/login";
// import request from '@/screens/request';

// Makes the Error Overlay dissapear
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 