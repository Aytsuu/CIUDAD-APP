// import { useState } from "react";
// import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
// import { ChevronLeft } from "lucide-react-native";
// import { useRouter } from "expo-router";
// import PendingGarbageRequest from "./tabs/pending-tab";
// import AcceptedGarbagePickupRequest from "./tabs/accepted-tab";
// import RejectedGarbageRequest from "./tabs/rejected-tab";
// import CompletedGarbageRequest from "./tabs/completed-tab";
// import PageLayout from "@/screens/_PageLayout";

// const PendingTable = () => (
//   <View className="flex-1">
//     <PendingGarbageRequest />
//   </View>
// );

// const AcceptedTable = () => (
//   <View className="flex-1">
//     <AcceptedGarbagePickupRequest />
//   </View>
// );

// const CompletedTable = () => (
//   <View className="flex-1">
//     <CompletedGarbageRequest />
//   </View>
// );

// const RejectedTable = () => (
//   <View className="flex-1">
//     <RejectedGarbageRequest />
//   </View>
// );

// export default function GarbagePickupMain() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState("pending");

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "pending":
//         return <PendingTable />;
//       case "accepted":
//         return <AcceptedTable />;
//       case "completed":
//         return <CompletedTable />;
//       case "rejected":
//         return <RejectedTable />;
//       default:
//         return <PendingTable />;
//     }
//   };

//   return (
//       <PageLayout
//             leftAction={
//                 <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//                     <ChevronLeft size={24} className="text-gray-700" />
//                 </TouchableOpacity>
//             }
//             headerTitle={<Text className="text-gray-900 text-[13px]">Garbage Pickup Requests</Text>}
//             rightAction={
//                 <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
//             }
//       >

//       {/* Tabs */}
//       <View className = "px-4">
//         <View className="flex-row justify-between mb-4 bg-white rounded-lg p-1 border border-gray-100">
//           <TouchableOpacity onPress={() => setActiveTab("pending")}
//             className={`flex-1 py-2 px-2 rounded-md ${
//               activeTab === "pending"
//                 ? "bg-yellow-100 border border-yellow-300"
//                 : ""
//             }`}
//           >
//             <Text
//               className={`text-center font-medium ${
//                 activeTab === "pending" ? "text-yellow-800" : "text-gray-600"
//               }`}
//             >
//               Pending
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => setActiveTab("accepted")}
//             className={`flex-1 py-2 px-2 rounded-md ${
//               activeTab === "accepted"
//                 ? "bg-[#5B72CF]/20 border border-[#5B72CF]"
//                 : ""
//             }`}
//           >
//             <Text
//               className={`text-center font-medium ${
//                 activeTab === "accepted" ? "text-[#5B72CF]" : "text-gray-600"
//               }`}
//             >
//               Accepted
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => setActiveTab("completed")}
//             className={`flex-1 py-2 px-2 rounded-md ${
//               activeTab === "completed"
//                 ? "bg-green-100 border border-green-300"
//                 : ""
//             }`}
//           >
//             <Text
//               className={`text-center font-medium ${
//                 activeTab === "completed" ? "text-green-800" : "text-gray-600"
//               }`}
//             >
//               Completed
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => setActiveTab("rejected")}
//             className={`flex-1 py-2 px-2 rounded-md ${
//               activeTab === "rejected"
//                 ? "bg-red-100 border border-red-300"
//                 : ""
//             }`}
//           >
//             <Text
//               className={`text-center font-medium ${
//                 activeTab === "rejected" ? "text-red-800" : "text-gray-600"
//               }`}
//             >
//               Rejected
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Tab Content */}
//       <View className="flex-1 bg-white rounded-lg shadow-sm p-4">
//         {renderTabContent()}
//       </View>
//     </PageLayout>
//   );
// }


"use client"

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
        <View className="flex-1 bg-white rounded-lg shadow-sm p-4">{renderTabContent()}</View>
      </View>
    </PageLayout>
  )
}
