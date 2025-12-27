import { Search } from "@/lib/icons/Search";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TextInput, TouchableOpacity, View } from "react-native";

export const FilterPlaceholder = React.memo(({
  children,
  setDefault,
}: {
  children: React.ReactNode;
  setDefault: () => void
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
      <TouchableOpacity
        className="mb-2"
        onPress={setDefault}
      >
        <Text className="text-right text-xs font-primary-medium text-gray-700 underline">Set Default</Text>
      </TouchableOpacity>
      {children}
    </Animated.View>
  );
});