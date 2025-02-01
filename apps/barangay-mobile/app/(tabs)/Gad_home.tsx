import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import "../../global.css";
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import BackgroundLogo_Ciudad from '@/assets/svg/BackgroundLogo_Ciudad';
import BackgroundCiudad from '@/assets/svg/BackgroundCiudad';
import DonationImage from '@/assets/svg/donationImage';
import DonationImage2 from '@/assets/svg/donationImage2';
import { useRouter } from 'expo-router';


export default function MyRequestScreen() {
  
  const router = useRouter();

  const notif = () => {
    router.push('/my-notification');
  }; 

  const donate = () => {
    router.push('/donation-page');
  }; 

  return (
    //background
    <ThemedView className="flex-1 relative">

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <BackgroundCiudad />
      </View>
      <View className="absolute top-[-60px] left-[80px]">
        <BackgroundLogo_Ciudad />
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[25px] font-semibold text-white mt-9">My Home</Text>
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
          <LinearGradient colors={['#00938B', '#002D2A']} start={{x:0, y:0}} end={{x:1, y:0}} className="absolute top-0 left-0 right-0 bottom-0 w-full h-full"/>

  
          <View className="p-4 z-10">
            <Text className="text-white font-semibold text-[18px]">Give where the need is greatest.</Text>
            <TouchableOpacity className="bg-[#00D707] w-[100px] h-[40px] px-5 py-3 rounded-full shadow-md self-center mt-2 ml-[-220px]" onPress={donate}>
              <Text className="text-white font-bold text-base text-center">Donate</Text>
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
        <Text className="text-[18px] font-bold text-black mt-4">Features</Text>
      </ScrollView>
    </ThemedView>
  );
}