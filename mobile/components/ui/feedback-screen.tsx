import { useState, useEffect, useRef } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, TouchableOpacity, Animated } from "react-native"
import { CheckCircle, XCircle, RefreshCw, Loader } from "lucide-react-native"
import DoneIcon from '@/assets/images/empty-state/Done.svg'
import ErrorIcon from '@/assets/images/empty-state/Error.svg'
import NoTasksIcon from '@/assets/images/empty-state/NoTasks.svg'
import NoMessagesIcon from '@/assets/images/empty-state/NoMessages.svg'
import { Button } from "./button"

type FeedbackStatus = "success" | "failure" | "loading" | "message"

export const FeedbackScreen = ({
  status = "success",
  title,
  content,
}: {
  status: FeedbackStatus;
  title?: React.ReactNode;
  content?: React.ReactNode;
}) => {
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(status)
  // Pop animation for entry
  const scaleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setFeedbackStatus(status)
  }, [status])

  useEffect(() => {
    scaleAnim.setValue(0)
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start()
  }, [feedbackStatus])  

  const getStatusConfig = () => {
    switch (feedbackStatus) {
      case "success":
        return {
          icon: <DoneIcon width={250} height={250} />,
          title: (
            <View className="flex">
              <Text className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}>
                Setup Completed
              </Text>
              <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
                Congratulations!
              </Text>
              <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
                You are all set up!
              </Text>
            </View>
          )
        }
      case "failure":
        return {
          icon: <ErrorIcon width={250} height={250} />,
          title: (
            <View className="flex">
              <Text className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}>
                Oops!
              </Text>
              <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
                Something went wrong!
              </Text>
              <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
                please try again
              </Text>
            </View>
          )
        }
      case "loading":
        return {
          icon: <NoTasksIcon width={250} height={250} />,
          title: (
            <View className="flex">
              <Text className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}>
                Drink your coffee first
              </Text>
              <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
                We're still processing your request
              </Text>
              <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
                please wait patiently...
              </Text>
            </View>
          )
        }
      case "message":
        return {
          icon: <NoMessagesIcon width={250} height={250} />,
          title: (
            <View className="flex">
              <Text className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}>
                Welcome!
              </Text>
            </View>
          )
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <SafeAreaView className="flex-1 px-5 py-10">
      <Animated.View 
        style={{ transform: [{ scale: scaleAnim }] }}
        className="flex-1"
      >
        <View className="items-center">
          {/* Icon Container */}
          <View className={`w-24 h-24 rounded-full items-center justify-center mt-20 mb-12`}>
            {statusConfig.icon}
          </View>

          {/* Title */}
          {title ? title : statusConfig.title}
        </View>
    
        {content}
      </Animated.View>
    </SafeAreaView>
  )
}