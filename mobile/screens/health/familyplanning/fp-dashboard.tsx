import { useState, useMemo } from "react"
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from "react-native"
import { router } from "expo-router"
import { Search,  AlertCircle, ChevronRight, Heart, Calendar, Clock, TrendingUp, AlertTriangle, Plus, Filter, ChevronLeft } from "lucide-react-native"

import PageLayout from "@/screens/_PageLayout"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState } from "@/components/ui/loading-state"
import { usePatientByResidentId, useFPRecordsByPatientId } from "./get-query"

interface FPRecord {
  fprecord: number
  patient_id: string
  client_id: string
  patient_name: string
  patient_age: number
  client_type: string
  patient_type: string
  method_used: string
  created_at: string
  updated_at: string
  sex: string
  dateOfFollowUp?: string
  followv_status?: string
  subtype?: string
  patrec_id?: string
}

const getFollowUpDisplayStatus = (followv_status?: string, followUpDate?: string) => {
  if (!followv_status || !followUpDate) {
    return { 
      status: "No Follow-up", 
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      textColor: "#92400E"
    };
  }

  if (followv_status.toLowerCase() === "completed") {
    return { 
      status: "Completed", 
      color: "#10B981",
      bgColor: "#D1FAE5",
      textColor: "#065F46"
    };
  }

  if (followv_status.toLowerCase() === "pending") {
    const today = new Date();
    const followUp = new Date(followUpDate);
    
    today.setHours(0, 0, 0, 0);
    followUp.setHours(0, 0, 0, 0);

    if (followUp < today) {
      return { 
        status: "Missed", 
        color: "#EF4444",
        bgColor: "#FEE2E2",
        textColor: "#991B1B"
      };
    } else if (followUp.getTime() === today.getTime()) {
      return { 
        status: "Due Today", 
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        textColor: "#92400E"
      };
    } else {
      return { 
        status: "Pending", 
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        textColor: "#1E40AF"
      };
    }
  }

  return { 
    status: followv_status, 
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    textColor: "#92400E"
  };
};

// Component for upcoming follow-ups
const UpcomingFollowUps = ({ records }: { records: FPRecord[] }) => {
  const upcomingFollowUps = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return records
      .filter(record => {
        if (!record.dateOfFollowUp || !record.followv_status) return false;
        if (record.followv_status.toLowerCase() === "completed") return false;
        
        const followUpDate = new Date(record.dateOfFollowUp);
        followUpDate.setHours(0, 0, 0, 0);
        
        // Show upcoming (future) and due today
        return followUpDate >= today;
      })
      .sort((a, b) => new Date(a.dateOfFollowUp!).getTime() - new Date(b.dateOfFollowUp!).getTime())
      .slice(0, 3); // Show only next 3 upcoming
  }, [records]);

  const missedFollowUps = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return records.filter(record => {
      if (!record.dateOfFollowUp || !record.followv_status) return false;
      if (record.followv_status.toLowerCase() === "completed") return false;
      
      const followUpDate = new Date(record.dateOfFollowUp);
      followUpDate.setHours(0, 0, 0, 0);
      
      return followUpDate < today;
    }).length;
  }, [records]);

  const formatFollowUpDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (upcomingFollowUps.length === 0) return null;

  return (
    <View className="px-4 mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900">Upcoming Follow-ups</Text>
        {missedFollowUps > 0 && (
          <View className="flex-row items-center bg-red-50 px-3 py-1 rounded-full">
            <AlertTriangle size={14} color="#EF4444" />
            <Text className="ml-1 text-sm text-red-600 font-medium">{missedFollowUps} missed</Text>
          </View>
        )}
      </View>
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {upcomingFollowUps.map((record, index) => {
          const { status, color, bgColor, textColor } = getFollowUpDisplayStatus(
            record.followv_status,
            record.dateOfFollowUp
          );
          return (
            <TouchableOpacity
              key={record.fprecord}
              className={`p-4 border-gray-100 ${
                index !== upcomingFollowUps.length - 1 ? "border-b" : ""
              }`}
              onPress={() =>
                router.push({
                  pathname: "/(health)/family-planning/fp-details",
                  params: { fprecordId: record.fprecord },
                })
              }
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {record.method_used}
                  </Text>
                  <View className="flex-row items-center">
                    <Calendar size={14} color="#6B7280" className="mr-1" />
                    <Text className="text-sm text-gray-600 mr-4">
                      {formatFollowUpDate(record.dateOfFollowUp!)}
                    </Text>
                    <Clock size={14} color="#6B7280" className="mr-1" />
                    <Text className="text-sm text-gray-600">9:00 AM</Text>
                  </View>
                </View>
                <View 
                  className="px-3 py-1 rounded-full flex-row items-center"
                  style={{ backgroundColor: bgColor }}
                >
                  <View 
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: color }}
                  />
                  <Text 
                    className="text-xs font-medium"
                    style={{ color: textColor }}
                  >
                    {status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Component for enhanced stats
const EnhancedStats = ({ records }: { records: FPRecord[] }) => {
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const methodsUsed = [...new Set(records.map(r => r.method_used))].length;
    const activeMethods = records.filter(r => !r.subtype?.includes("dropout")).length;
    const recentRecord = records[0]; // Assuming sorted by date
    
    return {
      total: totalRecords,
      methods: methodsUsed,
      active: activeMethods,
      lastVisit: recentRecord ? new Date(recentRecord.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) : "N/A"
    };
  }, [records]);

  const statItems = [
    { label: "Total Records", value: stats.total, icon: TrendingUp, color: "#3B82F6" },
    { label: "Methods Tried", value: stats.methods, icon: TrendingUp, color: "#10B981" },
    { label: "Active Methods", value: stats.active, icon: Heart, color: "#8B5CF6" },
    { label: "Last Visit", value: stats.lastVisit, icon: Calendar, color: "#F59E0B" },
  ];

  return (
    <View className="px-4 mb-6">
      {/* <Text className="text-lg font-semibold text-gray-900 mb-3">Your FP Overview</Text> */}
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <View className="flex-row flex-wrap justify-between">
          {statItems.map((item, index) => (
            <View 
              key={index}
              className="w-[48%] mb-4 bg-gray-50 rounded-xl p-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">{item.label}</Text>
                <item.icon size={16} color={item.color} />
              </View>
              <Text className="text-xl font-bold text-gray-900">{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const clientTypeOptions = [
  { id: "all", name: "All" },
  { id: "New Acceptor", name: "New" },
  { id: "Changing Method", name: "Changing" },
  { id: "Current User", name: "Current" },
  { id: "Restart", name: "Restart" },
];

export default function MyFpDashboard() {
  const { user } = useAuth();
  const rp_id = user?.resident?.rp_id;

  // Fetch patient to get pat_id
  const {
    data: patientData,
    isLoading: isPatientLoading,
    isError: isPatientError,
    error: patientError,
  } = usePatientByResidentId(rp_id);

  const pat_id = patientData?.pat_id || null;

  // Fetch FP records using pat_id
  const {
    data: fpRecords = [],
    isLoading: isRecordsLoading,
    isError: isRecordsError,
    error: recordsError,
  } = useFPRecordsByPatientId(pat_id);

  const isLoading = isPatientLoading || isRecordsLoading;
  const isError = isPatientError || isRecordsError;
  const error = patientError || recordsError;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredRecords = useMemo(() => {
    return fpRecords.filter((record: { patient_name: string; method_used: string; client_id: string; client_type: string }) => {
      const matchesSearch = 
        record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.method_used.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.client_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = selectedFilter === "all" || 
        record.client_type.toLowerCase() === selectedFilter.toLowerCase();
      
      return matchesSearch && matchesFilter;
    }).sort((a: { created_at: string | number | Date }, b: { created_at: string | number | Date }) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [fpRecords, searchQuery, selectedFilter]);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
  };

  const renderRecordItem = ({ item }: { item: FPRecord }) => {
    const { status, color, bgColor, textColor } = getFollowUpDisplayStatus(
      item.followv_status,
      item.dateOfFollowUp
    );

    return (
      <TouchableOpacity 
        className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-4 mb-4 p-4"
        onPress={() => 
          router.push({
            pathname: "/(health)/family-planning/fp-record",
            params: { fprecordId: item.fprecord },
          })
        }
      >
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-base font-semibold text-gray-900">{item.method_used}</Text>
            <Text className="text-sm text-gray-500">{item.client_type}</Text>
          </View>
          <View 
            className="px-3 py-1 rounded-full flex-row items-center"
            style={{ backgroundColor: bgColor }}
          >
            <View 
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: color }}
            />
            <Text 
              className="text-xs font-medium"
              style={{ color: textColor }}
            >
              {status}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Calendar size={14} color="#6B7280" className="mr-1" />
            <Text className="text-sm text-gray-600">
              {new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50">
        <AlertCircle size={32} color="#EF4444" />
        <Text className="text-lg text-red-600 mt-4 text-center">Failed to load dashboard</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">{error?.message}</Text>
      </View>
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
         headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Family Planning Records</Text>}
         rightAction={<View className="w-10 h-10" />}
       >
    <View className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
   
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Stats */}
        <EnhancedStats records={fpRecords} />

        {/* Upcoming Follow-ups Section */}
        <UpcomingFollowUps records={fpRecords} />

        {/* Search & Filter */}
        <View className="px-4 mb-4">
          {/* Search Bar */}
          <View className="bg-white rounded-2xl shadow-sm mb-3">
            <View className="flex-row items-center px-4 py-3">
              <Search size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-gray-900 ml-3 text-base"
                placeholder="Search records, methods..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Search your family planning records"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text className="text-blue-600 text-sm font-medium">Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Enhanced Filter */}
          <View className="bg-white rounded-2xl p-2 shadow-sm">
            <View className="flex-row items-center justify-between">
              {clientTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleFilterChange(option.id)}
                  className={`flex-1 items-center py-3 mx-1 rounded-xl transition-colors duration-200 ${
                    selectedFilter === option.id 
                      ? "bg-blue-500 shadow-lg" 
                      : "bg-gray-50"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selectedFilter === option.id ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Records List */}
        <View className="pb-6">
          {filteredRecords.length === 0 ? (
            <View className="items-center justify-center px-6 py-12">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Heart size={32} color="#D1D5DB" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No records found</Text>
              <Text className="text-gray-500 text-center leading-6">
                {searchQuery || selectedFilter !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for"
                  : "Start your family planning journey by consulting with our healthcare professionals"}
              </Text>
        
            </View>
          ) : (
            <>
              {/* Results Header */}
              <View className="px-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-gray-900">
                    Your Records ({filteredRecords.length})
                  </Text>
                  {searchQuery && (
                    <Text className="text-sm text-gray-500">
                      for "{searchQuery}"
                    </Text>
                  )}
                </View>
              </View>
              
              <FlatList
                data={filteredRecords}
                renderItem={renderRecordItem}
                keyExtractor={(item) => String(item.fprecord)}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  </PageLayout>
  )
}