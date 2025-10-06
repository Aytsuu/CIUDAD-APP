import { TouchableOpacity, View, Text } from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import Phone from '@/assets/icons/essentials/phone.svg'
import Mail from '@/assets/icons/essentials/mail.svg'
import SecurityLock from '@/assets/icons/essentials/security-lock.svg'
import PageLayout from "@/screens/_PageLayout";
import { useAuth } from "@/contexts/AuthContext";

export default () => {
  const { user } = useAuth();

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
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-2">
            <Phone width={35} height={20}/>
            <View className="flex">
              <Text className="text-[14px] text-gray-800">Phone Number</Text>
              <Text className="text-sm text-gray-500">+63 {user?.phone && +user?.phone}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/(account)/settings/change-phone")}>
            <Text className="text-sm font-medium text-primaryBlue">Change</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-2">
            <Mail width={35} height={20}/>
            <View>
              <Text className="text-[14px] text-gray-800">Email Address</Text>
              <Text className="text-sm text-gray-500">{user?.email || "No email added"}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/(account)/settings/change-email")}>
            <Text className="text-sm font-medium text-primaryBlue">{user?.email ? "Change" : "Add"}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-2">
            <SecurityLock width={35} height={20}/>
            <View>
              <Text className="text-[14px] text-gray-800">Password</Text>
              <Text className="text-sm text-gray-500">**********</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/(account)/settings/change-password")}>
            <Text className="text-sm font-medium text-primaryBlue">Change</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageLayout>
  )
}