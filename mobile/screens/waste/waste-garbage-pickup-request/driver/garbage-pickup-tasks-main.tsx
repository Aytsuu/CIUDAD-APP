import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import GarbagePickupTasks from "./garbage-pickup-tasks";
import GarbageCompletedTasks from "./garbage-pickup-completed-tasks";

export default function GarbagePickupTasksMain() {
  const [activeTab, setActiveTab] = useState<"pickup" | "completed">("pickup");
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Garbage Pickup Tasks</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50">
        {/* Tabs */}
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === "pickup" ? "border-blue-500" : "border-transparent"
              }`}
              onPress={() => setActiveTab("pickup")}
            >
              <Text className={`font-medium ${activeTab === "pickup" ? "text-blue-600" : "text-gray-500"}`}>
                Pickup Tasks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === "completed" ? "border-blue-500" : "border-transparent"
              }`}
              onPress={() => setActiveTab("completed")}
            >
              <Text className={`font-medium ${activeTab === "completed" ? "text-blue-600" : "text-gray-500"}`}>
                Completed Tasks
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="flex-1">
          {activeTab === "pickup" && (
            <GarbagePickupTasks/>
          )}
          {activeTab === "completed" && (
             <GarbageCompletedTasks/>
          )}
        </View>
      </View>
    </PageLayout>
  );
}