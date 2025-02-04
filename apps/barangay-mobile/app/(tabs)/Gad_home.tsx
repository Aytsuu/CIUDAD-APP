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
import Features_Calendar_Icon from "@/assets/svg/Features_Calendar_Icon";
import Features_PendingRequest_Icon from "@/assets/svg/Features_PendingRequest_Icon";
import Features_Donations_Icon from "@/assets/svg/Features_Donations_Icon";
import { useRouter } from "expo-router";

export default function MyRequestScreen() {
  const router = useRouter();

  const notif = () => {
    router.push("/my-notification");
  };

  const donate = () => {
    router.push("/donation-page");
  };

  const calendar = () => {
    router.push("/Calendar-page");
  };

  return (
    //background
    <View className="flex-1 bg-[#ECF8FF] relative] ">
      <View className="absolute top-0 left-0 right-0 bottom-0">
        <BackgroundCiudad />
      </View>
      <View className="absolute top-[-60px] left-[80px]">
        <BackgroundLogo_Ciudad />
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
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

        {/* horizontal scrollview without contents */}
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

        {/* donations */}
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

          <View className="absolute right-[-20px] top-0 bottom-12 w-[120px] h-[100px] ">
            <DonationImage2 />
          </View>

          <View className="absolute right-[20px] top-12 bottom-0 w-[120px] h-[100px] ">
            <DonationImage />
          </View>
        </View>

        {/* features */}
        <View className="px-4">
          <Text className="text-[18px] font-bold text-black mt-4 ml-[-6]">
            Features
          </Text>

          {/* first row */}
          <View className="flex-row gap-4 mt-2 ml-[-6]">
            {/* request */}
            <TouchableOpacity className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md">
              <View className="w-12 h-12 bg-[#00B3FF] rounded-full flex items-center justify-center">
                <Features_Request_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Request
              </Text>
            </TouchableOpacity>

            {/* report */}
            <TouchableOpacity className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md">
              <View className="w-12 h-12 bg-[#FF615F] rounded-full flex items-center justify-center">
                <Features_Report_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Report
              </Text>
            </TouchableOpacity>
          </View>

          {/* second row */}
          <View className="flex-row gap-4 mt-2 ml-[-6]">
            {/*health*/}
            <TouchableOpacity className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md">
              <View className="w-12 h-12 bg-[#00CA5A] rounded-full flex items-center justify-center">
                <Features_Health_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Health
              </Text>
            </TouchableOpacity>

            {/*calendar*/}
            <TouchableOpacity
              className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md"
              onPress={calendar}
            >
              <View className="w-12 h-12 bg-[#FAB440] rounded-full flex items-center justify-center">
                <Features_Calendar_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Calendar
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3rd row */}
          <View className="flex-row gap-4 mt-2 ml-[-6]">
            {/*health*/}
            <TouchableOpacity className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md">
              <View className="w-12 h-12 bg-[#44A17C] rounded-full flex items-center justify-center">
                <Features_PendingRequest_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Pending Request
              </Text>
            </TouchableOpacity>

            {/*calendar*/}
            <TouchableOpacity className="w-48 h-20 flex-row items-center bg-white rounded-lg p-4 shadow-md">
              <View className="w-12 h-12 bg-[#FEF163] rounded-full flex items-center justify-center">
                <Features_Donations_Icon />
              </View>
              <Text className="ml-4 text-[18px] text-[#07143F] font-bold">
                Donations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* i dont know unsay content ig scroll down */}
        <View className="px-4 mt-6">
          <Text className="text-[18px] font-bold text-black mt-4 ml-[-6]">
            What's New For You
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
