import PageLayout from "@/screens/_PageLayout";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";import { useRouter } from "expo-router";
import { useState } from "react";
import RatesPage1 from "./rates-page-1";
import RatesPage2 from "./rates-page-2";
import RatesPage3 from "./rates-page-3";
import RatesPage4 from "./rates-page-4";

type TabType = "annual-gross-sales" | "personal" | "service-charges" | "barangay-permits";

export default function PurposeAndRatesMain() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("annual-gross-sales");

  const tabs = [
    { key: "annual-gross-sales" as TabType, label: "Annual Gross Sales" },
    { key: "personal" as TabType, label: "Personal" },
    { key: "service-charges" as TabType, label: "Service Charges" },
    { key: "barangay-permits" as TabType, label: "Barangay Permits" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "annual-gross-sales":
        return <RatesPage1 />;
      case "personal":
        return <RatesPage2 />;
      case "service-charges":
        return <RatesPage3 />;
      case "barangay-permits":
        return <RatesPage4 />;
      default:
        return <RatesPage1 />;
    }
  };

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Rates</Text>}
    >
      <View className="flex-1">
        {/* Horizontally scrollable tabs - Fixed spacing */}
        <View className="bg-white border-b border-gray-200">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`px-3 py-4 items-center border-b-2 ${
                  activeTab === tab.key ? "border-blue-500" : "border-transparent"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.key ? "text-blue-600" : "text-gray-500"
                  }`}
                >
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
  );
}