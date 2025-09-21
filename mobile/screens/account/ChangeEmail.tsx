import { TouchableOpacity, View, Text } from "react-native";
import PageLayout from "../_PageLayout";
import { router } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateAccount } from "./queries/updateQueries";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import EmailOTP from "../auth/signup/account/EmailOTP";

export default function ChangeEmail() {
  const { user } = useAuth();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { getValues } = useRegistrationFormContext();

  const submit = async () => {
    await updateAccount({
      data: {
        email: getValues("accountFormSchema.email")
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
      headerTitle={<Text className="text-black text-[13px]">Email Verification</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <EmailOTP 
        params={{
          next: () => submit(),
          isChangeEmail: true,
        }}
      />
    </PageLayout>
  )
}