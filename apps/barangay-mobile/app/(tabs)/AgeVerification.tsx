import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import "../../global.css";

const AgeVerification = () => {
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [residency, setResidency] = useState('');

  const handleNext = () => {
    if (dob && residency) {
      console.log('Proceeding with DOB:', dob, 'Residency:', residency);
      // Add additional logic if needed
      router.push('/DemographicData');

    } else {
      alert('Please complete all fields');
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] px-4">
      <TouchableOpacity onPress={handleGoBack} className="pt-8">
        <Text className="text-black text-[20px]">← Back</Text>
      </TouchableOpacity>

      <View className="mt-6">
        <Text className="text-black text-[22px] font-extrabold mb-5">Verifying Identity</Text>
        <Text className="text-black text-[16px]">
          Please enter your date of birth and residency to continue:
        </Text>
      </View>

      <View className="mt-6">
        <Text className="text-black font-bold text-[16px] mb-4">Date of Birth</Text>
        <View className="bg-white rounded-md flex-row items-center px-5 py-3 border border-gray-300">
          <TextInput
            placeholder="MM/DD/YYYY"
            value={dob}
            onChangeText={setDob}
            className="text-gray-600 text-[16px] flex-1"
          />
          <TouchableOpacity>
            <Text className="text-[#00A8F0] text-[20px]">📅</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-6">
        <Text className="text-black font-bold text-[16px] mb-5">Residency</Text>
        <TouchableOpacity
          onPress={() => setResidency('Permanent')}
          className="flex-row items-center mb-4"
        >
          <View className={`w-5 h-5 mr-2 rounded-full border ${residency === 'Permanent' ? 'bg-[#00A8F0]' : 'border-gray-400'}`} />
          <Text className="text-black text-[16px]">Permanent: long term resident</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setResidency('Temporary')}
          className="flex-row items-center"
        >
          <View className={`w-5 h-5 mr-2 rounded-full border ${residency === 'Temporary' ? 'bg-[#00A8F0]' : 'border-gray-400'}`} />
          <Text className="text-black text-[16px]">Temporary: short term stay</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-auto pb-8">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-[#00A8F0] rounded-md py-3.5 items-center justify-center"
        >
          <Text className="text-white font-bold text-[18px]">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AgeVerification;
