import React, { useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Calendar, Baby, Heart, ChevronLeft, Users, AlertCircle, RefreshCw } from 'lucide-react-native';
import { Text as UIText } from '@/components/ui/text';
import { useChildHealthRecords } from '../queries/fetchQueries';
import { ChildHealthRecord } from '../../admin-patientsrecord/types';
import PageLayout from '@/screens/_PageLayout';
import { LoadingState } from '@/components/ui/loading-state';
import { calculateAge } from '@/helpers/ageCalculator';

type TabType = "all" | "resident" | "transient";

// Components (keep your existing StatusBadge, TabBar, ChildHealthCard components the same)
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
      <UIText className={`text-xs font-semibold ${typeConfig.color}`}>
        {type}
      </UIText>
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
      <UIText className={`text-sm font-medium ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-600'}`}>
        All ({counts.all})
      </UIText>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('resident')}
      className={`flex-1 items-center py-3 ${activeTab === 'resident' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <UIText className={`text-sm font-medium ${activeTab === 'resident' ? 'text-blue-600' : 'text-gray-600'}`}>
        Residents ({counts.resident})
      </UIText>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('transient')}
      className={`flex-1 items-center py-3 ${activeTab === 'transient' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <UIText className={`text-sm font-medium ${activeTab === 'transient' ? 'text-blue-600' : 'text-gray-600'}`}>
        Transients ({counts.transient})
      </UIText>
    </TouchableOpacity>
  </View>
);

const ChildHealthCard: React.FC<{
  child: ChildHealthRecord;
  onPress: () => void;
}> = ({ child, onPress }) => {
  const formatDateSafely = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
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
                <Baby color="white" size={20} />
              </View>
              <View className="flex-1">
                <UIText className="font-semibold text-lg text-gray-900">
                  {child.fname} {child.lname}
                </UIText>
                <UIText className="text-gray-500 text-sm">ID: {child.pat_id}</UIText>
              </View>
            </View>
          </View>
          <View className="items-end">
            <StatusBadge type={child.pat_type} />
          </View>
        </View>
      </View>

      {/* Details */}
      <View className="p-4 space-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Calendar size={16} color="#6B7280" />
            <UIText className="ml-2 text-sm text-gray-700">
              Born: {formatDateSafely(child.dob)}
            </UIText>
          </View>
          <UIText className="text-sm text-gray-600">
            {child.age} years old, {child.sex}
          </UIText>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Heart size={16} color="#6B7280" />
            <UIText className="ml-2 text-sm text-gray-700">
              {child.health_checkup_count} checkups
            </UIText>
          </View>
          {/* <View className="flex-row items-center">
            <UIText className="text-sm text-gray-600">
              Weight: {child.birth_weight || 'N/A'} kg
            </UIText>
          </View> */}
        </View>

        <View className="flex-row items-start">
          <Users size={16} color="#6B7280" className="mt-0.5" />
          <UIText className="ml-2 text-sm text-gray-700 flex-1">
            Family #: {child.family_no}
          </UIText>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <MapPin size={16} color="#6B7280" />
            <UIText 
              className="ml-2 text-sm text-gray-700 flex-1"
              style={{ flexWrap: 'wrap' }}
            >
              {child.address}
            </UIText>
          </View> 
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AllChildHealthRecords() {
  const router = useRouter();
  const { data: childHealthRecords, isLoading, refetch, error } = useChildHealthRecords();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // FIXED: Proper error handling for childHealthRecords
  const formatChildHealthData = useCallback((): ChildHealthRecord[] => {
    console.log("Raw childHealthRecords:", childHealthRecords);
    
    // Add comprehensive checks
    if (!childHealthRecords) {
      console.log("No childHealthRecords data");
      return [];
    }

    if (!Array.isArray(childHealthRecords)) {
      console.log("childHealthRecords is not an array:", typeof childHealthRecords);
      
      // Try to handle if it's an object with a data property
      if (childHealthRecords && typeof childHealthRecords === 'object') {
        if (Array.isArray(childHealthRecords.data)) {
          console.log("Using childHealthRecords.data array");
          return childHealthRecords.data.map((record: any) => formatRecord(record));
        } else if (Array.isArray(childHealthRecords.children)) {
          console.log("Using childHealthRecords.children array");
          return childHealthRecords.children.map((record: any) => formatRecord(record));
        } else if (Array.isArray(childHealthRecords.results)) {
          console.log("Using childHealthRecords.results array");
          return childHealthRecords.results.map((record: any) => formatRecord(record));
        }
      }
      
      return [];
    }

    // If it's an array, proceed normally
    return childHealthRecords.map((record: any) => formatRecord(record));
  }, [childHealthRecords]);

  // Helper function to format individual records
  const formatRecord = (record: any): ChildHealthRecord => {
    const childInfo = record.patrec_details?.pat_details?.personal_info || {};
    const motherInfo = record.patrec_details?.pat_details?.family_head_info?.family_heads?.mother?.personal_info || {};
    const fatherInfo = record.patrec_details?.pat_details?.family_head_info?.family_heads?.father?.personal_info || {};
    const addressInfo = record.patrec_details?.pat_details?.address || {};

    return {
      chrec_id: record.chrec_id || '',
      pat_id: record.patrec_details?.pat_details?.pat_id || '',
      fname: childInfo.per_fname || '',
      lname: childInfo.per_lname || '',
      mname: childInfo.per_mname || '',
      sex: childInfo.per_sex || '',
      age: calculateAge(childInfo.per_dob).toString(),
      dob: childInfo.per_dob || '',
      householdno: record.patrec_details?.pat_details?.households?.[0]?.hh_id || '',
      address: [
        addressInfo.add_sitio,
        addressInfo.add_street,
        addressInfo.add_barangay,
        addressInfo.add_city,
        addressInfo.add_province,
      ].filter(Boolean).join(', ') || 'No address Provided',
      sitio: addressInfo.add_sitio || '',
      landmarks: addressInfo.add_landmarks || '',
      pat_type: record.patrec_details?.pat_details?.pat_type || '',
      mother_fname: motherInfo.per_fname || '',
      mother_lname: motherInfo.per_lname || '',
      mother_mname: motherInfo.per_mname || '',
      mother_contact: motherInfo.per_contact || '',
      mother_occupation: motherInfo.per_occupation || record.mother_occupation || '',
      father_fname: fatherInfo.per_fname || '',
      father_lname: fatherInfo.per_lname || '',
      father_mname: fatherInfo.per_mname || '',
      father_contact: fatherInfo.per_contact || '',
      father_occupation: fatherInfo.per_occupation || record.father_occupation || '',
      family_no: record.family_no || 'Not Provided',
      birth_weight: record.birth_weight || 0,
      birth_height: record.birth_height || 0,
      type_of_feeding: record.type_of_feeding || 'Unknown',
      delivery_type: record.place_of_delivery_type || '',
      place_of_delivery_type: record.place_of_delivery_type || '',
      pod_location: record.pod_location || '',
      pod_location_details: record.pod_location_details || '',
      health_checkup_count: record.health_checkup_count || 0,
      birth_order: record.birth_order || '',
      tt_status: record.tt_status || '',
      street: '',
      barangay: '',
      city: '',
      province: ''
    };
  };

  const formattedData = useMemo(() => formatChildHealthData(), [formatChildHealthData]);

  // Filter data based on active tab and search query
  const filteredData = useMemo(() => {
    let filtered = formattedData;

    // Filter by search query first
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((child) => {
        const searchText = (
          `${child.fname} ${child.lname} ${child.mname} ` +
          `${child.mother_fname} ${child.mother_lname} ${child.mother_mname} ` +
          `${child.father_fname} ${child.father_lname} ${child.father_mname} ` +
          `${child.address} ${child.sitio} ${child.family_no} ${child.pat_type} ${child.pat_id}`
        ).toLowerCase();
        return searchText.includes(lowerCaseQuery);
      });
    }

    // Filter by active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((child) => 
        child.pat_type.toLowerCase() === activeTab
      );
    }

    // Sort by most recent (by age, youngest first)
    filtered.sort((a, b) => parseInt(a.age) - parseInt(b.age));

    return filtered;
  }, [formattedData, searchQuery, activeTab]);

  // Calculate stats for tabs
  const counts = useMemo(() => ({
    all: formattedData.length,
    resident: formattedData.filter((p) => p.pat_type.toLowerCase() === "resident").length,
    transient: formattedData.filter((p) => p.pat_type.toLowerCase() === "transient").length,
  }), [formattedData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handleChildPress = (child: ChildHealthRecord) => {
    if (!child.chrec_id || !child.pat_id || !child.dob) {
      console.error('Missing required fields');
      return;
    }
    router.push({
      pathname: '/(health)/childhealth/my-records',
      params: { 
        pat_id: child.pat_id,
        mode: "admin"
      },
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
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
        headerTitle={<UIText className="text-gray-900 text-lg font-semibold">Child Health Records</UIText>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <UIText className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</UIText>
          <UIText className="text-gray-600 text-center mt-2 mb-6">
            Failed to load child health records. Please check your connection and try again.
          </UIText>
          <TouchableOpacity
            onPress={onRefresh}
            className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg"
          >
            <RefreshCw size={18} color="white" />
            <UIText className="ml-2 text-white font-medium">Try Again</UIText>
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
      headerTitle={<UIText className="text-gray-900 text-lg font-semibold">Child Health Records</UIText>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-3 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

        {/* Records List */}
        {formattedData.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Baby size={64} color="#9CA3AF" />
            <UIText className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</UIText>
            <UIText className="text-gray-600 text-center mt-2">
              {childHealthRecords ? "No child health records match your criteria." : "No child health records available yet."}
            </UIText>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => `child-${item.chrec_id}-${item.pat_id}`}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#3B82F6']} 
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item }) => (
              <ChildHealthCard
                child={item}
                onPress={() => handleChildPress(item)}
              />
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <Baby size={48} color="#D1D5DB" />
                <UIText className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                  No records in this category
                </UIText>
                <UIText className="text-gray-500 text-center">
                  {searchQuery
                    ? `No ${activeTab === 'all' ? '' : activeTab} records match your search.`
                    : `No ${activeTab === 'all' ? '' : activeTab} records found.`}
                </UIText>
              </View>
            )}
          />
        )}
      </View>
    </PageLayout>
  );
}