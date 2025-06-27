import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from "react-native"
import { Search, Package, ChevronLeft, AlertTriangle } from "lucide-react-native"
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
  const [error, setError] = React.useState<string | null>(null)

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
          minStock: 20, // Default minimum stock
          expiryDate: item.inv_detail?.expiry_date || 'N/A',
          batchNumber: 'N/A',
          lastUpdated: item.inv_detail?.updated_at ?
            new Date(item.inv_detail.updated_at).toLocaleDateString() : 'N/A',

        }));

        allInventory.push(...standardizedMedicines);

      }



      // Process commodities

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



      // Process first aid

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



      // Process vaccines

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



      // Process immunization supplies

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
    if (stock <= 0) return { text: 'Out of Stock', color: '#FFC107', status: 'out_of_stock' };
    if (stock <= minStock) return { text: 'Low Stock', color: '#DC3545', status: 'low_stock' };
    return { text: 'In Stock', color: '#28A745', status: 'in_stock' };
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

  return (
    <View className="flex-1 bg-[#F8F8F8]">
      {/* Header Section */}
      <View className="bg-white px-5 pt-14 pb-5 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center rounded-full py-2">
          <ChevronLeft size={20} color="#263D67" />
          <Text className="text-[#263D67] text-[16px] font-PoppinsMedium ml-1">Back</Text>
        </TouchableOpacity>

        <View className="pt-4">
          <Text className="text-3xl font-PoppinsBold text-[#263D67]">Inventory</Text>
          <Text className="text-base font-PoppinsRegular text-[#6B7280] mt-1">Manage your medical supplies efficiently</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-[#F0F0F0] rounded-xl px-4 py-3 my-5 border border-[#E0E0E0]">
          <Search size={22} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-[#263D67] font-PoppinsRegular text-base"
            placeholder="Search inventory..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
          <View className="flex-row space-x-3">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setSelectedStockFilter('all');
                  }}
                  className={`px-5 py-2.5 rounded-full ${isSelected ? 'bg-[#263D67]' : 'bg-white border border-[#E0E0E0]'}`}
                >
                  <Text className={`font-PoppinsMedium text-sm ${isSelected ? 'text-white' : 'text-[#263D67]'}`}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Statistics Cards */}
      <View className="px-5 py-5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setSelectedStockFilter('all');
                setSelectedCategory('all');
              }}
              className="bg-white p-5 rounded-xl shadow-md min-w-[140px]"
            >
              <Text className="text-3xl font-PoppinsBold text-[#263D67]">
                {inventoryData.length}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-[#6B7280] mt-1">Total Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedStockFilter('low_stock');
                setSelectedCategory('all');
              }}
              className="bg-white p-5 rounded-xl shadow-md min-w-[140px]"
            >
              <Text className="text-3xl font-PoppinsBold text-[#DC3545]">
                {inventoryData.filter(item => item.stock > 0 && item.stock <= item.minStock).length}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-[#6B7280] mt-1">Low Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedStockFilter('out_of_stock');
                setSelectedCategory('all');
              }}
              className="bg-white p-5 rounded-xl shadow-md min-w-[140px]"
            >
              <Text className="text-3xl font-PoppinsBold text-[#FFC107]">
                {inventoryData.filter(item => item.stock === 0).length}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-[#6B7280] mt-1">Out of Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedStockFilter('in_stock');
                setSelectedCategory('all');
              }}
              className="bg-white p-5 rounded-xl shadow-md min-w-[140px]"
            >
              <Text className="text-3xl font-PoppinsBold text-[#28A745]">
                {inventoryData.filter(item => item.stock > item.minStock).length}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-[#6B7280] mt-1">In Stock</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-5"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#263D67" />}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View className="items-center justify-center py-20">
            <AlertTriangle size={56} color="#DC3545" />
            <Text className="text-xl font-PoppinsSemiBold text-[#DC3545] mt-4">Error Loading Data</Text>
            <Text className="text-[#6B7280] font-PoppinsRegular mt-2 text-center px-4 text-base">{error}</Text>
            <TouchableOpacity onPress={fetchInventoryData} className="mt-6 bg-[#263D67] px-8 py-3 rounded-lg shadow-sm">
              <Text className="text-white font-PoppinsMedium text-base">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#263D67" />
            <Text className="text-[#6B7280] font-PoppinsRegular mt-4 text-base">Loading inventory...</Text>
          </View>
        ) : filteredInventory.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Package size={56} color="#B0B0B0" />
            <Text className="text-xl font-PoppinsSemiBold text-[#6B7280] mt-4">No items found</Text>
            <Text className="text-[#9CA3AF] font-PoppinsRegular mt-2 text-center text-base">
              Try adjusting your filters or search query.
            </Text>
          </View>
        ) : (
          <View className="pb-6">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item.stock, item.minStock);
              return (
                <View key={`${item.category}-${item.id}`} className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-[#E0E0E0]">
                  <View className="flex-row items-start justify-between mb-3">
                    <Text className="text-lg font-PoppinsSemiBold text-[#263D67] flex-1 pr-3">
                      {item.name}
                    </Text>
                    <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: `${stockStatus.color}20` }}>
                      <Text className="text-xs font-PoppinsMedium" style={{ color: stockStatus.color }}>
                        {stockStatus.text}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-sm font-PoppinsRegular text-[#6B7280] mb-3">
                    {item.description}
                  </Text>

                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Text className="text-3xl font-PoppinsBold text-[#263D67]">
                        {item.stock}
                      </Text>
                      <Text className="text-base font-PoppinsRegular text-[#6B7280] ml-2">
                        in stock
                      </Text>
                      {item.stock <= item.minStock && item.stock > 0 && (
                        <View className="ml-2">
                          <AlertTriangle size={20} color="#DC3545" />
                        </View>
                      )}
                    </View>
                    <Text className="text-sm font-PoppinsRegular text-[#9CA3AF]">
                      Min: {item.minStock}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="bg-[#E0E0E0] h-2.5 rounded-full mb-4">
                    <View
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%`,
                        backgroundColor: stockStatus.color
                      }}
                    />
                  </View>

                  <View className="flex-row justify-between items-center text-xs">
                    <Text className="text-xs font-PoppinsRegular text-[#9CA3AF]">
                      {item.batchNumber !== 'N/A' ? `Batch: ${item.batchNumber}` : ' '}
                    </Text>
                    <Text className="text-xs font-PoppinsRegular text-[#9CA3AF]">
                      {item.expiryDate !== 'N/A' ? `Expires: ${item.expiryDate}` : ' '}
                    </Text>
                  </View>

                  {item.lastUpdated !== 'N/A' && (
                    <Text className="text-xs font-PoppinsRegular text-[#9CA3AF] mt-1.5">
                      Updated: {item.lastUpdated}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
