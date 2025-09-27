import React, { useState, useEffect } from "react";
import { 
  View, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  RefreshControl,
  Image
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Search, ChevronLeft, Heart, FileText, Calendar, Package, AlertCircle, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api2 } from "@/api/api";
import { useFirstAidCount } from "./queries/FirstAidCountQueries";
import { FirstAidRecord } from "./types";
import { calculateAge } from "@/helpers/ageCalculator";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

const PatientInfoCard = ({ patientData }: { patientData: any }) => {
  const formatAddress = () => {
    if (!patientData?.patient_details?.address) return "No address provided";
    const address = patientData.patient_details.address;
    return [address.add_street, address.add_barangay, address.add_city, address.add_province]
      .filter(Boolean)
      .join(", ");
  };

  const calculatePatientAge = () => {
    if (!patientData?.patient_details?.personal_info?.per_dob) return "N/A";
    return calculateAge(patientData.patient_details.personal_info.per_dob).toString();
  };
};

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
          <Image 
            source={{ uri: `data:image/png;base64,${item.signature}` }}
            className="h-16 w-40 border border-slate-200 rounded"
            resizeMode="contain"
          />
        </View>
      )}
    </CardContent>
  </Card>
);

const StatsCard = ({ count }: { count: number }) => (
  <Card className="mx-4 mb-4 bg- border-slate-200">
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

export default function IndivFirstAidRecords() {
  const { patientData: patientDataString } = useLocalSearchParams();
  const [patientData, setPatientData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (patientDataString) {
      try {
        setPatientData(JSON.parse(patientDataString as string));
      } catch (error) {
        console.error("Error parsing patient data:", error);
      }
    }
  }, [patientDataString]);

  const { data: firstAidCountData } = useFirstAidCount(patientData?.pat_id);
  const firstAidCount = firstAidCountData?.firstaidrecord_count || 0;

  const { data: firstAidRecords, isLoading, isError, refetch } = useQuery({
    queryKey: ["patientFirstAidDetails", patientData?.pat_id],
    queryFn: async () => {
      if (!patientData?.pat_id) return [];
      const response = await api2.get(`/firstaid/indiv-firstaid-record/${patientData.pat_id}/`);
      return response.data;
    },
    enabled: !!patientData?.pat_id,
    refetchOnMount: true,
    staleTime: 0
  });

  const filteredData = React.useMemo(() => {
    if (!firstAidRecords) return [];
    return firstAidRecords.filter((record: FirstAidRecord) => {
      const searchText = `${record.farec_id} ${record.finv_details?.fa_detail?.fa_name} ${record.finv_details?.fa_detail?.catlist} ${record.reason}`.toLowerCase();
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
        headerTitle={<Text className="text-slate-900 text-lg font-semibold">First Aid Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Failed to load patient records. Please try again.
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

  if (!patientData) {
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
        headerTitle={<Text className="text-slate-900 text-lg font-semibold">First Aid Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <FileText size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No patient selected</Text>
          <Text className="text-gray-600 text-center mt-2">
            Please select a patient from the records list first.
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
      headerTitle={<Text className="text-slate-900 text-lg font-semibold">First Aid Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Patient Info */}
        {/* <PatientInfoCard patientData={patientData} /> */}
        
        {/* Stats */}
        <StatsCard count={firstAidCount} />

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
        <FlatList
          data={filteredData}
          renderItem={({ item }) => <FirstAidRecordCard item={item} />}
          keyExtractor={(item) => item.farec_id || `record-${Math.random()}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center py-20">
              <FileText size={48} color="#D1D5DB" />
              <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                No records found
              </Text>
              <Text className="text-gray-500 text-center">
                {searchQuery
                  ? "No records match your search criteria."
                  : "No first aid records available for this patient."}
              </Text>
            </View>
          )}
        />
      </View>
    </PageLayout>
  );
}