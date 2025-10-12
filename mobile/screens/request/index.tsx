import { InteractionManager, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NoAccessScreen } from "@/components/ui/feedback-screen";
import PageLayout from "../_PageLayout";
import { LinearGradient } from 'expo-linear-gradient';

export default () => {
  // ============== STATE INITIALIZATION ==============
  const { user } = useAuth();
  const [isReady, setIsReady] = React.useState<boolean>(false);

  const menuItems = [
    {
      title: "Garbage Pickup",
      route: "/(request)/garbage-pickup/form",
      icon: "",
      gradient: ['#60a5fa', '#3b82f6'],
    },
    {
      title: "Certification & Clearances",
      route: "/(request)/certification-request/cert-choices",
      icon: "",
      gradient: ['#3b82f6', '#2563eb'],
    },
    {
      title: "Blotter",
      route: "/(request)/complaint/complaint_req_form",
      icon: "",
      gradient: ['#2563eb', '#1e40af'],
    },
    {
      title: "Medicine",
      route: "",
      icon: "",
      gradient: ['#06b6d4', '#0891b2'],
    },
    {
      title: "Maternal Appointment",
      route: "",
      icon: "",
      gradient: ['#0ea5e9', '#0284c7'],
    },
    {
      title: "Medical Consultation",
      route: "",
      icon: "",
      gradient: ['#0284c7', '#0369a1'],
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
  if(!user?.rp) {
    return (isReady && <NoAccessScreen
        title="Resident Access Required"
        description="The request feature is only available to registered residents."
      />
    )
  }

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Request</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 px-6 py-4">
        <View className="flex-row flex-wrap gap-3">
          {menuItems.map((item: any, index: number) => (
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