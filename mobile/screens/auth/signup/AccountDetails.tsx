import "@/global.css"
import React from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Button } from "@/components/ui/button"
import _ScreenLayout from "@/screens/_ScreenLayout"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { X } from "@/lib/icons/X"
import { FormInput } from "@/components/ui/form/form-input"
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"
import { useToast } from "@/hooks/use-toast"
import { useAddAccount } from "../queries/authPostQueries"
import { useGetAccountEmailList } from "../queries/authFetchQueries"
import { ConfirmationModal } from "@/components/ui/confirmationModal"

export default function AccountDetails({ submit } : {
  submit: () => void
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { registrationType, rp_id } = useLocalSearchParams();
  const { toast } = useToast();
  const { control, trigger, getValues, setError, reset } = useRegistrationFormContext();
  const { mutateAsync: addAccount } = useAddAccount();
  const { data: accEmailList, isLoading } = useGetAccountEmailList();

  const handleSubmit = async () => {
    const formIsValid = await trigger([
      'accountFormSchema'
    ]);

    if(!formIsValid) {
      return;
    }

    if (accEmailList?.includes(getValues('accountFormSchema.email'))) {
      setError('accountFormSchema.email', { 
        type: "manual",
        message: "Email is already in use" 
      });
      return;
    }

    submit();
  }

  return (
    <View className="flex-1 px-5">
      {/* Header Section */}
      <View>
        <Text className="text-xl font-PoppinsMedium text-gray-900 mb-2">Create Your Account</Text>
        <Text className="text-sm font-PoppinsRegular text-gray-600 leading-6 mb-4">
          Please fill in your account details to continue with the registration process.
        </Text>
      </View>

      {/* Form Section */}
      <View className="space-y-6">
        <View className="space-y-4">
          <FormInput control={control} name="accountFormSchema.username" label="Username"/>
          <FormInput control={control} name="accountFormSchema.email" label="Email Address" keyboardType="email-address"/>
          <FormInput control={control} name="accountFormSchema.password" label="Password" secureTextEntry/>
          <FormInput control={control} name="accountFormSchema.confirmPassword" label="Confirm Password" secureTextEntry/>
        </View>

        {/* Password Requirements */}
        <View className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Text className="text-sm font-PoppinsMedium text-blue-900 mb-2">Password Requirements:</Text>
          <View className="space-y-1">
            <Text className="text-xs font-PoppinsRegular text-blue-700">• At least 6 characters long</Text>
            <Text className="text-xs font-PoppinsRegular text-blue-700">
              • Contains uppercase and lowercase letters
            </Text>
            <Text className="text-xs font-PoppinsRegular text-blue-700">• Includes at least one number</Text>
          </View>
        </View>
      </View>
      <View className="py-6 bg-white border-t border-gray-100">
        <Button onPress={handleSubmit} className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg">
          <Text className="text-white font-PoppinsSemiBold text-[16px]">Continue</Text>
        </Button>

        {/* Terms and Privacy */}
        <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-4 leading-4">
          By continuing, you agree to our <Text className="text-primaryBlue font-PoppinsMedium">Terms of Service</Text>{" "}
          and <Text className="text-primaryBlue font-PoppinsMedium">Privacy Policy</Text>
        </Text>
      </View>
    </View>
  )
}
