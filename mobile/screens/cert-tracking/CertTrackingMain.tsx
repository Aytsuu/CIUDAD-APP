import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import ScreenLayout from "../_ScreenLayout";
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useCertTracking } from "./queries/certTrackingQueries";

export default function CertTrackingMain() {
  const router = useRouter();

  // Resident ID source of truth should come from auth context; hardcoded for now
  const RESIDENT_ID = "00002250821";

  const { data, isLoading, isError } = useCertTracking(RESIDENT_ID);
  const [activeTab, setActiveTab] = React.useState<'personal' | 'business'>('personal');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("progress") || normalized === "processing") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">In Progress</Text>
    }
    if (normalized.includes("complete") || normalized === "approved") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</Text>
    }
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">Pending</Text>
  }

  const getNormalizedStatus = (status?: string): 'pending' | 'in_progress' | 'completed' => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("progress") || normalized === "processing") return 'in_progress';
    if (normalized.includes("complete") || normalized === "approved") return 'completed';
    return 'pending';
  }

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

  return (
    <ScreenLayout
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
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'pending' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('pending')}
              >
                <Text className={`text-sm ${statusFilter === 'pending' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Pending</Text>
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
            </View>

            {/* Tab Content */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {activeTab === 'personal' ? (
                <>
                  {data?.personal?.filter((i: any) => statusFilter === 'all' || getNormalizedStatus(i?.req_status) === statusFilter).length ? (
                    data.personal
                      .filter((i: any) => statusFilter === 'all' || getNormalizedStatus(i?.req_status) === statusFilter)
                      .map((item: any, idx: number) => (
                      <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-900 font-medium">{wrapPurpose(item?.purpose?.pr_purpose ?? item?.purpose ?? "Certification")}</Text>
                          {getStatusBadge(item?.req_status)}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                      </View>
                      ))
                  ) : (
                    <Text className="text-gray-500 text-sm mb-4">No personal certification requests.</Text>
                  )}
                </>
              ) : (
                <>
                  {data?.business?.filter((i: any) => statusFilter === 'all' || getNormalizedStatus(i?.req_status) === statusFilter).length ? (
                    data.business
                      .filter((i: any) => statusFilter === 'all' || getNormalizedStatus(i?.req_status) === statusFilter)
                      .map((item: any, idx: number) => (
                      <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-900 font-medium">{wrapPurpose(item?.purpose ?? "Business Permit")}</Text>
                          {getStatusBadge(item?.req_status)}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
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
    </ScreenLayout>
  );
}


