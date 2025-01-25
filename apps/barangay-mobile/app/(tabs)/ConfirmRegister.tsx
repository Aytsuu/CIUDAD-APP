import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import "../../global.css";

const ConfirmRegistration = () => {
  const router = useRouter();

  const handleConfirm = () => {
    alert('Registration Confirmed');
    // router.push('/Registered'); 
  };

  const handleCancel = () => {
    router.push('/IDAndPhoto'); 
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] px-6">
      {/* Confirmation Box */}
      <View className="mt-24 bg-[#E0F2FF] rounded-md px-6 py-8 items-center">
        <Text className="text-[#1E293B] text-[22px] font-bold mb-2">Confirm Registration</Text>
        <Text className="text-[#475569] text-[16px] text-center">
          Please confirm if you would like to proceed with submitting the registration.
        </Text>
      </View>

      {/* Buttons */}
      <View className="mt-auto pb-8">
        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-[#00A8F0] rounded-md py-3.5 items-center justify-center mb-4"
        >
          <Text className="text-white font-bold text-[18px]">Confirm</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={handleCancel}
          className="bg-[#ECF8FF] border border-gray-300 rounded-md py-3.5 items-center justify-center"
        >
          <Text className="text-[#475569] font-bold text-[18px]">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConfirmRegistration;
