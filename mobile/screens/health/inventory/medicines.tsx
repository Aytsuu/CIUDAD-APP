"use client"

import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from "react-native"
import { Search, Filter, Package, AlertTriangle, Plus, Eye, Edit3, Trash2, ArrowLeft, ChevronLeft } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import * as React from "react"
import { router } from "expo-router"

export default function InventoryAdmin() {
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)
  const [inventoryData, setInventoryData] = React.useState([])

  // Sample data - Replace with actual database fetch
  const sampleInventory = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      category: "medicine",
      description: "Pain reliever and fever reducer tablets",
      stock: 150,
      minStock: 50,
      expiryDate: "2025-12-15",
      batchNumber: "PCT2024001",
      supplier: "PharmaCorp",
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      name: "COVID-19 Vaccine",
      category: "vaccine",
      description: "mRNA COVID-19 vaccine for immunization",
      stock: 25,
      minStock: 10,
      expiryDate: "2025-06-30",
      batchNumber: "COV2024002",
      supplier: "VaxCorp",
      lastUpdated: "2024-01-14"
    },
    {
      id: 3,
      name: "Surgical Masks",
      category: "commodity",
      description: "Disposable 3-layer surgical face masks",
      stock: 500,
      minStock: 100,
      expiryDate: "2026-03-20",
      batchNumber: "MSK2024003",
      supplier: "MedSupply Co.",
      lastUpdated: "2024-01-13"
    },
    {
      id: 4,
      name: "Adhesive Bandages",
      category: "first_aid",
      description: "Sterile adhesive bandages assorted sizes",
      stock: 8,
      minStock: 20,
      expiryDate: "2025-09-10",
      batchNumber: "BND2024004",
      supplier: "FirstAid Ltd.",
      lastUpdated: "2024-01-12"
    },
    {
      id: 5,
      name: "Amoxicillin 250mg",
      category: "medicine",
      description: "Antibiotic capsules for bacterial infections",
      stock: 75,
      minStock: 30,
      expiryDate: "2025-08-22",
      batchNumber: "AMX2024005",
      supplier: "PharmaCorp",
      lastUpdated: "2024-01-11"
    },
    {
      id: 6,
      name: "Hepatitis B Vaccine",
      category: "vaccine",
      description: "Hepatitis B vaccination for adults",
      stock: 40,
      minStock: 15,
      expiryDate: "2025-11-05",
      batchNumber: "HEP2024006",
      supplier: "VaxCorp",
      lastUpdated: "2024-01-10"
    }
  ]

  const categories = [
    { id: 'all', name: 'All Items', icon: Package, color: '#6B7280' },
    { id: 'medicine', name: 'Medicine', icon: Package, color: '#3B82F6' },
    { id: 'vaccine', name: 'Vaccine', icon: Package, color: '#10B981' },
    { id: 'commodity', name: 'Commodity', icon: Package, color: '#F59E0B' },
    { id: 'first_aid', name: 'First Aid', icon: Package, color: '#EF4444' }
  ]

  // Filter and search logic
  const filteredInventory = React.useMemo(() => {
    let filtered = sampleInventory

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [selectedCategory, searchQuery])

  // Get stock status
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { status: 'out', color: 'F59E0B', text: 'Out of Stock' }
    if (stock <= minStock) return { status: 'low', color: '##EF4444', text: 'Low Stock' }
    return { status: 'good', color: '#10B981', text: 'In Stock' }
  }

  // Simulate data fetching
  const fetchInventoryData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setInventoryData(sampleInventory)
    setIsLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchInventoryData()
    setRefreshing(false)
  }

  React.useEffect(() => {
    fetchInventoryData()
  }, [])

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <View className="relative bg-white pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center rounded-full py-2"
          >
            <ChevronLeft size={18} color="#263D67" />
            <Text className="text-[#263D67] text-[15px] font-PoppinsMedium ml-1">
              Back
            </Text>
          </TouchableOpacity>

          <View className="pt-2">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-PoppinsBold text-[#263D67]">Inventory</Text>
                <Text className="text-sm font-PoppinsRegular text-[#6B7280]">
                  Manage your medical supplies
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-[#263D67] font-PoppinsRegular"
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row space-x-3">
            {categories.map((category) => {
              const IconComponent = category.icon
              const isSelected = selectedCategory === category.id
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`flex-row items-center px-4 py-2 rounded-full ${isSelected ? 'bg-[#263D67]' : 'bg-white border border-gray-200'
                    }`}
                >
                  <IconComponent
                    size={16}
                    color={isSelected ? 'white' : category.color}
                  />
                  <Text className={`ml-2 font-PoppinsMedium text-sm ${isSelected ? 'text-white' : 'text-[#263D67]'
                    }`}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      </View>

      {/* Statistics Cards */}
      <View className="px-4 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-4">
            <View className="bg-white p-4 rounded-xl shadow-sm min-w-[120px]">
              <Text className="text-2xl font-PoppinsBold text-[#263D67]">
                {filteredInventory.length}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-[#6B7280]">Total Items</Text>
            </View>
            <View className="bg-white p-4 rounded-xl shadow-sm min-w-[120px]">
              <Text className="text-2xl font-PoppinsBold text-red-500">
                {filteredInventory.filter(item => item.stock <= item.minStock).length}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-[#6B7280]">Low Stock</Text>
            </View>
            <View className="bg-white p-4 rounded-xl shadow-sm min-w-[120px]">
              <Text className="text-2xl font-PoppinsBold text-amber-500">
                {filteredInventory.filter(item => item.stock === 0).length}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-[#6B7280]">Out of Stock</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Inventory List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#263D67" />
            <Text className="text-[#6B7280] font-PoppinsRegular mt-4">Loading inventory...</Text>
          </View>
        ) : filteredInventory.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Package size={48} color="#D1D5DB" />
            <Text className="text-xl font-PoppinsSemiBold text-[#6B7280] mt-4">No items found</Text>
            <Text className="text-[#9CA3AF] font-PoppinsRegular mt-2 text-center">
              Try adjusting your search
            </Text>
          </View>
        ) : (
          <View className="pb-4">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item.stock, item.minStock)
              return (
                <View key={item.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                  {/* Item Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-lg font-PoppinsSemiBold text-[#263D67] flex-1">
                          {item.name}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${stockStatus.color}20` }}
                        >
                          <Text
                            className="text-xs font-PoppinsMedium"
                            style={{ color: stockStatus.color }}
                          >
                            {stockStatus.text}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm font-PoppinsRegular text-[#6B7280] mb-2">
                        {item.description}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-xs font-PoppinsRegular text-[#9CA3AF]">
                          Batch: {item.batchNumber}
                        </Text>
                        <Text className="text-xs font-PoppinsRegular text-[#9CA3AF] ml-4">
                          Expires: {item.expiryDate}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Stock Information */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Text className="text-2xl font-PoppinsBold text-[#263D67]">
                        {item.stock}
                      </Text>
                      <Text className="text-sm font-PoppinsRegular text-[#6B7280] ml-2">
                        in stock
                      </Text>
                      {item.stock <= item.minStock && (
                        <View className="ml-2">
                          <AlertTriangle size={16} color="#F59E0B" />
                        </View>
                      )}
                    </View>
                    <Text className="text-sm font-PoppinsRegular text-[#9CA3AF]">
                      Min: {item.minStock}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="bg-gray-200 h-2 rounded-full mb-3">
                    <View
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%`,
                        backgroundColor: stockStatus.color
                      }}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-PoppinsRegular text-[#9CA3AF]">
                      Updated: {item.lastUpdated}
                    </Text>

                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}