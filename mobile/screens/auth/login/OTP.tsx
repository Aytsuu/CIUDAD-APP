import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/components/ui/toast";

export default function OtpScreen() {
  const { toast } = useToastContext();
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete OTP");
      return;
    }
    console.log("Verifying OTP:", code);
    toast.success("OTP Verified!");
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-center font-PoppinsSemiBold text-xl mb-4">
        Enter OTP
      </Text>
      <Text className="text-center text-gray-500 mb-8">
        We sent a code to {phone}
      </Text>

      <View className="flex-row justify-between mb-8">
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

      <Button
        className="bg-[#00AEEF] rounded-xl shadow-md"
        size="lg"
        onPress={handleVerifyOtp}
      >
        <Text className="text-white font-PoppinsSemiBold text-[15px]">
          Verify OTP
        </Text>
      </Button>

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.back()}
      >
        <Text className="text-center text-gray-500">Back</Text>
      </TouchableOpacity>
    </View>
  );
}
