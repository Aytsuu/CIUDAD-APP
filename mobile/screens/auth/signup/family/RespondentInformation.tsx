import PageLayout from "@/screens/_PageLayout";
import PersonalInformation from "../PersonalInformation";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { router } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { TouchableOpacity, Text, ScrollView, View } from "react-native";
import { useProgressContext } from "@/contexts/ProgressContext";
import React from "react";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";

export default function RespondentInformation() {
  const { completeStep } = useProgressContext();

  const submit = () => {
    completeStep(2)
    router.replace("/registration/family/register-new");
  }
  
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Respondent Information</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <PersonalInformation params={{
          name: "personalInfoSchema",
          buttonLabel: "Continue",
          submit: () => submit()
        }}/>
      </ScrollView>
    </PageLayout>
  )
}