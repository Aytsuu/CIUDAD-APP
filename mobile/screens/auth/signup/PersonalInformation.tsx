import "@/global.css";
import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import Layout from "./_layout";
import { FormInput } from "@/components/ui/form/form-input";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { FormSelect } from "@/components/ui/form/form-select";

const sexOptions: { label: string; value: string }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const civilStatusOptions: { label: string; value: string }[] = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Widowed", value: "widowed" },
];

export default function PersonalInformation() {
  const router = useRouter();
  const { control, trigger} = useRegistrationFormContext()

  const handleSubmit = async () => {
    const formIsValid = await trigger(
      ["personalInfoSchema.per_lname", 
        "personalInfoSchema.per_fname", 
        "personalInfoSchema.per_mname", 
        "personalInfoSchema.per_suffix",
        "personalInfoSchema.per_sex", 
        "personalInfoSchema.per_status",
        "personalInfoSchema.per_address",
        "personalInfoSchema.per_edAttainment",
        "personalInfoSchema.per_religion",
        "personalInfoSchema.per_contact",
        "personalInfoSchema.per_occupation"]);

    if(formIsValid) {
      router.push('/(auth)/take-a-photo');
    };
  }

  return (
    <Layout
      header={"Personal Information"}
      description={"Please fill out all required fields."}
    >
      <View className="flex-1 justify-between gap-7">
        <View className="flex-1 flex-col">
          <FormInput 
            control={control} 
            label="Last Name" 
            name="personalInfoSchema.per_lname" 
            placeholder="Last Name" 
          />
          <FormInput 
            control={control} 
            label="First Name" 
            name="personalInfoSchema.per_fname" 
            placeholder="First Name"
          />
          <FormInput 
            control={control} 
            label="Middle Name" 
            name="personalInfoSchema.per_mname" 
            placeholder="Middle Name"
          />
            
          <FormInput 
            control={control} 
            label="Suffix" 
            name="personalInfoSchema.per_suffix" 
            placeholder="Suffix (e.g., Jr, Sr)"
          />
          <FormSelect
            control={control}
            name="personalInfoSchema.per_sex"
            options={sexOptions}
            label="Sex"
            className="min-w-[45%]"
            contentClassName="w-[41%]"
          />
          <FormSelect
            control={control}
            name="personalInfoSchema.per_status"
            options={civilStatusOptions}
            label="Marital Status"
            className="min-w-[45%]"
            contentClassName="w-[41%]"
          />
          <FormInput 
            control={control} 
            label="Address" 
            name="personalInfoSchema.per_address" 
            placeholder="Address"
          />
          <FormInput 
            control={control} 
            label="Educational Attainment" 
            name="personalInfoSchema.per_edAttainment" 
            placeholder="Educational Attainment"
          />
          <FormInput 
            control={control} 
            label="Religion" 
            name="personalInfoSchema.per_religion" 
            placeholder="Religion"
          />
          <FormInput 
            control={control} 
            label="Contact" 
            name="personalInfoSchema.per_contact" 
            placeholder="Contact"
          />
          <FormInput 
            control={control} 
            label="Occupation" 
            name="personalInfoSchema.per_occupation" 
            placeholder="Occupation"
          />        
        </View>

        {/* Next Button */}
        <View className="pb-[3rem]">
          <Button
            onPress={handleSubmit}
            className="bg-primaryBlue native:h-[57px] w-full"
          >
            <Text className="text-white font-PoppinsMedium text-[16px]">
              Next
            </Text>
          </Button>
        </View>
      </View>
    </Layout>
  );
}