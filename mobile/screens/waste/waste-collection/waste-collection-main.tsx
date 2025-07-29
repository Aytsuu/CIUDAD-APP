// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// // import { useGetWasteCollectionSchedFull, useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from './queries/wasteColDeleteQueries';
// import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull  } from './queries/waste-col-fetch-queries';
// import { useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from './queries/waste-col-delete-queries';
// import { Plus, Trash, Archive, ArchiveRestore, Eye } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { formatTime } from '@/helpers/timeFormatter';
// import ScreenLayout from '@/screens/_ScreenLayout';
// import { Tabs } from '@/components/ui/tabs';
// import { Input } from '@/components/ui/input';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';

// const WasteCollectionMain = () => {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('active');
//   const [selectedSitio, setSelectedSitio] = useState('0');
//   const [searchQuery, setSearchQuery] = useState('');

//   // Fetch data
//   const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();

//   // Mutation hooks
//   const { mutate: archiveWasteSchedCol } = useArchiveWasteCol();
//   const { mutate: deleteWasteSchedCol } = useDeleteWasteCol();
//   const { mutate: restoreWasteSchedCol } = useRestoreWasteCol();

//   // Filter data based on selected sitio and search query
//   const filteredData = wasteCollectionData.filter(item => {
//     const matchesSitio = selectedSitio === '0' || item.sitio_name === selectedSitio;
//     const matchesSearch = item.wc_add_info.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                          item.sitio_name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesSitio && matchesSearch;
//   });

//   // Separate active and archived data
//   const activeData = filteredData.filter(item => !item.wc_is_archive);
//   const archivedData = filteredData.filter(item => item.wc_is_archive);

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
//     <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-800 font-semibold text-base">{item.sitio_name}</Text>
//         <Text className="text-gray-500">{item.wc_date}</Text>
//       </View>
      
//       <View className="mb-3">
//         <Text className="text-gray-500">{formatTime(item.wc_time)}</Text>
//         {item.wc_add_info && (
//           <Text className="text-gray-600 mt-1">{item.wc_add_info}</Text>
//         )}
//       </View>
      
//       <View className="flex-row justify-end space-x-4">
//         {activeTab === 'active' ? (
//           <>
//             <TouchableOpacity 
//               className="p-2"
//               onPress={() => router.push({
//                 pathname: '/',
//                 params: { 
//                   id: item.wc_num.toString(),
//                   date: item.wc_date,
//                   time: item.wc_time,
//                   info: item.wc_add_info,
//                   sitio: item.sitio,
//                   truck: item.truck,
//                   driver: item.wstp,
//                   collectors: JSON.stringify(item.collectors_wstp_ids)
//                 }
//               })}
//             >
//               <Eye size={20} className="text-blue-500" />
//             </TouchableOpacity>
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="p-2">
//                   <Archive size={20} className="text-yellow-500" />
//                 </TouchableOpacity>
//               }
//               title="Archive Schedule"
//               description="This schedule will be moved to archive. Are you sure?"
//               actionLabel="Archive"
//               onPress={() => handleArchive(item.wc_num)}
//             />
//           </>
//         ) : (
//           <>
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="p-2">
//                   <ArchiveRestore size={20} className="text-green-500" />
//                 </TouchableOpacity>
//               }
//               title="Restore Schedule"
//               description="This schedule will be restored to active list. Are you sure?"
//               actionLabel="Restore"
//               onPress={() => handleRestore(item.wc_num)}
//             />
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="p-2">
//                   <Trash size={20} className="text-red-500" />
//                 </TouchableOpacity>
//               }
//               title="Delete Schedule"
//               description="This schedule will be permanently deleted. Are you sure?"
//               actionLabel="Delete"
//               onPress={() => handleDelete(item.wc_num)}
//             />
//           </>
//         )}
//       </View>
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <ScreenLayout
//         header="Waste Collection Schedules"
//         description="Manage waste collection schedules"
//         showBackButton
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
//       showBackButton
//     >
//       {/* Create Button */}
//       <View className="flex-row justify-end mb-4">
//         <TouchableOpacity
//           className="bg-blue-500 flex-row items-center px-4 py-2 rounded-md"
//           onPress={() => router.push('/')}
//         >
//           <Plus size={20} className="text-white" />
//           <Text className="text-white ml-2">Create</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Search and Filter */}
//       <View className="flex-row mb-4 space-x-3">
//         <View className="flex-1">
//           <Input
//             placeholder="Search..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             className="bg-white"
//           />
//         </View>
        
//         <View className="w-40">
//           {/* <SelectLayout
//             items={[
//               { label: 'All Sitio', value: '0' },
//               ...Array.from(new Set(wasteCollectionData.map(item => item.sitio_name)))
//                 .filter(name => name)
//                 .map(name => ({ label: name, value: name }))
//             ]}
//             value={selectedSitio}
//             onValueChange={setSelectedSitio}
//             placeholder="Filter by Sitio"
//           /> */}
//         </View>
//       </View>

//       {/* Tabs */}
//       <Tabs
//         value={activeTab}
//         onValueChange={setActiveTab}
//         className="flex-1"
//       >
//         <Tabs.List className="bg-gray-100 rounded-lg p-1 mb-4 flex-row">
//           <Tabs.Trigger 
//             value="active" 
//             className={`flex-1 items-center py-2 rounded ${activeTab === 'active' ? 'bg-white' : ''}`}
//           >
//             <Text className={`font-medium ${activeTab === 'active' ? 'text-blue-500' : 'text-gray-500'}`}>
//               Active Schedules
//             </Text>
//           </Tabs.Trigger>
//           <Tabs.Trigger 
//             value="archived" 
//             className={`flex-1 items-center py-2 rounded flex-row ${activeTab === 'archived' ? 'bg-white' : ''}`}
//           >
//             <Archive size={16} className={activeTab === 'archived' ? 'text-blue-500 mr-1' : 'text-gray-500 mr-1'} />
//             <Text className={`font-medium ${activeTab === 'archived' ? 'text-blue-500' : 'text-gray-500'}`}>
//               Archived
//             </Text>
//           </Tabs.Trigger>
//         </Tabs.List>

//         <Tabs.Content value="active" className="flex-1">
//           {activeData.length > 0 ? (
//             <FlatList
//               data={activeData}
//               renderItem={renderItem}
//               keyExtractor={item => item.wc_num.toString()}
//               contentContainerStyle={{ paddingBottom: 20 }}
//             />
//           ) : (
//             <View className="flex-1 justify-center items-center py-10">
//               <Text className="text-gray-400 text-lg">No active schedules found</Text>
//             </View>
//           )}
//         </Tabs.Content>

//         <Tabs.Content value="archived" className="flex-1">
//           {archivedData.length > 0 ? (
//             <FlatList
//               data={archivedData}
//               renderItem={renderItem}
//               keyExtractor={item => item.wc_num.toString()}
//               contentContainerStyle={{ paddingBottom: 20 }}
//             />
//           ) : (
//             <View className="flex-1 justify-center items-center py-10">
//               <Text className="text-gray-400 text-lg">No archived schedules found</Text>
//             </View>
//           )}
//         </Tabs.Content>
//       </Tabs>
//     </ScreenLayout>
//   );
// };

// export default WasteCollectionMain;






// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
// } from 'react-native';
// import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from './queries/waste-col-fetch-queries';
// import { useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from './queries/waste-col-delete-queries';
// import { Plus, Trash, Archive, ArchiveRestore, Eye } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { useQueryClient } from '@tanstack/react-query';
// import { formatTime } from '@/helpers/timeFormatter';
// import ScreenLayout from '@/screens/_ScreenLayout';
// import { Input } from '@/components/ui/input';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';

// const WasteCollectionMain = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
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

//   // Filter data based on selected sitio, search query, and view mode
//   const filteredData = wasteCollectionData.filter(item => {
//     const matchesSitio = selectedSitio === '0' || item.sitio_name === selectedSitio;
//     const matchesSearch = item.wc_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                          item.sitio_name?.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesArchiveStatus = item.wc_is_archive === isArchived;
//     return matchesSitio && matchesSearch && matchesArchiveStatus;
//   });

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
//     <View className="bg-white shadow-sm rounded-lg p-4 mb-3 mx-2">
//       <View className="flex-row justify-between mb-2">
//         <Text className="text-gray-800 font-semibold text-base">{item.sitio_name}</Text>
//         <Text className="text-gray-500">{item.wc_date}</Text>
//       </View>
      
//       <View className="mb-3">
//         <Text className="text-gray-500">{formatTime(item.wc_time)}</Text>
//         {item.wc_add_info && (
//           <Text className="text-gray-600 mt-1">{item.wc_add_info}</Text>
//         )}
//       </View>
      
//       <View className="flex-row justify-end space-x-4">
//         {viewMode === 'active' ? (
//           <>
//             <TouchableOpacity 
//               className="p-2"
//               onPress={() => router.push({
//                 pathname: '/',
//                 params: { 
//                   id: item.wc_num.toString(),
//                   date: item.wc_date,
//                   time: item.wc_time,
//                   info: item.wc_add_info,
//                   sitio: item.sitio,
//                   truck: item.truck,
//                   driver: item.wstp,
//                   collectors: JSON.stringify(item.collectors_wstp_ids)
//                 }
//               })}
//             >
//               <Eye size={20} className="text-blue-500" />
//             </TouchableOpacity>
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity 
//                   className="p-2"
//                   disabled={isArchiving}
//                 >
//                   {isArchiving ? (
//                     <ActivityIndicator size="small" color="#f59e0b" />
//                   ) : (
//                     <Archive size={20} className="text-yellow-500" />
//                   )}
//                 </TouchableOpacity>
//               }
//               title="Archive Schedule"
//               description="This schedule will be moved to archive. Are you sure?"
//               actionLabel="Archive"
//               onPress={() => handleArchive(item.wc_num)}
//               loading={isArchiving}
//             />
//           </>
//         ) : (
//           <>
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity 
//                   className="p-2"
//                   disabled={isRestoring}
//                 >
//                   {isRestoring ? (
//                     <ActivityIndicator size="small" color="#10b981" />
//                   ) : (
//                     <ArchiveRestore size={20} className="text-green-500" />
//                   )}
//                 </TouchableOpacity>
//               }
//               title="Restore Schedule"
//               description="This schedule will be restored to active list. Are you sure?"
//               actionLabel="Restore"
//               onPress={() => handleRestore(item.wc_num)}
//               loading={isRestoring}
//             />
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity 
//                   className="p-2"
//                   disabled={isDeleting}
//                 >
//                   {isDeleting ? (
//                     <ActivityIndicator size="small" color="#ef4444" />
//                   ) : (
//                     <Trash size={20} className="text-red-500" />
//                   )}
//                 </TouchableOpacity>
//               }
//               title="Delete Schedule"
//               description="This schedule will be permanently deleted. Are you sure?"
//               actionLabel="Delete"
//               onPress={() => handleDelete(item.wc_num)}
//               loading={isDeleting}
//             />
//           </>
//         )}
//       </View>
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <ScreenLayout
//         header="Waste Collection Schedules"
//         description="Manage waste collection schedules"
//         showBackButton
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
//       showBackButton
//       scrollable={false}
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
//               Active Schedules
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
//               Archived
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Create Button */}
//       <View className="flex-row justify-end mb-4 px-4">
//         <TouchableOpacity
//           className="bg-blue-500 flex-row items-center px-4 py-2 rounded-md"
//           onPress={() => router.push('/')}
//         >
//           <Plus size={20} className="text-white" />
//           <Text className="text-white ml-2">Create</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Search and Filter */}
//       <View className="flex-row mb-4 px-4 space-x-3">
//         <View className="flex-1">
//           <Input
//             placeholder="Search..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             className="bg-white"
//           />
//         </View>
        
//         <View className="w-40">
//           {/* <SelectLayout
//             items={[
//               { label: 'All Sitio', value: '0' },
//               ...Array.from(new Set(wasteCollectionData.map(item => item.sitio_name)))
//                 .filter(name => name)
//                 .map(name => ({ label: name, value: name }))
//             ]}
//             value={selectedSitio}
//             onValueChange={setSelectedSitio}
//             placeholder="Filter by Sitio"
//           /> */}
//         </View>
//       </View>

//       {/* Schedule List */}
//       <View className="flex-1 px-2">
//         <View className="flex-row justify-between items-center mb-4 px-2">
//           <Text className="text-lg font-bold text-gray-800">
//             {viewMode === 'active' ? 'Active' : 'Archived'} Schedules
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







//LATEST W/ EVERYTHING
// import React, { useState } from 'react';
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
//   const filteredData = formattedSchedules.filter(item => {
//     const matchesDate = isSameDay(item.rawDate, selectedDate);
//     const matchesSitio = selectedSitio === '0' || item.sitio_name === selectedSitio;
//     const matchesSearch = item.wc_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                          item.sitio_name?.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesDate && matchesSitio && matchesSearch;
//   });


//   const handleEdit = (item: any) => {
//     router.push({
//       pathname: '/waste/waste-collection/waste-col-edit',
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
//                     <Archive size={16} color="#dc2626"/>
//                   </TouchableOpacity>
//                 }
//                 title="Archive Schedule"
//                 description="This schedule will be moved to archive. Are you sure?"
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
//                 description="This schedule will be restored to active list. Are you sure?"
//                 actionLabel="Restore"
//                 onPress={() => handleRestore(item.wc_num)}
//               />
              
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
//         isArchiving ? "Archiving schedule..." : 
//         isRestoring ? "Restoring schedule..." : 
//         isDeleting ? "Deleting schedule..." :
//         "Loading..."
//       }
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
//               Archive
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
//           className="bg-blue-500 flex-row items-center px-4 py-4 rounded-full"
//           onPress={() => router.push('/waste/waste-collection/waste-col-create')}
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












// import React, { useState } from 'react';
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
//                     <Archive size={16} color="#dc2626"/>
//                   </TouchableOpacity>
//                 }
//                 title="Archive Schedule"
//                 description="This schedule will be moved to archive. Are you sure?"
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
//                 description="This schedule will be restored to active list. Are you sure?"
//                 actionLabel="Restore"
//                 onPress={() => handleRestore(item.wc_num)}
//               />
              
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
//         isArchiving ? "Archiving schedule..." : 
//         isRestoring ? "Restoring schedule..." : 
//         isDeleting ? "Deleting schedule..." :
//         "Loading..."
//       }
//       footer={null}
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
//               Archive
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
//           className="bg-blue-500 flex-row items-center px-4 py-4 rounded-full"
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











import React, { useState, useEffect  } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from './queries/waste-col-fetch-queries';
import { useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from './queries/waste-col-delete-queries';
import { Plus, Trash, Archive, ArchiveRestore, Eye, Edit3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isSameMonth, isSameDay, addMonths } from 'date-fns';
import { formatTime } from '@/helpers/timeFormatter';
import ScreenLayout from '@/screens/_ScreenLayout';
import { Input } from '@/components/ui/input';
import { SelectLayout } from '@/components/ui/select-layout';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const DAY_SIZE = width / 7 - 10;

const WasteCollectionMain = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');
  const [selectedSitio, setSelectedSitio] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data based on view mode
  const isArchived = viewMode === 'archive';
  const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();

  // Mutation hooks
  const { mutate: archiveWasteSchedCol, isPending: isArchiving } = useArchiveWasteCol();
  const { mutate: deleteWasteSchedCol, isPending: isDeleting } = useDeleteWasteCol();
  const { mutate: restoreWasteSchedCol, isPending: isRestoring } = useRestoreWasteCol();


  //Sets the data to archive if the date is lesser than the current date
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time

    wasteCollectionData.forEach(item => {
      const itemDate = new Date(item.wc_date);
      itemDate.setHours(0, 0, 0, 0); // Remove time

      if (itemDate < today && !item.wc_is_archive) {
        archiveWasteSchedCol(item.wc_num);
      }
    });
  }, [wasteCollectionData]);


  // Format and filter events for the calendar
  const formattedSchedules = wasteCollectionData
    .filter(item => item.wc_is_archive === isArchived)
    .map(item => ({
      ...item,
      rawDate: parseISO(item.wc_date),
      formattedDate: format(parseISO(item.wc_date), 'MM-dd'),
      day: format(parseISO(item.wc_date), 'EEEE'),
    }));

  // Filter schedules for current month
  const currentMonthSchedules = formattedSchedules.filter(item => 
    isSameMonth(item.rawDate, currentMonth)
  );

  // Generate days for the current month
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const handleMonthChange = (increment: number) => {
    setCurrentMonth(addMonths(currentMonth, increment));
    setSelectedDate(addMonths(selectedDate, increment));
  };

  const handleDateSelect = (date: number) => {
    setSelectedDate(new Date(year, month, date));
  };

  const renderDayHeader = (day: string) => (
    <View key={day} className="items-center py-2">
      <Text className="text-gray-500 text-sm font-medium">{day}</Text>
    </View>
  );

  const renderDateCell = (date: number | null, index: number) => {
    if (date === null) {
      return <View key={`blank-${index}`} style={{ width: DAY_SIZE, height: DAY_SIZE }} />;
    }
    
    const dateObj = new Date(year, month, date);
    const hasSchedule = currentMonthSchedules.some(schedule => 
      isSameDay(schedule.rawDate, dateObj)
    );
    const isSelected = isSameDay(selectedDate, dateObj);
    const isToday = isSameDay(dateObj, new Date());
    
    return (
      <TouchableOpacity
        key={date}
        className={`items-center justify-center rounded-full m-1 ${
          isSelected 
            ? 'bg-blue-600' 
            : hasSchedule 
              ? 'bg-blue-100' 
              : isToday
                ? 'bg-gray-200'
                : 'bg-white'
        }`}
        style={{ width: DAY_SIZE, height: DAY_SIZE }}
        onPress={() => handleDateSelect(date)}
      >
        <Text className={`text-lg ${
          isSelected 
            ? 'text-white font-bold' 
            : isToday
              ? 'text-blue-600 font-bold'
              : 'text-gray-800'
        }`}>
          {date}
        </Text>
        {hasSchedule && !isSelected && (
          <View className="w-1 h-1 rounded-full bg-blue-500 mt-1" />
        )}
      </TouchableOpacity>
    );
  };

  // Filter data based on selected date, sitio, and search query
  const filteredData = formattedSchedules
    .filter(item => {
      const matchesDate = isSameDay(item.rawDate, selectedDate);
      const matchesSitio = selectedSitio === '0' || item.sitio_name === selectedSitio;
      const matchesSearch = item.wc_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.sitio_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSitio && matchesSearch;
    })
    .sort((a, b) => a.wc_time.localeCompare(b.wc_time));


  const handleEdit = (item: any) => {
    router.push({
      pathname: '/(waste)/waste-collection/waste-col-edit',
      params: { 
        wc_num: item.wc_num.toString(),
        date: item.wc_date,
        time: item.wc_time,
        info: item.wc_add_info,
        sitio: item.sitio,
        truck: item.truck,
        driver: item.wstp,
        collectors_id: JSON.stringify(item.collectors_wstp_ids)
      }
    })
  }

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
    <View className="bg-white shadow-sm rounded-lg p-4 mb-3 mx-2  border border-gray-200">
      {/* First row with sitio name and action icons */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-gray-800 font-semibold text-base">{item.sitio_name}</Text>
        <View className="flex-row gap-1">
          {viewMode === 'active' ? (
            <>
              <TouchableOpacity 
                className="bg-blue-50 rounded py-1 px-1"
                onPress={() => handleEdit(item)}
              >
                <Edit3 size={16} color="#00A8F0"/>
              </TouchableOpacity>
              
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
          ) : (
            <>              
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

      {/* Date row */}
      <View className="mb-1">
        <Text className="text-gray-500">{item.wc_date}</Text>
      </View>

      {/* Time row */}
      <View className="mb-1">
        <Text className="text-gray-500">{formatTime(item.wc_time)}</Text>
      </View>

      {/* Additional info if exists */}
      {item.wc_add_info && (
        <View className="mt-1">
          <Text className="text-gray-600">{item.wc_add_info}</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <ScreenLayout
        header="Waste Collection Schedules"
        description="Manage waste collection schedules"
        showBackButton={false}
        showExitButton={false}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" className="text-blue-500" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      header="Waste Collection Schedules"
      description="Manage waste collection schedules"
      showBackButton={false}
      showExitButton={false}
      scrollable={false}
      loading={isLoading || isArchiving || isRestoring || isDeleting}
      loadingMessage={
        // isArchiving ? "Archiving schedule..." : 
        isRestoring ? "Restoring schedule..." : 
        isDeleting ? "Deleting schedule..." :
        "Loading..."
      }
      footer={false}
    >
      {/* View Mode Toggle */}
      <View className="flex-row justify-center my-3" >
        <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
          <TouchableOpacity
            className={`px-4 py-2 ${viewMode === 'active' ? 'bg-white' : ''}`}
            onPress={() => {
              setViewMode('active');
              queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
            }}
          >
            <Text className={`text-sm font-medium ${viewMode === 'active' ? 'text-blue-500' : 'text-gray-500'}`}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 ${viewMode === 'archive' ? 'bg-white' : ''}`}
            onPress={() => {
              setViewMode('archive');
              queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
            }}
          >
            <Text className={`text-sm font-medium ${viewMode === 'archive' ? 'text-blue-500' : 'text-gray-500'}`}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Header */}
      <View className="bg-white shadow-sm py-4 px-2">
        <View className="flex-row justify-between items-center mb-4 px-2">
          <TouchableOpacity 
            onPress={() => handleMonthChange(-1)}
            className="p-2"
          >
            <MaterialIcons name="chevron-left" size={24} color="#3B82F6" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-gray-800">
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          
          <TouchableOpacity 
            onPress={() => handleMonthChange(1)}
            className="p-2"
          >
            <MaterialIcons name="chevron-right" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-around mb-2">
          {days.map(renderDayHeader)}
        </View>
        
        <View className="flex-row flex-wrap justify-around">
          {blankDays.map((date, index) => renderDateCell(date, index))}
          {dates.map(renderDateCell)}
        </View>
      </View>

      {/* Create Button */}
      <View className="flex-row justify-end pb-4 pt-4 px-4">
        <TouchableOpacity
          className="bg-blue-500 flex-row items-center px-3 py-3 rounded-full"
          onPress={() => router.push('/(waste)/waste-collection/waste-col-create')}
        >
          <Plus size={20} className="text-white" />
        </TouchableOpacity>
      </View>



      {/* Schedule List */}
      <View className="flex-1 px-2">
        <View className="flex-row justify-between items-center mb-4 px-2">
          <Text className="text-lg font-bold text-gray-800">
            {format(selectedDate, 'EEEE, MMMM d')}
          </Text>
          <Text className="text-blue-600">
            {filteredData.length} {filteredData.length === 1 ? 'Schedule' : 'Schedules'}
          </Text>
        </View>
        
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => item.wc_num.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400 text-lg">
              No {viewMode === 'active' ? 'active' : 'archived'} schedules found for this date
            </Text>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};

export default WasteCollectionMain;