import "@/global.css";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";
import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { RadioGroup } from "@/components/ui/radio-button/radio-group";
import RadioButton from "@/components/ui/radio-button/radio-button";
import { Calendar } from "@/lib/icons/Calendar";
import { useForm } from "../../../app/(auth)/FormContext";
import { FormDataSchema } from "@/form-schema/registration-schema"; 
import { z } from "zod";

const getErrorMessage = (errors: z.ZodError | null, path: string): string | undefined => {
  return errors?.issues.find((issue) => issue.path.includes(path))?.message;
};


export const IdentityVerificationForm = () => {
  const router = useRouter();
  const { formData, setFormData } = useForm();
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<z.ZodError | null>(null);

  const showDatepicker = () => {
    setShowCalendar(true);
  };

  const handleNext = () => {
    const identityVerificationSchema = FormDataSchema.pick({
      identityVerification: true,
    });
    const validationResult = identityVerificationSchema.safeParse(formData);

    if (validationResult.success) {
      setErrors(null); 
      router.push("/demographic-data");
    } else {
      setErrors(validationResult.error);
      alert("Please complete all fields correctly.");
    }
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setShowCalendar(false);
      setFormData({
        ...formData,
        identityVerification: {
          ...formData.identityVerification,
          dob: selectedDate.toISOString(),
        },
      });
    }
  };

  const handleResidencyChange = (value: string) => {
    setFormData({
      ...formData,
      identityVerification: {
        ...formData.identityVerification,
        residency: value,
      },
    });
  };

  return (
    <View className="flex-1">
      <View className="flex-1 flex-col gap-5">
        {/* Date of Birth Field */}
        <View className="flex">
          <Text className="text-[16px] font-PoppinsRegular">Date of Birth</Text>
          <View className="flex relative">
            <Button
              onPress={showDatepicker}
              className="bg-white border border-gray-300 native:h-[57px] items-start"
            >
              <Text className="text-[16px]">
                {formData.identityVerification.dob
                  ? new Date(formData.identityVerification.dob).toLocaleDateString()
                  : "Select Date"}
              </Text>
            </Button>
            {showCalendar && (
              <RNDateTimePicker
                testID="datePicker"
                value={
                  formData.identityVerification.dob
                    ? new Date(formData.identityVerification.dob)
                    : new Date()
                }
                mode="date"
                is24Hour={true}
                onChange={onChange}
              />
            )}
            <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
              <Calendar className="text-gray-700" />
            </View>
          </View>
          {/* Display validation error for DOB */}
          {getErrorMessage(errors, "identityVerification.dob") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage(errors, "identityVerification.dob")}
            </Text>
          )}
        </View>

        {/* Residency Selection */}
        <View>
          <Text className="text-black font-PoppinsRegular text-[16px] mb-5">
            Residency
          </Text>
          <RadioGroup
            value={formData.identityVerification.residency}
            onValueChange={handleResidencyChange}
            className="gap-3"
          >
            <RadioButton value="Permanent" onLabelPress={() => {}} />
            <RadioButton value="Temporary" onLabelPress={() => {}} />
          </RadioGroup>
          {/* Display validation error for Residency */}
          {getErrorMessage(errors, "identityVerification.residency") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage(errors, "identityVerification.residency")}
            </Text>
          )}
        </View>
      </View>

      {/* Next Button */}
      <View>
        <Button onPress={handleNext} className="bg-primaryBlue native:h-[57px]">
          <Text className="text-white font-PoppinsMedium text-[16px]">Next</Text>
        </Button>
      </View>
    </View>
  );
};