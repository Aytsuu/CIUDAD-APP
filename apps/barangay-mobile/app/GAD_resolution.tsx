import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function Resolution() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const Goback = () => {
    router.push("/GAD_services");
  };

  return (
    <ScrollView className="flex-1 bg-[#ECF8FF] p-4 mt-11" showsVerticalScrollIndicator={false}>
      {/* back */}
      <TouchableOpacity onPress={Goback} className="flex-row items-center mb-4">
        <AntDesign name="arrowleft" size={24} color="black" />
        <Text className="text-black text-lg ml-2">Back</Text>
      </TouchableOpacity>

      <Text className="text-center text-2xl font-bold text-[#0A1D56] mt-11 mb-8">Resolution</Text>

      {/* Services Grid */}
      <View className="flex-row flex-wrap justify-start gap-4 ml-5">
        <TouchableOpacity 
          className="w-40 bg-white rounded-2xl shadow-md overflow-hidden"
          onPress={() => setModalVisible(true)}
        >
          <Image 
            source={require("@/assets/images/testResolution.png")} 
            className="w-full h-24" 
            resizeMode="cover" 
          />
          <View className="bg-[#0A1D56] p-2">
            <Text className="text-white font-semibold text-sm">001 - 24</Text>
            <Text className="text-white text-xs truncate">LOREM IPSUM DOL...</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal for Image Popup */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center">
          <TouchableOpacity 
            onPress={() => setModalVisible(false)} 
            className="absolute top-10 right-5 z-10"
          >
            <AntDesign name="close" size={30} color="white" />
          </TouchableOpacity>

          <Image 
            source={require("@/assets/images/testResolution.png")} 
            className="w-11/12 h-3/4 rounded-xl" 
            resizeMode="contain" 
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
