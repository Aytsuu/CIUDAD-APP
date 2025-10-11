
// Makes the Error Overlay dissapear
import { LogBox } from 'react-native';
import App from "@/screens/auth/login";
import Account from '@/screens/account';
import ResidentRecords from '@/screens/profiling/resident/ResidentRecords';
import Announcement from '../(announcement)';
import FamilyRecords from '@/screens/profiling/family/FamilyRecords';
import HouseholdRecords from '@/screens/profiling/household/HouseholdRecords';

if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default () => {
    return <Announcement/>
}
 
