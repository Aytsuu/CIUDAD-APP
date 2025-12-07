import { FlatList, Text, View, Pressable, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { ArchiveRestore, Trash2 } from "lucide-react-native";
import React from "react";
import { usegetBudgetPlanInactive } from "./queries/budgetPlanFetchQueries";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BudgetPlanType } from "./queries/budgetPlanFetchQueries";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useRestoreBudgetPlan } from "./queries/budgetPlanUpdateQueries";
import { useDeleteBudgetPlan } from "./queries/budgetPlanDeleteQueries";
import { useRouter } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";

interface InactiveBudgetPlanScreenProps {
  searchQuery: string;
}

const INITIAL_PAGE_SIZE = 10;

export default function InactiveBudgetPlanScreen({ searchQuery }: InactiveBudgetPlanScreenProps) {
  const router = useRouter();
  
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
    data: inactivePlansData, 
    isLoading, 
    refetch,
    isFetching
  } = usegetBudgetPlanInactive(currentPage, pageSize, searchQuery);

  const plans = inactivePlansData?.results || [];
  const totalCount = inactivePlansData?.count || 0;
  const hasNext = inactivePlansData?.next;

  // ================= MUTATION HOOKS =================
  const { mutate: restorePlan } = useRestoreBudgetPlan();
  const { mutate: deletePlan } = useDeleteBudgetPlan();

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

  const handleRestore = (planId: number) => {
    restorePlan(planId, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const handleDelete = (planId: number) => {
    deletePlan(planId, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const handleOpenPlan = (plan_id: number) => {
    router.push({
      pathname: "/(treasurer)/budgetPlan/budget-plan-view",
      params: { plan_id: plan_id }
    });
  };

  // ================= RENDER HELPERS =================
  const BudgetPlanCard = React.memo(({ item }: { item: BudgetPlanType }) => {
    return (
      <TouchableOpacity 
        onPress={() => handleOpenPlan(item.plan_id || 0)}
        activeOpacity={0.8}
        className="mb-3"
      >
        <Card className="border-2 border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-lg text-[#1a2332] mb-1">
                  Budget Plan {item.plan_year}
                </Text>
                <Text className="text-sm text-gray-500">
                  Issue Date: {item.plan_issue_date ? new Date(item.plan_issue_date).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              
              <View className="flex-row">
                <ConfirmationModal
                  trigger={
                    <Pressable className="bg-green-50 p-2 rounded-lg ml-2">
                      <ArchiveRestore size={16} color="#10b981" />
                    </Pressable>
                  }
                  title="Restore Budget Plan"
                  description="This budget plan will be restored to active plans."
                  actionLabel="Restore"
                  onPress={() => handleRestore(Number(item.plan_id) || 0)}
                />
                <ConfirmationModal
                  trigger={
                    <Pressable className="bg-red-50 p-2 rounded-lg ml-2">
                      <Trash2 size={16} color="#ef4444" />
                    </Pressable>
                  }
                  title="Delete Budget Plan"
                  description="This action cannot be undone. The budget plan will be permanently deleted."
                  actionLabel="Delete"
                  onPress={() => handleDelete(Number(item.plan_id) || 0)}
                />
              </View>
            </View>
          </CardHeader>

          <CardContent className="pt-3 border-t border-gray-200">
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">Budgetary Obligations:</Text>
                <Text className="text-lg font-bold text-[#2a3a61]">
                  ₱{item.plan_budgetaryObligations?.toLocaleString() || '0'}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">Balance Unappropriated:</Text>
                <Text className="text-lg font-bold text-[#2a3a61]">
                  ₱{item.plan_balUnappropriated?.toLocaleString() || '0'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  });

  const renderItem = React.useCallback(
    ({ item }: { item: BudgetPlanType }) => <BudgetPlanCard item={item} />,
    []
  );

  // Simple empty state component - EXACT SAME as your other screens
  const renderEmptyState = () => {
    const message = searchQuery
      ? "No budget plans found matching your criteria."
      : "No archived budget plans found.";
    
    return (
      <View className="flex-1 justify-center items-center h-full">
        <Text className="text-gray-500 text-sm">{message}</Text>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  // ================= MAIN RENDER =================
  return (
    <View className="flex-1">
      {/* Result Count - Only show when there are items */}
      {!isRefreshing && plans.length > 0 && (
        <Text className="text-xs text-gray-500 mt-2 mb-3 px-6">{`Showing ${plans.length} of ${totalCount} budget plans`}</Text>
      )}
      
      {/* Loading state during refresh */}
      {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

      {/* Main Content - only render when not refreshing */}
      {!isRefreshing && (
        <FlatList
          maxToRenderPerBatch={10}
          overScrollMode="never"
          data={plans}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={10}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          onScroll={handleScroll}
          windowSize={21}
          renderItem={renderItem}
          keyExtractor={(item) => `budget-inactive-${item.plan_id}`}
          removeClippedSubviews
          contentContainerStyle={{
            paddingHorizontal: 0,
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
              plans.length > 0 && (
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