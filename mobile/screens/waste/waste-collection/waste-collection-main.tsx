// import React, { useState, useEffect  } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';
// import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from './queries/waste-col-fetch-queries';
// import { useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from './queries/waste-col-delete-queries';
// import { Plus, Trash, Archive, ArchiveRestore, Eye, Edit3 } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { useQueryClient } from '@tanstack/react-query';
// import { format, parseISO, isSameMonth, isSameDay, addMonths } from 'date-fns';
// import { formatTime } from '@/helpers/timeFormatter';
// import ScreenLayout from '@/screens/_ScreenLayout';
// import { Input } from '@/components/ui/input';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { MaterialIcons } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');
// const DAY_SIZE = width / 7 - 10;

// const WasteCollectionMain = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
//   const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');
//   const [selectedSitio, setSelectedSitio] = useState('0');
//   const [searchQuery, setSearchQuery] = useState('');

//   // Fetch data based on view mode
//   const isArchived = viewMode === 'archive';
//   const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();

//   // Mutation hooks
//   const { mutate: archiveWasteSchedCol, isPending: isArchiving } = useArchiveWasteCol();
//   const { mutate: deleteWasteSchedCol, isPending: isDeleting } = useDeleteWasteCol();
//   const { mutate: restoreWasteSchedCol, isPending: isRestoring } = useRestoreWasteCol();


//   //Sets the data to archive if the date is lesser than the current date
//   useEffect(() => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Remove time

//     wasteCollectionData.forEach(item => {
//       const itemDate = new Date(item.wc_date);
//       itemDate.setHours(0, 0, 0, 0); // Remove time

//       if (itemDate < today && !item.wc_is_archive) {
//         archiveWasteSchedCol(item.wc_num);
//       }
//     });
//   }, [wasteCollectionData]);


//   // Format and filter events for the calendar
//   const formattedSchedules = wasteCollectionData
//     .filter(item => item.wc_is_archive === isArchived)
//     .map(item => ({
//       ...item,
//       rawDate: parseISO(item.wc_date),
//       formattedDate: format(parseISO(item.wc_date), 'MM-dd'),
//       day: format(parseISO(item.wc_date), 'EEEE'),
//     }));

//   // Filter schedules for current month
//   const currentMonthSchedules = formattedSchedules.filter(item => 
//     isSameMonth(item.rawDate, currentMonth)
//   );

//   // Generate days for the current month
//   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//   const year = currentMonth.getFullYear();
//   const month = currentMonth.getMonth();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstDayOfMonth = new Date(year, month, 1).getDay();
  
//   const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//   const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);

//   const handleMonthChange = (increment: number) => {
//     setCurrentMonth(addMonths(currentMonth, increment));
//     setSelectedDate(addMonths(selectedDate, increment));
//   };

//   const handleDateSelect = (date: number) => {
//     setSelectedDate(new Date(year, month, date));
//   };

//   const renderDayHeader = (day: string) => (
//     <View key={day} className="items-center py-2">
//       <Text className="text-gray-500 text-sm font-medium">{day}</Text>
//     </View>
//   );

//   const renderDateCell = (date: number | null, index: number) => {
//     if (date === null) {
//       return <View key={`blank-${index}`} style={{ width: DAY_SIZE, height: DAY_SIZE }} />;
//     }
    
//     const dateObj = new Date(year, month, date);
//     const hasSchedule = currentMonthSchedules.some(schedule => 
//       isSameDay(schedule.rawDate, dateObj)
//     );
//     const isSelected = isSameDay(selectedDate, dateObj);
//     const isToday = isSameDay(dateObj, new Date());
    
//     return (
//       <TouchableOpacity
//         key={date}
//         className={`items-center justify-center rounded-full m-1 ${
//           isSelected 
//             ? 'bg-blue-600' 
//             : hasSchedule 
//               ? 'bg-blue-100' 
//               : isToday
//                 ? 'bg-gray-200'
//                 : 'bg-white'
//         }`}
//         style={{ width: DAY_SIZE, height: DAY_SIZE }}
//         onPress={() => handleDateSelect(date)}
//       >
//         <Text className={`text-lg ${
//           isSelected 
//             ? 'text-white font-bold' 
//             : isToday
//               ? 'text-blue-600 font-bold'
//               : 'text-gray-800'
//         }`}>
//           {date}
//         </Text>
//         {hasSchedule && !isSelected && (
//           <View className="w-1 h-1 rounded-full bg-blue-500 mt-1" />
//         )}
//       </TouchableOpacity>
//     );
//   };

//   // Filter data based on selected date, sitio, and search query
//   const filteredData = formattedSchedules
//     .filter(item => {
//       const matchesDate = isSameDay(item.rawDate, selectedDate);
//       const matchesSitio = selectedSitio === '0' || item.sitio_name === selectedSitio;
//       const matchesSearch = item.wc_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                             item.sitio_name?.toLowerCase().includes(searchQuery.toLowerCase());
//       return matchesDate && matchesSitio && matchesSearch;
//     })
//     .sort((a, b) => a.wc_time.localeCompare(b.wc_time));


//   const handleEdit = (item: any) => {
//     router.push({
//       pathname: '/(waste)/waste-collection/waste-col-edit',
//       params: { 
//         wc_num: item.wc_num.toString(),
//         date: item.wc_date,
//         time: item.wc_time,
//         info: item.wc_add_info,
//         sitio: item.sitio,
//         truck: item.truck,
//         driver: item.wstp,
//         collectors_id: JSON.stringify(item.collectors_wstp_ids)
//       }
//     })
//   }

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
//     <View className="bg-white shadow-sm rounded-lg p-4 mb-3 mx-2  border border-gray-200">
//       {/* First row with sitio name and action icons */}
//       <View className="flex-row justify-between items-center mb-1">
//         <Text className="text-gray-800 font-semibold text-base">{item.sitio_name}</Text>
//         <View className="flex-row gap-1">
//           {viewMode === 'active' ? (
//             <>
//               <TouchableOpacity 
//                 className="bg-blue-50 rounded py-1 px-1"
//                 onPress={() => handleEdit(item)}
//               >
//                 <Edit3 size={16} color="#00A8F0"/>
//               </TouchableOpacity>
              
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                       <Trash size={16} color="#dc2626" />
//                   </TouchableOpacity>
//                 }
//                 title="Delete Schedule"
//                 description="This schedule will be permanently deleted. Are you sure?"
//                 actionLabel="Delete"
//                 onPress={() => handleDelete(item.wc_num)}
//               />
//             </>
//           ) : (
//             <>              
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                       <Trash size={16} color="#dc2626" />
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

//       {/* Date row */}
//       <View className="mb-1">
//         <Text className="text-gray-500">{item.wc_date}</Text>
//       </View>

//       {/* Time row */}
//       <View className="mb-1">
//         <Text className="text-gray-500">{formatTime(item.wc_time)}</Text>
//       </View>

//       {/* Additional info if exists */}
//       {item.wc_add_info && (
//         <View className="mt-1">
//           <Text className="text-gray-600">{item.wc_add_info}</Text>
//         </View>
//       )}
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <ScreenLayout
//         header="Waste Collection Schedules"
//         description="Manage waste collection schedules"
//         showBackButton={false}
//         showExitButton={false}
//       >
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" className="text-blue-500" />
//         </View>
//       </ScreenLayout>
//     );
//   }

//   return (
//     <ScreenLayout
//       header="Waste Collection Schedules"
//       description="Manage waste collection schedules"
//       showBackButton={false}
//       showExitButton={false}
//       scrollable={false}
//       loading={isLoading || isArchiving || isRestoring || isDeleting}
//       loadingMessage={
//         // isArchiving ? "Archiving schedule..." : 
//         isRestoring ? "Restoring schedule..." : 
//         isDeleting ? "Deleting schedule..." :
//         "Loading..."
//       }
//       footer={false}
//     >
//       {/* View Mode Toggle */}
//       <View className="flex-row justify-center my-3" >
//         <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
//           <TouchableOpacity
//             className={`px-4 py-2 ${viewMode === 'active' ? 'bg-white' : ''}`}
//             onPress={() => {
//               setViewMode('active');
//               queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
//             }}
//           >
//             <Text className={`text-sm font-medium ${viewMode === 'active' ? 'text-blue-500' : 'text-gray-500'}`}>
//               Active
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className={`px-4 py-2 ${viewMode === 'archive' ? 'bg-white' : ''}`}
//             onPress={() => {
//               setViewMode('archive');
//               queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
//             }}
//           >
//             <Text className={`text-sm font-medium ${viewMode === 'archive' ? 'text-blue-500' : 'text-gray-500'}`}>
//               History
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Calendar Header */}
//       <View className="bg-white shadow-sm py-4 px-2">
//         <View className="flex-row justify-between items-center mb-4 px-2">
//           <TouchableOpacity 
//             onPress={() => handleMonthChange(-1)}
//             className="p-2"
//           >
//             <MaterialIcons name="chevron-left" size={24} color="#3B82F6" />
//           </TouchableOpacity>
          
//           <Text className="text-xl font-bold text-gray-800">
//             {format(currentMonth, 'MMMM yyyy')}
//           </Text>
          
//           <TouchableOpacity 
//             onPress={() => handleMonthChange(1)}
//             className="p-2"
//           >
//             <MaterialIcons name="chevron-right" size={24} color="#3B82F6" />
//           </TouchableOpacity>
//         </View>
        
//         <View className="flex-row justify-around mb-2">
//           {days.map(renderDayHeader)}
//         </View>
        
//         <View className="flex-row flex-wrap justify-around">
//           {blankDays.map((date, index) => renderDateCell(date, index))}
//           {dates.map(renderDateCell)}
//         </View>
//       </View>

//       {/* Create Button */}
//       <View className="flex-row justify-end pb-4 pt-4 px-4">
//         <TouchableOpacity
//           className="bg-blue-500 flex-row items-center px-3 py-3 rounded-full"
//           onPress={() => router.push('/(waste)/waste-collection/waste-col-create')}
//         >
//           <Plus size={20} className="text-white" />
//         </TouchableOpacity>
//       </View>



//       {/* Schedule List */}
//       <View className="flex-1 px-2">
//         <View className="flex-row justify-between items-center mb-4 px-2">
//           <Text className="text-lg font-bold text-gray-800">
//             {format(selectedDate, 'EEEE, MMMM d')}
//           </Text>
//           <Text className="text-blue-600">
//             {filteredData.length} {filteredData.length === 1 ? 'Schedule' : 'Schedules'}
//           </Text>
//         </View>
        
//         {filteredData.length > 0 ? (
//           <FlatList
//             data={filteredData}
//             renderItem={renderItem}
//             keyExtractor={item => item.wc_num.toString()}
//             contentContainerStyle={{ paddingBottom: 20 }}
//             showsVerticalScrollIndicator={false}
//           />
//         ) : (
//           <View className="flex-1 justify-center items-center">
//             <Text className="text-gray-400 text-lg">
//               No {viewMode === 'active' ? 'active' : 'archived'} schedules found for this date
//             </Text>
//           </View>
//         )}
//       </View>
//     </ScreenLayout>
//   );
// };

// export default WasteCollectionMain;












// import React, { useState, useMemo } from 'react';
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
// import { useQueryClient } from '@tanstack/react-query';
// import { formatTime } from '@/helpers/timeFormatter';
// import ScreenLayout from '@/screens/_ScreenLayout';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { sortWasteCollectionData } from '@/helpers/wasteCollectionHelper';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState('active');
//   const [selectedDay, setSelectedDay] = useState('0');
//   const [searchQuery, setSearchQuery] = useState('');

//   // Fetch data
//   const isArchived = activeTab === 'archive';
//   const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();

//   console.log("WASTE COL MOBILE DATA: ", wasteCollectionData)
//   // Mutation hooks
//   const { mutate: archiveWasteSchedCol, isPending: isArchiving } = useArchiveWasteCol();
//   const { mutate: deleteWasteSchedCol, isPending: isDeleting } = useDeleteWasteCol();
//   const { mutate: restoreWasteSchedCol, isPending: isRestoring } = useRestoreWasteCol();

//   // Sort data by day and time
//   const sortedData = useMemo(() => 
//     sortWasteCollectionData(wasteCollectionData), 
//     [wasteCollectionData]
//   );

//   // Filter data based on view mode, day, and search query
//   const filteredData = sortedData
//     .filter(item => {
//       const matchesViewMode = item.wc_is_archive === isArchived;
//       const matchesDay = selectedDay === '0' || item.wc_day === selectedDay;
//       const matchesSearch = searchQuery === '' || 
//                            item.wc_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                            item.sitio_name?.toLowerCase().includes(searchQuery.toLowerCase());
//       return matchesViewMode && matchesDay && matchesSearch;
//     });

//   // Group data by day
//   const groupedData = useMemo(() => {
//     const groups: { [key: string]: WasteCollectionSchedFull[] } = {};
    
//     filteredData.forEach(item => {
//       if (!groups[item.wc_day]) {
//         groups[item.wc_day] = [];
//       }
//       groups[item.wc_day].push(item);
//     });
    
//     // Convert to array format for SectionList
//     return Object.keys(groups).map(day => ({
//       title: day,
//       data: groups[day]
//     }));
//   }, [filteredData]);

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
//                 <Edit3 size={16} color="#00A8F0"/>
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
//     <View className="bg-gray-100 py-3 px-4 border-b border-gray-200">
//       <Text className="text-lg font-bold text-gray-800">{section.title}</Text>
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <ScreenLayout
//         header="Waste Collection Schedules"
//         description="Manage waste collection schedules"
//         showBackButton={false}
//         showExitButton={false}
//       >
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" className="text-blue-500" />
//         </View>
//       </ScreenLayout>
//     );
//   }

//   return (
//     <ScreenLayout
//       header="Waste Collection Schedules"
//       description="Manage waste collection schedules"
//       showBackButton={false}
//       showExitButton={false}
//       scrollable={false}
//       loading={isLoading || isArchiving || isRestoring || isDeleting}
//       loadingMessage={
//         isRestoring ? "Restoring schedule..." : 
//         isDeleting ? "Deleting schedule..." :
//         "Loading..."
//       }
//       footer={false}
//     >
//       {/* Search and Filter */}
//       <View className="px-4 pb-4">
//         <View className="flex-row items-center gap-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search by sitio or details..."
//               className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>
          
//           <View className="w-[120px]">
//             <SelectLayout
//               options={dayOptions}
//               className="h-8"
//               selectedValue={selectedDay}
//               onSelect={(option) => setSelectedDay(option.value)}
//               placeholder="Day"
//               isInModal={false}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Tabs */}
//       <View className="px-4">
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="bg-blue-50 mb-3 flex-row justify-between">
//             <TabsTrigger 
//               value="active" 
//               className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//             >
//               <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//                 Active
//               </Text>
//             </TabsTrigger>
//             <TabsTrigger 
//               value="archive"
//               className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//             >
//               <View className="flex-row items-center justify-center">
//                 <Archive 
//                   size={16} 
//                   className="mr-1" 
//                   color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//                 />
//                 <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                   Archive
//                 </Text>
//               </View>
//             </TabsTrigger>
//           </TabsList>

//           {/* Create Button */}
//           <View className="flex-row justify-end pb-4">
//             <TouchableOpacity
//               className="bg-blue-500 flex-row items-center px-4 py-2 rounded-lg"
//               onPress={() => router.push('/(waste)/waste-collection/waste-col-create')}
//             >
//               <Plus size={16} className="text-white mr-1" />
//               <Text className="text-white text-sm">Create</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Active Schedules */}
//           <TabsContent value="active">
//             <View className="flex-1">
//               {groupedData.length > 0 ? (
//                 <SectionList
//                   sections={groupedData}
//                   keyExtractor={item => item.wc_num.toString()}
//                   renderItem={renderItem}
//                   renderSectionHeader={renderSectionHeader}
//                   contentContainerStyle={{ paddingBottom: 20 }}
//                   showsVerticalScrollIndicator={false}
//                   stickySectionHeadersEnabled={true}
//                 />
//               ) : (
//                 <View className="flex-1 justify-center items-center py-10">
//                   <Text className="text-gray-400 text-lg">
//                     No active schedules found
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </TabsContent>

//           {/* Archived Schedules */}
//           <TabsContent value="archive">
//             <View className="flex-1">
//               {groupedData.length > 0 ? (
//                 <SectionList
//                   sections={groupedData}
//                   keyExtractor={item => item.wc_num.toString()}
//                   renderItem={renderItem}
//                   renderSectionHeader={renderSectionHeader}
//                   contentContainerStyle={{ paddingBottom: 20 }}
//                   showsVerticalScrollIndicator={false}
//                   stickySectionHeadersEnabled={true}
//                 />
//               ) : (
//                 <View className="flex-1 justify-center items-center py-10">
//                   <Text className="text-gray-400 text-lg">
//                     No archived schedules found
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </TabsContent>
//         </Tabs>
//       </View>
//     </ScreenLayout>
//   );
// };

// export default WasteCollectionMain;








//===================================== WORKING  BUT NOT PERFECT ================================



// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   SectionList,
// } from 'react-native';
// import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from './queries/waste-col-fetch-queries';
// import { useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from './queries/waste-col-delete-queries';
// import { Plus, Trash, Archive, ArchiveRestore, Eye, Edit3 } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { useQueryClient } from '@tanstack/react-query';
// import { formatTime } from '@/helpers/timeFormatter';
// import ScreenLayout from '@/screens/_ScreenLayout';
// import { Input } from '@/components/ui/input';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { sortWasteCollectionData } from '@/helpers/wasteCollectionHelper';



// // Day options for filtering
// const dayOptions = [
//   { label: "0", value: "0" },
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
//   const queryClient = useQueryClient();
//   const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');
//   const [selectedDay, setSelectedDay] = useState('0');
//   const [searchQuery, setSearchQuery] = useState('');

//   // Fetch data
//   const isArchived = viewMode === 'archive';
//   const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();

//   // Mutation hooks
//   const { mutate: archiveWasteSchedCol, isPending: isArchiving } = useArchiveWasteCol();
//   const { mutate: deleteWasteSchedCol, isPending: isDeleting } = useDeleteWasteCol();
//   const { mutate: restoreWasteSchedCol, isPending: isRestoring } = useRestoreWasteCol();

//   // Sort data by day and time
//   const sortedData = useMemo(() => 
//     sortWasteCollectionData(wasteCollectionData), 
//     [wasteCollectionData]
//   );

//   // Filter data based on view mode, sitio, and search query
//   const filteredData = sortedData
//     .filter(item => {
//       const matchesViewMode = item.wc_is_archive === isArchived;
//       const matchesDay = selectedDay === '0' || item.wc_day === selectedDay;
//       const matchesSearch = searchQuery === '' || 
//                            item.wc_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                            item.sitio_name?.toLowerCase().includes(searchQuery.toLowerCase());
//       return matchesViewMode && matchesDay && matchesSearch;
//     });

//   // Group data by day
//   const groupedData = useMemo(() => {
//     const groups: { [key: string]: WasteCollectionSchedFull[] } = {};
    
//     filteredData.forEach(item => {
//       if (!groups[item.wc_day]) {
//         groups[item.wc_day] = [];
//       }
//       groups[item.wc_day].push(item);
//     });
    
//     // Convert to array format for SectionList
//     return Object.keys(groups).map(day => ({
//       title: day,
//       data: groups[day]
//     }));
//   }, [filteredData]);

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
//           {viewMode === 'active' ? (
//             <>
//               <TouchableOpacity 
//                 className="bg-blue-50 rounded py-1 px-1"
//                 onPress={() => handleEdit(item)}
//               >
//                 <Edit3 size={16} color="#00A8F0"/>
//               </TouchableOpacity>
              
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                       <Trash size={16} color="#dc2626" />
//                   </TouchableOpacity>
//                 }
//                 title="Delete Schedule"
//                 description="This schedule will be permanently deleted. Are you sure?"
//                 actionLabel="Delete"
//                 onPress={() => handleDelete(item.wc_num)}
//               />
//             </>
//           ) : (
//             <>              
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                       <Trash size={16} color="#dc2626" />
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
//     <View className="bg-gray-100 py-3 px-4 border-b border-gray-200">
//       <Text className="text-lg font-bold text-gray-800">{section.title}</Text>
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <ScreenLayout
//         header="Waste Collection Schedules"
//         description="Manage waste collection schedules"
//         showBackButton={false}
//         showExitButton={false}
//       >
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" className="text-blue-500" />
//         </View>
//       </ScreenLayout>
//     );
//   }

//   return (
//     <ScreenLayout
//       header="Waste Collection Schedules"
//       description="Manage waste collection schedules"
//       showBackButton={false}
//       showExitButton={false}
//       scrollable={false}
//       loading={isLoading || isArchiving || isRestoring || isDeleting}
//       loadingMessage={
//         isRestoring ? "Restoring schedule..." : 
//         isDeleting ? "Deleting schedule..." :
//         "Loading..."
//       }
//       footer={false}
//     >
//       {/* View Mode Toggle */}
//       <View className="flex-row justify-center my-3">
//         <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
//           <TouchableOpacity
//             className={`px-4 py-2 ${viewMode === 'active' ? 'bg-white' : ''}`}
//             onPress={() => {
//               setViewMode('active');
//               queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
//             }}
//           >
//             <Text className={`text-sm font-medium ${viewMode === 'active' ? 'text-blue-500' : 'text-gray-500'}`}>
//               Active
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className={`px-4 py-2 ${viewMode === 'archive' ? 'bg-white' : ''}`}
//             onPress={() => {
//               setViewMode('archive');
//               queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
//             }}
//           >
//             <Text className={`text-sm font-medium ${viewMode === 'archive' ? 'text-blue-500' : 'text-gray-500'}`}>
//               History
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Search and Filter */}
//       <View className="flex-row px-4 mb-4 gap-2">
//         <View className="flex-1">
//           <Input
//             placeholder="Search by sitio or details..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             className="bg-white"
//           />
//         </View>
//         <View className="w-32">
//           <SelectLayout
//             className="bg-white"
//             placeholder="Day"
//             options={dayOptions}
//             selectedValue={selectedDay}
//             onSelect={(option) => setSelectedDay(option.value)} 
//           />
//         </View>
//       </View>

//       {/* Create Button */}
//       <View className="flex-row justify-end pb-4 px-4">
//         <TouchableOpacity
//           className="bg-blue-500 flex-row items-center px-3 py-3 rounded-full"
//           onPress={() => router.push('/(waste)/waste-collection/waste-col-create')}
//         >
//           <Plus size={20} className="text-white" />
//         </TouchableOpacity>
//       </View>

//       {/* Schedule List */}
//       <View className="flex-1">
//         {groupedData.length > 0 ? (
//           <SectionList
//             sections={groupedData}
//             keyExtractor={item => item.wc_num.toString()}
//             renderItem={renderItem}
//             renderSectionHeader={renderSectionHeader}
//             contentContainerStyle={{ paddingBottom: 20 }}
//             showsVerticalScrollIndicator={false}
//             stickySectionHeadersEnabled={true}
//           />
//         ) : (
//           <View className="flex-1 justify-center items-center py-10">
//             <Text className="text-gray-400 text-lg">
//               No {viewMode === 'active' ? 'active' : 'archived'} schedules found
//             </Text>
//           </View>
//         )}
//       </View>
//     </ScreenLayout>
//   );
// };

// export default WasteCollectionMain;







import React, { useState, useMemo } from 'react';
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
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { sortWasteCollectionData } from '@/helpers/wasteCollectionHelper';
import PageLayout from '@/screens/_PageLayout';


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
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();


  // Mutation hooks
  const { mutate: archiveWasteSchedCol, isPending: isArchiving } = useArchiveWasteCol();
  const { mutate: deleteWasteSchedCol, isPending: isDeleting } = useDeleteWasteCol();
  const { mutate: restoreWasteSchedCol, isPending: isRestoring } = useRestoreWasteCol();

  // Sort data by day and time
  const sortedData = useMemo(() =>
    sortWasteCollectionData(wasteCollectionData),
    [wasteCollectionData]
  );


  // Filter Active
  const activeFilteredData = useMemo(() => {
    const filtered = sortedData.filter(item => {
      const matchesViewMode = item.wc_is_archive === false;
      const matchesDay = selectedDay === '0' || item.wc_day === selectedDay;
      const matchesSearch = searchQuery === '' ||
        item.wc_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sitio_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesViewMode && matchesDay && matchesSearch;
    });
    return filtered;
  }, [sortedData, selectedDay, searchQuery]);

  // Filter Archived
  const archivedFilteredData = useMemo(() => {
    const filtered = sortedData.filter(item => {
      const matchesViewMode = item.wc_is_archive === true;
      const matchesDay = selectedDay === '0' || item.wc_day === selectedDay;
      const matchesSearch = searchQuery === '' ||
        item.wc_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sitio_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesViewMode && matchesDay && matchesSearch;
    });
    return filtered;
  }, [sortedData, selectedDay, searchQuery]);

  // Grouping function
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

  const activeGroupedData = useMemo(() => groupByDay(activeFilteredData), [activeFilteredData]);
  const archivedGroupedData = useMemo(() => groupByDay(archivedFilteredData), [archivedFilteredData]);

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
        <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }
      wrapScroll={false}      
    >
      {isLoading || isRestoring || isArchiving || isDeleting ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
          <Text className="text-sm text-gray-500 mt-2 text-center">
            {
              isArchiving ? "Archiving Schedule..." : 
              isRestoring ? "Restoring Schedule..." : 
              isDeleting ? "Deleting Schedule..." :
              "Loading..."
            }
          </Text>
        </View>
      ) : (
        <>
          {/* Search and Filter */}
          <View className="px-4 pb-4 pt-4">
            <View className="flex-row items-center gap-2">
              <View className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-500" size={17} />
                <TextInput
                  placeholder="Search..."
                  className="pl-3 w-full h-[45px] bg-white text-base rounded-xl p-2 border border-gray-300"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View className="w-[120px] pb-5">
                <SelectLayout
                  options={dayOptions}
                  className="h-8"
                  selectedValue={selectedDay}
                  onSelect={(option) => setSelectedDay(option.value)}
                  placeholder="Day"
                  isInModal={false}
                />
              </View>
            </View>
          </View>

          {/* Create Button */}
          <View className="pb-4 px-4">
            <TouchableOpacity
              className="bg-primaryBlue flex-row items-center justify-center w-full px-4 py-4 rounded-lg mb-3"
              onPress={() => router.push('/(waste)/waste-collection/waste-col-create')}
            >
              <Plus size={16} className="text-white mr-2" />
              <Text className="text-white text-lg font-medium">Create</Text>
            </TouchableOpacity>
          </View>      

          {/* View Mode Toggle - Simplified version */}
          <View className="flex-row justify-center px-3 mb-3">
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

          {/* Conditional rendering based on active tab */}
          {activeTab === 'active' ? (
            <View className="flex-1 px-4">
              {activeGroupedData.length > 0 ? (
                <SectionList
                  sections={activeGroupedData}
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
                    No active schedules found
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-1 px-4">
              {archivedGroupedData.length > 0 ? (
                <SectionList
                  sections={archivedGroupedData}
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
                    No archived schedules found
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default WasteCollectionMain;