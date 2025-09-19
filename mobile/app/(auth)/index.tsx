import App from "@/screens/auth/login";
import HomeScreen from "@/screens/health/home";
// import HomeScreen from "@/screens/home";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <HomeScreen/>
}
 