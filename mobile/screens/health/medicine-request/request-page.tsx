"use client"

import * as React from "react"
import { View, TouchableOpacity, TextInput, ScrollView, StatusBar } from "react-native"
import { ChevronLeft, BriefcaseMedical, Pill, Search, ShoppingBag } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import SelectLayout from "@/components/ui/select/select-layout"
import { router } from "expo-router"

// Define the Medicine type
export type Medicine = {
  id: number
  name: string
  category: string
  quantity?: number
}

// Create a global cart state that persists between component renders
export const globalCartState = {
  items: [] as Medicine[],
}

// Add to cart function
export const addToCart = (medicine: Medicine) => {
  const existingItem = globalCartState.items.find((item) => item.id === medicine.id)
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1
  } else {
    globalCartState.items.push({ ...medicine, quantity: 1 })
  }
}

// Remove from cart function
export const removeFromCart = (id: number) => {
  globalCartState.items = globalCartState.items.filter((item) => item.id !== id)
}

// Update quantity function
export const updateQuantity = (id: number, quantity: number) => {
  const item = globalCartState.items.find((item) => item.id === id)
  if (item) {
    item.quantity = quantity
  }
}

// Clear cart function
export const clearCart = () => {
  globalCartState.items = []
}

// Create a context for the cart
export const CartContext = React.createContext({
  cart: [] as Medicine[],
  addToCart: (medicine: Medicine) => {},
  removeFromCart: (id: number) => {},
  updateQuantity: (id: number, quantity: number) => {},
  clearCart: () => {},
})

// Cart Provider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = React.useState<Medicine[]>([])

  const addToCart = (medicine: Medicine) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === medicine.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === medicine.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item,
        )
      } else {
        return [...prevCart, { ...medicine, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export default function MedicineRequest() {
  const categories = [
    { label: "Paracetamol", value: "Paracetamol" },
    { label: "Antibiotics", value: "Antibiotics" },
    { label: "Vitamins", value: "Vitamins" },
  ]

  // State for selected service
  const [selectedService, setSelectedService] = React.useState(categories[0])
  const [medicines, setMedicines] = React.useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [cartItems, setCartItems] = React.useState<Medicine[]>([])

  // Update local cart state when global cart changes
  React.useEffect(() => {
    const updateCartState = () => {
      setCartItems([...globalCartState.items])
    }

    const interval = setInterval(updateCartState, 500)
    updateCartState() // Initial update

    return () => clearInterval(interval)
  }, [])

  const mockDatabase: { [key: string]: Medicine[] } = {
    Paracetamol: [
      { id: 1, name: "Biogesic", category: "Paracetamol" },
      { id: 2, name: "Calpol", category: "Paracetamol" },
      { id: 3, name: "Saridon", category: "Paracetamol" },
    ],
    Antibiotics: [
      { id: 4, name: "Amoxicillin", category: "Antibiotics" },
      { id: 5, name: "Azithromycin", category: "Antibiotics" },
      { id: 6, name: "Cefalexin", category: "Antibiotics" },
      { id: 7, name: "Doxycycline", category: "Antibiotics" },
      { id: 8, name: "Ciprofloxacin", category: "Antibiotics" },
    ],
    Vitamins: [
      { id: 9, name: "Enervon", category: "Vitamins" },
      { id: 10, name: "Centrum", category: "Vitamins" },
    ],
  }

  React.useEffect(() => {
    const fetchedMedicines = mockDatabase[selectedService.value] || []
    setMedicines(fetchedMedicines)
  }, [selectedService])

  // Filter medicines based on search query
  const filteredMedicines = React.useMemo(() => {
    if (!searchQuery) return medicines
    return medicines.filter((medicine) => medicine.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [medicines, searchQuery])

  return (
    <View className="flex-1 h-full bg-[#ECF8FF] p-4">
      {/* Header */}
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <View className="flex-row justify-between items-center mt-8 mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="flex-row items-center">
            <ChevronLeft size={24} color="#263D67" />
            <Text className="text-lg font-medium text-[#263D67] ml-1">Back</Text>
          </View>
        </TouchableOpacity>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push("/medicine-request/cart")} className="relative mr-2">
            <ShoppingBag size={24} color="#263D67" />
            {cartItems.length > 0 && (
              <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                <Text className="text-white text-xs font-bold">{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
        </View>
      </View>

      {/* Title */}
      <Text className="text-3xl font-PoppinsSemiBold text-[#263D67] mb-2">Request</Text>
      <Text className="text-3xl font-PoppinsSemiBold text-[#263D67] mb-4">Medicine</Text>
      <Text className="text-xs font-PoppinsRegular mb-6">Get the medicines you need with ease.</Text>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-lg px-3 py-2 mb-4 shadow-sm">
        <Search size={20} color="#263D67" />
        <TextInput
          placeholder="Search medicine"
          className="flex-1 ml-2 font-PoppinsRegular"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Services Dropdown */}
      <SelectLayout
        className="min-w-[100%] font-PoppinsRegular"
        contentClassName="w-full"
        options={categories}
        selected={selectedService}
        onValueChange={(value) => setSelectedService(value!)}
      />

      {/* Display medicines Dynamically */}
      <ScrollView className="mt-6">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((medicine) => (
            <Card key={medicine.id} className="p-4 mb-3 border-0 shadow-lg bg-[#ffffff] rounded-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Pill size={20} color="#263D67" className="mr-2" />
                  <View className="ml-3">
                    <Text className="text-lg font-PoppinsSemiBold text-[#263D67]">{medicine.name}</Text>
                    <Text className="text-sm font-PoppinsRegular text-[#263DC7]">{medicine.category}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    addToCart(medicine)
                    setCartItems([...globalCartState.items]) // Immediately update local state
                  }}
                  className="bg-[#263D67] px-3 py-1 rounded-lg"
                >
                  <Text className="text-white font-PoppinsSemiBold">ADD</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <Text className="text-lg font-PoppinsRegular text-[#263D67] mt-4">No medicines found.</Text>
        )}
      </ScrollView>
    </View>
  )
}

