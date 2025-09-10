import { useToastContext } from "@/components/ui/toast"
import PageLayout from "@/screens/_PageLayout"
import React from "react"
import { ScrollView, View, Text, TouchableOpacity } from "react-native"
import OTPModal from "./OTPModal"
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"
import { FormInput } from "@/components/ui/form/form-input"
import { Button } from "@/components/ui/button"
import { useSendOTP } from "../../queries/authPostQueries"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { ConfirmationModal } from "@/components/ui/confirmationModal"
import { router } from "expo-router"
import { X } from "@/lib/icons/X"
import { useAuth } from "@/contexts/AuthContext"

export default function EmailOTP({ params } : {
  params: Record<string ,any>
}) {
  // ====================== STATE INITIALIZATION ======================
  const { control, getValues, trigger, setValue } = useRegistrationFormContext()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [modalVisible, setModalVisible] = React.useState<boolean>(false)
  const [otpInput, setOtpInput] = React.useState<string[]>(["", "", "", "", "", ""])
  const { toast } = useToastContext()
  const { sendEmailOTP,  verifyEmailOTP} = useAuth();

  // ====================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if (otpInput?.length == 6 && otpInput.every((val) => val !== "")) verify()
  }, [otpInput])

  // ====================== HANDLERS ======================
const verify = async () => {
  const otp = otpInput.join("")
  try {
    const email = getValues("accountFormSchema.email")
    const response = await verifyEmailOTP( email, otp ) 
    console.log("response:", response)
    if (response) {
      toast.success("Email verified successfully!");
      setModalVisible(false);
      params.next();
    } else {
      toast.error("OTP verification failed");
    }
  } catch (err) {
    toast.error("Something went wrong while verifying OTP");
  }
}


  const send = async () => {
    if (!(await trigger("accountFormSchema.email"))) {
      toast.error("Failed to send. Please try again.")
      return
    }

    try {
      setIsSubmitting(true)
      const email = getValues("accountFormSchema.email")
      const response = await sendEmailOTP(email);
      
      if (response) {
        setModalVisible(true);
      } 
    } catch (err) {
      toast.error("Failed to send. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const skip = () => {
    setValue("accountFormSchema.email", "");
    params.next();
  }

  // ====================== RENDER ======================
  return (
    <View className="flex-1">
      <View className="px-6 pb-6">
        <Text className="text-base text-gray-600 leading-relaxed">
          We'll send you a verification code to confirm your email.
        </Text>
      </View>

      <View className="px-6 py-4">
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-3">Email Address</Text>
          <FormInput
            control={control}
            name="accountFormSchema.email"
            placeholder="ex. juanlitoy243@gmail.com"
          />
        </View>

        <Button
          className={`bg-primaryBlue native:h-[45px] py-4 rounded-lg ${isSubmitting ? "opacity-70" : ""}`}
          onPress={send}
          disabled={isSubmitting}
        >
          <Text className="text-white font-semibold text-base">
            {isSubmitting ? "Sending Code..." : "Send Verification Code"}
          </Text>
        </Button>

        <View className="flex-row items-center justify-center mt-8 gap-1">
          <Text className="text-sm">Don't have email?</Text>
          <TouchableOpacity
            onPress={skip}
          >
            <Text className="text-primaryBlue text-sm">Skip Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      <OTPModal
        otp={otpInput}
        modalVisible={modalVisible}
        description={
          <View className="mb-4">
            <Text className="text-center text-gray-600 text-sm leading-relaxed">
              Enter the 6-digit code sent to your phone number
            </Text>
          </View>
        }
        setModalVisible={setModalVisible}
        setOtp={setOtpInput}
        resendOtp={send}
      />
    </View>
  )
}