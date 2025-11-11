import React from "react";
import { useRouter } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";
import { useToastContext } from "@/components/ui/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRegistrationTypeContext } from "@/contexts/RegistrationTypeContext";

export const SignupOptions = () => {
  const router = useRouter();
  const { toast } = useToastContext();
  const { setType } = useRegistrationTypeContext();

  const signupOptions = [
    {
      id: "individual",
      title: "Individual",
      description: "Register as an individual resident",
      icon: "person-outline",
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      route: "/registration/individual/account-reg",
    },
    {
      id: "family",
      title: "Family",
      description: "Register with family members",
      icon: "people-outline",
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      route: "/registration/family/register-new",
    },
    {
      id: "existing",
      title: "Link to Existing Profile",
      description: "Connect to an existing resident profile",
      icon: "link-outline",
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      route: "/registration/link/verification",
    },
    {
      id: "business",
      title: "Business Account",
      description: "For business owners not residing in Brgy. San Roque",
      icon: "business-outline",
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      route: "/registration/individual/account-reg",
    },
  ];

  return (
    <>
      {signupOptions.map((option, index) => (
        <TouchableOpacity
          key={option.id}
          onPress={() => {
            setType(option.id);
            router.push(option.route as any);
          }}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-4">
            {/* Icon Container */}
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: option.bgColor }}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={option.color}
              />
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className="text-md font-PoppinsSemiBold text-gray-900 mb-1">
                {option.title}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-gray-600 leading-5">
                {option.description}
              </Text>
            </View>

            {/* Arrow */}
            <View className="w-6 h-6 items-center justify-center">
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};