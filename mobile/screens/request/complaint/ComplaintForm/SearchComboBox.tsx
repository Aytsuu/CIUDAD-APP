import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { Search, X, User } from "lucide-react-native";

interface SearchComboBoxItem {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface SearchComboBoxProps {
  data: SearchComboBoxItem[];
  value: string;
  onChange: (text: string) => void;
  onSelect: (item: SearchComboBoxItem) => void;
  placeholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  minSearchLength?: number;
  renderItem?: (item: SearchComboBoxItem) => React.ReactNode;
}

export const SearchComboBox: React.FC<SearchComboBoxProps> = ({
  data,
  value,
  onChange,
  onSelect,
  placeholder = "Search...",
  emptyMessage = "No results found",
  isLoading = false,
  minSearchLength = 2,
  renderItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<SearchComboBoxItem[]>([]);
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Filter data based on search value
  useEffect(() => {
    if (value.trim().length < minSearchLength) {
      setFilteredData([]);
      setIsOpen(false);
      return;
    }

    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(value.toLowerCase()) ||
      item.id.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);
    setIsOpen(true);

    // Animate dropdown
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, data, minSearchLength]);

  const handleSelect = (item: SearchComboBoxItem) => {
    onSelect(item);
    setIsOpen(false);
    onChange("");
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  const defaultRenderItem = (item: SearchComboBoxItem) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleSelect(item)}
      className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
    >
      <View className="mr-3">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-12 h-12 rounded-full"
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
            <User size={24} color="#9CA3AF" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900 mb-1">{item.name}</Text>
        {item.subtitle && (
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {item.subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="relative w-full">
      {/* Search Input */}
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
        <Search size={18} color="#9CA3AF" className="mr-2" />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-gray-900 text-base"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="ml-2">
            <X size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Results */}
      {isOpen && (
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50"
        >
          {isLoading ? (
            <View className="p-6 items-center">
              <Text className="text-gray-500">Loading...</Text>
            </View>
          ) : filteredData.length > 0 ? (
            <ScrollView
              className="max-h-64"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredData.map((item) =>
                renderItem ? (
                  <View key={item.id}>{renderItem(item)}</View>
                ) : (
                  defaultRenderItem(item)
                )
              )}
            </ScrollView>
          ) : (
            <View className="p-6">
              <Text className="text-gray-500 text-center">
                {emptyMessage}
                {value && ` for "${value}"`}
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};