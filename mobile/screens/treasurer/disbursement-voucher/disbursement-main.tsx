import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView
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
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select-layout";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";

const DisbursementVoucherList: React.FC = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [_showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] =
    useState<DisbursementVoucher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedYear, setSelectedYear] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
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
    selectedYear,
    viewMode === "archived"
  );

  const { mutate: deleteDisbursement } = usePermanentDeleteDisbursementVoucher();
  const { mutate: archiveDisbursement } = useArchiveDisbursementVoucher();
  const { mutate: restoreDisbursement } = useRestoreDisbursementVoucher();

  // Extract data from paginated response
  const disbursements = disbursementsData?.results || [];
  const totalCount = disbursementsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Create year filter options
  const yearFilterOptions = [
    { label: "All Years", value: "all" },
    ...availableYears.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    })),
  ];

  // Calculate total amount of all displayed disbursements
  const totalAmount = disbursements.reduce((sum, disbursement) => {
    if (!disbursement.dis_particulars || disbursement.dis_particulars.length === 0) return sum;

    const disbursementTotal = disbursement.dis_particulars.reduce((disbursementSum, particular) => {
      const amount =
        typeof particular.amount === "string"
          ? parseFloat(particular.amount) || 0
          : particular.amount || 0;
      return disbursementSum + amount;
    }, 0);

    return sum + disbursementTotal;
  }, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    setCurrentPage(1);
  };

  const handleArchivePress = (disbursement: DisbursementVoucher, event?: any) => {
    event?.stopPropagation?.();
    return new Promise<void>((resolve) => {
      setIsProcessing(true);
      archiveDisbursement(disbursement.dis_num, {
        onSuccess: () => {
          refetch();
          setIsProcessing(false);
          resolve();
        },
        onError: () => {
          setIsProcessing(false);
          resolve();
        },
      });
    });
  };

  const handleRestorePress = (disbursement: DisbursementVoucher, event?: any) => {
    event?.stopPropagation?.();
    return new Promise<void>((resolve) => {
      setIsProcessing(true);
      restoreDisbursement(disbursement.dis_num, {
        onSuccess: () => {
          refetch();
          setIsProcessing(false);
          resolve();
        },
        onError: () => {
          setIsProcessing(false);
          resolve();
        },
      });
    });
  };

  const handleDeletePress = (disbursement: DisbursementVoucher, event?: any) => {
    event?.stopPropagation?.();
    return new Promise<void>((resolve) => {
      setIsProcessing(true);
      deleteDisbursement(disbursement.dis_num, {
        onSuccess: () => {
          refetch();
          setIsProcessing(false);
          setShowDeleteSuccess(true);
          resolve();
        },
        onError: () => {
          setIsProcessing(false);
          resolve();
        },
      });
    });
  };

  const handleDisbursementPress = (disbursement: DisbursementVoucher) => {
    setSelectedDisbursement(disbursement);
  };

  const handleViewModeChange = (mode: "active" | "archived") => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    setCurrentPage(1);
  };

  const handleYearChange = (option: { label: string; value: string }) => {
    setSelectedYear(option.value);
    setCurrentPage(1);
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
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" />
          </TouchableOpacity>
        }
        headerTitle={<Text >Disbursement Vouchers</Text>}
      >
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-lg font-medium mb-2">
            Error loading disbursement vouchers
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }
      headerTitle={<Text >Disbursement Vouchers</Text>}
      wrapScroll={false}
      showScrollIndicator={false}
    >
      <ScrollView
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Search and Filter Section */}
      <View className="p-4">
        <View className="mb-2">
          <Input
            placeholder="Search by payee or particulars..."
            className="rounded-xl flex-row items-center justify-between px-4 py-3 min-h-[44px] border border-gray-300"
            value={searchTerm}
            onChangeText={handleSearchChange}
          />
        </View>
        
        <SelectLayout
          options={yearFilterOptions}
          selectedValue={selectedYear}
          onSelect={handleYearChange}
          placeholder="Year"
          className="bg-white mb-4"
        />

        {/* View Mode Toggle and Total Amount */}
        <View className="flex-row justify-end items-center mb-4">
          {/* View Mode Toggle */}
          <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
            <TouchableOpacity
              className={`px-4 py-2 ${viewMode === "active" ? "bg-white" : ""}`}
              onPress={() => handleViewModeChange("active")}
            >
              <Text className="text-sm font-medium">Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 ${
                viewMode === "archived" ? "bg-white" : ""
              }`}
              onPress={() => handleViewModeChange("archived")}
            >
              <Text className="text-sm font-medium">Archived</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

        {/* Initial Loading State */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-16">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-gray-600">Loading disbursement vouchers...</Text>
          </View>
        ) : disbursements.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12 px-4">
            <Text className="text-gray-500 text-center">
              {searchTerm || selectedYear !== "all"
                ? "No disbursement vouchers found"
                : `No ${
                    viewMode === "active" ? "active" : "archived"
                  } disbursement vouchers found.`}
            </Text>
          </View>
        ) : (
          <View className="px-4 pb-4">
            {/* Disbursement List */}
            {disbursements.map((disbursement) => (
              <TouchableOpacity
                key={disbursement.dis_num}
                onPress={() => handleDisbursementPress(disbursement)}
                className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-lg font-semibold text-gray-900 flex-1 mr-3">
                    DV #{disbursement.dis_num} - {disbursement.dis_payee || "Unknown Payee"}
                  </Text>
                  <View className="flex-row">
                    {viewMode === "active" ? (
                      <ConfirmationModal
                        trigger={
                          <TouchableOpacity className="p-1">
                            <Archive color="#ef4444" size={20} />
                          </TouchableOpacity>
                        }
                        title={`Archive DV #${disbursement.dis_num}`}
                        description="Are you sure you want to archive this disbursement voucher?"
                        actionLabel="Archive"
                        onPress={() => handleArchivePress(disbursement)}
                        loading={isProcessing}
                      />
                    ) : (
                      <>
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity className="p-1 mr-2">
                              <ArchiveRestore color="#10b981" size={20} />
                            </TouchableOpacity>
                          }
                          title={`Restore DV #${disbursement.dis_num}`}
                          description="Are you sure you want to restore this disbursement voucher?"
                          actionLabel="Restore"
                          onPress={() => handleRestorePress(disbursement)}
                          loading={isProcessing}
                        />
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity className="p-1">
                              <Trash color="#ef4444" size={20} />
                            </TouchableOpacity>
                          }
                          title={`Delete DV #${disbursement.dis_num}`}
                          description="Please confirm if you would like to proceed with deleting the voucher. This action cannot be undone."
                          actionLabel="Delete"
                          variant="destructive"
                          onPress={() => handleDeletePress(disbursement)}
                          loading={isProcessing}
                        />
                      </>
                    )}
                  </View>
                </View>

                <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                  {disbursement.dis_particulars?.map((p) => p.forPayment).join(", ") || "No particulars provided"}
                </Text>

                <View className="mb-2">
                  <Text className="text-sm text-gray-600">
                    Date: {disbursement.dis_date || "No date provided"}
                  </Text>
                </View>

                <View className="mb-2">
                  <Text className="text-sm text-gray-600">
                    Fund: ₱
                    {new Intl.NumberFormat("en-US", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(disbursement.dis_fund || 0)}
                  </Text>
                </View>

                <View className="mb-2">
                  <Text className="text-sm text-gray-600 underline">
                    Total Amount: ₱
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
              </TouchableOpacity>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View className="flex-row justify-between items-center mt-4">
                <TouchableOpacity
                  onPress={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
                >
                  <Text className="text-primaryBlue font-bold">← Previous</Text>
                </TouchableOpacity>

                <View className="flex-row items-center">
                  {isFetching && (
                    <ActivityIndicator size="small" color="#3b82f6" className="mr-2" />
                  )}
                  <Text className="text-gray-500">
                    Page {currentPage} of {totalPages}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 ${
                    currentPage === totalPages ? "opacity-50" : ""
                  }`}
                >
                  <Text className="text-primaryBlue font-bold">Next →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
};

export default DisbursementVoucherList;