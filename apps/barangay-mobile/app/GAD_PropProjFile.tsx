import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { AntDesign, Entypo } from "@expo/vector-icons";

export default function Proposal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('softCopy');

  const Goback = () => {
    router.push("/GAD_services");
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] p-4 mt-11">
      {/* back */}
      <TouchableOpacity onPress={Goback} className="flex-row items-center mb-4">
        <AntDesign name="arrowleft" size={24} color="black" />
        <Text className="text-black text-lg ml-2">Back</Text>
      </TouchableOpacity>

      {/* Outer container */}
      <View className="bg-[#1E3A5A] rounded-lg p-2 h-[60px] w-full flex justify-center">
        {/* Tab container */}
        <View className="flex-row bg-[#1E3A5A] rounded-lg overflow-hidden ">
          <TouchableOpacity 
            onPress={() => setActiveTab('softCopy')}
            className={`flex-1 py-3 ${activeTab === 'softCopy' ? 'bg-white' : ''}`}
          >
            <Text 
              className={`text-center ${
                activeTab === 'softCopy' ? 'text-[#1E3A5A]' : 'text-white'
              }`}
            >
              Soft Copy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('supportingDoc')}
            className={`flex-1 py-3 ${activeTab === 'supportingDoc' ? 'bg-white' : ''}`}
          >
            <Text 
              className={`text-center ${
                activeTab === 'supportingDoc' ? 'text-[#1E3A5A]' : 'text-white'
              }`}
            >
              Supporting Document
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'softCopy' ? (
        <View>
          <Text>Soft Copy Content</Text>
        </View>
      ) : (
        <View>
          <Text>Supporting Document Content</Text>
        </View>
      )}
    </View>
  );
}