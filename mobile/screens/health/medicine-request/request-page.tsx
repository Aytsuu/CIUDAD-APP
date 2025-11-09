import { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from "react-native";
import { router } from "expo-router";
import { Search, ShoppingBag, ChevronDown, Pill, X, Ban, ChevronLeft, Clock, Filter } from "lucide-react-native";
import { useGlobalCartState } from "./cart-state";
import { useMedicines } from "../admin/admin-inventory/queries/medicine/MedicineFetchQueries";
import PageLayout from "@/screens/_PageLayout";
import { api2 } from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";
import { PaginationControls } from "../admin/components/pagination-layout";

// Updated type definition to match the API response
export type MedicineDisplay = {
  med_id: string;
  med_name: string;
  med_type: string;
  total_qty_available: number;
  inventory_items: {
    minv_id: number;
    dosage: string;
    form: string;
    quantity_available: number;
    quantity_unit: string;
    expiry_date: string;
    inventory_type: string;
  }[];
};

type FilterOption = "all" | "available" | "pending" | "out_of_stock";

export default function MedicineRequestScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategories, setShowCategories] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [loadingPending, setLoadingPending] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("available");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const { cartItems } = useGlobalCartState();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const userId = user?.rp;
  
  const { data: fetchedMedicines, isLoading, isError, error } = useMedicines( currentPage, pageSize, debouncedSearchQuery, selectedCategory);
  
  const position = user?.staff?.pos;
  console.log("Position:",position)
  console.log("RP_ID:", userId);

   const handlePageChange = useCallback((page: number) => {
      setCurrentPage(page);
    }, []);
    
 useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
  console.log("🔍 API Response:", fetchedMedicines);
  console.log("🔍 Medicines array:", fetchedMedicines?.medicines);
  console.log("🔍 Total count:", fetchedMedicines?.count);
}, [fetchedMedicines]);

  useEffect(() => {
    const checkPendingRequests = async () => {
      if (!fetchedMedicines?.medicines || !userId) {
        setLoadingPending(false);
        return;
      }
      setLoadingPending(true);
      const pendingSet = new Set<string>();
      try {
        for (const medicine of fetchedMedicines.medicines) {
          try {
            const response = await api2.get(`/medicine/medicine-request/check-pending/${userId}/${medicine.med_id}/`);
            if (response.data.has_pending_request) {
              pendingSet.add(medicine.med_id);
            }
          } catch (error) {
            console.error(`Error checking pending for ${medicine.med_id}:`, error);
          }
        }
        setPendingRequests(pendingSet);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      } finally {
        setLoadingPending(false);
      }
    };
    checkPendingRequests();
  }, [fetchedMedicines, userId]);

  // Filter and sort medicines based on selected filter
  const medicines = useMemo(() => {
    const meds = fetchedMedicines?.medicines || [];
    
    // Apply filter
    let filtered = meds.filter((medicine: { total_qty_available: number; med_id: string; }) => {
      const isOutOfStock = medicine.total_qty_available <= 0;
      const hasPending = pendingRequests.has(medicine.med_id);
      
      switch (selectedFilter) {
        case "available":
          return !isOutOfStock && !hasPending;
        case "pending":
          return hasPending && !isOutOfStock;
        case "out_of_stock":
          return isOutOfStock;
        case "all":
        default:
          return true;
      }
    });

    // Sort: available first, then pending, then out of stock
    return [...filtered].sort((a, b) => {
      const aOutOfStock = a.total_qty_available <= 0;
      const bOutOfStock = b.total_qty_available <= 0;
      const aPending = pendingRequests.has(a.med_id);
      const bPending = pendingRequests.has(b.med_id);

      const aScore = aOutOfStock ? 2 : (aPending ? 1 : 0);
      const bScore = bOutOfStock ? 2 : (bPending ? 1 : 0);

      return aScore - bScore;
    });
  }, [fetchedMedicines, pendingRequests, selectedFilter]);

const totalPages = Math.ceil((fetchedMedicines?.count || 0) / pageSize);
  
const categories = useMemo(() => {
    return ["All"];
  }, []);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleMedicinePress = (medicine: MedicineDisplay) => {
  const isOutOfStock = medicine.total_qty_available <= 0;
  const hasPendingRequest = pendingRequests.has(medicine.med_id);

  if (isOutOfStock || hasPendingRequest) {
    return;
  }

  const firstInventory = medicine.inventory_items[0];
  
  // Add validation for minv_id
  if (!firstInventory?.minv_id) {
    Alert.alert("Error", "This medicine is not available in inventory. Please select another medicine.");
    return;
  }

  const medicineString = JSON.stringify({
    minv_id: firstInventory.minv_id,
    med_id: medicine.med_id,
    name: medicine.med_name,
    med_type: medicine.med_type,
    dosage: firstInventory?.dosage || "Not specified",
    availableStock: medicine.total_qty_available,
  });

  router.push({
    pathname: "/medicine-request/details",
    params: { medicineData: medicineString },
  });
};

  const filterOptions = [
    { value: "all", label: "All", icon: Pill },
    { value: "available", label: "In stock", icon: Pill },
    { value: "pending", label: "Pending Requests", icon: Clock },
    { value: "out_of_stock", label: "Out of Stock", icon: Ban },
  ];

  const currentFilterLabel = filterOptions.find(opt => opt.value === selectedFilter)?.label || "All Medicines";

  if (isLoading || loadingPending) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-red-50 p-4 rounded-2xl mb-4">
            <Ban size={40} color="#DC2626" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">Unable to Load</Text>
          <Text className="text-gray-500 text-center text-sm">
            Failed to fetch medicine data. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center active:bg-gray-50">
          <ChevronLeft size={24} className="text-gray-900" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 font-semibold text-base">Medicines</Text>}
      rightAction={
        <TouchableOpacity onPress={() => router.push("/medicine-request/cart")} className="p-2 relative">
          <ShoppingBag size={24} color="#2563EB" />
          {cartItems.length > 0 && (
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
              <Text className="text-white text-xs font-bold">{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-white">
        {/* Search Section */}
        <View className="px-4 pt-3 pb-4 bg-white">
          <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 active:bg-gray-200">
            <Search size={18} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 font-medium"
              placeholder="Search medicines"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} className="active:opacity-70">
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Dropdown */}
          <View className="mt-3 relative">
            <TouchableOpacity
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 active:bg-gray-50"
            >
              <View className="flex-row items-center gap-2">
                <Filter size={18} color="#6B7280" />
                <Text className="text-gray-900 font-medium">{currentFilterLabel}</Text>
              </View>
              <ChevronDown 
                size={18} 
                color="#6B7280"
                style={{ transform: [{ rotate: showFilterDropdown ? "180deg" : "0deg" }] }}
              />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showFilterDropdown && (
              <View className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                {filterOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedFilter === option.value;
                  
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        setSelectedFilter(option.value as FilterOption);
                        setShowFilterDropdown(false);
                      }}
                      className={`flex-row items-center px-4 py-3 active:bg-gray-50 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <Icon 
                        size={18} 
                        color={isSelected ? "#2563EB" : "#6B7280"} 
                      />
                      <Text className={`ml-3 font-medium ${
                        isSelected ? "text-blue-600" : "text-gray-700"
                      }`}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <View className="ml-auto w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Medicines List */}
        <View className="flex-1 bg-white">
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {medicines.length > 0 ? (
              <View className="px-4 gap-3">
                {medicines.map((medicine: MedicineDisplay) => {
                  const isOutOfStock = medicine.total_qty_available <= 0;
                  const hasPendingRequest = pendingRequests.has(medicine.med_id);
                  const isDisabled = isOutOfStock || hasPendingRequest;

                  return (
                    <TouchableOpacity
                      key={medicine.med_id}
                      onPress={() => handleMedicinePress(medicine)}
                      disabled={isDisabled}
                      className={`flex-row items-center justify-between p-4 rounded-2xl active:bg-blue-50 ${
                        isDisabled ? "bg-gray-50" : "bg-blue-50"
                      }`}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className={`w-12 h-12 rounded-xl items-center justify-center ${
                          isDisabled ? "bg-gray-200" : "bg-blue-100"
                        }`}>
                          <Pill size={24} color={isDisabled ? "#9CA3AF" : "#2563EB"} />
                        </View>

                        <View className="flex-1 ml-4">
                          <View className="flex-row items-center justify-between gap-2">
                            <Text className={`text-base font-semibold flex-1 ${
                              isDisabled ? "text-gray-400" : "text-gray-900"
                            }`}>
                              {medicine.med_name || "Unknown Medicine"}
                            </Text>
                            {isOutOfStock && (
                              <View className="bg-red-100 px-2 py-1 rounded-lg flex-row items-center gap-1">
                                <Ban size={12} color="#DC2626" />
                                <Text className="text-red-600 text-xs font-semibold">Out of stock</Text>
                              </View>
                            )}
                            {hasPendingRequest && !isOutOfStock && (
                              <View className="bg-amber-100 px-2 py-1 rounded-lg flex-row items-center gap-1">
                                <Clock size={12} color="#B45309" />
                                <Text className="text-amber-700 text-xs font-semibold">Pending</Text>
                              </View>
                            )}
                          </View>

                          <View className="mt-2 gap-1">
                            {medicine.inventory_items[0]?.dosage && (
                              <Text className={`text-xs ${
                                isDisabled ? "text-gray-400" : "text-gray-500"
                              }`}>
                                {medicine.inventory_items[0].dosage}
                                {medicine.inventory_items[0]?.form && ` • ${medicine.inventory_items[0].form}`}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>

                      {!isDisabled && (
                        <ChevronDown
                          size={20}
                          color="#9CA3AF"
                          style={{ transform: [{ rotate: "270deg" }] }}
                          className="ml-3"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className="flex-1 justify-center items-center mt-24">
                <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                  <Search size={32} color="#D1D5DB" />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-1">No medicines found</Text>
                <Text className="text-gray-500 text-center text-sm px-8">
                  {selectedFilter !== "all" 
                    ? `No ${currentFilterLabel.toLowerCase()} at the moment`
                    : "Adjust your search terms to find medicines"
                  }
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Pagination */}
          <View className="px-4 pb-4">
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </View>
        </View>
      </View>
    </PageLayout>
  );
}