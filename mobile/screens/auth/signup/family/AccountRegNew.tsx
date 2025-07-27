import React from "react";
import AccountDetails from "../AccountDetails";
import PageLayout from "@/screens/_PageLayout";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { useProgressContext } from "@/contexts/ProgressContext";

export default function AccountRegNew() {
  const {
    completeStep
  } = useProgressContext();

  const submit = () => {
    completeStep(1)
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Account Details</Text>}
      rightAction={<View className="w-10 h-10"/>}
    >
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <AccountDetails submit={submit}/>
      </ScrollView>
    </PageLayout>
  )
}