import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import PageLayout from "@/screens/_PageLayout";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import PhoneOTP from "./PhoneOTP";
import AccountDetails from "./AccountDetails";
import EmailOTP from "./EmailOTP";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";

export default function AccountSetup({ params } : {
  params: Record<string, any>
}){
  const { reset } = useRegistrationFormContext();
  const [currentStep, setCurrentStep] = React.useState<number>(
    params?.isFamilyRegistration && params?.complete ? 3 : 1
  )

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => {
            if(currentStep > 1) {
              if(params?.isFamilyRegistration && params?.complete) router.back()
              else setCurrentStep((prev)=>prev-1);
            }
            else {
              router.back()
              if(!params?.isFamilyRegistration) reset();
            }
          }}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Account Setup ({currentStep}/{3})</Text>}
      rightAction={<View className="w-10 h-10"/>
      }
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        className="flex-1"
      >
        {currentStep == 1 && 
          <PhoneOTP 
            params={{
              next: () => setCurrentStep((prev) => prev + 1)
            }}
          />
        }
        {currentStep == 2 && 
          <EmailOTP 
            params={{
              next: () => setCurrentStep((prev) => prev + 1)
            }}
          />
        }
        {currentStep == 3 && 
          <AccountDetails 
            params={{
              next: () => params.next()
            }}
          />
        }
      </ScrollView>
    </PageLayout>
  )
}