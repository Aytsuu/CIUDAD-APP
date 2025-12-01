import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { RefreshCw, Phone, Mail, X } from "lucide-react-native";
import { useToastContext } from "@/components/ui/toast";
import api from "@/api/api";

interface OTPVerificationProps {
  method: "phone" | "email";
  phone?: string;
  email?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onResend: () => Promise<void>;
  isResending?: boolean;
}

export default function RegVerification({
  method,
  phone,
  email,
  isOpen,
  onClose,
  onSuccess,
  onResend,
  isResending = false,
}: OTPVerificationProps) {
  const { toast } = useToastContext();
  const isMounted = useRef(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const Icon = method === "phone" ? Phone : Mail;
  const bgColor = method === "phone" ? "bg-green-600" : "bg-blue-600";
  const buttonColor = method === "phone" ? "bg-green-600" : "bg-blue-600";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setOtp(["", "", "", "", "", ""]);
      setErrorMessage("");
      setTimer(60);
      setCanResend(false);
      setIsVerifying(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (timer > 0 && isOpen) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, isOpen]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && !isVerifying) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setErrorMessage("");
    setIsVerifying(true);

    try {
      const payload = {
        otp: otpCode,
        ...(method === "email" ? { email: email! } : { phone: phone! }),
      };
      
      await api.post("authentication/signup/otp-verification/", payload);
      
      if (!isMounted.current) return;
      
      onSuccess();
      toast.success("Verification successful!", 3000);
      onClose();
    } catch (error: any) {
      if (!isMounted.current) return;
      
      console.error("OTP verification error:", error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Invalid OTP. Please try again."
      );
      resetOtp();
    } finally {
      if (isMounted.current) {
        setIsVerifying(false);
      }
    }
  };

  const resetOtp = () => {
    if (!isMounted.current) return;
    
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleResend = async () => {
    if (!canResend) return;

    setErrorMessage("");

    try {
      await onResend();
      
      if (!isMounted.current) return;
      
      setTimer(60);
      setCanResend(false);
      resetOtp();
      toast.success(
        `New OTP sent to your ${method === "phone" ? "phone" : "email"}!`,
        3000
      );
    } catch (error: any) {
      if (!isMounted.current) return;
      
      console.error("Resend error:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to resend OTP. Please try again."
      );
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-2xl p-8 w-full max-w-md">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color="#6B7280" />
          </TouchableOpacity>

          {/* Header with Icon */}
          <View className="items-center mb-6">
            <View
              className={`w-16 h-16 ${bgColor} rounded-2xl items-center justify-center mb-4`}
            >
              <Icon size={32} color="#FFFFFF" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Verify {method === "phone" ? "Phone Number" : "Email Address"}
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Enter the 6-digit code sent to{" "}
              {method === "phone" ? phone : email}
            </Text>
          </View>

          {/* OTP Input */}
          <View className="flex-row justify-center gap-3 mb-4">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={({ nativeEvent: { key } }) =>
                  handleKeyPress(index, key)
                }
                editable={!isVerifying}
                className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl bg-white"
                style={{
                  borderColor: digit ? "#3B82F6" : "#E5E7EB",
                }}
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-700 text-sm text-center">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Loading State */}
          {isVerifying && (
            <View className="flex-row items-center justify-center gap-2 mb-4">
              <Text className="text-blue-600 text-sm font-medium">
                Verifying OTP...
              </Text>
            </View>
          )}

          {/* Resend Section */}
          <View className="items-center mb-4">
            <Text className="text-gray-600 text-sm mb-3">
              Didn't receive the code?
            </Text>

            {canResend ? (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending}
                className="w-full border-2 border-blue-200 rounded-xl py-3 items-center"
              >
                {isResending ? (
                  <Text className="text-gray-600 font-semibold">
                    Resending OTP...
                  </Text>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <RefreshCw size={20} color="#3B82F6" />
                    <Text className="text-blue-600 font-semibold">
                      Resend OTP
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-500 text-sm font-medium">
                Resend available in{" "}
                <Text className="text-blue-600">{timer}s</Text>
              </Text>
            )}
          </View>

          {/* Manual Verify Button */}
          {otp.every((digit) => digit !== "") && !isVerifying && (
            <TouchableOpacity
              onPress={() => handleVerifyOtp(otp.join(""))}
              disabled={isVerifying}
              className={`${buttonColor} rounded-xl py-3 items-center`}
            >
              <Text className="text-white font-semibold">
                Verify {method === "phone" ? "Phone Number" : "Email Address"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

