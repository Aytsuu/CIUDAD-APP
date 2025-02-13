import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { AntDesign, Entypo } from "@expo/vector-icons";

export default function Proposal() {
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState("All");
  
  const proposals = [
    {
      title: "Vivamus a tellus",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      status: "Approved",
      date: "November 15, 2023",
    },
    {
      title: "Lorem Ipsum",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      status: "Rejected",
      date: "November 15, 2023",
      reason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porttitor congue massa.",
    },
  ];

  const filteredProposals = proposals.filter(
    (proposal) => selectedStatus === "All" || proposal.status === selectedStatus
  );

  const Goback = () => {
    router.push("/GAD_services");
  };

  const proposalFile = () => {
    router.push("/GAD_PropProjFile");
  };

  return (
    <ScrollView className="flex-1 bg-[#ECF8FF] p-4 mt-11" showsVerticalScrollIndicator={false}>
      {/* back */}
      <TouchableOpacity onPress={Goback} className="flex-row items-center mb-4">
        <AntDesign name="arrowleft" size={24} color="black" />
        <Text className="text-black text-lg ml-2">Back</Text>
      </TouchableOpacity>

      <Text className="text-center text-2xl font-bold text-[#0A1D56] mt-11 mb-8">Project Proposal</Text>

      <View className="flex-row justify-start mb-4 items-center">
        
        <View className="bg-white rounded-md p-1 shadow-md w-[130px] h-[40px] justify-center">
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(itemValue) => setSelectedStatus(itemValue)}
            style={{width: 135, fontSize: 16 }}
          >
            <Picker.Item label="All" value="All" style={{fontSize: 12}}/>
            <Picker.Item label="Approved" value="Approved" style={{fontSize: 12}} />
            <Picker.Item label="Rejected" value="Rejected" style={{fontSize: 12}} />
          </Picker>
        </View>
      </View>
      {filteredProposals.map((proposal, index) => (
        <TouchableOpacity key={index} onPress={proposalFile}>
          <View className="bg-white rounded-xl p-4 mb-4 shadow-lg">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-[#0A1D56]">{proposal.title}</Text>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </View>
            <Text className="text-gray-700 mt-4 mb-4">{proposal.description}</Text>
            <Text className="mt-4 mb-2 font-semibold text-black">
              Status: <Text className={proposal.status === "Approved" ? "text-green-600" : "text-red-600"}>{proposal.status}</Text>
            </Text>
            <Text className="text-black mb-2">
              {proposal.status === "Approved" ? "Date of Approval" : "Date of Rejection"}: {proposal.date}
            </Text>
            {proposal.reason && (
              <Text className="text-black mt-2">
                Reason: <Text className="text-gray-700">{proposal.reason}</Text>
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
