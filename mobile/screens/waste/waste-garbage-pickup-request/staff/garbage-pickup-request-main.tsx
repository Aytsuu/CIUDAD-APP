import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { ChevronLeft } from "lucide-react-native"
import { useRouter } from "expo-router"
import PendingGarbageRequest from "./tabs/pending-tab"
import AcceptedGarbagePickupRequest from "./tabs/accepted-tab"
import RejectedGarbageRequest from "./tabs/rejected-tab"
import CompletedGarbageRequest from "./tabs/completed-tab"
import PageLayout from "@/screens/_PageLayout"

const PendingTable = () => (
  <View className="flex-1">
    <PendingGarbageRequest />
  </View>
)

const AcceptedTable = () => (
  <View className="flex-1">
    <AcceptedGarbagePickupRequest />
  </View>
)

const CompletedTable = () => (
  <View className="flex-1">
    <CompletedGarbageRequest />
  </View>
)

const RejectedTable = () => (
  <View className="flex-1">
    <RejectedGarbageRequest />
  </View>
)

export default function GarbagePickupMain() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pending")

  const tabs = [
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "completed", label: "Completed" },
    { key: "rejected", label: "Rejected" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "pending":
        return <PendingTable />
      case "accepted":
        return <AcceptedTable />
      case "completed":
        return <CompletedTable />
      case "rejected":
        return <RejectedTable />
      default:
        return <PendingTable />
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
      wrapScroll={false}
      headerTitle={<Text className="text-gray-900 text-[13px]">Garbage Pickup Requests</Text>}
      rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>}
    >
      <View className="bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-4 items-center border-b-2 ${
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

      {/* Tab Content */}
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 bg-white rounded-lg shadow-sm p-6">{renderTabContent()}</View>
      </View>
    </PageLayout>
  )
}
