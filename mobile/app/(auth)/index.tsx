import App from "@/screens/auth/login";
import IncomeExpenseMain from "@/screens/treasurer/treasurer-budget-tracker/income-expense-main";

// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <IncomeExpenseMain/>
}
 