import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Platform, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
// import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// --- Added imports for mutation and schema ---
import { useAddBusinessPermit } from "./queries/certificationReqInsertQueries";
import { certificationRequestSchema } from "./queries/certificationReqInsertQueries";

interface CertPermitProps {
  navigation?: NativeStackNavigationProp<any>;
}

const CertPermit: React.FC<CertPermitProps> = ({ navigation }) => {
  const [permitType, setPermitType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [grossSales, setGrossSales] = useState("");
  const [claimDate, setClaimDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");
  const [businessExistenceImage, setBusinessExistenceImage] = useState<string | null>(null);
  const [grossSalesImage, setGrossSalesImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Use mutation hook ---
  const addBusinessPermit = useAddBusinessPermit();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return false;
    }
    return true;
  };

  const pickImage = async (imageSetter: (uri: string) => void) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      imageSetter(result.assets[0].uri);
    }
  };

  const removeImage = (imageSetter: (uri: string | null) => void) => {
    imageSetter(null);
  };

  // --- Submit handler ---
  const handleSubmit = () => {
    setError(null);
    const result = certificationRequestSchema.safeParse({
      cert_type: "permit",
      business_name: businessName,
      business_address: businessAddress,
      gross_sales: grossSales,
      claim_date: claimDate ? claimDate.toISOString().split("T")[0] : "",
      payment_mode: paymentMode,
      business_existence_image: businessExistenceImage ? [businessExistenceImage] : [],
      gross_sales_image: grossSalesImage ? [grossSalesImage] : [],
    });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    addBusinessPermit.mutate({
      cert_type: "permit",
      business_name: businessName,
      business_address: businessAddress,
      gross_sales: grossSales,
      claim_date: claimDate ? claimDate.toISOString().split("T")[0] : "",
      payment_mode: paymentMode,
      business_existence_image: businessExistenceImage ? [businessExistenceImage] : [],
      gross_sales_image: grossSalesImage ? [grossSalesImage] : [],
    });
  };

  return (
    <View className="flex-1  px-4 pt-8">
      {/* Loading Overlay */}
      {addBusinessPermit.status === 'pending' && (
        <View className="absolute inset-0 bg-black bg-opacity-50 z-50 items-center justify-center">
          <View className="bg-white rounded-xl p-6 items-center shadow-lg">
            <ActivityIndicator size="large" color="#00AFFF" />
            <Text className="text-gray-800 font-semibold text-lg mt-4">Submitting...</Text>
            <Text className="text-gray-600 text-sm mt-2 text-center">
              Please wait while we process your request
            </Text>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation?.goBack?.()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        {/* Title */}
        <Text className="text-xl font-bold text-gray-800 mb-6">Clearance for Permit</Text>

        {/* Error Message */}
        {error && (
          <Text className="text-red-500 mb-2 text-sm">{error}</Text>
        )}
        {addBusinessPermit.status === 'error' && (
          <Text className="text-red-500 mb-2 text-sm">Failed to submit request.</Text>
        )}

        {/* Permit Type Dropdown */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Type of Clearance</Text>
        <View className="rounded-lg bg-white px-3 mb-3 border border-gray-200">
          {/* <Picker
            selectedValue={permitType}
            onValueChange={setPermitType}
            style={{ color: "#222" }}
            dropdownIconColor="#222"
          >
            <Picker.Item label="Clearance for permits" value="" color="#888" />
            <Picker.Item label="Business Permit" value="business-permit" />
          </Picker> */}
        </View>
        {/* Business Name */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Business Name</Text>
        <TextInput
          className="rounded-lg bg-white px-3 py-3 mb-3 border border-gray-200 text-base"
          placeholder="Business Name"
          placeholderTextColor="#888"
          value={businessName}
          onChangeText={setBusinessName}
        />
        {/* Business Address */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Business Address</Text>
        <TextInput
          className="rounded-lg bg-white px-3 py-3 mb-3 border border-gray-200 text-base"
          placeholder="Business Address"
          placeholderTextColor="#888"
          value={businessAddress}
          onChangeText={setBusinessAddress}
        />
        {/* Annual Gross Sales */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Annual Gross Sales</Text>
        <TextInput
          className="rounded-lg bg-white px-3 py-3 mb-3 border border-gray-200 text-base"
          placeholder="Annual Gross Sales"
          placeholderTextColor="#888"
          value={grossSales}
          onChangeText={setGrossSales}
          keyboardType="numeric"
        />
        {/* Supporting Documents */}
        <View className="rounded-xl p-4 mb-3">
          <Text className="font-semibold text-gray-700 mb-2">Supporting Documents</Text>
          {/* Proof of Business Existence */}
          <Text className="text-sm text-gray-600 mb-2">Proof of Business Existence (e.g. DTI)</Text>
          <View className="relative">
            {businessExistenceImage ? (
              <View className="relative">
                <Image source={{ uri: businessExistenceImage }} className="w-full h-32 rounded-lg" resizeMode="cover" />
                <TouchableOpacity 
                  className="absolute top-2 right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  onPress={() => removeImage(setBusinessExistenceImage)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                className="bg-gray-200 rounded-lg h-32 items-center justify-center mb-4"
                onPress={() => pickImage(setBusinessExistenceImage)}
              >
                <Ionicons name="image-outline" size={40} color="#888" />
                <Text className="text-gray-500 mt-2">Upload Image</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Proof of Annual Gross Sales */}
          <Text className="text-sm text-gray-600 mb-2">Proof of Annual Gross Sales (e.g. OR or Sales Inventory)</Text>
          <View className="relative">
            {grossSalesImage ? (
              <View className="relative">
                <Image source={{ uri: grossSalesImage }} className="w-full h-32 rounded-lg" resizeMode="cover" />
                <TouchableOpacity 
                  className="absolute top-2 right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  onPress={() => removeImage(setGrossSalesImage)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                className="bg-gray-200 rounded-lg h-32 items-center justify-center"
                onPress={() => pickImage(setGrossSalesImage)}
              >
                <Ionicons name="image-outline" size={40} color="#888" />
                <Text className="text-gray-500 mt-2">Upload Image</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Claim Date Picker */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Claim Date</Text>
        <TouchableOpacity
          className="rounded-lg bg-white px-3 py-3 mb-3 border border-gray-200"
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <View className="flex-row justify-between items-center">
            <Text className={claimDate ? "text-gray-800 text-base" : "text-gray-400 text-base"}>
              {claimDate ? claimDate.toLocaleDateString() : "Claim Date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#888" />
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={claimDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setClaimDate(date);
            }}
          />
        )}
        {/* Mode of Payment Dropdown */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Mode of Payment</Text>
        <View className="rounded-lg bg-white px-3 mb-3 border border-gray-200">
          {/* <Picker
            selectedValue={paymentMode}
            onValueChange={setPaymentMode}
            style={{ color: "#222" }}
            dropdownIconColor="#222"
          >
            <Picker.Item label="Mode of Payment" value="" color="#888" />
            <Picker.Item label="Cash" value="cash" />
            <Picker.Item label="GCash" value="gcash" />
          </Picker> */}
        </View>
        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-[#00AFFF] rounded-xl py-4 items-center mt-2 mb-8 ${addBusinessPermit.status === 'pending' ? 'opacity-50' : ''}`}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={addBusinessPermit.status === 'pending'}
        >
          <Text className="text-white font-semibold text-base">
            {addBusinessPermit.status === 'pending' ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CertPermit;
