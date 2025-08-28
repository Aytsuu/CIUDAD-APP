import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// --- Added imports for mutation and schema ---
import { useAddPersonalCertification } from "./queries/certificationReqInsertQueries";
import { CertificationRequestSchema } from "@/form-schema/certificates/certification-request-schema";
import { usePurposeAndRates, type PurposeAndRate } from "./queries/certificationReqFetchQueries";
import { SelectLayout, type DropdownOption } from "@/components/ui/select-layout";

interface CertFormProps {
  navigation?: NativeStackNavigationProp<any>;
}

const CertForm: React.FC<CertFormProps> = ({ navigation }) => {
  const [personalType, setPersonalType] = useState("");
  const [certType, setCertType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [claimDate, setClaimDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const addPersonalCert = useAddPersonalCertification();
  const { data: purposeData = [], isLoading: isLoadingPurposes } = usePurposeAndRates();
  

  
  const purposeOptions: DropdownOption[] = purposeData
    .filter((purpose: PurposeAndRate) => !purpose.pr_is_archive)
    .map((purpose: PurposeAndRate) => ({
      label: `${purpose.pr_purpose}`,
      value: purpose.pr_purpose
    }));

  
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
    
    const result = CertificationRequestSchema.safeParse({
      cert_type: "personal",
      requester: "user", // This should come from auth context
      purposes: [purpose], // Convert single purpose to array
      claimDate: claimDate ? claimDate.toISOString().split("T")[0] : "",
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    addPersonalCert.mutate({
      cert_type: "personal",
      requester: "user", // This should come from auth context
      purposes: [purpose], // Convert single purpose to array
      claimDate: claimDate ? claimDate.toISOString().split("T")[0] : "",
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
        {/* Purpose */}
        <SelectLayout
          options={purposeOptions}
          selectedValue={purpose}
          onSelect={(option) => {
            setPurpose(option.value);
            setPersonalType(option.value);
          }}
          placeholder={isLoadingPurposes ? "Loading..." : "Select purpose"}
          label="Purpose of Request"
          disabled={isLoadingPurposes}
        />

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
        {/* Removed payment mode field */}
      </View>

      {personalType && (
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <Text className="text-green-800 text-sm font-medium mb-1">Amount to be Paid:</Text>
            <Text className="text-green-700 text-lg font-bold">
              {(() => {
                const selectedPurpose = purposeData.find(p => p.pr_purpose === personalType);
                return selectedPurpose ? `₱${selectedPurpose.pr_rate.toLocaleString()}` : '₱0';
              })()}
            </Text>
          </View>
        )}

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