import { View } from "react-native";
import GADAddEntryForm from "@/screens/gad/budget-tracker/gad-create-budget";

export default function CreateBudgetWrapper() {
  return (
    <View className="flex-1 bg-white">
      <GADAddEntryForm />
    </View>
  );
}