import { Text, View, TouchableOpacity } from "react-native"
import PageLayout from "../_PageLayout"
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { LinearGradient } from 'expo-linear-gradient';

export default () => {
  const router = useRouter();

  const menuItem = [
    {
      title: "Garbage Pickup Request",
      description: "Monitor garbage pickup request.",
      route: "/(my-request)/garbage-pickup/garbage-pickup-tracker",
      icon: "",
      gradient: ['#10b981', '#059669'],
    },
    {
      title: "Certification Request",
      description: "Request official certification documents for personal or legal use.",
      route: "/(my-request)/certification-tracking/certificate-request-tracker",
      icon: "",
      gradient: ['#8b5cf6', '#7c3aed'],
    },
    {
      title: "Blotter Request",
      description: "File a request to document the incident and promtoe a peaceful settlement.",
      route: "/(my-request)/complaint-tracking/compMain",
      icon: "",
      gradient: ['#6d28d9', '#a78bfa'],
    },
    {
      title: "Medicine Request",
      description: "Monitor your medicine requests.",
      route: "/(health)/medicine-request/my-requests",
      icon: "",
      gradient: ['#f59e0b', '#d97706'],
    },
    {
      title: "Maternal Appointment",
      description: "Track your maternal health appointments.",
      route: "",
      icon: "",
      gradient: ['#ec4899', '#db2777'],
    },
    {
      title: "Medical Consultation",
      description: "Monitor your medical consultation requests.",
      route: "",
      icon: "",
      gradient: ['#06b6d4', '#0891b2'],
    },
  ]

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
      headerTitle={<Text className="text-gray-900 text-[13px]">My Requests</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 px-6 py-4">
        <Text className="text-sm text-center text-gray-600 leading-6 mb-6">
          Monitor your own requests. Select a category below to view records.
        </Text>
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
                      <Text className="text-3xl"></Text>
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-white font-bold text-base leading-tight">
                      {item.title}
                    </Text>
                    <Text className="text-white/80 text-xs mt-1 leading-tight">
                      {item.description}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </PageLayout>
  )
}