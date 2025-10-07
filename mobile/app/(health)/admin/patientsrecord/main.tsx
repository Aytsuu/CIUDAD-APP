import ViewPatientRecord from "@/screens/health/admin/admin-patientsrecord/Main";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  ViewPatientRecord: { patientId: string };
};

export default () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ViewPatientRecord'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ViewPatientRecord'>>();
  
  return (
    <ViewPatientRecord navigation={navigation} route={route} />
  );
};