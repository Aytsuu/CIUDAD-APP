"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { router } from "expo-router"
import { ArrowLeft, Search, ShoppingBag, ChevronDown, Pill } from "lucide-react-native"
import { globalCartState } from "./cart-state"

// Define the Medicine type
export type Medicine = {
  id: number
  name: string
  category: string
  description?: string
}

export default function MedicineRequestScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCategories, setShowCategories] = useState(false)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])
  const [cartItems, setCartItems] = useState<Medicine[]>([])

  // Mock data for medicines
  const mockMedicines: Medicine[] = [
    { id: 1, name: "Biogesic", category: "Paracetamol", description: "Relieves mild pain and fever." },
    { id: 2, name: "Panadol", category: "Paracetamol", description: "Pain reliever and fever reducer." },
    { id: 3, name: "Calpol", category: "Paracetamol", description: "Pain relief for children and infants." },
    { id: 4, name: "Neozep", category: "Paracetamol", description: "Treats cold and flu symptoms." },
    { id: 5, name: "Amoxicillin", category: "Antibiotics", description: "Treats bacterial infections." },
    { id: 6, name: "Cefalexin", category: "Antibiotics", description: "Used to treat bacterial infections." },
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
      filtered = filtered.filter((medicine) => medicine.name.toLowerCase().includes(searchQuery.toLowerCase()))
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

  return (
    <SafeAreaView className="flex-1 bg-[#ECF8FF]">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/medicine-request/cart")} className="relative">
            <ShoppingBag size={24} color="#263D67" />
            {cartItems.length > 0 && (
              <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                <Text className="text-white text-xs font-bold">{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-[#263D67]">Request Medicine</Text>
          <Text className="text-sm text-gray-600">Get the medicines you need with ease.</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 mb-4 shadow-sm">
          <Search size={20} color="#263D67" />
          <TextInput
            placeholder="Search medicine"
            className="flex-1 ml-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Dropdown */}
        <View className="mb-4 relative">
          <TouchableOpacity
            className="flex-row justify-between items-center bg-white rounded-lg px-3 py-3 shadow-sm"
            onPress={() => setShowCategories(!showCategories)}
          >
            <Text className="text-[#263D67]">{selectedCategory}</Text>
            <ChevronDown size={20} color="#263D67" />
          </TouchableOpacity>

          {showCategories && (
            <View className="absolute top-14 left-0 right-0 bg-white rounded-lg shadow-md z-10">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className="px-3 py-3 border-b border-gray-100"
                  onPress={() => {
                    setSelectedCategory(category)
                    setShowCategories(false)
                  }}
                >
                  <Text className={selectedCategory === category ? "text-blue-500 font-bold" : "text-[#263D67]"}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Medicine List */}
        <ScrollView className="flex-1">
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((medicine) => (
              <TouchableOpacity
                key={medicine.id}
                className="flex-row justify-between items-center bg-white p-4 mb-3 rounded-lg shadow-sm"
                onPress={() =>
                  router.push({
                    pathname: "/medicine-request/details",
                    params: { id: medicine.id.toString() },
                  })
                }
              >
                <View className="flex-row items-center">
                  <Pill size={20} color="#263D67" className="mr-2" />
                  <View>
                    <Text className="text-lg font-semibold text-[#263D67]">{medicine.name}</Text>
                    <Text className="text-sm text-gray-500">{medicine.category}</Text>
                  </View>
                </View>
                <ChevronDown size={20} color="#263D67" style={{ transform: [{ rotate: "-90deg" }] }} />
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-lg text-[#263D67]">No medicines found.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

