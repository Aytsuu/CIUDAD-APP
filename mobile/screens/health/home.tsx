import React from "react";
import { View, Image, ScrollView, StatusBar, TouchableOpacity, Touchable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { router } from "expo-router";

const Homepage = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <View className="flex-row justify-between items-center px-4 py-3 bg-blue-900">
        <TouchableOpacity className="p-2">
          {/* Menu icon would go here */}
          {/* <Image source={require('@/assets/images/Health/Home/menu.png')} className="w-6 h-6" /> */}
        </TouchableOpacity>

        <TouchableOpacity className="p-2">
          {/* Notification icon would go here */}
          {/* <Image source={require('@/assets/icons/notification.png')} className="w-6 h-6" /> */}
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View className="flex-row items-center p-6 bg-blue-900">
        <View>
          <Text className="text-white text-6xl font-PoppinsSemiBold">Welcome!</Text>
          <Text className="text-white text-lg">How can we help you today?</Text>
        </View>
        <Image
          source={require('@/assets/images/Health/Home/young_doctor_man.png')}
          className="w-30 h-30"
          resizeMode="contain"
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            <Card className="w-64 h-40 bg-white shadow-lg rounded-lg mx-2 p-4">
              <Image
                source={require('@/assets/images/Health/Home/Famplanning.jpg')}
                className="w-20 h-20"
                resizeMode="cover"
              />
              <Text className="text-blue-900 text-xl font-bold">Family Planning</Text>
              <Text className="text-gray-500 mt-3 text-sm italic">Your Family, Your Future, Plan it right.</Text>
              <Button className="mt-2 w-24 bg-green-600 items-center">
                <Text className="text-white text-xs">Learn More</Text>
              </Button>
            </Card>

            <Card className="w-64 h-40 bg-white shadow-lg rounded-lg mx-2 p-4">
              <Text className="text-blue-900 text-lg font-bold">Animal</Text>
              <Text className="text-gray-500 text-sm">Lorem Ipsum</Text>
            </Card>



          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between px-4 mt-6">
          <TouchableOpacity className="w-1/2 bg-blue-100 p-4 rounded-lg mx-1 items-center">
            <Image
              source={require('@/assets/images/Health/Home/Capsule.png')}
              className="w-20 h-20"
            />
            <Text className="text-blue-900 font-bold text-lg mt-2">Medicine Request</Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-1/2 bg-blue-100 p-4 rounded-lg mx-1 items-center">
            <Image
              source={require('@/assets/images/Health/Home/myrecords.png')}
              className="w-20 h-20"
            />
            <Text className="text-blue-900 font-bold text-lg mt-2">My Records</Text>
          </TouchableOpacity>
        </View>

        {/* Appointment Section */}
        <View className="flex-row justify-between px-4 mt-6">
          <Text className="text-gray-800 text-xl font-PoppinsSemiBold">Book Appointment</Text>
          
          <TouchableOpacity onPress={() => router.push("/appointments/schedules")}>
          <View className="bg-transparent">
          <Text className="text-blue-800 text-lg font-PoppinsMedium">My Appointments</Text>
          </View>
          </TouchableOpacity>
        </View>


        <View className="flex-row px-4 mt-6 space-x-4">
      {/* Maternal Services Card */}
      <TouchableOpacity
        onPress={() => router.push("/maternal/maternal-landing")}
        className="flex-1"
      >
        <View className="bg-[#8EADA0] border-0 p-4 shadow-md rounded-lg items-center h-48 justify-center">
          <Image
            source={require("@/assets/images/Health/Home/Pregnant.png")}
            className="w-24 h-24 mb-2"
            resizeMode="contain"
          />
          <Text className="text-[#2E4139] text-lg font-semibold">Maternal</Text>
          <Text className="text-[#2E4139] text-lg font-semibold">Services</Text>
        </View>
      </TouchableOpacity>

      {/* Medical Consultation Card */}
      <TouchableOpacity
        onPress={() => router.push("/medconsultation/med-landing")}
        className="flex-1"
      >
        <View className="bg-pink-200 border-0 p-4 shadow-md rounded-lg items-center h-48 justify-center">
          <Image
            source={require("@/assets/images/Health/Home/health_worker.png")}
            className="w-24 h-24 mb-2"
            resizeMode="contain"
          />
          <Text className="text-[#2E4139] text-lg font-semibold">Medical</Text>
          <Text className="text-[#2E4139] text-lg font-semibold">Consultation</Text>
        </View>
      </TouchableOpacity>
    </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Homepage;













