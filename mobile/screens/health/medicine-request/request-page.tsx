import { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Search, ShoppingBag, ChevronDown, Pill, Filter, X, Ban, ChevronLeft, Clock } from "lucide-react-native";
import { useGlobalCartState } from "./cart-state";
import { useMedicines } from "../admin/admin-inventory/queries/medicine/MedicineFetchQueries";
import PageLayout from "@/screens/_PageLayout";
import { api2 } from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";

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

export default function MedicineRequestScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  // const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery); // Debounced for API fetch
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategories, setShowCategories] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [loadingPending, setLoadingPending] = useState(false);
  const { cartItems } = useGlobalCartState();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: fetchedMedicines, isLoading, isError, error } = useMedicines(currentPage, pageSize); // Use debounced for fetch
  const { user } = useAuth();
  const userId = user?.rp;

  const position = user?.staff?.pos;
  console.log("Position:",position)
  console.log("RP_ID:", userId);

  // Debounce the search query (delay API fetch by 500ms)
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebouncedSearchQuery(searchQuery);
  //   }, 1000);

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [searchQuery]);

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

  // Process and filter medicines (client-side filter uses immediate searchQuery for instant feedback)
  const medicines = useMemo(() => {
    if (!fetchedMedicines || !fetchedMedicines.medicines) return [];

    const lowercasedQuery = searchQuery.toLowerCase(); // Use immediate searchQuery for client-side filtering

    return fetchedMedicines.medicines.filter((medicine: MedicineDisplay) => {
      const matchesSearch =
        (medicine.med_name && medicine.med_name.toLowerCase().includes(lowercasedQuery)) ||
        (medicine.med_type && medicine.med_type.toLowerCase().includes(lowercasedQuery)) ||
        (medicine.inventory_items[0]?.form && medicine.inventory_items[0].form.toLowerCase().includes(lowercasedQuery)) ||
        (medicine.inventory_items[0]?.dosage && medicine.inventory_items[0].dosage.toLowerCase().includes(lowercasedQuery));

      const matchesCategory = selectedCategory === "All";

      return matchesSearch && matchesCategory;
    });
  }, [fetchedMedicines, searchQuery, selectedCategory]);

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    return ["All"];
  }, []);

  // Handle press on a medicine item
  const handleMedicinePress = (medicine: MedicineDisplay) => {
    const isOutOfStock = medicine.total_qty_available <= 0;
    const hasPendingRequest = pendingRequests.has(medicine.med_id);

    if (isOutOfStock || hasPendingRequest) {
      return;
    }
    const firstInventory = medicine.inventory_items[0];

    const medicineString = JSON.stringify({
      minv_id: firstInventory?.minv_id,
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

  // Render loading state
  if (isLoading || loadingPending) {
    return <LoadingState />;
  }

  // Render error state
  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-600 text-lg font-semibold">Error loading medicines</Text>
          <Text className="text-gray-500 text-center mt-2">
            Failed to fetch medicine data. Please try again later.
          </Text>
          {error && <Text className="text-sm text-gray-500 mt-1">Error: {error.message}</Text>}
        </View>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Request Medicine</Text>}
      rightAction={
        <TouchableOpacity onPress={() => router.push("/medicine-request/cart")} className="p-2 relative">
          <ShoppingBag size={24} color="blue" />
          {cartItems.length > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
              <Text className="text-white text-xs font-bold">{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      }
    >
      <View className="p-4 bg-white shadow-sm">
        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search medicines..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2">
              <X size={20} color="blue" />
            </TouchableOpacity>
          )}
        </View>

        {/* <TouchableOpacity
          onPress={() => setShowCategories(!showCategories)}
          className="flex-row items-center justify-between mt-3 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        >
          <Text className="text-gray-800">
            Category: <Text className="font-semibold">{selectedCategory}</Text>
          </Text>
          <Filter size={20} color="#9CA3AF" />
        </TouchableOpacity> */}

        {showCategories && (
          <View className="mt-2 border border-gray-200 rounded-lg bg-white max-h-48 overflow-hidden">
            <ScrollView>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category as string}
                  onPress={() => {
                    setSelectedCategory(category as string);
                    setShowCategories(false);
                  }}
                  className={`py-3 px-4 ${selectedCategory === category ? "bg-blue-50" : "bg-white"} border-b border-gray-100 last:border-b-0`}
                >
                  <Text className={`text-gray-800 ${selectedCategory === category ? "font-semibold text-blue-600" : ""}`}>
                    {category as string}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View className="flex-1 bg-white">
        <Text className="ml-4">Available Medicines</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {medicines.length > 0 ? (
            <View className="px-4 py-3 gap-2">
              {medicines.map((medicine: MedicineDisplay) => {
                const isOutOfStock = medicine.total_qty_available <= 0;
                const hasPendingRequest = pendingRequests.has(medicine.med_id);
                const isDisabled = isOutOfStock || hasPendingRequest;

                return (
                  <TouchableOpacity
                    key={medicine.med_id}
                    onPress={() => handleMedicinePress(medicine)}
                    className={`flex-row items-center justify-between p-4 mb-3 rounded-lg shadow-sm border ${
                      isDisabled ? "bg-gray-100 border-gray-300 opacity-70" : "bg-white border-gray-300"
                    }`}
                    disabled={isDisabled}
                  >
                    <View className="flex-row items-center flex-1">
                      <Pill size={24} color={isDisabled ? "#9CA3AF" : "blue"} />
                      <View className="flex-1 ml-4">
                        <View className="flex-row items-center justify-between">
                          <Text className={`text-lg font-semibold ${isDisabled ? "text-gray-500" : "text-gray-900"}`}>
                            {medicine.med_name || "Unknown Medicine"}
                          </Text>
                          {isOutOfStock && (
                            <View className="flex-row items-center bg-red-100 px-2 py-1 rounded-full">
                              <Ban size={14} color="#EF4444" />
                              <Text className="text-red-700 text-xs font-medium ml-1">Out of Stock</Text>
                            </View>
                          )}
                          {hasPendingRequest && !isOutOfStock && (
                            <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full">
                              <Clock size={14} color="#D97706" />
                              <Text className="text-yellow-700 text-xs font-medium ml-1">Pending Request</Text>
                            </View>
                          )}
                        </View>

                        <View className="flex-row items-center justify-between mt-1">
                          <Text className={`text-sm font-medium ${isOutOfStock ? "text-gray-400" : "text-gray-700"}`}>
                            {medicine.med_type || "Unknown Type"}
                          </Text>
                          {!isOutOfStock && (
                            <Text className="text-green-600 text-sm font-medium">
                              {/* In Stock: {medicine.total_qty_available} */}
                            </Text>
                          )}
                        </View>

                        {medicine.inventory_items[0]?.form && (
                          <Text className={`text-sm mt-1 ${isOutOfStock ? "text-gray-400" : "text-gray-600"}`}>
                            Form: {medicine.inventory_items[0].form}
                          </Text>
                        )}

                        {medicine.inventory_items[0]?.dosage && (
                          <Text className={`text-sm mt-1 ${isOutOfStock ? "text-gray-400" : "text-gray-600"}`}>
                            Dosage: {medicine.inventory_items[0].dosage}
                          </Text>
                        )}
                      </View>
                    </View>

                    {!isOutOfStock && (
                      <View className="ml-4">
                        <ChevronDown
                          size={20}
                          color="#9CA3AF"
                          style={{ transform: [{ rotate: "270deg" }] }}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center mt-20">
              <View className="bg-gray-100 p-6 rounded-full mb-4">
                <Search size={32} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-700 mb-2">No medicines found</Text>
              <Text className="text-gray-500 text-center px-8">
                Try adjusting your search terms or checking the available categories.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </PageLayout>
  );
}