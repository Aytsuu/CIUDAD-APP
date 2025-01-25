import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import "../../global.css";

const RegisterAccount = () => {
  const router = useRouter();
  const [Username, setUsername] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [RePass, setRePass] = useState('');


  const handleProceed = () => {
    if (Username) {
      console.log('Proceeding with info:', Username, Email, Password, RePass);
      // Add additional logic if needed
      router.push('/PersonalInformation');

    } else {
      alert('Please fill out all required fields.');
    }
  };

  const handleGoBack = () => {
    router.push('/DemographicData');
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] px-6">
      {/* Header Section */}
      <TouchableOpacity onPress={handleGoBack} className="pt-8">
        <Text className="text-[#0F172A] text-[20px] font-medium">← Back</Text>
      </TouchableOpacity>

      {/* Title and Subtitle */}
      <View className="mt-6">
        <Text className="text-[#1E293B] text-[22px] font-bold">Register Account</Text>
        <Text className="text-black text-[16px] mt-5 italic">
          Please fill out all required fields.
        </Text>
      </View>

      {/* Username */}
      <View className="mt-6">
        <View className="bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Username."
            value={Username}
            onChangeText={setUsername}
            className="text-[#475569] text-[14px]"
          />
        </View>
      </View>

      {/* Email  */}
      <View className="mt-6">
        <View className="bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Email"
            value={Email}
            onChangeText={setEmail}
            className="text-[#475569] text-[14px]"
          />
        </View>
      </View>

      {/* Password  */}
      <View className="mt-6">
        <View className="bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Family No. (Leave blank if none)"
            value={Password}
            onChangeText={setPassword}
            className="text-[#475569] text-[14px]"
          />
        </View>
      </View>

      {/* Re-password */}
      <View className="mt-6">
        <View className="bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Family No. (Leave blank if none)"
            value={RePass}
            onChangeText={setRePass}
            className="text-[#475569] text-[14px]"
          />
        </View>
      </View>

    <View className="mt-auto pb-8">
        <TouchableOpacity
           onPress={handleProceed}
             className="bg-[#00A8F0] rounded-md py-3.5 items-center justify-center">
              <Text className="text-white font-bold text-[18px]">Next</Text>
            </TouchableOpacity>
          </View>
         </View>
  );
};

export default RegisterAccount;
