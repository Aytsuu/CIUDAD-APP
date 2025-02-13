import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import "../../global.css";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import BackgroundLogo_Ciudad from "@/assets/svg/BackgroundLogo_Ciudad";
import BackgroundCiudad from "@/assets/svg/BackgroundCiudad";
import DonationImage from "@/assets/svg/donationImage";
import DonationImage2 from "@/assets/svg/donationImage2";
import Features_Request_Icon from "@/assets/svg/Features_Request_Icon";
import Features_Report_Icon from "@/assets/svg/Features_Report_Icon";
import Features_Health_Icon from "@/assets/svg/Features_Health_Icon";
import Features_GAD_Icon from "@/assets/svg/Features_GAD_Icon";

import { useRouter } from "expo-router";

export default function MyRequestScreen() {
  const router = useRouter();

  const announcements = [
    { id: 1, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing'},
    { id: 2, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing' },
    { id: 3, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing' },
    { id: 4, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing' },
    { id: 5, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing' },
  ];

  const notif = () => {
    router.push("/my-notification");
  };

  const donate = () => {
    router.push("/donation-page");
  };

  const GAD_services = () => {
    router.push("/GAD_services");
  };

  return (
    <View className="flex-1 bg-[#ECF8FF]">
      {/* Fixed background container */}
      <View className="absolute top-0 left-0 right-0 bottom-0 z-0">
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <BackgroundCiudad />
        </View>
        <View className="absolute top-[-60px] left-[80px]">
          <BackgroundLogo_Ciudad />
        </View>
      </View>

      {/* Scrollable content with higher z-index */}
      <ScrollView 
        className="flex-1 px-4 pt-4 z-10" 
        showsVerticalScrollIndicator={false}
      >
        {/* Rest of your content remains the same */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[25px] font-semibold text-white mt-9">
            My Home
          </Text>
          <View className="flex-row items-center mt-9">
            <TouchableOpacity className="mr-3">
              <Entypo name="dots-three-horizontal" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={notif}>
              <MaterialCommunityIcons name="bell" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-[18px] font-bold text-white mb-2">Discovery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-4">
            <View className="w-[250px] h-[150px] bg-gray-300 rounded-lg"></View>
            <View className="w-[250px] h-[150px] bg-gray-300 rounded-lg"></View>
            <View className="w-[250px] h-[150px] bg-gray-300 rounded-lg"></View>
            <View className="w-[250px] h-[150px] bg-gray-300 rounded-lg"></View>
            <View className="w-[250px] h-[150px] bg-gray-300 rounded-lg"></View>
          </View>
        </ScrollView>

        <View className="mt-4 relative w-[357px] h-[100px] rounded-lg overflow-hidden">
          <LinearGradient
            colors={["#00938B", "#002D2A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 bottom-0 w-full h-full"
          />

          <View className="p-4 z-10">
            <Text className="text-white font-semibold text-[18px]">
              Give where the need is greatest.
            </Text>
            <TouchableOpacity
              className="bg-[#00D707] w-[100px] h-[40px] px-5 py-3 rounded-full shadow-md self-center mt-2 ml-[-220px]"
              onPress={donate}
            >
              <Text className="text-white font-bold text-base text-center">
                Donate
              </Text>
            </TouchableOpacity>
          </View>

          <View className="absolute right-[-20px] top-0 bottom-12 w-[120px] h-[100px]">
            <DonationImage2 />
          </View>

          <View className="absolute right-[20px] top-12 bottom-0 w-[120px] h-[100px]">
            <DonationImage />
          </View>
        </View>

        <View className="px-4">
          <Text className="text-[18px] font-bold text-black mt-4 ml-[-6]">
            Features
          </Text>

          <View className="flex-row gap-4 mt-2 ml-[-6]">
            <TouchableOpacity className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md">
              <View className="w-12 h-12 bg-[#00B3FF] rounded-full flex items-center justify-center">
                <Features_Request_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Request
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md">
              <View className="w-12 h-12 bg-[#FF615F] rounded-full flex items-center justify-center">
                <Features_Report_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Report
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4 mt-2 ml-[-6]">
            <TouchableOpacity className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md">
              <View className="w-12 h-12 bg-[#00CA5A] rounded-full flex items-center justify-center">
                <Features_Health_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Health
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md"
              onPress={GAD_services}
            >
              <View className="w-12 h-12 bg-[#FAB440] rounded-full flex items-center justify-center">
                <Features_GAD_Icon width={30} height={30} />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                GAD
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-[18px] font-bold text-black mt-4 ml-[-6]">
            What's New For You
          </Text>

          <View className="bg-[#a2a7b9] p-3 rounded-lg mt-4 -mx-4">
            {announcements.map((announcement) => (
              <View
                key={announcement.id}
                className="bg-white rounded-lg shadow-md p-4 mb-4"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-gray-800">{announcement.title}</Text>
                  <View className="w-2 h-2 bg-red-500 rounded-full" />
                </View>
                <Text className="text-sm text-gray-600">{announcement.subtitle} - {announcement.time}</Text>
                <Text className="text-sm text-gray-700 mt-2 mb-4">
                  {announcement.contents}
                </Text>
                <TouchableOpacity>
                  <View className="flex-row justify-end">
                    <Text style={{ color: '#071440' }} className="text-sm font-bold">View ➔</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}