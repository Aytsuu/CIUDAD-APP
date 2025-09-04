import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useAddPersonalCertification } from "./queries/certificationReqInsertQueries";
import { CertificationRequestSchema } from "@/form-schema/certificates/certification-request-schema";
import { usePurposeAndRates, type PurposeAndRate } from "./queries/certificationReqFetchQueries";
import { SelectLayout, type DropdownOption } from "@/components/ui/select-layout";

const CertForm: React.FC = () => {
  const router = useRouter();
  const [personalType, setPersonalType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const addPersonalCert = useAddPersonalCertification();
  const { data: purposeData = [], isLoading: isLoadingPurposes } = usePurposeAndRates();
  

  
  const purposeOptions: DropdownOption[] = purposeData
    .filter((purpose: PurposeAndRate) => {
      return !purpose.pr_is_archive && 
             (purpose.pr_category === "Personal and Others" || 
              purpose.pr_category === "Personal" ||
              purpose.pr_category.toLowerCase().includes("personal"));
    })
    .map((purpose: PurposeAndRate) => ({
      label: `${purpose.pr_purpose}`,
      value: purpose.pr_purpose
    }));

  
  const handleSubmit = () => {
    setError(null);
    
    // Validate that purpose is selected
    if (!purpose) {
      setError("Please select a purpose");
      return;
    }
    
    const result = CertificationRequestSchema.safeParse({
      cert_type: "personal",
      requester: "user", // This should come from auth context
      purposes: [purpose], 
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    const selectedPurposeId = purposeData.find(p => p.pr_purpose === personalType)?.pr_id;
    addPersonalCert.mutate({
      cert_type: "personal",
      requester: "user", 
      purposes: [purpose], 
      pr_id: selectedPurposeId, // Add the purpose ID
    });
  };

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Submit a Request</Text>}
      customRightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-5">
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
      <View className="flex-row items-center mb-6">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="bg-white rounded-full w-10 h-10 items-center justify-center shadow-sm border border-gray-100"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 ml-3">Submit Request</Text>
      </View>

      

      
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

        {/* Claim Date removed */}

        {/* Payment Mode */}
        {/* Removed payment mode field */}
      </View>

      {/* Amount Display - Moved below form fields */}
      {personalType && (
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 mt-4">
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
    </_ScreenLayout>
  );
};

export default CertForm;