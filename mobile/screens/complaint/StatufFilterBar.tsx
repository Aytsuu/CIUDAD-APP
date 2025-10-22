import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface StatusFilterTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  showCounts?: boolean;
}

export const StatusFilterTabs: React.FC<StatusFilterTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  showCounts = true,
}) => {
  return (
    <View className="bg-white border-b border-gray-200 px-4 py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-full flex-row items-center ${
              activeTab === tab.id ? "bg-green-500" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-PoppinsMedium ${
                activeTab === tab.id ? "text-white" : "text-gray-700"
              }`}
            >
              {tab.label}
            </Text>
            {showCounts && tab.count !== undefined && tab.count > 0 && (
              <View
                className={`ml-2 px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-white/20" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-PoppinsSemiBold ${
                    activeTab === tab.id ? "text-white" : "text-gray-600"
                  }`}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};