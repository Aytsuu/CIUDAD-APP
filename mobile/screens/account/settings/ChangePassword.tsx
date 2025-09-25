import { TouchableOpacity, View, Text } from "react-native";
import PageLayout from "@/screens/_PageLayout";;
import { router } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateAccount } from "../queries/accountUpdateQueries";
import AccountDetails from "@/screens/auth/signup/account/AccountDetails";

export default function ChangePassword() {
  const { user } = useAuth();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { getValues, reset } = useRegistrationFormContext();

  const submit = async () => {
    await updateAccount({
      data: {
        password: getValues("accountFormSchema.password")
      }, 
      accId: user?.acc_id as any
    })

    router.back()
    reset()
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
      headerTitle={<Text className="text-black text-[13px]">Change Password</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <AccountDetails
        params={{
          next: submit
        }}
      />
    </PageLayout>
  )
}