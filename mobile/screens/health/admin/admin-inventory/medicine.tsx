import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, FlatList, ActivityIndicator } from "react-native";
import { Search, Package, ChevronLeft, AlertTriangle, Filter, Pill, Syringe, HeartPulse } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { router } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { useQuery } from "@tanstack/react-query";
import { fetchInventoryData } from "./restful-api/inventory-api";

export default function InventoryScreen() {
  // --- STATE MANAGEMENT ---
  const [selectedCategory, setSelectedCategory] = React.useState<"medicine" | "commodity" | "first_aid" | "vaccine">("medicine");
  const [selectedStockFilter, setSelectedStockFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");
  const [showFilters, setShowFilters] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const itemsPerPage = 10;

  // --- DEBOUNCE SEARCH (Prevents lag by waiting 500ms after typing) ---
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- DATA FETCHING (Server Side) ---
  const { 
    data, 
    isLoading, 
    isError, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['inventory', selectedCategory, page, debouncedSearch, selectedStockFilter],
    queryFn: () => fetchInventoryData(selectedCategory, page, itemsPerPage, debouncedSearch, selectedStockFilter),
    placeholderData: (previousData) => previousData, 
    staleTime: 5000,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  // Extract data from backend response
  const inventoryList = data?.results || [];
  const totalCount = data?.count || 0;
  const filterCounts = data?.filter_counts || { 
    total: 0, 
    out_of_stock: 0, 
    low_stock: 0, 
    expired: 0 
  };
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // --- HANDLERS ---
  const handleCategoryChange = (catId: "medicine" | "commodity" | "first_aid" | "vaccine") => {
    setSelectedCategory(catId);
    setPage(1);
    setSearchQuery("");
    setSelectedStockFilter("all");
  };

  const handleFilterChange = (filterId: string) => {
    setSelectedStockFilter(filterId);
    setPage(1);
  };

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // --- UI CONSTANTS ---
  const categories = [
    { id: "medicine", name: "Medicine" },
    { id: "vaccine", name: "Vaccine" },
    { id: "commodity", name: "Commodity" },
    { id: "first_aid", name: "First Aid" },
    // { id: "immunization_supply", name: "Supplies" }, // Optional if you want to split them
  ];

  const stockFilters = [
    { id: "all", name: "All Stock" },
    { id: "low_stock", name: "Low Stock" },
    { id: "out_of_stock", name: "Out of Stock" },
    { id: "expired", name: "Expired" },
    { id: "near_expiry", name: "Near Expiry" },
  ];

  const getStockStatus = (item: any) => {
    if (item.isOutOfStock) return { text: "Out of Stock", color: "#EF4444", bg: "bg-red-50", textCol: "text-red-600" };
    if (item.isExpired) return { text: "Expired", color: "#6B7280", bg: "bg-gray-100", textCol: "text-gray-600" };
    if (item.isLowStock) return { text: "Low Stock", color: "#F59E0B", bg: "bg-orange-50", textCol: "text-orange-600" };
    if (item.isNearExpiry) return { text: "Near Expiry", color: "#EAB308", bg: "bg-yellow-50", textCol: "text-yellow-600" };
    return { text: "In Stock", color: "#10B981", bg: "bg-green-50", textCol: "text-green-600" };
  };

  // Helper to get item name safely based on different backend response structures
  const getItemName = (item: any) => {
    return item.item?.medicineName || item.item?.com_name || item.item?.fa_name || item.item?.antigen || "Unknown Item";
  };

  const getItemDescription = (item: any) => {
    if(item.item?.dosage) return `${item.item.dosage} ${item.item.dsgUnit || ''}`;
    return item.category || "";
  };

  if (isLoading && !data) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-red-50">
        <View className="bg-white p-8 rounded-xl shadow-sm items-center max-w-sm">
          <AlertTriangle size={48} color="#EF4444" />
          <Text className="text-red-500 text-xl font-bold mb-2 mt-4">Error</Text>
          <Text className="text-gray-700 text-center leading-6">
            Unable to load inventory data. Please check your connection.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-6 px-6 py-3 bg-red-500 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[16px]">Inventory</Text>}
      rightAction={
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-xl ${showFilters ? 'bg-blue-100' : 'bg-gray-100'}`}
        >
          <Filter size={20} color={showFilters ? "#3B82F6" : "#6B7280"} />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-blue-50">
        {/* Header Controls */}
        <View className="bg-white shadow-sm pb-4">
          <View className="px-4">
            {/* Search Input */}
            <View className="flex-row items-center gap-3 mt-2">
              <View className="flex-1 flex-row items-center p-2 border border-gray-200 bg-gray-50 rounded-xl">
                <Search size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder={`Search ${selectedCategory}...`}
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {isFetching && <ActivityIndicator size="small" color="#3B82F6" />}
              </View>
            </View>

            {/* Filters Section */}
            {showFilters && (
              <View className="mt-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Text className="font-semibold text-gray-700 mb-2">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  <View className="flex-row gap-2">
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => handleCategoryChange(category.id as "medicine" | "commodity" | "first_aid" | "vaccine")}
                        className={`px-3 py-1.5 rounded-full ${
                          selectedCategory === category.id ? "bg-blue-100 border border-blue-200" : "bg-gray-100"
                        }`}
                      >
                        <Text className={`text-sm ${selectedCategory === category.id ? "text-blue-700 font-medium" : "text-gray-700"}`}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text className="font-semibold text-gray-700 mb-2">Stock Status</Text>
                <View className="flex-row flex-wrap gap-2">
                  {stockFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.id}
                      onPress={() => handleFilterChange(filter.id)}
                      className={`px-3 py-1.5 rounded-full ${
                        selectedStockFilter === filter.id ? "bg-blue-100 border border-blue-200" : "bg-gray-100"
                      }`}
                    >
                      <Text className={`text-sm ${selectedStockFilter === filter.id ? "text-blue-700 font-medium" : "text-gray-700"}`}>
                        {filter.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={isFetching && !data} onRefresh={onRefresh} />}
        >
          {/* Stats Cards - Powered by Backend Data directly! */}
          <View className="p-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              <View className="gap-3 flex-row">
                <View className="bg-white p-4 rounded-xl shadow-sm min-w-[110px]">
                  <View className="flex-row items-center mb-2">
                    <Package size={18} color="#3B82F6" />
                    <Text className="ml-2 text-gray-600 text-sm">Total</Text>
                  </View>
                  {/* Shows total valid items (not archived) */}
                  <Text className="text-2xl font-bold text-gray-800">{filterCounts.total}</Text>
                </View>
                <View className="bg-white p-4 rounded-xl shadow-sm min-w-[110px]">
                  <View className="flex-row items-center mb-2">
                    <AlertTriangle size={18} color="#F59E0B" />
                    <Text className="ml-2 text-gray-600 text-sm">Low Stock</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{filterCounts.low_stock}</Text>
                </View>
                <View className="bg-white p-4 rounded-xl shadow-sm min-w-[110px]">
                  <View className="flex-row items-center mb-2">
                    <AlertTriangle size={18} color="#EF4444" />
                    <Text className="ml-2 text-gray-600 text-sm">Out of Stock</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{filterCounts.out_of_stock}</Text>
                </View>
                <View className="bg-white p-4 rounded-xl shadow-sm min-w-[110px]">
                  <View className="flex-row items-center mb-2">
                    <Package size={18} color="#6B7280" />
                    <Text className="ml-2 text-gray-600 text-sm">Expired</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{filterCounts.expired}</Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Inventory List */}
          <View className="px-4 pb-6">
            <View className="mb-4 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">
                Inventory ({totalCount})
              </Text>
              <TouchableOpacity
                className="bg-green-700 px-4 py-1.5 rounded-xl"
                onPress={() => router.push("/(health)/admin/inventory/transaction")}>
                <Text className="text-white text-sm font-medium">Transactions</Text>
              </TouchableOpacity>
            </View>

            {inventoryList.length === 0 ? (
              <View className="p-6 items-center">
                <Package size={40} color="#D1D5DB" />
                <Text className="text-gray-500 text-center mt-3">
                  {searchQuery ? "No items match your search" : "No inventory items found"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={inventoryList}
                scrollEnabled={false}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                renderItem={({ item }) => {
                  const status = getStockStatus(item);
                  const itemName = getItemName(item);
                  const itemDesc = getItemDescription(item);
                  
                  // Calculate progress bar width
                  // Assuming minStock is around 20 for logic visualization
                  const progressWidth = Math.min((item.availableStock / 50) * 100, 100);

                  return (
                    <View className="bg-white rounded-xl shadow-sm mb-3 p-4">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-lg font-bold text-gray-800 flex-1 mr-2">
                          {itemName}
                        </Text>
                        <View className={`px-2 py-1 rounded-full ${status.bg}`}>
                          <Text className={`text-xs font-medium ${status.textCol}`}>
                            {status.text}
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-gray-600 text-sm mb-3">{itemDesc}</Text>
                      
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-500 text-sm">Stock:</Text>
                        <Text className="text-lg font-bold text-gray-800">{item.availableStock} {item.unit || item.minv_qty_unit || ''}</Text>
                      </View>
                      
                      {/* Progress Bar */}
                      <View className="bg-gray-100 h-1.5 rounded-full mb-2">
                        <View
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${progressWidth}%`,
                            backgroundColor: status.color,
                          }}
                        />
                      </View>
                      
                      <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-50">
                        <Text className="text-gray-400 text-xs">
                           Batch: {item.batchNumber !== "N/A" ? item.batchNumber : "-"}
                        </Text>
                         <Text className="text-gray-400 text-xs">
                           Wasted: {item.wasted !== 0 ? item.wasted : "-"}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                           Exp: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "-"}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <View className="px-4 pb-10">
              <View className="bg-white rounded-xl p-3 flex-row justify-between items-center shadow-sm">
                <TouchableOpacity
                  onPress={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || isFetching}
                  className={`px-4 py-2 rounded-lg ${page === 1 ? "opacity-50" : ""}`}
                >
                  <Text className="text-blue-600 font-medium">Previous</Text>
                </TouchableOpacity>
                <Text className="text-gray-600">
                  Page {page} of {totalPages || 1}
                </Text>
                <TouchableOpacity
                  onPress={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isFetching}
                  className={`px-4 py-2 rounded-lg ${page >= totalPages ? "opacity-50" : ""}`}
                >
                  <Text className="text-blue-600 font-medium">Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </PageLayout>
  );
}