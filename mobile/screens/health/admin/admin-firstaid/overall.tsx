import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native";
import { Search, ChevronLeft, AlertCircle, User, Calendar, FileText, Users, UserCheck, UserPlus, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFirstaidRecords } from "./restful-api/getAPI";
import { FirstAidRecord, PersonalInfo, Address } from "./types";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { calculateAge } from "@/helpers/ageCalculator";

interface FirstAidPatientsCount {
  total_firstaid_patients: number;
  resident_firstaid_patients: number; 
  transient_firstaid_patients: number;
}

type TabType = "all" | "resident" | "transient";

// Components
const StatusBadge: React.FC<{ type: string }> = ({ type }) => {
  const getTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case 'resident':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
        };
      case 'transient':
        return {
          color: 'text-amber-700',
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-200',
        };
      default:
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
        };
    }
  };

  const typeConfig = getTypeConfig(type);
  return (
    <View className={`px-3 py-1 rounded-full border ${typeConfig.bgColor} ${typeConfig.borderColor}`}>
      <Text className={`text-xs font-semibold ${typeConfig.color}`}>
        {type}
      </Text>
    </View>
  );
};

const TabBar: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  counts: { all: number; resident: number; transient: number };
}> = ({ activeTab, setActiveTab, counts }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => setActiveTab('all')}
      className={`flex-1 items-center py-3 ${activeTab === 'all' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-600'}`}>
        All ({counts.all})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('resident')}
      className={`flex-1 items-center py-3 ${activeTab === 'resident' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'resident' ? 'text-blue-600' : 'text-gray-600'}`}>
        Residents ({counts.resident})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('transient')}
      className={`flex-1 items-center py-3 ${activeTab === 'transient' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'transient' ? 'text-blue-600' : 'text-gray-600'}`}>
        Transients ({counts.transient})
      </Text>
    </TouchableOpacity>
  </View>
);

const FirstAidRecordCard: React.FC<{
  record: FirstAidRecord;
  onPress: () => void;
}> = ({ record, onPress }) => {
  const formatAddress = () => {
    const address = record.patient_details.address;
    return [address.add_street, address.add_barangay, address.add_city, address.add_province]
      .filter(Boolean)
      .join(", ");
  };

  const calculatePatientAge = () => {
    return calculateAge(record.patient_details.personal_info.per_dob).toString();
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm"
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-red-600 rounded-full items-center justify-center mr-3">
                <User color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {record.patient_details.personal_info.per_lname}, {record.patient_details.personal_info.per_fname} {record.patient_details.personal_info.per_mname}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {record.pat_id}</Text>
              </View>
            </View>
          </View>
          <StatusBadge type={record.patient_details.pat_type} />
        </View>
      </View>

      {/* Details */}
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Users size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Age: <Text className="font-medium text-gray-900">{calculatePatientAge()}</Text> • {record.patient_details.personal_info.per_sex}
          </Text>
        </View>
        <View className="flex-row items-center mb-3">
          <FileText size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Address: <Text className="font-medium text-gray-900">{formatAddress() || "No address provided"}</Text>
          </Text>
        </View>
        {record.patient_details.address.add_sitio && (
          <View className="flex-row items-center mb-3">
            <FileText size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Sitio: <Text className="font-medium text-gray-900">{record.patient_details.address.add_sitio}</Text>
            </Text>
          </View>
        )}
        <View className="flex-row items-center">
          <FileText size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Records: <Text className="font-medium text-gray-900">{record.firstaid_count}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AllFirstAidRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const queryClient = useQueryClient();

  const {
  data: firstAidRecords,
  isLoading,
  isError,
  error,
  refetch,
  isFetching
} = useQuery<FirstAidRecord[]>({
  queryKey: ["firstAidRecords"],
  queryFn: async () => {
    const response = await getFirstaidRecords();
    return response.results; // Extract the results array
  },
  refetchOnMount: true,
  staleTime: 0,
});

  const filteredData = useMemo(() => {
    if (!firstAidRecords) return [];
    
    let result = firstAidRecords;
    
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (record) =>
          record.patient_details.personal_info.per_fname.toLowerCase().includes(lowerCaseQuery) ||
          record.patient_details.personal_info.per_lname.toLowerCase().includes(lowerCaseQuery) ||
          record.pat_id.toLowerCase().includes(lowerCaseQuery) ||
          record.patient_details.address.add_sitio?.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    if (activeTab !== 'all') {
      result = result.filter((record) =>
        record.patient_details.pat_type.toLowerCase() === activeTab
      );
    }
    
    return result;
  }, [firstAidRecords, searchQuery, activeTab]);

  const counts = useMemo(() => {
    if (!firstAidRecords) return { all: 0, resident: 0, transient: 0 };
    
    const residentCount = firstAidRecords.filter(r => r.patient_details.pat_type.toLowerCase() === 'resident').length;
    const transientCount = firstAidRecords.filter(r => r.patient_details.pat_type.toLowerCase() === 'transient').length;
   
    return {
      all: firstAidRecords.length,
      resident: residentCount,
      transient: transientCount,
    };
  }, [firstAidRecords]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handleRecordPress = (record: FirstAidRecord) => {
    try {
      router.push({
        pathname: "/admin/first-aid/individual",
        params: { patientData: JSON.stringify(record) }
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
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
        headerTitle={<Text className="">First Aid Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Failed to load data. Please check your connection and try again.
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">First Aid Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-3 border border-gray-200 bg-gray-50 rounded-xl">
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

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

        {/* Records List */}
        {!firstAidRecords || firstAidRecords.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <FileText size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">
              There are no first aid records available yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => `firstaid-${item.pat_id}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item }) => (
              <FirstAidRecordCard
                record={item}
                onPress={() => handleRecordPress(item)}
              />
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <FileText size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                  No records in this category
                </Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery
                    ? `No ${activeTab} records match your search.`
                    : `No ${activeTab} records found.`}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </PageLayout>
  );
}