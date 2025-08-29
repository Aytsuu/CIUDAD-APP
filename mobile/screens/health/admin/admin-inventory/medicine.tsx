import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { Search, Package, ChevronLeft, AlertTriangle, Filter } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { api2 } from "@/api/api";
import { router } from "expo-router";

// Define interfaces for type safety
interface InventoryItem {
  id: number;
  name: string;
  category: "medicine" | "vaccine" | "commodity" | "first_aid" | "immunization_supply";
  description: string;
  stock: number;
  minStock: number;
  expiryDate: string;
  batchNumber: string;
  lastUpdated: string;
}

interface InventoryScreenProps {
  onBack?: () => void;
  onNavigateToTransactions?: () => void;
}

export default function InventoryScreen() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedStockFilter, setSelectedStockFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [inventoryData, setInventoryData] = React.useState<InventoryItem[]>([]);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const itemsPerPage = 10;

  const fetchInventoryData = React.useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);

    try {
      const endpoints = [
        { name: "medicines", url: "/inventory/medicineinventorylist/" },
        { name: "commodities", url: "/inventory/commodityinventorylist/" },
        { name: "firstaid", url: "/inventory/firstaidinventorylist/" },
        { name: "vaccines", url: "/inventory/vaccine_stocks/" },
        { name: "immunization", url: "/inventory/immunization_stock/" },
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await api2.get(endpoint.url);
            return { name: endpoint.name, data: response.data, success: true };
          } catch (error) {
            console.error(`Error fetching ${endpoint.name}:`, error);
            return {
              name: endpoint.name,
              data: [],
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        })
      );

      const allInventory: InventoryItem[] = [];

      // Helper function to format dates
      const formatDate = (date: string | undefined) =>
        date ? new Date(date).toLocaleDateString() : "N/A";

      // Process medicines
      const medicinesResult = results.find((r) => r.name === "medicines");
      if (medicinesResult?.success && Array.isArray(medicinesResult.data)) {
        allInventory.push(
          ...medicinesResult.data.map((item: any) => ({
            id: item.minv_id ?? Math.random(), // Fallback ID to prevent duplicates
            name: item.med_detail?.med_name ?? "Unknown Medicine",
            category: "medicine" as const,
            description: item.med_detail?.med_type ?? "Medicine",
            stock: item.minv_qty_avail ?? 0,
            minStock: 20,
            expiryDate: item.inv_detail?.expiry_date ?? "N/A",
            batchNumber: "N/A",
            lastUpdated: formatDate(item.inv_detail?.updated_at),
          }))
        );
      }

      // Process commodities
      const commoditiesResult = results.find((r) => r.name === "commodities");
      if (commoditiesResult?.success && Array.isArray(commoditiesResult.data)) {
        allInventory.push(
          ...commoditiesResult.data.map((item: any) => {
            let userTypeDisplay = item.user_type ?? "all users";
            if (item.user_type === "Both") {
              userTypeDisplay = "Current user & New Acceptor";
            } else if (item.user_type) {
              userTypeDisplay = `${item.user_type}s`;
            }
            return {
              id: item.cinv_id ?? Math.random(),
              name: item.com_detail?.com_name ?? item.com_id?.com_name ?? "Unknown Commodity",
              category: "commodity" as const,
              description: `For ${userTypeDisplay}`,
              stock: item.cinv_qty_avail ?? 0,
              minStock: 50,
              expiryDate: item.inv_detail?.expiry_date ?? "N/A",
              batchNumber: item.batch_number ?? "N/A",
              lastUpdated: formatDate(item.inv_detail?.updated_at),
            };
          })
        );
      }

      // Process first aid items
      const firstaidResult = results.find((r) => r.name === "firstaid");
      if (firstaidResult?.success && Array.isArray(firstaidResult.data)) {
        allInventory.push(
          ...firstaidResult.data.map((item: any) => ({
            id: item.finv_id ?? Math.random(),
            name: item.fa_detail?.fa_name ?? item.fa_id?.fa_name ?? "Unknown First Aid",
            category: "first_aid" as const,
            description: item.fa_detail?.catlist ?? "First aid item",
            stock: item.finv_qty_avail ?? 0,
            minStock: 10,
            expiryDate: item.inv_detail?.expiry_date ?? "N/A",
            batchNumber: "N/A",
            lastUpdated: formatDate(item.inv_detail?.updated_at),
          }))
        );
      }

      // Process vaccines
      const vaccinesResult = results.find((r) => r.name === "vaccines");
      if (vaccinesResult?.success && Array.isArray(vaccinesResult.data)) {
        allInventory.push(
          ...vaccinesResult.data.map((item: any) => ({
            id: item.vacStck_id ?? Math.random(),
            name: item.vaccinelist?.vac_name ?? item.vac_id?.vac_name ?? "Unknown Vaccine",
            category: "vaccine" as const,
            description: item.vaccinelist?.vac_type_choices ?? "Vaccine",
            stock: item.vacStck_qty_avail ?? 0,
            minStock: 5,
            expiryDate: item.inv_details?.expiry_date ?? item.inv_id?.expiry_date ?? "N/A",
            batchNumber: item.batch_number ?? "N/A",
            lastUpdated: formatDate(item.inv_details?.updated_at ?? item.updated_at),
          }))
        );
      }

      // Process immunization supplies
      const immunizationResult = results.find((r) => r.name === "immunization");
      if (immunizationResult?.success && Array.isArray(immunizationResult.data)) {
        allInventory.push(
          ...immunizationResult.data.map((item: any) => ({
            id: item.imzStck_id ?? Math.random(),
            name: item.imz_detail?.imz_name ?? item.imz_id?.imz_name ?? "Unknown Supply",
            category: "immunization_supply" as const,
            description: item.imzStck_unit ?? "Immunization Supply",
            stock: item.imzStck_avail ?? 0,
            minStock: 15,
            expiryDate: item.inv_detail?.expiry_date ?? "N/A",
            batchNumber: item.batch_number ?? "N/A",
            lastUpdated: formatDate(item.inv_detail?.updated_at),
          }))
        );
      }

      setInventoryData(allInventory);

      const failedEndpoints = results.filter((r) => !r.success);
      if (failedEndpoints.length > 0) {
        setHasError(true);
        setErrorMessage(
          `Failed to load some data: ${failedEndpoints.map((f) => f.name).join(", ")}. Partial data displayed.`
        );
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setHasError(true);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load inventory data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchInventoryData();
    setRefreshing(false);
    setPage(1);
  }, [fetchInventoryData]);

  React.useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const categories = [
    { id: "all", name: "All" },
    { id: "medicine", name: "Medicine" },
    { id: "vaccine", name: "Vaccine" },
    { id: "commodity", name: "Commodity" },
    { id: "first_aid", name: "First Aid" },
    { id: "immunization_supply", name: "Immunization Supplies" },
  ];

  const stockFilters = [
    { id: "all", name: "All Stock" },
    { id: "low_stock", name: "Low Stock" },
    { id: "out_of_stock", name: "Out of Stock" },
    { id: "in_stock", name: "In Stock" },
  ];

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { text: "Out of Stock", color: "#EF4444", status: "out_of_stock" };
    if (stock <= minStock) return { text: "Low Stock", color: "#F59E0B", status: "low_stock" };
    return { text: "In Stock", color: "#10B981", status: "in_stock" };
  };

  const filteredInventory = React.useMemo(() => {
    return inventoryData
      .filter((item) => selectedCategory === "all" || item.category === selectedCategory)
      .filter((item) => {
        const status = getStockStatus(item.stock, item.minStock).status;
        return selectedStockFilter === "all" || status === selectedStockFilter;
      })
      .filter(
        (item) =>
          searchQuery.trim() === "" ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [selectedCategory, selectedStockFilter, searchQuery, inventoryData]);

  const paginatedInventory = React.useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, page]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const stats = React.useMemo(() => {
    return {
      totalItems: inventoryData.length,
      lowStock: inventoryData.filter((item) => item.stock > 0 && item.stock <= item.minStock).length,
      outOfStock: inventoryData.filter((item) => item.stock === 0).length,
      inStock: inventoryData.filter((item) => item.stock > item.minStock).length,
      showingItems: `${Math.min(page * itemsPerPage, filteredInventory.length)} of ${filteredInventory.length}`,
    };
  }, [inventoryData, page, filteredInventory.length]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50">
        <View className="bg-white p-8 rounded-xl shadow-sm items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600 font-medium">Loading inventory...</Text>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-red-50">
        <View className="bg-white p-8 rounded-xl shadow-sm items-center max-w-sm">
          <AlertTriangle size={48} color="#EF4444" />
          <Text className="text-red-500 text-xl font-bold mb-2 mt-4">Error</Text>
          <Text className="text-gray-700 text-center leading-6">
            {errorMessage || "Unable to load inventory data. Please try again."}
          </Text>
          <TouchableOpacity
            onPress={fetchInventoryData}
            className="mt-6 px-6 py-3 bg-red-500 rounded-xl"
            accessibilityLabel="Retry loading inventory"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center p-4 pt-12">
          <TouchableOpacity
            className="p-2 mr-3 bg-gray-100 rounded-full"
            onPress={() => {router.back()}}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">Medical Inventory</Text>
          </View>
        </View>
        {/* Search and Filter */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center p-2 border border-gray-200 bg-gray-50 rounded-xl">
              <Search size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Search inventory..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Search inventory items"
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 rounded-xl"
              accessibilityLabel="Toggle filters"
            >
              <Filter size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          {showFilters && (
            <View className="mt-3 bg-white rounded-xl p-4 shadow-sm">
              <Text className="font-semibold text-gray-700 mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full ${
                      selectedCategory === category.id ? "bg-blue-100 border border-blue-200" : "bg-gray-100"
                    }`}
                    accessibilityLabel={`Filter by ${category.name}`}
                  >
                    <Text
                      className={`text-sm ${
                        selectedCategory === category.id ? "text-blue-700 font-medium" : "text-gray-700"
                      }`}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="font-semibold text-gray-700 mb-2">Stock Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {stockFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    onPress={() => {
                      setSelectedStockFilter(filter.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full ${
                      selectedStockFilter === filter.id ? "bg-blue-100 border border-blue-200" : "bg-gray-100"
                    }`}
                    accessibilityLabel={`Filter by ${filter.name}`}
                  >
                    <Text
                      className={`text-sm ${
                        selectedStockFilter === filter.id ? "text-blue-700 font-medium" : "text-gray-700"
                      }`}
                    >
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        <View className="p-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <View className="gap-3 flex-row">
              <View className="bg-white p-4 rounded-xl shadow-sm min-w-[110px]">
                <View className="flex-row items-center mb-2">
                  <Package size={18} color="#3B82F6" />
                  <Text className="ml-2 text-gray-600 text-sm">Total Items</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-800">{stats.totalItems}</Text>
              </View>
              <View className="bg-white p-4 rounded-xl shadow-sm min-w-[110px]">
                <View className="flex-row items-center mb-2">
                  <AlertTriangle size={18} color="#F59E0B" />
                  <Text className="ml-2 text-gray-600 text-sm">Low Stock</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-800">{stats.lowStock}</Text>
              </View>
              <View className="bg-white p-4 rounded-xl shadow-sm min-w-[110px]">
                <View className="flex-row items-center mb-2">
                  <AlertTriangle size={18} color="#EF4444" />
                  <Text className="ml-2 text-gray-600 text-sm">Out of Stock</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-800">{stats.outOfStock}</Text>
              </View>
              <View className="bg-white p-4 rounded-xl shadow-sm min-w-[110px]">
                <View className="flex-row items-center mb-2">
                  <Package size={18} color="#10B981" />
                  <Text className="ml-2 text-gray-600 text-sm">In Stock</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-800">{stats.inStock}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
        {/* Inventory List */}
        <View className="px-4 pb-6">
          <View className="mb-4 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800">
              Inventory ({filteredInventory.length})
            </Text>
            <TouchableOpacity
              className="bg-green-700 px-4 py-1.5 rounded-xl"
              onPress={() => router.push("/(health)/admin/inventory/transaction")}>
              <Text className="text-white text-sm font-medium">Transactions</Text>
            </TouchableOpacity>
          </View>
          {filteredInventory.length === 0 ? (
            <View className=" p-6 items-center ">
              <Package size={40} color="#D1D5DB" />
              {/* <Text className="text-gray-600 font-bold mt-3">No Items Found</Text> */}
              <Text className="text-gray-500 text-center mt-1">
                {searchQuery ? "Try a different search" : "No inventory items"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={paginatedInventory}
              scrollEnabled={false}
              keyExtractor={(item) => `${item.id}-${item.category}`}
              renderItem={({ item }) => {
                const stockStatus = getStockStatus(item.stock, item.minStock);
                return (
                  <View className="bg-white rounded-xl shadow-sm mb-3 p-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-lg font-bold text-gray-800 flex-1">
                        {item.name}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full ${
                          stockStatus.status === "out_of_stock"
                            ? "bg-red-50"
                            : stockStatus.status === "low_stock"
                            ? "bg-orange-50"
                            : "bg-green-50"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            stockStatus.status === "out_of_stock"
                              ? "text-red-600"
                              : stockStatus.status === "low_stock"
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {stockStatus.text}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-600 text-sm mb-3">{item.description}</Text>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-500 text-sm">Stock:</Text>
                      <Text className="text-lg font-bold text-gray-800">{item.stock}</Text>
                    </View>
                    <View className="bg-gray-100 h-1.5 rounded-full mb-2">
                      <View
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%`,
                          backgroundColor: stockStatus.color,
                        }}
                      />
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-xs">
                        {item.batchNumber !== "N/A" ? `Batch: ${item.batchNumber}` : " "}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {item.expiryDate !== "N/A" ? `Expires: ${item.expiryDate}` : " "}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
        {/* Pagination */}
        {filteredInventory.length > itemsPerPage && (
          <View className="px-4 pb-6">
            <View className="bg-white rounded-xl p-3 flex-row justify-between items-center shadow-sm">
              <TouchableOpacity
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg ${page === 1 ? "opacity-50" : ""}`}
                accessibilityLabel="Previous page"
              >
                <Text className="text-blue-600 font-medium">Previous</Text>
              </TouchableOpacity>
              <Text className="text-gray-600">
                Page {page} of {totalPages}
              </Text>
              <TouchableOpacity
                onPress={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg ${page === totalPages ? "opacity-50" : ""}`}
                accessibilityLabel="Next page"
              >
                <Text className="text-blue-600 font-medium">Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}