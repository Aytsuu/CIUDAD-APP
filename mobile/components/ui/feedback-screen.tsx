import { useState, useEffect, useRef } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, TouchableOpacity, Animated } from "react-native"
import { CheckCircle, XCircle, RefreshCw, Loader } from "lucide-react-native"
import DoneIcon from '@/assets/images/empty-state/Done.svg'
import { Button } from "./button"

type FeedbackStatus = "success" | "failure" | "loading"

export const FeedbackScreen = ({
  status = "success",
  title,
  message = status === "success" ? "Operation completed successfully!" : "Operation failed. Please try again.",
  onRetry,
  onOk,
}: {
  status: FeedbackStatus;
  title?: React.ReactNode;
  message?: React.ReactNode;
  onRetry: () => void;
  onOk: () => void;
}) => {
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(status)
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Pop animation for entry
  const scaleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setFeedbackStatus(status)
  }, [status])

  useEffect(() => {
    // Pop animation on entry
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start()
  }, [])

  const getStatusConfig = () => {
    switch (feedbackStatus) {
      case "success":
        return {
          icon: <DoneIcon width={250} height={250} />,
          title: (
            <View>
              <Text className={`text-[20px] text-gray-800 font-bold text-center mb-3`}>
                Setup Completed
              </Text>
              <Text className={`text-[20px] text-gray-800 text-center mb-3`}>
                Congratulations!
              </Text>
              <Text className={`text-[20px] text-gray-800 text-center mb-3`}>
                You are all set up!
              </Text>
            </View>
          )
        }
      case "failure":
        return {
          icon: <XCircle size={80} color="#EF4444" />,
        }
      case "loading":
        return {
          icon: <Loader size={80} color="#3B82F6" />,
        }
      default:
        return {
          icon: <XCircle size={80} color="#6B7280" />,
        }
    }
  }

  const statusConfig = getStatusConfig()

  const handleRetry = async () => {
    setIsRetrying(true)
    setFeedbackStatus("loading")
    
    setTimeout(() => {
      onRetry()
      setIsRetrying(false)
    }, 1000)
  }

  return (
    <SafeAreaView className="flex-1 px-5 py-10">
      <Animated.View 
        style={{ transform: [{ scale: scaleAnim }] }}
        className="flex-1"
      >
        <View className="flex-1 items-center">
          {/* Icon Container */}
          <View className={`w-24 h-24 rounded-full items-center justify-center mt-24 mb-16`}>
            {statusConfig.icon}
          </View>

          {/* Title */}
          {title}

          {/* Message */}
          {message}
        </View>

        {/* Action Buttons */}
        <View className="w-full max-w-sm">
          {feedbackStatus === "success" ? (
            <Button
              className={`bg-primaryBlue py-4 px-8 rounded-xl items-center`}
              onPress={onOk}
            >
              <Text className="text-white text-base font-semibold">
                Continue
              </Text>
            </Button>
          ) : feedbackStatus === "failure" ? (
            <View className="flex-row gap-3">
              <Button
                variant={"outline"}
                className="bg-white flex-1"
                onPress={onOk}
              >
                <Text className="text-gray-700 text-base font-semibold">
                  Cancel
                </Text>
              </Button>
 
              <Button
                className={`flex-1 bg-primaryBlue`}
                onPress={handleRetry}
                disabled={isRetrying}
              >
             
                <Text className="text-white text-base font-semibold">
                  
                </Text>
              </Button>
              
            </View>
          ) : (
            <View className="py-4 px-8 rounded-xl items-center bg-blue-50 border border-blue-200">
              <View className="flex-row items-center">
                <Loader size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text className="text-blue-700 text-base font-medium">

                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}