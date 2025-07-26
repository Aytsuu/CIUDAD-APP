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
//   Search,
//   Plus,
//   Archive,
//   Pencil,
//   Eye,
//   Trash,
//   ArchiveRestore,
//   FileInput,
//   CircleAlert,
//   ChevronLeft,
//   X,
//   ArrowUpDown
// } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
// import { useDeleteResolution } from './queries/resolution-delete-queries';
// import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';

// function ResolutionPage() {
//   const router = useRouter();
//   const [isDialogOpen, setIsDialogOpen] = useState(false); 
//   const [editingRowId, setEditingRowId] = useState<number | null>(null);
//   const [activeTab, setActiveTab] = useState("active");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Fetch mutation
//   const { data: resolutionData = [], isLoading, isError } = useResolution();

//   // Delete mutation
//   const { mutate: deleteRes, isPending: isDeletePending } = useDeleteResolution();

//   // Archive / Restore mutation
//   const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreResolution();

//   const filterOptions = [
//     { id: "all", name: "All" },
//     { id: "council", name: "Council" },
//     { id: "waste", name: "Waste Committee" },
//     { id: "gad", name: "GAD" },
//     { id: "finance", name: "Finance" }
//   ];
//   const [filter, setFilter] = useState<string>("all");

//   // Filter data based on active/archive tab, search query, and filter
//   const filteredData = React.useMemo(() => {
//     let result = resolutionData.filter(row => 
//       activeTab === "active" ? row.res_is_archive === false : row.res_is_archive === true
//     );

//     if (filter !== "all") {
//       result = result.filter(record => record.res_area_of_focus.includes(filter));
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
//   }, [resolutionData, activeTab, filter, searchQuery]);

//   const totalPages = Math.ceil(filteredData.length / pageSize);
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const handleDelete = (res_num: number) => {
//     deleteRes(res_num);
//   };

//   const handleArchive = (res_num: number) => {
//     archiveRestore({
//       res_num,
//       res_is_archive: true
//     });
//   };

//   const handleRestore = (res_num: number) => {
//     archiveRestore({
//       res_num,
//       res_is_archive: false
//     });
//   };

//   const handleViewFiles = (files: any[]) => {
//     setSelectedFiles(files);
//     setCurrentIndex(0);
//     setViewFilesModalVisible(true);
//   };

//   const handleCreate = () => {
//     setIsDialogOpen(true);
//   };

//   const handleEdit = (item: ResolutionData) => {
//     setEditingRowId(item.res_num);
//   };

//   const renderItem = ({ item }: { item: ResolutionData }) => (
//     <Card className="mb-4 border border-gray-200">
//       <CardHeader className="flex-row justify-between items-center">
//         <CardTitle className="text-lg text-[#2a3a61]">
//           Resolution #{item.res_num}
//         </CardTitle>
//         {activeTab === 'active' ? (
//           <View className="flex-row gap-1">
//             <TouchableOpacity 
//               onPress={() => {
//                 if (item.resolution_files?.[0]?.rf_url) {
//                   handleViewFiles([{ 
//                     ief_url: item.resolution_files[0].rf_url,
//                     ief_name: `Resolution ${item.res_num}` 
//                   }]);
//                 }
//               }} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Eye size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               onPress={() => handleEdit(item)} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Pencil size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Archive size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//               }
//               title="Archive Resolution"
//               description="This resolution will be archived and removed from the active list. Do you wish to proceed?"
//               actionLabel="Confirm"
//               onPress={() => handleArchive(item.res_num)}
//             />
//           </View>
//         ) : (
//           <View className="flex-row gap-1">
//             <TouchableOpacity 
//               onPress={() => {
//                 if (item.resolution_files?.[0]?.rf_url) {
//                   handleViewFiles([{ 
//                     ief_url: item.resolution_files[0].rf_url,
//                     ief_name: `Resolution ${item.res_num}` 
//                   }]);
//                 }
//               }} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Eye size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
//                   <ArchiveRestore size={16} color="#15803d"/>
//                 </TouchableOpacity>
//               }
//               title="Restore Archived Resolution"
//               description="Would you like to restore this resolution from the archive and make it active again?"
//               actionLabel="confirm"
//               onPress={() => handleRestore(item.res_num)}
//             />
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Trash size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//               }
//               title="Confirm Delete"
//               description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
//               actionLabel="confirm"
//               onPress={() => handleDelete(item.res_num)}
//             />
//           </View>
//         )}
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Title:</Text>
//           <Text>{item.res_title}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Date Approved:</Text>
//           <Text>{item.res_date_approved}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Area of Focus:</Text>
//           <Text>{item.res_area_of_focus.join(', ')}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Documents:</Text>
//           {item.resolution_supp?.length > 0 ? (
//             <TouchableOpacity onPress={() => handleViewFiles(item.resolution_supp)}>
//               <Text className="text-blue-600 underline">{item.resolution_supp.length} attached</Text>
//             </TouchableOpacity>
//           ) : (
//             <View className="flex-row items-center">
//               <CircleAlert size={16} color="#ff2c2c" />
//               <Text className="text-red-500 ml-1">No document</Text>
//             </View>
//           )}
//         </View>
//       </CardContent>
//     </Card>
//   );


//   if (isError) {
//     return (
//       <_ScreenLayout
//         header={<Text className="text-xl font-semibold">Resolution Record</Text>}
//       >
//         <Text className="text-red-500 text-center py-4">Error loading resolutions</Text>
//       </_ScreenLayout>
//     );
//   }

//   return (
//     <_ScreenLayout
//       header={
//         <View>
//           <Text className="font-semibold text-2xl  text-darkBlue2">
//             Resolution Record
//           </Text>
//           <Text className="text-md text-darkGray">
//             Manage and view resolution information
//           </Text>
//         </View>
//       }
//       headerAlign="left"
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
//       loading={isArchivePending || isDeletePending || isLoading}
//       loadingMessage={
//         isArchivePending ? "Updating resolution..." : 
//         isDeletePending ? "Deleting resolution..." : 
//         "Loading resolutions..."
//       }
//     >
//       {/* Search and Filters */}
//       <View className="mb-4">
//         <View className="flex-row items-center gap-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={(text) => {
//                 setSearchQuery(text);
//                 setCurrentPage(1);
//               }}
//             />
//           </View>

//           <View className="w-[120px]">
//                 <SelectLayout
//                     options={filterOptions.map(f => ({ label: f.name, value: f.id }))}
//                     className="h-8"
//                     selectedValue={filter}
//                     onSelect={(option) => {
//                         setFilter(option.value);  // Extract the value from the option
//                         setCurrentPage(1);
//                     }}
//                     placeholder="Filter"
//                     isInModal={false}
//                 />
//           </View>
//         </View>

//         <TouchableOpacity
//           onPress={handleCreate}
//           className="bg-primaryBlue mt-3"
//         >
//           <Text className="text-white text-[17px]">
//              Create
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
//           <TabsTrigger 
//             value="active" 
//             className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//               Active
//             </Text>
//           </TabsTrigger>
//           <TabsTrigger 
//             value="archive"
//             className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <View className="flex-row items-center justify-center">
//               <Archive 
//                 size={16} 
//                 className="mr-1" 
//                 color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//               />
//               <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                 Archive
//               </Text>
//             </View>
//           </TabsTrigger>
//         </TabsList>

//         {/* Active Resolutions */}
//         <TabsContent value="active">
//           <FlatList
//             data={paginatedData.filter(row => row.res_is_archive === false)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-center text-gray-500 py-4">
//                 No active resolutions found
//               </Text>
//             }
//           />
//         </TabsContent>

//         {/* Archived Resolutions */}
//         <TabsContent value="archive">
//           <FlatList
//             data={paginatedData.filter(row => row.res_is_archive === true)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-center text-gray-500 py-4">
//                 No archived resolutions found
//               </Text>
//             }
//           />
//         </TabsContent>
//       </Tabs>

//       {/* Pagination */}
//       <View className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//         <Text className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//           Showing {(currentPage - 1) * pageSize + 1}-
//           {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//           {filteredData.length} rows
//         </Text>
//         {filteredData.length > 0 && (
//           <View className="flex-row gap-2">
//             <Button
//               onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className={`px-3 py-1 ${currentPage === 1 ? 'bg-gray-300' : 'bg-primaryBlue'}`}
//             >
//               <Text className="text-white">Previous</Text>
//             </Button>
//             <Button
//               onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className={`px-3 py-1 ${currentPage === totalPages ? 'bg-gray-300' : 'bg-primaryBlue'}`}
//             >
//               <Text className="text-white">Next</Text>
//             </Button>
//           </View>
//         )}
//       </View>

//       {/* Create Resolution Modal */}
//       <Modal
//         visible={isDialogOpen}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setIsDialogOpen(false)}
//       >
//         <View className="flex-1 p-4">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-semibold">Resolution Details</Text>
//             <TouchableOpacity onPress={() => setIsDialogOpen(false)}>
//               <X size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <Text className="text-gray-600 mb-4">Add details.</Text>
          
//           <ScrollView className="flex-1">
//             {/* AddResolution component would go here */}
//             {/* You'll need to implement this component separately */}
//             <View className="border border-gray-300 p-4 rounded-lg">
//               <Text className="text-center text-gray-500">
//                 Add Resolution Form would appear here
//               </Text>
//             </View>
//           </ScrollView>
          
//           <View className="flex-row justify-end gap-2 mt-4">
//             <Button
//               onPress={() => setIsDialogOpen(false)}
//               className="bg-gray-300 px-4 py-2"
//             >
//               <Text>Cancel</Text>
//             </Button>
//             <Button
//               onPress={() => {
//                 // Handle form submission
//                 setIsDialogOpen(false);
//               }}
//               className="bg-primaryBlue px-4 py-2"
//             >
//               <Text className="text-white">Submit</Text>
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       {/* Edit Resolution Modal */}
//       <Modal
//         visible={!!editingRowId}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setEditingRowId(null)}
//       >
//         <View className="flex-1 p-4">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-semibold">Update Resolution</Text>
//             <TouchableOpacity onPress={() => setEditingRowId(null)}>
//               <X size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <Text className="text-gray-600 mb-4">Update the resolution details.</Text>
          
//           <ScrollView className="flex-1">
//             {/* EditResolution component would go here */}
//             {/* You'll need to implement this component separately */}
//             <View className="border border-gray-300 p-4 rounded-lg">
//               <Text className="text-center text-gray-500">
//                 Edit Resolution Form would appear here
//               </Text>
//             </View>
//           </ScrollView>
          
//           <View className="flex-row justify-end gap-2 mt-4">
//             <Button
//               onPress={() => setEditingRowId(null)}
//               className="bg-gray-300 px-4 py-2"
//             >
//               <Text>Cancel</Text>
//             </Button>
//             <Button
//               onPress={() => {
//                 // Handle form submission
//                 setEditingRowId(null);
//               }}
//               className="bg-primaryBlue px-4 py-2"
//             >
//               <Text className="text-white">Update</Text>
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       {/* View Files Modal */}
//       <Modal
//         visible={viewFilesModalVisible}
//         transparent={true}
//         onRequestClose={() => {
//           setViewFilesModalVisible(false);
//           setCurrentZoomScale(1);
//         }}
//       >
//         <View className="flex-1 bg-black/90">
//           {/* Header with close button and file name */}
//           <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
//             <Text className="text-white text-lg font-medium w-[90%]">
//               {selectedFiles[currentIndex]?.rsd_name || 'Document'}
//             </Text>
//             <TouchableOpacity 
//               onPress={() => {
//                 setViewFilesModalVisible(false);
//                 setCurrentZoomScale(1);
//               }}
//             >
//               <X size={24} color="white" />
//             </TouchableOpacity>
//           </View>

//           {/* Image with zoom capability */}
//           <ScrollView
//             className="flex-1"
//             maximumZoomScale={3}
//             minimumZoomScale={1}
//             zoomScale={currentZoomScale}
//             onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
//             contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
//           >
//             <Image
//               source={{ uri: selectedFiles[currentIndex]?.rsd_url }}
//               style={{ width: '100%', height: 400 }}
//               resizeMode="contain"
//             />
//           </ScrollView>

//           {/* Pagination indicators at the bottom */}
//           {selectedFiles.length > 1 && (
//             <View className="absolute bottom-4 left-0 right-0 items-center">
//               <View className="flex-row bg-black/50 rounded-full px-3 py-1">
//                 {selectedFiles.map((_, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     onPress={() => {
//                       setCurrentIndex(index);
//                       setCurrentZoomScale(1);
//                     }}
//                     className="p-1"
//                   >
//                     <View 
//                       className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Navigation arrows for multiple files */}
//           {selectedFiles.length > 1 && (
//             <>
//               {currentIndex > 0 && (
//                 <TouchableOpacity
//                   className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev - 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronLeft size={24} color="white" />
//                 </TouchableOpacity>
//               )}
//               {currentIndex < selectedFiles.length - 1 && (
//                 <TouchableOpacity
//                   className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev + 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronLeft size={24} color="white" className="rotate-180" />
//                 </TouchableOpacity>
//               )}
//             </>
//           )}
//         </View>
//       </Modal>
//     </_ScreenLayout>
//   );
// }

// export default ResolutionPage;











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
//   ActivityIndicator,
//   Linking,
//   Alert
// } from 'react-native';
// import {
//   Search,
//   Plus,
//   Archive,
//   Pencil,
//   Eye,
//   Trash,
//   ArchiveRestore,
//   FileInput,
//   CircleAlert,
//   ChevronLeft,
//   X,
//   ArrowUpDown
// } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
// import { useDeleteResolution } from './queries/resolution-delete-queries';
// import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';

// function ResolutionPage() {
//   const router = useRouter();
//   const [isDialogOpen, setIsDialogOpen] = useState(false); 
//   const [editingRowId, setEditingRowId] = useState<number | null>(null);
//   const [activeTab, setActiveTab] = useState("active");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Fetch mutation
//   const { data: resolutionData = [], isLoading, isError } = useResolution();

//   // Delete mutation
//   const { mutate: deleteRes, isPending: isDeletePending } = useDeleteResolution();

//   // Archive / Restore mutation
//   const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreResolution();

//   const filterOptions = [
//     { id: "all", name: "All" },
//     { id: "council", name: "Council" },
//     { id: "waste", name: "Waste Committee" },
//     { id: "gad", name: "GAD" },
//     { id: "finance", name: "Finance" }
//   ];
//   const [filter, setFilter] = useState<string>("all");

//   // Filter data based on active/archive tab, search query, and filter
//   const filteredData = React.useMemo(() => {
//     let result = resolutionData.filter(row => 
//       activeTab === "active" ? row.res_is_archive === false : row.res_is_archive === true
//     );

//     if (filter !== "all") {
//       result = result.filter(record => record.res_area_of_focus.includes(filter));
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
//   }, [resolutionData, activeTab, filter, searchQuery]);

//   const handleDelete = (res_num: number) => {
//     deleteRes(res_num);
//   };

//   const handleArchive = (res_num: number) => {
//     archiveRestore({
//       res_num,
//       res_is_archive: true
//     });
//   };

//   const handleRestore = (res_num: number) => {
//     archiveRestore({
//       res_num,
//       res_is_archive: false
//     });
//   };

//   const handleViewFiles = (files: any[]) => {
//     setSelectedFiles(files);
//     setCurrentIndex(0);
//     setViewFilesModalVisible(true);
//   };

//   const handleCreate = () => {
//     setIsDialogOpen(true);
//   };

//   const handleEdit = (item: ResolutionData) => {
//     setEditingRowId(item.res_num);
//   };

//   const renderItem = ({ item }: { item: ResolutionData }) => (
//     <Card className="mb-4 border border-gray-200">
//       <CardHeader className="flex-row justify-between items-center">
//         <CardTitle className="text-lg text-[#2a3a61]">
//           Resolution #{item.res_num}
//         </CardTitle>
//         {activeTab === 'active' ? (
//           <View className="flex-row gap-1">
//             <TouchableOpacity 
//               onPress={() => {
//                 if (item.resolution_files?.[0]?.rf_url) {
//                   handleViewFiles([{ 
//                     ief_url: item.resolution_files[0].rf_url,
//                     ief_name: `Resolution ${item.res_num}` 
//                   }]);
//                 }
//               }} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Eye size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               onPress={() => handleEdit(item)} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Pencil size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Archive size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//               }
//               title="Archive Resolution"
//               description="This resolution will be archived and removed from the active list. Do you wish to proceed?"
//               actionLabel="Confirm"
//               onPress={() => handleArchive(item.res_num)}
//             />
//           </View>
//         ) : (
//           <View className="flex-row gap-1">
//             <TouchableOpacity 
//               onPress={() => {
//                 if (item.resolution_files?.[0]?.rf_url) {
//                   handleViewFiles([{ 
//                     ief_url: item.resolution_files[0].rf_url,
//                     ief_name: `Resolution ${item.res_num}` 
//                   }]);
//                 }
//               }} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Eye size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
//                   <ArchiveRestore size={16} color="#15803d"/>
//                 </TouchableOpacity>
//               }
//               title="Restore Archived Resolution"
//               description="Would you like to restore this resolution from the archive and make it active again?"
//               actionLabel="confirm"
//               onPress={() => handleRestore(item.res_num)}
//             />
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Trash size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//               }
//               title="Confirm Delete"
//               description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
//               actionLabel="confirm"
//               onPress={() => handleDelete(item.res_num)}
//             />
//           </View>
//         )}
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Title:</Text>
//           <Text>{item.res_title}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Date Approved:</Text>
//           <Text>{item.res_date_approved}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Area of Focus:</Text>
//           <Text>{item.res_area_of_focus.join(', ')}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Documents:</Text>
//           {item.resolution_supp?.length > 0 ? (
//             <TouchableOpacity onPress={() => handleViewFiles(item.resolution_supp)}>
//               <Text className="text-blue-600 underline">{item.resolution_supp.length} attached</Text>
//             </TouchableOpacity>
//           ) : (
//             <View className="flex-row items-center">
//               <CircleAlert size={16} color="#ff2c2c" />
//               <Text className="text-red-500 ml-1">No document</Text>
//             </View>
//           )}
//         </View>
//       </CardContent>
//     </Card>
//   );

//   if (isError) {
//     return (
//       <_ScreenLayout
//         header={<Text className="text-xl font-semibold">Resolution Record</Text>}
//       >
//         <Text className="text-red-500 text-center py-4">Error loading resolutions</Text>
//       </_ScreenLayout>
//     );
//   }

//   return (
//     <_ScreenLayout
//       header={
//         <View>
//           <Text className="font-semibold text-2xl text-darkBlue2">
//             Resolution Record
//           </Text>
//           <Text className="text-md text-darkGray">
//             Manage and view resolution information
//           </Text>
//         </View>
//       }
//       headerAlign="left"
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
//       loading={isArchivePending || isDeletePending || isLoading}
//       loadingMessage={
//         isArchivePending ? "Updating resolution..." : 
//         isDeletePending ? "Deleting resolution..." : 
//         "Loading resolutions..."
//       }
//     >
//       {/* Search and Filters */}
//       <View className="mb-4">
//         <View className="flex-row items-center gap-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={(text) => {
//                 setSearchQuery(text);
//               }}
//             />
//           </View>

//           <View className="w-[120px]">
//             <SelectLayout
//               options={filterOptions.map(f => ({ label: f.name, value: f.id }))}
//               className="h-8"
//               selectedValue={filter}
//               onSelect={(option) => {
//                 setFilter(option.value);
//               }}
//               placeholder="Filter"
//               isInModal={false}
//             />
//           </View>
//         </View>

//         <Button
//           onPress={handleCreate}
//           className="bg-primaryBlue mt-3"
//         >
//           <Text className="text-white text-[17px]">
//             Create
//           </Text>
//         </Button>
//       </View>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
//           <TabsTrigger 
//             value="active" 
//             className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//               Active
//             </Text>
//           </TabsTrigger>
//           <TabsTrigger 
//             value="archive"
//             className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <View className="flex-row items-center justify-center">
//               <Archive 
//                 size={16} 
//                 className="mr-1" 
//                 color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//               />
//               <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                 Archive
//               </Text>
//             </View>
//           </TabsTrigger>
//         </TabsList>

//         {/* Active Resolutions */}
//         <TabsContent value="active">
//           <FlatList
//             data={filteredData.filter(row => row.res_is_archive === false)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-center text-gray-500 py-4">
//                 No active resolutions found
//               </Text>
//             }
//           />
//         </TabsContent>

//         {/* Archived Resolutions */}
//         <TabsContent value="archive">
//           <FlatList
//             data={filteredData.filter(row => row.res_is_archive === true)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-center text-gray-500 py-4">
//                 No archived resolutions found
//               </Text>
//             }
//           />
//         </TabsContent>
//       </Tabs>

//       {/* Create Resolution Modal */}
//       <Modal
//         visible={isDialogOpen}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setIsDialogOpen(false)}
//       >
//         <View className="flex-1 p-4">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-semibold">Resolution Details</Text>
//             <TouchableOpacity onPress={() => setIsDialogOpen(false)}>
//               <X size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <Text className="text-gray-600 mb-4">Add details.</Text>
          
//           <ScrollView className="flex-1">
//             {/* AddResolution component would go here */}
//             <View className="border border-gray-300 p-4 rounded-lg">
//               <Text className="text-center text-gray-500">
//                 Add Resolution Form would appear here
//               </Text>
//             </View>
//           </ScrollView>
          
//           <View className="flex-row justify-end gap-2 mt-4">
//             <Button
//               onPress={() => setIsDialogOpen(false)}
//               className="bg-gray-300 px-4 py-2"
//             >
//               <Text>Cancel</Text>
//             </Button>
//             <Button
//               onPress={() => {
//                 setIsDialogOpen(false);
//               }}
//               className="bg-primaryBlue px-4 py-2"
//             >
//               <Text className="text-white">Submit</Text>
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       {/* Edit Resolution Modal */}
//       <Modal
//         visible={!!editingRowId}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setEditingRowId(null)}
//       >
//         <View className="flex-1 p-4">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-semibold">Update Resolution</Text>
//             <TouchableOpacity onPress={() => setEditingRowId(null)}>
//               <X size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <Text className="text-gray-600 mb-4">Update the resolution details.</Text>
          
//           <ScrollView className="flex-1">
//             {/* EditResolution component would go here */}
//             <View className="border border-gray-300 p-4 rounded-lg">
//               <Text className="text-center text-gray-500">
//                 Edit Resolution Form would appear here
//               </Text>
//             </View>
//           </ScrollView>
          
//           <View className="flex-row justify-end gap-2 mt-4">
//             <Button
//               onPress={() => setEditingRowId(null)}
//               className="bg-gray-300 px-4 py-2"
//             >
//               <Text>Cancel</Text>
//             </Button>
//             <Button
//               onPress={() => {
//                 setEditingRowId(null);
//               }}
//               className="bg-primaryBlue px-4 py-2"
//             >
//               <Text className="text-white">Update</Text>
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       {/* View Files Modal */}
//       <Modal
//         visible={viewFilesModalVisible}
//         transparent={true}
//         onRequestClose={() => {
//           setViewFilesModalVisible(false);
//           setCurrentZoomScale(1);
//         }}
//       >
//         <View className="flex-1 bg-black/90">
//           {/* Header with close button and file name */}
//           <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
//             <Text className="text-white text-lg font-medium w-[90%]">
//               {selectedFiles[currentIndex]?.rsd_name || 'Document'}
//             </Text>
//             <TouchableOpacity 
//               onPress={() => {
//                 setViewFilesModalVisible(false);
//                 setCurrentZoomScale(1);
//               }}
//             >
//               <X size={24} color="white" />
//             </TouchableOpacity>
//           </View>

//           {/* Image with zoom capability */}
//           <ScrollView
//             className="flex-1"
//             maximumZoomScale={3}
//             minimumZoomScale={1}
//             zoomScale={currentZoomScale}
//             onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
//             contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
//           >
//             <Image
//               source={{ uri: selectedFiles[currentIndex]?.rsd_url }}
//               style={{ width: '100%', height: 400 }}
//               resizeMode="contain"
//             />
//           </ScrollView>

//           {/* Pagination indicators at the bottom */}
//           {selectedFiles.length > 1 && (
//             <View className="absolute bottom-4 left-0 right-0 items-center">
//               <View className="flex-row bg-black/50 rounded-full px-3 py-1">
//                 {selectedFiles.map((_, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     onPress={() => {
//                       setCurrentIndex(index);
//                       setCurrentZoomScale(1);
//                     }}
//                     className="p-1"
//                   >
//                     <View 
//                       className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Navigation arrows for multiple files */}
//           {selectedFiles.length > 1 && (
//             <>
//               {currentIndex > 0 && (
//                 <TouchableOpacity
//                   className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev - 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronLeft size={24} color="white" />
//                 </TouchableOpacity>
//               )}
//               {currentIndex < selectedFiles.length - 1 && (
//                 <TouchableOpacity
//                   className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev + 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronLeft size={24} color="white" className="rotate-180" />
//                 </TouchableOpacity>
//               )}
//             </>
//           )}
//         </View>
//       </Modal>
//     </_ScreenLayout>
//   );
// }

// export default ResolutionPage;













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
//   ActivityIndicator,
//   Linking,
//   Alert
// } from 'react-native';
// import {
//   Search,
//   Plus,
//   Archive,
//   Pencil,
//   Eye,
//   Trash,
//   ArchiveRestore,
//   FileInput,
//   CircleAlert,
//   ChevronLeft,
//   X,
//   ArrowUpDown
// } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
// import { useDeleteResolution } from './queries/resolution-delete-queries';
// import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';

// function ResolutionPage() {
//   const router = useRouter();
//   const [isDialogOpen, setIsDialogOpen] = useState(false); 
//   const [editingRowId, setEditingRowId] = useState<number | null>(null);
//   const [activeTab, setActiveTab] = useState("active");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
//   const [selectedImages, setSelectedImages] = useState<{rsd_url: string, rsd_name: string}[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Fetch mutation
//   const { data: resolutionData = [], isLoading, isError } = useResolution();

//   // Delete mutation
//   const { mutate: deleteRes, isPending: isDeletePending } = useDeleteResolution();

//   // Archive / Restore mutation
//   const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreResolution();

//   const filterOptions = [
//     { id: "all", name: "All" },
//     { id: "council", name: "Council" },
//     { id: "waste", name: "Waste Committee" },
//     { id: "gad", name: "GAD" },
//     { id: "finance", name: "Finance" }
//   ];
//   const [filter, setFilter] = useState<string>("all");

//   // Filter data based on active/archive tab, search query, and filter
//   const filteredData = React.useMemo(() => {
//     let result = resolutionData.filter(row => 
//       activeTab === "active" ? row.res_is_archive === false : row.res_is_archive === true
//     );

//     if (filter !== "all") {
//       result = result.filter(record => record.res_area_of_focus.includes(filter));
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
//   }, [resolutionData, activeTab, filter, searchQuery]);

//   const handleDelete = (res_num: number) => {
//     deleteRes(res_num);
//   };

//   const handleArchive = (res_num: number) => {
//     archiveRestore({
//       res_num,
//       res_is_archive: true
//     });
//   };

//   const handleRestore = (res_num: number) => {
//     archiveRestore({
//       res_num,
//       res_is_archive: false
//     });
//   };

//   const handleViewPdf = (pdfUrl: string) => {
//     if (!pdfUrl) {
//       Alert.alert("Error", "No PDF file available");
//       return;
//     }
    
//     Linking.openURL(pdfUrl).catch(err => {
//       console.error('Failed to open PDF:', err);
//       Alert.alert(
//         'Cannot Open PDF',
//         'Please make sure you have a PDF reader app installed.',
//         [{ text: 'OK' }]
//       );
//     });
//   };

//   const handleViewImages = (images: {rsd_url: string, rsd_name: string}[]) => {
//     if (!images || images.length === 0) {
//       Alert.alert("Info", "No supporting images available");
//       return;
//     }
    
//     setSelectedImages(images);
//     setCurrentIndex(0);
//     setViewImagesModalVisible(true);
//   };

//   const handleCreate = () => {
//     setIsDialogOpen(true);
//   };

//   const handleEdit = (item: ResolutionData) => {
//     setEditingRowId(item.res_num);
//   };

//   const renderItem = ({ item }: { item: ResolutionData }) => (
//     <Card className="mb-4 border border-gray-200">
//       <CardHeader className="flex-row justify-between items-center">
//         <CardTitle className="text-lg text-[#2a3a61]">
//           Resolution #{item.res_num}
//         </CardTitle>
//         {activeTab === 'active' ? (
//           <View className="flex-row gap-1">
//             <TouchableOpacity 
//               onPress={() => {
//                 if (item.resolution_files?.[0]?.rf_url) {
//                   handleViewPdf(item.resolution_files[0].rf_url);
//                 }
//               }} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Eye size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               onPress={() => handleEdit(item)} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Pencil size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Archive size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//               }
//               title="Archive Resolution"
//               description="This resolution will be archived and removed from the active list. Do you wish to proceed?"
//               actionLabel="Confirm"
//               onPress={() => handleArchive(item.res_num)}
//             />
//           </View>
//         ) : (
//           <View className="flex-row gap-1">
//             <TouchableOpacity 
//               onPress={() => {
//                 if (item.resolution_files?.[0]?.rf_url) {
//                   handleViewPdf(item.resolution_files[0].rf_url);
//                 }
//               }} 
//               className="bg-blue-50 rounded py-1 px-1.5"
//             >
//               <Eye size={16} color="#00A8F0"/>
//             </TouchableOpacity>
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
//                   <ArchiveRestore size={16} color="#15803d"/>
//                 </TouchableOpacity>
//               }
//               title="Restore Archived Resolution"
//               description="Would you like to restore this resolution from the archive and make it active again?"
//               actionLabel="confirm"
//               onPress={() => handleRestore(item.res_num)}
//             />
            
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Trash size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//               }
//               title="Confirm Delete"
//               description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
//               actionLabel="confirm"
//               onPress={() => handleDelete(item.res_num)}
//             />
//           </View>
//         )}
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Title:</Text>
//           <Text>{item.res_title}</Text>
//         </View>

//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Date Approved:</Text>
//           <Text>{item.res_date_approved}</Text>
//         </View>

//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Area of Focus:</Text>
//           <Text>{item.res_area_of_focus.join(', ')}</Text>
//         </View>

//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Supporting Documents:</Text>
//           {item.resolution_supp?.length > 0 ? (
//             <TouchableOpacity 
//               onPress={() => handleViewImages(item.resolution_supp)}
//               className="flex-row items-center"
//             >
//               <Text className="text-blue-600 underline">
//                 View {item.resolution_supp.length} image(s)
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             <View className="flex-row items-center">
//               <CircleAlert size={16} color="#ff2c2c" />
//               <Text className="text-red-500 ml-1">No documents</Text>
//             </View>
//           )}
//         </View>
//       </CardContent>
//     </Card>
//   );

//   if (isError) {
//     return (
//       <_ScreenLayout
//         header={<Text className="text-xl font-semibold">Resolution Record</Text>}
//       >
//         <Text className="text-red-500 text-center py-4">Error loading resolutions</Text>
//       </_ScreenLayout>
//     );
//   }

//   return (
//     <_ScreenLayout
//       header={
//         <View>
//           <Text className="font-semibold text-2xl text-darkBlue2">
//             Resolution Record
//           </Text>
//           <Text className="text-md text-darkGray">
//             Manage and view resolution information
//           </Text>
//         </View>
//       }
//       headerAlign="left"
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
//       loading={isArchivePending || isDeletePending || isLoading}
//       loadingMessage={
//         isArchivePending ? "Updating resolution..." : 
//         isDeletePending ? "Deleting resolution..." : 
//         "Loading resolutions..."
//       }
//     >
//       {/* Search and Filters */}
//       <View className="mb-4">
//         <View className="flex-row items-center gap-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={(text) => {
//                 setSearchQuery(text);
//               }}
//             />
//           </View>

//           <View className="w-[120px]">
//             <SelectLayout
//               options={filterOptions.map(f => ({ label: f.name, value: f.id }))}
//               className="h-8"
//               selectedValue={filter}
//               onSelect={(option) => {
//                 setFilter(option.value);
//               }}
//               placeholder="Filter"
//               isInModal={false}
//             />
//           </View>
//         </View>

//         <Button
//           onPress={handleCreate}
//           className="bg-primaryBlue mt-3"
//         >
//           <Text className="text-white text-[17px]">
//             Create
//           </Text>
//         </Button>
//       </View>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
//           <TabsTrigger 
//             value="active" 
//             className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//               Active
//             </Text>
//           </TabsTrigger>
//           <TabsTrigger 
//             value="archive"
//             className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <View className="flex-row items-center justify-center">
//               <Archive 
//                 size={16} 
//                 className="mr-1" 
//                 color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//               />
//               <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                 Archive
//               </Text>
//             </View>
//           </TabsTrigger>
//         </TabsList>

//         {/* Active Resolutions */}
//         <TabsContent value="active">
//           <FlatList
//             data={filteredData.filter(row => row.res_is_archive === false)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-center text-gray-500 py-4">
//                 No active resolutions found
//               </Text>
//             }
//           />
//         </TabsContent>

//         {/* Archived Resolutions */}
//         <TabsContent value="archive">
//           <FlatList
//             data={filteredData.filter(row => row.res_is_archive === true)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-center text-gray-500 py-4">
//                 No archived resolutions found
//               </Text>
//             }
//           />
//         </TabsContent>
//       </Tabs>

//       {/* Create Resolution Modal */}
//       <Modal
//         visible={isDialogOpen}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setIsDialogOpen(false)}
//       >
//         <View className="flex-1 p-4">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-semibold">Resolution Details</Text>
//             <TouchableOpacity onPress={() => setIsDialogOpen(false)}>
//               <X size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <Text className="text-gray-600 mb-4">Add details.</Text>
          
//           <ScrollView className="flex-1">
//             {/* AddResolution component would go here */}
//             <View className="border border-gray-300 p-4 rounded-lg">
//               <Text className="text-center text-gray-500">
//                 Add Resolution Form would appear here
//               </Text>
//             </View>
//           </ScrollView>
          
//           <View className="flex-row justify-end gap-2 mt-4">
//             <Button
//               onPress={() => setIsDialogOpen(false)}
//               className="bg-gray-300 px-4 py-2"
//             >
//               <Text>Cancel</Text>
//             </Button>
//             <Button
//               onPress={() => {
//                 setIsDialogOpen(false);
//               }}
//               className="bg-primaryBlue px-4 py-2"
//             >
//               <Text className="text-white">Submit</Text>
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       {/* Edit Resolution Modal */}
//       <Modal
//         visible={!!editingRowId}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setEditingRowId(null)}
//       >
//         <View className="flex-1 p-4">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-semibold">Update Resolution</Text>
//             <TouchableOpacity onPress={() => setEditingRowId(null)}>
//               <X size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <Text className="text-gray-600 mb-4">Update the resolution details.</Text>
          
//           <ScrollView className="flex-1">
//             {/* EditResolution component would go here */}
//             <View className="border border-gray-300 p-4 rounded-lg">
//               <Text className="text-center text-gray-500">
//                 Edit Resolution Form would appear here
//               </Text>
//             </View>
//           </ScrollView>
          
//           <View className="flex-row justify-end gap-2 mt-4">
//             <Button
//               onPress={() => setEditingRowId(null)}
//               className="bg-gray-300 px-4 py-2"
//             >
//               <Text>Cancel</Text>
//             </Button>
//             <Button
//               onPress={() => {
//                 setEditingRowId(null);
//               }}
//               className="bg-primaryBlue px-4 py-2"
//             >
//               <Text className="text-white">Update</Text>
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       {/* View Images Modal */}
//       <Modal
//         visible={viewImagesModalVisible}
//         transparent={true}
//         onRequestClose={() => {
//           setViewImagesModalVisible(false);
//           setCurrentZoomScale(1);
//         }}
//       >
//         <View className="flex-1 bg-black/90">
//           {/* Header with close button and file name */}
//           <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
//             <Text className="text-white text-lg font-medium w-[90%]">
//               {selectedImages[currentIndex]?.rsd_name || 'Document'}
//             </Text>
//             <TouchableOpacity 
//               onPress={() => {
//                 setViewImagesModalVisible(false);
//                 setCurrentZoomScale(1);
//               }}
//             >
//               <X size={24} color="white" />
//             </TouchableOpacity>
//           </View>

//           {/* Image with zoom capability */}
//           <ScrollView
//             className="flex-1"
//             maximumZoomScale={3}
//             minimumZoomScale={1}
//             zoomScale={currentZoomScale}
//             onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
//             contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
//           >
//             <Image
//               source={{ uri: selectedImages[currentIndex]?.rsd_url }}
//               style={{ width: '100%', height: 400 }}
//               resizeMode="contain"
//             />
//           </ScrollView>

//           {/* Pagination indicators at the bottom */}
//           {selectedImages.length > 1 && (
//             <View className="absolute bottom-4 left-0 right-0 items-center">
//               <View className="flex-row bg-black/50 rounded-full px-3 py-1">
//                 {selectedImages.map((_, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     onPress={() => {
//                       setCurrentIndex(index);
//                       setCurrentZoomScale(1);
//                     }}
//                     className="p-1"
//                   >
//                     <View 
//                       className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Navigation arrows for multiple files */}
//           {selectedImages.length > 1 && (
//             <>
//               {currentIndex > 0 && (
//                 <TouchableOpacity
//                   className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev - 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronLeft size={24} color="white" />
//                 </TouchableOpacity>
//               )}
//               {currentIndex < selectedImages.length - 1 && (
//                 <TouchableOpacity
//                   className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev + 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronLeft size={24} color="white" className="rotate-180" />
//                 </TouchableOpacity>
//               )}
//             </>
//           )}
//         </View>
//       </Modal>
//     </_ScreenLayout>
//   );
// }

// export default ResolutionPage;












// ResolutionPage.tsx
// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Pressable,
//   FlatList,
//   Alert,
//   Linking,
//   Modal,
//   ScrollView,
//   Image
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
// import { Eye, Archive, ArchiveRestore, Trash, CircleAlert, ChevronLeft, ChevronRight, Search, Files, X } from 'lucide-react-native';
// import ScreenLayout from "@/screens/_ScreenLayout"
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Button } from '@/components/ui/button';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
// import { useDeleteResolution } from './queries/resolution-delete-queries';
// import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';


// function ResolutionPage() {
//   const router = useRouter();
//   const [isDialogOpen, setIsDialogOpen] = useState(false); 
//   const [editingRowId, setEditingRowId] = useState<number | null>(null);
//   const [activeTab, setActiveTab] = useState("active");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
//   const [selectedImages, setSelectedImages] = useState<{rsd_url: string, rsd_name: string}[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const { data: resolutionData = [], isLoading, isError } = useResolution();
//   const { mutate: deleteRes, isPending: isDeletePending } = useDeleteResolution();
//   const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreResolution();

//   const filterOptions = [
//     { id: "all", name: "All" },
//     { id: "council", name: "Council" },
//     { id: "waste", name: "Waste Committee" },
//     { id: "gad", name: "GAD" },
//     { id: "finance", name: "Finance" }
//   ];
//   const [filter, setFilter] = useState<string>("all");

//   const filteredData = useMemo(() => {
//     let result = resolutionData.filter(row => 
//       activeTab === "active" ? !row.res_is_archive : row.res_is_archive
//     );

//     if (filter !== "all") {
//       result = result.filter(record => record.res_area_of_focus.includes(filter));
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
//   }, [resolutionData, activeTab, filter, searchQuery]);

//   const handleDelete = (res_num: number) => deleteRes(res_num);
//   const handleArchive = (res_num: number) => archiveRestore({ res_num, res_is_archive: true });
//   const handleRestore = (res_num: number) => archiveRestore({ res_num, res_is_archive: false });

//   const handleViewPdf = (pdfUrl: string) => {
//     if (!pdfUrl) {
//       Alert.alert("Error", "No PDF file available");
//       return;
//     }
//     Linking.openURL(pdfUrl).catch(() =>
//       Alert.alert('Cannot Open PDF', 'Please make sure you have a PDF reader app installed.')
//     );
//   };

//   const handleViewImages = (images: {rsd_url: string, rsd_name: string}[]) => {
//     if (!images?.length) {
//       Alert.alert("Info", "No supporting images available");
//       return;
//     }
//     setSelectedImages(images);
//     setCurrentIndex(0);
//     setViewImagesModalVisible(true);
//   };

//   const handleEdit = (item: any) =>{
//     console.log(item.res_num)
//   }

//   const renderItem = ({ item }: { item: any }) => (
//     <Pressable onPress={() => handleEdit(item)} className="mb-4">
//       <Card className="border border-gray-200">
//         <CardHeader className="flex-row justify-between items-center">
//           <CardTitle className="text-lg text-[#2a3a61]">Resolution #{item.res_num}</CardTitle>
//           {activeTab === 'active' ? (
//             <View className="flex-row gap-1">
//               <TouchableOpacity 
//                 onPress={() => item.resolution_files?.[0]?.rf_url && handleViewPdf(item.resolution_files[0].rf_url)} 
//                 className="bg-blue-50 rounded py-1 px-1.5"
//               >
//                 <Files size={16} color="#00A8F0"/>
//               </TouchableOpacity>

//               <ConfirmationModal
//                 trigger={<TouchableOpacity className="bg-red-50 rounded py-1 px-1.5"><Archive size={16} color="#dc2626"/></TouchableOpacity>}
//                 title="Archive Resolution"
//                 description="This resolution will be archived. Proceed?"
//                 actionLabel="Confirm"
//                 onPress={() => handleArchive(item.res_num)}
//               />
//             </View>
//           ) : (
//             <View className="flex-row gap-1">
//               <TouchableOpacity 
//                 onPress={() => item.resolution_files?.[0]?.rf_url && handleViewPdf(item.resolution_files[0].rf_url)} 
//                 className="bg-blue-50 rounded py-1 px-1.5"
//               >
//                 <Files size={16} color="#00A8F0"/>
//               </TouchableOpacity>

//               <ConfirmationModal
//                 trigger={<TouchableOpacity className="bg-green-50 rounded py-1 px-1.5"><ArchiveRestore size={16} color="#15803d"/></TouchableOpacity>}
//                 title="Restore Resolution"
//                 description="Restore this resolution from the archive?"
//                 actionLabel="Confirm"
//                 onPress={() => handleRestore(item.res_num)}
//               />
//               <ConfirmationModal
//                 trigger={<TouchableOpacity className="bg-red-50 rounded py-1 px-1.5"><Trash size={16} color="#dc2626"/></TouchableOpacity>}
//                 title="Delete Resolution"
//                 description="This action is irreversible. Proceed?"
//                 actionLabel="Confirm"
//                 onPress={() => handleDelete(item.res_num)}
//               />
//             </View>
//           )}
//         </CardHeader>

//         <CardContent className="space-y-2">
//           <View className="flex-row justify-between pb-1">
//             <Text className="text-gray-600">Title:</Text>
//             <Text>{item.res_title}</Text>
//           </View>

//           <View className="flex-row justify-between pb-1">
//             <Text className="text-gray-600">Date Approved:</Text>
//             <Text>{item.res_date_approved}</Text>
//           </View>

//           <View className="flex-row justify-between pb-1">
//             <Text className="text-gray-600">Area of Focus:</Text>
//             <Text>{item.res_area_of_focus.join(', ')}</Text>
//           </View>

//           <View className="flex-row justify-between">
//             <Text className="text-gray-600">Supporting Documents:</Text>
//             {item.resolution_supp?.length > 0 ? (
//               <TouchableOpacity onPress={() => handleViewImages(item.resolution_supp)}>
//                 <Text className="text-blue-600 underline">{item.resolution_supp.length} attachment(s)</Text>
//               </TouchableOpacity>
//             ) : (
//               <View className="flex-row items-center">
//                 <CircleAlert size={16} color="#ff2c2c" />
//                 <Text className="text-red-500 ml-1">No documents</Text>
//               </View>
//             )}
//           </View>
//         </CardContent>
//       </Card>
//     </Pressable>
//   );

//   return (
//     <ScreenLayout
//       header={
//         <View>
//           <Text className="font-semibold text-2xl text-darkBlue2">
//             Resolution Record
//           </Text>
//           <Text className="text-md text-darkGray">
//             Manage and view resolution information
//           </Text>
//         </View>
//       }
//       headerAlign="left"
//       showBackButton={true}
//       showExitButton={false}
//       customLeftAction={<TouchableOpacity onPress={() => router.back()}><ChevronLeft size={24} color="black" /></TouchableOpacity>}
//       scrollable
//       keyboardAvoiding
//       contentPadding="medium"
//       loading={isArchivePending || isDeletePending || isLoading}
//       loadingMessage={
//         isArchivePending ? "Updating resolution..." : 
//         isDeletePending ? "Deleting resolution..." : 
//         "Loading resolutions..."
//       }
//     >
//       {/* Search and Filters */}
//       <View className="mb-4">
//         <View className="flex-row items-center gap-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               className="pl-4 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>

//           <View className="w-[120px]">
//             <SelectLayout
//               options={filterOptions.map(f => ({ label: f.name, value: f.id }))}
//               className="h-8"
//               selectedValue={filter}
//               onSelect={(option) => setFilter(option.value)}
//               placeholder="Filter"
//               isInModal={false}
//             />
//           </View>
//         </View>

//         <Button onPress={() => router.push('/(council)/resolution/res-create')} className="bg-primaryBlue mt-3">
//           <Text className="text-white text-[17px]">Create</Text>
//         </Button>
//       </View>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
//           <TabsTrigger value="active" className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
//             <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Active</Text>
//           </TabsTrigger>
//           <TabsTrigger value="archive" className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
//             <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Archive</Text>
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="active">
//           <FlatList
//             data={filteredData.filter(row => !row.res_is_archive)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={<Text className="text-center text-gray-500 py-4">No active resolutions found</Text>}
//           />
//         </TabsContent>

//         <TabsContent value="archive">
//           <FlatList
//             data={filteredData.filter(row => row.res_is_archive)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={<Text className="text-center text-gray-500 py-4">No archived resolutions found</Text>}
//           />
//         </TabsContent>
//       </Tabs>
      

//       {/* Edit Resolution Modal */}
//       <Modal
//         visible={!!editingRowId}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setEditingRowId(null)}
//       >
//         <View className="flex-1 p-4">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-semibold">Update Resolution</Text>
//             <TouchableOpacity onPress={() => setEditingRowId(null)}>
//               <X size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <Text className="text-gray-600 mb-4">Update the resolution details.</Text>
          
//           <ScrollView className="flex-1">
//             {/* EditResolution component would go here */}
//             <View className="border border-gray-300 p-4 rounded-lg">
//               <Text className="text-center text-gray-500">
//                 Edit Resolution Form would appear here
//               </Text>
//             </View>
//           </ScrollView>
          
//           <View className="flex-row justify-end gap-2 mt-4">
//             <Button
//               onPress={() => setEditingRowId(null)}
//               className="bg-gray-300 px-4 py-2"
//             >
//               <Text>Cancel</Text>
//             </Button>
//             <Button
//               onPress={() => {
//                 setEditingRowId(null);
//               }}
//               className="bg-primaryBlue px-4 py-2"
//             >
//               <Text className="text-white">Update</Text>
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       {/* View Images Modal */}
//       <Modal
//         visible={viewImagesModalVisible}
//         transparent={true}
//         onRequestClose={() => {
//           setViewImagesModalVisible(false);
//           setCurrentZoomScale(1);
//         }}
//       >
//         <View className="flex-1 bg-black/90">
//           {/* Header with close button and file name */}
//           <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
//             <Text className="text-white text-lg font-medium w-[90%]">
//               {selectedImages[currentIndex]?.rsd_name || 'Document'}
//             </Text>
//             <TouchableOpacity 
//               onPress={() => {
//                 setViewImagesModalVisible(false);
//                 setCurrentZoomScale(1);
//               }}
//             >
//               <X size={24} color="white" />
//             </TouchableOpacity>
//           </View>

//           {/* Image with zoom capability */}
//           <ScrollView
//             className="flex-1"
//             maximumZoomScale={3}
//             minimumZoomScale={1}
//             zoomScale={currentZoomScale}
//             onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
//             contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
//           >
//             <Image
//               source={{ uri: selectedImages[currentIndex]?.rsd_url }}
//               style={{ width: '100%', height: 400 }}
//               resizeMode="contain"
//             />
//           </ScrollView>

//           {/* Pagination indicators at the bottom */}
//           {selectedImages.length > 1 && (
//             <View className="absolute bottom-4 left-0 right-0 items-center">
//               <View className="flex-row bg-black/50 rounded-full px-3 py-1">
//                 {selectedImages.map((_, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     onPress={() => {
//                       setCurrentIndex(index);
//                       setCurrentZoomScale(1);
//                     }}
//                     className="p-1"
//                   >
//                     <View 
//                       className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Navigation arrows for multiple files */}
//           {selectedImages.length > 1 && (
//             <>
//               {currentIndex > 0 && (
//                 <TouchableOpacity
//                   className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev - 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronLeft size={24} color="white" />
//                 </TouchableOpacity>
//               )}
//               {currentIndex < selectedImages.length - 1 && (
//                 <TouchableOpacity
//                   className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev + 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronRight size={24} color="white" className="rotate-180" />
//                 </TouchableOpacity>
//               )}
//             </>
//           )}
//         </View>
//       </Modal>      
//     </ScreenLayout>
//   );
// }

// export default ResolutionPage;









//LATEST GYUD NI
// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Pressable,
//   FlatList,
//   Alert,
//   Linking,
//   Modal,
//   ScrollView,
//   Image
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
// import { Eye, Archive, ArchiveRestore, Trash, CircleAlert, ChevronLeft, ChevronRight, Search, Files, X } from 'lucide-react-native';
// import ScreenLayout from "@/screens/_ScreenLayout"
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Button } from '@/components/ui/button';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
// import { useDeleteResolution } from './queries/resolution-delete-queries';
// import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';


// function ResolutionPage() {
//   const router = useRouter();
//   const [isDialogOpen, setIsDialogOpen] = useState(false); 
//   const [editingRowId, setEditingRowId] = useState<number | null>(null);
//   const [activeTab, setActiveTab] = useState("active");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
//   const [selectedImages, setSelectedImages] = useState<{rsd_url: string, rsd_name: string}[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const { data: resolutionData = [], isLoading, isError } = useResolution();
//   const { mutate: deleteRes, isPending: isDeletePending } = useDeleteResolution();
//   const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreResolution();

//   const filterOptions = [
//     { id: "all", name: "All" },
//     { id: "council", name: "Council" },
//     { id: "waste", name: "Waste Committee" },
//     { id: "gad", name: "GAD" },
//     { id: "finance", name: "Finance" }
//   ];
//   const [filter, setFilter] = useState<string>("all");

//   const filteredData = useMemo(() => {
//     let result = resolutionData.filter(row => 
//       activeTab === "active" ? !row.res_is_archive : row.res_is_archive
//     );

//     if (filter !== "all") {
//       result = result.filter(record => record.res_area_of_focus.includes(filter));
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
//   }, [resolutionData, activeTab, filter, searchQuery]);

//   const handleDelete = (res_num: number) => deleteRes(res_num);
//   const handleArchive = (res_num: number) => archiveRestore({ res_num, res_is_archive: true });
//   const handleRestore = (res_num: number) => archiveRestore({ res_num, res_is_archive: false });

//   const handleViewPdf = (pdfUrl: string) => {
//     if (!pdfUrl) {
//       Alert.alert("Error", "No PDF file available");
//       return;
//     }
//     Linking.openURL(pdfUrl).catch(() =>
//       Alert.alert('Cannot Open PDF', 'Please make sure you have a PDF reader app installed.')
//     );
//   };

//   const handleViewImages = (images: {rsd_url: string, rsd_name: string}[]) => {
//     if (!images?.length) {
//       Alert.alert("Info", "No supporting images available");
//       return;
//     }
//     setSelectedImages(images);
//     setCurrentIndex(0);
//     setViewImagesModalVisible(true);
//   };

//   const handleEdit = (item: any) =>{
//     router.push({
//       pathname: '/(council)/resolution/res-edit',
//       params: {
//         res_num: item.res_num,
//         res_title: item.res_title,
//         res_date_approved: item.res_date_approved,
//         res_area_of_focus: item.res_area_of_focus,
//         resolution_files: JSON.stringify(item.resolution_files || []),
//         resolution_supp: JSON.stringify(item.resolution_supp || [])
//       }
//     });    
//     console.log("MAIN FILES", JSON.stringify(item.resolution_supp || []))
//   }

//   const renderItem = ({ item }: { item: any }) => (
//     <Pressable onPress={() => handleEdit(item)} className="mb-4">
//       <Card className="border border-gray-200">
//         <CardHeader className="flex-row justify-between items-center">
//           <CardTitle className="text-lg text-[#2a3a61]">Resolution #{item.res_num}</CardTitle>
//           {activeTab === 'active' ? (
//             <View className="flex-row gap-1">
//               <TouchableOpacity 
//                 onPress={() => item.resolution_files?.[0]?.rf_url && handleViewPdf(item.resolution_files[0].rf_url)} 
//                 className="bg-blue-50 rounded py-1 px-1.5"
//               >
//                 <Files size={16} color="#00A8F0"/>
//               </TouchableOpacity>

//               <ConfirmationModal
//                 trigger={<TouchableOpacity className="bg-red-50 rounded py-1 px-1.5"><Archive size={16} color="#dc2626"/></TouchableOpacity>}
//                 title="Archive Resolution"
//                 description="This resolution will be archived. Proceed?"
//                 actionLabel="Confirm"
//                 onPress={() => handleArchive(item.res_num)}
//               />
//             </View>
//           ) : (
//             <View className="flex-row gap-1">
//               <TouchableOpacity 
//                 onPress={() => item.resolution_files?.[0]?.rf_url && handleViewPdf(item.resolution_files[0].rf_url)} 
//                 className="bg-blue-50 rounded py-1 px-1.5"
//               >
//                 <Files size={16} color="#00A8F0"/>
//               </TouchableOpacity>

//               <ConfirmationModal
//                 trigger={<TouchableOpacity className="bg-green-50 rounded py-1 px-1.5"><ArchiveRestore size={16} color="#15803d"/></TouchableOpacity>}
//                 title="Restore Resolution"
//                 description="Restore this resolution from the archive?"
//                 actionLabel="Confirm"
//                 onPress={() => handleRestore(item.res_num)}
//               />
//               <ConfirmationModal
//                 trigger={<TouchableOpacity className="bg-red-50 rounded py-1 px-1.5"><Trash size={16} color="#dc2626"/></TouchableOpacity>}
//                 title="Delete Resolution"
//                 description="This action is irreversible. Proceed?"
//                 actionLabel="Confirm"
//                 onPress={() => handleDelete(item.res_num)}
//               />
//             </View>
//           )}
//         </CardHeader>

//         <CardContent className="space-y-2">
//           <View className="pb-3">
//             <Text className="text-gray-600">Title:</Text>
//             <Text className="text-base text-black mt-1" numberOfLines={3} ellipsizeMode="tail">
//               {item.res_title}
//             </Text>
//           </View>

//           <View className="flex-row justify-between pb-1">
//             <Text className="text-gray-600">Date Approved:</Text>
//             <Text>{item.res_date_approved}</Text>
//           </View>

//           <View className="flex-row justify-between pb-1">
//             <Text className="text-gray-600">Area of Focus:</Text>
//             <Text>{item.res_area_of_focus.join(', ')}</Text>
//           </View>

//           <View className="flex-row justify-between">
//             <Text className="text-gray-600">Supporting Documents:</Text>
//             {item.resolution_supp?.length > 0 ? (
//               <TouchableOpacity onPress={() => handleViewImages(item.resolution_supp)}>
//                 <Text className="text-blue-600 underline">{item.resolution_supp.length} attachment(s)</Text>
//               </TouchableOpacity>
//             ) : (
//               <View className="flex-row items-center">
//                 <CircleAlert size={16} color="#ff2c2c" />
//                 <Text className="text-red-500 ml-1">No documents</Text>
//               </View>
//             )}
//           </View>
//         </CardContent>
//       </Card>
//     </Pressable>
//   );

//   return (
//     <ScreenLayout
//       header={
//         <View>
//           <Text className="font-semibold text-2xl text-darkBlue2">
//             Resolution Record
//           </Text>
//           <Text className="text-md text-darkGray">
//             Manage and view resolution information
//           </Text>
//         </View>
//       }
//       headerAlign="left"
//       showBackButton={true}
//       showExitButton={false}
//       customLeftAction={<TouchableOpacity onPress={() => router.back()}><ChevronLeft size={24} color="black" /></TouchableOpacity>}
//       scrollable
//       keyboardAvoiding
//       contentPadding="medium"
//       loading={isArchivePending || isDeletePending || isLoading}
//       loadingMessage={
//         isArchivePending ? "Updating resolution..." : 
//         isDeletePending ? "Deleting resolution..." : 
//         "Loading resolutions..."
//       }
//     >
//       {/* Search and Filters */}
//       <View className="mb-4">
//         <View className="flex-row items-center gap-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               className="pl-4 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>

//           <View className="w-[120px]">
//             <SelectLayout
//               options={filterOptions.map(f => ({ label: f.name, value: f.id }))}
//               className="h-8"
//               selectedValue={filter}
//               onSelect={(option) => setFilter(option.value)}
//               placeholder="Filter"
//               isInModal={false}
//             />
//           </View>
//         </View>

//         <Button onPress={() => router.push('/(council)/resolution/res-create')} className="bg-primaryBlue mt-3">
//           <Text className="text-white text-[17px]">Create</Text>
//         </Button>
//       </View>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
//           <TabsTrigger value="active" className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
//             <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Active</Text>
//           </TabsTrigger>
//           <TabsTrigger value="archive" className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
//             <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>Archive</Text>
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="active">
//           <FlatList
//             data={filteredData.filter(row => !row.res_is_archive)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={<Text className="text-center text-gray-500 py-4">No active resolutions found</Text>}
//           />
//         </TabsContent>

//         <TabsContent value="archive">
//           <FlatList
//             data={filteredData.filter(row => row.res_is_archive)}
//             renderItem={renderItem}
//             keyExtractor={item => item.res_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={<Text className="text-center text-gray-500 py-4">No archived resolutions found</Text>}
//           />
//         </TabsContent>
//       </Tabs>

//       {/* View Images Modal */}
//       <Modal
//         visible={viewImagesModalVisible}
//         transparent={true}
//         onRequestClose={() => {
//           setViewImagesModalVisible(false);
//           setCurrentZoomScale(1);
//         }}
//       >
//         <View className="flex-1 bg-black/90">
//           {/* Header with close button and file name */}
//           <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
//             <Text className="text-white text-lg font-medium w-[90%]">
//               {selectedImages[currentIndex]?.rsd_name || 'Document'}
//             </Text>
//             <TouchableOpacity 
//               onPress={() => {
//                 setViewImagesModalVisible(false);
//                 setCurrentZoomScale(1);
//               }}
//             >
//               <X size={24} color="white" />
//             </TouchableOpacity>
//           </View>

//           {/* Image with zoom capability */}
//           <ScrollView
//             className="flex-1"
//             maximumZoomScale={3}
//             minimumZoomScale={1}
//             zoomScale={currentZoomScale}
//             onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
//             contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
//           >
//             <Image
//               source={{ uri: selectedImages[currentIndex]?.rsd_url }}
//               style={{ width: '100%', height: 400 }}
//               resizeMode="contain"
//             />
//           </ScrollView>

//           {/* Pagination indicators at the bottom */}
//           {selectedImages.length > 1 && (
//             <View className="absolute bottom-4 left-0 right-0 items-center">
//               <View className="flex-row bg-black/50 rounded-full px-3 py-1">
//                 {selectedImages.map((_, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     onPress={() => {
//                       setCurrentIndex(index);
//                       setCurrentZoomScale(1);
//                     }}
//                     className="p-1"
//                   >
//                     <View 
//                       className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Navigation arrows for multiple files */}
//           {selectedImages.length > 1 && (
//             <>
//               {currentIndex > 0 && (
//                 <TouchableOpacity
//                   className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev - 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronLeft size={24} color="white" />
//                 </TouchableOpacity>
//               )}
//               {currentIndex < selectedImages.length - 1 && (
//                 <TouchableOpacity
//                   className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                   onPress={() => {
//                     setCurrentIndex(prev => prev + 1);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <ChevronRight size={24} color="white" className="rotate-180" />
//                 </TouchableOpacity>
//               )}
//             </>
//           )}
//         </View>
//       </Modal>      
//     </ScreenLayout>
//   );
// }

// export default ResolutionPage;





import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Archive, ArchiveRestore, Trash, CircleAlert, ChevronLeft, ChevronRight, Search, Files, X } from 'lucide-react-native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SelectLayout } from '@/components/ui/select-layout';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
import { useDeleteResolution } from './queries/resolution-delete-queries';
import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';
import PageLayout from '@/screens/_PageLayout';

function ResolutionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{rsd_url: string, rsd_name: string}[]>([]);
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: resolutionData = [], isLoading, isError, refetch } = useResolution();
  const { mutate: deleteRes, isPending: isDeletePending } = useDeleteResolution();
  const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreResolution();

  const filterOptions = [
    { id: "all", name: "All" },
    { id: "council", name: "Council" },
    { id: "waste", name: "Waste Committee" },
    { id: "gad", name: "GAD" },
    { id: "finance", name: "Finance" }
  ];
  const [filter, setFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    let result = resolutionData.filter(row => 
      activeTab === "active" ? !row.res_is_archive : row.res_is_archive
    );

    if (filter !== "all") {
      result = result.filter(record => record.res_area_of_focus.includes(filter));
    }

    if (searchQuery) {
      result = result.filter(item =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [resolutionData, activeTab, filter, searchQuery]);

  const handleDelete = (res_num: number) => deleteRes(res_num);
  const handleArchive = (res_num: number) => archiveRestore({ res_num, res_is_archive: true });
  const handleRestore = (res_num: number) => archiveRestore({ res_num, res_is_archive: false });

  const handleViewPdf = (pdfUrl: string) => {
    if (!pdfUrl) {
      Alert.alert("Error", "No PDF file available");
      return;
    }
    Linking.openURL(pdfUrl).catch(() =>
      Alert.alert('Cannot Open PDF', 'Please make sure you have a PDF reader app installed.')
    );
  };

  const handleViewImages = (images: {rsd_url: string, rsd_name: string}[]) => {
    if (!images?.length) {
      Alert.alert("Info", "No supporting images available");
      return;
    }
    setSelectedImages(images);
    setCurrentIndex(0);
    setViewImagesModalVisible(true);
  };

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/(council)/resolution/res-edit',
      params: {
        res_num: item.res_num,
        res_title: item.res_title,
        res_date_approved: item.res_date_approved,
        res_area_of_focus: item.res_area_of_focus,
        resolution_files: JSON.stringify(item.resolution_files || []),
        resolution_supp: JSON.stringify(item.resolution_supp || [])
      }
    });    
  }

  const handleRefresh = () => {
    refetch();
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleEdit(item)} className="mb-4">
      <Card className="border border-gray-200">
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle className="text-lg text-[#2a3a61]">Resolution #{item.res_num}</CardTitle>
          {activeTab === 'active' ? (
            <View className="flex-row gap-1">
              <TouchableOpacity 
                onPress={() => item.resolution_files?.[0]?.rf_url && handleViewPdf(item.resolution_files[0].rf_url)} 
                className="bg-blue-50 rounded py-1 px-1.5"
              >
                <Files size={16} color="#00A8F0"/>
              </TouchableOpacity>

              <ConfirmationModal
                trigger={<TouchableOpacity className="bg-red-50 rounded py-1 px-1.5"><Archive size={16} color="#dc2626"/></TouchableOpacity>}
                title="Archive Resolution"
                description="This resolution will be archived. Proceed?"
                actionLabel="Confirm"
                onPress={() => handleArchive(item.res_num)}
              />
            </View>
          ) : (
            <View className="flex-row gap-1">
              <TouchableOpacity 
                onPress={() => item.resolution_files?.[0]?.rf_url && handleViewPdf(item.resolution_files[0].rf_url)} 
                className="bg-blue-50 rounded py-1 px-1.5"
              >
                <Files size={16} color="#00A8F0"/>
              </TouchableOpacity>

              <ConfirmationModal
                trigger={<TouchableOpacity className="bg-green-50 rounded py-1 px-1.5"><ArchiveRestore size={16} color="#15803d"/></TouchableOpacity>}
                title="Restore Resolution"
                description="Restore this resolution from the archive?"
                actionLabel="Confirm"
                onPress={() => handleRestore(item.res_num)}
              />
              <ConfirmationModal
                trigger={<TouchableOpacity className="bg-red-50 rounded py-1 px-1.5"><Trash size={16} color="#dc2626"/></TouchableOpacity>}
                title="Delete Resolution"
                description="This action is irreversible. Proceed?"
                actionLabel="Confirm"
                onPress={() => handleDelete(item.res_num)}
              />
            </View>
          )}
        </CardHeader>

        <CardContent className="space-y-2">
          <View className="pb-3">
            <Text className="text-gray-600">Title:</Text>
            <Text className="text-base text-black mt-1" numberOfLines={3} ellipsizeMode="tail">
              {item.res_title}
            </Text>
          </View>

          <View className="flex-row justify-between pb-1">
            <Text className="text-gray-600">Date Approved:</Text>
            <Text>{item.res_date_approved}</Text>
          </View>

          <View className="flex-row justify-between pb-1">
            <Text className="text-gray-600">Area of Focus:</Text>
            <Text>{item.res_area_of_focus.join(', ')}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Supporting Documents:</Text>
            {item.resolution_supp?.length > 0 ? (
              <TouchableOpacity onPress={() => handleViewImages(item.resolution_supp)}>
                <Text className="text-blue-600 underline">{item.resolution_supp.length} attachment(s)</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <CircleAlert size={16} color="#ff2c2c" />
                <Text className="text-red-500 ml-1">No documents</Text>
              </View>
            )}
          </View>
        </CardContent>
      </Card>
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
        headerTitle={<Text className="text-gray-900 text-[13px]">Resolution Record</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load resolutions.
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
      headerTitle={
          <Text className="font-semibold text-lg text-[#2a3a61]">Resolution Record</Text>
      }
      rightAction={
        <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }
    >
      {isLoading || isArchivePending || isDeletePending ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
          <Text className="text-sm text-gray-500 mt-2">
            {isArchivePending ? "Updating resolution records..." : 
             isDeletePending ? "Deleting resolution record..." : 
             "Loading resolutions..."}
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4">
          {/* Search and Filters */}
          <View className="mb-4">
            <View className="flex-row items-center gap-2">
              <View className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-500" size={17} />
                <TextInput
                  placeholder="Search..."
                  className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View className="w-[120px] pb-5">
                <SelectLayout
                  options={filterOptions.map(f => ({ label: f.name, value: f.id }))}
                  className="h-8"
                  selectedValue={filter}
                  onSelect={(option) => setFilter(option.value)}
                  placeholder="Filter"
                  isInModal={false}
                />
              </View>
            </View>

            <Button 
              onPress={() => router.push('/(council)/resolution/res-create')} 
              className="bg-primaryBlue mt-3"
            >
              <Text className="text-white text-[17px]">Create</Text>
            </Button>
          </View>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
              <TabsTrigger 
                value="active" 
                className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
              >
                <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                  Active
                </Text>
              </TabsTrigger>
              <TabsTrigger 
                value="archive"
                className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
              >
                <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                  Archive
                </Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <FlatList
                data={filteredData.filter(row => !row.res_is_archive)}
                renderItem={renderItem}
                keyExtractor={item => item.res_num.toString()}
                contentContainerStyle={{ paddingBottom: 500 }}
                ListEmptyComponent={
                  <Text className="text-center text-gray-500 py-4">
                    No active resolutions found
                  </Text>
                }
              />
            </TabsContent>

            <TabsContent value="archive">
              <FlatList
                data={filteredData.filter(row => row.res_is_archive)}
                renderItem={renderItem}
                keyExtractor={item => item.res_num.toString()}
                contentContainerStyle={{ paddingBottom: 500 }}
                ListEmptyComponent={
                  <Text className="text-center text-gray-500 py-4">
                    No archived resolutions found
                  </Text>
                }
              />
            </TabsContent>
          </Tabs>

          {/* View Images Modal */}
          <Modal
            visible={viewImagesModalVisible}
            transparent={true}
            onRequestClose={() => {
              setViewImagesModalVisible(false);
              setCurrentZoomScale(1);
            }}
          >
            <View className="flex-1 bg-black/90">
              {/* Header with close button and file name */}
              <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
                <Text className="text-white text-lg font-medium w-[90%]">
                  {selectedImages[currentIndex]?.rsd_name || 'Document'}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setViewImagesModalVisible(false);
                    setCurrentZoomScale(1);
                  }}
                >
                  <X size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Image with zoom capability */}
              <ScrollView
                className="flex-1"
                maximumZoomScale={3}
                minimumZoomScale={1}
                zoomScale={currentZoomScale}
                onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
              >
                <Image
                  source={{ uri: selectedImages[currentIndex]?.rsd_url }}
                  style={{ width: '100%', height: 400 }}
                  resizeMode="contain"
                />
              </ScrollView>

              {/* Pagination indicators at the bottom */}
              {selectedImages.length > 1 && (
                <View className="absolute bottom-4 left-0 right-0 items-center">
                  <View className="flex-row bg-black/50 rounded-full px-3 py-1">
                    {selectedImages.map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setCurrentIndex(index);
                          setCurrentZoomScale(1);
                        }}
                        className="p-1"
                      >
                        <View 
                          className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Navigation arrows for multiple files */}
              {selectedImages.length > 1 && (
                <>
                  {currentIndex > 0 && (
                    <TouchableOpacity
                      className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                      onPress={() => {
                        setCurrentIndex(prev => prev - 1);
                        setCurrentZoomScale(1);
                      }}
                    >
                      <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                  )}
                  {currentIndex < selectedImages.length - 1 && (
                    <TouchableOpacity
                      className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                      onPress={() => {
                        setCurrentIndex(prev => prev + 1);
                        setCurrentZoomScale(1);
                      }}
                    >
                      <ChevronRight size={24} color="white" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </Modal>
        </View>
      )}
    </PageLayout>
  );
}

export default ResolutionPage;