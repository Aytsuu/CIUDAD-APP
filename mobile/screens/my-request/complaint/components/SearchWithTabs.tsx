import React from "react";
import { View } from "react-native";
import { Search } from "lucide-react-native";
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
}) => {
  return (
    <View className="px-4">
      {/* Search Input Container */}
      <View className="mb-3 flex-row items-center bg-white rounded-lg px-3 border border-gray-200">
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