// import PageLayout from "@/screens/_PageLayout"
// import { Text, View, TouchableOpacity } from "react-native"
// import { ChevronLeft } from "@/lib/icons/ChevronLeft"
// import { Search } from "@/lib/icons/Search"
// import { useRouter } from "expo-router"
// import { useState } from "react"
// import ResidentPending from "./pending"

// type TabType = "pending" | "accepted" | "completed" | "rejected" | "cancelled"

// export default function GarbagePickupHome() {
//   const router = useRouter()
//   const [activeTab, setActiveTab] = useState<TabType>("pending")
//   const [refreshing, setRefreshing] = useState(false)

//   const tabs = [
//     { key: "pending" as TabType, label: "Pending" },
//     { key: "accepted" as TabType, label: "Accepted" },
//     { key: "completed" as TabType, label: "Completed" },
//     { key: "rejected" as TabType, label: "Rejected" },
//     { key: "cancelled" as TabType, label: "Cancelled" },
//   ]

//   const onRefresh = () => {
//     setRefreshing(true)
//     // Simulate API call
//     setTimeout(() => {
//       setRefreshing(false)
//     }, 1500)
//   }

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "pending":
//         return <ResidentPending />
//       case "accepted":
//         return (
//           <View className="flex-1 items-center justify-center">
//             <Text className="text-gray-500 text-base">No accepted requests</Text>
//           </View>
//         )
//       case "completed":
//         return (
//           <View className="flex-1 items-center justify-center">
//             <Text className="text-gray-500 text-base">No completed requests</Text>
//           </View>
//         )
//       case "rejected":
//         return (
//           <View className="flex-1 items-center justify-center">
//             <Text className="text-gray-500 text-base">No rejected requests</Text>
//           </View>
//         )
//       case "cancelled":
//         return (
//           <View className="flex-1 items-center justify-center">
//             <Text className="text-gray-500 text-base">No cancelled requests</Text>
//           </View>
//         )
//       default:
//         return null
//     }   
//   }

//   return (
//     <PageLayout
//       leftAction={
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
//         >
//           <ChevronLeft size={24} className="text-gray-700" />
//         </TouchableOpacity>
//       }
//       headerTitle={<Text className="text-gray-900 text-[13px]">Garbage Pickup</Text>}
//       rightAction={
//         <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//           <Search size={22} className="text-gray-700" />
//         </TouchableOpacity>
//       }
//     >
//       <View className="flex-1">
//         <View className="flex-row bg-white border-b border-gray-200">
//           {tabs.map((tab) => (
//             <TouchableOpacity
//               key={tab.key}
//               onPress={() => setActiveTab(tab.key)}
//               className={`flex-1 py-4 items-center border-b-2 ${
//                 activeTab === tab.key ? "border-blue-500" : "border-transparent"
//               }`}
//             >
//               <Text className={`text-sm font-medium ${activeTab === tab.key ? "text-blue-600" : "text-gray-500"}`}>
//                 {tab.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View className="flex-1 bg-gray-50">
//           {renderTabContent()}
//         </View>
//       </View>
//     </PageLayout>
//   )
// }

import PageLayout from "@/screens/_PageLayout"
import { Text, View, TouchableOpacity, ScrollView } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { Search } from "@/lib/icons/Search"
import { useRouter } from "expo-router"
import { useState } from "react"
import ResidentPending from "./tabs/pending"
import ResidentRejected from "./tabs/rejected"
import ResidentCancelled from "./tabs/cancelled"

type TabType = "pending" | "accepted" | "completed" | "rejected" | "cancelled"

export default function GarbagePickupHome() {
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
        return (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-gray-500 text-base">No accepted requests</Text>
          </View>
        )
      case "completed":
        return (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-gray-500 text-base">No completed requests</Text>
          </View>
        )
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
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
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