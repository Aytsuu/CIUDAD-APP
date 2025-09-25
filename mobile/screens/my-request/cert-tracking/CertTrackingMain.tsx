import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useCertTracking, useCancelCertificate, useCancelBusinessPermit } from "./queries/certTrackingQueries";
import CertTrackingPersonal from "./certTrackingPersonal";
import CertTrackingBusiness from "./certTrackingBusiness";

export default function CertTrackingMain() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const rp = (user as any)?.rp ?? "";
  const { data, isLoading, isError } = useCertTracking(rp);
  const { mutate: cancelCert, isPending: isCancelling } = useCancelCertificate(rp);
  const { mutate: cancelBusiness, isPending: isCancellingBiz } = useCancelBusinessPermit(rp);
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
        { text: 'Yes', style: 'destructive', onPress: () => {
            const crId = String(item?.cr_id || '').trim();
            const bprId = String(item?.bpr_id || '').trim();
            if (crId) {
              cancelCert(crId);
            } else if (bprId) {
              cancelBusiness(bprId);
            }
          } }
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
            {/* Tabs - mimic garbage pickup main */}
            <View className="bg-white border-b border-gray-200 mb-3">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
              >
                {[
                  { key: 'personal' as 'personal' | 'business', label: 'Personal' },
                  { key: 'business' as 'personal' | 'business', label: 'Business' },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    className={`px-3 py-4 mx-1 items-center border-b-2 ${
                      activeTab === tab.key ? 'border-blue-500' : 'border-transparent'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        activeTab === tab.key ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
            {activeTab === 'personal' ? (
              <CertTrackingPersonal />
            ) : (
              <CertTrackingBusiness />
            )}
          </>
        )}
      </View>
    </_ScreenLayout>
  );
}


