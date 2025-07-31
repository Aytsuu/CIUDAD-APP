import React from "react"
import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/ui/confirmationModal"
import { FormInput } from "@/components/ui/form/form-input"
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { X } from "@/lib/icons/X"
import PageLayout from "@/screens/_PageLayout"
import { useRouter } from "expo-router"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import PersonalInformation from "../PersonalInformation"
import ScanID from "../ScanID"

export default function BusinessRespondent() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = React.useState<boolean>(false);
  
  const handleClose = () => {
    router.replace("/(auth)")
  }

  const next = async () => {
    
  }

  // RENDER
  const VerifyIdentity = (
    <View className="flex-1">
      <ScanID
        params={{
          next: next
        }}
      />
      <TouchableOpacity
        className="absolute top-10 right-5 mt-4 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
        accessibilityLabel="Exit registration"
        onPress={() => setIsVerifying(false)}
      >
        <X size={20} className="text-black" />
      </TouchableOpacity>
    </View>
  );

  const MainContent = (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">
          Business Respondent
        </Text>
      }
      rightAction={
        <ConfirmationModal
          title="Exit Registration"
          description="Are you sure you want to exit? Your progress will be lost."
          trigger={
            <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
              <X size={20} className="text-gray-700" />
            </TouchableOpacity>
          }
          variant="destructive"
          onPress={handleClose}
        />
      }
    >
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <PersonalInformation 
          params={{
            submit: () => setIsVerifying(true),
            buttonLabel: 'Continue'
          }}
        />
      </ScrollView>
    </PageLayout>
  )

  return (isVerifying ? VerifyIdentity : MainContent)
}
