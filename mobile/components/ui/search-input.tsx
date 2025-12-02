import { Search } from "@/lib/icons/Search";
import React, { useEffect, useRef } from "react";
import { Animated, TextInput, View } from "react-native";

export const SearchInput = React.memo(({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  return (
    <Animated.View 
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }}
      className="px-6 pt-2 pb-3 bg-white"
    >
      <View className="native:h-[45px] flex-row items-center bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
        <Search size={18} className="text-gray-500 mr-2" />
        <TextInput
          value={value}
          autoFocus={false}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          placeholder="Search..."
          returnKeyType="search"
          className="flex-1 text-gray-900 mr-2 native:h-[45px]"
        />
      </View>
    </Animated.View>
  );
});