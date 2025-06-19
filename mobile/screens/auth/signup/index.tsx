import "@/global.css";
import _ScreenLayout from "@/screens/_ScreenLayout";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Button } from "@/components/ui/button";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { X } from "@/lib/icons/X";
import { Calendar } from "@/lib/icons/Calendar";

export default () => {
  const router = useRouter();
  const { control, trigger, formState: { errors } } = useRegistrationFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formIsValid = await trigger(["verificationSchema.dob"]);

      if (formIsValid) {
        router.push("/(auth)/personal-information");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    Alert.alert(
      "Exit Registration",
      "Are you sure you want to exit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: () => router.push("/") }
      ]
    );
  };

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Verifying Age</Text>}
      customRightAction={
        <TouchableOpacity onPress={() => router.replace("/(auth)")}>
          <X className="text-black" />
        </TouchableOpacity>
      }
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 py-4">
          {/* Header Section */}
          <View className="mb-8">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Calendar size={32} className="text-primaryBlue" />
              </View>
            </View>
            
            <Text className="text-xl font-PoppinsSemiBold text-gray-900 text-center mb-3">
              Age Verification
            </Text>
            
            <Text className="text-[14px] font-PoppinsRegular text-gray-600 text-center leading-6">
              We need to verify your age to ensure you meet the minimum requirements for our services.
            </Text>
          </View>

          {/* Form Section */}
          <View className="flex-1">
            <FormDateInput 
              control={control}
              name="verificationSchema.dob"
              label="Date of Birth"
            />
          </View>

          {/* Action Buttons */}
          <View className="pt-4">
            <Button 
              onPress={handleSubmit} 
              disabled={isSubmitting}
              className={`native:h-[56px] rounded-xl ${
                isSubmitting ? 'bg-gray-400' : 'bg-primaryBlue'
              }`}
            >
              <Text className="text-white font-PoppinsSemiBold text-[16px]">
                {isSubmitting ? 'Verifying...' : 'Continue'}
              </Text>
            </Button>
            
            <Text className="text-xs font-PoppinsRegular text-gray-500 text-center mt-4 leading-5">
              By continuing, you confirm that the information provided is accurate and you agree to our Terms of Service.
            </Text>
          </View>
        </View>
      </ScrollView>
    </_ScreenLayout>
  );
};