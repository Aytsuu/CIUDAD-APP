import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useCertTracking, useCancelCertificate } from "./queries/certTrackingQueries";

export default function CertTrackingMain() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, isError } = useCertTracking(user?.resident?.rp_id || "");
  const { mutate: cancelCert, isPending: isCancelling } = useCancelCertificate(user?.resident?.rp_id || "");
  const [activeTab, setActiveTab] = React.useState<'personal' | 'business'>('personal');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'in_progress' | 'completed' | 'cancelled'>('all');

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("cancel")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Cancelled</Text>
    }
    if (normalized.includes("progress") || normalized === "processing") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">In Progress</Text>
    }
    if (normalized.includes("complete") || normalized === "approved") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</Text>
    }
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">In Progress</Text>
  }

  const getNormalizedStatus = (status?: string): 'pending' | 'in_progress' | 'completed' | 'cancelled' => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("cancel")) return 'cancelled';
    if (normalized.includes("progress") || normalized === "processing") return 'in_progress';
    if (normalized.includes("complete") || normalized === "approved") return 'completed';
    return 'pending';
  }

  const extractStatus = (item: any) => (item?.cr_req_status ?? item?.req_status ?? '').toString().trim();

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return d;
    }
  }

  const wrapPurpose = (text?: string, maxFirstLine: number = 24) => {
    if (!text) return '—';
    if (text.length <= maxFirstLine) return text;
    const breakIdx = text.lastIndexOf(' ', maxFirstLine);
    const idx = breakIdx > 0 ? breakIdx : maxFirstLine;
    return text.slice(0, idx) + "\n" + text.slice(idx).trimStart();
  }

  const handleCancel = (item: any) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => cancelCert(String(item?.cr_id)) }
      ]
    );
  }

  // Show loading screen while auth is loading
  if (authLoading) {
    return (
      <_ScreenLayout
        customLeftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Track Requests</Text>}
        customRightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00AFFF" />
          <Text className="text-gray-600 text-base mt-4">Loading...</Text>
        </View>
      </_ScreenLayout>
    );
  }

  // Show loading screen while tracking data is loading
  if (isLoading) {
    return (
      <_ScreenLayout
        customLeftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Track Requests</Text>}
        customRightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00AFFF" />
          <Text className="text-gray-600 text-base mt-4">Loading requests…</Text>
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
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Track Requests</Text>}
      customRightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-5">
        {isLoading && (
          <View className="items-center justify-center py-10">
            <ActivityIndicator />
            <Text className="text-gray-500 mt-2">Loading requests…</Text>
          </View>
        )}

        {isError && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-800 text-sm">Failed to load requests.</Text>
          </View>
        )}

        {!isLoading && !isError && (
          <>
            {/* Tabs */}
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'personal' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setActiveTab('personal')}
              >
                <Text className={`text-sm ${activeTab === 'personal' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Personal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'business' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setActiveTab('business')}
              >
                <Text className={`text-sm ${activeTab === 'business' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Business</Text>
              </TouchableOpacity>
            </View>

            {/* Status Filters */}
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'all' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('all')}
              >
                <Text className={`text-sm ${statusFilter === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'in_progress' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('in_progress')}
              >
                <Text className={`text-sm ${statusFilter === 'in_progress' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>In Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'completed' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('completed')}
              >
                <Text className={`text-sm ${statusFilter === 'completed' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'cancelled' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('cancelled')}
              >
                <Text className={`text-sm ${statusFilter === 'cancelled' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Cancelled</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {activeTab === 'personal' ? (
                <>
                  {data?.personal?.filter((i: any) => statusFilter === 'all' || getNormalizedStatus(extractStatus(i)) === statusFilter).length ? (
                    data.personal
                      .filter((i: any) => statusFilter === 'all' || getNormalizedStatus(extractStatus(i)) === statusFilter)
                      .map((item: any, idx: number) => (
                      <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-900 font-medium">{wrapPurpose(item?.purpose?.pr_purpose ?? item?.purpose ?? "Certification")}</Text>
                          {getStatusBadge(extractStatus(item))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                        {getNormalizedStatus(extractStatus(item)) === 'completed' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(item?.cr_date_completed || item?.date_completed || item?.ic_date_of_issuance)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'cancelled' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Cancelled: {formatDate(item?.cr_date_rejected || item?.date_cancelled)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) !== 'completed' && getNormalizedStatus(extractStatus(item)) !== 'cancelled' && (
                          <View className="mt-3">
                            <TouchableOpacity
                              onPress={() => handleCancel(item)}
                              disabled={isCancelling}
                              className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                              activeOpacity={0.8}
                            >
                              <Text className="text-red-700 text-xs font-medium">{isCancelling ? 'Cancelling…' : 'Cancel Request'}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      ))
                  ) : (
                    <Text className="text-gray-500 text-sm mb-4">No personal certification requests.</Text>
                  )}
                </>
              ) : (
                <>
                  {data?.business?.filter((i: any) => statusFilter === 'all' || getNormalizedStatus(extractStatus(i)) === statusFilter).length ? (
                    data.business
                      .filter((i: any) => statusFilter === 'all' || getNormalizedStatus(extractStatus(i)) === statusFilter)
                      .map((item: any, idx: number) => (
                      <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-900 font-medium">{wrapPurpose(item?.purpose ?? "Business Permit")}</Text>
                          {getStatusBadge(extractStatus(item))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                        {getNormalizedStatus(extractStatus(item)) === 'completed' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(item?.cr_date_completed || item?.date_completed || item?.ibp_date_of_issuance)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'cancelled' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Cancelled: {formatDate(item?.cr_date_rejected || item?.date_cancelled)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) !== 'completed' && getNormalizedStatus(extractStatus(item)) !== 'cancelled' && (
                          <View className="mt-3">
                            <TouchableOpacity
                              onPress={() => handleCancel(item)}
                              disabled={isCancelling}
                              className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                              activeOpacity={0.8}
                            >
                              <Text className="text-red-700 text-xs font-medium">{isCancelling ? 'Cancelling…' : 'Cancel Request'}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      ))
                  ) : (
                    <Text className="text-gray-500 text-sm">No business permit requests.</Text>
                  )}
                </>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </_ScreenLayout>
  );
}


