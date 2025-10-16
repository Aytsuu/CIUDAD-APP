import { useToastContext } from "@/components/ui/toast";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import OTPModal from "./OTPModal";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { FormInput } from "@/components/ui/form/form-input";
import { useSendOTP } from "../../queries/authPostQueries";
import { SubmitButton } from "@/components/ui/button/submit-button";

export default function PhoneOTP({ params }: { params: Record<string, any> }) {
  // ====================== STATE INITIALIZATION ======================
  const { control, getValues, trigger, watch } = useRegistrationFormContext();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [otpInput, setOtpInput] = React.useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [otpValue, setOtpValue] = React.useState<string>("");
  const [invalidOTP, setInvalidOTP] = React.useState<boolean>(false);
  const { toast } = useToastContext();

  const { mutateAsync: sendOTP } = useSendOTP();

  // ====================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if (otpInput.every((val) => val == "")) return;

    if (otpInput?.length == 6 && otpInput.every((val) => val !== "")) verify();
    else setInvalidOTP(false);
  }, [otpInput]);

  React.useEffect(() => {
    if(!modalVisible) setInvalidOTP(false);
  }, [modalVisible])

  // ====================== HANDLERS ======================
  const verify = () => {
    const input = otpInput.join("");
    if (input === otpValue) {
      setModalVisible(false);
      setOtpInput(["", "", "", "", "", ""]);
      setOtpValue("");
      toast.success("Phone number verified.");
      params.next();
    } else {
      setOtpInput(["", "", "", "", "", ""]);
      setInvalidOTP(true);
    }
  };

  const send = async () => {
    console.log('Base URL:', process.env.EXPO_API_URL);

    if (!(await trigger("accountFormSchema.phone"))) {
      return;
    }

    try {
      setIsSubmitting(true);
      const phone = getValues("accountFormSchema.phone");
      
      const verification = await sendOTP({
        pv_phone_num: phone,
        pv_type: params?.signin ? "login" : "signup"
      });

      setOtpValue(verification.pv_otp);
      setModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================== RENDER ======================
  return (
    <View className="flex-1">
      <View className="px-6 pb-6">
        <Text className="text-base text-gray-600 leading-relaxed">
          We'll send you a verification code to confirm your phone number.
        </Text>
      </View>

      <View className="px-6 py-4">
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-3">
            Phone Number
          </Text>
          <FormInput
            control={control}
            name="accountFormSchema.phone"
            keyboardType="phone-pad"
            placeholder="09XX XXX XXXX"
          />
        </View>

        <SubmitButton 
          submittingLabel="Sending Code..."
          buttonLabel="Send Verification Code"
          isSubmitting={isSubmitting}
          handleSubmit={send}
        />
      </View>

      <View className="flex-row items-center justify-center mt-8 gap-1">
        {params.signin && 
          <>
            <TouchableOpacity onPress={() => params?.switch()}>
              <Text className="text-primaryBlue text-sm">
                Use Email
              </Text>
            </TouchableOpacity>
          </>
        }
      </View>

      <OTPModal
        otp={otpInput}
        modalVisible={modalVisible && otpValue !== ""}
        description={
          <View className="mb-4">
            <Text className="text-center text-gray-600 text-sm leading-relaxed">
              Enter the 6-digit code sent to your phone number{" "}
              <Text className="font-medium text-gray-600 text-sm">
                {watch("accountFormSchema.phone")}
              </Text>
            </Text>
            <View className="flex-row gap-1 items-center justify-center my-3">
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setOtpValue("");
                }}
              >
                <Text className="text-center text-primaryBlue text-sm font-medium">
                  Change Number
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        setModalVisible={setModalVisible}
        setOtp={setOtpInput}
        resendOtp={send}
        invalid={invalidOTP}
      />
    </View>
  );
}
