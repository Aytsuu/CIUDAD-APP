import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button/button";
import { useToastContext } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "lucide-react-native";

const otpImage = require("@/assets/images/otp.png");

export default function PhoneOTP() {
  // const { verifyOtp } = useAuth();
  const { toast } = useToastContext();
  const router = useRouter();
  const { phone: rawPhone } = useLocalSearchParams<{
    phone?: string | string[];
  }>();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const phone = Array.isArray(rawPhone) ? rawPhone[0] : rawPhone || "";

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete OTP");
      return;
    }

    try {
      // const User = await verifyOtp(phone, otp.join(""));
      router.replace("/(tabs)");
    } catch (error: any) {
      toast.error("An error occurred during OTP verification");
    }
  };

  const { width: screenWidth } = Dimensions.get("window");
  const imageWidth = screenWidth * 0.85;
  const imageHeight = imageWidth * (200 / 300);

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
      headerTitle={null}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-white px-6 pt-20">
        {/* Illustration */}
        <View className="mb-20">
          <Image
            source={otpImage}
            style={{
              width: imageWidth,
              height: imageHeight,
              alignSelf: "center",
              resizeMode: "contain",
            }}
          />
        </View>
        {/* OTP Text & Inputs */}
        <Text className="text-center text-black/70 font-PoppinsSemiBold text-3xl mb-2">
          Enter Verification Code
        </Text>
        <Text className="text-center text-gray-500 mb-8">
          Enter 6 digit code that was sent to your number
        </Text>
        <View className="flex-row justify-between mb-2">
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => (inputRefs.current[idx] = ref)}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, idx)}
              keyboardType="number-pad"
              maxLength={1}
              className="w-12 h-14 border border-gray-300 text-center rounded-lg text-lg"
            />
          ))}
        </View>
        <View className="flex-row justify-end mb-12">
          <Button className="bg-transparent shadow-none">
            <Text className="text-[#00AEEF] font-PoppinsRegular text-sm underline">
              Resend Code
            </Text>
          </Button>
        </View>

        <Button
          className="bg-[#00AEEF] rounded-xl shadow-md"
          size="lg"
          onPress={handleVerifyOtp}
        >
          <Text className="text-white font-PoppinsSemiBold text-[15px]">
            Verify OTP
          </Text>
        </Button>
      </View>
    </PageLayout>
  );
}
