import React, { useState, useMemo, act } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native";
import { Search, ChevronLeft, AlertCircle, User, Calendar, FileText, Users, UserCheck, UserPlus, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { router } from "expo-router";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { getFPPatientsCounts, getFPRecordsList } from "../admin-familyplanning/GetRequest";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

import { useMaternalRecords } from "./queries/maternalFETCH";
import { useActivepregnanciesCount } from "./queries/maternalFETCH";

// Removed FPRecord interface, using maternalRecords below

interface maternalRecords {
   pat_id: string;
   age: number;

   personal_info: {
      per_fname: string;
      per_lname: string;
      per_mname: string;
      per_sex: string;
      per_dob?: string;
      ageTime: string;
   };

   address?: {
      add_street?: string;
      add_barangay?: string;
      add_city?: string;
      add_province?: string;
      add_external_sitio?: string;
      add_sitio?: string;
   };

   pat_type: "Transient" | "Resident";
   patrec_type?: string;
   pregnancy_count?: number;
}


interface FPPatientsCount {
  total_fp_patients: number;
  resident_fp_patients: number;
  transient_fp_patients: number;
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

// MaternalRecordCard for maternalRecords interface
const MaternalRecordCard: React.FC<{
  record: maternalRecords;
  onPress: () => void;
}> = ({ record, onPress }) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <User color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {record.personal_info?.per_fname} {record.personal_info?.per_lname}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {record.pat_id}</Text>
              </View>
            </View>
          </View>
          <StatusBadge type={record.pat_type} />
        </View>
      </View>
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Users size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Age: <Text className="font-medium text-gray-900">{record.age}</Text> • {record.personal_info?.per_sex}
          </Text>
        </View>
        <View className="flex-row items-center mb-3">
          <FileText size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Pregnancy Count: <Text className="font-medium text-gray-900">{record.pregnancy_count ?? 'N/A'}</Text>
          </Text>
        </View>
        {record.address && (
          <View className="flex-row items-center">
            <Text className="ml-2 text-gray-600 text-sm">
              Address: <Text className="font-medium text-gray-900">
                {record.address.add_street ?? ''} {record.address.add_barangay ?? ''} {record.address.add_city ?? ''} {record.address.add_province ?? ''}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function OverallMaternalRecordsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10; 

  const queryClient = useQueryClient();

  const { data: maternalData, isLoading, isError, refetch } = useMaternalRecords({
    page,
    page_size: pageSize,
    search: searchQuery || undefined,
    status: activeTab !== "all" ? activeTab : undefined,
  });

  const { data: activePregnanciesCount } = useActivepregnanciesCount();
  
  const activePregnancies = activePregnanciesCount.active_pregnancy_count || 0;
  const maternalRecordss = maternalData?.results || [];
  const totalMCount = maternalData?.count || 0;
  const totalMPages = Math.ceil(totalMCount / pageSize);

  const filteredData = useMemo(() => {
    let result = maternalRecordss;
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (record: maternalRecords) =>
          `${record.personal_info?.per_fname ?? ''} ${record.personal_info?.per_lname ?? ''}`.toLowerCase().includes(lowerCaseQuery) ||
          record.pat_id.toLowerCase().includes(lowerCaseQuery)
      );
    }
    if (activeTab !== 'all') {
      result = result.filter((record: maternalRecords) =>
        record.pat_type.toLowerCase() === activeTab
      );
    }
    return result;
  }, [maternalRecordss, searchQuery, activeTab]);

  const counts = useMemo(() => {
    // If you have resident/transient counts from backend, use them here
    return {
      all: totalMCount,
      resident: maternalRecordss.filter((r: maternalRecords) => r.pat_type === 'Resident').length,
      transient: maternalRecordss.filter((r: maternalRecords) => r.pat_type === 'Transient').length,
    };
  }, [totalMCount, maternalRecordss]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handleRecordPress = (pat_id: string) => {
    try {
      router.push({
        pathname: "/admin/maternal/individual",
        params: { pat_id },
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalMPages) {
      setPage(newPage);
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
        headerTitle={<Text className="">Maternal Records</Text>}
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Maternal Records</Text>}
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
        {filteredData.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <FileText size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">
              There are no maternal records available yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => `mat-${item.pat_id}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item }) => (
              <MaternalRecordCard
                record={item}
                onPress={() => handleRecordPress(item.pat_id)}
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
            ListFooterComponent={() => (
              totalMPages > 1 ? (
                <View className="px-4 mb-4">
                  <Card className="bg-white border-slate-200">
                    <CardContent className="p-4">
                      <View className="flex-row items-center justify-between">
                        <Button
                          onPress={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          variant={page === 1 ? "secondary" : "default"}
                          className={page === 1 ? "bg-slate-200" : "bg-blue-600"}
                        >
                          <Text
                            className={`font-medium ${
                              page === 1 ? "text-slate-400" : "text-white"
                            }`}
                          >
                            Previous
                          </Text>
                        </Button>

                        <Text className="text-slate-600 font-medium">
                          Page {page} of {totalMPages}
                        </Text>

                        <Button
                          onPress={() => handlePageChange(page + 1)}
                          disabled={page === totalMPages}
                          variant={page === totalMPages ? "secondary" : "default"}
                          className={page === totalMPages ? "bg-slate-200" : "bg-blue-600"}
                        >
                          <Text
                            className={`font-medium ${
                              page === totalMPages ? "text-slate-400" : "text-white"
                            }`}
                          >
                            Next
                          </Text>
                        </Button>
                      </View>
                    </CardContent>
                  </Card>
                </View>
              ) : null
            )}
          />
        )}
      </View>
    </PageLayout>
  );
}