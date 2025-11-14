import { RefreshCcw } from "@/lib/icons/RefreshCcw";
import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OTPModal({
  otp,
  modalVisible,
  description,
  invalid,
  setOtp,
  setModalVisible,
  resendOtp,

} : {
  otp: any[]
  modalVisible: boolean
  description?: React.ReactNode
  invalid: boolean
  setOtp: React.Dispatch<React.SetStateAction<any[]>>
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  resendOtp: () => void
}) {
  const otpRefs = React.useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = React.useState(180); // 3 minutes in seconds
  const [canResend, setCanResend] = React.useState(false);

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

  const handleResendOtp = () => {
    if (canResend) {
      resendOtp();
      setTimer(180);
      setCanResend(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    if(invalid) {
      otpRefs.current[0]?.focus();
    }
  }, [invalid]);

  React.useEffect(() => {
    if (modalVisible) {
      setTimer(180);
      setCanResend(false);
    }
  }, [modalVisible]);

  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);
  
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
                  ref={(el) => { otpRefs.current[index] = el; }}
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
            {invalid && <Text className="text-red-500 text-xs">Incorrect verification code. Please try again.</Text>}
            <TouchableOpacity
              className={`flex-row justify-center items-center mt-6 mb-4 ${!canResend ? 'opacity-50' : ''}`}
              onPress={handleResendOtp}
              disabled={!canResend}
            >
              <RefreshCcw size={18} color={canResend ? "#3B82F6" : "#9CA3AF"} />
              <Text className={`font-semibold ml-2 ${canResend ? 'text-primaryBlue' : 'text-gray-400'}`}>
                {canResend ? 'Resend OTP' : `Resend OTP (${formatTime(timer)})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}