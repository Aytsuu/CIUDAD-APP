import PageLayout from "@/screens/_PageLayout"
import { Text, View, TouchableOpacity, ScrollView } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { useRouter } from "expo-router"
import { useState } from "react"
import ResidentPending from "./tabs/pending"
import ResidentRejected from "./tabs/rejected"
import ResidentCancelled from "./tabs/cancelled"
import ResidentAccepted from "./tabs/accepted"
import ResidentCompleted from "./tabs/completed"

type TabType = "pending" | "accepted" | "completed" | "rejected" | "cancelled"

export default function GarbagePickupTrackingMain() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("pending")

  const tabs = [
    { key: "pending" as TabType, label: "Pending" },
    { key: "accepted" as TabType, label: "Accepted" },
    { key: "completed" as TabType, label: "Completed" },
    { key: "rejected" as TabType, label: "Rejected" },
    { key: "cancelled" as TabType, label: "Cancelled" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "pending":
        return <ResidentPending />
      case "accepted":
        return <ResidentAccepted/>
      case "completed":
        return <ResidentCompleted/>
      case "rejected":
        return <ResidentRejected/>
      case "cancelled":
        return <ResidentCancelled/>
      default:
        return null
    }   
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Garbage Pickup</Text>}
      rightAction={
        <View className="w-10 h-10 "></View>
      }
    >
      <View className="flex-1">
        {/* Horizontally scrollable tabs - Fixed spacing */}
        <View className="bg-white border-b border-gray-200">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`px-3 py-4 mx-1 items-center border-b-2 ${
                  activeTab === tab.key ? "border-blue-500" : "border-transparent"
                }`}
              >
                <Text className={`text-sm font-medium ${activeTab === tab.key ? "text-blue-600" : "text-gray-500"}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="flex-1 bg-gray-50">
          {renderTabContent()}
        </View>
      </View>
    </PageLayout>
  )
}