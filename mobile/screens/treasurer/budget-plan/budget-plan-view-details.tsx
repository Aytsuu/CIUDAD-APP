import { usegetBudgetPlanDetail } from "./queries/budgetPlanFetchQueries";
import MobileBudgetPlanView from "@/components/ui/budgetPlanTable";
import { View, SafeAreaView, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import _ScreenLayout from '@/screens/_ScreenLayout';

export default function BudgetPlanView() {
    const router = useRouter();
    const { plan_id } = useLocalSearchParams();
    const { data: fetchedData, isLoading } = usegetBudgetPlanDetail(plan_id as string);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2a3a61" />
            </SafeAreaView>
        );
    }

    if (!fetchedData) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <Text className="text-gray-500">No budget plan data found</Text>
            </SafeAreaView>
        );
    }

    return (
        <_ScreenLayout
            customLeftAction={
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={30} className="text-black" />
              </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Budget Plan {fetchedData.plan_year}</Text>}
            showExitButton={false}
          >
          <SafeAreaView className="flex-1">
              <View>

                  <MobileBudgetPlanView  budgetData={fetchedData} />
              </View>
          </SafeAreaView>
       </_ScreenLayout>
    );
}