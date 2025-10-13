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
import { SearchInput } from "@/components/ui/search-input";
import { SelectLayout } from '@/components/ui/select-layout';
import { useInvoiceQuery, type Receipt } from './queries/receipt-getQueries';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";



const ReceiptPage = () => {
  const router = useRouter();
  
  // State for search and filter
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState('all');

  // Use debounce for search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch data with backend filtering and pagination
  // Using large page size (1000) to get all data like in Resolution mobile
  const { data: receiptData = { results: [], count: 0 }, isLoading, isError, refetch } = useInvoiceQuery(
    1, // page
    1000, // pageSize - large number to get all data
    debouncedSearchQuery, 
    selectedFilterId
  );

  // Extract the actual data array from paginated response
  const fetchedData = receiptData.results || [];

  // Generate filter options from the fetched data
  const filterOptions = useMemo(() => {
    const uniqueNatures = Array.from(
      new Set(fetchedData.map(item => item.inv_nat_of_collection))
    ).filter(Boolean);

    return [
      { label: 'All', value: 'all' },
      ...uniqueNatures.map(nature => ({ label: nature, value: nature })),
    ];
  }, [fetchedData]);

  // Helper function to get color scheme for nature of collection
  const getColorScheme = (nature: string) => {
    const normalized = nature?.toLowerCase() || '';
    
    if (normalized.includes('business')) {
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
    } else if (normalized.includes('certificate') || normalized.includes('clearance')) {
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
    } else if (normalized.includes('resident')) {
      return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' };
    } else if (normalized.includes('service') || normalized.includes('charge')) {
      return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
    } else if (normalized.includes('permit')) {
      return { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' };
    } else if (normalized.includes('barangay')) {
      return { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' };
    } else {
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilterId(value);
  };


  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );  


  const renderItem = ({ item }: { item: Receipt }) => {
    const colorScheme = getColorScheme(item.inv_nat_of_collection);
    
    return (
      <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3 shadow-sm">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 ">Serial No:</Text>
          <Text className="font-medium bg-blue-500 px-2 py-0.5 rounded-md text-white">{item.inv_serial_num}</Text>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Date Issued:</Text>
          <Text className="text-sm">
            {new Date(item.inv_date).toLocaleString("en-US", {
                timeZone: "UTC",
                dateStyle: "medium",
                timeStyle: "short"
            })}
          </Text>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Payor:</Text>
          <Text className="font-medium flex-1 text-right" numberOfLines={2}>
            {item.inv_payor}
          </Text>
        </View>
        
        {/* Nature of Collection with colored badge */}
        <View className="flex-row justify-between mb-3 items-center">
          <Text className="text-gray-600">Nature of Collection:</Text>
          <View className={`${colorScheme.bg} ${colorScheme.border} border rounded-full px-3 py-1`}>
            <Text className={`${colorScheme.text} text-xs font-medium`}>
              {item.inv_nat_of_collection}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Discount Reason:</Text>
          <Text className="text-sm">{item.inv_discount_reason || "None"}</Text>
        </View>
        
        <View className="border-t border-gray-200 pt-2 mt-2">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 font-medium">Amount:</Text>
            <Text className="font-bold text-base text-green-700">
              ₱{Number(item.inv_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Change:</Text>
            <Text className="font-semibold text-sm">
              ₱{Number(item.inv_change).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false}
    >
      <View className="flex-1 px-6">
        {/* Search and Filter */}        
        <View className="flex-col gap-3 pb-8">
          {showSearch && (
            <View className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={17} />
              <TextInput
                placeholder="Search..."
                className="pl-5 w-full h-12 bg-gray-100 text-base rounded-xl p-2 border border-gray-300"
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
            </View>            
          )}

          <SelectLayout
            className="w-full bg-white"
            placeholder="Filter"
            options={filterOptions}
            selectedValue={selectedFilterId}
            onSelect={(option) => handleFilterChange(option.value)}
          />
        </View>

        {/* Receipts List */}
        {isLoading ? (
          // <View className="flex-1 justify-center items-center">
          //   <ActivityIndicator size="large" color="#2a3a61" />
          //   <Text className="text-sm text-gray-500 mt-2">Loading receipts...</Text>
          // </View>
          renderLoadingState()           
        ) : (
          <FlatList
            data={fetchedData}
            renderItem={renderItem}
            keyExtractor={(item) => item.inv_num.toString()}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 py-4">
                No receipts found
              </Text>
            }
          />
        )}
      </View>
    </PageLayout>
  );
};

export default ReceiptPage;