import PageLayout from "@/screens/_PageLayout";
import PersonalInformation from "../PersonalInformation";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { TouchableOpacity, Text, ScrollView, View } from "react-native";
import { useProgressContext } from "@/contexts/ProgressContext";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import React from "react";
import { Link } from "@/lib/icons/Link";
import { Unlink } from "@/lib/icons/Unlink";

export default function FatherInformation() {
  const { setValue, getValues, resetField } = useRegistrationFormContext();
  const {
    completeStep,
    completedSteps,
    linkedTo,
    isRespondentLinked,
    link,
    unlink,
  } = useProgressContext();

  React.useEffect(() => {
    const role = getValues("fatherInfoSchema.role");
    if (role == "") setValue("fatherInfoSchema.role", "Father");
  }, []);

  const linkRespondent = () => {
    const respondent = getValues("personalInfoSchema");
    setValue("fatherInfoSchema", {
      ...respondent,
      role: "Father",
    });

    link(3);
    submit();
  };

  const unlinkRespondent = () => {
    resetField("fatherInfoSchema");
    unlink(3);
  };

  const submit = () => {
    completeStep(3);
    router.replace("/registration/family/register-new");
  };

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
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Father Information</Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {completedSteps.includes(2) && !isRespondentLinked && (
          <View className="flex-1 flex-row px-5 mb-5">
            <View className="flex-1 bg-gray-200 rounded-lg shadow-sm p-4 gap-4">
              <Text className="text-gray-700 font-medium text-sm">
                Are you the respondent filling out this form? If yes, link
                information by pressing:
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={linkRespondent}
                  className="px-6 py-2 bg-blue-950 rounded-full flex-row items-center gap-3"
                >
                  <Link size={16} className="text-white" />
                  <Text className="text-white text-sm font-medium">Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {linkedTo === 3 && (
          <View className="flex-1 flex-row px-5 mb-5">
            <View className="flex-1 bg-gray-200 rounded-lg shadow-sm p-4 gap-4">
              <Text className="text-gray-700 font-medium text-sm">
                This form has been linked to respondent information
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={unlinkRespondent}
                  className="px-6 py-2 bg-red-500 rounded-full flex-row items-center gap-3"
                >
                  <Unlink size={16} className="text-white" />
                  <Text className="text-white text-sm font-medium">Unlink</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <PersonalInformation
          params={{
            name: "fatherInfoSchema",
            buttonLabel: "Continue",
            submit: submit,
          }}
        />
      </ScrollView>
    </PageLayout>
  );
}
