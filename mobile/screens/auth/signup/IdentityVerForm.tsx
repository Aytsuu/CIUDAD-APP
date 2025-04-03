import "@/global.css";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";
import { RegistrationFormSchema } from "@/form-schema/registration-schema"; 
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";


const defaultValues = generateDefaultValues(RegistrationFormSchema)

export const IdentityVerificationForm = () => {
  const router = useRouter();
  const { control, trigger, getValues, formState } = useRegistrationFormContext()

  const handleSubmit = async () => {
    const formIsValid = await trigger(["verificationSchema.dob"])

    if(formIsValid) {
      router.push("/(auth)/personal-information")
    }
  }

  return (
    <View className="flex-1">
      <View className="flex-1 flex-col gap-5">
        <FormDateInput 
          control={control}
          name="verificationSchema.dob"
          label="Date of Birth"
        />
      </View>

      {/* Next Button */}
      <View>
        <Button onPress={handleSubmit} className="bg-primaryBlue native:h-[57px]">
          <Text className="text-white font-PoppinsMedium text-[16px]">Next</Text>
        </Button>
      </View>
    </View>
  );
};