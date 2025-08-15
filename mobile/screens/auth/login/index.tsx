import "@/global.css";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/components/ui/toast";
import { SignupOptions } from "./SignupOptions";
import { useAuth } from "@/contexts/AuthContext";
import GoogleIcon from "@/assets/images/google.svg";

export default function SignInScreen() {
  const { toast } = useToastContext();
  const router = useRouter();
  const [showSignupOptions, setShowSignupOptions] = useState(false);
  const [phone, setPhone] = useState("");

  const {
    loginWithGoogle,
    isLoading,
    isAuthenticated,
    user,
    error,
    clearError,
    sendOtp,
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Welcome back!");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user, router, toast]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, toast, clearError]);

  const handleContinue = useCallback(async () => {
    const phoneRegex = /^9\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error(
        "Please enter a valid mobile number starting with 9 and 10 digits long"
      );
      return;
    }
    console.log("Sending OTP to", `+63${phone}`);
    // const response = await sendOtp(phone);
    toast.success(`OTP sent to 63${phone}`);
    router.push("/(auth)/otp");
  }, [phone, toast, router]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <ScrollView
      className="flex-1 mt-20 px-2"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 px-5">
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="items-center mt-7">
            <Image
              source={require("@/assets/images/Logo.png")}
              className="w-56 h-56"
            />
            <View className="mt-6 items-center">
              <Text className="text-[24px] font-PoppinsSemiBold">Welcome!</Text>
              <Text className="text-[12px] font-PoppinsRegular">
                Log in with your phone or Google
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <View className="flex-grow mt-16">
          <Text className="font-PoppinsRegular text-gray-800 mb-2 text-[15px]">
            Mobile Number
          </Text>
          <View className="flex-row items-center">
            {/* Country Code Container */}
            <View className="bg-gray-50 border border-gray-300 rounded-l-xl px-4 py-3 shadow-sm border-r-0">
              <Text className="text-gray-800 font-PoppinsMedium text-[15px]">
                +63
              </Text>
            </View>
            {/* Phone Number Input */}
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              returnKeyType="done"
              className="flex-1 font-PoppinsRegular text-[15px] text-gray-800 bg-gray-50 border border-gray-300 rounded-r-xl px-4 py-3 shadow-sm"
              placeholderTextColor="#999"
              blurOnSubmit={true}
              maxLength={10}
            />
          </View>

          <Button
            className={`${
              isLoading ? "bg-gray-400" : "bg-[#00AEEF]"
            } mt-6 rounded-xl shadow-md`}
            size="lg"
            onPress={handleContinue}
            disabled={isLoading}
          >
            <Text className="text-white font-PoppinsSemiBold text-[15px]">
              {isLoading ? "Sending..." : "Continue"}
            </Text>
          </Button>

          <View className="flex-row items-center my-6 mt-14">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text className="mx-3 text-gray-500 font-PoppinsRegular">or</Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </View>

          <TouchableOpacity
            onPress={loginWithGoogle}
            disabled={isLoading}
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-lg py-3"
            activeOpacity={0.7}
          >
            <GoogleIcon width={30} height={30} style={{ marginRight: 20 }} />
            <Text className="font-PoppinsSemiBold text-[14px]">
              Login with Google
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center gap-2 mt-8 mb-6">
          <Text className="text-gray-600 font-PoppinsRegular text-[13px]">
            Don't have an account?
          </Text>
          <TouchableOpacity
            onPress={() => setShowSignupOptions(true)}
            disabled={isLoading}
            activeOpacity={0.6}
          >
            <Text
              className={`font-PoppinsMedium text-[13px] ${
                isLoading ? "text-gray-400" : "text-primaryBlue"
              }`}
            >
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        <SignupOptions
          visible={showSignupOptions}
          onClose={() => setShowSignupOptions(false)}
        />
      </View>
    </ScrollView>
  );
}