import { useState, useMemo } from "react"
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from "react-native"
import { router } from "expo-router"
import { Search, AlertCircle, ChevronRight, Heart, Calendar, Clock, TrendingUp, AlertTriangle, ChevronLeft, Activity } from "lucide-react-native"
import { useLocalSearchParams } from "expo-router"; // NEW: Import this
import PageLayout from "@/screens/_PageLayout"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState } from "@/components/ui/loading-state"
import { usePatientByResidentId, useFPRecordsByPatientId } from "./get-query"
import { Button } from "@/components/ui/button";

interface FPRecord {
  fprecord: number
  pat_id: string
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

  return (
    <View className="px-4 mb-6">
      <View className="flex-row items-center justify-between mb-3 mt-2">
        <Text className="text-lg font-semibold text-gray-900">Upcoming Follow-ups</Text>
        <View className="flex-row items-center">
          {missedFollowUps > 0 && (
            <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full mr-2">
              <AlertTriangle size={12} color="#EF4444" />
              <Text className="text-xs text-red-600 ml-1">{missedFollowUps} missed</Text>
            </View>
          )}
          <Clock size={16} color="#6B7280" />
        </View>
      </View>
      
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {upcomingFollowUps.length === 0 ? (
          <View className="items-center py-4">
            <TrendingUp size={24} color="#D1D5DB" />
            <Text className="text-sm text-gray-500 mt-2">No upcoming follow-ups</Text>
          </View>
        ) : (
          upcomingFollowUps.map((followUp, index) => {
            const { status, color, bgColor, textColor } = getFollowUpDisplayStatus(
              followUp.followv_status,
              followUp.dateOfFollowUp
            );
            
            return (
              <View
                key={followUp.fprecord}
                className={`flex-row items-center justify-between py-3 ${
                  index < upcomingFollowUps.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">{followUp.method_used}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {new Date(followUp.dateOfFollowUp!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </Text>
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
            );
          })
        )}
      </View>
    </View>
  );
};

// Component for active methods
const ActiveMethods = ({ records }: { records: FPRecord[] }) => {
  const activeMethods = useMemo(() => {
    return records
      .filter(record => !record.dateOfFollowUp || new Date(record.dateOfFollowUp) > new Date())
      .slice(0, 3);
  }, [records]);

  return (
    <View className="px-4 mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900">Active Methods</Text>
        <Activity size={16} color="#6B7280" />
      </View>
      
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {activeMethods.length === 0 ? (
          <View className="items-center py-4">
            <Heart size={24} color="#D1D5DB" />
            <Text className="text-sm text-gray-500 mt-2">No active methods</Text>
          </View>
        ) : (
          activeMethods.map((method, index) => (
            <View
              key={method.fprecord}
              className={`flex-row items-center justify-between py-3 ${
                index < activeMethods.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">{method.method_used}</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Started: {new Date(method.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-green-50">
                <Text className="text-xs font-medium text-green-700">Active</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};


export default function MyFPDashboardScreen() {
  const params = useLocalSearchParams<{ pat_id?: string }>(); // NEW: Get pat_id from params
  const patIdFromParams = params.pat_id;
  const { user } = useAuth();
  const rp_id = user?.rp;

  // NEW: Debug logs
  console.log("[DEBUG] fp-dashboard patIdFromParams:", patIdFromParams);
  console.log("[DEBUG] rp_id from auth:", rp_id);

  // NEW: Conditional patient query (only if no pat_id provided)
  const { data: patientData, isLoading: isLoadingPatient, isError: isErrorPatient, error: errorPatient } = usePatientByResidentId(rp_id || "", {
    enabled: !patIdFromParams && !!rp_id, // Skip if pat_id provided (admin)
  });

  const pat_id = patIdFromParams || patientData?.pat_id;
  console.log("[DEBUG] pat_id used for FP records:", pat_id);

  const {
    data: records = [],
    isLoading: isLoadingRecords,
    isError: isErrorRecords,
    error: errorRecords,
    refetch,
  } = useFPRecordsByPatientId(pat_id);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record:any) =>
          record.method_used.toLowerCase().includes(lowerQuery) ||
          record.client_type.toLowerCase().includes(lowerQuery) ||
          record.patient_name.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((record:any) => record.client_type.toLowerCase() === selectedFilter);
    }

    return filtered.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [records, searchQuery, selectedFilter]);

  const activeMethods = useMemo(() => {
    return filteredRecords.filter((record: FPRecord) => record.followv_status?.toLowerCase() !== "completed");
  }, [filteredRecords]);

  if (isLoadingPatient || isLoadingRecords) {
    return <LoadingState />;
  }

  if (isErrorPatient || isErrorRecords) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <AlertCircle size={48} color="#EF4444" />
        <Text className="text-xl font-semibold text-red-500 mt-4">No records found</Text>
        <Text className="text-gray-600 mt-2 text-center">{(errorPatient || errorRecords)?.message ?? "Please try again later."}</Text>
        <Button onPress={() => router.back()} className="mt-4 bg-blue-600">
          <Text className="text-white">Back</Text>
        </Button>
      </View>
    );
  }

  // NEW: Auth check only if no pat_id and no user
  if (!pat_id && !user) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <AlertCircle size={48} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-800 mt-4">Authentication Required</Text>
        <Text className="text-gray-500 mt-2 text-center">Please log in to view your family planning records.</Text>
      </View>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-slate-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">{patIdFromParams ? 'Family Planning Dashboard' : 'My Family Planning Dashboard'}</Text>} // NEW: Dynamic title
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        <ScrollView showsVerticalScrollIndicator={false}>
          <UpcomingFollowUps records={filteredRecords} />
          <ActiveMethods records={activeMethods} />

          {/* Filter Section */}
          <View className="px-4 mb-4">
            {/* Search Bar */}
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-3 flex-row items-center">
              <Search size={20} color="#9CA3AF" />
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
                      {patIdFromParams ? 'Records' : 'Your Records'} ({filteredRecords.length})
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
                  renderItem={({ item }) => renderRecordItem(item, patIdFromParams)} // Use updated renderRecordItem
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
  );
};

const renderRecordItem = (item: FPRecord, patIdFromParams?: string) => {
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
          params: { fprecordId: item.fprecord, pat_id: patIdFromParams },
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