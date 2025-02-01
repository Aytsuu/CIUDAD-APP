import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ProgressBar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import "../global.css";
import DonationImageCharacter from "@/assets/svg/DonationImageCharacter";

export default function Donate() {
  const router = useRouter();

  const Goback = () => { //navigation to homepage
    router.push("/Gad_home");
  };

  const progress = 0.5; //for the progress bar

  return (
    <View className="flex-1 bg-[#413c3c]">
        {/* back button */}
     <View className="p-4 mt-9">
        <TouchableOpacity onPress={Goback} className="w-24 h-10 p-2 bg-[#174122] rounded-lg  flex-row items-center">
          <AntDesign name="arrowleft" size={20} color="white" />
          <Text className="text-white ml-2">Back</Text>
        </TouchableOpacity>
      </View>

        {/* header */}
      <View className="px-5 mt-4">
      <Text className="text-white text-3xl font-bold leading-tight">GIVE WHERE THE{"\n"}NEED IS{"\n"}GREATEST.</Text>
      </View>

        {/* body contents */}
      <View className="mt-[170px] overflow-hidden flex-1" style={{ borderTopLeftRadius: 60, borderTopRightRadius: 60}}>
        <LinearGradient colors={["#00938B", "#002D2A"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1 px-6 py-10">
            {/* svg for the donation character */}
            <View className="w-fulll items-center justify-center">
                <DonationImageCharacter /> 
            </View> 

          <Text className="text-white text-[21px] font-bold  mt-2">Partner with us to drive community growth and development.</Text>
          <Text className="text-white mt-2 text-[15px]">
            Your donations help improve education, safety, healthcare, and sustainability
            in Barangay San Roque Ciudad.
          </Text>

          <View className="mt-[40px] flex-row items-center justify-between">
            <View className="flex-1">
                <Text className="text-white mb-3 font-bold text-[15px] mt-[-20px]">Progress Bar</Text>
                <ProgressBar progress={progress} color="#00A8F0" />
                <View style={{ position: "absolute", top: 3, left: `${progress * 100}%`, transform: [{ translateX: -12 }], width: 20,  height: 20, borderRadius: 12, backgroundColor: "white",justifyContent: "center",alignItems: "center", }}>
                <Text className="text-[#002D2A] font-bold text-[14px]">₱</Text>
                </View>
            </View>
            <TouchableOpacity className="bg-[#00D707] py-3 px-6 rounded-full ml-4">
                <Text className="text-white font-bold text-lg">Start to help</Text>
            </TouchableOpacity>
        </View>
        </LinearGradient>
      </View>
    </View>
  );
}