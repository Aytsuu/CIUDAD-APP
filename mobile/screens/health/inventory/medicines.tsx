import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, FlatList } from "react-native"
import { Search, Package, ChevronLeft, AlertTriangle, Filter, ChevronDown } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import * as React from "react"
import { router } from "expo-router"
import { api2 } from "@/api/api"

interface InventoryItem {
  id: number;
  name: string;
  category: 'medicine' | 'vaccine' | 'commodity' | 'first_aid' | 'immunization_supply';
  description: string;
  stock: number;
  minStock: number;
  expiryDate: string;
  batchNumber: string;
  lastUpdated: string;
}

export default function InventoryAdmin() {
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [selectedStockFilter, setSelectedStockFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [inventoryData, setInventoryData] = React.useState<InventoryItem[]>([])
  const [isError, setError] = React.useState<string | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const itemsPerPage = 10

  const fetchInventoryData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoints = [
        { name: 'medicines', url: '/inventory/medicineinventorylist/' },
        { name: 'commodities', url: '/inventory/commodityinventorylist/' },
        { name: 'firstaid', url: '/inventory/firstaidinventorylist/' },
        { name: 'vaccines', url: '/inventory/vaccine_stocks/' },
        { name: 'immunization', url: '/inventory/immunization_stock/' },
      ];

      const results = [];

      for (const endpoint of endpoints) {
        try {
          const response = await api2.get(endpoint.url);
          results.push({ name: endpoint.name, data: response.data, success: true });
        } catch (endpointError) {
          results.push({ name: endpoint.name, data: [], success: false, error: endpointError });
        }
      }

      const allInventory: InventoryItem[] = [];

      const medicinesResult = results.find(r => r.name === 'medicines');
      if (medicinesResult?.success && medicinesResult.data) {
        const standardizedMedicines: InventoryItem[] = medicinesResult.data.map((item: any) => ({
          id: item.minv_id,
          name: item.med_detail?.med_name || item.med_id?.med_name || 'Unknown Medicine',
          category: 'medicine' as const,
          description: item.med_detail?.med_type || 'Medicine',
          stock: item.minv_qty_avail || 0,
          minStock: 20,
          expiryDate: item.inv_detail?.expiry_date || 'N/A',
          batchNumber: 'N/A',
          lastUpdated: item.inv_detail?.updated_at ?
            new Date(item.inv_detail.updated_at).toLocaleDateString() : 'N/A',
        }));
        allInventory.push(...standardizedMedicines);
      }

      const commoditiesResult = results.find(r => r.name === 'commodities');
      if (commoditiesResult?.success && commoditiesResult.data) {
        const standardizedCommodities: InventoryItem[] = commoditiesResult.data.map((item: any) => ({
          id: item.cinv_id,
          name: item.com_detail?.com_name || item.com_id?.com_name || 'Unknown Commodity',
          category: 'commodity' as const,
          description: `For ${item.com_detail?.user_type || 'all users'}`,
          stock: item.cinv_qty_avail || 0,
          minStock: 50,
          expiryDate: item.inv_detail?.expiry_date || 'N/A',
          batchNumber: 'N/A',
          lastUpdated: item.inv_detail?.updated_at ?
          new Date(item.inv_detail.updated_at).toLocaleDateString() : 'N/A',
        }));
        allInventory.push(...standardizedCommodities);
      }

      const firstaidResult = results.find(r => r.name === 'firstaid');
      if (firstaidResult?.success && firstaidResult.data) {
        const standardizedFirstAids: InventoryItem[] = firstaidResult.data.map((item: any) => ({
          id: item.finv_id,
          name: item.fa_detail?.fa_name || item.fa_id?.fa_name || 'Unknown First Aid',
          category: 'first_aid' as const,
          description: item.fa_detail?.catlist || 'First aid item',
          stock: item.finv_qty_avail || 0,
          minStock: 10,
          expiryDate: item.inv_detail?.expiry_date || 'N/A',
          batchNumber: 'N/A',
          lastUpdated: item.inv_detail?.updated_at ?
          new Date(item.inv_detail.updated_at).toLocaleDateString() : 'N/A',
        }));
        allInventory.push(...standardizedFirstAids);
      }

      const vaccinesResult = results.find(r => r.name === 'vaccines');
      if (vaccinesResult?.success && vaccinesResult.data) {
        const standardizedVaccines: InventoryItem[] = vaccinesResult.data.map((item: any) => ({
          id: item.vacStck_id,
          name: item.vaccinelist?.vac_name || item.vac_id?.vac_name || 'Unknown Vaccine',
          category: 'vaccine' as const,
          description: item.vaccinelist?.vac_type_choices || 'Vaccine',
          stock: item.vacStck_qty_avail || 0,
          minStock: 5,
          expiryDate: item.inv_details?.expiry_date || item.inv_id?.expiry_date || 'N/A',
          batchNumber: item.batch_number || 'N/A',
          lastUpdated: item.inv_details?.updated_at || item.updated_at ?
          new Date(item.inv_details?.updated_at || item.updated_at).toLocaleDateString() : 'N/A',
        }));
        allInventory.push(...standardizedVaccines);
      }

      const immunizationResult = results.find(r => r.name === 'immunization');
      if (immunizationResult?.success && immunizationResult.data) {
        const standardizedImmunization: InventoryItem[] = immunizationResult.data.map((item: any) => ({
          id: item.imzStck_id,
          name: item.imz_detail?.imz_name || item.imz_id?.imz_name || 'Unknown Supply',
          category: 'immunization_supply' as const,
          description: item.imzStck_unit || 'Immunization Supply',
          stock: item.imzStck_avail || 0,
          minStock: 15,
          expiryDate: item.inv_detail?.expiry_date || 'N/A',
          batchNumber: item.batch_number || 'N/A',
          lastUpdated: item.inv_detail?.updated_at ?
          new Date(item.inv_detail.updated_at).toLocaleDateString() : 'N/A',
        }));
        allInventory.push(...standardizedImmunization);
      }

      setInventoryData(allInventory);
    } catch (error) {
      setError("Failed to load inventory data. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInventoryData();
    setRefreshing(false);
    setPage(1);
  };

  React.useEffect(() => {
    fetchInventoryData();
  }, []);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'medicine', name: 'Medicine' },
    { id: 'vaccine', name: 'Vaccine' },
    { id: 'commodity', name: 'Commodity' },
    { id: 'first_aid', name: 'First Aid' },
    { id: 'immunization_supply', name: 'Immunization Supplies' },
  ];

  const stockFilters = [
    { id: 'all', name: 'All Stock' },
    { id: 'low_stock', name: 'Low Stock' },
    { id: 'out_of_stock', name: 'Out of Stock' },
    { id: 'in_stock', name: 'In Stock' },
  ];

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { text: 'Out of Stock', color: '#EF4444', status: 'out_of_stock' };
    if (stock <= minStock) return { text: 'Low Stock', color: '#F59E0B', status: 'low_stock' };
    return { text: 'In Stock', color: '#10B981', status: 'in_stock' };
  };

  const filteredInventory = React.useMemo(() => {
    return inventoryData
      .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
      .filter(item => {
        const status = getStockStatus(item.stock, item.minStock).status;
        return selectedStockFilter === 'all' || status === selectedStockFilter;
      })
      .filter(item =>
        searchQuery.trim() === '' ||
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
      lowStock: inventoryData.filter(item => item.stock > 0 && item.stock <= item.minStock).length,
      outOfStock: inventoryData.filter(item => item.stock === 0).length,
      inStock: inventoryData.filter(item => item.stock > item.minStock).length,
      showingItems: `${Math.min(page * itemsPerPage, filteredInventory.length)} of ${filteredInventory.length}`
    }
  }, [inventoryData, page, filteredInventory]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <View className="bg-white p-8 rounded-2xl items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600 font-medium">Loading inventory...</Text>
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gradient-to-br from-red-50 to-pink-100">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <AlertTriangle size={48} color="#EF4444" />
          <Text className="text-red-500 text-xl font-bold mb-2 mt-4">Error</Text>
          <Text className="text-gray-700 text-center leading-6">
            {error || "Failed to load inventory data. Please try again later."}
          </Text>
          <TouchableOpacity onPress={fetchInventoryData} className="mt-6 px-6 py-3 bg-red-500 rounded-xl">
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <View className="bg-white shadow-lg">
        <View className="flex-row items-center p-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-3 bg-gray-100 rounded-full">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">Medical Inventory</Text>
          </View>
        </View>

        {/* Search and Filter Bar */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center space-x-3">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <Search size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800 font-medium"
                placeholder="Search by name or description..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <TouchableOpacity 
              onPress={() => setShowFilters(!showFilters)}
              className="bg-gray-100 p-3 rounded-2xl"
            >
              <Filter size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Filter Dropdown */}
          {showFilters && (
            <View className="mt-2 bg-white rounded-xl shadow-md p-3">
              <Text className="font-semibold text-gray-700 mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {categories.map((category) => (
                  <TouchableOpacity 
                    key={category.id}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full ${selectedCategory === category.id ? 'bg-blue-100 border border-blue-200' : 'bg-gray-100'}`}
                  >
                    <Text className={`text-sm ${selectedCategory === category.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}>
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
                    className={`px-3 py-1.5 rounded-full ${selectedStockFilter === filter.id ? 'bg-blue-100 border border-blue-200' : 'bg-gray-100'}`}
                  >
                    <Text className={`text-sm ${selectedStockFilter === filter.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}>
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
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Cards */}
        <View className="p-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <View className="bg-blue-100 p-4 rounded-2xl shadow-sm min-w-[160px]">
                <View className="flex-row items-center mb-2">
                  <Package size={20} color="#3B82F6" />
                  <Text className="ml-2 text-gray-600 font-medium">Total Items</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">{stats.totalItems}</Text>
              </View>

              <View className="bg-blue-100 p-4 rounded-2xl shadow-sm min-w-[160px]">
                <View className="flex-row items-center mb-2">
                  <AlertTriangle size={20} color="#F59E0B" />
                  <Text className="ml-2 text-gray-600 font-medium">Low Stock</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">{stats.lowStock}</Text>
              </View>

              <View className="bg-blue-100 p-4 rounded-2xl shadow-sm min-w-[160px]">
                <View className="flex-row items-center mb-2">
                  <AlertTriangle size={20} color="#EF4444" />
                  <Text className="ml-2 text-gray-600 font-medium">Out of Stock</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">{stats.outOfStock}</Text>
              </View>

              <View className="bg-blue-100 p-4 rounded-2xl shadow-sm min-w-[160px]">
                <View className="flex-row items-center mb-2">
                  <Package size={20} color="#10B981" />
                  <Text className="ml-2 text-gray-600 font-medium">In Stock</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">{stats.inStock}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Inventory List Header */}
        <View className="px-4 mb-2 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800">
            Inventory ({filteredInventory.length})
          </Text>
          <Text className="text-gray-500 text-sm">
            Showing {stats.showingItems}
          </Text>
        </View>

        {/* Inventory List */}
        <View className="px-4 pb-6">
          {filteredInventory.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
              <Package size={48} color="#D1D5DB" />
              <Text className="text-gray-600 text-xl font-bold mb-2 mt-4">No Items Found</Text>
              <Text className="text-gray-500 text-center leading-6">
                {searchQuery
                  ? "No items match your search criteria."
                  : "There are no inventory items recorded yet."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={paginatedInventory}
              keyExtractor={(item) => `item-${item.category}-${item.id}`}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const stockStatus = getStockStatus(item.stock, item.minStock);
                return (
                  <TouchableOpacity
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4"
                  >
                    <View className="p-5">
                      <View className="flex-row justify-between items-start mb-3">
                        <Text className="text-lg font-bold text-gray-800 flex-1 pr-2">
                          {item.name}
                        </Text>
                        <View className={`px-3 py-1 rounded-full ${stockStatus.status === 'out_of_stock' ? 'bg-red-100 border border-red-200' : stockStatus.status === 'low_stock' ? 'bg-orange-100 border border-orange-200' : 'bg-green-100 border border-green-200'}`}>
                          <Text className={`text-xs font-semibold ${stockStatus.status === 'out_of_stock' ? 'text-red-700' : stockStatus.status === 'low_stock' ? 'text-orange-700' : 'text-green-700'}`}>
                            {stockStatus.text}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-gray-600 text-sm mb-4">
                        {item.description}
                      </Text>

                      <View className="flex-row justify-between items-center mb-3">
                        <View>
                          <Text className="text-gray-500 text-sm">Current Stock</Text>
                          <Text className="text-2xl font-bold text-gray-800">
                            {item.stock}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-gray-500 text-sm">Minimum Stock</Text>
                          <Text className="text-lg font-semibold text-gray-700">
                            {item.minStock}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View className="bg-gray-200 h-2 rounded-full mb-4">
                        <View
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%`,
                            backgroundColor: stockStatus.color
                          }}
                        />
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 text-xs">
                          {item.batchNumber !== 'N/A' ? `Batch: ${item.batchNumber}` : ' '}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {item.expiryDate !== 'N/A' ? `Expires: ${item.expiryDate}` : ' '}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              }}
            />
          )}
        </View>

        {/* Pagination Controls */}
        {filteredInventory.length > itemsPerPage && (
          <View className="px-4 pb-6">
            <View className="bg-white rounded-2xl p-4 shadow-sm flex-row justify-between items-center">
              <TouchableOpacity 
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-100' : 'bg-blue-50'}`}
              >
                <Text className={`font-medium ${page === 1 ? 'text-gray-400' : 'text-blue-700'}`}>Previous</Text>
              </TouchableOpacity>
              
              <Text className="text-gray-600">
                Page {page} of {totalPages}
              </Text>
              
              <TouchableOpacity 
                onPress={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg ${page === totalPages ? 'bg-gray-100' : 'bg-blue-50'}`}
              >
                <Text className={`font-medium ${page === totalPages ? 'text-gray-400' : 'text-blue-700'}`}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}