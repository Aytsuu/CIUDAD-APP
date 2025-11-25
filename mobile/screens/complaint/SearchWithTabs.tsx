import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Search, Plus } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { StatusFilterTabs, Tab } from "./StatufFilterBar";

interface SearchWithTabsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  showTabCounts?: boolean;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  onAddPress?: () => void;
  addButtonLabel?: string;
}

export const SearchWithTabs: React.FC<SearchWithTabsProps> = ({
  searchValue,
  onSearchChange,
  onSearchSubmit = () => {},
  tabs,
  activeTab,
  onTabChange,
  showTabCounts = true,
  searchPlaceholder = "Search...",
  showAddButton = false,
  onAddPress,
  addButtonLabel = "Add",
}) => {
  return (
    <View className="px-4 py-3">
      {/* Search Input and Button Container */}
      <View className="mb-3 flex-row items-center gap-2">
        {/* Search Input */}
        <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 border border-gray-200">
          <Search size={18} color="#9CA3AF" />
          <Input
            className="flex-1 ml-2 bg-transparent border-0 h-9"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Add Button (Optional) */}
        {showAddButton && (
          <TouchableOpacity
            onPress={onAddPress}
            className="bg-blue-600 rounded-lg px-4 h-11 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text className="text-white font-PoppinsMedium text-sm ml-1">
              {addButtonLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Tabs */}
      <StatusFilterTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        showCounts={showTabCounts}
      />
    </View>
  );
};