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
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [isSenior, setIsSenior] = useState<boolean>(false);
  
  // Debug: Inspect what useAuth provides (rp)
  useEffect(() => {
    try {
      console.log("[AuthContext] rp:", (user as any)?.rp);
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    const rpId = (user as any)?.rp;
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
          const str = typeof v === 'string' ? v.trim().toLowerCase() : '';
          const isVoter = v === true || v === 1 || str === 'yes' || str === 'true' || str === '1';
          setHasVoterId(Boolean(isVoter));
          // Disability: any non-empty, non-null string/value
          const disabilityRaw = match?.per_disability;
          const hasPwd = disabilityRaw !== null && disabilityRaw !== undefined && String(disabilityRaw).trim() !== '';
          setHasDisability(Boolean(hasPwd));
          // Senior: age >= 60 based on per_dob
          const dobStr = match?.per_dob ? String(match?.per_dob) : '';
          let senior = false;
          if (dobStr) {
            try {
              const dob = new Date(dobStr);
              if (!isNaN(dob.getTime())) {
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                senior = age >= 60;
              }
            } catch {}
          }
          setIsSenior(senior);
        }
      } catch (_) {
        // Fallback: try profiling resident personal detail
        try {
          const resDetail = await api.get(`profiling/resident/personal/${rpId}/`);
          const data = resDetail?.data || {};
          const v = data?.voter_id ?? data?.voter;
          const str = typeof v === 'string' ? v.trim().toLowerCase() : '';
          const isVoter = v === true || v === 1 || str === 'yes' || str === 'true' || str === '1';
          if (!cancelled) {
            setHasVoterId(Boolean(isVoter));
            const disabilityRaw = data?.per_disability;
            const hasPwd = disabilityRaw !== null && disabilityRaw !== undefined && String(disabilityRaw).trim() !== '';
            setHasDisability(Boolean(hasPwd));
            const dobStr = data?.per_dob ? String(data?.per_dob) : '';
            let senior = false;
            if (dobStr) {
              try {
                const dob = new Date(dobStr);
                if (!isNaN(dob.getTime())) {
                  const today = new Date();
                  let age = today.getFullYear() - dob.getFullYear();
                  const m = today.getMonth() - dob.getMonth();
                  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                  senior = age >= 60;
                }
              } catch {}
            }
            setIsSenior(senior);
          }
        } catch (_) {
          // remain false
        }
      }
    })();
    return () => { cancelled = true; };
  }, [(user as any)?.rp]);

  // Debug: Log resolved eligibility flags
  useEffect(() => {
    console.log("[AuthContext] hasVoterId:", hasVoterId, "hasDisability:", hasDisability, "isSenior:", isSenior);
  }, [hasVoterId, hasDisability, isSenior]);
  const [personalType, setPersonalType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const addPersonalCert = useAddPersonalCertification();
  const { data: purposeData = [], isLoading: isLoadingPurposes } = usePurposeAndRates();
  

  
  const purposeOptions: DropdownOption[] = (() => {
    const filtered = purposeData.filter((purpose: PurposeAndRate) => {
      return !purpose.pr_is_archive &&
             (purpose.pr_category === "Personal and Others" ||
              purpose.pr_category === "Personal" ||
              String(purpose.pr_category || '').toLowerCase().includes("personal"));
    });
    const seen = new Set<string>();
    const unique = filtered.filter((p: PurposeAndRate) => {
      const key = String(p.pr_purpose || '').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.map((purpose: PurposeAndRate) => ({
      label: String(purpose.pr_purpose || '').trim(),
      value: String(purpose.pr_purpose || '').trim()
    }));
  })();

  
  const handleSubmit = () => {
    setError(null);
    
    // Validate that purpose is selected
    if (!purpose) {
      setError("Please select a purpose");
      return;
    }
    
    const rp = (user as any)?.rp ?? "";
    const result = CertificationRequestSchema.safeParse({
      cert_type: "personal",
      requester: rp, 
      purposes: [purpose], 
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    const selectedPurposeId = purposeData.find(p => p.pr_purpose === personalType)?.pr_id;
    const selectedPurpose = purposeData.find(p => p.pr_purpose === personalType);
    
    
    const reqAmount = (hasVoterId || hasDisability || isSenior) ? 0 : (selectedPurpose?.pr_rate || 0);
    
    addPersonalCert.mutate({
      cert_type: "personal",
      requester: rp, 
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

      {/* Amount Display - show only if not free by voter/disability/senior */}
      {personalType && !(hasVoterId || hasDisability || isSenior) && (
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
          {addPersonalCert.status === 'pending' ? 'Submitting...' : !!isLoading ? 'Loading...' : 'Submit Request'}
        </Text>
      </TouchableOpacity>
      </View>
    </_ScreenLayout>
  );
};

export default CertForm;