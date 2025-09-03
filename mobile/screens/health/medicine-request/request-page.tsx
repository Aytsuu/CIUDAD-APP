// request-page.tsx
import { useState, useEffect, useMemo } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { ArrowLeft, Search, ShoppingBag, ChevronDown, Pill, Filter, X, Ban, ChevronLeft } from "lucide-react-native"
import { useGlobalCartState } from "./cart-state"
import { useMedicines } from "../admin/admin-inventory/queries/medicine/MedicineFetchQueries"
import PageLayout from "@/screens/_PageLayout"

// Updated type definition to match the API response
export type MedicineDisplay = {
  type: string;
  id: number;
  batchNumber: string;
  category: string;
  item: {
    medicineName: string;
    dosage: number;
    dsgUnit: string;
    form: string;
  };
  qty: {
    qty: number;
    pcs: number;
  };
  minv_qty_unit: string;
  administered: string;
  wasted: string;
  availableStock: number;
  expiryDate: string;
  inv_id: string;
  med_id: string;
  minv_id: number;
  qty_number: number;
  isArchived: boolean;
  created_at: string;
  isExpired: boolean;
  isNearExpiry: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
};

export default function MedicineRequestScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCategories, setShowCategories] = useState(false)
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { cartItems } = useGlobalCartState();

  // Fetch medicines using react-query
  const { data: fetchedMedicines, isLoading, isError, error } = useMedicines(currentPage, pageSize, searchQuery);

  // Process and filter medicines
  const medicines = useMemo(() => {
    if (!fetchedMedicines || !fetchedMedicines.results) return [];

    const lowercasedQuery = searchQuery.toLowerCase();
    return fetchedMedicines.results.filter((medicine: MedicineDisplay) => {
      const matchesSearch =
        (medicine.item.medicineName && medicine.item.medicineName.toLowerCase().includes(lowercasedQuery)) ||
        (medicine.category && medicine.category.toLowerCase().includes(lowercasedQuery)) ||
        (medicine.item.form && medicine.item.form.toLowerCase().includes(lowercasedQuery)) ||
        (medicine.item.dosage != null && medicine.item.dsgUnit &&
          `${medicine.item.dosage} ${medicine.item.dsgUnit}`.toLowerCase().includes(lowercasedQuery));

      const matchesCategory =
        selectedCategory === "All" || (medicine.category && medicine.category === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [fetchedMedicines, searchQuery, selectedCategory]);

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!fetchedMedicines || !fetchedMedicines.results) return ["All"];
    
    const uniqueCategories = Array.from(
      new Set(
        fetchedMedicines.results
          .filter((med: MedicineDisplay) => med.category && typeof med.category === "string")
          .map((med: MedicineDisplay) => med.category)
      )
    );
    return ["All", ...uniqueCategories];
  }, [fetchedMedicines]);

  // Handle press on a medicine item
  const handleMedicinePress = (medicine: MedicineDisplay) => {
    // Check if medicine is out of stock
    if (medicine.availableStock <= 0) {
      return; // Do nothing if out of stock
    }

    const medicineString = JSON.stringify({
      id: medicine.med_id,
      name: medicine.item.medicineName,
      category: medicine.category,
      medicine_type: medicine.item.form,
      dosage: medicine.item.dosage && medicine.item.dsgUnit 
        ? `${medicine.item.dosage} ${medicine.item.dsgUnit}`.trim() 
        : "Not specified",
      availableStock: medicine.availableStock,
    });
    
    
    router.push({
      pathname: "/medicine-request/details",
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
    <PageLayout
          leftAction={
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </TouchableOpacity>
          }
          headerTitle={<Text className="text-gray-900 text-[13px]">Request Medicine</Text>}
          rightAction={<TouchableOpacity onPress={() => router.push("/medicine-request/cart")} className="p-2 relative">
            <ShoppingBag size={24} color="blue" />
            {cartItems.length > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                <Text className="text-white text-xs font-bold">{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity> }
        >
    

        

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
                    className={`py-3 px-4 ${selectedCategory === category ? "bg-blue-50" : "bg-white"
                      } border-b border-gray-100 last:border-b-0`}
                  >
                    <Text
                      className={`text-gray-800 ${selectedCategory === category ? "font-semibold text-blue-600" : ""
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
          <Text className="ml-4">Available Medicines</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {medicines.length > 0 ? (
              <View className="px-4 py-3 gap-2">
                {medicines.map((medicine: MedicineDisplay) => {
                  // Check if medicine is out of stock
                  const isOutOfStock = medicine.availableStock <= 0;
                  console.log("Stocks:", medicine.availableStock)
                  return (
                    <TouchableOpacity
                      key={medicine.med_id}
                      onPress={() => handleMedicinePress(medicine)}
                      className={`flex-row items-center justify-between p-4 mb-3 rounded-lg shadow-sm border ${isOutOfStock
                          ? "bg-gray-100 border-gray-300 opacity-70"
                          : "bg-white border-gray-300"
                        }`}
                      disabled={isOutOfStock}
                    >
                      <View className="flex-row items-center flex-1">
                        <Pill size={24} color={isOutOfStock ? "#9CA3AF" : "blue"} />
                        <View className="flex-1 ml-4">
                          <View className="flex-row items-center justify-between">
                            <Text className={`text-lg font-semibold ${isOutOfStock ? "text-gray-500" : "text-gray-900"
                              }`}>
                              {medicine.item.medicineName || "Unknown Medicine"}
                            </Text>
                            {isOutOfStock && (
                              <View className="flex-row items-center bg-red-100 px-2 py-1 rounded-full">
                                <Ban size={14} color="#EF4444" />
                                <Text className="text-red-700 text-xs font-medium ml-1">Out of Stock</Text>
                              </View>
                            )}
                          </View>
                          <View className="flex-row items-center justify-between mt-1">
                            <Text className={`text-sm font-medium ${isOutOfStock ? "text-gray-400" : "text-gray-700"
                              }`}>
                              {medicine.category || "Unknown Category"}
                            </Text>
                            {!isOutOfStock && (
                              <Text className="text-green-600 text-sm font-medium">
                                {/* In Stock: {medicine.availableStock} */}
                              </Text>
                            )}
                          </View>
                          <Text className={`text-sm mt-1 ${isOutOfStock ? "text-gray-400" : "text-gray-600"
                            }`}>
                            Type: {medicine.item.form || "Not specified"}
                          </Text>
                          {medicine.item.dosage && medicine.item.dsgUnit && (
                            <Text className={`text-sm mt-1 ${isOutOfStock ? "text-gray-400" : "text-gray-600"
                              }`}>
                              Dosage: {medicine.item.dosage} {medicine.item.dsgUnit}
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
  )
}