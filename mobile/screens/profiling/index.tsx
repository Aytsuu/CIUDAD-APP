import { Text, View, TouchableOpacity } from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { UsersRound } from "@/lib/icons/UsersRound";
import { UserRound } from "@/lib/icons/UserRound";
import { Building } from "@/lib/icons/Building";
import { Store } from "@/lib/icons/Store";
import PageLayout from "../_PageLayout";
import { LinearGradient } from "expo-linear-gradient";

export default () => {
  const menuItems = [
    {
      id: "resident",
      title: "Residents",
      description: "Individual records",
      icon: UserRound,
      route: "/(profiling)/resident/records",
      gradient: ['#60a5fa', '#3b82f6'],
    },
    {
      id: "family",
      title: "Families",
      description: "Family compositions",
      icon: UsersRound,
      route: "/(profiling)/family/records",
      gradient: ['#3b82f6', '#2563eb'],
    },
    {
      id: "household",
      title: "Households",
      description: "Housing information",
      icon: Building,
      route: "/(profiling)/household/records",
      gradient: ['#2563eb', '#1e40af'],
    },
    {
      id: "business",
      title: "Businesses",
      description: "Local enterprises",
      icon: Store,
      route: "/(profiling)/business/records",
      gradient: ['#06b6d4', '#0891b2'],
    },
  ];
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Profiling</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-6 py-4">
        <View className="flex-row flex-wrap gap-3">
          {menuItems.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              className="rounded-2xl overflow-hidden"
              style={{
                width: "48%",
                aspectRatio: 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
              activeOpacity={0.8}
              onPress={() => item.route && router.push(item.route)}
            >
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 p-5"
              >
                <View className="flex-1 justify-between">
                  <View className="items-start">
                    <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                      <item.icon className="text-white"/>
                    </View>
                  </View>

                  <View>
                    <Text className="text-white font-bold text-base leading-tight">
                      {item.title}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </PageLayout>
  );
};
