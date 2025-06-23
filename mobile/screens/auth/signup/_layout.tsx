import "@/global.css";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  View, 
  Text, 
  TouchableWithoutFeedback, 
  ScrollView, 
  Dimensions
} from "react-native";
import { router } from "expo-router";

// Get screen dimensions
const { width } = Dimensions.get('window');

// Responsive scaling function
const getResponsiveSize = (size: number) => {
  const scaleFactor = width / 375; // Base width
  const scaledSize = size * Math.min(scaleFactor, 1.2);
  return Math.round(scaledSize);
};

// Generate responsive style classes
const responsive = {
  textXs: `text-[${getResponsiveSize(12)}px]`,
  textSm: `text-[${getResponsiveSize(14)}px]`,
  textBase: `text-[${getResponsiveSize(16)}px]`,
  textLg: `text-[${getResponsiveSize(18)}px]`,
  textXl: `text-[${getResponsiveSize(20)}px]`,
  text2xl: `text-[${getResponsiveSize(22)}px]`,
  
  p2: `p-[${getResponsiveSize(8)}px]`,
  p4: `p-[${getResponsiveSize(16)}px]`,
  
  px4: `px-[${getResponsiveSize(16)}px]`,
  py2: `py-[${getResponsiveSize(8)}px]`,
  
  m2: `m-[${getResponsiveSize(8)}px]`,
  m4: `m-[${getResponsiveSize(16)}px]`,
  
  mt2: `mt-[${getResponsiveSize(8)}px]`,
  mt4: `mt-[${getResponsiveSize(16)}px]`,
  mb2: `mb-[${getResponsiveSize(8)}px]`,
  mb4: `mb-[${getResponsiveSize(16)}px]`,
};

export default ({
  children,
  header,
  description,
}: {  
  children: React.ReactNode;
  header: String;
  description: String;
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View className={`flex-row justify-between items-center ${responsive.px4} ${responsive.py2} ${responsive.mb4}`}>
          <TouchableWithoutFeedback onPress={() => router.back()}>
            <Text className={`text-black ${responsive.textBase}`}>Back</Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => router.push("/")}>
            <Text className={`text-black ${responsive.textBase}`}>Exit</Text>
          </TouchableWithoutFeedback>
        </View>
        
        <View className={`flex-1 flex-col ${responsive.px4} ${responsive.mt4}`}>
          <Text className={`text-black ${responsive.text2xl} font-PoppinsSemiBold ${responsive.mb2}`}>
            {header}
          </Text>
          
          {description && (
            <Text className={`text-black ${responsive.textSm} font-PoppinsRegular ${responsive.mb4} opacity-50 text-justify`}>
              {description}
            </Text>
          )}
          
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};