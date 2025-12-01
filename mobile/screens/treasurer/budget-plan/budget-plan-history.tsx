// import { 
//   Text, 
//   View, 
//   FlatList, 
//   RefreshControl,
//   ActivityIndicator 
// } from "react-native";
// import { useGetBudgetPlanHistory, type BudgetPlanHistory } from "./queries/budgetPlanFetchQueries";
// import { formatTimestamp } from "@/helpers/timestampformatter";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { LoadingState } from "@/components/ui/loading-state";
// import { History } from "lucide-react-native";
// import React from "react";

// interface BudgetPlanHistoryProps {
//   planId: string;
// }

// const INITIAL_PAGE_SIZE = 10;

// export default function BudgetPlanHistory({ planId }: { planId: string }) {
//   // ================= STATE INITIALIZATION =================
//   const [currentPage, setCurrentPage] = React.useState<number>(1);
//   const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE);
//   const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
//   const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
//   const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
//   const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true);
//   const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

//   // ================= QUERY HOOK =================
//   const { 
//     data: budgetHistoryData, 
//     isLoading, 
//     refetch,
//     isFetching
//   } = useGetBudgetPlanHistory(planId, currentPage, pageSize);

//   const historyRecords = budgetHistoryData?.results || [];
//   const totalCount = budgetHistoryData?.count || 0;
//   const hasNext = budgetHistoryData?.next;

//   // ================= SIDE EFFECTS =================
//   React.useEffect(() => {
//     if (!isFetching && isRefreshing) setIsRefreshing(false);
//   }, [isFetching, isRefreshing]);

//   React.useEffect(() => {
//     if (!isLoading && isInitialRender) setIsInitialRender(false);
//   }, [isLoading, isInitialRender]);

//   React.useEffect(() => {
//     if (!isFetching && isLoadMore) setIsLoadMore(false);
//   }, [isFetching, isLoadMore]);

//   // ================= HANDLERS =================
//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await refetch();
//     setIsRefreshing(false);
//   };

//   const handleScroll = () => {
//     setIsScrolling(true);
//     if (scrollTimeout.current) {
//       clearTimeout(scrollTimeout.current);
//     }

//     scrollTimeout.current = setTimeout(() => {
//       setIsScrolling(false);
//     }, 150);
//   };

//   const handleLoadMore = () => {
//     if (isScrolling) {
//       setIsLoadMore(true);
//     }

//     if (hasNext && isScrolling) {
//       setPageSize((prev) => prev + 5);
//     }
//   };

//   // History Card Component
//   const RenderHistoryCard = React.memo(({ item }: { item: BudgetPlanHistory }) => (
//     <Card key={item.bph_id} className="mb-4 border-2 border-gray-200 shadow-sm bg-white rounded-lg">
//       <CardHeader className="pb-2">
//         <Text className="text-sm text-gray-500">
//           {formatTimestamp(item.bph_date_updated)}
//         </Text>
//       </CardHeader>
      
//       <CardContent className="pt-0">
//         <View className="space-y-4">
//           {/* From Section */}
//           <View className="border-b border-gray-100 pb-3">
//             <Text className="text-sm font-medium text-gray-600 mb-1">From Item</Text>
//             <Text className="text-base font-medium text-gray-800">{item.bph_source_item}</Text>
            
//             <View className="flex-row justify-between mt-2">
//               <Text className="text-sm text-gray-500">Previous Balance:</Text>
//               <Text className="text-sm text-gray-700">
//                 {item.bph_from_prev_balance}
//               </Text>
//             </View>
            
//             <View className="flex-row justify-between">
//               <Text className="text-sm text-gray-500">New Balance:</Text>
//               <Text className="text-sm font-medium text-red-600">
//                 {item.bph_from_new_balance}
//               </Text>
//             </View>
//           </View>

//           {/* To Section */}
//           <View className="border-b border-gray-100 pb-3">
//             <Text className="text-sm font-medium text-gray-600 mb-1">To Item</Text>
//             <Text className="text-base font-medium text-gray-800">{item.bph_to_item}</Text>
            
//             <View className="flex-row justify-between mt-2">
//               <Text className="text-sm text-gray-500">Previous Balance:</Text>
//               <Text className="text-sm text-gray-700">
//                 {item.bph_to_prev_balance}
//               </Text>
//             </View>
            
//             <View className="flex-row justify-between">
//               <Text className="text-sm text-gray-500">New Balance:</Text>
//               <Text className="text-sm font-medium text-green-600">
//                 {item.bph_to_new_balance}
//               </Text>
//             </View>
//           </View>

//           {/* Transfer Amount */}
//           <View className="flex-row justify-between items-center pt-2">
//             <Text className="text-sm font-medium text-gray-600">Transferred Amount:</Text>
//             <Text className="text-base font-bold text-blue-600">
//               {item.bph_transfer_amount}
//             </Text>
//           </View>
//         </View>
//       </CardContent>
//     </Card>
//   ));

//   const renderItem = React.useCallback(
//     ({ item }: { item: BudgetPlanHistory }) => <RenderHistoryCard item={item} />,
//     []
//   );

//   // Loading state for initial load
//   if (isLoading) {
//     return <LoadingState />;
//   }

//   // ================= MAIN RENDER =================
//   return (
//     <View className="flex-1 bg-white">
//       {/* Result Count */}
//       {!isRefreshing && historyRecords.length > 0 && (
//         <Text className="text-xs text-gray-500 mt-2 mb-3 px-6">{`Showing ${historyRecords.length} of ${totalCount} history records`}</Text>
//       )}
      
//       {/* Loading state during refresh */}
//       {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

//       {/* Main Content - only render when not refreshing */}
//       {!isRefreshing && (
//         <FlatList
//           maxToRenderPerBatch={10}
//           overScrollMode="never"
//           data={historyRecords}
//           showsVerticalScrollIndicator={false}
//           showsHorizontalScrollIndicator={false}
//           initialNumToRender={10}
//           onEndReached={handleLoadMore}
//           onEndReachedThreshold={0.3}
//           onScroll={handleScroll}
//           windowSize={21}
//           renderItem={renderItem}
//           keyExtractor={(item) => `budget-history-${item.bph_id}`}
//           removeClippedSubviews
//           contentContainerStyle={{
//             paddingHorizontal: 24,
//             paddingTop: 0,
//             paddingBottom: 20,
//           }}
//           refreshControl={
//             <RefreshControl
//               refreshing={isRefreshing}
//               onRefresh={handleRefresh}
//               colors={["#00a8f0"]}
//             />
//           }
//           ListFooterComponent={() =>
//             isFetching ? (
//               <View className="py-4 items-center">
//                 <ActivityIndicator size="small" color="#3B82F6" />
//                 <Text className="text-xs text-gray-500 mt-2">
//                   Loading more...
//                 </Text>
//               </View>
//             ) : (
//               !hasNext &&
//               historyRecords.length > 0 && (
//                 <View className="py-4 items-center">
//                   <Text className="text-xs text-gray-400">
//                     No more records
//                   </Text>
//                 </View>
//               )
//             )
//           }
//           ListEmptyComponent={() => (
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
//           )}
//         />
//       )}
//     </View>
//   );
// }

import { 
  Text, 
  View, 
  FlatList, 
  RefreshControl,
  ActivityIndicator 
} from "react-native";
import { useGetBudgetPlanHistory, type BudgetPlanHistory } from "./queries/budgetPlanFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import React from "react";

interface BudgetPlanHistoryProps {
  planId: string;
}

const INITIAL_PAGE_SIZE = 10;

export default function BudgetPlanHistory({ planId }: { planId: string }) {
  // ================= STATE INITIALIZATION =================
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // ================= QUERY HOOK =================
  const { 
    data: budgetHistoryData, 
    isLoading, 
    refetch,
    isFetching
  } = useGetBudgetPlanHistory(planId, currentPage, pageSize);

  const historyRecords = budgetHistoryData?.results || [];
  const totalCount = budgetHistoryData?.count || 0;
  const hasNext = budgetHistoryData?.next;

  // ================= SIDE EFFECTS =================
  React.useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  React.useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  React.useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  // ================= HANDLERS =================
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const handleLoadMore = () => {
    if (isScrolling) {
      setIsLoadMore(true);
    }

    if (hasNext && isScrolling) {
      setPageSize((prev) => prev + 5);
    }
  };

  // History Card Component
  const RenderHistoryCard = React.memo(({ item }: { item: BudgetPlanHistory }) => (
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
  ));

  const renderItem = React.useCallback(
    ({ item }: { item: BudgetPlanHistory }) => <RenderHistoryCard item={item} />,
    []
  );

  // Simple empty state component - EXACT SAME as your other screens
  const renderEmptyState = () => {
    return (
      <View className="flex-1 justify-center items-center h-full">
        <Text className="text-gray-500 text-sm">No budget transfers have been made for this plan yet.</Text>
      </View>
    );
  };

  // Loading state for initial load
  if (isLoading) {
    return <LoadingState />;
  }

  // ================= MAIN RENDER =================
  return (
    <View className="flex-1 bg-white">
      {/* Result Count */}
      {!isRefreshing && historyRecords.length > 0 && (
        <Text className="text-xs text-gray-500 mt-2 mb-3 px-6">{`Showing ${historyRecords.length} of ${totalCount} history records`}</Text>
      )}
      
      {/* Loading state during refresh */}
      {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

      {/* Main Content - only render when not refreshing */}
      {!isRefreshing && (
        <FlatList
          maxToRenderPerBatch={10}
          overScrollMode="never"
          data={historyRecords}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={10}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          onScroll={handleScroll}
          windowSize={21}
          renderItem={renderItem}
          keyExtractor={(item) => `budget-history-${item.bph_id}`}
          removeClippedSubviews
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 0,
            paddingBottom: 20,
            flexGrow: 1, // KEY: Makes empty state center properly
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#00a8f0"]}
            />
          }
          ListFooterComponent={() =>
            isFetching ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-xs text-gray-500 mt-2">
                  Loading more...
                </Text>
              </View>
            ) : (
              !hasNext &&
              historyRecords.length > 0 && (
                <View className="py-4 items-center">
                  <Text className="text-xs text-gray-400">
                    No more records
                  </Text>
                </View>
              )
            )
          }
          ListEmptyComponent={renderEmptyState()}
        />
      )}
    </View>
  );
}