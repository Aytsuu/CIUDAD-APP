
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For persistence
import { Pill, Syringe, Package, HeartPulse, ChevronLeft } from "lucide-react-native"; // Using lucide-react-native for icons
import { router } from "expo-router";
import AntigenListScreen from "./transaction-screens/antigen-screen";
import CommodityListScreen from "./transaction-screens/commodity-screen";
import FirstAidListScreen from "./transaction-screens/firstaid-screen";
import MedicineListScreen from "./transaction-screens/medicine-screen";

export default function InventoryTransactionMainScreen() {
  // Retrieve the selected view from local storage, default to "medicine"
  const [selectedView, setSelectedView] = useState("medicine");

  useEffect(() => {
    const loadSelectedView = async () => {
      try {
        const savedView = await AsyncStorage.getItem("selectedView");
        if (savedView) {
          setSelectedView(savedView);
        }
      } catch (error) {
        console.error("Failed to load selected view from AsyncStorage", error);
      }
    };
    loadSelectedView();
  }, []);

  // Save the selected view to local storage whenever it changes
  useEffect(() => {
    const saveSelectedView = async () => {
      try {
        await AsyncStorage.setItem("selectedView", selectedView);
      } catch (error) {
        console.error("Failed to save selected view to AsyncStorage", error);
      }
    };
    saveSelectedView();
  }, [selectedView]);

  const handleTabChange = (value: string) => {
    setSelectedView(value);
  };

  const getTitle = () => {
    switch (selectedView) {
      case "medicine":
        return "Medicine Transaction";
      case "antigen":
        return "Antigen Transaction";
      case "commodity":
        return "Commodity Transaction";
      case "firstaid":
        return "First Aid Transaction";
      default:
        return "Medicine Transaction";
    }
  };

  return (
    <View className="flex-1">
            
      <View className="p-4 pb-0">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 bg-white/20 p-2 rounded-full z-10"
        >
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>

        <View className="mb-4 mt-20">
          <Text className="font-semibold text-lg text-blue-800">
            {getTitle()}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">
            Manage and view inventory information
          </Text>
        </View>
        <View className="border-b border-gray-300 mb-4" />

        
        {/* Tabs Navigation - Horizontally scrollable only */}
        <View className="rounded-md shadow-sm mb-4 bg-gray-100">
          <View className="p-1">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full">
              <View className="flex-row rounded-md p-1">
                <TabButton
                  value="medicine"
                  label="Medicine"
                  icon={Pill}
                  selectedView={selectedView}
                  onPress={handleTabChange}
                />
                <TabButton
                  value="antigen"
                  label="Antigen"
                  icon={Syringe}
                  selectedView={selectedView}
                  onPress={handleTabChange}
                />
                <TabButton
                  value="commodity"
                  label="Commodity"
                  icon={Package}
                  selectedView={selectedView}
                  onPress={handleTabChange}
                />
                <TabButton
                  value="firstaid"
                  label="First Aid"
                  icon={HeartPulse} // Using HeartPulse as a suitable icon for First Aid
                  selectedView={selectedView}
                  onPress={handleTabChange}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Content Area - Let child components handle their own scrolling */}
      <View className="flex-1">
        {selectedView === "medicine" && <MedicineListScreen />}
        {selectedView === "antigen" && <AntigenListScreen />}
        {selectedView === "commodity" && <CommodityListScreen />}
        {selectedView === "firstaid" && <FirstAidListScreen />}
      </View>
    </View>
  );
}

interface TabButtonProps {
  value: string;
  label: string;
  icon: React.ComponentType<any>; // Type for Lucide icon component
  selectedView: string;
  onPress: (value: string) => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  value,
  label,
  icon: Icon,
  selectedView,
  onPress,
}) => {
  const isActive = selectedView === value;
  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      className={`flex-row items-center justify-center py-3 px-4 rounded-md mx-1 ${
        isActive ? "bg-blue-100" : ""
      }`}
    >
      <Icon size={16} color={isActive ? "#3b82f6" : "#6b7280"} />
      <Text
        className={`ml-2 text-sm ${isActive ? "text-blue-500 font-semibold" : "text-gray-600"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};