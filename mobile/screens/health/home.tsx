import React from "react";
import { View, Image, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { router } from "expo-router";
import { Archive, Baby, Calendar, Dog, Heart, Pill, Stethoscope, UserCircle, Users, ShieldPlus, BookHeart } from "lucide-react-native";

const Homepage = () => {
  const modules = [
    { name: 'Child Health Records', route: '/child-health-records', icon: Baby },
    { name: 'Family Planning', route: '/family-planning/famplanning', icon: Heart },
    { name: 'Animal Bites', route: '/admin/animalbites/overall', icon: Dog },
    { name: 'Maternal Records', route: '/maternal-records', icon: UserCircle },
    { name: 'Medical Consultation', route: '/medical-consultation', icon: Stethoscope },
    { name: 'Medicine Requests', route: '/admin-medicinerequest/admin-medicinerequest', icon: Pill },
    { name: 'Patients Records', route: '/admin/patientsrecord/patientsrecord', icon: Users },
    { name: 'Schedules', route: 'appointments/schedules', icon: Calendar },
    { name: 'Inventory', route: '/inventory/medicine', icon: Archive },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Welcome Section */}
      <View className="flex-row items-center justify-between bg-blue-900 px-5 pr-0">
        <View className="flex-1 pr-4">
          <Text className="text-white text-5xl font-PoppinsSemiBold">Welcome!</Text>
          <Text className="text-white text-base mt-1">How can we help you today?</Text>
        </View>
        <Image
          source={require('@/assets/images/Health/Home/young_doctor_man.png')}
          className="h-40 w-40"
          resizeMode="cover"
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-6 h-44">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <View className="flex-row gap-4">
              {/* Family Planning Card */}
              <Card className="w-80 h-40 rounded-lg shadow-lg overflow-hidden relative">
                <Image 
                  source={require('@/assets/images/Health/Home/Famplanning.jpg')} 
                  className="w-full h-full absolute" 
                  resizeMode="cover" 
                />
                <View className="absolute inset-0 bg-black/50" />
                <View className="absolute inset-0 p-4 justify-between">
                  <View>
                    <Text className="text-white text-3xl mt-2 font-PoppinsSemiBold">Family Planning</Text>
                    <Text className="text-white text-sm font-PoppinsRegular italic mt-1">Your Family, Your Future. Plan it right.</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => router.push("/family-planning/famplanning")} 
                    className="bg-green-600 rounded-full px-4 py-2 self-start"
                  >
                    <Text className="text-white text-sm font-semibold">Learn more</Text>
                  </TouchableOpacity>
                </View>
              </Card>

              {/* Animal Bites Card */}
              <Card className="w-80 h-40 rounded-lg shadow-lg overflow-hidden relative">
                <Image 
                  source={require('@/assets/images/Health/Home/animalbites.jpg')} 
                  className="w-full h-full absolute" 
                  resizeMode="cover" 
                />
                <View className="absolute inset-0 bg-black/50" />
                <View className="absolute inset-0 p-4 justify-between">
                  <View>
                    <Text className="text-white text-3xl mt-2 font-PoppinsSemiBold">Animal Bites</Text>
                    <Text className="text-white text-sm font-PoppinsRegular italic mt-1">First aid & Prevention.</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => router.push('/animalbite/animalbite')} 
                    className="bg-green-600 rounded-full px-4 py-2 self-start"
                  >
                    <Text className="text-white text-sm font-semibold">Learn more</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          </ScrollView>
        </View>

        {/* Medicine Request and My Records Section */}
        <View className="flex-row px-4 mt-6 gap-4">
          <TouchableOpacity 
            onPress={() => router.push("/medicine-request/med-request")} 
            className="flex-1 bg-blue-100 p-4 rounded-lg items-center"
          >
            <Image
              source={require('@/assets/images/Health/Home/Capsule.png')}
              className="w-20 h-20"
            />
            <Text className="text-blue-900 font-bold text-lg mt-2 text-center">Medicine Request</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push("/my-records/all-records")} 
            className="flex-1 bg-blue-100 p-4 rounded-lg items-center"
          >
            <Image
              source={require('@/assets/images/Health/Home/myrecords.png')}
              className="w-20 h-20"
            />
            <Text className="text-blue-900 font-bold text-lg mt-2 text-center">My Records</Text>
          </TouchableOpacity>
        </View>

        {/* Book Appointment Header */}
        <View className="flex-row justify-between items-center px-4 mt-8">
          <Text className="text-gray-800 text-xl font-PoppinsSemiBold">Book Appointment</Text>
          <TouchableOpacity onPress={() => router.push("/appointments/schedules")}>
            <Text className="text-blue-800 text-lg italic font-PoppinsSemiBold">My Appointments</Text>
          </TouchableOpacity>
        </View>

        {/* Maternal Services and Medical Consultation Section */}
        <View className="flex-row px-4 mt-6 gap-4">
          <TouchableOpacity 
            onPress={() => router.push("/maternal/maternal-landing")} 
            className="flex-1"
          >
            <View className="bg-[#8EADA0] p-4 shadow-md rounded-lg items-center h-48 justify-center">
              <BookHeart size={70} color="#2E4139" />
              <Text className="text-[#2E4139] text-lg font-PoppinsSemiBold mt-2 text-center">Maternal</Text>
              <Text className="text-[#2E4139] text-lg font-PoppinsSemiBold text-center">Services</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push("/medconsultation/med-landing")} 
            className="flex-1"
          >
            <View className="bg-pink-200 p-4 shadow-md rounded-lg items-center h-48 justify-center">
              <ShieldPlus size={70} color="#47333A" />
              <Text className="text-[#47333A] text-lg font-PoppinsSemiBold mt-2 text-center">Medical</Text>
              <Text className="text-[#47333A] text-lg font-PoppinsSemiBold text-center">Consultation</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Manage Section */}
        <View className="px-4 mt-8 mb-6">
          <Text className="text-gray-800 text-xl font-PoppinsSemiBold mb-5">Manage</Text>
          <View className="flex-row flex-wrap justify-between">
            {modules.map((module, index) => {
              const Icon = module.icon; 
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(module.route as any)}
                  className="w-[30%] bg-blue-900 p-3 rounded-lg mb-4 items-center"
                >
                  <Icon size={48} color="white" />
                  <Text className="text-white font-PoppinsRegular text-center mt-2 text-sm leading-4">
                    {module.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Homepage;