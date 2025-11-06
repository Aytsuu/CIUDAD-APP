import { useToastContext } from "@/components/ui/toast";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import OTPModal from "./loginOTPModal";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { FormInput } from "@/components/ui/form/form-input";
import { useAuth } from "@/contexts/AuthContext";
import { SubmitButton } from "@/components/ui/button/submit-button";
import { useSendOTP } from "../queries/authPostQueries";
import axios from "axios";

interface LoginOTPProps {
  method: "email" | "phone";
  onSwitchMethod: () => void;
}

export default function LoginOTP({ method, onSwitchMethod }: LoginOTPProps) {
  // ====================== STATE INITIALIZATION ======================
  const { control, getValues, trigger, setValue, setError } = useRegistrationFormContext();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [invalidOTP, setInvalidOTP] = React.useState<boolean>(false);
  const [otpInput, setOtpInput] = React.useState<string[]>(["", "", "", "", "", ""]);
  const { toast } = useToastContext();
  const { sendEmailOTP, login } = useAuth();
  const { mutateAsync: sendOTP } = useSendOTP();

  // ====================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if (otpInput.every((val) => val === "")) return;

    if (otpInput?.length === 6 && otpInput.every((val) => val !== "")) {
      handleLoginWithOTP();
    } else {
      setInvalidOTP(false);
    }
  }, [otpInput]);

  React.useEffect(() => {
    if (!modalVisible) setInvalidOTP(false);
  }, [modalVisible]);

  // ====================== HANDLERS ======================
  const handleLoginWithOTP = async () => {
    const otp = otpInput.join("");
    try {
      setIsLoggingIn(true);
      
      const fieldName = method === "email" ? "accountFormSchema.email" : "accountFormSchema.phone";
      const identifier = getValues(fieldName);
      
      // Directly call login with OTP
      await login({
        ...(method === "email" ? { email: identifier } : { phone: identifier }),
        otp: otp
      });
      
      // Login successful - no need to do anything else as the auth context will handle redirect
      setModalVisible(false);
      setOtpInput(["", "", "", "", "", ""]);
      
    } catch (err: any) {
      console.error("Login with OTP error:", err);
      const errorMessage = err?.response?.data?.error || "Invalid OTP. Please try again.";
      toast.error(errorMessage);
      setOtpInput(["", "", "", "", "", ""]);
      setInvalidOTP(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const submitOTP = async () => {
    const fieldName = method === "email" ? "accountFormSchema.email" : "accountFormSchema.phone";
    
    if (!(await trigger(fieldName))) {
      return;
    }

    try {
      setIsSubmitting(true);
      const value = getValues(fieldName);
      
      let response;
      if (method === "email") {
        response = await sendEmailOTP({
          email: value,
          type: "signin"
        });
      } else {
        response = await sendOTP({
          pv_phone_num: value,
          pv_type: "login"
        });
      }

      if (response) {
        setModalVisible(true);
        toast.success(`OTP sent to your ${method === "email" ? "email" : "phone"}`);
      }
    } catch (err: any) {
      console.error("Send OTP error:", err);
      
      if (axios.isAxiosError(err) && err.response) {
        const errors = err.response.data;
        const fieldName = method === "email" ? "accountFormSchema.email" : "accountFormSchema.phone";
        
        if (errors.email || errors.phone) {
          setError(fieldName, {
            type: "server",
            message: Array.isArray(errors.email || errors.phone) 
              ? (errors.email || errors.phone)[0] 
              : (errors.email || errors.phone),
          });
        } else if (errors.error) {
          toast.error(errors.error);
        }
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================== RENDER ======================
  return (
    <View className="flex-1">
      <View className="px-6 pb-6">
        <Text className="text-base text-gray-600 leading-relaxed">
          We'll send you a verification code to confirm your {method === "email" ? "email" : "phone number"}.
        </Text>
      </View>

      <View className="px-6 py-4">
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-3">
            {method === "email" ? "Email Address" : "Phone Number"}
          </Text>
          <FormInput
            control={control}
            name={method === "email" ? "accountFormSchema.email" : "accountFormSchema.phone"}
            placeholder={method === "email" ? "@gmail.com" : "09XX XXX XXXX"}
            keyboardType={method === "email" ? "email-address" : "phone-pad"}
          />
        </View>

        <SubmitButton 
          submittingLabel="Sending Code..."
          buttonLabel={`Send Verification Code`}
          isSubmitting={isSubmitting}
          handleSubmit={submitOTP}
        />

        <View className="flex-row items-center justify-center mt-8 gap-1">
          <Text className="text-sm text-gray-600">
            {method === "email" ? "Verify via phone?" : "Verify via email?"}
          </Text>
          <TouchableOpacity onPress={onSwitchMethod}>
            <Text className="text-primaryBlue text-sm font-medium">
              Use {method === "email" ? "Phone" : "Email"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <OTPModal
        otp={otpInput}
        modalVisible={modalVisible}
        description={
          <View className="mb-4">
            <Text className="text-center text-gray-600 text-sm leading-relaxed">
              Enter the 6-digit code sent to your {method === "email" ? "email address" : "phone number"}
            </Text>
          </View>
        }
        setModalVisible={setModalVisible}
        setOtp={setOtpInput}
        resendOtp={submitOTP}
        invalid={invalidOTP}
        method={method}
        isLoggingIn={isLoggingIn}
      />
    </View>
  );
}