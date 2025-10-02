import { InteractionManager, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NoAccessScreen } from "@/components/ui/feedback-screen";
import PageLayout from "../_PageLayout";

export default () => {
  // ============== STATE INITIALIZATION ==============
  const router = useRouter();
  const { user } = useAuth();
  const [isReady, setIsReady] = React.useState<boolean>(false);

  const menuItem = [
    {
      title: "Garbage Pickup",
      description:
        "Request a garbage pickup outside the regular collection schedule.",
      route: "/(request)/garbage-pickup/form",
    },
    {
      title: "Certification",
      description:
        "Request official certification documents for personal or legal use.",
      route: "/(request)/certification-request/cert-choices",
    },
    {
      title: "Blotter",
      description: "",
      route: "/(request)/complaint/complaint_req_form",
    },
    {
      title: "Medicine",
      description: "",
      route: "",
    },
    {
      title: "Maternal Appointment",
      description: "",
      route: "",
    },
    {
      title: "Medical Consultation Appointment",
      description: "",
      route: "",
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
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity> 
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Request</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 px-5">
        <View className="bg-white rounded-xl overflow-hidden border-y border-gray-200">
          {menuItem.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              className={`px-4 py-5 ${index !== menuItem.length - 1 ? 'border-b border-gray-200' : ''}`}
              activeOpacity={0.6}
              onPress={() => router.push(item.route)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-gray-900 font-semibold text-base mb-1">
                    {item.title}
                  </Text>

                  {item.description ? (
                    <Text className="text-gray-500 text-sm leading-5">
                      {item.description}
                    </Text>
                  ) : null}
                </View>

                <ChevronRight className="text-gray-400" size={20} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </PageLayout>
  );
};