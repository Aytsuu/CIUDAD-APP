import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
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

const DisbursementVoucherList: React.FC = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [_showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] =
    useState<DisbursementVoucher | null>(null);
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const [selectedYear, setSelectedYear] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  
  const pageSize = 10;
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
  const totalPages = Math.ceil(totalCount / pageSize);

  const yearFilterOptions = [
    { label: "All Years", value: "All" },
    ...availableYears.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    })),
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    setCurrentPage(1);
  };

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

  const RenderDisbursementCard = ({ disbursement }: { disbursement: DisbursementVoucher }) => (
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
            onPress={() => refetch()}
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
        <View className="flex-1 bg-gray-50">
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

            {/* Tabs */}
            <Tabs value={viewMode} onValueChange={val => handleViewModeChange(val as "active" | "archived")} className="flex-1">
              <TabsList className="bg-blue-50 flex-row justify-between">
                <TabsTrigger 
                  value="active" 
                  className={`flex-1 mx-1 ${viewMode === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <Text className={`font-sans ${viewMode === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                    Active
                  </Text>
                </TabsTrigger>
                <TabsTrigger 
                  value="archived" 
                  className={`flex-1 mx-1 ${viewMode === 'archived' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <Text className={`font-sans ${viewMode === 'archived' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                    Archived
                  </Text>
                </TabsTrigger>
              </TabsList>

              {/* Active Tab Content */}
              <TabsContent value="active" className="flex-1 mt-4">
                {isLoading ? (
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
                        renderItem={({ item }) => <RenderDisbursementCard disbursement={item} />}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                          <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#00a8f0']}
                          />
                        }
                        contentContainerStyle={{ 
                          paddingBottom: 16,
                          paddingTop: 16
                        }}
                        ListFooterComponent={
                          totalPages > 1 ? (
                            <View className="flex-row justify-between items-center mt-4 px-4">
                              <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
                              >
                                <Text className="text-primaryBlue font-bold font-sans">← Previous</Text>
                              </TouchableOpacity>

                              <View className="flex-row items-center">
                                {isFetching && (
                                  <LoadingState />
                                )}
                                <Text className="text-gray-500 font-sans">
                                  Page {currentPage} of {totalPages}
                                </Text>
                              </View>

                              <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`p-2 ${currentPage === totalPages ? "opacity-50" : ""}`}
                              >
                                <Text className="text-primaryBlue font-bold font-sans">Next →</Text>
                              </TouchableOpacity>
                            </View>
                          ) : null
                        }
                      />
                    )}
                  </View>
                )}
              </TabsContent>

              {/* Archived Tab Content */}
              <TabsContent value="archived" className="flex-1 mt-4">
                {isLoading ? (
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
                        renderItem={({ item }) => <RenderDisbursementCard disbursement={item} />}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                          <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#00a8f0']}
                          />
                        }
                        contentContainerStyle={{ 
                          paddingBottom: 16,
                          paddingTop: 16
                        }}
                        ListFooterComponent={
                          totalPages > 1 ? (
                            <View className="flex-row justify-between items-center mt-4 px-4">
                              <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
                              >
                                <Text className="text-primaryBlue font-bold font-sans">← Previous</Text>
                              </TouchableOpacity>

                              <View className="flex-row items-center">
                                {isFetching && (
                                  <LoadingState />
                                )}
                                <Text className="text-gray-500 font-sans">
                                  Page {currentPage} of {totalPages}
                                </Text>
                              </View>

                              <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`p-2 ${currentPage === totalPages ? "opacity-50" : ""}`}
                              >
                                <Text className="text-primaryBlue font-bold font-sans">Next →</Text>
                              </TouchableOpacity>
                            </View>
                          ) : null
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