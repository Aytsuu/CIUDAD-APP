import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PageLayout from '@/screens/_PageLayout';
import { useAddPersonalCertification } from "./queries/certificationReqInsertQueries";
import { CertificationRequestSchema } from "@/form-schema/certificates/certification-request-schema";
import { usePurposeAndRates, type PurposeAndRate } from "./queries/certificationReqFetchQueries";
import { SelectLayout, type DropdownOption } from "@/components/ui/select-layout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/api/api";
import { LoadingState } from "@/components/ui/loading-state";
import { LoadingModal } from "@/components/ui/loading-modal";

const CertForm: React.FC = () => {
  const router = useRouter();
  const {user, isLoading} = useAuth();
  const [hasVoterId, setHasVoterId] = useState<boolean>(false);
  
  // Debug: Inspect what useAuth provides
  useEffect(() => {
    try {
      console.log("[AuthContext] resident rp_id:", user?.rp);
      console.log("[AuthContext] resident voter_id:", user?.personal?.voter_id, "type:", typeof user?.personal?.voter_id);
    } catch (e) {}
  }, [user]);

  // Minimal local fix: fetch voter status by rp_id (best-effort)
  useEffect(() => {
    const rpId = user?.rp;
    // If auth already carries a voter indicator, use it
    if (user?.personal?.voter_id !== null && user?.personal?.voter_id !== undefined) {
      setHasVoterId(true);
      return;
    }
    if ((user as any)?.personal?.voter) {
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
  }, [user?.rp, user?.personal?.voter_id]);

  // Debug: Log resolved hasVoterId
  useEffect(() => {
    console.log("[AuthContext] hasVoterId:", hasVoterId);
  }, [hasVoterId]);
  const [personalType, setPersonalType] = useState("");
  const [purpose, setPurpose] = useState("");
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
    
    // Check if user is deceased
    if (user?.personal?.per_is_deceased) {
      setError("Deceased residents cannot request certificates");
      return;
    }
    
    // Validate that purpose is selected
    if (!purpose) {
      setError("Please select a purpose");
      return;
    }
    
    const result = CertificationRequestSchema.safeParse({
      cert_type: "personal",
      requester: user?.rp || "", 
      purposes: [purpose], 
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    const selectedPurposeId = purposeData.find(p => p.pr_purpose === personalType)?.pr_id;
    const selectedPurpose = purposeData.find(p => p.pr_purpose === personalType);
    
    
    const isEligibleForFreeCert = user?.personal?.voter_id !== null && user?.personal?.voter_id !== undefined;
    
    addPersonalCert.mutate({
      cert_type: "personal",
      requester: user?.rp || "", 
      purposes: [purpose], 
      pr_id: selectedPurposeId, // Add the purpose ID
    });
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">Submit a Request</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 p-6">
        {/* Loading Modal */}
        <LoadingModal visible={addPersonalCert.status === 'pending'} />
        {isLoading || isLoadingPurposes ? (
          <LoadingState />
        ) : (
          <>
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
              className={`rounded-xl py-4 items-center mt-2 mb-8 ${
                addPersonalCert.status === 'pending' 
                  ? 'bg-gray-400 opacity-50' 
                  : 'bg-[#00AFFF]'
              }`}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={addPersonalCert.status === 'pending'}
            >
              {addPersonalCert.status === 'pending' ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Submitting...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-base">
                  Submit Request
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </PageLayout>
  );
};

export default CertForm;