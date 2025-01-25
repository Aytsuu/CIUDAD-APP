import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import "../../global.css";

const DependentsScreen = () => {
  const router = useRouter();

  const handleProceed = () => {
    router.push('/IDAndPhoto'); 
  };

  const handleAddDependent = () => {
    router.push('/CreateDependent'); 
  };

  const handleGoBack = () => {
    router.push('/FatherInformation'); 
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] px-5">
      {/* Header Section */}
      <TouchableOpacity onPress={handleGoBack} className="pt-8">
        <Text className="text-[#0F172A] text-[20px] font-medium">← Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <View className="mt-6">
        <Text className="text-[#1E293B] text-[22px] font-bold">Dependents</Text>
      </View>

      {/* Blank White Area */}
      <View className="mt-6 flex-1 bg-white rounded-md shadow-md mb-12"></View>

      {/* Action Buttons */}
      <View className="mt-auto pb-8">
        <TouchableOpacity
          className="bg-[#137F8B] rounded-md py-3.5 items-center justify-center mb-4"
          onPress={handleAddDependent}
        >
          <Text className="text-white font-bold text-[18px]">Add Dependent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleProceed}
          className="bg-[#00A8F0] rounded-md py-3.5 items-center justify-center"
        >
          <Text className="text-white font-bold text-[18px]">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DependentsScreen;
