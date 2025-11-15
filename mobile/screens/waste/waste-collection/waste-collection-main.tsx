// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   SectionList,
//   TextInput,
// } from 'react-native';
// import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from './queries/waste-col-fetch-queries';
// import { useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from './queries/waste-col-delete-queries';
// import { Plus, Trash, Archive, ArchiveRestore, Edit3, Search, ChevronLeft } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { formatTime } from '@/helpers/timeFormatter';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { sortWasteCollectionData } from '@/helpers/wasteCollectionHelper';
// import PageLayout from '@/screens/_PageLayout';
// import { useCreateCollectionReminders } from './queries/waste-col-add-queries';
// import { useDebounce } from '@/hooks/use-debounce';

// // Day options for filtering
// const dayOptions = [
//   { label: "All Days", value: "0" },
//   { label: "Monday", value: "Monday" },
//   { label: "Tuesday", value: "Tuesday" },
//   { label: "Wednesday", value: "Wednesday" },
//   { label: "Thursday", value: "Thursday" },
//   { label: "Friday", value: "Friday" },
//   { label: "Saturday", value: "Saturday" },
//   { label: "Sunday", value: "Sunday" }
// ];

// const WasteCollectionMain = () => {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState<string>('active');
//   const [selectedDay, setSelectedDay] = useState('0');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // Add debouncing for search
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);

//   // Fetch data with search and filter parameters
//   const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull(
//     debouncedSearchQuery,
//     selectedDay
//   );

//   //POST MUTATIONs (announcement)
//   const { mutate: createReminders } = useCreateCollectionReminders(); 

  
//   useEffect(() => {
//       if (isLoading || wasteCollectionData.length === 0) return;

//       const today = new Date();
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       const tomorrowDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

//       // Check if any schedule is for tomorrow
//       const hasTomorrowCollection = wasteCollectionData.some(
//           schedule => schedule.wc_day?.toLowerCase() === tomorrowDayName.toLowerCase() && !schedule.wc_is_archive
//       );

//       if (hasTomorrowCollection) {
//           createReminders();
//       }
//   }, [wasteCollectionData, isLoading, createReminders]);  


//   // Mutation hooks
//   const { mutate: archiveWasteSchedCol, isPending: isArchiving } = useArchiveWasteCol();
//   const { mutate: deleteWasteSchedCol, isPending: isDeleting } = useDeleteWasteCol();
//   const { mutate: restoreWasteSchedCol, isPending: isRestoring } = useRestoreWasteCol();

//   // Sort data by day and time
//   const sortedData = useMemo(() =>
//     sortWasteCollectionData(wasteCollectionData),
//     [wasteCollectionData]
//   );

//   // Handle search input change
//   const handleSearchChange = (text: string) => {
//     setSearchQuery(text);
//   };

//   // Handle day change
//   const handleDayChange = (option: { label: string; value: string }) => {
//     setSelectedDay(option.value);
//   };

//   // Filter Active - now only filtering by archive status (search and day filtering done in backend)
//   const activeFilteredData = useMemo(() => {
//     return sortedData.filter(item => item.wc_is_archive === false);
//   }, [sortedData]);

//   // Filter Archived - now only filtering by archive status (search and day filtering done in backend)
//   const archivedFilteredData = useMemo(() => {
//     return sortedData.filter(item => item.wc_is_archive === true);
//   }, [sortedData]);

//   // Grouping function
//   const groupByDay = (data: WasteCollectionSchedFull[]) => {
//     const groups: { [key: string]: WasteCollectionSchedFull[] } = {};
//     data.forEach(item => {
//       if (!groups[item.wc_day]) {
//         groups[item.wc_day] = [];
//       }
//       groups[item.wc_day].push(item);
//     });
//     const result = Object.keys(groups).map(day => ({
//       title: day,
//       data: groups[day],
//     }));
//     return result;
//   };

//   const activeGroupedData = useMemo(() => groupByDay(activeFilteredData), [activeFilteredData]);
//   const archivedGroupedData = useMemo(() => groupByDay(archivedFilteredData), [archivedFilteredData]);

//   const handleEdit = (item: any) => {
//     router.push({
//       pathname: '/(waste)/waste-collection/waste-col-edit',
//       params: {
//         wc_num: item.wc_num.toString(),
//         day: item.wc_day,
//         time: item.wc_time,
//         info: item.wc_add_info,
//         sitio: item.sitio,
//         truck: item.truck,
//         driver: item.wstp,
//         collectors_id: JSON.stringify(item.collectors_wstp_ids)
//       }
//     });
//   };

//   const handleDelete = (wc_num: number) => {
//     deleteWasteSchedCol(wc_num);
//   };

//   const handleArchive = (wc_num: number) => {
//     archiveWasteSchedCol(wc_num);
//   };

//   const handleRestore = (wc_num: number) => {
//     restoreWasteSchedCol(wc_num);
//   };

//   const renderItem = ({ item }: { item: WasteCollectionSchedFull }) => (
//     <View className="bg-white shadow-sm rounded-lg p-4 mb-3 mx-2 border border-gray-200">
//       {/* First row with sitio name and action icons */}
//       <View className="flex-row justify-between items-center mb-1">
//         <Text className="text-gray-800 font-semibold text-base">{item.sitio_name}</Text>
//         <View className="flex-row gap-1">
//           {activeTab === 'active' ? (
//             <>
//               <TouchableOpacity
//                 className="bg-blue-50 rounded py-1 px-1"
//                 onPress={() => handleEdit(item)}
//               >
//                 <Edit3 size={16} color="#00A8F0" />
//               </TouchableOpacity>

//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                     <Archive size={16} color="#dc2626" />
//                   </TouchableOpacity>
//                 }
//                 title="Archive Schedule"
//                 description="This schedule will be archived. Are you sure?"
//                 actionLabel="Archive"
//                 onPress={() => handleArchive(item.wc_num)}
//               />
//             </>
//           ) : (
//             <>
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
//                     <ArchiveRestore size={16} color="#15803d" />
//                   </TouchableOpacity>
//                 }
//                 title="Restore Schedule"
//                 description="This schedule will be restored. Are you sure?"
//                 actionLabel="Restore"
//                 onPress={() => handleRestore(item.wc_num)}
//               />

//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                     <Trash size={16} color="#dc2626" />
//                   </TouchableOpacity>
//                 }
//                 title="Delete Schedule"
//                 description="This schedule will be permanently deleted. Are you sure?"
//                 actionLabel="Delete"
//                 onPress={() => handleDelete(item.wc_num)}
//               />
//             </>
//           )}
//         </View>
//       </View>

//       {/* Time row */}
//       <View className="mb-1">
//         <Text className="text-gray-500">{formatTime(item.wc_time)}</Text>
//       </View>

//       {/* Additional info if exists */}
//       {item.wc_add_info && item.wc_add_info !== "None" && (
//         <View className="mt-1">
//           <Text className="text-gray-600">{item.wc_add_info}</Text>
//         </View>
//       )}
//     </View>
//   );

//   const renderSectionHeader = ({ section }: { section: { title: string } }) => (
//     <View className="bg-blue-50 py-3 px-4 rounded-md mb-3 mt-3">
//       <Text className="text-lg font-bold text-primaryBlue">{section.title}</Text>
//     </View>
//   );


//   return (
//     <PageLayout
//       leftAction={
//         <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//           <ChevronLeft size={24} className="text-gray-700" />
//         </TouchableOpacity>
//       }
//       headerTitle={
//         <Text className="text-md">
//           Waste Collection Schedule
//         </Text>
//       }
//       rightAction={
//         <View className="w-10 h-10 rounded-full items-center justify-center"></View>
//       }
//       wrapScroll={false}      
//     >

//       {/* Search and Filter */}
//       <View className="px-6 pb-4 pt-4">
//         <View className="flex-row items-center gap-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               className="pl-5 w-full h-[45px] bg-white text-base rounded-xl p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={handleSearchChange}
//             />
//           </View>

//           <View className="w-[120px] pb-5">
//             <SelectLayout
//               options={dayOptions}
//               className="h-8"
//               selectedValue={selectedDay}
//               onSelect={handleDayChange}
//               placeholder="Day"
//               isInModal={false}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Create Button */}
//       <View className="pb-4 px-6">
//         <TouchableOpacity
//           className="bg-primaryBlue flex-row items-center justify-center w-full px-4 py-4 rounded-lg mb-3"
//           onPress={() => router.push('/(waste)/waste-collection/waste-col-create')}
//         >
//           <Plus size={16} className="text-white mr-2" />
//           <Text className="text-white text-lg font-medium">Create</Text>
//         </TouchableOpacity>
//       </View>      

//       {/* View Mode Toggle - Simplified version */}
//       <View className="flex-row justify-center px-6 mb-3">
//         <View className="flex-row bg-blue-50 mb-3 w-full p-2 rounded-md items-center">
//           <TouchableOpacity
//             className={`flex-1 mx-1 h-8 items-center justify-center ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//             onPress={() => setActiveTab('active')}
//           >
//             <Text className={`text-sm ${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//               Active
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className={`flex-1 mx-1 h-8 items-center justify-center ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//             onPress={() => setActiveTab('archive')}
//           >
//             <View className="flex-row items-center justify-center">
//               <Archive 
//                 size={14} 
//                 className="mr-1" 
//                 color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//               />
//               <Text className={`text-sm ${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                 Archive
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Conditional rendering based on active tab */}
//       {activeTab === 'active' ? (
//         <View className="flex-1 px-6">
//           {isLoading || isRestoring || isArchiving || isDeleting ? (
//             <View className="flex-1 justify-center items-center">
//               <ActivityIndicator size="large" color="#2a3a61" />
//               <Text className="text-sm text-gray-500 mt-2 text-center">
//                 {
//                   isArchiving ? "Archiving Schedule..." : 
//                   isRestoring ? "Restoring Schedule..." : 
//                   isDeleting ? "Deleting Schedule..." :
//                   "Loading..."
//                 }
//               </Text>
//             </View>
//           ) : activeGroupedData.length > 0 ? (
//             <SectionList
//               sections={activeGroupedData}
//               keyExtractor={item => item.wc_num.toString()}
//               renderItem={renderItem}
//               renderSectionHeader={renderSectionHeader}
//               contentContainerStyle={{ paddingBottom: 20 }}
//               showsVerticalScrollIndicator={false}
//               stickySectionHeadersEnabled={true}
//             />
//           ) : (
//             <View className="flex-1 justify-center items-center py-10">
//               <Text className="text-gray-400 text-lg">
//                 No active schedules found
//               </Text>
//             </View>
//           )}
//         </View>
//       ) : (
//         <View className="flex-1 px-6">
//           {isLoading || isRestoring || isArchiving || isDeleting ? (
//             <View className="flex-1 justify-center items-center">
//               <ActivityIndicator size="large" color="#2a3a61" />
//               <Text className="text-sm text-gray-500 mt-2 text-center">
//                 {
//                   isArchiving ? "Archiving Schedule..." : 
//                   isRestoring ? "Restoring Schedule..." : 
//                   isDeleting ? "Deleting Schedule..." :
//                   "Loading..."
//                 }
//               </Text>
//             </View>
//           ) : archivedGroupedData.length > 0 ? (
//             <SectionList
//               sections={archivedGroupedData}
//               keyExtractor={item => item.wc_num.toString()}
//               renderItem={renderItem}
//               renderSectionHeader={renderSectionHeader}
//               contentContainerStyle={{ paddingBottom: 20 }}
//               showsVerticalScrollIndicator={false}
//               stickySectionHeadersEnabled={true}
//             />
//           ) : (
//             <View className="flex-1 justify-center items-center py-10">
//               <Text className="text-gray-400 text-lg">
//                 No archived schedules found
//               </Text>
//             </View>
//           )}
//         </View>
//       )}
//     </PageLayout>
//   );
// };

// export default WasteCollectionMain;






import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  TextInput,
} from 'react-native';
import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from './queries/waste-col-fetch-queries';
import { useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from './queries/waste-col-delete-queries';
import { Plus, Trash, Archive, ArchiveRestore, Edit3, Search, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatTime } from '@/helpers/timeFormatter';
import { SelectLayout } from '@/components/ui/select-layout';
import { SearchInput } from '@/components/ui/search-input';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import PageLayout from '@/screens/_PageLayout';
import { useCreateCollectionReminders } from './queries/waste-col-add-queries';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";


// Day options for filtering
const dayOptions = [
  { label: "All Days", value: "0" },
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" }
];

const WasteCollectionMain = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('active');
  const [selectedDay, setSelectedDay] = useState('0');
  const [showSearch, setShowSearch] = useState<boolean>(false);  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add debouncing for search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch data with search, filter, and archive parameters
  // Using large page size (1000) to get all data like in Resolution mobile
  const { data: wasteCollectionData = { results: [], count: 0 }, isLoading } = useGetWasteCollectionSchedFull(
    1, // page
    1000, // pageSize - large number to get all data
    debouncedSearchQuery,
    selectedDay,
    activeTab === 'archive' // Send archive status to backend based on activeTab
  );

  // Extract the actual data array from paginated response
  const fetchedData = wasteCollectionData.results || [];

  //POST MUTATIONs (announcement)
  const { mutate: createReminders } = useCreateCollectionReminders(); 

  useEffect(() => {
    if (isLoading || fetchedData.length === 0) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if any schedule is for tomorrow (only check non-archived)
    const hasTomorrowCollection = fetchedData.some(
      schedule => schedule.wc_day?.toLowerCase() === tomorrowDayName.toLowerCase() && !schedule.wc_is_archive
    );

    if (hasTomorrowCollection) {
      createReminders();
    }
  }, [fetchedData, isLoading, createReminders]);  

  // Mutation hooks
  const { mutate: archiveWasteSchedCol, isPending: isArchiving } = useArchiveWasteCol();
  const { mutate: deleteWasteSchedCol, isPending: isDeleting } = useDeleteWasteCol();
  const { mutate: restoreWasteSchedCol, isPending: isRestoring } = useRestoreWasteCol();

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle day change
  const handleDayChange = (option: { label: string; value: string }) => {
    setSelectedDay(option.value);
  };

  // Grouping function - data is already sorted and filtered by backend
  const groupByDay = (data: WasteCollectionSchedFull[]) => {
    const groups: { [key: string]: WasteCollectionSchedFull[] } = {};
    data.forEach(item => {
      if (!groups[item.wc_day]) {
        groups[item.wc_day] = [];
      }
      groups[item.wc_day].push(item);
    });
    const result = Object.keys(groups).map(day => ({
      title: day,
      data: groups[day],
    }));
    return result;
  };

  // Group the data that's already filtered by backend
  const groupedData = useMemo(() => groupByDay(fetchedData), [fetchedData]);

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/(waste)/waste-collection/waste-col-edit',
      params: {
        wc_num: item.wc_num.toString(),
        day: item.wc_day,
        time: item.wc_time,
        info: item.wc_add_info,
        sitio: item.sitio,
        truck: item.truck,
        driver: item.wstp,
        collectors_id: JSON.stringify(item.collectors_wstp_ids)
      }
    });
  };

  const handleDelete = (wc_num: number) => {
    deleteWasteSchedCol(wc_num);
  };

  const handleArchive = (wc_num: number) => {
    archiveWasteSchedCol(wc_num);
  };

  const handleRestore = (wc_num: number) => {
    restoreWasteSchedCol(wc_num);
  };


  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );  


  const renderItem = ({ item }: { item: WasteCollectionSchedFull }) => (
    <View className="bg-white shadow-sm rounded-lg p-4 mb-3 mx-2 border border-gray-200">
      {/* First row with sitio name and action icons */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-gray-800 font-semibold text-base">{item.sitio_name}</Text>
        <View className="flex-row gap-1">
          {activeTab === 'active' ? (
            <>
              <TouchableOpacity
                className="bg-blue-50 rounded py-1 px-1"
                onPress={() => handleEdit(item)}
              >
                <Edit3 size={16} color="#00A8F0" />
              </TouchableOpacity>

              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Archive size={16} color="#dc2626" />
                  </TouchableOpacity>
                }
                title="Archive Schedule"
                description="This schedule will be archived. Are you sure?"
                actionLabel="Archive"
                onPress={() => handleArchive(item.wc_num)}
              />
            </>
          ) : (
            <>
              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
                    <ArchiveRestore size={16} color="#15803d" />
                  </TouchableOpacity>
                }
                title="Restore Schedule"
                description="This schedule will be restored. Are you sure?"
                actionLabel="Restore"
                onPress={() => handleRestore(item.wc_num)}
              />

              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Trash size={16} color="#dc2626" />
                  </TouchableOpacity>
                }
                title="Delete Schedule"
                description="This schedule will be permanently deleted. Are you sure?"
                actionLabel="Delete"
                onPress={() => handleDelete(item.wc_num)}
              />
            </>
          )}
        </View>
      </View>

      {/* Time row */}
      <View className="mb-1">
        <Text className="text-gray-500">{formatTime(item.wc_time)}</Text>
      </View>

      {/* Additional info if exists */}
      {item.wc_add_info && item.wc_add_info !== "None" && (
        <View className="mt-1">
          <Text className="text-gray-600">{item.wc_add_info}</Text>
        </View>
      )}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View className="bg-blue-50 py-3 px-4 rounded-md mb-3 mt-3">
      <Text className="text-lg font-bold text-primaryBlue">{section.title}</Text>
    </View>
  );

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-md">
          Waste Collection Schedule
        </Text>
      }
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
          onSubmit={() => {}} 
        />
      )}   

      {/*Filter */}
      <View className="px-6 pb-8">
        <View className="w-full">
          <SelectLayout
            options={dayOptions}
            className="h-8 w-full"
            selectedValue={selectedDay}
            onSelect={handleDayChange}
            placeholder="Day"
            isInModal={false}
          />
        </View>
      </View>

      {/* Create Button */}
      <View className="pb-4 px-6">
        <TouchableOpacity
          className="bg-primaryBlue flex-row items-center justify-center w-full px-4 py-4 rounded-xl mb-3"
          onPress={() => router.push('/(waste)/waste-collection/waste-col-create')}
        >
          <Plus size={16} className="text-white mr-2" />
          <Text className="text-white text-lg font-medium">Create</Text>
        </TouchableOpacity>
      </View>      

      {/* View Mode Toggle */}
      <View className="flex-row justify-center px-6 mb-3">
        <View className="flex-row bg-blue-50 mb-3 w-full p-2 rounded-md items-center">
          <TouchableOpacity
            className={`flex-1 mx-1 h-8 items-center justify-center ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
            onPress={() => setActiveTab('active')}
          >
            <Text className={`text-sm ${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 mx-1 h-8 items-center justify-center ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
            onPress={() => setActiveTab('archive')}
          >
            <View className="flex-row items-center justify-center">
              <Archive 
                size={14} 
                className="mr-1" 
                color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
              />
              <Text className={`text-sm ${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                Archive
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content - simplified since backend handles filtering */}
      <View className="flex-1 px-6">
        {isLoading || isRestoring || isArchiving || isDeleting ? (
          // <View className="flex-1 justify-center items-center">
          //   <ActivityIndicator size="large" color="#2a3a61" />
          //   <Text className="text-sm text-gray-500 mt-2 text-center">
          //     {
          //       isArchiving ? "Archiving Schedule..." : 
          //       isRestoring ? "Restoring Schedule..." : 
          //       isDeleting ? "Deleting Schedule..." :
          //       "Loading..."
          //     }
          //   </Text>
          // </View>
          renderLoadingState()           
        ) : groupedData.length > 0 ? (
          <SectionList
            sections={groupedData}
            keyExtractor={item => item.wc_num.toString()}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
          />
        ) : (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-400 text-lg">
              {activeTab === 'active' 
                ? 'No active schedules found' 
                : 'No archived schedules found'}
            </Text>
          </View>
        )}
      </View>
    </PageLayout>
  );
};

export default WasteCollectionMain;