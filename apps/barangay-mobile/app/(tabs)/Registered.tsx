import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import "../../global.css";

const Registered = () => {
  const router = useRouter();

  const handleOkay = () => {
    // router.push('/index');
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] items-center justify-between px-6">
      {/* Success Icon and Message */}
      <View className="flex-1 justify-center items-center">
        <View className="bg-[#22C55E] rounded-full w-24 h-24 items-center justify-center">
        </View>
        <Text className="text-[#1E293B] text-[22px] font-bold mt-4">Registration Submitted!</Text>
      </View>

      {/* Instruction Box */}
      <View className="w-full bg-[#E0F2FF] rounded-md px-6 py-8">
        <Text className="text-[#1E293B] text-[16px] font-medium text-center mb-4">
          Please go to barangay to verify your account.
        </Text>
        <TouchableOpacity
          onPress={handleOkay}
          className="bg-[#00A8F0] rounded-md py-3.5 items-center justify-center"
        >
          <Text className="text-white font-bold text-[18px]">Okay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Registered;
