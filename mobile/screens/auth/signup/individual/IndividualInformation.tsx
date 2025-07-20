import PageLayout from "@/screens/_PageLayout";
import PersonalInformation from "../PersonalInformation";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { X } from "@/lib/icons/X";
import React from "react";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";

export default function IndividualInformation() {
  const { reset } = useRegistrationFormContext();

  const handleClose = React.useCallback(async () => {
    router.replace("/(auth)");
    reset();
  }, [router]);

  const submit = () => {
    router.push("/registration/individual/scan");
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Personal Information</Text>}
      rightAction={
        <ConfirmationModal
          title="Exit Registration"
          description="Are you sure you want to exit? Your progress will be lost."
          trigger={
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              accessibilityLabel="Exit registration"
            >
              <X size={20} className="text-gray-700" />
            </TouchableOpacity>
          }
          variant="destructive"
          onPress={handleClose}
        />
      }
    >
      <ScrollView>
        <PersonalInformation
          params={{
            name: "personalInfoSchema",
            buttonLabel: "Save and Continue",
            submit: submit
          }}
        />
      </ScrollView>
    </PageLayout>
  )
}