import PageLayout from "@/screens/_PageLayout";
import PersonalInformation from "../PersonalInformation";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { router } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { TouchableOpacity, Text, ScrollView, View } from "react-native";
import { useProgressContext } from "@/contexts/ProgressContext";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import React from "react";

export default function GuardianInformation() {
  const { setValue, getValues, resetField } = useRegistrationFormContext();
  const { 
    completeStep, 
    completedSteps, 
    linkedTo,
    isRespondentLinked,
    link, 
    unlink
  } = useProgressContext();

  React.useEffect(() => {
    const role = getValues('guardianInfoSchema.role')
    if(role == "") setValue('guardianInfoSchema.role', 'Guardian')
  }, [])

  const linkRespondent = () => {
    const respondent = getValues('personalInfoSchema');
    setValue('guardianInfoSchema', {
      ...respondent,
      role: "Guardian"
    });

    link(5);
    submit();
  }

  const unlinkRespondent = () => {
    resetField('guardianInfoSchema');
    unlink(5);
  }

  const submit = () => {
    completeStep(5)
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Guardian Information</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {completedSteps.includes(2) && !isRespondentLinked &&
          <View className="flex-1 flex-row px-5 mb-5">
            <View className="flex-1 bg-primaryBlue rounded-lg p-4 gap-4">
              <Text className="text-white text-sm">Are you the the one who's filling out this form? If yes, you can skip re-entering your information by simply pressing</Text>
              <TouchableOpacity
                onPress={linkRespondent}
              >
                <Text>Link to respondent</Text>
              </TouchableOpacity>
            </View>
          </View>
        }

        {linkedTo === 5 && 
          <View className="flex-1 flex-row px-5 mb-5">
            <View className="flex-1 bg-primaryBlue rounded-lg p-4 gap-4">
              <Text className="text-white text-sm">This form has been linked to respondent information</Text>
              <TouchableOpacity
                onPress={unlinkRespondent}
              >
                <Text>Unlink</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        
        <PersonalInformation params={{
          name: "guardianInfoSchema",
          buttonLabel: "Continue",
          submit: submit
        }}/>
      </ScrollView>
    </PageLayout>
  )
}