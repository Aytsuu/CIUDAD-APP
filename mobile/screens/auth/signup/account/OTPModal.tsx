import { RefreshCcw } from "@/lib/icons/RefreshCcw";
import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OTPModal({
  otp,
  modalVisible,
  description,
  setOtp,
  setModalVisible,
  resendOtp,

} : {
  otp: any[]
  modalVisible: boolean
  description?: React.ReactNode
  setOtp: React.Dispatch<React.SetStateAction<any[]>>
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  resendOtp: () => void
}) {
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
            <Text className="text-center text-xl font-bold mb-3">One-Time Password</Text>
            {description}
            <View className="flex-row justify-between mb-5">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  className="border border-gray-300 rounded-lg w-12 h-14 text-center text-lg"
                  value={digit}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(index, nativeEvent.key)
                  }
                />
              ))}
            </View>

            <TouchableOpacity
              className="flex-row justify-center items-center"
              onPress={resendOtp}
            >
              <RefreshCcw size={18} color="#3B82F6" />
              <Text className="text-primaryBlue font-semibold ml-2">Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}