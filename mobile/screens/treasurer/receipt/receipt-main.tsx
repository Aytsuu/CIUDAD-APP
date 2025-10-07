// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   ActivityIndicator,
// } from 'react-native';
// import { 
//   ArrowUpDown,
//   Search,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { Button } from '@/components/ui/button';
// import { SelectLayout } from '@/components/ui/select-layout';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { useInvoiceQuery, type Receipt } from './queries/receipt-getQueries';

// const ReceiptPage = () => {
//   const router = useRouter();
//   const { data: fetchedData = [], isLoading } = useInvoiceQuery();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pageSize, setPageSize] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//     const filterOptions = useMemo(() => {
//     // Get all unique nature of collection values
//         const uniqueNatures = Array.from(
//             new Set(fetchedData.map(item => item.inv_nat_of_collection))
//         ).filter(Boolean); // Filter out any undefined/null values

//         // Create options array with "All" first, using label/value format
//         const options = [
//             { label: "All", value: "all" },
//             ...uniqueNatures.map(nature => ({
//             label: nature,
//             value: nature
//             }))
//         ];

//         return options;
//     }, [fetchedData]);


//   const [selectedFilterId, setSelectedFilterId] = useState("all");

//   // Filter data based on selected filter and search query
//   const filteredData = fetchedData.filter(item => {
//     const matchesFilter = selectedFilterId === "all" || 
//       item.inv_nat_of_collection?.toLowerCase() === selectedFilterId.toLowerCase();
    
//     const matchesSearch = !searchQuery || 
//       Object.values(item).some(val => 
//         String(val).toLowerCase().includes(searchQuery.toLowerCase())
//       );
    
//     return matchesFilter && matchesSearch;
//   });

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredData.length / pageSize);
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const renderItem = ({ item }: { item: Receipt }) => (
//     <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Serial No.:</Text>
//         <Text className="font-medium">{item.inv_serial_num}</Text>
//       </View>
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Date Issued:</Text>
//         <Text>
//           {new Date(item.inv_date).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//           })} at {new Date(item.inv_date).toLocaleTimeString('en-US', {
//             hour: 'numeric',
//             minute: '2-digit',
//             hour12: true,
//           })}
//         </Text>
//       </View>
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Payor:</Text>
//         <Text>{item.inv_payor}</Text>
//       </View>
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Payment Method:</Text>
//         <Text>{item.inv_pay_method}</Text>
//       </View>
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Nature of Collection:</Text>
//         <Text>{item.inv_nat_of_collection}</Text>
//       </View>
//       <View className="flex-row justify-between">
//         <Text className="text-gray-600">Amount:</Text>
//         <Text className="font-semibold">
//           ₱{Number(item.inv_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
//         </Text>
//       </View>
//     </View>
//   );


//   return (
//     <_ScreenLayout
//       header={
//         <View>
//           <Text className="text-xl font-semibold text-darkBlue2">Receipts</Text>
//           <Text className="text-sm text-darkGray mt-1">
//             List of recorded receipt transactions and corresponding collection details.
//           </Text>
//         </View>
//       }
//       showBackButton={true}
//       showExitButton={false}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }
//       scrollable={true}
//       contentPadding="medium"
//       loading={isLoading}
//       loadingMessage="Loading record..."
//     >
//       {/* Search and Filter */}
//       <View className="flex-col md:flex-row mb-4 gap-3">
//         <View className="relative flex-1">
//           <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//           <TextInput
//             placeholder="Search..." 
//             className="pl-5 w-full h-12 bg-white text-base rounded-lg p-2 border border-gray-300"
//             value={searchQuery}
//             onChangeText={(text) => {
//               setSearchQuery(text);
//               setCurrentPage(1);
//             }}
//           />
//         </View>
//         <SelectLayout
//             className="w-full md:w-[200px] bg-white"
//             placeholder="Filter"
//             options={filterOptions}
//             selectedValue={selectedFilterId}
//             onSelect={(option) => {  // Now receives the full option object
//                 setSelectedFilterId(option.value);  // Extract the value from the option
//                 setCurrentPage(1);
//             }}
//         />
//       </View>

//       {/* Entries per page selector */}
//       <View className="flex-row items-center gap-2 mb-4">
//         <Text className="text-sm">Show</Text>
//         <TextInput
//           className="w-14 h-8 bg-white border border-gray-300 rounded text-center"
//           keyboardType="numeric"
//           value={pageSize.toString()}
//           onChangeText={(text) => {
//             const value = Math.max(1, Number(text) || 10);
//             setPageSize(value);
//             setCurrentPage(1);
//           }}
//         />
//         <Text className="text-sm">Entries</Text>
//       </View>

//       {/* Receipts List */}
//       <FlatList
//         data={paginatedData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.inv_num.toString()}
//         scrollEnabled={false}
//         ListEmptyComponent={
//           <Text className="text-center text-gray-500 py-4">
//             No receipts found
//           </Text>
//         }
//         contentContainerStyle={{ paddingBottom: 16 }}
//       />

//       {/* Pagination Footer */}
//       <View className="flex-col sm:flex-row justify-between items-center py-3 gap-3 sm:gap-0 border-t border-gray-200">
//         <Text className="text-sm text-darkGray">
//           Showing {(currentPage - 1) * pageSize + 1}-
//           {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//           {filteredData.length} rows
//         </Text>
        
//         {filteredData.length > 0 && (
//           <View className="flex-row items-center gap-2">
//             <TouchableOpacity 
//               className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-darkBlue2'}`}
//               onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft size={16} color={currentPage === 1 ? "#6b7280" : "white"} />
//             </TouchableOpacity>
            
//             <Text className="text-sm">
//               {currentPage} of {totalPages}
//             </Text>
            
//             <TouchableOpacity 
//               className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-darkBlue2'}`}
//               onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//               disabled={currentPage === totalPages}
//             >
//               <ChevronRight size={16} color={currentPage === totalPages ? "#6b7280" : "white"} />
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     </_ScreenLayout>
//   );
// };

// export default ReceiptPage;






//LATEST GYUD
// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
// } from 'react-native';
// import { 
//   ChevronLeft,
//   Search,
// } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { SelectLayout } from '@/components/ui/select-layout';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { useInvoiceQuery, type Receipt } from './queries/receipt-getQueries';

// const ReceiptPage = () => {
//   const router = useRouter();
//   const { data: fetchedData = [], isLoading } = useInvoiceQuery();

//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilterId, setSelectedFilterId] = useState('all');

//   const filterOptions = useMemo(() => {
//     const uniqueNatures = Array.from(
//       new Set(fetchedData.map(item => item.inv_nat_of_collection))
//     ).filter(Boolean);

//     return [
//       { label: 'All', value: 'all' },
//       ...uniqueNatures.map(nature => ({ label: nature, value: nature })),
//     ];
//   }, [fetchedData]);

//   const filteredData = fetchedData.filter(item => {
//     const matchesFilter =
//       selectedFilterId === 'all' ||
//       item.inv_nat_of_collection?.toLowerCase() === selectedFilterId.toLowerCase();

//     const matchesSearch =
//       !searchQuery.trim() ||
//       Object.values(item).some(val =>
//         String(val).toLowerCase().includes(searchQuery.toLowerCase())
//       );

//     return matchesFilter && matchesSearch;
//   });

//   const renderItem = ({ item }: { item: Receipt }) => (
//     <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Serial No:</Text>
//         <Text className="font-medium">{item.inv_serial_num}</Text>
//       </View>
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Date Issued:</Text>
//         <Text>
//           {new Date(item.inv_date).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//           })} at {new Date(item.inv_date).toLocaleTimeString('en-US', {
//             hour: 'numeric',
//             minute: '2-digit',
//             hour12: true,
//           })}
//         </Text>
//       </View>
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Payor:</Text>
//         <Text>{item.inv_payor}</Text>
//       </View>
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Payment Method:</Text>
//         <Text>{item.inv_pay_method}</Text>
//       </View>
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-600">Nature of Collection:</Text>
//         <Text>{item.inv_nat_of_collection}</Text>
//       </View>
//       <View className="flex-row justify-between">
//         <Text className="text-gray-600">Amount:</Text>
//         <Text className="font-semibold">
//           ₱{Number(item.inv_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <_ScreenLayout
//       header={
//         <View>
//           <Text className="text-xl font-semibold text-darkBlue2">Receipts</Text>
//           <Text className="text-sm text-darkGray mt-1">
//             List of recorded receipt transactions and corresponding collection details.
//           </Text>
//         </View>
//       }
//       showBackButton={true}
//       showExitButton={false}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }
//       scrollable={true}
//       contentPadding="medium"
//       loading={isLoading}
//       loadingMessage="Loading record..."
//     >
//       {/* Search and Filter */}
//       <View className="flex-col md:flex-row mb-4 gap-3">
//         <View className="relative flex-1">
//           <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//           <TextInput
//             placeholder="Search..."
//             className="pl-10 w-full h-12 bg-white text-base rounded-lg p-2 border border-gray-300"
//             value={searchQuery}
//             onChangeText={(text) => setSearchQuery(text)}
//           />
//         </View>
//         <SelectLayout
//           className="w-full md:w-[200px] bg-white"
//           placeholder="Filter"
//           options={filterOptions}
//           selectedValue={selectedFilterId}
//           onSelect={(option) => setSelectedFilterId(option.value)}
//         />
//       </View>

//       {/* Receipts List */}
//       <FlatList
//         data={filteredData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.inv_num.toString()}
//         scrollEnabled={false}
//         ListEmptyComponent={
//           <Text className="text-center text-gray-500 py-4">
//             No receipts found
//           </Text>
//         }
//         contentContainerStyle={{ paddingBottom: 16 }}
//       />
//     </_ScreenLayout>
//   );
// };

// export default ReceiptPage;












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
import { useDebounce } from '@/hooks/use-debounce'; // You'll need to create this hook

const ReceiptPage = () => {
  const router = useRouter();
  
  // State for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState('all');

  // Use debounce for search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch data with backend filtering
  const { data: fetchedData = [], isLoading, isError, refetch } = useInvoiceQuery(
    debouncedSearchQuery, 
    selectedFilterId
  );

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

  // No need for frontend filtering - backend handles it
  const filteredData = fetchedData;

  const handleRefresh = () => {
    refetch();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilterId(value);
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

      <View className="flex-1 px-4">
        {/* Search and Filter */}
        <View className="flex-col gap-3 pb-8">
          <View className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={17} />
            <TextInput
              placeholder="Search..."
              className="pl-5 w-full h-12 bg-white text-base rounded-lg p-2 border border-gray-300"
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
          </View>

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
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2a3a61" />
            <Text className="text-sm text-gray-500 mt-2">Loading receipts...</Text>
          </View>
        ) : (
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
        )}
      </View>
    </PageLayout>
  );
};

export default ReceiptPage;