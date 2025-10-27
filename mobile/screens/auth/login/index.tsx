import "@/global.css";
import React, { useState, memo, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { useRouter } from "expo-router";
import CIUDADLogo from "@/assets/images/CIUDADLogo.svg";
import IntroScreen from "./introscreen";
import { SignupOptions } from "./SignupOptions";
import { useToastContext } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { DrawerTrigger, DrawerView } from "@/components/ui/drawer";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

const { width } = Dimensions.get("window");

const carousel = [
  {
    id: 1,
    image: require("@/assets/images/Login/carousel1.png"),
    title: "Welcome to Ciudad",
    description: "Your community and services, all in one place.",
  },
  {
    id: 2,
    image: require("@/assets/images/Login/carousel2.jpg"),
    title: "Barangay Services",
    description:
      "Easily request assistance, permits, and other barangay services online.",
  },
  {
    id: 3,
    image: require("@/assets/images/Login/carousel3.jpg"),
    title: "Health Services",
    description:
      "Stay informed and connected with local health programs and support.",
  },
];

export default function App() {
  const { isAuthenticated, loginLoading } = useAuth();

  const { toast } = useToastContext();
  const router = useRouter();

  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleLogin = useMemo(
    () => () => router.push("/(auth)/loginscreen"),
    [router]
  );

  if (showIntro) {
    return (
      <IntroScreen
        onAnimationFinish={() => {
          if (isAuthenticated) handleLogin();
          setShowIntro(false);
        }}
      />
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-500 to-blue-10">
        {/* Logo */}
        <View className="items-center mt-4">
          <CIUDADLogo width={90} height={90} />
        </View>

        {/* Carousel & Pagination  */}
        <View className="flex-1 justify-center">
          <Carousel
            ref={carouselRef}
            loop
            width={width}
            height={420}
            data={carousel}
            autoPlay
            autoPlayInterval={5000}
            scrollAnimationDuration={800}
            onSnapToItem={(index) => setCurrentIndex(index)}
            renderItem={({ item }) => (
              <View className="items-center px-6">
                <Image
                  source={item.image}
                  style={{ width: "100%", height: 250, marginBottom: 16 }}
                  resizeMode="contain"
                />
                <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  {item.title}
                </Text>
                <Text className="text-base text-gray-600 text-center">
                  {item.description}
                </Text>
              </View>
            )}
          />

          {/* Pagination Dots */}
          <View className="flex-row justify-center">
            {carousel.map((_, index) => (
              <View
                key={index}
                className={`w-2.5 h-2.5 mx-1 rounded-full ${
                  currentIndex === index ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 pb-8">
          {/* Buttons */}
          <DrawerTrigger bottomSheetRef={bottomSheetRef}>
            <View className="bg-blue-600 py-3 rounded-2xl mb-3">
              <Text className="text-center text-white font-semibold text-lg">
                Sign Up
              </Text>
            </View>
          </DrawerTrigger>

          {/* Login Section */}
          <View className="flex flex-row items-center justify-center gap-x-2">
            <Text className="text-sm text-gray-500">
              Already have an Account?
            </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text className="text-sm text-center font-semibold text-blue-500">
                Login here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <DrawerView
        bottomSheetRef={bottomSheetRef}
        snapPoints={["80%"]}
        title={"Reports"}
        description={"View all reports"}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: 10,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          <SignupOptions />
        </BottomSheetScrollView>
      </DrawerView>
    </>
  );
}
