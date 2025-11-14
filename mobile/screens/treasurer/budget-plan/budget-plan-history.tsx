// import { SafeAreaView, Text, ScrollView, View, RefreshControl } from "react-native";
// import { useState } from "react";
// import { useGetBudgetPlanHistory, type BudgetPlanHistory } from "./queries/budgetPlanFetchQueries";
// import { formatTimestamp } from "@/helpers/timestampformatter";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { LoadingState } from "@/components/ui/loading-state";
// import { History } from "lucide-react-native";

// export default function BudgetPlanHistory({ planId }: { planId: string }) {
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const { data: fetchedData = [], isLoading, refetch } = useGetBudgetPlanHistory(planId);

//   // Refresh function
//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await refetch();
//     setIsRefreshing(false);
//   };

//   if (isLoading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white pt-10">
//         <LoadingState />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       {/* Scrollable Content */}
//       <ScrollView 
//         className="flex-1" 
//         contentContainerStyle={{ 
//             flexGrow: 1,
//             minHeight: '100%' // Ensure minimum scrollable area
//         }}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={handleRefresh}
//             colors={['#00a8f0']}
//             tintColor="#00a8f0"
//           />
//         }
//       >
//         {fetchedData.length > 0 ? (
//           <View className="p-6">
//             {fetchedData.map((item) => (
//               <Card key={item.bph_id} className="mb-4 border-2 border-gray-200 shadow-sm bg-white rounded-lg">
//                 <CardHeader className="pb-2">
//                   <Text className="text-sm text-gray-500">
//                     {formatTimestamp(item.bph_date_updated)}
//                   </Text>
//                 </CardHeader>
                
//                 <CardContent className="pt-0">
//                   <View className="space-y-4">
//                     {/* From Section */}
//                     <View className="border-b border-gray-100 pb-3">
//                       <Text className="text-sm font-medium text-gray-600 mb-1">From Item</Text>
//                       <Text className="text-base font-medium text-gray-800">{item.bph_source_item}</Text>
                      
//                       <View className="flex-row justify-between mt-2">
//                         <Text className="text-sm text-gray-500">Previous Balance:</Text>
//                         <Text className="text-sm text-gray-700">
//                           {item.bph_from_prev_balance}
//                         </Text>
//                       </View>
                      
//                       <View className="flex-row justify-between">
//                         <Text className="text-sm text-gray-500">New Balance:</Text>
//                         <Text className="text-sm font-medium text-red-600">
//                           {item.bph_from_new_balance}
//                         </Text>
//                       </View>
//                     </View>

//                     {/* To Section */}
//                     <View className="border-b border-gray-100 pb-3">
//                       <Text className="text-sm font-medium text-gray-600 mb-1">To Item</Text>
//                       <Text className="text-base font-medium text-gray-800">{item.bph_to_item}</Text>
                      
//                       <View className="flex-row justify-between mt-2">
//                         <Text className="text-sm text-gray-500">Previous Balance:</Text>
//                         <Text className="text-sm text-gray-700">
//                           {item.bph_to_prev_balance}
//                         </Text>
//                       </View>
                      
//                       <View className="flex-row justify-between">
//                         <Text className="text-sm text-gray-500">New Balance:</Text>
//                         <Text className="text-sm font-medium text-green-600">
//                           {item.bph_to_new_balance}
//                         </Text>
//                       </View>
//                     </View>

//                     {/* Transfer Amount */}
//                     <View className="flex-row justify-between items-center pt-2">
//                       <Text className="text-sm font-medium text-gray-600">Transferred Amount:</Text>
//                       <Text className="text-base font-bold text-blue-600">
//                         {item.bph_transfer_amount}
//                       </Text>
//                     </View>
//                   </View>
//                 </CardContent>
//               </Card>
//             ))}
//           </View>
//         ) : (
//           // Empty state with proper scrollable area
//           <View className="flex-1 min-h-full">
//             <View className="flex-1 justify-center items-center py-16 px-6">
//               <View className="bg-white rounded-xl p-8 items-center border border-gray-200 shadow-sm">
//                 <History size={48} className="text-gray-300 mb-4" />
//                 <Text className="text-gray-500 text-center text-md font-medium mb-2">
//                   No Budget History
//                 </Text>
//                 <Text className="text-gray-400 text-center text-sm">
//                   No budget transfers have been made for this plan yet.
//                 </Text>
//               </View>
//             </View>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

import { Text, View } from "react-native";
import { useGetBudgetPlanHistory, type BudgetPlanHistory } from "./queries/budgetPlanFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { History } from "lucide-react-native";

export default function BudgetPlanHistory({ planId }: { planId: string }) {
  const { data: fetchedData = [], isLoading } = useGetBudgetPlanHistory(planId);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white pt-10">
        <LoadingState />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {fetchedData.length > 0 ? (
        <View className="p-6">
          {fetchedData.map((item) => (
            <Card key={item.bph_id} className="mb-4 border-2 border-gray-200 shadow-sm bg-white rounded-lg">
              <CardHeader className="pb-2">
                <Text className="text-sm text-gray-500">
                  {formatTimestamp(item.bph_date_updated)}
                </Text>
              </CardHeader>
              
              <CardContent className="pt-0">
                <View className="space-y-4">
                  {/* From Section */}
                  <View className="border-b border-gray-100 pb-3">
                    <Text className="text-sm font-medium text-gray-600 mb-1">From Item</Text>
                    <Text className="text-base font-medium text-gray-800">{item.bph_source_item}</Text>
                    
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-sm text-gray-500">Previous Balance:</Text>
                      <Text className="text-sm text-gray-700">
                        {item.bph_from_prev_balance}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-500">New Balance:</Text>
                      <Text className="text-sm font-medium text-red-600">
                        {item.bph_from_new_balance}
                      </Text>
                    </View>
                  </View>

                  {/* To Section */}
                  <View className="border-b border-gray-100 pb-3">
                    <Text className="text-sm font-medium text-gray-600 mb-1">To Item</Text>
                    <Text className="text-base font-medium text-gray-800">{item.bph_to_item}</Text>
                    
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-sm text-gray-500">Previous Balance:</Text>
                      <Text className="text-sm text-gray-700">
                        {item.bph_to_prev_balance}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-500">New Balance:</Text>
                      <Text className="text-sm font-medium text-green-600">
                        {item.bph_to_new_balance}
                      </Text>
                    </View>
                  </View>

                  {/* Transfer Amount */}
                  <View className="flex-row justify-between items-center pt-2">
                    <Text className="text-sm font-medium text-gray-600">Transferred Amount:</Text>
                    <Text className="text-base font-bold text-blue-600">
                      {item.bph_transfer_amount}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center py-16 px-6">
          <View className="bg-white rounded-xl p-8 items-center border border-gray-200 shadow-sm">
            <History size={48} className="text-gray-300 mb-4" />
            <Text className="text-gray-500 text-center text-md font-medium mb-2">
              No Budget History
            </Text>
            <Text className="text-gray-400 text-center text-sm">
              No budget transfers have been made for this plan yet.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}