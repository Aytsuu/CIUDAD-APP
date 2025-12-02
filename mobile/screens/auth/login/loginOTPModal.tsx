import { RefreshCcw } from "@/lib/icons/RefreshCcw";
import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OTPModalProps {
  otp: string[];
  modalVisible: boolean;
  description?: React.ReactNode;
  invalid: boolean;
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  resendOtp: () => void;
  method: "email" | "phone";
  isLoggingIn?: boolean;
}

export default function OTPModal({
  otp,
  modalVisible,
  description,
  invalid,
  setOtp,
  setModalVisible,
  resendOtp,
  method,
  isLoggingIn = false,
}: OTPModalProps) {
  const otpRefs = React.useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  React.useEffect(() => {
    if (invalid) {
      otpRefs.current[0]?.focus();
    }
  }, [invalid]);

  return (
    <SafeAreaView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-[90%] max-w-md bg-white rounded-2xl p-6">
            <Text className="text-center text-xl font-bold mb-3">
              Login Verification
            </Text>

            {description || (
              <View className="mb-4">
                <Text className="text-center text-gray-600 text-sm leading-relaxed">
                  Enter the 6-digit code sent to your{" "}
                  {method === "email" ? "email" : "phone"}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between mb-5">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  className={`border rounded-lg w-12 h-14 text-center text-lg ${
                    invalid ? "border-red-500 bg-red-50" : "border-gray-300"
                  } ${isLoggingIn ? "opacity-50" : ""}`}
                  value={digit}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(index, nativeEvent.key)
                  }
                  selectTextOnFocus
                  editable={!isLoggingIn}
                />
              ))}
            </View>

            {isLoggingIn && (
              <View className="flex-row items-center justify-center mb-2">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-primaryBlue ml-2 text-sm">
                  Logging in...
                </Text>
              </View>
            )}

            {invalid && (
              <Text className="text-red-500 text-xs text-center mb-2">
                Incorrect verification code. Please try again.
              </Text>
            )}

            <TouchableOpacity
              className="flex-row justify-center items-center mt-4 mb-2"
              onPress={resendOtp}
              disabled={isLoggingIn}
            >
              <RefreshCcw
                size={18}
                color={isLoggingIn ? "#9CA3AF" : "#3B82F6"}
              />
              <Text
                className={`font-semibold ml-2 ${
                  isLoggingIn ? "text-gray-400" : "text-primaryBlue"
                }`}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-2"
              disabled={isLoggingIn}
            >
              <Text
                className={`text-center text-sm ${
                  isLoggingIn ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
