// import { usegetBudgetPlanDetail } from "./queries/budgetPlanFetchQueries";
// import MobileBudgetPlanView from "@/components/ui/budgetPlanTable";
// import { View, SafeAreaView, Text, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
// import { ChevronLeft } from "lucide-react-native";
// import { useLocalSearchParams } from "expo-router";
// import { useRouter } from "expo-router";
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { useState } from "react";
// import { Card } from "@/components/ui/card";
// import BudgetPlanHistory from "./budget-plan-history";

// export default function BudgetPlanView() {
//     const router = useRouter();
//     const { plan_id } = useLocalSearchParams();
//     const { data: fetchedData, isLoading } = usegetBudgetPlanDetail(plan_id as string);
//     const [activeTab, setActiveTab] = useState<"plan" | "history" | "documents">("plan");

//     if (isLoading) {
//         return (
//             <SafeAreaView className="flex-1 justify-center items-center">
//                 <ActivityIndicator size="large" color="#2a3a61" />
//             </SafeAreaView>
//         );
//     }

//     if (!fetchedData) {
//         return (
//             <SafeAreaView className="flex-1 justify-center items-center">
//                 <Text className="text-gray-500">No budget plan data found</Text>
//             </SafeAreaView>
//         );
//     }

//     return (
//         <_ScreenLayout
//             customLeftAction={
//               <TouchableOpacity onPress={() => router.back()}>
//                 <ChevronLeft size={30} className="text-black" />
//               </TouchableOpacity>
//             }
//             headerBetweenAction={<Text className="text-[13px]">Budget Plan {fetchedData.plan_year}</Text>}
//             showExitButton={false}
//           >
//           <SafeAreaView className="flex-1 bg-gray-50">
//             {/* Tab Headers */}
//             <View className="flex-row bg-white border-b border-gray-200">
//                 <TouchableOpacity
//                     className={`flex-1 py-4 items-center border-b-2 ${
//                         activeTab === "plan" ? "border-blue-500" : "border-transparent"
//                     }`}
//                     onPress={() => setActiveTab("plan")}
//                 >
//                     <Text className={`font-medium ${activeTab === "plan" ? "text-blue-600" : "text-gray-500"}`}>
//                         Budget Plan
//                     </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                     className={`flex-1 py-4 items-center border-b-2 ${
//                         activeTab === "history" ? "border-blue-500" : "border-transparent"
//                     }`}
//                     onPress={() => setActiveTab("history")}
//                 >
//                     <Text className={`font-medium ${activeTab === "history" ? "text-blue-600" : "text-gray-500"}`}>
//                         Update History
//                     </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                     className={`flex-1 py-4 items-center border-b-2 ${
//                         activeTab === "documents" ? "border-blue-500" : "border-transparent"
//                     }`}
//                     onPress={() => setActiveTab("documents")}
//                 >
//                     <Text className={`font-medium ${activeTab === "documents" ? "text-blue-600" : "text-gray-500"}`}>
//                         Documents
//                     </Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Tab Content */}
//             <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//                 {activeTab === "plan" && (
//                     <View className="pt-2">
//                         <MobileBudgetPlanView budgetData={fetchedData} />
//                     </View>
//                 )}

//                 {activeTab === "history" && (
//                     <View>
//                             <BudgetPlanHistory planId={plan_id as string} />
//                     </View>
//                 )}

//                 {activeTab === "documents" && (
//                     <View>
//                         <Card className="bg-white rounded-lg overflow-hidden">
//                             {/* <BudgetPlanSuppDocs plan_id={Number(plan_id)} /> */}
//                         </Card>
//                     </View>
//                 )}
//             </ScrollView>
//           </SafeAreaView>
//        </_ScreenLayout>
//     );
// }

import { usegetBudgetPlanDetail } from "./queries/budgetPlanFetchQueries";
import MobileBudgetPlanView from "@/components/ui/budgetPlanTable";
import { View, SafeAreaView, Text, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useState } from "react";
import { Card } from "@/components/ui/card";
import BudgetPlanHistory from "./budget-plan-history";

export default function BudgetPlanView() {
    const router = useRouter();
    const { plan_id } = useLocalSearchParams();
    const { data: fetchedData, isLoading } = usegetBudgetPlanDetail(plan_id as string);
    const [activeTab, setActiveTab] = useState<"plan" | "history" | "documents">("plan");

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
          <View className="flex-1 bg-gray-50">
            {/* Fixed Tab Headers (won't scroll) */}
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row">
                    <TouchableOpacity
                        className={`flex-1 py-4 items-center border-b-2 ${
                            activeTab === "plan" ? "border-blue-500" : "border-transparent"
                        }`}
                        onPress={() => setActiveTab("plan")}
                    >
                        <Text className={`font-medium ${activeTab === "plan" ? "text-blue-600" : "text-gray-500"}`}>
                            Budget Plan
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-1 py-4 items-center border-b-2 ${
                            activeTab === "history" ? "border-blue-500" : "border-transparent"
                        }`}
                        onPress={() => setActiveTab("history")}
                    >
                        <Text className={`font-medium ${activeTab === "history" ? "text-blue-600" : "text-gray-500"}`}>
                            Update History
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-1 py-4 items-center border-b-2 ${
                            activeTab === "documents" ? "border-blue-500" : "border-transparent"
                        }`}
                        onPress={() => setActiveTab("documents")}
                    >
                        <Text className={`font-medium ${activeTab === "documents" ? "text-blue-600" : "text-gray-500"}`}>
                            Documents
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Scrollable Content Area */}
            <View className="flex-1">
                {activeTab === "plan" && (
                    <ScrollView className="flex-1 pt-2">
                        <MobileBudgetPlanView budgetData={fetchedData} />
                    </ScrollView>
                )}

                {activeTab === "history" && (
                    // <ScrollView className="flex-1">
                        <BudgetPlanHistory planId={plan_id as string} />
                    // </ScrollView>
                )}

                {activeTab === "documents" && (
                    <ScrollView className="flex-1">
                        <Card className="bg-white rounded-lg overflow-hidden m-2">
                            {/* <BudgetPlanSuppDocs plan_id={Number(plan_id)} /> */}
                        </Card>
                    </ScrollView>
                )}
            </View>
          </View>
       </_ScreenLayout>
    );
}