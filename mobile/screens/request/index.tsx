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
      title: "Garbage Pickup Request",
      description:
        "Request a garbage pickup outside the regular collection schedule.",
      route: "/(request)/garbage-pickup/form",
    },
    {
      title: "Certification Request",
      description:
        "Request official certification documents for personal or legal use.",
      route: "/(request)/certification-request/cert-choices",
    },
    {
      title: "Blotter Request",
      description: "",
      route: "/(request)/complaint/complaint_req_form",
    },
    {
      title: "Medicine Request",
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
        <Text className="text-sm text-center text-gray-600 leading-6 px-5 mb-4">
          Monitor barangay requests. Select a category below to view records.
        </Text>
        {menuItem.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            activeOpacity={0.7}
            onPress={() => router.push(item.route)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {/* Add Visual Image */}

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
    </PageLayout>
  );
};
