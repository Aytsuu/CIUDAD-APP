import PageLayout from "@/screens/_PageLayout";
import { TouchableOpacity, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import React from "react";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import PersonalInformation from "@/screens/auth/signup/PersonalInformation";
import isEqual from "lodash.isequal";
import { useToastContext } from "@/components/ui/toast";
import { uppercaseAll } from "@/helpers/caseHelper";
import { useGetPersonalModificationReq } from "../../queries/accountFetchQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { FeedbackScreen } from "@/components/ui/feedback-screen";

export default function UpdateInformation() {
  // ===================== STATE INITIALIZATION =====================
  const params = useLocalSearchParams();
  const data = React.useMemo(() => JSON.parse(params?.data as string), [params])
  const { toast } = useToastContext();
  const { getValues, reset, setValue, formState } = useRegistrationFormContext();
  const { data: personalModReq, isLoading } = useGetPersonalModificationReq(data?.per_id);

  // ===================== SIDE EFFECTS =====================
  React.useEffect(() => {
    if(data) {
      Object.entries(data).map(([key, val]) => {
        setValue(`personalInfoSchema.${key}` as any, typeof val == "string" ? val.toLowerCase() : val)
      })
    }
  }, [data]) 

  // ===================== HANDLERS =====================
  const submit = () => {
    const personal = uppercaseAll(getValues("personalInfoSchema"))
    if(isEqual(data, personal)) {
      toast.info("No changes were made")
      router.back();
      return;
    }

    router.push("/(account)/settings/personal/scan");
  }

  // ===================== RENDER =====================
  if(isLoading) {
    return <LoadingState />
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Update Information</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      {personalModReq ? (
        <FeedbackScreen 
          status="waiting"
        />  
      ) : (
        <PersonalInformation
          params={{
            name: "personalInfoSchema",
            buttonLabel: "Save and Continue",
            submit: submit
          }}
        />
      )}
    </PageLayout>
  )
}