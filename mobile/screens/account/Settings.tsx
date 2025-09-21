import { TouchableOpacity, View, Text } from "react-native";
import PageLayout from "../_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import UserLock from '@/assets/icons/essentials/user-lock.svg'
import Phone from '@/assets/icons/essentials/phone.svg'
import Mail from '@/assets/icons/essentials/mail.svg'
import SecurityLock from '@/assets/icons/essentials/security-lock.svg'

export default function Settings() {
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
      headerTitle={<Text className="text-black text-[13px]">Settings</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-6 gap-3 py-2">
        <TouchableOpacity
          className="flex-row items-center justify-between py-3"
          activeOpacity={1}
          
        >
          <View className="flex-row items-center gap-2">
            <UserLock width={35} height={20}/>
            <Text className="text-[14px] text-gray-800">Personal Information</Text>
          </View>
          <ChevronRight className="text-primaryBlue"/>
        </TouchableOpacity>
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-2">
            <Phone width={35} height={20}/>
            <Text className="text-[14px] text-gray-800">Phone Number</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(account)/settings/change-phone")}>
            <Text className="text-sm font-medium text-primaryBlue">Change</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-2">
            <Mail width={35} height={20}/>
            <Text className="text-[14px] text-gray-800">Email Address</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(account)/settings/change-email")}>
            <Text className="text-sm font-medium text-primaryBlue">Change</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-2">
            <SecurityLock width={35} height={20}/>
            <Text className="text-[14px] text-gray-800">Password</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(account)/settings/change-password")}>
            <Text className="text-sm font-medium text-primaryBlue">Change</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageLayout>
  )
}