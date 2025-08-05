import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
// import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// --- Added imports for mutation and schema ---
import { useAddPersonalCertification } from "./queries/certificationReqInsertQueries";
import { certificationRequestSchema } from "./queries/certificationReqInsertQueries";

interface CertFormProps {
  navigation?: NativeStackNavigationProp<any>;
}

const CertForm: React.FC<CertFormProps> = ({ navigation }) => {
  const [certType, setCertType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [claimDate, setClaimDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");
  const [error, setError] = useState<string | null>(null);

  
  const addPersonalCert = useAddPersonalCertification();

  
  const handleSubmit = () => {
    setError(null);
    
    // Validate that both certType and purpose are selected
    if (!certType) {
      setError("Please select a certification type");
      return;
    }
    
    if (!purpose) {
      setError("Please select a purpose");
      return;
    }
    
    if (!claimDate) {
      setError("Please select a claim date");
      return;
    }
    
    if (!paymentMode) {
      setError("Please select a payment mode");
      return;
    }
    
    const result = certificationRequestSchema.safeParse({
      cert_type: "personal",
      cert_category: purpose, // Changed from certType to purpose
      claim_date: claimDate ? claimDate.toISOString().split("T")[0] : "",
      payment_mode: paymentMode,
    });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    addPersonalCert.mutate({
      cert_type: "personal",
      cert_category: purpose, // Changed from certType to purpose
      claim_date: claimDate ? claimDate.toISOString().split("T")[0] : "",
      payment_mode: paymentMode,
    });
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      {/* Loading Overlay */}
      {addPersonalCert.status === 'pending' && (
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

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation?.goBack?.()} className="mb-4">
        <Ionicons name="arrow-back" size={24} color="#222" />
      </TouchableOpacity>

      {/* Title */}
      <Text className="text-xl font-bold text-gray-900 mb-6">Submit a Request</Text>

      {/* Error Message */}
      {error && (
        <Text className="text-red-500 mb-2 text-sm">{error}</Text>
      )}
      {addPersonalCert.status === 'error' && (
        <Text className="text-red-500 mb-2 text-sm">Failed to submit request.</Text>
      )}

      {/* Form Fields */}
      <View className="space-y-6">
        {/* Certification Type */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Type of Certification</Text>
          <View className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
            {/* <Picker
              selectedValue={certType}
              onValueChange={setCertType}
              style={{ color: "#222", fontSize: 14 }}
              dropdownIconColor="#222"
            >
              <Picker.Item label="Select certification type" value="" color="#888" />
              <Picker.Item label="Barangay Clearance" value="clearance" />
              <Picker.Item label="Indigency" value="indigency" />
              <Picker.Item label="Residency" value="residency" />
            </Picker> */}
          </View>
        </View>

        {/* Purpose */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Purpose of Request</Text>
          <View className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
            {/* <Picker
              selectedValue={purpose}
              onValueChange={setPurpose}
              style={{ color: "#222", fontSize: 14 }}
              dropdownIconColor="#222"
            >
              <Picker.Item label="Select purpose" value="" color="#888" />
              <Picker.Item label="Employment" value="employment" />
              <Picker.Item label="NSO/GSIS/SSS" value="nso-gsis-sss" />
              <Picker.Item label="Hospitalization/Champ" value="hospitalization-champ" />
              <Picker.Item label="Birth Certificate" value="birth-certificate" />
              <Picker.Item label="Medical Assistance" value="medical-assistance" />
              <Picker.Item label="Residency" value="residency" />
              <Picker.Item label="Police Requirement" value="police-requirement" />
              <Picker.Item label="Burial" value="burial" />
              <Picker.Item label="Death" value="death" />
              <Picker.Item label="Indigency Claim" value="indigency-claim" />
              <Picker.Item label="Complaint" value="complaint" />
              <Picker.Item label="Filing Fee" value="filing-fee" />
              <Picker.Item label="Certificate to File Action" value="certificate-to-file-action" />
            </Picker> */}
          </View>
        </View>

        {/* Claim Date */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Claim Date</Text>
          <TouchableOpacity
            className="bg-white rounded-lg px-3 py-3 shadow-sm border border-gray-200"
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <View className="flex-row justify-between items-center">
              <Text className={claimDate ? "text-gray-900 text-sm" : "text-gray-400 text-sm"}>
                {claimDate ? claimDate.toLocaleDateString() : "Select claim date"}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#888" />
            </View>
          </TouchableOpacity>
        </View>

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

        {/* Payment Mode */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Mode of Payment</Text>
          <View className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
            {/* <Picker
              selectedValue={paymentMode}
              onValueChange={setPaymentMode}
              style={{ color: "#222", fontSize: 14 }}
              dropdownIconColor="#222"
            >
              <Picker.Item label="Select payment mode" value="" color="#888" />
              <Picker.Item label="Cash" value="cash" />
              <Picker.Item label="GCash" value="gcash" />
            </Picker> */}
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`bg-[#00AFFF] rounded-lg py-3 items-center mt-8 shadow-md ${addPersonalCert.status === 'pending' ? 'opacity-50' : ''}`}
        activeOpacity={0.85}
        onPress={handleSubmit}
        disabled={addPersonalCert.status === 'pending'}
      >
        <Text className="text-white font-semibold text-base">
          {addPersonalCert.status === 'pending' ? 'Submitting...' : 'Submit Request'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CertForm;