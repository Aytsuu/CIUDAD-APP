
// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import App from "@/screens/auth/login";
import Family from '../(account)/family';
import Announcement from '../(announcement)';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <Announcement/>
}
 
