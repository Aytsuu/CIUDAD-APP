import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useAddPersonalCertification } from "./queries/certificationReqInsertQueries";
import { CertificationRequestSchema } from "@/form-schema/certificates/certification-request-schema";
import { usePurposeAndRates, type PurposeAndRate } from "./queries/certificationReqFetchQueries";
import { SelectLayout, type DropdownOption } from "@/components/ui/select-layout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/api/api";

const CertForm: React.FC = () => {
  const router = useRouter();
  const {user, isLoading} = useAuth();
  const [hasVoterId, setHasVoterId] = useState<boolean>(false);
  
  // Debug: Inspect what useAuth provides
  useEffect(() => {
    try {
      console.log("[AuthContext] resident rp_id:", user?.resident?.rp_id);
      console.log("[AuthContext] resident voter_id:", user?.resident?.voter_id, "type:", typeof user?.resident?.voter_id);
    } catch (e) {}
  }, [user]);

  // Minimal local fix: fetch voter status by rp_id (best-effort)
  useEffect(() => {
    const rpId = user?.resident?.rp_id;
    // If auth already carries a voter indicator, use it
    if (user?.resident?.voter_id !== null && user?.resident?.voter_id !== undefined) {
      setHasVoterId(true);
      return;
    }
    if ((user as any)?.resident?.voter) {
      setHasVoterId(true);
      return;
    }
    if (!rpId) return;
    let cancelled = false;
    (async () => {
      try {
        // Use profiling residents TABLE endpoint (includes voter_id)
        const res = await api.get(`profiling/resident/list/table/`, { params: { rp: rpId } });
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.results) ? res.data.results : [];
        console.log("[AuthContext] voter lookup table resp:", items);
        const match = items.find((r: any) => String(r?.rp_id) === String(rpId));
        if (!cancelled) {
          const v = match?.voter_id ?? match?.voter ?? match?.voterId ?? null;
          setHasVoterId(v !== null && v !== undefined && v !== 0 && v !== false);
        }
      } catch (_) {
        // Fallback: try profiling resident personal detail
        try {
          const resDetail = await api.get(`profiling/resident/personal/${rpId}/`);
          const data = resDetail?.data || {};
          if (!cancelled) setHasVoterId(Boolean(data?.voter_id ?? data?.voter));
        } catch (_) {
          // remain false
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.resident?.rp_id, user?.resident?.voter_id]);

  // Debug: Log resolved hasVoterId
  useEffect(() => {
    console.log("[AuthContext] hasVoterId:", hasVoterId);
  }, [hasVoterId]);
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
      requester: user?.resident?.rp_id || "", 
      purposes: [purpose], 
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    const selectedPurposeId = purposeData.find(p => p.pr_purpose === personalType)?.pr_id;
    const selectedPurpose = purposeData.find(p => p.pr_purpose === personalType);
    
    
    const isEligibleForFreeCert = user?.resident?.voter_id !== null && user?.resident?.voter_id !== undefined;
    const reqAmount = isEligibleForFreeCert ? 0 : (selectedPurpose?.pr_rate || 0);
    
    addPersonalCert.mutate({
      cert_type: "personal",
      requester: user?.resident?.rp_id || "", 
      purposes: [purpose], 
      pr_id: selectedPurposeId, // Add the purpose ID
    });
  };

  // Show loading screen while auth or purposes are loading
  if (isLoading || isLoadingPurposes) {
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00AFFF" />
          <Text className="text-gray-600 text-base mt-4">
            {isLoading ? 'Loading user data...' : 'Loading purposes...'}
          </Text>
        </View>
      </_ScreenLayout>
    );
  }

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

      {/* Amount Display - show only for residents without voter_id */}
      {personalType && !hasVoterId && (
        <View className="rounded-lg p-4 mb-6 mt-4 bg-blue-50 border border-blue-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={16} color="#2563EB" />
            <Text className="text-sm font-medium ml-2 text-blue-800">Amount to be Paid:</Text>
          </View>
          <Text className="text-lg font-bold text-blue-700">
            {(() => {
              const selectedPurpose = purposeData.find(p => p.pr_purpose === personalType);
              return selectedPurpose ? `₱${selectedPurpose.pr_rate.toLocaleString()}` : '₱0';
            })()}
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        className={`bg-[#00AFFF] rounded-lg py-3 items-center mt-8 shadow-md ${addPersonalCert.status === 'pending' || !!isLoading ? 'opacity-50' : ''}`}
        activeOpacity={0.85}
        onPress={handleSubmit}
        disabled={addPersonalCert.status === 'pending' || !!isLoading}
      >
        <Text className="text-white font-semibold text-base">
          {addPersonalCert.status === 'pending' ? 'Submitting...' : isLoading ? 'Loading...' : 'Submit Request'}
        </Text>
      </TouchableOpacity>
      </View>
    </_ScreenLayout>
  );
};

export default CertForm;