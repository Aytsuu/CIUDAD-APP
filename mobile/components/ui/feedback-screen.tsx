import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import DoneIcon from "@/assets/images/empty-state/Done.svg";
import ErrorIcon from "@/assets/images/empty-state/Error.svg";
import NoTasksIcon from "@/assets/images/empty-state/NoTasks.svg";
import NoMessagesIcon from "@/assets/images/empty-state/NoMessages.svg";
import NoAccess from "@/assets/images/empty-state/NoAccess.svg";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type FeedbackStatus = "success" | "failure" | "waiting" | "message";
type AnimationType =
  | "scale"
  | "slideLeft"
  | "slideRight"
  | "slideTop"
  | "slideBottom"
  | "fade";

export const FeedbackScreen = ({
  status = "success",
  title,
  content,
  animationType = "scale",
  animationDuration = 600,
}: {
  status: FeedbackStatus;
  title?: React.ReactNode;
  content?: React.ReactNode;
  animationType?: AnimationType;
  animationDuration?: number;
}) => {
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(status);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFeedbackStatus(status);
  }, [status]);

  useEffect(() => {
    // Reset all animation values
    scaleAnim.setValue(0);
    slideAnim.setValue(0);
    fadeAnim.setValue(0);

    // Set initial values based on animation type
    switch (animationType) {
      case "scale":
        scaleAnim.setValue(0);
        break;
      case "slideLeft":
        slideAnim.setValue(-screenWidth);
        break;
      case "slideRight":
        slideAnim.setValue(screenWidth);
        break;
      case "slideTop":
        slideAnim.setValue(-screenHeight);
        break;
      case "slideBottom":
        slideAnim.setValue(screenHeight);
        break;
      case "fade":
        fadeAnim.setValue(0);
        break;
    }

    // Start animation
    const animations = [];

    switch (animationType) {
      case "scale":
        animations.push(
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        );
        break;
      case "slideLeft":
      case "slideRight":
      case "slideTop":
      case "slideBottom":
        animations.push(
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: animationDuration,
            useNativeDriver: true,
          })
        );
        break;
      case "fade":
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
          })
        );
        break;
    }

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [feedbackStatus, animationType, animationDuration]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case "scale":
        return {
          transform: [{ scale: scaleAnim }],
        };
      case "slideLeft":
      case "slideRight":
        return {
          transform: [{ translateX: slideAnim }],
        };
      case "slideTop":
      case "slideBottom":
        return {
          transform: [{ translateY: slideAnim }],
        };
      case "fade":
        return {
          opacity: fadeAnim,
        };
      default:
        return {};
    }
  };

  const getStatusConfig = () => {
    switch (feedbackStatus) {
      case "success":
        return {
          icon: <DoneIcon width={250} height={250} />,
          title: (
            <View className="flex">
              <Text
                className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}
              >
                Setup Completed
              </Text>
              <Text
                className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}
              >
                Congratulations!
              </Text>
              <Text
                className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}
              >
                You are all set up!
              </Text>
            </View>
          ),
        };
      case "failure":
        return {
          icon: <ErrorIcon width={250} height={250} />,
          title: (
            <View className="flex">
              <Text
                className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}
              >
                Oops!
              </Text>
              <Text
                className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}
              >
                Something went wrong!
              </Text>
              <Text
                className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}
              >
                please try again
              </Text>
            </View>
          ),
        };
      case "waiting":
        return {
          icon: <NoTasksIcon width={250} height={250} />,
          title: (
            <View className="flex">
              <Text
                className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}
              >
                Drink your coffee first
              </Text>
              <Text
                className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}
              >
                We're still processing your request
              </Text>
              <Text
                className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}
              >
                please wait patiently...
              </Text>
            </View>
          ),
        };
      case "message":
        return {
          icon: <NoMessagesIcon width={250} height={250} />,
          title: (
            <View className="flex">
              <Text
                className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}
              >
                Welcome!
              </Text>
            </View>
          ),
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <SafeAreaView className="flex-1 px-5 pb-10">
      <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>
        <View className="items-center">
          {/* Icon Container */}
          <View
            className={`w-24 h-24 rounded-full items-center justify-center mt-20 mb-12`}
          >
            {statusConfig.icon}
          </View>

          {/* Title */}
          {title ? title : statusConfig.title}
        </View>

        {content}
      </Animated.View>
    </SafeAreaView>
  );
};

export const NoAccessScreen = ({
  title,
  description,
}: {
  title?: string;
  description?: React.ReactNode;
}) => {
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Oops...</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 items-center justify-end relative">
        <View className="absolute left-1/2 transform -translate-x-1/2 top-20 bottom-0 w-80">
          <Text className="text-primaryBlue text-xl font-semibold text-center mb-3">
            {title}
          </Text>

          <Text className="text-gray-600 text-[14px] text-center leading-6 mb-6 mt-2">
            {description}
          </Text>
        </View>
        <NoAccess width={500} height={500} />
      </View>
    </PageLayout>
  );
};
