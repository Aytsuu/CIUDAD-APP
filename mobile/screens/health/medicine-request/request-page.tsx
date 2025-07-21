import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { router } from "expo-router"
import { ArrowLeft, Search, ShoppingBag, ChevronDown, Pill, Filter, X } from "lucide-react-native"
import { globalCartState } from "./cart-state"

export type Medicine = {
  id: number
  name: string
  category: string
  description?: string
  inStock?: boolean
  dosage?: string
}

export default function MedicineRequestScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCategories, setShowCategories] = useState(false)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])
  const [cartItems, setCartItems] = useState<Medicine[]>([])

  // Enhanced mock data for medicines
  const mockMedicines: Medicine[] = [
    { id: 1, name: "Biogesic", category: "Paracetamol", description: "Relieves mild pain and fever.", inStock: true, dosage: "500mg" },
    { id: 2, name: "Panadol", category: "Paracetamol", description: "Pain reliever and fever reducer.", inStock: true, dosage: "500mg" },
    { id: 3, name: "Calpol", category: "Paracetamol", description: "Pain relief for children and infants.", inStock: false, dosage: "250mg" },
    { id: 4, name: "Neozep", category: "Paracetamol", description: "Treats cold and flu symptoms.", inStock: true, dosage: "500mg" },
    { id: 5, name: "Amoxicillin", category: "Antibiotics", description: "Treats bacterial infections.", inStock: true, dosage: "250mg" },
    { id: 6, name: "Cefalexin", category: "Antibiotics", description: "Used to treat bacterial infections.", inStock: true, dosage: "500mg" },
    { id: 7, name: "Vitamin C", category: "Vitamins", description: "Boosts immune system.", inStock: true, dosage: "500mg" },
    { id: 8, name: "Multivitamins", category: "Vitamins", description: "Daily nutritional supplement.", inStock: true, dosage: "1 tablet" },
  ]

  const categories = ["All", "Paracetamol", "Antibiotics", "Vitamins"]

  // Initialize medicines
  useEffect(() => {
    setMedicines(mockMedicines)
    setFilteredMedicines(mockMedicines)
  }, [])

  // Filter medicines based on search query and category
  useEffect(() => {
    let filtered = medicines

    if (searchQuery) {
      filtered = filtered.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((medicine) => medicine.category === selectedCategory)
    }

    setFilteredMedicines(filtered)
  }, [searchQuery, selectedCategory, medicines])

  // Update cart items from global state
  useEffect(() => {
    const updateCartState = () => setCartItems([...globalCartState.items])
    const interval = setInterval(updateCartState, 500)

    updateCartState()
    return () => clearInterval(interval)
  }, [])

  const clearSearch = () => {
    setSearchQuery("")
  }



  return (
    <SafeAreaView className="flex-1  bg-gray-100">
      <View className="flex-1">
        {/* Header with gradient background */}
        <View className="bg-blue-900 px-4 pt-4 pb-6 rounded-b-3xl ">
          <View className="flex-row justify-between items-center mt-5 mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/20 p-2 rounded-full"
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/medicine-request/cart")}
              className="relative bg-white/20 p-2 rounded-full"
            >
              <ShoppingBag size={24} color="#fff" />
              {cartItems.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  <Text className="text-white text-xs font-bold">{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View className="mb-4">
            <Text className="text-3xl font-bold text-white">Request Medicine</Text>
            <Text className="text-blue-100 text-base mt-1">Get the medicines you need with ease</Text>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-full px-4 py-3 ">
            <Search size={20} color="#6B7280" />
            <TextInput
              placeholder="Search medicines"
              className="flex-1 ml-3 text-gray-700"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="ml-2">
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="flex-1 px-4 pt-6">
          {/* Categories Filter */}
          <View className="mb-6 relative z-20">
            <TouchableOpacity
              className="flex-row justify-between items-center bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-100"
              onPress={() => setShowCategories(!showCategories)}
            >
              <View className="flex-row items-center">
                <Filter size={18} color="#4F46E5" />
                <Text className="text-gray-700 font-medium ml-2">
                  {selectedCategory === "All" ? "All Categories" : selectedCategory}
                </Text>
              </View>
              <ChevronDown
                size={20}
                color="#4F46E5"
                style={{ transform: [{ rotate: showCategories ? "180deg" : "0deg" }] }}
              />
            </TouchableOpacity>

            {showCategories && (
              <View className="absolute top-16 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 z-30">
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={category}
                    className={`px-4 py-4 ${index !== categories.length - 1 ? 'border-b border-gray-50' : ''}`}
                    onPress={() => {
                      setSelectedCategory(category)
                      setShowCategories(false)
                    }}
                  >
                    <Text className={`${selectedCategory === category ? "text-indigo-600 font-semibold" : "text-gray-700"}`}>
                      {category === "All" ? "All Categories" : category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Results Summary */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-600 font-medium">
              {filteredMedicines.length} medicine{filteredMedicines.length !== 1 ? 's' : ''} found
            </Text>

          </View>

          {/* Medicine List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {filteredMedicines.length > 0 ? (
              <View className="pb-6">
                {filteredMedicines.map((medicine, index) => (
                  <TouchableOpacity
                    key={medicine.id}
                    className="bg-white p-5 mb-4 rounded-2xl shadow-sm border border-gray-100"
                    onPress={() =>
                      router.push({
                        pathname: "/medicine-request/details",
                        params: { id: medicine.id.toString() },
                      })
                    }
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <View className="bg-indigo-100 p-2 rounded-full mr-3">
                            <Pill size={20} color="#4F46E5" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-800">{medicine.name}</Text>
                            <Text className="text-gray-500 text-sm">{medicine.dosage}</Text>
                          </View>
                        </View>

                        <View className="flex-row items-center justify-between mt-2">

                          <Text className="text-xs font-medium">{medicine.category}</Text>

                        </View>

                        {medicine.description && (
                          <Text className="text-gray-600 text-sm mt-2 leading-5">{medicine.description}</Text>
                        )}
                      </View>

                      <View className="ml-4">
                        <ChevronDown
                          size={20}
                          color="#9CA3AF"
                          style={{ transform: [{ rotate: "-90deg" }] }}
                        />
                      </View>
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
                  Try adjusting your search terms to find what medicine you're looking for.
                </Text>

              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}