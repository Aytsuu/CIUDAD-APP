import { useState, useEffect, useRef } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, TouchableOpacity, Animated, Dimensions } from "react-native"
import { CheckCircle, XCircle, RefreshCw, AlertCircle, Loader } from "lucide-react-native"
import { Loader2 } from "@/lib/icons/Loader2"

type FeedbackStatus = "success" | "failure" | "loading"

export const FeedbackScreen = ({
  status = "success",
  title,
  message = status === "success" ? "Operation completed successfully!" : "Operation failed. Please try again.",
  onRetry,
  onOk,
} : {
  status: FeedbackStatus;
  title?: string;
  message?: string;
  onRetry: () => void,
  onOk: () => void
}) => {
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(status)
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const spinAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const backgroundColorAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setFeedbackStatus(status)
  }, [status])

  useEffect(() => {
    // Reset animations when status changes
    scaleAnim.setValue(0)
    opacityAnim.setValue(0)
    slideAnim.setValue(50)
    
    // Start entry animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundColorAnim, {
        toValue: feedbackStatus === "success" ? 1 : feedbackStatus === "failure" ? 2 : 0,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start()

    // Add pulse animation for loading state
    if (feedbackStatus === "loading") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }

    // Add spin animation for retry button
    if (feedbackStatus === "failure" && !isRetrying) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ).start()
    }
  }, [feedbackStatus])

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['rgba(249, 250, 251, 1)', 'rgba(240, 253, 244, 1)', 'rgba(254, 242, 242, 1)'],
  })

  const getStatusConfig = () => {
    switch (feedbackStatus) {
      case "success":
        return {
          icon: <CheckCircle size={100} color="#10B981" />,
          iconBg: "bg-green-100",
          title: title || "Success!",
          titleColor: "text-green-800",
          buttonBg: "bg-green-600",
          buttonActiveBg: "bg-green-700",
          buttonText: "Continue",
          showConfetti: true,
        }
      case "failure":
        return {
          icon: <XCircle size={100} color="#EF4444" />,
          iconBg: "bg-red-100",
          title: title || "Something went wrong",
          titleColor: "text-red-800",
          buttonBg: "bg-red-600",
          buttonActiveBg: "bg-red-700",
          buttonText: "Try Again",
          showConfetti: false,
        }
      case "loading":
        return {
          icon: <Loader size={100} color="#3B82F6" />,
          iconBg: "bg-blue-100",
          title: title || "Processing...",
          titleColor: "text-blue-800",
          buttonBg: "bg-blue-600",
          buttonActiveBg: "bg-blue-700",
          buttonText: "Please wait",
          showConfetti: false,
        }
      default:
        return {
          icon: <AlertCircle size={100} color="#6B7280" />,
          iconBg: "bg-gray-100",
          title: title || "Unknown Status",
          titleColor: "text-gray-800",
          buttonBg: "bg-gray-600",
          buttonActiveBg: "bg-gray-700",
          buttonText: "OK",
          showConfetti: false,
        }
    }
  }

  const statusConfig = getStatusConfig()

  const handleRetry = async () => {
    setIsRetrying(true)
    setFeedbackStatus("loading")
    
    // Add a small delay to show loading state
    setTimeout(() => {
      onRetry()
      setIsRetrying(false)
    }, 1500)
  }

  const handleOk = () => {
    // Add exit animation before calling onOk
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onOk()
    })
  }

  return (
    <Animated.View style={{ backgroundColor }} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center px-8">
          {/* Main Content Container */}
          <Animated.View
            style={{
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
              opacity: opacityAnim,
            }}
            className="items-center w-full max-w-sm"
          >
            {/* Icon Container */}
            <Animated.View
              style={{
                transform: [{ scale: feedbackStatus === "loading" ? pulseAnim : 1 }]
              }}
              className={`w-32 h-32 rounded-full ${statusConfig.iconBg} items-center justify-center mb-8 shadow-lg`}
            >
              {feedbackStatus === "loading" ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  {statusConfig.icon}
                </Animated.View>
              ) : (
                statusConfig.icon
              )}
            </Animated.View>

            {/* Title */}
            <Text className={`text-3xl font-bold ${statusConfig.titleColor} text-center mb-4`}>
              {statusConfig.title}
            </Text>

            {/* Message */}
            <Text className="text-lg text-gray-600 text-center mb-12 leading-7 px-4">
              {message}
            </Text>

            {/* Action Buttons */}
            <View className="w-full space-y-4">
              {feedbackStatus === "success" ? (
                <TouchableOpacity
                  className={`${statusConfig.buttonBg} py-4 px-8 rounded-2xl items-center shadow-md active:${statusConfig.buttonActiveBg}`}
                  onPress={handleOk}
                >
                  <Text className="text-white text-lg font-semibold">
                    {statusConfig.buttonText}
                  </Text>
                </TouchableOpacity>
              ) : feedbackStatus === "failure" ? (
                <View className="space-y-3">
                  <TouchableOpacity
                    className={`${statusConfig.buttonBg} py-4 px-8 rounded-2xl flex-row justify-center items-center shadow-md active:${statusConfig.buttonActiveBg}`}
                    onPress={handleRetry}
                    disabled={isRetrying}
                  >
                    <Animated.View style={{ transform: [{ rotate: spin }], marginRight: 12 }}>
                      <RefreshCw size={24} color="#FFFFFF" />
                    </Animated.View>
                    <Text className="text-white text-lg font-semibold">
                      {statusConfig.buttonText}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="border-2 border-gray-300 py-4 px-8 rounded-2xl items-center active:bg-gray-50"
                    onPress={handleOk}
                  >
                    <Text className="text-gray-700 text-lg font-semibold">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="py-4 px-8 rounded-2xl items-center bg-blue-50">
                  <View className="flex-row items-center">
                    <Animated.View style={{ transform: [{ rotate: spin }], marginRight: 12 }}>
                      <Loader2 size={24} color="#3B82F6" className="animate-spin"/>
                    </Animated.View>
                    <Text className="text-blue-700 text-lg font-medium">
                      {statusConfig.buttonText}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Success Decorative Elements */}
          {feedbackStatus === "success" && (
            <Animated.View
              style={{ opacity: opacityAnim }}
              className="absolute top-20 left-10"
            >
              <View className="w-3 h-3 bg-green-400 rounded-full opacity-60" />
            </Animated.View>
          )}
          
          {feedbackStatus === "success" && (
            <Animated.View
              style={{ opacity: opacityAnim }}
              className="absolute top-32 right-16"
            >
              <View className="w-2 h-2 bg-green-300 rounded-full opacity-40" />
            </Animated.View>
          )}
          
          {feedbackStatus === "success" && (
            <Animated.View
              style={{ opacity: opacityAnim }}
              className="absolute bottom-32 left-20"
            >
              <View className="w-4 h-4 bg-green-500 rounded-full opacity-30" />
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  )
}