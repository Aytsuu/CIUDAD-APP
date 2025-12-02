import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { ChevronDown } from "@/lib/icons/ChevronDown";
import { Search } from "@/lib/icons/Search";
import { X } from "@/lib/icons/X";

interface DropdownItem {
  label: string;
  value: string;
  data?: any;
  badge?: string;
  badgeColor?: string;
}

interface CustomDropdownProps {
  data: DropdownItem[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: React.ReactNode;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  data,
  value,
  onSelect,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  onSearchChange,
  loading = false,
  emptyMessage,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedItem = data.find((item) => item.value === value);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  const handleSelect = (item: DropdownItem) => {
    onSelect(item.value);
    setModalVisible(false);
    setSearchQuery("");
  };

  const filteredData = React.useMemo(() => {
    if (!searchQuery || onSearchChange) return data;
    return data.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery, onSearchChange]);

  return (
    <View>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        className={`border border-gray-200 rounded-lg p-3 flex-row justify-between items-center ${
          disabled ? "bg-gray-100" : "bg-white"
        }`}
        disabled={disabled}
      >
        <Text
          className={`flex-1 ${
            selectedItem ? "text-gray-900" : "text-gray-400"
          }`}
          numberOfLines={1}
        >
          {selectedItem?.label || placeholder}
        </Text>
        <ChevronDown size={20} className="text-gray-400" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {placeholder}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery("");
                }}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={18} className="text-gray-600" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
                <Search size={20} className="text-gray-400 mr-2" />
                <TextInput
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  className="flex-1 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => handleSearch("")}
                    className="ml-2"
                  >
                    <X size={16} className="text-gray-400" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* List */}
            <View className="flex-1">
              {loading ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text className="text-gray-500 mt-2">Loading...</Text>
                </View>
              ) : filteredData.length === 0 ? (
                <View className="flex-1 items-center justify-center p-4">
                  {emptyMessage || (
                    <Text className="text-gray-500 text-center">
                      No options found
                    </Text>
                  )}
                </View>
              ) : (
                <FlatList
                  data={filteredData}
                  keyExtractor={(item, index) => `${item.value}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      className={`p-4 border-b border-gray-100 ${
                        item.value === value ? "bg-blue-50" : ""
                      }`}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`flex-1 ${
                            item.value === value
                              ? "text-blue-600 font-medium"
                              : "text-gray-900"
                          }`}
                        >
                          {item.label}
                        </Text>
                        {item.badge && (
                          <View
                            className={`px-2 py-1 rounded-full ml-2 ${
                              item.badgeColor === "green"
                                ? "bg-green-100"
                                : "bg-blue-100"
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                item.badgeColor === "green"
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {item.badge}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
