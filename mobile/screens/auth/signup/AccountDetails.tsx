import "@/global.css"
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { Button } from "@/components/ui/button"
import _ScreenLayout from "@/screens/_ScreenLayout"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { X } from "@/lib/icons/X"
import { FormInput } from "@/components/ui/form/form-input"
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"

export default function AccountDetails() {
  const router = useRouter()
  const { control } = useRegistrationFormContext();

  const handleSubmit = async () => {

  }

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Account Details</Text>}
      customRightAction={
        <TouchableOpacity
          onPress={() => router.replace("/(auth)")}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <X size={20} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Section */}
        <View className="">
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
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View className="py-6 bg-white border-t border-gray-100">
        <Button onPress={handleSubmit} className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg">
          <Text className="text-white font-PoppinsSemiBold text-[16px]">Continue to Photo</Text>
        </Button>

        {/* Terms and Privacy */}
        <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-4 leading-4">
          By continuing, you agree to our <Text className="text-primaryBlue font-PoppinsMedium">Terms of Service</Text>{" "}
          and <Text className="text-primaryBlue font-PoppinsMedium">Privacy Policy</Text>
        </Text>
      </View>
    </_ScreenLayout>
  )
}
