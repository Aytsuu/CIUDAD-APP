import { FlatList, Text, View, Pressable, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { Archive, Trash2, ArchiveRestore } from "lucide-react-native";
import React from "react";
import { usegetBudgetPlanActive, usegetBudgetPlanInactive } from "./queries/budgetPlanFetchQueries"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BudgetPlanType } from "./queries/budgetPlanFetchQueries";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useArchiveBudgetPlan, useRestoreBudgetPlan } from "./queries/budgetPlanUpdateQueries";
import { useDeleteBudgetPlan } from "./queries/budgetPlanDeleteQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import { Search } from "@/lib/icons/Search"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { SearchInput } from "@/components/ui/search-input";
import { LoadingModal } from "@/components/ui/loading-modal";
import { LoadingState } from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/emptyState";

export default function BudgetPlanMain() {
  const router = useRouter();
  
  // State management
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, _setPageSize] = React.useState<number>(10);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active');

  // Query hooks
  const { data: activePlansData, isLoading: isLoadingActive, refetch: refetchActive} = usegetBudgetPlanActive(currentPage, pageSize, searchQuery);
  const { data: inactivePlansData, isLoading: isLoadingInactive, refetch: refetchInactive } = usegetBudgetPlanInactive(currentPage, pageSize, searchQuery);

  // Mutation hooks with pending states
  const { mutate: archivePlan, isPending: isArchivePending } = useArchiveBudgetPlan();
  const { mutate: restorePlan, isPending: isRestorePending } = useRestoreBudgetPlan();
  const { mutate: deletePlan, isPending: isDeletePending } = useDeleteBudgetPlan();

  // Data based on active tab
  const currentData = activeTab === 'active' ? activePlansData : inactivePlansData;
  const plans = currentData?.results || [];
  const totalCount = currentData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const isLoading = activeTab === 'active' ? isLoadingActive : isLoadingInactive;

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'active') {
      await refetchActive();
    } else {
      await refetchInactive();
    }
    setIsRefreshing(false);
  };

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

  // Simplified mutation handlers
  const handleArchive = (planId: number) => {
    archivePlan(planId, {
      onSuccess: () => {
        refetchActive();
        refetchInactive();
      }
    });
  };

  const handleRestore = (planId: number) => {
    restorePlan(planId, {
      onSuccess: () => {
        refetchActive();
        refetchInactive();
      }
    });
  };

  const handleDelete = (planId: number) => {
    deletePlan(planId, {
      onSuccess: () => {
        refetchInactive();
      }
    });
  };

  const handleOpenPlan = (plan_id: number) => {
    router.push({
      pathname: "/(treasurer)/budgetPlan/budget-plan-view",
      params: { plan_id: plan_id }
    });
  };

  // Budget Plan Card Component
  const RenderBudgetPlanCard = React.memo(({ item, isArchived }: { item: BudgetPlanType; isArchived: boolean }) => (
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
            
            {isArchived ? (
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
            ) : (
              <ConfirmationModal
                trigger={
                  <Pressable className="bg-red-50 p-2 rounded-lg ml-2">
                    <Archive size={16} color="#ef4444" />
                  </Pressable>
                }
                title="Archive Budget Plan"
                description="This budget plan will be moved to archive. You can restore it later if needed."
                actionLabel="Archive"
                onPress={() => handleArchive(Number(item.plan_id) || 0)}
              />
            )}
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
  ));

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery
    ? 'No records found. Try adjusting your search terms.'
    : 'No records available yet.';
    
    return (
      <View className="flex-1 justify-center items-center p-6">
        <EmptyState emptyMessage={emptyMessage} />
      </View>
    );
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  // Main content component for each tab
  // Main content component for each tab
const renderTabContent = (isArchived: boolean) => {
  if (isLoading && !isRefreshing) {
    return renderLoadingState();
  }

  return (
    <View className="flex-1">
      {totalCount === 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#00a8f0']}
              tintColor="#00a8f0"
            />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={plans}
          renderItem={({ item }) => <RenderBudgetPlanCard item={item} isArchived={isArchived} />}
          keyExtractor={(item) => item.plan_id?.toString() ?? Math.random().toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#00a8f0']}
              tintColor="#00a8f0"
            />
          }
          contentContainerStyle={{ 
            paddingBottom: 16,
            paddingTop: 16,
            flexGrow: 1
          }}
        />
      )}
    </View>
  );
};

  // Handle tab change
  const handleTabChange = (tab: 'active' | 'archive') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setSearchInputVal('');
  };

  return (
    <>
      <PageLayout
        leftAction={
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        wrapScroll={false}
        headerTitle={<Text className="text-gray-900 text-[13px]">Budget Plan</Text>}
        rightAction={
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        }
      >
        <View className="flex-1 bg-gray-50">
          {/* Search Bar */}
          {showSearch && (
            <SearchInput 
              value={searchInputVal}
              onChange={setSearchInputVal}
              onSubmit={handleSearch} 
            />
          )}

          {/* Tabs */}
          <View className="px-6 flex-1">
            <Tabs value={activeTab} onValueChange={val => handleTabChange(val as 'active' | 'archive')} className="flex-1">
              <TabsList className="bg-blue-50 flex-row justify-between">
                <TabsTrigger 
                  value="active" 
                  className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                    Active
                  </Text>
                </TabsTrigger>
                <TabsTrigger 
                  value="archive" 
                  className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <View className="flex-row items-center justify-center">
                    <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                      Inactive
                    </Text>
                  </View>
                </TabsTrigger>
              </TabsList>

              {/* Active Tab Content */}
              <TabsContent value="active" className="flex-1 mt-4">
                {renderTabContent(false)}
              </TabsContent>

              {/* Archive Tab Content */}
              <TabsContent value="archive" className="flex-1 mt-4">
                {renderTabContent(true)}
              </TabsContent>
            </Tabs>
          </View>
        </View>
      </PageLayout>
      
      <LoadingModal visible={isArchivePending || isRestorePending || isDeletePending} />
    </>
  );  
}