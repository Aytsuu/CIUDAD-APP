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
    const normalized = nature?.toLowerCase().trim() || '';
    
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      // Employment & Job Related - Blue variants
      'first time jobseeker': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
      'employment': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
      'identification': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
      
      // Financial & Loans - Purple variants
      'loan': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
      'sss': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
      'bir': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
      'bank requirement': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
      
      // Utilities & Services - Teal/Green variants
      'electrical connection': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
      'mcwd requirements': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
      
      // Education & Training - Indigo variants
      'scholarship': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
      'tesda': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
      'board examination': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
      
      // IDs & Certifications - Cyan variants
      'postal id': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
      'nbi': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
      'pwd identification': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
      'señior citizen identification': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
      'police clearance': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
      
      // Financial Assistance - Green variants
      'pwd financial assistance': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
      'señior citizen financial assistance': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
      'fire victim': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
      
      // Legal & Government - Orange/Amber variants
      'bail bond': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
      'probation': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
      'file action': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
      'proof of custody': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
      'summon': { bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-400' },
      
      // Permits & Clearances - Red variants
      'building permit': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
      'barangay clearance': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
      'business clearance': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
      'barangay sinulog permit': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
      'barangay fiesta permit': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
      'dwup': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
      
      // Personal & Miscellaneous - Pink/Rose variants
      'cohabitation': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
      'marriage certification': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
      'good moral': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
      'indigency': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
      'indigency (for minors)': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
    };
    
    // Exact match first
    if (colorMap[normalized]) {
      return colorMap[normalized];
    }
    
    // Default for any unknown values
    return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
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

      {showSearch && (
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={() => {}} // Can leave empty since you're using debounce
        />
      )}

      <View className="flex-1 px-6">
        {/* Search and Filter */}        
        <View className="flex-col pb-8">
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