"use client"

import * as React from "react"
import { View, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from "react-native"
import { ChevronLeft, Minus, Plus } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { globalCartState, removeFromCart, updateQuantity, clearCart } from "./request-page"
import { router } from "expo-router"

export default function Cart() {
  const [cartItems, setCartItems] = React.useState([...globalCartState.items])

  // Update local cart state when global cart changes
  React.useEffect(() => {
    const updateCartState = () => {
      setCartItems([...globalCartState.items])
    }

    const interval = setInterval(updateCartState, 500)
    updateCartState() // Initial update

    return () => clearInterval(interval)
  }, [])

  const handleConfirm = () => {
    // Save cart items to be passed to confirmation page
    const itemsToConfirm = [...globalCartState.items]

    // Encode the cart items to pass via URL
    const encodedItems = encodeURIComponent(JSON.stringify(itemsToConfirm))

    // Process the order
    clearCart()
    setCartItems([]) // Update local state immediately

    // Navigate to confirmation page with order items as params
    router.push({
      pathname: "/medicine-request/confirmation",
      params: { orderItems: encodedItems },
    })
  }

  return (
    <View className="flex-1 h-full bg-[#ECF8FF] p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableWithoutFeedback onPress={() => router.back()}>
          <Text className="text-black text-[15px]">Back</Text>
        </TouchableWithoutFeedback>
      </View>

      {/* Title */}
      <Text className="text-3xl font-PoppinsSemiBold text-[#263D67] mb-2">Your bag</Text>
      <Text className="text-sm font-PoppinsRegular mb-6">Get The Medicines You Need With Ease</Text>

      {/* Table Header */}
      {cartItems.length > 0 && (
        <View className="flex-row justify-between mb-2 px-2">
          <Text className="text-[#263D67] font-PoppinsSemiBold w-1/3">Medicine</Text>
          <Text className="text-[#263D67] font-PoppinsSemiBold w-1/3 text-center">Quantity</Text>
          <Text className="text-[#263D67] font-PoppinsSemiBold w-1/3 text-center">Unit</Text>
        </View>
      )}

      {/* Cart Items */}
      <ScrollView className="flex-1">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <View key={item.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between items-center">
                <Text className="text-[#263D67] font-PoppinsMedium w-1/3">{item.name}</Text>

                <View className="flex-row items-center justify-center w-1/3">
                  <TouchableOpacity
                    onPress={() => {
                      updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))
                      setCartItems([...globalCartState.items]) // Update local state immediately
                    }}
                    className="bg-[#E2EEFF] w-8 h-8 rounded-md flex items-center justify-center"
                  >
                    <Minus size={16} color="#263D67" />
                  </TouchableOpacity>

                  <Text className="mx-2 text-[#263D67] font-PoppinsMedium">{item.quantity || 1}</Text>

                  <TouchableOpacity
                    onPress={() => {
                      updateQuantity(item.id, (item.quantity || 1) + 1)
                      setCartItems([...globalCartState.items]) // Update local state immediately
                    }}
                    className="bg-[#E2EEFF] w-8 h-8 rounded-md flex items-center justify-center"
                  >
                    <Plus size={16} color="#263D67" />
                  </TouchableOpacity>
                </View>

                <View className="w-1/3 flex-row justify-center items-center">
                  <Text className="text-[#263D67] font-PoppinsRegular">pc/s</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  removeFromCart(item.id)
                  setCartItems([...globalCartState.items]) // Update local state immediately
                }}
                className="self-end mt-2"
              >
                <Text className="text-red-500 font-PoppinsRegular">Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-[#263D67] font-PoppinsMedium text-lg mb-4">Your bag is empty</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {cartItems.length > 0 && (
        <View className="mt-4">
          <Button className="bg-[#263D67] mb-2" onPress={handleConfirm}>
            <Text className="text-white font-PoppinsSemiBold">Confirm</Text>
          </Button>

          <Button className="border border-[#263D67]" onPress={() => router.back()}>
            <Text className=" font-PoppinsMedium">Cancel</Text>
          </Button>
        </View>
      )}
    </View>
  )
}

