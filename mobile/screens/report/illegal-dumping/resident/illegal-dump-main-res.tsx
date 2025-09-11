import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Search, CheckCircle, ChevronLeft, SquareArrowOutUpRight, XCircle } from 'lucide-react-native';
import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
import { SelectLayout } from '@/components/ui/select-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageLayout from '@/screens/_PageLayout';
import { router } from 'expo-router';

export default function WasteIllegalDumpingResMain() {
  let rp_ide = '00003250910';
  const {
    data: fetchedData = [],
    isLoading,
    isError,
    refetch,
  } = useWasteReport(rp_ide);

  const [selectedFilterId, setSelectedFilterId] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'pending' | 'resolved' | 'cancelled'
  >('pending');

  const filterOptions = [
    { id: "0", name: "All Report Matter" },
    { id: "1", name: "Littering, Illegal dumping, Illegal disposal of garbage" },
    { id: "2", name: "Urinating, defecating, spitting in a public place" },
    { id: "3", name: "Dirty frontage and immediate surroundings for establishment owners" },
    { id: "4", name: "Improper and untimely stacking of garbage outside residences or establishment" },
    { id: "5", name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)" },
    { id: "6", name: "Dirty public utility vehicles, or no trash can or receptacle" },
    { id: "7", name: "Spilling, scattering, littering of wastes by public utility vehicles" },
    { id: "8", name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads." },
  ];

  // Filtering data based on tab, filter, and search
  const filteredData = useMemo(() => {
    let result = fetchedData;

    // Filter by tab
    if (activeTab === 'pending') {
      result = result.filter(
        (item) =>
          item.rep_status !== 'resolved' && item.rep_status !== 'cancelled'
      );
    } else if (activeTab === 'resolved') {
      result = result.filter((item) => item.rep_status === 'resolved');
    } else if (activeTab === 'cancelled') {
      result = result.filter((item) => item.rep_status === 'cancelled');
    }

    // Filter by selected report matter
    if (selectedFilterId !== '0') {
      const selectedFilterName =
        filterOptions.find((option) => option.id === selectedFilterId)?.name ||
        '';
      result = result.filter(
        (item) =>
          item.rep_matter.trim().toLowerCase() ===
          selectedFilterName.trim().toLowerCase()
      );
    }

    // Search filter
    if (searchQuery) {
      result = result.filter((item) =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [fetchedData, selectedFilterId, searchQuery, activeTab]);

  const handleView = async (item: any) => {
    router.push({
      pathname:
        '/(waste)/illegal-dumping/resident/illegal-dump-view-res',
      params: {
        rep_id: item.rep_id,
        rep_matter: item.rep_matter,
        rep_location: item.rep_location,
        sitio_name: item.sitio_name,
        sitio_id: item.sitio_id,
        rep_violator: item.rep_violator,
        rep_complainant: item.rep_complainant,
        rep_contact: item.rep_contact,
        rep_status: item.rep_status,
        rep_cancel_reason: item.rep_cancel_reason,
        rep_date: item.rep_date,
        rep_date_resolved: item.rep_date_resolved,
        rep_date_cancelled: item.rep_date_cancelled,
        rep_anonymous: item.rep_anonymous,
        rep_add_details: item.rep_add_details,
        waste_report_file: JSON.stringify(item.waste_report_file || []),
        waste_report_rslv_file: JSON.stringify(
          item.waste_report_rslv_file || []
        ),
      },
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderReportCard = (item: WasteReport) => (
    <Pressable
      key={item.rep_id}
      onPress={() => handleView(item)}
      className="mb-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm active:opacity-80"
    >
      <View className="flex-row justify-end items-start mb-3">
        <View className="flex-row items-center">
          {item.rep_status === 'resolved' ? (
            <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle size={12} color="#22c55e" />
              <Text className="text-green-600 text-sm font-medium ml-1">
                Resolved
              </Text>
            </View>
          ) : item.rep_status === 'cancelled' ? (
            <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full">
              <XCircle size={12} color="#ef4444" />
              <Text className="text-red-600 text-sm font-medium ml-1">
                Cancelled
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-full">
              <Text className="text-primaryBlue text-sm font-medium">
                In progress
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Matter:</Text>
        <Text className="text-base">{item.rep_matter}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Violator:</Text>
        <Text className="text-base">{item.rep_violator}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Sitio:</Text>
        <Text className="text-base">{item.sitio_name}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Location:</Text>
        <Text className="text-base">{item.rep_location}</Text>
      </View>

      {item.rep_status === "cancelled" && (
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="text-gray-900 text-[13px]">
            Illegal Dumping Reports
          </Text>
        }
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load reports.
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-[#2a3a61] px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="text-gray-900 text-[13px]">
            Resident Illegal Dumping Reports
          </Text>
        }
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
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
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="font-semibold text-lg text-[#2a3a61]">
          Resident Illegal Dumping Reports
        </Text>
      }
      rightAction={
        <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }
    >
      <View className="flex-1 px-4">
        {/* Search and Filters */}
        <View className="mb-4">
          <View className="relative mb-3">
            <Search
              className="absolute left-3 top-3 text-gray-500"
              size={17}
            />
            <TextInput
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
            />
          </View>

          <SelectLayout
            placeholder="Select report matter"
            options={filterOptions.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            selectedValue={selectedFilterId}
            onSelect={(option) => setSelectedFilterId(option.value)}
            className="bg-white"
          />
        </View>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) =>
            setActiveTab(val as 'pending' | 'resolved' | 'cancelled')
          }
          className="flex-1"
        >
          <TabsList className="bg-blue-50 mb-5 mt-2 flex-row justify-between">
            <TabsTrigger
              value="pending"
              className={`flex-1 mx-1 ${
                activeTab === 'pending'
                  ? 'bg-white border-b-2 border-primaryBlue'
                  : ''
              }`}
            >
              <Text
                className={`${
                  activeTab === 'pending'
                    ? 'text-primaryBlue font-medium'
                    : 'text-gray-500'
                }`}
              >
                Reports
              </Text>
            </TabsTrigger>
            <TabsTrigger
              value="resolved"
              className={`flex-1 mx-1 ${
                activeTab === 'resolved'
                  ? 'bg-white border-b-2 border-primaryBlue'
                  : ''
              }`}
            >
              <Text
                className={`${
                  activeTab === 'resolved'
                    ? 'text-primaryBlue font-medium'
                    : 'text-gray-500'
                }`}
              >
                Resolved
              </Text>
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className={`flex-1 mx-1 ${
                activeTab === 'cancelled'
                  ? 'bg-white border-b-2 border-primaryBlue'
                  : ''
              }`}
            >
              <Text
                className={`${
                  activeTab === 'cancelled'
                    ? 'text-primaryBlue font-medium'
                    : 'text-gray-500'
                }`}
              >
                Cancelled
              </Text>
            </TabsTrigger>
          </TabsList>

          {/* Shared FlatList for all tabs */}
          <TabsContent value={activeTab} className="flex-1">
            <View className="mb-2">
              <Text className="text-sm text-gray-500">
                {filteredData.length} report
                {filteredData.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            <FlatList
              data={filteredData}
              renderItem={({ item }) => renderReportCard(item)}
              keyExtractor={(item) => item.rep_id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center">
                    No reports found
                  </Text>
                </View>
              }
            />
          </TabsContent>
        </Tabs>
      </View>
    </PageLayout>
  );
}
