// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   Modal,
//   Image,
//   ScrollView,
//   ActivityIndicator
// } from 'react-native';
// import {
//   X,
//   Search,
//   ChevronLeft,
//   Eye
// } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// // import { useWasteReport, type WasteReport } from './queries/waste-ReportGetQueries';
// import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
// import _ScreenLayout from '@/screens/_ScreenLayout';


// const WasteIllegalDumpingMainStaff = () => {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilterId, setSelectedFilterId] = useState("0");
//   const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState(false);
//   const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

//   const { data: fetchedData = [], isLoading } = useWasteReport();

//   const filterOptions = [
//     { label: "All", value: "0" },
//     {label: "Littering, Illegal dumping, Illegal disposal of garbage", value: "1"},
//     {label: "Urinating, defecating, spitting in a public place", value: "2"},
//     {label: "Dirty frontage and immediate surroundings for establishment owners", value: "3"},
//     {label: "Improper and untimely stacking of garbage outside residences or establishment", value: "4"},
//     {label: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)", value: "5"},
//     {label: "Dirty public utility vehicles, or no trash can or receptacle", value: "6"},
//     {label: "Spilling, scattering, littering of wastes by public utility vehicles", value: "7"},
//     {label: "Illegal posting or installed signage, billboards, posters, streamers and movie ads.", value: "8."},
//   ];

//   // Filter data based on selected category and search query
//   const filteredData = fetchedData.filter(row => {
//     // Filter by selected category
//     const categoryMatch = selectedFilterId === "0" 
//         ? true 
//         : row.rep_matter.trim().toLowerCase() === 
//         filterOptions.find(opt => opt.value === selectedFilterId)?.label.trim().toLowerCase();
    
//         // Filter by search query
//     const searchMatch = searchQuery 
//       ? Object.values(row).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
//       : true;
    
//     return categoryMatch && searchMatch;

//   });

//   const handleViewDetails = (report: WasteReport) => {
//     setSelectedReport(report);
//     setViewDetailsModalVisible(true);
//   };

//   const renderItem = ({ item }: { item: WasteReport }) => (
//     <Card className="mb-4 border border-gray-200">
//       <CardHeader>
//         <CardTitle className="text-lg text-darkBlue2">
//           Report #{item.rep_id}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Status:</Text>
//           <Text className={item.rep_status === "resolved" ? "text-green-600" : "text-yellow-600"}>
//             {item.rep_status}
//           </Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Matter:</Text>
//           <Text>{item.rep_matter}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Location:</Text>
//           <Text>{item.rep_location}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Sitio:</Text>
//           <Text>{item.sitio_name || "N/A"}</Text>
//         </View>
//         <TouchableOpacity 
//           onPress={() => handleViewDetails(item)}
//           className="mt-2 bg-blue-50 py-2 rounded-md flex-row justify-center items-center"
//         >
//           <Eye size={16} color="#00A8F0" className="mr-2" />
//           <Text className="text-blue-600">View Details</Text>
//         </TouchableOpacity>
//       </CardContent>
//     </Card>
//   );

//   if (isLoading) {
//     return (
//       <_ScreenLayout>
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" color="#2a3a61" />
//           <Text className="mt-4 text-darkBlue2">Loading reports...</Text>
//         </View>
//       </_ScreenLayout>
//     );
//   }

//   return (
//     <_ScreenLayout
//       header="Illegal Dumping Reports"
//       headerAlign="left"
//       description="View all illegal dumping reports"
//       showBackButton={true}
//       showExitButton={false}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }
//       scrollable={true}
//       keyboardAvoiding={true}
//       contentPadding="medium"
//     >
//       {/* Search and Filters */}
//       <View className="mb-4">
//         <View className="flex-row items-center gap-2 mb-3">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search reports..."
//               className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>
//         </View>

//         <View className="mb-3">
//             <SelectLayout
//             options={filterOptions}
//             selectedValue={selectedFilterId}
//             onSelect={(option) => setSelectedFilterId(option.value)}  // Extract just the value
//             placeholder="Filter by matter"
//             className="bg-white"
//             />
//         </View>
//       </View>

//       {/* Reports List */}
//       <FlatList
//         data={filteredData}
//         renderItem={renderItem}
//         keyExtractor={item => item.rep_id.toString()}
//         scrollEnabled={false}
//         ListEmptyComponent={
//           <Text className="text-center text-gray-500 py-4">
//             No reports found
//           </Text>
//         }
//       />

//       {/* Report Details Modal */}
//       <Modal
//         visible={viewDetailsModalVisible}
//         transparent={false}
//         animationType="slide"
//         onRequestClose={() => setViewDetailsModalVisible(false)}
//       >
//         {selectedReport && (
//           <_ScreenLayout
//             header={`Report #${selectedReport.rep_id}`}
//             headerAlign="left"
//             showBackButton={true}
//             showExitButton={false}
//             customLeftAction={
//               <TouchableOpacity onPress={() => setViewDetailsModalVisible(false)}>
//                 <ChevronLeft size={24} color="black" />
//               </TouchableOpacity>
//             }
//             scrollable={true}
//           >
//             <View className="space-y-4">
//               <View className="flex-row justify-between">
//                 <Text className="text-gray-600">Status:</Text>
//                 <Text className={selectedReport.rep_status === "resolved" ? "text-green-600" : "text-yellow-600"}>
//                   {selectedReport.rep_status}
//                 </Text>
//               </View>
//               <View className="flex-row justify-between">
//                 <Text className="text-gray-600">Report Matter:</Text>
//                 <Text>{selectedReport.rep_matter}</Text>
//               </View>
//               <View className="flex-row justify-between">
//                 <Text className="text-gray-600">Location:</Text>
//                 <Text>{selectedReport.rep_location}</Text>
//               </View>
//               <View className="flex-row justify-between">
//                 <Text className="text-gray-600">Sitio:</Text>
//                 <Text>{selectedReport.sitio_name || "N/A"}</Text>
//               </View>
//               <View className="flex-row justify-between">
//                 <Text className="text-gray-600">Violator:</Text>
//                 <Text>{selectedReport.rep_violator}</Text>
//               </View>
//               <View className="flex-row justify-between">
//                 <Text className="text-gray-600">Complainant:</Text>
//                 <Text>{selectedReport.rep_anonymous ? "Anonymous" : selectedReport.rep_complainant}</Text>
//               </View>
//               <View className="flex-row justify-between">
//                 <Text className="text-gray-600">Contact:</Text>
//                 <Text>{selectedReport.rep_contact || "N/A"}</Text>
//               </View>
//               <View className="flex-row justify-between">
//                 <Text className="text-gray-600">Date Reported:</Text>
//                 <Text>{new Date(selectedReport.rep_date).toLocaleDateString()}</Text>
//               </View>
//               {selectedReport.rep_date_resolved && (
//                 <View className="flex-row justify-between">
//                   <Text className="text-gray-600">Date Resolved:</Text>
//                   <Text>{new Date(selectedReport.rep_date_resolved).toLocaleDateString()}</Text>
//                 </View>
//               )}
//               <View>
//                 <Text className="text-gray-600">Additional Details:</Text>
//                 <Text>{selectedReport.rep_add_details || "None provided"}</Text>
//               </View>
              
//               {/* Display attached images */}
//               {selectedReport.waste_report_file?.length > 0 && (
//                 <View className="mt-4">
//                   <Text className="text-gray-600 mb-2">Attached Images:</Text>
//                   <ScrollView horizontal className="py-2">
//                     {selectedReport.waste_report_file.map((file, index) => (
//                       <TouchableOpacity 
//                         key={index} 
//                         className="mr-2"
//                         onPress={() => {
//                           // You could implement a full-screen image viewer here
//                         }}
//                       >
//                         <Image
//                           source={{ uri: file.wrf_url }}
//                           className="w-24 h-24 rounded-md"
//                           resizeMode="cover"
//                         />
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>
//               )}
//             </View>
//           </_ScreenLayout>
//         )}
//       </Modal>
//     </_ScreenLayout>
//   );
// };

// export default WasteIllegalDumpingMainStaff;










// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   Modal,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   TouchableWithoutFeedback,
//   Keyboard
// } from 'react-native';
// import {
//   X,
//   Search,
//   ChevronLeft,
//   Eye
// } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// // import { useWasteReport, type WasteReport } from './queries/waste-ReportGetQueries';
// import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
// import _ScreenLayout from '@/screens/_ScreenLayout';


// const WasteIllegalDumpingMainStaff = () => {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilterId, setSelectedFilterId] = useState("0");
//   const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState(false);
//   const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

//   const { data: fetchedData = [], isLoading } = useWasteReport();

//   const filterOptions = [
//     { label: "All", value: "0" },
//     {label: "Littering, Illegal dumping, Illegal disposal of garbage", value: "1"},
//     {label: "Urinating, defecating, spitting in a public place", value: "2"},
//     {label: "Dirty frontage and immediate surroundings for establishment owners", value: "3"},
//     {label: "Improper and untimely stacking of garbage outside residences or establishment", value: "4"},
//     {label: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)", value: "5"},
//     {label: "Dirty public utility vehicles, or no trash can or receptacle", value: "6"},
//     {label: "Spilling, scattering, littering of wastes by public utility vehicles", value: "7"},
//     {label: "Illegal posting or installed signage, billboards, posters, streamers and movie ads.", value: "8."},
//   ];

//   // Filter data based on selected category and search query
//     const filteredData = React.useMemo(() => {
//         return fetchedData.filter(row => {
//             const categoryMatch = selectedFilterId === "0" 
//             ? true 
//             : row.rep_matter.trim().toLowerCase() === 
//                 filterOptions.find(opt => opt.value === selectedFilterId)?.label.trim().toLowerCase();
            
//             const searchMatch = searchQuery 
//             ? Object.values(row).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
//             : true;
            
//             return categoryMatch && searchMatch;
//         });
//     }, [fetchedData, selectedFilterId, searchQuery]);

//   const handleViewDetails = (report: WasteReport) => {
//     setSelectedReport(report);
//     setViewDetailsModalVisible(true);
//   };

//   const renderItem = ({ item }: { item: WasteReport }) => (
//     <Card className="mb-4 border border-gray-200">
//       <CardHeader>
//         <CardTitle className="text-lg text-darkBlue2">
//           Report #{item.rep_id}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Status:</Text>
//           <Text className={item.rep_status === "resolved" ? "text-green-600" : "text-yellow-600"}>
//             {item.rep_status}
//           </Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Matter:</Text>
//           <Text>{item.rep_matter}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Location:</Text>
//           <Text>{item.rep_location}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Sitio:</Text>
//           <Text>{item.sitio_name || "N/A"}</Text>
//         </View>
//         <TouchableOpacity 
//           onPress={() => handleViewDetails(item)}
//           className="mt-2 bg-blue-50 py-2 rounded-md flex-row justify-center items-center"
//         >
//           <Eye size={16} color="#00A8F0" className="mr-2" />
//           <Text className="text-blue-600">View Details</Text>
//         </TouchableOpacity>
//       </CardContent>
//     </Card>
//   );

//   if (isLoading) {
//     return (
//       <_ScreenLayout>
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" color="#2a3a61" />
//           <Text className="mt-4 text-darkBlue2">Loading reports...</Text>
//         </View>
//       </_ScreenLayout>
//     );
//   }

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
//         <_ScreenLayout
//             header="Illegal Dumping Reports"
//             headerAlign="left"
//             description="View all illegal dumping reports"
//             showBackButton={true}
//             showExitButton={false}
//             customLeftAction={
//                 <TouchableOpacity onPress={() => router.back()}>
//                 <ChevronLeft size={24} color="black" />
//                 </TouchableOpacity>
//             }
//             scrollable={true}
//             keyboardAvoiding={true}
//             contentPadding="medium"
//         >
//             {/* Search and Filters */}
//             <View className="mb-4">
//                 <View className="flex-row items-center gap-2 mb-3">
//                 <View className="relative flex-1">
//                     <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//                     <TextInput
//                     placeholder="Search reports..."
//                     className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//                     value={searchQuery}
//                     onChangeText={setSearchQuery}
//                     />
//                 </View>
//                 </View>

//                 <View className="mb-3">
//                     <SelectLayout
//                     options={filterOptions}
//                     selectedValue={selectedFilterId}
//                     onSelect={(option) => setSelectedFilterId(option.value)}  // Extract just the value
//                     placeholder="Filter by matter"
//                     className="bg-white"
//                     />
//                 </View>
//             </View>

//             {/* Reports List */}
//             <FlatList
//                 data={filteredData}
//                 renderItem={renderItem}
//                 keyExtractor={item => item.rep_id.toString()}
//                 scrollEnabled={false} 
//                 keyboardShouldPersistTaps="handled"
//                 ListEmptyComponent={
//                 <Text className="text-center text-gray-500 py-4">
//                     No reports found
//                 </Text>
//                 }
//             />

//             {/* Report Details Modal */}
//             <Modal
//                 visible={viewDetailsModalVisible}
//                 transparent={false}
//                 animationType="slide"
//                 onRequestClose={() => setViewDetailsModalVisible(false)}
//             >
//                 {selectedReport && (
//                 <_ScreenLayout
//                     header={`Report #${selectedReport.rep_id}`}
//                     headerAlign="left"
//                     showBackButton={true}
//                     showExitButton={false}
//                     customLeftAction={
//                     <TouchableOpacity onPress={() => setViewDetailsModalVisible(false)}>
//                         <ChevronLeft size={24} color="black" />
//                     </TouchableOpacity>
//                     }
//                     scrollable={true}
//                 >
//                     <View className="space-y-4">
//                     <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Status:</Text>
//                         <Text className={selectedReport.rep_status === "resolved" ? "text-green-600" : "text-yellow-600"}>
//                         {selectedReport.rep_status}
//                         </Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Report Matter:</Text>
//                         <Text>{selectedReport.rep_matter}</Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Location:</Text>
//                         <Text>{selectedReport.rep_location}</Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Sitio:</Text>
//                         <Text>{selectedReport.sitio_name || "N/A"}</Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Violator:</Text>
//                         <Text>{selectedReport.rep_violator}</Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Complainant:</Text>
//                         <Text>{selectedReport.rep_anonymous ? "Anonymous" : selectedReport.rep_complainant}</Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Contact:</Text>
//                         <Text>{selectedReport.rep_contact || "N/A"}</Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Date Reported:</Text>
//                         <Text>{new Date(selectedReport.rep_date).toLocaleDateString()}</Text>
//                     </View>
//                     {selectedReport.rep_date_resolved && (
//                         <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Date Resolved:</Text>
//                         <Text>{new Date(selectedReport.rep_date_resolved).toLocaleDateString()}</Text>
//                         </View>
//                     )}
//                     <View>
//                         <Text className="text-gray-600">Additional Details:</Text>
//                         <Text>{selectedReport.rep_add_details || "None provided"}</Text>
//                     </View>
                    
//                     {/* Display attached images */}
//                     {selectedReport.waste_report_file?.length > 0 && (
//                         <View className="mt-4">
//                         <Text className="text-gray-600 mb-2">Attached Images:</Text>
//                         <ScrollView horizontal className="py-2">
//                             {selectedReport.waste_report_file.map((file, index) => (
//                             <TouchableOpacity 
//                                 key={index} 
//                                 className="mr-2"
//                                 onPress={() => {
//                                 // You could implement a full-screen image viewer here
//                                 }}
//                             >
//                                 <Image
//                                 source={{ uri: file.wrf_url }}
//                                 className="w-24 h-24 rounded-md"
//                                 resizeMode="cover"
//                                 />
//                             </TouchableOpacity>
//                             ))}
//                         </ScrollView>
//                         </View>
//                     )}
//                     </View>
//                 </_ScreenLayout>
//                 )}
//             </Modal>
//         </_ScreenLayout>
//     </TouchableWithoutFeedback>
    
//   );
// };

// export default WasteIllegalDumpingMainStaff;









// import React, { useState } from 'react';
// import { View, Text, TextInput, Pressable, ActivityIndicator, FlatList, ScrollView } from 'react-native';
// import { Search, CheckCircle } from 'lucide-react-native';
// // import { useWasteReport, type WasteReport } from './queries/waste-ReportGetQueries';
// import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { SelectLayout } from '@/components/ui/select-layout';



// export default function WasteIllegalDumping() {
//   const { data: fetchedData = [], isLoading } = useWasteReport();
//   const [selectedFilterId, setSelectedFilterId] = useState("0");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
//   const [showDetails, setShowDetails] = useState(false);

//   const filterOptions = [
//     { id: "0", name: "All Report Matter" },
//     { id: "1", name: "Littering, Illegal dumping, Illegal disposal of garbage" },
//     { id: "2", name: "Urinating, defecating, spitting in a public place" },
//     { id: "3", name: "Dirty frontage and immediate surroundings for establishment owners" },
//     { id: "4", name: "Improper and untimely stacking of garbage outside residences or establishment" },
//     { id: "5", name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)" },
//     { id: "6", name: "Dirty public utility vehicles, or no trash can or receptacle" },
//     { id: "7", name: "Spilling, scattering, littering of wastes by public utility vehicles" },
//     { id: "8", name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads." },
//   ];

//   // Filter data based on filter and search query
//   const filteredData = React.useMemo(() => {
//     let result = fetchedData;

//     if (selectedFilterId !== "0") {
//       const selectedFilterName = filterOptions.find(option => option.id === selectedFilterId)?.name || "";
//       result = result.filter(item => 
//         item.rep_matter.trim().toLowerCase() === selectedFilterName.trim().toLowerCase()
//       );
//     }

//     if (searchQuery) {
//       result = result.filter(item =>
//         Object.values(item)
//           .join(" ")
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase())
//       );
//     }

//     return result;
//   }, [fetchedData, selectedFilterId, searchQuery]);

//   const renderReportCard = (item: WasteReport) => (
//     <View key={item.rep_id} className="mb-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
//       <View className="flex-row justify-between items-start mb-2">
//         <Text className="font-semibold text-lg">Report #{item.rep_id}</Text>
//         <View className="flex-row items-center">
//           {item.rep_status === "resolved" ? (
//             <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
//               <CheckCircle size={12} color="#22c55e" />
//               <Text className="text-green-600 text-xs font-medium ml-1">Resolved</Text>
//             </View>
//           ) : (
//             <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
//               <Text className="text-yellow-600 text-xs font-medium">Pending</Text>
//             </View>
//           )}
//         </View>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium text-gray-600">Matter:</Text>
//         <Text className="text-base">{item.rep_matter}</Text>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium text-gray-600">Location:</Text>
//         <Text className="text-base">{item.rep_location}</Text>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium text-gray-600">Complainant:</Text>
//         <Text className="text-base">
//           {item.rep_anonymous ? "Anonymous" : item.rep_complainant}
//         </Text>
//       </View>

//       <Pressable
//         onPress={() => {
//           setSelectedReport(item);
//           setShowDetails(true);
//         }}
//         className="mt-3 bg-blue-50 py-2 px-4 rounded-lg self-start"
//       >
//         <Text className="text-blue-600 font-medium">View Details</Text>
//       </Pressable>
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#2a3a61" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
//         {/* Header */}
//         <View className="px-4 pt-4">
//           <Text className="font-bold text-xl text-[#1a2332] mb-1">
//             Illegal Dumping Reports
//           </Text>
//           <Text className="text-sm text-gray-500 mb-4">
//             Manage and view illegal dumping reports
//           </Text>
//           <View className="h-0.5 bg-gray-200 mb-4" />
//         </View>

//         {/* Search and Filter */}
//         <View className="px-4 mb-4">
//             <View className="relative mb-3">
//                 <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//                 <TextInput
//                     placeholder="Search..."
//                     value={searchQuery}
//                     onChangeText={setSearchQuery}
//                     className="pl-3 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//                 />
//             </View>

//             <SelectLayout
//                 placeholder="Select report matter"
//                 options={filterOptions.map(({ id, name }) => ({ value: id, label: name }))}
//                 selectedValue={selectedFilterId}
//                 onSelect={(option) => setSelectedFilterId(option.value)}
//                 className="bg-white"
//             />
//         </View>

//         {/* Reports Count */}
//         <View className="px-4 mb-2">
//           <Text className="text-sm text-gray-500">
//             {filteredData.length} report{filteredData.length !== 1 ? 's' : ''} found
//           </Text>
//         </View>

//         {/* Reports List */}
//         <View className="px-4">
//           <FlatList
//             data={filteredData}
//             renderItem={({ item }) => renderReportCard(item)}
//             keyExtractor={item => item.rep_id.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <View className="py-8 items-center">
//                 <Text className="text-gray-500 text-center">No reports found</Text>
//               </View>
//             }
//           />
//         </View>
//       </ScrollView>

//     </SafeAreaView>
//   );
// }





//LATEST BUT NO SCREENLAYOUT
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
// } from 'react-native';
// import { Search, CheckCircle } from 'lucide-react-native';
// import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { SelectLayout } from '@/components/ui/select-layout';
// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
// } from '@/components/ui/tabs';

// export default function WasteIllegalDumping() {
//   const { data: fetchedData = [], isLoading } = useWasteReport();
//   const [selectedFilterId, setSelectedFilterId] = useState("0");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

//   const filterOptions = [
//     { id: "0", name: "All Report Matter" },
//     { id: "1", name: "Littering, Illegal dumping, Illegal disposal of garbage" },
//     { id: "2", name: "Urinating, defecating, spitting in a public place" },
//     { id: "3", name: "Dirty frontage and immediate surroundings for establishment owners" },
//     { id: "4", name: "Improper and untimely stacking of garbage outside residences or establishment" },
//     { id: "5", name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)" },
//     { id: "6", name: "Dirty public utility vehicles, or no trash can or receptacle" },
//     { id: "7", name: "Spilling, scattering, littering of wastes by public utility vehicles" },
//     { id: "8", name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads." },
//   ];

//   const filteredData = React.useMemo(() => {
//     let result = fetchedData;

//     // Filter by tab
//     result = result.filter((item) =>
//       activeTab === 'pending' ? item.rep_status !== 'resolved' : item.rep_status === 'resolved'
//     );

//     if (selectedFilterId !== "0") {
//       const selectedFilterName = filterOptions.find(option => option.id === selectedFilterId)?.name || "";
//       result = result.filter(item =>
//         item.rep_matter.trim().toLowerCase() === selectedFilterName.trim().toLowerCase()
//       );
//     }

//     if (searchQuery) {
//       result = result.filter(item =>
//         Object.values(item).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     return result;
//   }, [fetchedData, selectedFilterId, searchQuery, activeTab]);

//   const renderReportCard = (item: WasteReport) => (
//     <View key={item.rep_id} className="mb-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
//       <View className="flex-row justify-between items-start mb-2">
//         <Text className="font-semibold text-lg">Report #{item.rep_id}</Text>
//         <View className="flex-row items-center">
//           {item.rep_status === "resolved" ? (
//             <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
//               <CheckCircle size={12} color="#22c55e" />
//               <Text className="text-green-600 text-xs font-medium ml-1">Resolved</Text>
//             </View>
//           ) : (
//             <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
//               <Text className="text-yellow-600 text-xs font-medium">Pending</Text>
//             </View>
//           )}
//         </View>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium text-gray-600">Matter:</Text>
//         <Text className="text-base">{item.rep_matter}</Text>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium text-gray-600">Location:</Text>
//         <Text className="text-base">{item.rep_location}</Text>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium text-gray-600">Complainant:</Text>
//         <Text className="text-base">
//           {item.rep_anonymous ? "Anonymous" : item.rep_complainant}
//         </Text>
//       </View>

//       <Pressable
//         onPress={() => {
//           setSelectedReport(item);
//           setShowDetails(true);
//         }}
//         className="mt-3 bg-blue-50 py-2 px-4 rounded-lg self-start"
//       >
//         <Text className="text-blue-600 font-medium">View Details</Text>
//       </Pressable>
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#2a3a61" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
//         <View className="px-4 pt-4">
//           <Text className="font-bold text-xl text-[#1a2332] mb-1">Illegal Dumping Reports</Text>
//           <Text className="text-sm text-gray-500 mb-4">Manage and view illegal dumping reports</Text>
//           <View className="h-0.5 bg-gray-200 mb-4" />
//         </View>

//         <View className="px-4 mb-4">
//           <View className="relative mb-3">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               className="pl-3 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//             />
//           </View>

//           <SelectLayout
//             placeholder="Select report matter"
//             options={filterOptions.map(({ id, name }) => ({ value: id, label: name }))}
//             selectedValue={selectedFilterId}
//             onSelect={(option) => setSelectedFilterId(option.value)}
//             className="bg-white"
//           />
//         </View>

//         <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'pending' | 'resolved')}>
//           <TabsList className="bg-blue-50 mb-5 mt-2 flex-row justify-between">
//             <TabsTrigger
//               value="pending"
//               className={`flex-1 mx-1 ${activeTab === 'pending' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//             >
//               <Text className={`${activeTab === 'pending' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Pending</Text>
//             </TabsTrigger>
//             <TabsTrigger
//               value="resolved"
//               className={`flex-1 mx-1 ${activeTab === 'resolved' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//             >
//               <Text className={`${activeTab === 'resolved' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Resolved</Text>
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="pending">
//             <View className="px-4 mb-2">
//               <Text className="text-sm text-gray-500">{filteredData.length} report{filteredData.length !== 1 ? 's' : ''} found</Text>
//             </View>
//             <View className="px-4">
//               <FlatList
//                 data={filteredData}
//                 renderItem={({ item }) => renderReportCard(item)}
//                 keyExtractor={(item) => item.rep_id.toString()}
//                 scrollEnabled={false}
//                 ListEmptyComponent={
//                   <View className="py-8 items-center">
//                     <Text className="text-gray-500 text-center">No reports found</Text>
//                     <Text className="text-gray-400 text-center mt-1">Try adjusting your search or filter criteria</Text>
//                   </View>
//                 }
//               />
//             </View>
//           </TabsContent>

//           <TabsContent value="resolved">
//             <View className="px-4 mb-2">
//               <Text className="text-sm text-gray-500">{filteredData.length} report{filteredData.length !== 1 ? 's' : ''} found</Text>
//             </View>
//             <View className="px-4">
//               <FlatList
//                 data={filteredData}
//                 renderItem={({ item }) => renderReportCard(item)}
//                 keyExtractor={(item) => item.rep_id.toString()}
//                 scrollEnabled={false}
//                 ListEmptyComponent={
//                   <View className="py-8 items-center">
//                     <Text className="text-gray-500 text-center">No reports found</Text>
//                     <Text className="text-gray-400 text-center mt-1">Try adjusting your search or filter criteria</Text>
//                   </View>
//                 }
//               />
//             </View>
//           </TabsContent>
//         </Tabs>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }







// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   ActivityIndicator,
//   FlatList,
//   TouchableOpacity,
// } from 'react-native';
// import { Search, CheckCircle, ChevronLeft } from 'lucide-react-native';
// import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { router } from 'expo-router';

// export default function WasteIllegalDumping() {
//   const { data: fetchedData = [], isLoading } = useWasteReport();
//   const [selectedFilterId, setSelectedFilterId] = useState("0");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

//   const filterOptions = [
//     { id: "0", name: "All Report Matter" },
//     { id: "1", name: "Littering, Illegal dumping, Illegal disposal of garbage" },
//     { id: "2", name: "Urinating, defecating, spitting in a public place" },
//     { id: "3", name: "Dirty frontage and immediate surroundings for establishment owners" },
//     { id: "4", name: "Improper and untimely stacking of garbage outside residences or establishment" },
//     { id: "5", name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)" },
//     { id: "6", name: "Dirty public utility vehicles, or no trash can or receptacle" },
//     { id: "7", name: "Spilling, scattering, littering of wastes by public utility vehicles" },
//     { id: "8", name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads." },
//   ];

//   const filteredData = React.useMemo(() => {
//     let result = fetchedData;

//     // Filter by tab
//     result = result.filter((item) =>
//       activeTab === 'pending' ? item.rep_status !== 'resolved' : item.rep_status === 'resolved'
//     );

//     if (selectedFilterId !== "0") {
//       const selectedFilterName = filterOptions.find(option => option.id === selectedFilterId)?.name || "";
//       result = result.filter(item =>
//         item.rep_matter.trim().toLowerCase() === selectedFilterName.trim().toLowerCase()
//       );
//     }

//     if (searchQuery) {
//       result = result.filter(item =>
//         Object.values(item).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     return result;
//   }, [fetchedData, selectedFilterId, searchQuery, activeTab]);

//   const renderReportCard = (item: WasteReport) => (
//     <View key={item.rep_id} className="mb-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
//       <View className="flex-row justify-between items-start mb-3">
//         <Text className="font-semibold text-xl">Report #{item.rep_id}</Text>
//         <View className="flex-row items-center">
//           {item.rep_status === "resolved" ? (
//             <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
//               <CheckCircle size={12} color="#22c55e" />
//               <Text className="text-green-600 text-xs font-medium ml-1">Resolved</Text>
//             </View>
//           ) : (
//             <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
//               <Text className="text-yellow-600 text-sm font-medium">Pending</Text>
//             </View>
//           )}
//         </View>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium">Matter:</Text>
//         <Text className="text-base">{item.rep_matter}</Text>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium">Location:</Text>
//         <Text className="text-base">{item.rep_location}</Text>
//       </View>

//       <View className="mb-2">
//         <Text className="text-base font-medium">Complainant:</Text>
//         <Text className="text-base">
//           {item.rep_anonymous ? "Anonymous" : item.rep_complainant}
//         </Text>
//       </View>

//       <Pressable
//         onPress={() => {
//           setSelectedReport(item);
//           setShowDetails(true);
//         }}
//         className="mt-3 bg-blue-50 py-2 px-4 rounded-lg self-start"
//       >
//         <Text className="text-primaryBlue font-medium">View Details</Text>
//       </Pressable>
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <_ScreenLayout>
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" color="#2a3a61" />
//         </View>
//       </_ScreenLayout>
//     );
//   }

//   return (
//     <_ScreenLayout 
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={30} className="text-black" />
//         </TouchableOpacity>
//       }
//       headerBetweenAction={<Text className="text-[13px]">Illegal Dumping Reports</Text>}
//       showExitButton={false}
//     >
//       <View className="mb-4">
//         <View className="relative mb-3">
//           <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//           <TextInput
//             placeholder="Search..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             className="pl-3 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//           />
//         </View>

//         <SelectLayout
//           placeholder="Select report matter"
//           options={filterOptions.map(({ id, name }) => ({ value: id, label: name }))}
//           selectedValue={selectedFilterId}
//           onSelect={(option) => setSelectedFilterId(option.value)}
//           className="bg-white"
//         />
//       </View>

//       <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'pending' | 'resolved')}>
//         <TabsList className="bg-blue-50 mb-5 mt-2 flex-row justify-between">
//           <TabsTrigger
//             value="pending"
//             className={`flex-1 mx-1 ${activeTab === 'pending' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <Text className={`${activeTab === 'pending' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Pending</Text>
//           </TabsTrigger>
//           <TabsTrigger
//             value="resolved"
//             className={`flex-1 mx-1 ${activeTab === 'resolved' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <Text className={`${activeTab === 'resolved' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Resolved</Text>
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="pending">
//           <View className="mb-2">
//             <Text className="text-sm text-gray-500">{filteredData.length} report{filteredData.length !== 1 ? 's' : ''} found</Text>
//           </View>
//           <View>
//             <FlatList
//               data={filteredData}
//               renderItem={({ item }) => renderReportCard(item)}
//               keyExtractor={(item) => item.rep_id.toString()}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <View className="py-8 items-center">
//                   <Text className="text-gray-500 text-center">No reports found</Text>
//                 </View>
//               }
//             />
//           </View>
//         </TabsContent>

//         <TabsContent value="resolved">
//           <View className="mb-2">
//             <Text className="text-sm text-gray-500">{filteredData.length} report{filteredData.length !== 1 ? 's' : ''} found</Text>
//           </View>
//           <View>
//             <FlatList
//               data={filteredData}
//               renderItem={({ item }) => renderReportCard(item)}
//               keyExtractor={(item) => item.rep_id.toString()}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <View className="py-8 items-center">
//                   <Text className="text-gray-500 text-center">No reports found</Text>
//                 </View>
//               }
//             />
//           </View>
//         </TabsContent>
//       </Tabs>
//     </_ScreenLayout>
//   );
// }









import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Search, CheckCircle, ChevronLeft, SquareArrowOutUpRight  } from 'lucide-react-native';
import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
import { SelectLayout } from '@/components/ui/select-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { router } from 'expo-router';

export default function WasteIllegalDumping() {
  const { data: fetchedData = [], isLoading } = useWasteReport();
  const [selectedFilterId, setSelectedFilterId] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

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

  const filteredData = React.useMemo(() => {
    let result = fetchedData;

    // Filter by tab
    result = result.filter((item) =>
      activeTab === 'pending' ? item.rep_status !== 'resolved' : item.rep_status === 'resolved'
    );

    if (selectedFilterId !== "0") {
      const selectedFilterName = filterOptions.find(option => option.id === selectedFilterId)?.name || "";
      result = result.filter(item =>
        item.rep_matter.trim().toLowerCase() === selectedFilterName.trim().toLowerCase()
      );
    }

    if (searchQuery) {
      result = result.filter(item =>
        Object.values(item).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [fetchedData, selectedFilterId, searchQuery, activeTab]);

    const handleView = async (item: any) => {
        router.push({
            pathname: '/(waste)/illegal-dumping/staff/illegal-dump-view-staff',
            params: {
                rep_id: item.rep_id,
                rep_matter: item.rep_matter,
                rep_location: item.rep_location,
                sitio_name: item.sitio_name,
                rep_violator: item.rep_violator,
                rep_complainant: item.rep_complainant,
                rep_contact: item.rep_contact,
                rep_status: item.rep_status,
                rep_date: item.rep_date,
                rep_date_resolved: item.rep_date_resolved,
                rep_anonymous: item.rep_anonymous,
                rep_add_details: item.rep_add_details,
                waste_report_file: JSON.stringify(item.waste_report_file || []),
                waste_report_rslv_file: JSON.stringify(item.waste_report_rslv_file || [])
            }
        });
    };

  const renderReportCard = (item: WasteReport) => (
    <Pressable
      key={item.rep_id}
      onPress={() => handleView(item)}
      className="mb-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm active:opacity-80"
    >
      <View className="flex-row justify-between items-start mb-3">
        <Text className="font-semibold text-xl">Report #{item.rep_id}</Text>
        <View className="flex-row items-center">
          {item.rep_status === "resolved" ? (
            <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle size={12} color="#22c55e" />
              <Text className="text-green-600 text-sm font-medium ml-1">Resolved</Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
              <Text className="text-yellow-600 text-sm font-medium">Pending</Text>
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

      <View>
        <Text className="text-base font-semibold">Complainant:</Text>
        <Text className="text-base">
          {item.rep_anonymous ? "Anonymous" : item.rep_complainant}
        </Text>
      </View>

      <View className="self-end">
        <SquareArrowOutUpRight size={16} color="#00A8F0"/>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <_ScreenLayout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
        </View>
      </_ScreenLayout>
    );
  }

  return (
    <_ScreenLayout 
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Illegal Dumping Reports</Text>}
      showExitButton={false}
    >
      <View className="mb-4">
        <View className="relative mb-3">
          <Search className="absolute left-3 top-3 text-gray-500" size={17} />
          <TextInput
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="pl-3 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
          />
        </View>

        <SelectLayout
          placeholder="Select report matter"
          options={filterOptions.map(({ id, name }) => ({ value: id, label: name }))}
          selectedValue={selectedFilterId}
          onSelect={(option) => setSelectedFilterId(option.value)}
          className="bg-white"
        />
      </View>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'pending' | 'resolved')}>
        <TabsList className="bg-blue-50 mb-5 mt-2 flex-row justify-between">
          <TabsTrigger
            value="pending"
            className={`flex-1 mx-1 ${activeTab === 'pending' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
          >
            <Text className={`${activeTab === 'pending' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Pending</Text>
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className={`flex-1 mx-1 ${activeTab === 'resolved' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
          >
            <Text className={`${activeTab === 'resolved' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Resolved</Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <View className="mb-2">
            <Text className="text-sm text-gray-500">{filteredData.length} report{filteredData.length !== 1 ? 's' : ''} found</Text>
          </View>
          <View>
            <FlatList
              data={filteredData}
              renderItem={({ item }) => renderReportCard(item)}
              keyExtractor={(item) => item.rep_id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center">No reports found</Text>
                </View>
              }
            />
          </View>
        </TabsContent>

        <TabsContent value="resolved">
          <View className="mb-2">
            <Text className="text-sm text-gray-500">{filteredData.length} report{filteredData.length !== 1 ? 's' : ''} found</Text>
          </View>
          <View>
            <FlatList
              data={filteredData}
              renderItem={({ item }) => renderReportCard(item)}
              keyExtractor={(item) => item.rep_id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center">No reports found</Text>
                </View>
              }
            />
          </View>
        </TabsContent>
      </Tabs>
    </_ScreenLayout>
  );
}