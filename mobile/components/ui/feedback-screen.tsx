"use client"

import { useState, useEffect, useRef } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, TouchableOpacity, Animated } from "react-native"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react-native"

type FeedbackStatus = "success" | "failure" | "loading"

export const FeedbackScreen = ({
  status = "success",
  message = status === "success" ? "Operation completed successfully!" : "Operation failed. Please try again.",
  onRetry,
  onOk,
} : {
  status: FeedbackStatus;
  message?: string;
  onRetry: () => void,
  onOk: () => void
}) => {
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(status)

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const spinAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Reset animations when status changes
    scaleAnim.setValue(0)
    opacityAnim.setValue(0)

    // Start animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()

    // Add spin animation for failure state
    if (feedbackStatus === "failure") {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start()
    }
  }, [feedbackStatus])

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-5">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="mb-6"
        >
          {feedbackStatus === "success" ? (
            <CheckCircle size={80} color="#4CAF50" />
          ) : (
            <XCircle size={80} color="#F44336" />
          )}
        </Animated.View>

        <Animated.Text style={{ opacity: opacityAnim }} className="text-lg text-center mb-8 text-gray-800 leading-6">
          {message}
        </Animated.Text>

        <Animated.View style={{ opacity: opacityAnim }} className="w-full max-w-[250px]">
          {feedbackStatus === "success" ? (
            <TouchableOpacity className="bg-green-500 py-3 px-6 rounded-lg items-center" onPress={onOk}>
              <Text className="text-white text-base font-semibold">OK</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-red-500 py-3 px-6 rounded-lg flex-row justify-center items-center"
              onPress={() => {
                // Create a loading effect before retrying
                setFeedbackStatus("loading")
                setTimeout(() => {
                  onRetry()
                }, 1000)
              }}
            >
              <Animated.View style={{ transform: [{ rotate: spin }], marginRight: 8 }}>
                <RefreshCw size={20} color="#FFFFFF" />
              </Animated.View>
              <Text className="text-white text-base font-semibold">Retry</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}
