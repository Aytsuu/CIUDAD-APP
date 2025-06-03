import "@/global.css";
import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import _ScreenLayout from "@/screens/_ScreenLayout";
import { FormDataSchema, validateFormData } from "@/form-schema/registration-schema"; // Import the schema and validation function
import { useForm } from "./FormContext"; // Import the useForm context
import { z } from 'zod';

export default function DemographicData() {
  const router = useRouter();
  const { formData, setFormData } = useForm(); // Use the form context
  const [errors, setErrors] = React.useState<z.ZodError | null>(null); // State to store validation errors

  const handleProceed = () => {
    // Validate the demographicData section using the FormDataSchema
    const validationResult = FormDataSchema.pick({
      demographicData: true,
    }).safeParse(formData);

    if (validationResult.success) {
      // If validation succeeds, proceed to the next screen
      setErrors(null); // Clear any previous errors
      router.push('/account-details');
    } else {
      // If validation fails, display the errors
      setErrors(validationResult.error);
      alert('Please complete all required fields correctly.');
    }
  };

  const handleHouseholdNoChange = (value: string) => {
    setFormData({
      ...formData,
      demographicData: {
        ...formData.demographicData,
        householdNo: value,
      },
    });
  };

  const handleFamilyNoChange = (value: string) => {
    setFormData({
      ...formData,
      demographicData: {
        ...formData.demographicData,
        familyNo: value,
      },
    });
  };

  return (
    <_ScreenLayout
      header={'Demographic Data'}
      description={'Please fill out all required fields.'}
    >
      <View className="flex-1">
        <View className="flex-1 flex-col gap-3">
          {/* Input Fields */}
          <View>
            <Text className="text-[16px] font-PoppinsRegular">Household No.</Text>
            <Input
              className="h-[57px] font-PoppinsRegular text-[15px]"
              placeholder="Household No."
              value={formData.demographicData.householdNo}
              onChangeText={handleHouseholdNoChange}
            />
            {/* Display validation error for Household No. */}
            {errors?.issues.find((issue) => issue.path.includes("demographicData.householdNo")) && (
              <Text className="text-red-500 text-sm">
                {errors.issues.find((issue) => issue.path.includes("demographicData.householdNo"))?.message}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-[16px] font-PoppinsRegular">Family No.</Text>
            <Input
              className="h-[57px] font-PoppinsRegular text-[15px]"
              placeholder="Family No. (Leave blank if none)"
              value={formData.demographicData.familyNo}
              onChangeText={handleFamilyNoChange}
            />
            {/* Display validation error for Family No. */}
            {errors?.issues.find((issue) => issue.path.includes("demographicData.familyNo")) && (
              <Text className="text-red-500 text-sm">
                {errors.issues.find((issue) => issue.path.includes("demographicData.familyNo"))?.message}
              </Text>
            )}
          </View>
        </View>

        {/* Next Button */}
        <View>
          <Button
            onPress={handleProceed}
            className="bg-primaryBlue native:h-[57px]"
          >
            <Text className="text-white font-bold text-[16px]">Next</Text>
          </Button>
        </View>
      </View>
    </_ScreenLayout>
  );
}