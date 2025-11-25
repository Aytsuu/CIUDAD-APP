import { InteractionManager, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NoAccessScreen } from "@/components/ui/feedback-screen";
import PageLayout from "../_PageLayout";
import { LinearGradient } from 'expo-linear-gradient';

export default () => {
  // ============== STATE INITIALIZATION ==============
  const router = useRouter();
  const { user } = useAuth();
  const [isReady, setIsReady] = React.useState<boolean>(false);

  const menuItem = [
    {
      title: "Council Events",
      route: "/(council)/council-events/calendar",
      icon: "",
      gradient: ['#60a5fa', '#3b82f6'],
    },
    {
      title: "Attendance",
      route: "/(council)/attendance/main-attendance-page",
      icon: "",
      gradient: ['#3b82f6', '#2563eb'],
    },
    {
      title: "Templates",
      route: "/(council)/template/template-main-page",
      icon: "",
      gradient: ['#2563eb', '#1e40af'],
    },
    {
      title: "Resolutions",
      route: "/(council)/resolution/res-main",
      icon: "",
      gradient: ['#06b6d4', '#0891b2'],
    },
    {
      title: "Ordinances",
      route: "/(council)/ordinance/ordinance-main",
      icon: "",
      gradient: ['#60a5fa', '#3b82f6'],
    },
    {
      title: "Minutes of Meeting",
      route: "/(council)/minutes-of-meeting/mom-main",
      icon: "",
      gradient: ['#0ea5e9', '#0284c7'],
    },
  ];
  
  // ============== SIDE EFFECTS ==============
  React.useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setIsReady(true)
    });

    return () => task.cancel()
  }, [user])

  // ============== RENDER ==============
//   if(!user?.) { 
//     return (isReady && <NoAccessScreen
//         title="Council Access Required"
//         description="This feature is only available to council members."
//       />
//     )
//   }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity> 
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Council Portal</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 px-6 py-4">
        <View className="flex-row flex-wrap gap-3">
          {menuItem.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              className="rounded-2xl overflow-hidden"
              style={{ 
                width: '48%', 
                aspectRatio: 1,
                shadowColor: '#000',
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
                      <Text className="text-3xl">{item.icon}</Text>
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