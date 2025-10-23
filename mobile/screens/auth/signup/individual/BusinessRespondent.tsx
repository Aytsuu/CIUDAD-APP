import React from "react"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form/form-input"
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"
import { Text, View } from "react-native"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateInput } from "@/components/ui/form/form-date-input"
import { useToastContext } from "@/components/ui/toast"

const sexOptions: { label: string; value: string }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
]

export default function BusinessRespondent({ params } : {
  params: Record<string, any>
}) {
  // ===================== STATE INITIALIZATION =====================
  const { control, trigger } = useRegistrationFormContext();
  const { toast } = useToastContext();
  
  // ===================== HANDLERS =====================
  const handleContinue = async () => {
    if(!(await trigger("businessRespondent"))) {
      toast.error("Please fill out all required fields.")
    }

    params?.submit();
  }

  // ===================== RENDER =====================
  return (
    <View className="flex-1 px-5">
      {/* Full Name Section */}
      <View className="mb-8">
        <View className="w-full mb-4 pb-2 border-b border-gray-200">
          <Text className="text-lg font-PoppinsSemiBold text-gray-800">Full Name</Text>
          <Text className="text-sm text-gray-600 font-PoppinsRegular">Enter your complete legal name</Text>
        </View>

        <View className="space-y-4">
          <View className="grid space-x-3">
            <View className="flex-1">
              <FormInput control={control} label="First Name" name={`businessRespondent.br_fname`} />
            </View>
            <View className="flex-1">
              <FormInput control={control} label="Last Name" name={`businessRespondent.br_lname`} />
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <FormInput control={control} label="Middle Name" name={`businessRespondent.br_mname`} />
            </View>
          </View>
        </View>
      </View>

      {/* Demographics Section */}
      <View className="mb-8">
        <View className="mb-4 pb-2 border-b border-gray-200">
          <Text className="text-lg font-PoppinsSemiBold text-gray-800">Demographics</Text>
          <Text className="text-sm text-gray-600 font-PoppinsRegular">Basic demographic information</Text>
        </View>
        <View className="space-y-4">
          <FormDateInput control={control} name={`businessRespondent.br_dob`} label="Date of Birth"/>
          <FormSelect control={control} name={`businessRespondent.br_sex`} options={sexOptions} label="Sex"/>
        </View>
      </View>

      <View className="pt-4 pb-8 bg-white border-t border-gray-100">
        <Button onPress={handleContinue} className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg">
          <Text className="text-white font-PoppinsSemiBold text-[16px]">Continue</Text>
        </Button>

        <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-3">
          All information will be kept secure and confidential
        </Text>
      </View>
    </View>
  )
}
