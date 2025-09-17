"use client"

import { useState, useMemo } from "react"
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from "react-native"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router } from "expo-router"
import { ArrowLeft, Search, Loader2, AlertCircle, ChevronRight, Heart, Calendar, Clock, TrendingUp, AlertTriangle, Plus, Filter, ChevronLeft } from "lucide-react-native"
import { getFPRecordsForPatient } from "../admin/admin-familyplanning/GetRequest"
import PageLayout from "@/screens/_PageLayout"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState } from "@/components/ui/loading-state"

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
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (upcomingFollowUps.length === 0 && missedFollowUps === 0) return null;

  return (
    <View className="px-4 mb-4">
      {/* Missed Follow-ups Alert */}
      {missedFollowUps > 0 && (
        <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
              <AlertTriangle size={16} color="#DC2626" />
            </View>
            <View className="flex-1">
              <Text className="text-red-900 font-semibold">Missed Follow-ups</Text>
              <Text className="text-red-700 text-sm">You have {missedFollowUps} missed appointment{missedFollowUps > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Upcoming Follow-ups */}
      {upcomingFollowUps.length > 0 && (
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Calendar size={16} color="#2563EB" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">Upcoming Follow-ups</Text>
          </View>
          
          {upcomingFollowUps.map((record, index) => {
            const { status, color, bgColor, textColor } = getFollowUpDisplayStatus(record.followv_status, record.dateOfFollowUp);
            
            return (
              <TouchableOpacity
                key={record.fprecord}
                className={`p-3 rounded-xl border ${index < upcomingFollowUps.length - 1 ? 'mb-2' : ''}`}
                style={{ backgroundColor: bgColor, borderColor: color + '40' }}
                onPress={() => router.push({
                  pathname: "/(health)/family-planning/fp-details",
                  params: { fprecordId: String(record.fprecord) },
                })}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900 mb-1">
                      Record #{record.fprecord}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-1">
                      {record.method_used} • {record.client_type}
                    </Text>
                    <Text className="text-xs" style={{ color: textColor }}>
                      {formatFollowUpDate(record.dateOfFollowUp!)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View 
                      className="px-2 py-1 rounded-full mr-2"
                      style={{ backgroundColor: color + '20' }}
                    >
                      <Text className="text-xs font-medium" style={{ color: textColor }}>
                        {status}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

// Enhanced Stats Component
const EnhancedStats = ({ records }: { records: FPRecord[] }) => {
  const stats = useMemo(() => {
    const total = records.length;
    const newAcceptor = records.filter(r => r.client_type === "New Acceptor").length;
    const currentUser = records.filter(r => r.client_type === "Current User").length;
    
    // Get unique methods
    const uniqueMethods = new Set(records.map(r => r.method_used)).size;
    
    // Get latest record for current method
    const latestRecord = records.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      total,
      newAcceptor,
      currentUser,
      uniqueMethods,
      currentMethod: latestRecord?.method_used || "None"
    };
  }, [records]);

  return (
    <View className="px-4 mb-4">
      {/* Main Stats Row */}
      <View className="flex-row gap-3 mt-4 mb-3">
        <View className="flex-1  bg-blue-500 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">{stats.total}</Text>
              <Text className="text-blue-100 text-sm mt-1">Total Records</Text>
            </View>
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Heart size={20} color="white" />
            </View>
          </View>
        </View>
        
        <View className="flex-1 bg-green-500 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">{stats.uniqueMethods}</Text>
              <Text className="text-green-100 text-sm mt-1">Methods Used</Text>
            </View>
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <TrendingUp size={20} color="white" />
            </View>
          </View>
        </View>
      </View>

      {/* Secondary Stats Row
      <View className="flex-row gap-3">
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900">{stats.newAcceptor}</Text>
          <Text className="text-gray-500 text-sm mt-1">New Acceptor</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900">{stats.currentUser}</Text>
          <Text className="text-gray-500 text-sm mt-1">Current User</Text>
        </View>
      </View> */}

      {/* Current Method Card */}
      {stats.currentMethod !== "None" && (
        <View className="bg-white rounded-2xl p-4 mt-3 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
              <Heart size={20} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Current Method</Text>
              <Text className="text-lg font-semibold text-gray-900">{stats.currentMethod}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default function MyFpDashboardScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const { user } = useAuth()
  const rp_id = user?.resident?.rp_id
  const queryClient = useQueryClient()

  const {
    data: fpRecords = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FPRecord[], Error>({
    queryKey: ["myFpRecordsList", rp_id],
    queryFn: () => getFPRecordsForPatient(rp_id || ""),
    enabled: !!rp_id,
  })
  
  const filteredRecords = useMemo(() => {
    let filtered = fpRecords

    if (searchQuery) {
      filtered = filtered.filter(
        (record:any) =>
          record.client_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.method_used.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.fprecord.toString().includes(searchQuery),
      )
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((record) => record.client_type === selectedFilter)
    }

    return filtered
  }, [fpRecords, searchQuery, selectedFilter])

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value)
  }

  const handleRefresh = () => {
    refetch()
  }

  const clientTypeOptions = [
    { id: "all", name: "All Types"},
    { id: "New Acceptor", name: "New Acceptor" },
    { id: "Current User", name: "Current User" },
  ]

  const handleRecordPress = (fprecordId: number) => {
    try {
      console.log("🔄 [fp-dashboard] Navigating with fprecord:", fprecordId, "Type:", typeof fprecordId)
      router.push({
        pathname: "/(health)/family-planning/fp-details",
        params: { fprecordId: String(fprecordId) },
      })
    } catch (error) {
      console.log("❌ [fp-dashboard] Navigation error:", error)
    }
  }

  const renderRecordItem = ({ item }: { item: FPRecord }) => {
    const { status, color, bgColor, textColor } = getFollowUpDisplayStatus(item.followv_status, item.dateOfFollowUp);
    const isUrgent = status === "Due Today" || status === "Missed";

    return (
      <TouchableOpacity
        className="bg-white mx-4 mb-3 rounded-2xl shadow-sm border border-gray-100"
        onPress={() => handleRecordPress(item.fprecord)}
        accessibilityLabel={`View record details`}
      >
        <View className="p-5">
          {/* Header with urgency indicator */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 flex-row items-center">
              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Record #{item.fprecord}
                </Text>
                {isUrgent && (
                  <View className="flex-row items-center">
                    <AlertTriangle size={12} color={color} />
                    <Text className="text-xs font-medium ml-1" style={{ color }}>
                      Go to Brgy. Health Center
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
              <ChevronRight size={16} color="#6B7280" />
            </View>
          </View>

          {/* Method and Type Info */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-3">
              <Text className="text-xs text-gray-400 uppercase tracking-wide mb-1">Method</Text>
              <Text className="text-sm text-gray-900 font-semibold">{item.method_used || "Not specified"}</Text>
              {item.subtype && (
                <Text className="text-xs text-gray-500 mt-1">Subtype: {item.subtype}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 uppercase tracking-wide mb-1">Client Type</Text>
              <View className="flex-row items-center">
                <View 
                  className={`px-2 py-1 rounded-full ${item.client_type}`}
                >
                  {/* <Text className={`text-xs font-medium ${item.client_type === 'New Acceptor' ? 'text-blue-800' : 'text-green-800'}`}>
                    {item.client_type || "N/A"}
                  </Text> */}
                  <Text className={`text-xs font-medium ${item.client_type}`}>
                    {item.client_type || "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Follow-up Info */}
          {item.dateOfFollowUp && (
            <View className="mb-3">
              <Text className="text-xs text-gray-400 uppercase tracking-wide mb-2">Next Follow-up</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Clock size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-700 ml-2">
                    {new Date(item.dateOfFollowUp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View 
                  className="px-3 py-1 rounded-full border"
                  style={{ backgroundColor: bgColor, borderColor: color + '40' }}
                >
                  <Text className="text-xs font-medium" style={{ color: textColor }}>
                    {status}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Date Created */}
          <View className="pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-400">
              Created {new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return <LoadingState/>}

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
          <AlertCircle size={24} color="#EF4444" />
        </View>
        <Text className="text-gray-900 font-semibold text-lg text-center">Oops! Something went wrong</Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">{error?.message}</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          className="mt-6 bg-blue-600 px-8 py-3 rounded-xl shadow-lg"
          accessibilityLabel="Try again"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
     <PageLayout
        leftAction={<TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-slate-700" />
        </TouchableOpacity>}
        headerTitle={<Text className="text-slate-900 text-[13px]">My Family Planning Records</Text>}
        rightAction={<View className="w-10 h-10" />}>
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