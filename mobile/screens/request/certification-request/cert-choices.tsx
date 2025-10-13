import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import _ScreenLayout from '@/screens/_ScreenLayout';

const CertChoices = () => {
  const router = useRouter();

  const menuItem = [
    {
      title: "Personal",
      description: "Request personal certification documents for individual use.",
      route: "/(request)/certification-request/cert-personal",
      icon: "person-outline"
    },
    {
      title: "Business Permit and Business Clearance",
      description: "Request permit certification documents for business or activities.",
      route: "/(request)/certification-request/cert-business-request",
      icon: "document-text-outline"
    },
  ];

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Certification Requests</Text>}
      customRightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 p-6">
        {menuItem.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            activeOpacity={0.7}
            onPress={() => router.push(item.route)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-gray-50 rounded-lg p-3 mr-4">
                  <Ionicons name={item.icon} size={24} color="#22314A" />
                </View>

                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base">
                    {item.title}
                  </Text>

                  <Text className="text-gray-500 text-sm mt-1">
                    {item.description}
                  </Text>
                </View>
              </View>

              <View className="ml-2">
                <ChevronRight className="text-gray-400" size={20} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </_ScreenLayout>
  );
};

export default CertChoices;