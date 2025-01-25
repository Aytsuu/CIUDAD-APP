import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import "../../global.css";

const RecommendedIDsScreen = () => {
  const router = useRouter();
  const [selectedID, setSelectedID] = useState('');
  const [uploadedID, setUploadedID] = useState(null);
  const [photo, setPhoto] = useState(null);

  const handleGoBack = () => {
    router.push('/ListDependent'); 
  };

  const handleSubmit = () => {
    if (selectedID) {
      console.log('ID:', selectedID, 'Uploaded ID:', uploadedID, 'Photo:', photo);
      router.push('/ConfirmRegister');
    } else {
      alert('Please fill out all fields before submitting.');
    }
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] px-6">
      {/* Header Section */}
      <TouchableOpacity onPress={handleGoBack} className="pt-8">
        <Text className="text-[#0F172A] text-[20px] font-medium">← Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <View className="mt-6">
        <Text className="text-[#1E293B] text-[22px] font-bold">Recommended IDs</Text>
        <Text className="text-black text-[16px] mt-2">
          Choose an ID for account registration (Other, if not available)
        </Text>
      </View>

      {/* Choose ID Picker */}
      <View className="mt-6 bg-white rounded-md px-4 py-3 border border-gray-300">
        <Picker
          selectedValue={selectedID}
          onValueChange={(itemValue, itemIndex) => setSelectedID(itemValue)}
          style={{ color: '#475569', fontSize: 14 }}
        >
          <Picker.Item label="Choose your ID" value="" />
          <Picker.Item label="Driver's License" value="Driver's License" />
          <Picker.Item label="UMID" value="UMID" />
          <Picker.Item label="Philhealth ID" value="Philhealth ID" />
          <Picker.Item label="Passport" value="Passport" />
          <Picker.Item label="SSS ID" value="SSS ID" />
          <Picker.Item label="Voter's ID" value="Voter's ID" />
          <Picker.Item label="National ID" value="National ID" />
          <Picker.Item label="HDMF (Pag-ibig ID)" value="HDMF" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      {/* Upload ID Section */}
      <View className="mt-6 bg-[#E0F2FF] rounded-md px-4 py-3">
        <Text className="text-[#1E293B] text-[16px] mb-4">
          Upload ID or government issued document (e.g., birth certificate).
        </Text>
        <TouchableOpacity
          onPress={() => alert('Upload ID pressed')}
          className="bg-white rounded-md border border-gray-300 py-10 items-center justify-center"
        >
          <Image
            source={require('../../assets/images/addimage.png')} // Replace with actual icon
            style={{ width: 40, height: 40 }}
          />
          <Text className="text-[#475569] text-[14px] mt-2">Upload your ID here </Text>
        </TouchableOpacity>
      </View>

      {/* Take Photo Section */}
      <View className="mt-6 bg-[#E0F2FF] rounded-md px-4 py-3">
        <Text className="text-[#1E293B] text-[16px] mb-4">Please ensure the photo is clear.</Text>
        <TouchableOpacity
          onPress={() => alert('Open Camera pressed')}
          className="bg-white rounded-md border border-gray-300 py-10 items-center justify-center"
        >
          <Image
            source={require('../../assets/images/Camera.png')} // Replace with actual icon
            style={{ width: 40, height: 40 }}
          />
          <Text className="text-[#475569] text-[14px] mt-2">Click to open camera </Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <View className="mt-auto pb-8">
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-[#00A8F0] rounded-md py-3.5 items-center justify-center"
        >
          <Text className="text-white font-bold text-[18px]">Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecommendedIDsScreen;
