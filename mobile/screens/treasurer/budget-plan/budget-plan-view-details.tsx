// import { usegetBudgetPlanDetail } from "./queries/budgetPlanFetchQueries";
// import MobileBudgetPlanView from "@/components/ui/budgetPlanTable";
// import { View, SafeAreaView, Text, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
// import { ChevronLeft } from "lucide-react-native";
// import { useLocalSearchParams } from "expo-router";
// import { useRouter } from "expo-router";
// import { useState } from "react";
// import BudgetPlanHistory from "./budget-plan-history";
// import BudgetPlanSuppDocs from "./budget-plan-suppdocs";
// import PageLayout from "@/screens/_PageLayout";
// import { LoadingState } from "@/components/ui/loading-state";

// export default function BudgetPlanView() {
//     const router = useRouter();
//     const { plan_id } = useLocalSearchParams();
//     const { data: fetchedData, isLoading, refetch } = usegetBudgetPlanDetail(plan_id as string);
//     const [activeTab, setActiveTab] = useState<"plan" | "history" | "documents">("plan");
//     const [isRefreshing, setIsRefreshing] = useState(false);

//     // Refresh function for the plan tab
//     const handleRefresh = async () => {
//         setIsRefreshing(true);
//         await refetch();
//         setIsRefreshing(false);
//     };

//     if (isLoading) {
//         return (
//             <View className="flex-1 justify-center items-center">
//                 <LoadingState/>
//             </View>
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
//         <PageLayout
//             leftAction={
//               <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//                 <ChevronLeft size={24} className="text-gray-700" />
//               </TouchableOpacity>
//             }
            
//             headerTitle={<Text className="text-gray-900 text-[13px]">Budget Plan {fetchedData.plan_year}</Text>}
//             rightAction={
//                 <Text className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center" > </Text>
//             }          >
//           <View className="flex-1 bg-gray-50">
//             {/* Fixed Tab Headers (won't scroll) */}
//             <View className="bg-white border-b border-gray-200">
//                 <View className="flex-row">
//                     <TouchableOpacity
//                         className={`flex-1 py-4 items-center border-b-2 ${
//                             activeTab === "plan" ? "border-blue-500" : "border-transparent"
//                         }`}
//                         onPress={() => setActiveTab("plan")}
//                     >
//                         <Text className={`font-medium ${activeTab === "plan" ? "text-blue-600" : "text-gray-500"}`}>
//                             Budget Plan
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         className={`flex-1 py-4 items-center border-b-2 ${
//                             activeTab === "history" ? "border-blue-500" : "border-transparent"
//                         }`}
//                         onPress={() => setActiveTab("history")}
//                     >
//                         <Text className={`font-medium ${activeTab === "history" ? "text-blue-600" : "text-gray-500"}`}>
//                             Update History
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         className={`flex-1 py-4 items-center border-b-2 ${
//                             activeTab === "documents" ? "border-blue-500" : "border-transparent"
//                         }`}
//                         onPress={() => setActiveTab("documents")}
//                     >
//                         <Text className={`font-medium ${activeTab === "documents" ? "text-blue-600" : "text-gray-500"}`}>
//                             Documents
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             {/* Scrollable Content Area */}
//             <View className="flex-1">
//                 {activeTab === "plan" && (
//                     <ScrollView 
//                         className="flex-1"
//                         refreshControl={
//                             <RefreshControl
//                                 refreshing={isRefreshing}
//                                 onRefresh={handleRefresh}
//                                 colors={['#00a8f0']}
//                                 tintColor="#00a8f0"
//                             />
//                         }
//                     >
//                         <MobileBudgetPlanView budgetData={fetchedData} />
//                     </ScrollView>
//                 )}

//                 {activeTab === "history" && (
//                     <View className="flex-1">
//                         <BudgetPlanHistory planId={plan_id as string} />
//                     </View>
//                 )}

//                 {activeTab === "documents" && (
//                     <BudgetPlanSuppDocs 
//                         plan_id={plan_id as string} 
//                         isArchive={fetchedData?.plan_is_archive || false}
//                     />
//                 )}
//             </View>
//           </View>
//        </PageLayout>
//     );
// }


import { usegetBudgetPlanDetail } from "./queries/budgetPlanFetchQueries";
import MobileBudgetPlanView from "@/components/ui/budgetPlanTable";
import { View, SafeAreaView, Text, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import BudgetPlanHistory from "./budget-plan-history";
import BudgetPlanSuppDocs from "./budget-plan-suppdocs";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

export default function BudgetPlanView() {
    const router = useRouter();
    const { plan_id } = useLocalSearchParams();
    const { data: fetchedData, isLoading, refetch } = usegetBudgetPlanDetail(plan_id as string);
    const [activeTab, setActiveTab] = useState<"plan" | "history" | "documents">("plan");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <LoadingState/>
            </View>
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
        <PageLayout
            leftAction={
              <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                <ChevronLeft size={24} className="text-gray-700" />
              </TouchableOpacity>
            }
            headerTitle={<Text className="text-gray-900 text-[13px]">Budget Plan {fetchedData.plan_year}</Text>}
            rightAction={<Text className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center" > </Text>}
        >
          <View className="flex-1 bg-gray-50">
            {/* Fixed Tab Headers */}
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

            {/* Main ScrollView with RefreshControl */}
            <ScrollView 
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#00a8f0']}
                        tintColor="#00a8f0"
                    />
                }
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Tab Content */}
                <View className="flex-1">
                    {activeTab === "plan" && (
                        <MobileBudgetPlanView budgetData={fetchedData} />
                    )}

                    {activeTab === "history" && (
                        <BudgetPlanHistory planId={plan_id as string} />
                    )}

                    {activeTab === "documents" && (
                        <BudgetPlanSuppDocs 
                            plan_id={plan_id as string} 
                            isArchive={fetchedData?.plan_is_archive || false}
                        />
                    )}
                </View>
            </ScrollView>
          </View>
       </PageLayout>
    );
}   