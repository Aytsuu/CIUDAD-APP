import { TouchableOpacity, View, Text } from "react-native";
import PageLayout from "../_PageLayout";
import PhoneOTP from "../auth/signup/account/PhoneOTP";
import { router } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateAccount } from "./queries/updateQueries";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";

export default function ChangePhone() {
  const { user } = useAuth();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { getValues } = useRegistrationFormContext();

  const submit = async () => {
    await updateAccount({
      data: {
        phone: getValues("accountFormSchema.phone")
      }, 
      accId: user?.acc_id as any
    })

    router.back()
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-black text-[13px]">Phone Verification</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <PhoneOTP 
        params={{
          next: () => submit()
        }}
      />
    </PageLayout>
  )
}