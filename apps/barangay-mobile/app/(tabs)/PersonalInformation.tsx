import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import "../../global.css";

const PersonalInformation = () => {
  const router = useRouter();
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [MiddleName, setMiddlName] = useState('');
  const [Suffix, setSuffix] = useState('');
  const [Sex, setSex] = useState('');
  const [CivilStatus, setCivilStatus] = useState('');
  const [POB, setPOB] = useState(''); // Place of Birth
  const [Citizenship, setCitizenship] = useState('');
  const [Religion, setReligion] = useState('');
  const [Address, setAddress] = useState('');
  const [Contact, setContact] = useState('');
  const [Occupation, setOccupation] = useState('');
  const [DateResidency, setDateResidency] = useState('');

  const handleProceed = () => {
    if (FirstName) {
      console.log('Proceeding with info:', FirstName, LastName, MiddleName, Suffix, Sex, CivilStatus, POB, Citizenship, Religion, Address, Contact, Occupation, DateResidency);
      router.push('/MotherInformation');

    } else {
      alert('Please fill out all required fields.');
    }
  };

  const handleGoBack = () => {
    router.push('/RegisterAccount');
  };

  return (
    <ScrollView className="flex-1 bg-[#ECF8FF] px-6">
      {/* Header Section */}
      <TouchableOpacity onPress={handleGoBack} className="pt-8">
        <Text className="text-[#0F172A] text-[20px] font-medium">← Back</Text>
      </TouchableOpacity>

      {/* Title and Subtitle */}
      <View className="mt-6">
        <Text className="text-[#1E293B] text-[22px] font-bold">Personal Information</Text>
        <Text className="text-black text-[16px] mt-5 italic">Please fill out all required fields.</Text>
      </View>

      {/* Inputs Section */}
      <View className="mt-6">
        {/* First Name */}
        <View className="bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="First Name"
            value={FirstName}
            onChangeText={setFirstName}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Last Name */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Last Name"
            value={LastName}
            onChangeText={setLastName}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Middle Name */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Middle Name"
            value={MiddleName}
            onChangeText={setMiddlName}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Suffix */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Suffix (e.g., Jr, Sr)"
            value={Suffix}
            onChangeText={setSuffix}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Sex and Civil Status */}
        <View className="mt-6 flex-row justify-between">
          {/* Sex */}
          <View className="flex-1 bg-white rounded-md px-4 py-3 border border-gray-300 mr-3">
            <Picker
              selectedValue={Sex}
              onValueChange={(itemValue) => setSex(itemValue)}
            >
              <Picker.Item label="Sex" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {/* Civil Status */}
          <View className="flex-1 bg-white rounded-md px-4 py-3 border border-gray-300 ">
            <Picker
              selectedValue={CivilStatus}
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

        {/* Place of Birth */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Place of Birth"
            value={POB}
            onChangeText={setPOB}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Citizenship */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Citizenship"
            value={Citizenship}
            onChangeText={setCitizenship}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Religion */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Religion"
            value={Religion}
            onChangeText={setReligion}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Address */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Address"
            value={Address}
            onChangeText={setAddress}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Contact No. */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Contact No."
            value={Contact}
            onChangeText={setContact}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Occupation */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Occupation"
            value={Occupation}
            onChangeText={setOccupation}
            className="text-[#475569] text-[14px]"
          />
        </View>

        {/* Date of Residency */}
        <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
          <TextInput
            placeholder="Date of Residency"
            value={DateResidency}
            onChangeText={setDateResidency}
            className="text-[#475569] text-[14px]"
          />
        </View>
      </View>

      {/* Proceed Button */}
      <View className="mt-8 pb-8">
        <TouchableOpacity
          onPress={handleProceed}
          className="bg-[#00A8F0] rounded-md py-3.5 items-center justify-center">
          <Text className="text-white font-bold text-[18px]">Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PersonalInformation;
