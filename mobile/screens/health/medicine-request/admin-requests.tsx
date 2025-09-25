// admin-requests.tsx
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Search, Filter, Eye, CheckCircle, XCircle, Clock } from "lucide-react-native";
import { usePendingMedicineRequests } from "./restful-api";


export default function AdminRequestsScreen() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = usePendingMedicineRequests(page, pageSize, searchQuery);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color="#10B981" />;
      case 'declined':
        return <XCircle size={16} color="#EF4444" />;
      case 'referred_to_doctor':
        return <Clock size={16} color="#F59E0B" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "text-green-700 bg-green-100";
      case 'declined':
        return "text-red-700 bg-red-100";
      case 'referred_to_doctor':
        return "text-amber-700 bg-amber-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-10 border-b border-gray-200 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold text-gray-800">Medicine Requests</Text>
        </View>

        {/* Search and Filter */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white mr-2">
            <Search size={20} color="#9CA3AF" />
            {/* <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search requests..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            /> */}
          </View>
          <TouchableOpacity className="p-2 border border-gray-300 rounded-lg bg-white">
            <Filter size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {data?.results?.map((request: any) => (
            <TouchableOpacity
              key={request.medreq_id}
            //   onPress={() => router.push(`/admin/requests/${request.medreq_id}`)}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-gray-900">
                  Request #{request.medreq_id}
                </Text>
                <View className={`flex-row items-center px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <Text className="text-xs font-medium ml-1 capitalize">
                    {request.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-600 mb-2">
                Patient: {request.pat_id ? `PAT-${request.pat_id}` : `RES-${request.rp_id}`}
              </Text>
              
              <Text className="text-gray-600 mb-2">
                Items: {request.items?.length || 0} medicine(s)
              </Text>
              
              <Text className="text-gray-500 text-sm">
                Requested: {new Date(request.requested_at).toLocaleDateString()}
              </Text>

              <View className="flex-row justify-end mt-3">
                <TouchableOpacity 
                //   onPress={() => router.push(`/admin/requests/${request.medreq_id}`)}
                  className="flex-row items-center bg-blue-50 px-3 py-1 rounded-lg"
                >
                  <Eye size={16} color="#3B82F6" />
                  <Text className="text-blue-600 text-sm font-medium ml-1">View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {(!data?.results || data.results.length === 0) && (
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-gray-500 text-lg">No requests found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}