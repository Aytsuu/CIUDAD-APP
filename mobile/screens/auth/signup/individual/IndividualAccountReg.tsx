import React from "react";
import { useRouter } from "expo-router";
import AccountDetails from "../AccountDetails";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import PageLayout from "@/screens/_PageLayout";
import { TouchableOpacity, Text} from "react-native";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { X } from "@/lib/icons/X";
import { useRegistrationTypeContext } from "@/contexts/RegistrationTypeContext";

export default function IndividualAccountReg() {
  const router = useRouter();
  const { reset } = useRegistrationFormContext();
  const { type } = useRegistrationTypeContext();

  const submit = () => {
   router.push('/registration/individual/information');
  }

  const handleClose = () => {
    reset();
    router.replace("/(auth)");
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Account Details</Text>}
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
      <AccountDetails submit={submit}/>
    </PageLayout>
  )
}