import { InteractionManager, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
// import { NoAccessScreen } from "@/components/ui/feedback-screen";
import PageLayout from "../_PageLayout";
import { LinearGradient } from 'expo-linear-gradient';
// import { Clipboard, Calendar, DollarSign, FileText } from 'lucide-react-native';

export default () => {
  // ============== STATE INITIALIZATION ==============
  const router = useRouter();
  const { user } = useAuth();
  const [isReady, setIsReady] = React.useState<boolean>(false);

  const menuItem = [
    {
      title: "Budget Tracker",
      route: "/(gad)/budget-tracker/budget-tracker-main",
      icon: '',
      gradient: ['#60a5fa', '#3b82f6'],
    },
    {
      title: "Project Proposal",
      route: "/(gad)/project-proposal/projprop-main",
      icon: '',
      gradient: ['#3b82f6', '#2563eb'],
    },
    {
      title: "Annual Development Plan",
      route: "/(gad)/annual-dev-plan/main-plan",
      icon: '',
      gradient: ['#2563eb', '#1e40af'],
    },
    {
      title: "Activity Calendar",
      route: "/(gad)/activity/gad-activity",
      icon: '',
      gradient: ['#93c5fd', '#60a5fa'],
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
//   if(!user?.) { // Adjust this condition based on your auth context
//     return (isReady && <NoAccessScreen
//         title="GAD Access Required"
//         description="The Gender and Development features are only available to authorized GAD personnel."
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Gender and Development</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 px-6 py-4">
        <View className="flex-row flex-wrap gap-3 justify-center">
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
                      {typeof item.icon === 'string' ? (
                        <Text className="text-3xl">{item.icon}</Text>
                      ) : (
                        <item.icon size={24} color="white" />
                      )}
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