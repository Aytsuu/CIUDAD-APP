import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons, FontAwesome5, Entypo } from "@expo/vector-icons";
import Features_Calendar_Icon from "@/assets/svg/Features_Calendar_Icon";
import Services_Resolution_Icon from "@/assets/svg/Services_Resolution_Icon";
import Services_ProjProp_Icon from "@/assets/svg/Services_ProjProp_Icon";
import Services_Budget_Icon from "@/assets/svg/Services_Budget_Icon";

export default function Services() {
  const router = useRouter();

  const Goback = () => {
    router.push("/Gad_home");
  };

  const calendar = () => {
    router.push("/Calendar-page");
  };

  const resolution = () => {
    router.push("/GAD_resolution");
  };

  const proposal = () => {
    router.push("/GAD_ProjProp");
  };

  
  return (
    <View className="flex-1 bg-[#ECF8FF] p-4 mt-11">
      {/* back */}
      <TouchableOpacity onPress={Goback} className="flex-row items-center mb-4">
        <AntDesign name="arrowleft" size={24} color="black" />
        <Text className="text-black text-lg ml-2">Back</Text>
      </TouchableOpacity>

     
      <Text className="text-center text-2xl font-bold text-[#0A1D56]  mt-11 mb-8">Services</Text>

      {/* services */}

      {/* calendar */}
      <View className="flex-row flex-wrap justify-center gap-9">
        <TouchableOpacity className="w-36 h-36 bg-[#A6CFE2] rounded-2xl items-center justify-center shadow-md" onPress={calendar}>
         <Features_Calendar_Icon width ={50} height = {50} />
          <Text className="mt-2 text-center text-[#0A1D56] font-semibold">Calendar</Text>
        </TouchableOpacity>

        {/*resolution  */}
        <TouchableOpacity className="w-36 h-36 bg-[#A6CFE2] rounded-2xl items-center justify-center shadow-md" onPress={resolution}>
          <Services_Resolution_Icon width ={50} height = {50} />
          <Text className="mt-2 text-center text-[#0A1D56] font-semibold">Resolution</Text>
        </TouchableOpacity>

        {/*project*/}
        <TouchableOpacity className="w-36 h-36 bg-[#A6CFE2] rounded-2xl items-center justify-center shadow-md" onPress={proposal}>
          <Services_ProjProp_Icon width ={50} height = {50} />
          <Text className="mt-2 text-center text-[#0A1D56] font-semibold">Project Proposals</Text>
        </TouchableOpacity>

        {/*budget*/}
        <TouchableOpacity className="w-36 h-36 bg-[#A6CFE2] rounded-2xl items-center justify-center shadow-md">
          <Services_Budget_Icon width ={50} height = {50} />
          <Text className="mt-2 text-center text-[#0A1D56] font-semibold">Budget Tracker</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
