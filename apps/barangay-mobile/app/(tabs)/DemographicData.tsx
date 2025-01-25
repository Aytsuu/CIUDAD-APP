import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import "../../global.css";

const DemographicData = () => {
  const router = useRouter();
  const [householdNo, setHouseholdNo] = useState('');
  const [familyNo, setFamilyNo] = useState('');

  const handleProceed = () => {
    if (householdNo) {
      console.log('Proceeding with Household No:', householdNo, 'Family No:', familyNo);
      // Add additional logic if needed
      router.push('/RegisterAccount');

    } else {
      alert('Please fill out all required fields.');
    }
  };

  const handleGoBack = () => {
    router.push('/AgeVerification');
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] px-6">
      {/* Header Section */}
      <TouchableOpacity onPress={handleGoBack} className="pt-8">
        <Text className="text-[#0F172A] text-[20px] font-medium">← Back</Text>
      </TouchableOpacity>

      {/* Title and Subtitle */}
      <View className="mt-6">
        <Text className="text-[#1E293B] text-[22px] font-bold">Demographic Data</Text>
        <Text className="text-black text-[16px] mt-5 italic">
          Please fill out all required fields.
        </Text>
      </View>

      {/* Household No. Input */}
      <View className="mt-6">
        <View className="bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Household No."
            value={householdNo}
            onChangeText={setHouseholdNo}
            className="text-[#475569] text-[14px]"
          />
        </View>
      </View>

      {/* Family No. Input */}
      <View className="mt-6">
        <View className="bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Family No. (Leave blank if none)"
            value={familyNo}
            onChangeText={setFamilyNo}
            className="text-[#475569] text-[14px]"
          />
        </View>
      </View>

      <View className="mt-auto pb-8">
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

export default DemographicData;
