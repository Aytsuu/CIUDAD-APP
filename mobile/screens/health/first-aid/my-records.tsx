// screens/first-aid/my-records.tsx
import React, { useState, useMemo } from "react";
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  TextInput,
  Text
} from "react-native";
import { FileText, AlertCircle, Package, Heart, Search, ChevronLeft, Calendar, RefreshCw } from "lucide-react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/screens/_PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api2 } from "@/api/api";
import { calculateAge } from "@/helpers/ageCalculator";
import { FirstAidRecord } from "../admin/admin-firstaid/types";
import { getPatientById, getPatientByResidentId } from "../animalbites/api/get-api";

// Reuse the FirstAidRecordCard component from individual.tsx
const FirstAidRecordCard = ({ item }: { item: FirstAidRecord }) => (
  <Card className="mb-3 bg-white border-slate-200">
    <CardContent className="p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <Calendar size={16} color="#64748B" />
          <Text className="ml-2 text-slate-600 text-sm">
            {new Date(item.created_at || "").toLocaleDateString()}
          </Text>
        </View>
        <Badge variant="outline" className="border-blue-200 bg-blue-50">
          <Text className="text-blue-700 text-xs">#{item.farec_id}</Text>
        </Badge>
      </View>
      
      <View className="mb-3">
        <Text className="font-semibold text-lg text-slate-900 mb-1">
          {item.finv_details?.fa_detail?.fa_name || "Unknown Item"}
        </Text>
        <Text className="text-slate-600 text-sm">
          {item.finv_details?.fa_detail?.catlist || "N/A"}
        </Text>
      </View>
      
      <View className="flex-row items-center mb-3">
        <Package size={16} color="#64748B" />
        <Text className="ml-2 text-slate-600 text-sm">
          Quantity: <Text className="text-slate-900 font-medium">{item.qty}</Text>
        </Text>
      </View>
      
      {item.reason && (
        <View className="mb-3">
          <Text className="text-slate-600 text-sm mb-1">Reason:</Text>
          <Text className="text-slate-900">{item.reason}</Text>
        </View>
      )}
      
      {item.signature && (
        <View className="mt-3 pt-3 border-t border-slate-200">
          <Text className="text-slate-600 text-sm mb-2">Patient Signature:</Text>
          {/* <Image 
            source={{ uri: `data:image/png;base64,${item.signature}` }}
            className="h-16 w-40 border border-slate-200 rounded"
            resizeMode="contain"
          /> */}
        </View>
      )}
    </CardContent>
  </Card>
);

const StatsCard = ({ count }: { count: number }) => (
  <Card className="mx-4 mb-4 bg-white border-slate-200">
    <CardContent className="p-4">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3">
          <Heart size={20} color="#DC2626" />
        </View>
        <View>
          <Text className="text-slate-600 text-sm">Total Records</Text>
          <Text className="text-2xl font-bold text-slate-900">{count}</Text>
        </View>
      </View>
    </CardContent>
  </Card>
);

export default function MyFirstAidRecordsScreen() {
  const params = useLocalSearchParams<{ pat_id?: string }>(); // NEW: Get pat_id from params
    const patIdFromParams = params.pat_id;
  const { user } = useAuth();
  const rp_id = user?.rp;
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  console.log("[DEBUG] firstaid patIdFromParams:", patIdFromParams);
  console.log("[DEBUG] rp_id from auth:", rp_id);


   const { data: patientData, isLoading: isLoadingPatient, isError: isErrorPatient, error: errorPatient } = useQuery({
      queryKey: ["patientDetails", patIdFromParams || rp_id],
      queryFn: async () => {
        if (patIdFromParams) {
          console.log("[DEBUG] Fetching patient with pat_id:", patIdFromParams);
          return await getPatientById(patIdFromParams);
        } else if (rp_id) {
          console.log("[DEBUG] Fetching patient with rp_id:", rp_id);
          return await getPatientByResidentId(rp_id);
        }
        return null;
      },
      enabled: !!(patIdFromParams || rp_id),
    });
    
 

  // Then, use the patient ID from the first query to fetch first aid records
 const patient_id = patientData?.pat_id;

const {
  data: firstAidRecords = [],
  isLoading,
  isError,
  error,
  refetch,
} = useQuery<FirstAidRecord[]>({
  queryKey: ["myFirstAidRecords", patient_id],
  queryFn: async () => {
    if (!patient_id) return [];
    
    try {
      const response = await api2.get(`/firstaid/indiv-firstaid-record/${patient_id}/`);
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected API response structure:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching first aid records:", error);
      return [];
    }
  },
  enabled: !!patient_id,
});

const filteredData = useMemo(() => {
  if (!firstAidRecords || !Array.isArray(firstAidRecords)) return [];
  
  return firstAidRecords.filter((record: FirstAidRecord) => {
    const searchText = `${record.farec_id || ''} ${record.finv_details?.fa_detail?.fa_name || ''} ${record.finv_details?.fa_detail?.catlist || ''} ${record.reason || ''}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });
}, [firstAidRecords, searchQuery]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const formatAddress = () => {
    if (!patientData?.address) return "No address provided";
    return [patientData.address.add_street, patientData.address.add_barangay, patientData.address.add_city, patientData.address.add_province]
      .filter(Boolean)
      .join(", ");
  };

  const calculatePatientAge = () => {
    if (!patientData?.personal_info?.per_dob) return "N/A";
    return calculateAge(patientData.personal_info.per_dob).toString();
  };

  const getPatientInitials = (fname: string, lname: string) => {
    return `${fname?.charAt(0) || ""}${lname?.charAt(0) || ""}`.toUpperCase();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-slate-900 text-lg font-semibold">My First Aid Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Failed to load your records. Please try again.
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg"
          >
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  if (!rp_id) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-slate-900 text-lg font-semibold">My First Aid Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <Package size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Authentication Required</Text>
          <Text className="text-gray-600 text-center mt-2">
            Please log in to view your first aid records.
          </Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-lg font-semibold">My First Aid Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
       
        {/* Stats */}
        <StatsCard count={filteredData.length} />

        {/* Search Bar */}
        <View className="mx-4 mb-4">
          <View className="flex-row items-center p-3 border border-gray-200 bg-white rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search records..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Records List */}
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <FirstAidRecordCard key={item.farec_id || `record-${Math.random()}`} item={item} />
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <FileText size={48} color="#D1D5DB" />
              <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                No records found
              </Text>
              <Text className="text-gray-500 text-center">
                {searchQuery
                  ? "No records match your search criteria."
                  : "You don't have any first aid records yet."}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </PageLayout>
  );
}