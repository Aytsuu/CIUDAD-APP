// request-page.tsx
import { useState, useEffect, useMemo } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { ArrowLeft, Search, ShoppingBag, ChevronDown, Pill, Filter, X } from "lucide-react-native"
import { useGlobalCartState, Medicine as CartMedicineType } from "./cart-state" // Import useGlobalCartState and Medicine type from cart-state
import { useMedicines } from "../inventory/queries/medicine/MedicineFetchQueries" // Ensure this path is correct

// Type definition for medicines displayed on this page (matches backend response from MedicineInventorySerializer)
export type MedicineDisplay = {
  minv_id: number; // Corresponds to id in CartMedicineType
  medicine_name: string; // Corresponds to name
  category_name: string; // Corresponds to category
  medicine_type: string; // Corresponds to medicine_type (e.g., 'Prescription', 'OTC')
  minv_dsg: number; // Dosage number
  minv_dsg_unit: string; // Dosage unit
  description?: string; // Optional: from backend
  minv_qty_avail: number; // Available stock
  // You might also have inv_id, med_id, etc., but they are not directly displayed here
};


export default function MedicineRequestScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCategories, setShowCategories] = useState(false)
  
  // Use the global cart state hook
  const { cartItems } = useGlobalCartState();

  // Fetch medicines using react-query
  const { data: fetchedMedicines, isLoading, isError, error } = useMedicines();

  // Process and filter medicines
  const medicines = useMemo(() => {
    if (!fetchedMedicines) return [];

    // First, filter only medicines with stock
    const inStockMedicines = fetchedMedicines.filter(
      (item: MedicineDisplay) => item.minv_qty_avail > 0
    );

    // Then apply search and category filters
    const lowercasedQuery = searchQuery.toLowerCase();
    return inStockMedicines.filter((medicine: MedicineDisplay) => {
      const matchesSearch =
        medicine.medicine_name.toLowerCase().includes(lowercasedQuery) ||
        medicine.category_name.toLowerCase().includes(lowercasedQuery) ||
        medicine.medicine_type.toLowerCase().includes(lowercasedQuery) ||
        (medicine.minv_dsg_unit && `${medicine.minv_dsg} ${medicine.minv_dsg_unit}`.toLowerCase().includes(lowercasedQuery)) ||
        (medicine.description && medicine.description.toLowerCase().includes(lowercasedQuery));

      const matchesCategory =
        selectedCategory === "All" || medicine.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [fetchedMedicines, searchQuery, selectedCategory]);


  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!fetchedMedicines) return ["All"];
    const uniqueCategories = Array.from(new Set(fetchedMedicines.map((med: MedicineDisplay) => med.category_name)));
    return ["All", ...uniqueCategories];
  }, [fetchedMedicines]);

  // Handle press on a medicine item
  const handleMedicinePress = (medicine: MedicineDisplay) => {
    // Encode the entire medicine object as a JSON string to pass it as a parameter
    const medicineString = JSON.stringify({
      id: medicine.minv_id,
      name: medicine.medicine_name,
      category: medicine.category_name,
      medicine_type: medicine.medicine_type,
      dosage: `${medicine.minv_dsg} ${medicine.minv_dsg_unit}`.trim(),
      description: medicine.description,
      minv_qty_avail: medicine.minv_qty_avail,
    });
    router.push({
      pathname: "/medicine-request/details", // Ensure this path matches your details.tsx route
      params: { medicineData: medicineString },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-gray-700">Loading medicines...</Text>
        </View>
      </SafeAreaView>
    )
  }

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
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-10 p-3 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-800">Request Medicine</Text>
          <TouchableOpacity onPress={() => router.push("/medicine-request/cart")} className="p-2 relative">
            <ShoppingBag size={24} color="blue" />
            {cartItems.length > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                <Text className="text-white text-xs font-bold">{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
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

          {/* Category Filter */}
          <TouchableOpacity
            onPress={() => setShowCategories(!showCategories)}
            className="flex-row items-center justify-between mt-3 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          >
            <Text className="text-gray-800">
              Category: <Text className="font-semibold">{selectedCategory}</Text>
            </Text>
            <Filter size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {showCategories && (
            <View className="mt-2 border border-gray-200 rounded-lg bg-white max-h-48 overflow-hidden">
              <ScrollView>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category as string}
                    onPress={() => {
                      setSelectedCategory(category as string)
                      setShowCategories(false)
                    }}
                    className={`py-3 px-4 ${
                      selectedCategory === category ? "bg-blue-50" : "bg-white"
                    } border-b border-gray-100 last:border-b-0`}
                  >
                    <Text
                      className={`text-gray-800 ${
                        selectedCategory === category ? "font-semibold text-blue-600" : ""
                      }`}
                    >
                      {category as string}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Medicine List */}
        <View className="flex-1 bg-white ">
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {medicines.length > 0 ? (
              <View className="px-4 py-3 gap-2">
                {medicines.map((medicine: MedicineDisplay) => ( // Use MedicineDisplay type here
                  <TouchableOpacity
                    key={medicine.minv_id} // Use minv_id as key as it's unique from backend
                    onPress={() => handleMedicinePress(medicine)}
                    className="flex-row items-center justify-between p-4 mb-3 bg-white rounded-lg shadow-sm border border-gray-300"
                  >
                    <Pill size={24} color="blue" />
                    <View className="flex-1 ml-4">
                      <Text className="text-lg font-semibold text-gray-900">{medicine.medicine_name}</Text>
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-sm font-medium text-gray-700">
                          {medicine.category_name}
                        </Text>
                        {/* <Text className="text-sm text-gray-600 ml-2">
                          Type: {medicine.medicine_type}
                        </Text> */}
                      </View>
                      {medicine.minv_dsg && medicine.minv_dsg_unit && (
                        <Text className="text-gray-600 text-sm mt-1">
                          Dosage: {medicine.minv_dsg} {medicine.minv_dsg_unit}
                        </Text>
                      )}
                      {medicine.description && (
                        <Text className="text-gray-600 text-sm mt-1 leading-5">
                          {medicine.description}
                        </Text>
                      )}
                      <View className="mt-2">
                        <Text
                          className={`text-sm font-semibold ${
                            medicine.minv_qty_avail > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {medicine.minv_qty_avail > 0
                            ? `${medicine.minv_qty_avail} in stock`
                            : "Out of stock"}
                        </Text>
                      </View>
                    </View>
                    <View className="ml-4">
                      <ChevronDown
                        size={20}
                        color="#9CA3AF"
                        style={{ transform: [{ rotate: "270deg" }] }} // Points right
                      />
                    </View>
                  </TouchableOpacity>
                ))}
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
      </View>
    </SafeAreaView>
  )
}