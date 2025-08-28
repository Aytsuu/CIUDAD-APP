import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";

const AccountInformation = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const username = "User Account"; // Replace with dynamic username if needed

  // Function to change profile picture
//   const handleProfilePictureChange = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permissionResult.granted) {
//       alert("Permission to access media library is required!");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setProfileImage(result.assets[0].uri);
//     }
//   };

  return (
    <View className="flex-1 bg-[#ECF8FF] px-6 pt-8">
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
        <ArrowLeft size={24} color="#0F172A" />
        <Text className="text-[#0F172A] text-[20px] font-medium ml-2">Back</Text>
      </TouchableOpacity>

      {/* Profile Title */}
      <Text className="text-[#1E293B] text-[22px] font-bold mt-6">Profile</Text>

      {/* Profile Picture and Username Section */}
      {/* <View className="items-center mt-4">
        <TouchableOpacity onPress={handleProfilePictureChange} className="relative">
          <Image
            source={profileImage ? { uri: profileImage } : require("../assets/images/icon.png")} 
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
          <View className="absolute bottom-0 right-0 bg-[#00A8F0] p-1 rounded-full">
            <Ionicons name="camera" size={18} color="white" />
          </View>
        </TouchableOpacity>
        <Text className="text-[#1E293B] text-[18px] font-semibold mt-2">{username}</Text>
      </View> */}

      {/* Profile Details Section */}
      <Text className="text-gray-700 font-bold text-[16px] pb-2 mt-6 border-b border-gray-400">
        Profile Details
      </Text>

      {/* Account Information */}
      <TouchableOpacity onPress={() => router.push("/")} className="flex-row items-center py-4 border-b">
        <Ionicons name="information-circle-outline" size={30} color="#1E293B" />
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-semibold">Account Information</Text>
          <Text className="text-gray-500 text-[14px]">Resident No., Username, Password, etc.</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#64748B" />
      </TouchableOpacity>

      {/* Personal Information */}
      <TouchableOpacity onPress={() => router.push("/")} className="flex-row items-center py-4 border-b">
        <Ionicons name="person-outline" size={30} color="#1E293B" />
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-semibold">Personal Information</Text>
          <Text className="text-gray-500 text-[14px]">Name, Address, Contact Number, etc.</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#64748B" />
      </TouchableOpacity>

      {/* Other Information */}
      <TouchableOpacity onPress={() => router.push("/")} className="flex-row items-center py-4 border-b">
        <Ionicons name="people-outline" size={30} color="#1E293B" />
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-semibold">Other Information</Text>
          <Text className="text-gray-500 text-[14px]">Family information, Dependent Information</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
};

export default AccountInformation;