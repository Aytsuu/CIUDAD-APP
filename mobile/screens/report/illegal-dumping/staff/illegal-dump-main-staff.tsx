import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Search, CheckCircle, ChevronLeft, SquareArrowOutUpRight, XCircle } from 'lucide-react-native';
import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
import { SelectLayout } from '@/components/ui/select-layout';
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from '@/screens/_PageLayout';
import { router } from 'expo-router';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";

export default function WasteIllegalDumping() {
  const [selectedFilterId, setSelectedFilterId] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState<boolean>(false);  
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'cancelled'>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Map tab to status value for backend
  const getStatusParam = (tab: string) => {
    if (tab === "pending") return "pending";
    if (tab === "resolved") return "resolved";
    if (tab === "cancelled") return "cancelled";
    return "";
  };

  // Fetch data with backend filtering and pagination
  const { data: wasteReportData = { results: [], count: 0 }, isLoading, isError, refetch } = useWasteReport(
    1,
    1000,
    debouncedSearchQuery, 
    selectedFilterId,
    getStatusParam(activeTab)
  );

  // Extract the actual data array from paginated response
  const fetchedData = wasteReportData.results || [];

  const filterOptions = [
    { id: "0", name: "All Report Matter" },
    { id: "Littering, Illegal dumping, Illegal disposal of garbage", name: "Littering, Illegal dumping, Illegal disposal of garbage" },
    { id: "Urinating, defecating, spitting in a public place", name: "Urinating, defecating, spitting in a public place" },
    { id: "Dirty frontage and immediate surroundings for establishment owners", name: "Dirty frontage and immediate surroundings for establishment owners" },
    { id: "Improper and untimely stacking of garbage outside residences or establishment", name: "Improper and untimely stacking of garbage outside residences or establishment" },
    { id: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)", name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)" },
    { id: "Dirty public utility vehicles, or no trash can or receptacle", name: "Dirty public utility vehicles, or no trash can or receptacle" },
    { id: "Spilling, scattering, littering of wastes by public utility vehicles", name: "Spilling, scattering, littering of wastes by public utility vehicles" },
    { id: "Illegal posting or installed signage, billboards, posters, streamers and movie ads.", name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads." },
  ];

  const handleFilterChange = (value: string) => {
    setSelectedFilterId(value);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val as 'pending' | 'resolved' | 'cancelled');
  };

  const handleView = async (item: any) => {
    router.push({
      pathname: '/(waste)/illegal-dumping/staff/illegal-dump-view-staff',
      params: { rep_id: item.rep_id }
    });
  };

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  const renderReportCard = (item: WasteReport) => (
    <Pressable
      key={item.rep_id}
      onPress={() => handleView(item)}
      className="mb-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm active:opacity-80"
    >
      <View className="flex-row justify-between items-start mb-3">
        <Text className="font-semibold text-xl text-primaryBlue">Report No. {item.rep_id}</Text>
        <View className="flex-row items-center">
          {item.rep_status === "resolved" ? (
            <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full border border-green-600">
              <CheckCircle size={12} color="#22c55e" />
              <Text className="text-green-600 text-sm font-medium ml-1">Resolved</Text>
            </View>
          ) : item.rep_status === "cancelled" ? (
            <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full border border-red-600">
              <XCircle size={12} color="#ef4444" />
              <Text className="text-red-600 text-sm font-medium ml-1">Cancelled</Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded-full border border-primaryBlue">
              <Text className="text-primaryBlue text-sm font-medium">In progress</Text>
            </View>
          )}
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Matter:</Text>
        <Text className="text-base">{item.rep_matter}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Sitio:</Text>
        <Text className="text-base">{item.sitio_name}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Location:</Text>
        <Text className="text-base">{item.rep_location}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Complainant:</Text>
        <Text className="text-base">
          {item.rep_anonymous ? "Anonymous" : item.rep_complainant}
        </Text>
      </View>

      {item.rep_status === "cancelled" && item.rep_cancel_reason && (
        <View className="mb-4">
          <Text className="text-base font-semibold">Cancel Reason:</Text>
          <Text>{item.rep_cancel_reason}</Text>
        </View>
      )}

      <View className="self-end">
        <SquareArrowOutUpRight size={16} color="#00A8F0" />
      </View>
    </Pressable>
  );

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Illegal Dumping Reports</Text>}
        rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center" />}
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">Failed to load reports.</Text>
          <TouchableOpacity onPress={handleRefresh} className="bg-[#2a3a61] px-4 py-2 rounded-lg">
            <Text className="text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Illegal Dumping Reports</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar - Conditionally rendered */}
        {showSearch && (
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => {}}
          />
        )}

        {/*TABS*/}
        <View className="bg-white border-b border-gray-200 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {[
              { key: "pending", label: "Reports" },
              { key: "resolved", label: "Resolved" },
              { key: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabChange(tab.key)}
                className={`flex-1 px-4 py-4 items-center border-b-2 ${
                  activeTab === tab.key ? "border-blue-500" : "border-transparent"
                }`}
              >
                <Text className={`text-sm font-medium ${activeTab === tab.key ? "text-blue-600" : "text-gray-500"}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>      

        <View className="flex-1 px-6">
          {/* Filters only - Search moved to top */}
          <View className="mb-4">
            <SelectLayout
              placeholder="Select report matter"
              options={filterOptions.map(({ id, name }) => ({ value: id, label: name }))}
              selectedValue={selectedFilterId}
              onSelect={(option) => handleFilterChange(option.value)}
              className="bg-white"
            />
          </View>

          {/* Tab Content */}
          <View className="mb-2">
            <Text className="text-sm text-gray-500">
              {fetchedData.length} report{fetchedData.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {isLoading && !isRefreshing ? (
            renderLoadingState()               
          ) : (
            <FlatList
              data={fetchedData}
              renderItem={({ item }) => renderReportCard(item)}
              keyExtractor={(item) => item.rep_id.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#00a8f0']}
                  tintColor="#00a8f0"
                />
              }
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center">
                    No {activeTab} reports found
                  </Text>
                </View>
              }
            />
          )}       
        </View>
      </View>
    </PageLayout>
  );
}