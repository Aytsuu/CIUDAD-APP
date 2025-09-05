// confirmation.tsx
import { View, ScrollView, TouchableWithoutFeedback, Animated } from "react-native"
import { Check, ArrowLeft, Clock, Package } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { router, useLocalSearchParams } from "expo-router"
import * as React from "react"

export default function Confirmation() {
  const params = useLocalSearchParams()
  const orderItemsString = params.orderItems as string
  const medreqId = params.medreqId as string
  const status = params.status as string || "submitted"
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current

  // Parse the order items from the URL params
  const orderItems = React.useMemo(() => {
    try {
      // DecodeURIComponent is essential for correctly parsing URL-encoded JSON
      return orderItemsString ? JSON.parse(decodeURIComponent(orderItemsString)) : []
    } catch (error) {
      console.error("Error parsing order items:", error)
      return []
    }
  }, [orderItemsString])

  // Calculate total items
  const totalItems = React.useMemo(() => {
    return orderItems.reduce((sum: number, item: any) => sum + 1, 0)
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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 mt-4">
        <TouchableWithoutFeedback onPress={() => router.back()}>
          <View className="flex-row items-center">
            <ArrowLeft size={20} color="#263D67" strokeWidth={2} />
            <Text className="text-[#263D67] text-[16px] font-medium ml-2">Back</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>

      
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <Animated.View
          className="items-center justify-center pt-4 pb-8"
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View className="bg-green-500 mb-20 w-36 h-36 rounded-full flex items-center justify-center shadow-lg">
            <Check size={70} color="white" strokeWidth={3}/>
          </View>
          <Text className="text-3xl font-bold text-[#263D67] text-center mb-3">
            Request {status === "submitted" ? "Submitted!" : status}
          </Text>

          <Text className="text-lg font-medium text-[#6B7280] text-center mb-2 px-4">
            {status === "submitted" 
              ? "Your request has been submitted for review. You'll be notified once it's processed." 
              : `Request ID: ${medreqId}`}
          </Text>
          
          {medreqId && (
            <View className="bg-blue-50 p-3 rounded-lg mt-4">
              <Text className="text-blue-800 text-center font-medium">
                Request ID: {medreqId}
              </Text>
            </View>
          )}
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
                    <Text className="text-xl font-semibold text-[#263D67]">
                      Request Summary
                    </Text>
                    <Text className="text-sm font-medium text-[#6B7280]">
                      {orderItems.length} medicine{orderItems.length > 1 ? 's' : ''} 
                    </Text>
                  </View>
                </View>
              </View>

              {/* Table Header */}
              <View className="flex-row justify-between px-6 py-3 bg-gray-50">
                <Text className="text-[#263D67] font-semibold text-sm w-1/2">
                  MEDICINE
                </Text>
              </View>

              {/* Order Items */}
              <ScrollView className="max-h-64">
                {orderItems.map((item: any, index: number) => (
                  <View
                    key={item.id}
                    className={`flex-row justify-between items-center px-6 py-4 ${
                      index !== orderItems.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <View className="w-1/2 pr-2">
                      <Text className="text-[#263D67] font-medium text-[15px]">
                        {item.name}
                      </Text>
                      {item.reason && (
                        <Text className="text-gray-600 text-xs italic mt-1" numberOfLines={1}>
                          Reason: {item.reason}
                        </Text>
                      )}
                      {item.hasPrescription && (
                        <Text className="text-green-700 text-xs mt-1" numberOfLines={1}>
                          Prescription Attached
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        <Button
          className="bg-[#263D67] w-full mb-4 py-4 rounded-xl shadow-sm"
          onPress={() => router.push("/home")}
        >
          <Text className="text-white font-semibold text-[16px]">
            Back to Home
          </Text>
        </Button>
      </ScrollView>
    </View>
  )
}