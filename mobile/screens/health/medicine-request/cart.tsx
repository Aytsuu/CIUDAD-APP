// cart.tsx
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from "react-native"
import { router } from "expo-router"
import { ArrowLeft, Trash2, ShoppingBag, Pill } from "lucide-react-native"
import { useGlobalCartState, removeFromCart, clearCart } from "./cart-state"

export default function CartScreen() {
  // Use the global cart state hook to get cart items
  const { cartItems } = useGlobalCartState();

  const handleConfirm = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add medicines to your bag before confirming.");
      return;
    }

    // Prepare items for confirmation screen (remove unnecessary fields if needed)
    const orderItems = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      unit: "pc/s", // Or map from your medicine's unit if available
      reason: item.reason,
      // You might want to pass a summary of uploaded files if confirmation needs them
      hasPrescription: item.uploadedFiles && item.uploadedFiles.length > 0
    }));

    // Here you would typically send the order to your backend API
    console.log("Confirming order:", JSON.stringify(orderItems, null, 2));

    Alert.alert("Order Confirmed", "Your medicine request has been submitted successfully!", [
      {
        text: "OK",
        onPress: () => {
          clearCart(); // Clear cart after successful submission
          router.push({
            pathname: "/medicine-request/confirmation", // Ensure this path matches your confirmation.tsx route
            params: { orderItems: JSON.stringify(orderItems) }, // Pass confirmed items
          });
        },
      },
    ]);
  };

  // const handleUpdateQuantity = (id: number, currentQuantity: number, action: 'increase' | 'decrease', availableStock: number) => {
  //   let newQuantity = currentQuantity;
  //   if (action === 'increase') {
  //     newQuantity = currentQuantity + 1;
  //     if (newQuantity > availableStock) {
  //       Alert.alert("Stock Limit", `Cannot request more than available stock (${availableStock}).`);
  //       return;
  //     }
  //   } else { // 'decrease'
  //     newQuantity = currentQuantity - 1;
  //     if (newQuantity < 1) {
  //       Alert.alert("Quantity Error", "Quantity cannot be less than 1. Remove item if not needed.");
  //       return;
  //     }
  //   }
  //   updateQuantity(id, newQuantity);
  // };


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-10 border-b  border-gray-200 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold text-gray-800">Your Request Bag</Text>
        </View>

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <>
            {/* Items List */}
            <ScrollView className="flex-1 bg-white">
              {cartItems.map((item, index) => (
                <View key={item.id} className="bg-white rounded-lg p-6 mb-3 shadow-sm border border-gray-300">
                  <View className="flex-row items-center mb-3">
                    <Pill size={20} color="#3B82F6" />
                    <View className="flex-1 ml-3">
                      <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
                      <Text className="text-sm text-gray-600">{item.category} ({item.medicine_type})</Text>
                      {item.dosage && <Text className="text-xs text-gray-500">Dosage: {item.dosage}</Text>}
                    </View>
                  </View>

                  {/* Quantity controls */}
                  <View className="flex-row items-center justify-between border-t border-gray-100 pt-3 mt-3">
                    {/* <View className="flex-row items-center bg-gray-50 rounded-lg px-2 py-1">
                      <TouchableOpacity
                        onPress={() => handleUpdateQuantity(item.id, item.requestedQuantity, 'decrease', item.minv_qty_avail)}
                        className="p-1 rounded-full"
                      >
                        <Minus size={18} color="#263D67" />
                      </TouchableOpacity>

                      <Text className="mx-3 text-lg font-bold text-gray-800">{item.requestedQuantity}</Text>

                      <TouchableOpacity
                        onPress={() => handleUpdateQuantity(item.id, item.requestedQuantity, 'increase', item.minv_qty_avail)}
                        className="p-1 rounded-full"
                      >
                        <Plus size={18} color="#263D67" />
                      </TouchableOpacity>
                    </View> */}
                    
                    {/* Unit and stock info
                    <View className="flex-row items-center">
                        <Text className="text-base text-gray-700 mr-2">pc/s</Text>
                        <Text className="text-sm text-gray-500">
                            (Max: {item.minv_qty_avail})
                        </Text>
                    </View> */}
                  </View>

                  {item.reason && (
                    <View className="mt-2 p-2 bg-blue-50 rounded-md">
                        <Text className="text-gray-700 italic text-sm">Reason: {item.reason}</Text>
                    </View>
                  )}

                  {item.uploadedFiles && item.uploadedFiles.length > 0 && (
                    <View className="mt-2 p-2 bg-green-50 rounded-md">
                        <Text className="text-green-800 text-sm">Prescription Uploaded ({item.uploadedFiles.length} files)</Text>
                    </View>
                  )}


                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    className="self-end mt-4 flex-row items-center px-3 py-1 bg-red-50 rounded-full"
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text className="text-red-500 ml-1 font-medium">Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View className="mt-4">
              <TouchableOpacity className="bg-blue-600 py-3 rounded-lg items-center mb-3 shadow" onPress={handleConfirm}>
                <Text className="text-white font-bold text-base">Confirm Request</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border border-blue-600 py-3 rounded-lg items-center"
                onPress={() => router.back()}
              >
                <Text className="text-blue-600 font-medium text-base">Continue Browsing</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View className="flex-1 justify-center items-center">
            <ShoppingBag size={64} color="#9CA3AF" className="mb-4 opacity-50" />
            <Text className="text-gray-600 font-semibold text-lg mb-4">Your bag is empty</Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg shadow"
              onPress={() => router.back()}
            >
              <Text className="text-white font-medium text-base">Browse Medicines</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}