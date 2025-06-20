"use client"

import { View, ScrollView, TouchableWithoutFeedback } from "react-native"
import { Check } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { router, useLocalSearchParams } from "expo-router"
import * as React from "react"

export default function Confirmation() {
  const params = useLocalSearchParams()
  const orderItemsString = params.orderItems as string

  // Parse the order items from the URL params
  const orderItems = React.useMemo(() => {
    try {
      return orderItemsString ? JSON.parse(decodeURIComponent(orderItemsString)) : []
    } catch (error) {
      console.error("Error parsing order items:", error)
      return []
    }
  }, [orderItemsString])

  return (
    
    <View className="flex-1 bg-[#ECF8FF] p-4">
      <TouchableWithoutFeedback onPress={() => router.back()}>
                <Text className="text-black text-[15px]">Back</Text>
              </TouchableWithoutFeedback>
      <View className="items-center justify-center pt-8 pb-4">
        <View className="bg-green-500 w-40 h-40 rounded-full flex items-center justify-center mb-8">
          <Check size={80} color="white" strokeWidth={3} />
        </View>

        <Text className="text-2xl font-PoppinsSemiBold text-[#263D67] text-center mb-2">All done!</Text>

        <Text className="text-lg font-PoppinsRegular text-[#263D67] text-center mb-8">
          Please wait for confirmation in notification
        </Text>
      </View>

      {orderItems && orderItems.length > 0 && (
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-xl font-PoppinsSemiBold text-[#263D67] mb-7">Request Summary</Text>

          {/* Table Header */}
          <View className="flex-row justify-between mb-2 px-2">
            <Text className="text-[#263D67] font-PoppinsSemiBold w-1/2">Medicine</Text>
            <Text className="text-[#263D67] font-PoppinsSemiBold w-1/4 text-center">Qty</Text>
            <Text className="text-[#263D67] font-PoppinsSemiBold w-1/4 text-center">Unit</Text>
          </View>

          {/* Order Items */}
          <ScrollView className="max-h-48">
            {orderItems.map((item:any) => (
              <View key={item.id} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-[#263D67] font-PoppinsMedium w-1/2">{item.name}</Text>
                <Text className="text-[#263D67] font-PoppinsRegular w-1/4 text-center">{item.quantity || 1}</Text>
                <Text className="text-[#263D67] font-PoppinsRegular w-1/4 text-center">pc/s</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Button className="bg-[#263D67] w-64 self-center" onPress={() => router.push("/(health)")}>
        <Text className="text-white font-PoppinsMedium">Home</Text>
      </Button>
    </View>
  )
}

