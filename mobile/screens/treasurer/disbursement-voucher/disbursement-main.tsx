import React from "react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator
} from "react-native";
import {
  Archive,
  ArchiveRestore,
  Trash,
  ChevronLeft,
} from "lucide-react-native";
import {
  useGetDisbursementVouchers,
  useGetDisbursementVoucherYears,
  usePermanentDeleteDisbursementVoucher,
  useArchiveDisbursementVoucher,
  useRestoreDisbursementVoucher,
} from "./disbursement-queries";
import { DisbursementView } from "./disbursement-view";
import { useRouter } from "expo-router";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { DisbursementVoucher } from "./disbursement-types";
import { SelectLayout } from "@/components/ui/select-layout";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";

const INITIAL_PAGE_SIZE = 10;

const DisbursementVoucherList: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [_showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] =
    useState<DisbursementVoucher | null>(null);
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const [selectedYear, setSelectedYear] = useState("All");
  const [showSearch, setShowSearch] = useState(false);
  
  // Pagination states - simplified version
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const { data: availableYears = [] } = useGetDisbursementVoucherYears();
  const {
    data: disbursementsData,
    isLoading,
    refetch,
    error,
    isFetching,
  } = useGetDisbursementVouchers(
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedYear !== "All" ? selectedYear : "all",
    viewMode === "archived"
  );

  const { mutate: deleteDisbursement, isPending: isDeleting } = usePermanentDeleteDisbursementVoucher();
  const { mutate: archiveDisbursement, isPending: isArchiving } = useArchiveDisbursementVoucher();
  const { mutate: restoreDisbursement, isPending: isRestoring } = useRestoreDisbursementVoucher();

  const disbursements = disbursementsData?.results || [];
  const totalCount = disbursementsData?.count || 0;
  
  // Calculate if there are more items to load
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = currentPage < totalPages;

  // Reset pagination when search, filter, year or view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedYear, viewMode]);

  // Handle scrolling timeout
  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  // Handle load more - increment page number
  const handleLoadMore = () => {
    if (isScrolling && hasMore && !isFetching && !isLoadMore) {
      setIsLoadMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    await refetch();
    setIsRefreshing(false);
  };

  // Effects
  useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  const yearFilterOptions = [
    { label: "All Years", value: "All" },
    ...availableYears.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    })),
  ];

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  };

  const handleArchivePress = (disbursement: DisbursementVoucher, event?: any) => {
    event?.stopPropagation?.();
    archiveDisbursement(disbursement.dis_num, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleRestorePress = (disbursement: DisbursementVoucher, event?: any) => {
    event?.stopPropagation?.();
    restoreDisbursement(disbursement.dis_num, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleDeletePress = (disbursement: DisbursementVoucher, event?: any) => {
    event?.stopPropagation?.();
    deleteDisbursement(disbursement.dis_num, {
      onSuccess: () => {
        refetch();
        setShowDeleteSuccess(true);
      },
    });
  };

  const handleDisbursementPress = (disbursement: DisbursementVoucher) => {
    setSelectedDisbursement(disbursement);
  };

  const handleViewModeChange = (mode: "active" | "archived") => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const handleYearChange = (option: { label: string; value: string }) => {
    setSelectedYear(option.value);
    setCurrentPage(1);
  };

  // Memoized card component for better performance
  const RenderDisbursementCard = React.memo(({ disbursement }: { disbursement: DisbursementVoucher }) => (
    <TouchableOpacity
      onPress={() => handleDisbursementPress(disbursement)}
      activeOpacity={0.8}
      className="mb-3"
    >
      <Card className="border-2 border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg text-[#1a2332] mb-1 font-sans">
                DV #{disbursement.dis_num}
              </Text>
              <Text className="text-sm text-gray-500 font-sans">
                Payee: {disbursement.dis_payee || "Unknown Payee"}
              </Text>
            </View>
            <View className="flex-row">
              {viewMode === "active" ? (
                <ConfirmationModal
                  trigger={
                    <TouchableOpacity className="bg-red-50 p-2 rounded-lg ml-2">
                      <Archive size={16} color="#ef4444" />
                    </TouchableOpacity>
                  }
                  title={`Archive DV #${disbursement.dis_num}`}
                  description="Are you sure you want to archive this disbursement voucher?"
                  actionLabel="Archive"
                  onPress={() => handleArchivePress(disbursement)}
                />
              ) : (
                <>
                  <ConfirmationModal
                    trigger={
                      <TouchableOpacity className="bg-green-50 p-2 rounded-lg ml-2">
                        <ArchiveRestore size={16} color="#10b981" />
                      </TouchableOpacity>
                    }
                    title={`Restore DV #${disbursement.dis_num}`}
                    description="Are you sure you want to restore this disbursement voucher?"
                    actionLabel="Restore"
                    onPress={() => handleRestorePress(disbursement)}
                  />
                  <ConfirmationModal
                    trigger={
                      <TouchableOpacity className="bg-red-50 p-2 rounded-lg ml-2">
                        <Trash size={16} color="#ef4444" />
                      </TouchableOpacity>
                    }
                    title={`Delete DV #${disbursement.dis_num}`}
                    description="Please confirm if you would like to proceed with deleting the voucher. This action cannot be undone."
                    actionLabel="Delete"
                    variant="destructive"
                    onPress={() => handleDeletePress(disbursement)}
                  />
                </>
              )}
            </View>
          </View>
        </CardHeader>

        <CardContent className="pt-3 border-t border-gray-200">
          <View className="space-y-3">
            <View className="pb-2">
              <Text className="text-sm text-gray-600 mb-1 font-sans">Particulars:</Text>
              <Text className="text-base text-black font-sans" numberOfLines={2} ellipsizeMode="tail">
                {disbursement.dis_particulars?.map((p) => p.forPayment).join(", ") || "No particulars provided"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 font-sans">Date:</Text>
              <Text className="text-sm font-medium text-[#1a2332] font-sans">
                {disbursement.dis_date || "No date provided"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 font-sans">Fund:</Text>
              <Text className="text-sm font-medium text-[#1a2332] font-sans">
                ₱
                {new Intl.NumberFormat("en-US", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(disbursement.dis_fund || 0)}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 font-sans">Total Amount:</Text>
              <Text className="text-lg font-bold text-[#2a3a61] font-sans">
                ₱
                {disbursement.dis_particulars && disbursement.dis_particulars.length > 0
                  ? new Intl.NumberFormat("en-US", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(
                      disbursement.dis_particulars.reduce((total, particular) => {
                        const amount = particular.amount || 0;
                        return total + (typeof amount === "string" ? parseFloat(amount) : amount);
                      }, 0)
                    )
                  : "0.00"}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  ));

  // Render function for FlatList
  const renderItem = React.useCallback(
    ({ item }: { item: DisbursementVoucher }) => <RenderDisbursementCard disbursement={item} />,
    []
  );

  const renderEmptyState = () => {
    const emptyMessage = searchQuery || selectedYear !== "All"
      ? "No disbursement vouchers found"
      : `No ${viewMode === "active" ? "active" : "archived"} disbursement vouchers found.`;
    
    return (
      <View className="flex-1 justify-center items-center py-12">
        <Text className="text-gray-500 text-center font-sans">
          {emptyMessage}
        </Text>
      </View>
    );
  };

  if (selectedDisbursement) {
    return (
      <DisbursementView 
        disNum={selectedDisbursement.dis_num} 
        disbursement={selectedDisbursement} 
        onBack={() => setSelectedDisbursement(null)} 
      />
    );
  }

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Disbursement Vouchers</Text>}
        rightAction={
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        }
        wrapScroll={false}
      >
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-lg font-medium mb-2 font-sans">
            Error loading vouchers
          </Text>
          <Text className="text-gray-600 text-center mb-4 font-sans">
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-primaryBlue px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium font-sans">Retry</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Disbursement Vouchers</Text>}
        rightAction={
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        }
        wrapScroll={false}
      >
        <View className="flex-1 bg-white">
          {/* Search Bar */}
          {showSearch && (
            <SearchInput 
              value={searchInputVal}
              onChange={setSearchInputVal}
              onSubmit={handleSearch} 
            />
          )}

          <View className="flex-1 px-6">
            {/* Year Filter */}
            <View className="py-3">
              <SelectLayout
                options={yearFilterOptions}
                selectedValue={selectedYear}
                onSelect={handleYearChange}
                placeholder="Filter by year"
                isInModal={false}
              />
            </View>

            {/* Result Count - Like receipt page */}
            {!isRefreshing && disbursements.length > 0 && (
              <View className="mb-2">
                <Text className="text-xs text-gray-500 font-sans">
                  Showing {disbursements.length} of {totalCount} vouchers
                  {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </Text>
              </View>
            )}

            {/* Tabs */}
            <Tabs value={viewMode} onValueChange={val => handleViewModeChange(val as "active" | "archived")} className="flex-1">
              <TabsList className="bg-blue-50 flex-row justify-between">
                <TabsTrigger 
                  value="active" 
                  className={`flex-1 mx-1 ${viewMode === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <Text className={`font-sans text-[13px] ${viewMode === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                    Active
                  </Text>
                </TabsTrigger>
                <TabsTrigger 
                  value="archived" 
                  className={`flex-1 mx-1 ${viewMode === 'archived' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <Text className={`font-sans text-[13px] ${viewMode === 'archived' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                    Archived
                  </Text>
                </TabsTrigger>
              </TabsList>

              {/* Both Tab Contents use the same structure */}
              <TabsContent value="active" className="flex-1 mt-4">
                {isLoading && isInitialRender ? (
                  <View className="flex-1 justify-center items-center">
                    <LoadingState/>
                  </View>
                ) : (
                  <View className="flex-1">
                    {disbursements.length === 0 ? (
                      renderEmptyState()
                    ) : (
                      <FlatList
                        data={disbursements}
                        maxToRenderPerBatch={5}
                        overScrollMode="never"
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        initialNumToRender={5}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        onScroll={handleScroll}
                        windowSize={11}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `dv-${item.dis_num}-${index}`}
                        removeClippedSubviews
                        contentContainerStyle={{
                          paddingBottom: 20,
                          paddingTop: 8,
                          flexGrow: 1,
                        }}
                        refreshControl={
                          <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#00a8f0']}
                          />
                        }
                        ListFooterComponent={() =>
                          isFetching && isLoadMore ? (
                            <View className="py-4 items-center">
                              <ActivityIndicator size="small" color="#3B82F6" />
                              <Text className="text-xs text-gray-500 mt-2 font-sans">
                                Loading more vouchers...
                              </Text>
                            </View>
                          ) : (
                            !hasMore &&
                            disbursements.length > 0 && (
                              <View className="py-4 items-center">
                                <Text className="text-xs text-gray-400 font-sans">
                                  No more vouchers
                                </Text>
                              </View>
                            )
                          )
                        }
                      />
                    )}
                  </View>
                )}
              </TabsContent>

              <TabsContent value="archived" className="flex-1 mt-4">
                {isLoading && isInitialRender ? (
                  <View className="flex-1 justify-center items-center">
                    <LoadingState/>
                  </View>
                ) : (
                  <View className="flex-1">
                    {disbursements.length === 0 ? (
                      renderEmptyState()
                    ) : (
                      <FlatList
                        data={disbursements}
                        maxToRenderPerBatch={5}
                        overScrollMode="never"
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        initialNumToRender={5}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        onScroll={handleScroll}
                        windowSize={11}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `dv-${item.dis_num}-${index}`}
                        removeClippedSubviews
                        contentContainerStyle={{
                          paddingBottom: 20,
                          paddingTop: 8,
                          flexGrow: 1,
                        }}
                        refreshControl={
                          <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#00a8f0']}
                          />
                        }
                        ListFooterComponent={() =>
                          isFetching && isLoadMore ? (
                            <View className="py-4 items-center">
                              <ActivityIndicator size="small" color="#3B82F6" />
                              <Text className="text-xs text-gray-500 mt-2 font-sans">
                                Loading more vouchers...
                              </Text>
                            </View>
                          ) : (
                            !hasMore &&
                            disbursements.length > 0 && (
                              <View className="py-4 items-center">
                                <Text className="text-xs text-gray-400 font-sans">
                                  No more vouchers
                                </Text>
                              </View>
                            )
                          )
                        }
                      />
                    )}
                  </View>
                )}
              </TabsContent>
            </Tabs>
          </View>
        </View>
      </PageLayout>

      <LoadingModal 
        visible={isArchiving || isRestoring || isDeleting} 
      />
    </>
  );
};

export default DisbursementVoucherList;