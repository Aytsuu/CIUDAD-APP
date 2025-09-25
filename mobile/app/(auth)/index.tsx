import App from "@/screens/auth/login";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import Home from "../(health)/home";

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <App/>
}
 
