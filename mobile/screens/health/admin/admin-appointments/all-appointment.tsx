import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native";
import { Search, AlertCircle, Calendar, ChevronLeft, RefreshCw, ChevronDown, CalendarDays } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { format } from "date-fns";
import { useAllAppointments } from "../../my-schedules/fetch";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { StatBadge } from "../components/status-badge";
import { PaginationControls } from "../components/pagination-layout";

type ScheduleRecord = {
  id: number;
  patient: {
    firstName: string;
    lastName: string;
    middleName: string;
    gender: string;
    age: number;
    ageTime: string;
    patientId: string;
  };
  scheduledDate: string;
  purpose: string;
  status: "Pending" | "Completed" | "Missed" | "Cancelled";
  sitio: string;
  type: "Transient" | "Resident";
  patrecType: string;
};

type TabType = "pending" | "completed" | "missed" | "cancelled";
type DateFilterType = "all" | "today" | "thisWeek" | "thisMonth";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// TabBar Component
const TabBar: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}> = ({ activeTab, setActiveTab }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    {(['pending', 'completed', 'missed', 'cancelled'] as TabType[]).map((tab) => (
      <TouchableOpacity
        key={tab}
        onPress={() => setActiveTab(tab)}
        className={`flex-1 items-center py-3 ${activeTab === tab ? 'border-b-2 border-blue-600' : ''}`}
      >
        <Text className={`text-sm font-medium ${activeTab === tab ? 'text-blue-600' : 'text-gray-600'}`}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// AppointmentCard Component
const AppointmentCard: React.FC<{ appointment: ScheduleRecord; onPress: () => void }> = ({ appointment, onPress }) => {
  const formattedDate = appointment.scheduledDate
    ? format(new Date(appointment.scheduledDate), 'MMM dd, yyyy')
    : 'N/A';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-base font-semibold text-gray-900">
          {appointment.patient.firstName} {appointment.patient.lastName}
        </Text>
        <StatBadge status={appointment.status} />
      </View>
      <View className="mt-2">
        <View className="flex-row items-center">
          <Calendar size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-600">{formattedDate}</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Text className="text-sm font-medium text-gray-800">Purpose: </Text>
          <Text className="text-sm text-gray-600">{appointment.purpose}</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Text className="text-sm font-medium text-gray-800">Type: </Text>
          <Text className="text-sm text-gray-600">{appointment.patrecType}</Text>
        </View>
        {appointment.sitio && (
          <View className="flex-row items-center mt-1">
            <Text className="text-sm font-medium text-gray-800">Sitio: </Text>
            <Text className="text-sm text-gray-600">{appointment.sitio}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ResultsInfo Component
const ResultsInfo: React.FC<{
  currentPage: number;
  pageSize: number;
  totalCount: number;
  isLoading: boolean;
}> = ({ currentPage, pageSize, totalCount, isLoading }) => {
  if (isLoading || totalCount === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <View className="px-4 py-2 bg-white border-b border-gray-200">
      <Text className="text-sm text-gray-600">
        Showing {start} to {end} of {totalCount} appointments
      </Text>
    </View>
  );
};

// Date Filter Dropdown Component
const DateFilterDropdown: React.FC<{
  selectedFilter: DateFilterType;
  onFilterChange: (filter: DateFilterType) => void;
}> = ({ selectedFilter, onFilterChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const filterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
  ];

  const currentLabel = filterOptions.find(opt => opt.value === selectedFilter)?.label || "All Time";

  return (
    <View className="relative px-4 py-3 bg-white border-b border-gray-200">
      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
      >
        <View className="flex-row items-center gap-2">
          <CalendarDays size={18} color="#6B7280" />
          <Text className="text-gray-900 font-medium">{currentLabel}</Text>
        </View>
        <ChevronDown 
          size={18} 
          color="#6B7280"
          style={{ transform: [{ rotate: showDropdown ? "180deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      {showDropdown && (
        <View className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          {filterOptions.map((option) => {
            const isSelected = selectedFilter === option.value;
            
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onFilterChange(option.value as DateFilterType);
                  setShowDropdown(false);
                }}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  isSelected ? "bg-blue-50" : ""
                }`}
              >
                <Text className={`font-medium ${
                  isSelected ? "text-blue-600" : "text-gray-700"
                }`}>
                  {option.label}
                </Text>
                {isSelected && (
                  <View className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default function AllAppointments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery, 500);

  const filters = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: debouncedSearch,
      tab: activeTab,
      time_frame: dateFilter, // Send the date filter directly as time_frame
      sort_by: 'scheduledDate',
      sort_order: 'desc' as 'desc' | 'asc',
    }),
    [currentPage, debouncedSearch, activeTab, dateFilter]
  );

  const {
    data: paginatedData,
    isLoading,
    isError,
    refetch
  } = useAllAppointments(filters);

  const appointments = useMemo(() => paginatedData?.results || [], [paginatedData]);
  const totalCount = paginatedData?.total_records || paginatedData?.count || paginatedData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  }, []);

  const handleDateFilterChange = useCallback((filter: DateFilterType) => {
    setDateFilter(filter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  if (isLoading && !refreshing) {
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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">All Appointments</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <LoadingState />
      </PageLayout>
    );
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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">All Appointments</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
            Error loading appointments
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Please check your connection and try again.
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg mt-4"
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">All Appointments</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-1 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-800 text-base"
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Date Filter Dropdown */}
        <DateFilterDropdown 
          selectedFilter={dateFilter}
          onFilterChange={handleDateFilterChange}
        />

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Results Info */}
        <ResultsInfo currentPage={currentPage} pageSize={pageSize} totalCount={totalCount} isLoading={isLoading} />

        {/* Appointments List */}
        <View className="flex-1">
          <FlatList
            data={appointments}
            keyExtractor={(item) => `appointment-${item.id}-${currentPage}`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <Calendar size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                  {searchQuery || activeTab !== 'pending' ? 'No appointments found' : 'No appointments scheduled'}
                </Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery ? `No ${activeTab} appointments match "${searchQuery}"` : `No ${activeTab} appointments found`}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <AppointmentCard
                appointment={item}
                onPress={() => console.log("")}
              />
            )}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </View>
      </View>
    </PageLayout>
  );
}