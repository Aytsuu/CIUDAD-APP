import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import "../../global.css";

const FatherInformation = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleProceed = () => {
    if (firstName) {
      console.log('Proceeding with info:', firstName, lastName, middleName, suffix, civilStatus, dateOfBirth);
      router.push('/ListDependent');  
    } else {
      alert('Please fill out all required fields.');
    }
  };

  const handleGoBack = () => {
    router.push('/MotherInformation');  
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] px-6 justify-between">
      {/* Main Content */}
      <View>
        {/* Header Section */}
        <TouchableOpacity onPress={handleGoBack} className="pt-8">
          <Text className="text-[#0F172A] text-[20px] font-medium">← Back</Text>
        </TouchableOpacity>

        {/* Title and Subtitle */}
        <View className="mt-6">
          <Text className="text-[#1E293B] text-[22px] font-bold">Father Information</Text>
        </View>

        {/* Inputs Section */}
        <View className="mt-6">
          {/* First Name */}
          <View className="bg-white rounded-md px-4 py-3 border border-gray-300 mb-6">
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              className="text-[#475569] text-[14px]"
            />
          </View>

          {/* Last Name */}
          <View className="bg-white rounded-md px-4 py-3 border border-gray-300 mb-6">
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              className="text-[#475569] text-[14px]"
            />
          </View>

          {/* Middle Name */}
          <View className="bg-white rounded-md px-4 py-3 border border-gray-300 mb-6">
            <TextInput
              placeholder="Middle Name"
              value={middleName}
              onChangeText={setMiddleName}
              className="text-[#475569] text-[14px]"
            />
          </View>

          {/* Suffix */}
          <View className="bg-white rounded-md px-4 py-3 border border-gray-300 mb-6">
            <TextInput
              placeholder="Suffix (e.g., Jr, Sr)"
              value={suffix}
              onChangeText={setSuffix}
              className="text-[#475569] text-[14px]"
            />
          </View>

          {/* Date of Birth */}
          <View className="bg-white rounded-md px-4 py-3 border border-gray-300 mb-6">
            <TextInput
              placeholder="Date of Birth"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              className="text-[#475569] text-[14px]"
            />
          </View>

          {/* Civil Status */}
          <View className="bg-white rounded-md px-4 py-3 border border-gray-300 mb-6">
            <Picker
              selectedValue={civilStatus}
              onValueChange={(itemValue) => setCivilStatus(itemValue)}
            >
              <Picker.Item label="Civil Status" value="" />
              <Picker.Item label="Single" value="Single" />
              <Picker.Item label="Married" value="Married" />
              <Picker.Item label="Widowed" value="Widowed" />
              <Picker.Item label="Separated" value="Separated" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Proceed Button */}
      <View className="pb-8">
        <TouchableOpacity
          onPress={handleProceed}
          className="bg-[#00A8F0] rounded-md py-3.5 items-center justify-center">
          <Text className="text-white font-bold text-[18px]">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FatherInformation;
