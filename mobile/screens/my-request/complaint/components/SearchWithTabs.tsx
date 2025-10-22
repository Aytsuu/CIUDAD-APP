import React from "react";
import { View } from "react-native";
import { SearchInput } from "@/components/ui/search-input";
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
  searchPlaceholder,
}) => {
  return (
    <View>
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        onSubmit={onSearchSubmit}
        // placeholder={searchPlaceholder}
      />
      <StatusFilterTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        showCounts={showTabCounts}
      />
    </View>
  );
};