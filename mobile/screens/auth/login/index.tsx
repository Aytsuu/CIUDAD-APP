import "@/global.css";
import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { useRouter } from "expo-router";
import CIUDADLogo from "@/assets/images/CIUDADLogo.svg";
import IntroScreen from "./introscreen";
import { SignupOptions } from "./SignupOptions";
import { signInSchema } from "@/form-schema/signin-schema";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { RootState, AppDispatch } from "@/redux";
import { useToastContext } from "@/components/ui/toast";
import z from "zod";

type SignInForm = z.infer<typeof signInSchema>;

const SignupOptionsMemo = memo(SignupOptions);

const { width } = Dimensions.get("window");

const carousel = [
  {
    id: 1,
    image: require("@/assets/images/image.png"),
    title: "Welcome to Ciudad",
    description: "Connecting people and communities together in one place",
  },
  {
    id: 2,
    image: require("@/assets/images/image.png"),
    title: "Smart and Secure",
    description: "Your data is safe with top-grade security and encryption.",
  },
  {
    id: 3,
    image: require("@/assets/images/image.png"),
    title: "Fast and Reliable",
    description: "Access features quickly with smooth performance.",
  },
];

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth, shallowEqual);
  const { user, isAuthenticated, isLoading, error } = authState;
  
  const { toast } = useToastContext();
  const router = useRouter();
  
  const [showIntro, setShowIntro] = useState(true); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSignupOptions, setShowSignupOptions] = useState(false);
  const carouselRef = useRef(null);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Welcome back!");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user, toast, router]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  const handleShowSignupOptions = useMemo(
    () => () => setShowSignupOptions(true),
    []
  );

  const handleCloseSignupOptions = useMemo(
    () => () => setShowSignupOptions(false),
    []
  );

  const handleSignUp = useMemo(
    () => () => {
      setShowSignupOptions(true);
    },
    []
  );

  const handleLogin = useMemo(
    () => () => {
      router.push("/(auth)/loginscreen");
    },
    [router]
  );

  // Show intro screen first
  if (showIntro) {
    return <IntroScreen onAnimationFinish={() => setShowIntro(false)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-500 to-blue-10">
      {/* Logo */}
      <View className="items-center mt-4">
        <CIUDADLogo width={90} height={90} />
      </View>

      {/* Carousel */}
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
      </View>

      {/* Pagination + Footer */}
      <View className="px-6 pb-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-6">
          {carousel.map((_, index) => (
            <View
              key={index}
              className={`w-2.5 h-2.5 mx-1 rounded-full ${
                currentIndex === index ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-2xl mb-3"
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text className="text-center text-white font-semibold text-lg">
            {isLoading ? "Loading..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* Signup Options Modal */}
        <SignupOptionsMemo
          visible={showSignupOptions}
          onClose={handleCloseSignupOptions}
        />

        {/* Login Section */}
        <View className="flex flex-row items-center justify-center gap-x-2">
          <Text className="text-sm text-gray-500">Already have an Account?</Text>
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className={`text-sm text-center font-semibold ${
              isLoading ? "text-gray-400" : "text-blue-500"
            }`}>
              Login here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}