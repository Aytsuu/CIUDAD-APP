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
import PageLayout from "@/screens/_PageLayout";

// Define interfaces for type safety
interface InventoryItem {
  wasted: any;
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
  const [filterCounts, setFilterCounts] = React.useState<any>({});

  const fetchInventoryData = React.useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);

    try {
      const endpoints = [
        { name: "medicines", url: "/inventory/medicine-stock-table/" },
        { name: "commodities", url: "/inventory/commodity-stock-table/" },
        { name: "firstaid", url: "/inventory/first-aid-stock-table/" },
        { name: "vaccines", url: "/inventory/combined-stock-table/" },
        { name: "immunization", url: "/inventory/combined-stock-table/" },
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
      if (medicinesResult?.success && medicinesResult.data) {
        // Set filter counts for medicines
        if (medicinesResult.data.filter_counts) {
          setFilterCounts(medicinesResult.data.filter_counts);
        }

        // Process the results array
        if (Array.isArray(medicinesResult.data.results)) {
          allInventory.push(
            ...medicinesResult.data.results.map((item: any) => ({
              id: item.minv_id ?? item.id ?? Math.random(),
              name: item.item?.medicineName ?? "Unknown Medicine",
              category: "medicine" as const,
              description: item.category ?? "Medicine",
              stock: item.availableStock ?? 0,
              wasted: item.wasted ?? 0,
              minStock: item.isLowStock ? 20 : 50,
              expiryDate: item.expiryDate ?? "N/A",
              batchNumber: item.batchNumber ?? item.inv_id ?? "N/A",
              lastUpdated: formatDate(item.created_at),
              isExpired: item.isExpired ?? false,
              isNearExpiry: item.isNearExpiry ?? false,
              isLowStock: item.isLowStock ?? false,
              isOutOfStock: item.isOutOfStock ?? false,
            }))
          );
        }
      }
      // Process commodities
      const commoditiesResult = results.find((r) => r.name === "commodities");
      if (commoditiesResult?.success && Array.isArray(commoditiesResult.data.results)) {
        if (commoditiesResult.data.filter_counts) {
          setFilterCounts((prev: any) => ({ ...prev, commodities: commoditiesResult.data.filter_counts }));
        }
        allInventory.push(
          ...commoditiesResult.data.results.map((item: any) => ({
            id: item.cinv_id ?? Math.random(),
            name: item.item?.com_name ?? "Unknown Commodity",
            category: "commodity" as const,
            description: "For all client type", // Default since user_type is absent in API
            stock: item.availableStock ?? 0,
            minStock: 50,
            wasted: item.wasted ?? 0,
            expiryDate: item.expiryDate ?? "N/A",
            batchNumber: item.batchNumber ?? "N/A",
            lastUpdated: formatDate(item.created_at),
          }))
        );
      }



      // Process first aid items
      const firstaidResult = results.find((r) => r.name === "firstaid");
      if (firstaidResult?.success && Array.isArray(firstaidResult.data.results)) {
        if (firstaidResult.data.filter_counts) {
          setFilterCounts((prev: any) => ({ ...prev, firstaidResult: firstaidResult.data.filter_counts }));
        }
        allInventory.push(
          ...firstaidResult.data.results.map((item: any) => ({
            id: item.finv_id ?? Math.random(),
            name: item.item?.fa_name ?? "Unknown First Aid",
            category: "first_aid" as const,
            description: "",
            stock: item.availableStock ?? 0,
            minStock: 10,
            wasted: item.wasted ?? 0,
            expiryDate: item.expiryDate ?? "N/A",
            batchNumber: item.batchNumber ?? "N/A",
            lastUpdated: formatDate(item.created_at),
          }))
        );
      }

      // Process vaccines and immunization supplies from combined-stock-table
      const combinedResult = results.find((r) => r.name === "vaccines"); // Use 'vaccines' or 'immunization' (they share the endpoint)
      if (combinedResult?.success && Array.isArray(combinedResult.data.results)) {
        if (combinedResult.data.filter_counts) {
          setFilterCounts((prev: any) => ({
            ...prev,
            vaccines: combinedResult.data.filter_counts, // Store for vaccines
          }));
        }

        // Process vaccines
        const vaccineItems = combinedResult.data.results.filter((item: any) => item.type === "vaccine");
        allInventory.push(
          ...vaccineItems.map((item: any) => ({
            id: item.vacStck_id ?? Math.random(),
            name: item.item?.antigen ?? "Unknown Vaccine",
            category: "vaccine" as const,
            description: item.item?.unit ? `${item.item.unit} (${item.item.dosage ? `${item.item.dosage} dose` : "Vaccine"})` : "Vaccine",
            stock: item.availableStock ?? 0,
            minStock: 5,
            wasted: item.wastedDose ?? 0,
            expiryDate: item.expiryDate ?? "N/A",
            batchNumber: item.batchNumber ?? "N/A",
            lastUpdated: formatDate(item.created_at),
            isExpired: item.isExpired ?? false,
            isNearExpiry: item.isNearExpiry ?? false,
            isLowStock: item.isLowStock ?? false,
            isOutOfStock: item.isOutOfStock ?? false,
          }))
        );

        // Process immunization supplies (if present in the response)
        const immunizationItems = combinedResult.data.results.filter((item: any) => item.type === "immunization_supply");
        allInventory.push(
          ...immunizationItems.map((item: any) => ({
            id: item.imzStck_id ?? Math.random(),
            name: item.item?.name ?? "Unknown Supply", // Adjust based on actual field
            category: "immunization_supply" as const,
            description: item.item?.unit ?? "Immunization Supply",
            stock: item.availableStock ?? 0,
            minStock: 15,
            wasted: item.wastedDose ?? 0,
            expiryDate: item.expiryDate ?? "N/A",
            batchNumber: item.batchNumber ?? "N/A",
            lastUpdated: formatDate(item.created_at),
            isExpired: item.isExpired ?? false,
            isNearExpiry: item.isNearExpiry ?? false,
            isLowStock: item.isLowStock ?? false,
            isOutOfStock: item.isOutOfStock ?? false,
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
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 font-medium">Loading inventory...</Text>
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
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Inventory</Text>}
      rightAction={<TouchableOpacity
        onPress={() => setShowFilters(!showFilters)}
        className="p-2 bg-gray-100 rounded-xl"
      >
        <Filter size={20} color="#3B82F6" />
      </TouchableOpacity>}
    >
      <View className="flex-1 bg-blue-50">
        {/* Header */}
        <View className="bg-white shadow-sm">

          {/* Search and Filter */}
          <View className="px-4 pb-4">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 flex-row items-center p-2 border border-gray-200 bg-gray-50 rounded-xl">
                <Search size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Search..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  accessibilityLabel="Search inventory items"
                />
              </View>

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
                      className={`px-3 py-1.5 rounded-full ${selectedCategory === category.id ? "bg-blue-100 border border-blue-200" : "bg-gray-100"
                        }`}
                      accessibilityLabel={`Filter by ${category.name}`}
                    >
                      <Text
                        className={`text-sm ${selectedCategory === category.id ? "text-blue-700 font-medium" : "text-gray-700"
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
                      className={`px-3 py-1.5 rounded-full ${selectedStockFilter === filter.id ? "bg-blue-100 border border-blue-200" : "bg-gray-100"
                        }`}
                      accessibilityLabel={`Filter by ${filter.name}`}
                    >
                      <Text
                        className={`text-sm ${selectedStockFilter === filter.id ? "text-blue-700 font-medium" : "text-gray-700"
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
                          className={`px-2 py-1 rounded-full ${stockStatus.status === "out_of_stock"
                            ? "bg-red-50"
                            : stockStatus.status === "low_stock"
                              ? "bg-orange-50"
                              : "bg-green-50"
                            }`}
                        >
                          <Text
                            className={`text-xs font-medium ${stockStatus.status === "out_of_stock"
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
                          {item.wasted !== 0 ? `Wasted unit: ${item.wasted}` : " "}
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
    </PageLayout>
  );
}