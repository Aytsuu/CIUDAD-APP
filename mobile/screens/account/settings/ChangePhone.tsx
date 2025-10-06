import { TouchableOpacity, View, Text, Alert } from "react-native";
import PageLayout from "@/screens/_PageLayout";
import PhoneOTP from "../../auth/signup/account/PhoneOTP";
import { router } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateAccount } from "../queries/accountUpdateQueries";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { KeychainService } from "@/services/keychainService";
import React from "react";
import { LoadingModal } from "@/components/ui/loading-modal";

export default function ChangePhone() {
  const { user } = useAuth();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { getValues, reset } = useRegistrationFormContext();
  const [isChanging, setIsChanging] = React.useState<boolean>(false);

  const submit = async () => {
    try {
      setIsChanging(true)
      const isAuthenticated = await KeychainService.authenticate(
        "Confirm phone change with your device passcode"
      )
  
      if(!isAuthenticated) {
        Alert.alert('Authentication Failed', 'Please try again.');
        return false;
      }

      await updateAccount({
        data: {
          phone: getValues("accountFormSchema.phone")
        }, 
        accId: user?.acc_id as any
      })

      router.back()
      reset()
    } finally {
      setIsChanging(false);
    }
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
          next: submit
        }}
      />

      <LoadingModal visible={isChanging}/>
    </PageLayout>
  )
}