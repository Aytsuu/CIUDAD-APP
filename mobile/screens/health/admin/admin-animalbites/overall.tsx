import React, { useState, useMemo } from "react"
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native"
import { Search, ChevronLeft, AlertCircle,User, Calendar, FileText, Users,MapPin, RefreshCw } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link, router } from "expo-router"
import { format } from "date-fns"
import { useAnimalBitePatientSummary } from "./db-request/get-query"
import PageLayout from "@/screens/_PageLayout"
import { LoadingState } from "@/components/ui/loading-state"

type PatientSummary = {
  patient_id: string
  patient_fname: string
  patient_lname: string
  patient_mname?: string
  patient_sex: string
  patient_age: number
  patient_type: string
  patient_address: string
  record_count: number
  record_created_at: string
  first_record_date: string
}

type TabType = "all" | "resident" | "transient"

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

const AnimalBiteCard: React.FC<{
  patient: PatientSummary;
  onPress: () => void;
}> = ({ patient, onPress }) => {
  const formatDateSafely = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "Invalid Date";
    }
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
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <User color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {patient.patient_fname} {patient.patient_lname}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {patient.patient_id}</Text>
              </View>
            </View>
          </View>
          <StatusBadge type={patient.patient_type} />
        </View>
      </View>

      {/* Details */}
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Calendar size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            First Record: <Text className="font-medium text-gray-900">{formatDateSafely(patient.first_record_date)}</Text>
          </Text>
        </View>
        <View className="flex-row items-center mb-3">
          <Users size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Age: <Text className="font-medium text-gray-900">{patient.patient_age}</Text> • {patient.patient_sex}
          </Text>
        </View>
        <View className="flex-row items-center mb-3">
          <MapPin size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Address: <Text className="font-medium text-gray-900">{patient.patient_address}</Text>
          </Text>
        </View>
        <View className="flex-row items-center">
          <FileText size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Records: <Text className="font-medium text-gray-900">{patient.record_count}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AnimalBiteOverallScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { data: patientSummary, isLoading, isError, error, refetch, isFetching } = useAnimalBitePatientSummary()

  const patients: PatientSummary[] = useMemo(() => {
    if (!patientSummary) return []
    return patientSummary
  }, [patientSummary])

  const filteredData = useMemo(() => {
    let result = patients
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      result = result.filter(
        (patient) =>
          patient.patient_fname.toLowerCase().includes(lowerCaseQuery) ||
          patient.patient_lname.toLowerCase().includes(lowerCaseQuery) ||
          patient.patient_id.toLowerCase().includes(lowerCaseQuery)
      )
    }
    if (activeTab !== 'all') {
      result = result.filter((patient) =>
        patient.patient_type.toLowerCase() === activeTab
      )
    }
    return result
  }, [patients, searchQuery, activeTab])

  const counts = useMemo(() => {
    return {
      all: patients.length,
      resident: patients.filter((p) => p.patient_type.toLowerCase() === "resident").length,
      transient: patients.filter((p) => p.patient_type.toLowerCase() === "transient").length,
    };
  }, [patients]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handleRecordPress = (patientId: string) => { try { router.push({ pathname: "/admin/animalbites/individual", params: { patientId }, }); } catch (error) { console.log("Navigation error:", error); } };

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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">Animal Bite Records</Text>}
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Animal Bite Records</Text>}
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
        {patients.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <FileText size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">
              There are no animal bite records available yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => `ab-${item.patient_id}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item }) => (
              <AnimalBiteCard
                patient={item}
                onPress={() => handleRecordPress(item.patient_id)}
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