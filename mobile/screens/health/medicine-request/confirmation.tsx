"use client"

import { View, ScrollView, TouchableWithoutFeedback, Animated } from "react-native"
import { Check, ArrowLeft, Clock, Package } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { router, useLocalSearchParams } from "expo-router"
import * as React from "react"

export default function Confirmation() {
  const params = useLocalSearchParams()
  const orderItemsString = params.orderItems as string

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current

  // Parse the order items from the URL params
  const orderItems = React.useMemo(() => {
    try {
      return orderItemsString ? JSON.parse(decodeURIComponent(orderItemsString)) : []
    } catch (error) {
      console.error("Error parsing order items:", error)
      return []
    }
  }, [orderItemsString])

  // Calculate total items
  const totalItems = React.useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }, [orderItems])

  React.useEffect(() => {
    // Animate components on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <View className="flex-1 bg-gradient-to-b from-[#ECF8FF] to-[#F8FCFF]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <TouchableWithoutFeedback onPress={() => router.back()}>
          <View className="flex-row items-center">
            <ArrowLeft size={20} color="#263D67" strokeWidth={2} />
            <Text className="text-[#263D67] text-[16px] font-PoppinsMedium ml-2">Back</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <Animated.View 
          className="items-center justify-center pt-4 pb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }}
        >
           <View className="bg-green-500 mb-20 w-36 h-36 rounded-full flex items-center justify-center shadow-lg">
              <Check size={70} color="white" strokeWidth={3}/>
            </View>
          <Text className="text-3xl font-PoppinsBold text-[#263D67] text-center mb-3">
            Request Submitted!
          </Text>

          <Text className="text-lg font-PoppinsRegular text-[#6B7280] text-center mb-2 px-4">
            Please wait for the confirmation in your notification.  
          </Text>


        </Animated.View>

        {/* Request Summary */}
        {orderItems && orderItems.length > 0 && (
          <Animated.View 
            className="mb-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Summary Header */}
              <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Package size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text className="text-xl font-PoppinsSemiBold text-[#263D67]">
                      Request Summary
                    </Text>
                    <Text className="text-sm font-PoppinsRegular text-[#6B7280]">
                      {orderItems.length} medicine{orderItems.length > 1 ? 's' : ''} • {totalItems} total items
                    </Text>
                  </View>
                </View>
              </View>

              {/* Table Header */}
              <View className="flex-row justify-between px-6 py-3 bg-gray-50">
                <Text className="text-[#263D67] font-PoppinsSemiBold text-sm w-1/2">
                  MEDICINE
                </Text>
                <Text className="text-[#263D67] font-PoppinsSemiBold text-sm w-1/4 text-center">
                  QTY
                </Text>
                <Text className="text-[#263D67] font-PoppinsSemiBold text-sm w-1/4 text-center">
                  UNIT
                </Text>
              </View>

              {/* Order Items */}
              <ScrollView className="max-h-64">
                {orderItems.map((item, index) => (
                  <View 
                    key={item.id} 
                    className={`flex-row justify-between items-center px-6 py-4 ${
                      index !== orderItems.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <View className="w-1/2 pr-2">
                      <Text className="text-[#263D67] font-PoppinsMedium text-[15px]">
                        {item.name}
                      </Text>
                    </View>
                    <View className="w-1/4 items-center">
                      <View className="bg-blue-50 px-3 py-1 rounded-full">
                        <Text className="text-[#263D67] font-PoppinsSemiBold text-sm">
                          {item.quantity || 1}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[#6B7280] font-PoppinsRegular text-sm w-1/4 text-center">
                      pc/s
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}

     
          <Button 
            className="bg-[#263D67] w-full mb-4 py-4 rounded-xl shadow-sm"
            onPress={() => router.push("/(health)")}
          >
            <Text className="text-white font-PoppinsSemiBold text-[16px]">
              Back to Home
            </Text>
          </Button>
</ScrollView>
</View>
  )}
