"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from "react-native"
import { router } from "expo-router"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react-native"
import { globalCartState, clearCart, updateQuantity, removeFromCart } from "./cart-state"

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([...globalCartState.items])

  // Update local cart state when global cart changes
  useEffect(() => {
    const updateCartState = () => {
      setCartItems([...globalCartState.items])
    }

    const interval = setInterval(updateCartState, 500)
    updateCartState() // Initial update

    return () => clearInterval(interval)
  }, [])

  const handleConfirm = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add medicines to your bag before confirming")
      return
    }

    // Here you would typically send the order to your backend
    Alert.alert("Order Confirmed", "Your medicine request has been submitted successfully!", [
      {
        text: "OK",
        onPress: () => {
          clearCart()
          router.push("/medicine-request/confirmation")
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-medium">Back</Text>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-[#263D67]">Your bag</Text>
          <Text className="text-sm text-gray-600">Get the medicines you need with ease.</Text>
        </View>

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <>
            {/* Table Header */}
            <View className="flex-row justify-between mb-2 px-2">
              <Text className="text-[#263D67] font-semibold w-1/3">Medicine</Text>
              <Text className="text-[#263D67] font-semibold w-1/3 text-center">Quantity</Text>
              <Text className="text-[#263D67] font-semibold w-1/3 text-right">Unit</Text>
            </View>

            {/* Items List */}
            <ScrollView className="flex-1">
              {cartItems.map((item) => (
                <View key={item.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[#263D67] font-medium w-1/3">{item.name}</Text>
{/* 
                    <View className="flex-row items-center justify-center w-1/3">
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                        className="bg-[#E2EEFF] w-8 h-8 rounded-md items-center justify-center"
                      >
                        <Minus size={16} color="#263D67" />
                      </TouchableOpacity>

                      <Text className="mx-2 text-[#263D67] font-medium">{item.quantity || 1}</Text>

                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="bg-[#E2EEFF] w-8 h-8 rounded-md items-center justify-center"
                      >
                        <Plus size={16} color="#263D67" />
                      </TouchableOpacity>
                    </View> */}

                    <Text className="text-[#263D67] w-1/3 text-right">pc/s</Text>
                  </View>

                  {item.reason && <Text className="text-gray-600 mt-2 italic">Reason: {item.reason}</Text>}

                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    className="self-end mt-2 flex-row items-center"
                  >
                    <Trash2 size={16} color="#FF4D4F" />
                    <Text className="text-red-500 ml-1">Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View className="mt-4">
              <TouchableOpacity className="bg-[#263D67] py-3 rounded-lg items-center mb-3" onPress={handleConfirm}>
                <Text className="text-white font-bold">Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border border-[#263D67] py-3 rounded-lg items-center"
                onPress={() => router.back()}
              >
                <Text className="text-[#263D67] font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View className="flex-1 justify-center items-center">
            <ShoppingBag size={64} color="#263D67" className="mb-4 opacity-50" />
            <Text className="text-[#263D67] font-medium text-lg mb-4">Your bag is empty</Text>
            <TouchableOpacity
              className="bg-[#263D67] px-6 py-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-white font-medium">Browse Medicines</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

