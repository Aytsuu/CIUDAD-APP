import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { 
  ChevronLeft,
  Search,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SelectLayout } from '@/components/ui/select-layout';
import { useInvoiceQuery, type Receipt } from './queries/receipt-getQueries';
import PageLayout from '@/screens/_PageLayout';

const ReceiptPage = () => {
  const router = useRouter();
  const { data: fetchedData = [], isLoading, isError, refetch } = useInvoiceQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState('all');

  const filterOptions = useMemo(() => {
    const uniqueNatures = Array.from(
      new Set(fetchedData.map(item => item.inv_nat_of_collection))
    ).filter(Boolean);

    return [
      { label: 'All', value: 'all' },
      ...uniqueNatures.map(nature => ({ label: nature, value: nature })),
    ];
  }, [fetchedData]);

  const filteredData = fetchedData.filter(item => {
    const matchesFilter =
      selectedFilterId === 'all' ||
      item.inv_nat_of_collection?.toLowerCase() === selectedFilterId.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  const handleRefresh = () => {
    refetch();
  };

  const renderItem = ({ item }: { item: Receipt }) => (
    <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Serial No:</Text>
        <Text className="font-medium">{item.inv_serial_num}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Date Issued:</Text>
        <Text>
          {new Date(item.inv_date).toLocaleString("en-US", {
              timeZone: "UTC",
              dateStyle: "medium",
              timeStyle: "short"
          })}
        </Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Payor:</Text>
        <Text>{item.inv_payor}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Nature of Collection:</Text>
        <Text>{item.inv_nat_of_collection}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Discount Reason:</Text>
        <Text>{item.inv_discount_reason || "None"}</Text>
      </View>      
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Amount:</Text>
        <Text className="font-semibold">
          ₱{Number(item.inv_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-600">Change:</Text>
        <Text className="font-semibold">
          ₱{Number(item.inv_change).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      </View>      
    </View>
  );

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Receipts</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load receipts.
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

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Receipts</Text>}
      rightAction={
        <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }
    >
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
          <Text className="text-sm text-gray-500 mt-2">Loading receipts...</Text>
        </View>
      ) : (
        <View className="flex-1 px-4">
          {/* Search and Filter */}
          <View className="flex-col gap-3 pb-8">
            <View className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={17} />
              <TextInput
                placeholder="Search..."
                className="pl-3 w-full h-12 bg-white text-base rounded-lg p-2 border border-gray-300"
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
            </View>

            <SelectLayout
              className="w-full bg-white"
              placeholder="Filter"
              options={filterOptions}
              selectedValue={selectedFilterId}
              onSelect={(option) => setSelectedFilterId(option.value)}
            />
          </View>

          {/* Receipts List */}
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item.inv_num.toString()}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 py-4">
                No receipts found
              </Text>
            }
          />
        </View>
      )}
    </PageLayout>
  );
};

export default ReceiptPage;