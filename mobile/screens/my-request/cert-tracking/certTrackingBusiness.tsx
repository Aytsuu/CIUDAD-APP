import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useAuth } from "@/contexts/AuthContext";
import { useCertTracking, useCancelBusinessPermit } from "./queries/certTrackingQueries";
import { usePurposeAndRates } from "@/screens/request/certification-request/queries/certificationReqFetchQueries";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import EmptyState from "@/components/ui/emptyState";

export default function CertTrackingBusiness() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const rp = (user as any)?.rp ?? "";
  try { console.log('[CertTrackingBusiness] rp used:', rp); } catch {}
  const { data, isLoading, isError, refetch } = useCertTracking(rp);
  const { data: purposes = [] } = usePurposeAndRates();
  const purposeMap = React.useMemo(() => {
    const map: Record<string | number, string> = {};
    (purposes as any[]).forEach((p: any) => { if (p?.pr_id != null) map[p.pr_id] = String(p.pr_purpose ?? ''); });
    return map;
  }, [purposes]);
  const { mutate: cancelBusiness, isPending: isCancelling } = useCancelBusinessPermit(rp);

  const getUiStatus = (item: any): 'pending' | 'approved' | 'completed' => {
    const status = (item?.cr_req_status ?? item?.req_status ?? '').toString().toLowerCase();
    const hasIssuedDate = Boolean(item?.cr_date_completed || item?.date_completed || item?.ibp_date_of_issuance);
    if (hasIssuedDate || status.includes('complete')) return 'completed';
    if (status.includes('approved') || status === 'accepted') return 'approved';
    return 'pending';
  }
  const extractStatus = (item: any) => (item?.cr_req_status ?? item?.req_status ?? '').toString().trim();
  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { const dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); } catch { return d; }
  }
  const wrapPurpose = (text?: string, maxFirstLine: number = 24) => {
    if (!text) return '—';
    if (text.length <= maxFirstLine) return text;
    const breakIdx = text.lastIndexOf(' ', maxFirstLine);
    const idx = breakIdx > 0 ? breakIdx : maxFirstLine;
    return text.slice(0, idx) + "\n" + text.slice(idx).trimStart();
  }
  const handleCancel = (item: any) => {
    Alert.alert('Cancel Request', 'Are you sure you want to cancel this request?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => cancelBusiness(String(item?.bpr_id)) }
    ]);
  }

  const [activeTab, setActiveTab] = React.useState<'pending' | 'approved' | 'completed'>('pending');

  // Always refresh when screen gains focus to see latest request
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (authLoading) {
    return (
      <_ScreenLayout
        customLeftAction={<TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"><ChevronLeft size={24} className="text-gray-700" /></TouchableOpacity>}
        headerBetweenAction={<Text className="text-[13px]">Track Requests</Text>}
        customRightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#00AFFF" /><Text className="text-gray-600 text-base mt-4">Loading...</Text></View>
      </_ScreenLayout>
    );
  }

  return (
    <_ScreenLayout
      customLeftAction={<TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"><ChevronLeft size={24} className="text-gray-700" /></TouchableOpacity>}
      headerBetweenAction={<Text className="text-[13px]">Business Requests</Text>}
      customRightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-5">
        {/* Status Tabs: Pending, Approved, Completed */}
        <View className="bg-white border-b border-gray-200 mb-3 -mx-5 px-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {[{ key: 'pending', label: 'Pending' }, { key: 'approved', label: 'Approved' }, { key: 'completed', label: 'Completed' }].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                className={`px-3 py-4 mx-1 items-center border-b-2 ${
                  activeTab === tab.key ? 'border-blue-500' : 'border-transparent'
                }`}
                activeOpacity={0.8}
              >
                <Text className={`text-sm font-medium ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {isLoading ? (
          <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#00AFFF" /><Text className="text-gray-600 text-base mt-4">Loading requests…</Text></View>
        ) : isError ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"><Text className="text-red-800 text-sm">Failed to load requests.</Text></View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {data?.business?.filter((item: any) => (item?.req_status ?? '').toString().toLowerCase() === activeTab || getUiStatus(item) === activeTab).length ? (
              data.business
                .filter((item: any) => (item?.req_status ?? '').toString().toLowerCase() === activeTab || getUiStatus(item) === activeTab)
                .sort((a: any, b: any) => new Date(b?.req_request_date || b?.req_date || b?.cr_req_request_date || 0).getTime() - new Date(a?.req_request_date || a?.req_date || a?.cr_req_request_date || 0).getTime())
                .map((item: any, idx: number) => (
                <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-900 font-medium">{wrapPurpose(
                      (typeof item?.purpose === 'string' ? item?.purpose : '') ||
                      purposeMap[item?.pr_id as any] ||
                      "Business Permit"
                    )}</Text>
                    <Text className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">{getUiStatus(item).charAt(0).toUpperCase() + getUiStatus(item).slice(1)}</Text>
                  </View>
                  <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                  {getUiStatus(item) === 'completed' && (
                    <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(item?.cr_date_completed || item?.date_completed || item?.ibp_date_of_issuance)}</Text>
                  )}
                  {false && (
                    <Text className="text-gray-500 text-xs mt-1">Date Cancelled: {formatDate(item?.cr_date_rejected || item?.date_cancelled)}</Text>
                  )}
                  {getUiStatus(item) === 'pending' || getUiStatus(item) === 'approved' ? (
                    <View className="mt-3">
                      <TouchableOpacity onPress={() => handleCancel(item)} disabled={isCancelling} className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg" activeOpacity={0.8}>
                        <Text className="text-red-700 text-xs font-medium">{isCancelling ? 'Cancelling…' : 'Cancel Request'}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-8">
                <EmptyState emptyMessage={`No ${activeTab} business permit requests`} />
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </_ScreenLayout>
  );
}


