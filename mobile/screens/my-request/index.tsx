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
      route: "/(my-request)/garbage-pickup/garbage-pickup-tracker",
      icon: "",
      gradient: ['#60a5fa', '#3b82f6'],
    },
    {
      title: "Certification Request",
      route: "/(my-request)/certification-tracking/certificate-request-tracker",
      icon: "",
      gradient: ['#3b82f6', '#2563eb'],
    },
    {
      title: "Blotter Request",
      route: "/(my-request)/complaint-tracking/compMain",
      icon: "",
      gradient: ['#2563eb', '#1e40af'],
    },
    {
      title: "Medicine Request",
      route: "/(health)/medicine-request/my-requests",
      icon: "",
      gradient: ['#93c5fd', '#60a5fa'],
    },
    {
      title: "Maternal Appointment",
      route: "",
      icon: "",
      gradient: ['#60a5fa', '#3b82f6'],
    },
    {
      title: "Medical Consultation",
      route: "",
      icon: "",
      gradient: ['#2563eb', '#1e40af'],
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