// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Pressable,
//   Modal,
//   ScrollView,
//   Image,
//   ActivityIndicator,
//   Linking,
//   Alert
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Eye, Archive, ArchiveRestore, Trash, CircleAlert, ChevronLeft, ChevronRight, Search, Files, X } from 'lucide-react-native';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Button } from '@/components/ui/button';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
// import { useDeleteResolution } from './queries/resolution-delete-queries';
// import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';
// import PageLayout from '@/screens/_PageLayout';

// function ResolutionPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState("active");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
//   const [selectedImages, setSelectedImages] = useState<{rsd_url: string, rsd_name: string}[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const { data: resolutionData = [], isLoading, isError, refetch } = useResolution();
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

//   const handleDelete = (res_num: number) => deleteRes(String(res_num));
//   const handleArchive = (res_num: number) => archiveRestore({ res_num: String(res_num), res_is_archive: true });
//   const handleRestore = (res_num: number) => archiveRestore({ res_num: String(res_num), res_is_archive: false });

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

//   const handleEdit = (item: any) => {
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
//   }

//   const handleRefresh = () => {
//     refetch();
//   };

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

//   if (isError) {
//     return (
//       <PageLayout
//         leftAction={
//           <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//             <ChevronLeft size={24} className="text-gray-700" />
//           </TouchableOpacity>
//         }
//         headerTitle={<Text className="text-gray-900 text-[13px]">Resolution Record</Text>}
//         rightAction={
//           <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
//         }
//       >
//         <View className="flex-1 justify-center items-center">
//           <Text className="text-red-500 text-center mb-4">
//             Failed to load resolutions.
//           </Text>
//           <TouchableOpacity
//             onPress={handleRefresh}
//             className="bg-[#2a3a61] px-4 py-2 rounded-lg"
//           >
//             <Text className="text-white">Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       </PageLayout>
//     );
//   }

//   return (
//     <PageLayout
//       leftAction={
//         <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//           <ChevronLeft size={24} className="text-gray-700" />
//         </TouchableOpacity>
//       }
//       headerTitle={
//           <Text className="font-semibold text-lg text-[#2a3a61]">Resolution Record</Text>
//       }
//       rightAction={
//         <View className="w-10 h-10 rounded-full items-center justify-center"></View>
//       }
//     >
//       {isLoading || isArchivePending || isDeletePending ? (
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" color="#2a3a61" />
//           <Text className="text-sm text-gray-500 mt-2">
//             {isArchivePending ? "Updating resolution records..." : 
//              isDeletePending ? "Deleting resolution record..." : 
//              "Loading resolutions..."}
//           </Text>
//         </View>
//       ) : (
//         <View className="flex-1 px-4">
//           {/* Search and Filters */}
//           <View className="mb-4">
//             <View className="flex-row items-center gap-2">
//               <View className="relative flex-1">
//                 <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//                 <TextInput
//                   placeholder="Search..."
//                   className="pl-10 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//                   value={searchQuery}
//                   onChangeText={setSearchQuery}
//                 />
//               </View>

//               <View className="w-[120px] pb-5">
//                 <SelectLayout
//                   options={filterOptions.map(f => ({ label: f.name, value: f.id }))}
//                   className="h-8"
//                   selectedValue={filter}
//                   onSelect={(option) => setFilter(option.value)}
//                   placeholder="Filter"
//                   isInModal={false}
//                 />
//               </View>
//             </View>

//             <Button 
//               onPress={() => router.push('/(council)/resolution/res-create')} 
//               className="bg-primaryBlue mt-3"
//             >
//               <Text className="text-white text-[17px]">Create</Text>
//             </Button>
//           </View>

//           {/* Tabs */}
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
//               <TabsTrigger 
//                 value="active" 
//                 className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//               >
//                 <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//                   Active
//                 </Text>
//               </TabsTrigger>
//               <TabsTrigger 
//                 value="archive"
//                 className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//               >
//                 <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//                   Archive
//                 </Text>
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="active">
//               <FlatList
//                 data={filteredData.filter(row => !row.res_is_archive)}
//                 renderItem={renderItem}
//                 keyExtractor={item => item.res_num.toString()}
//                 contentContainerStyle={{ paddingBottom: 500 }}
//                 ListEmptyComponent={
//                   <Text className="text-center text-gray-500 py-4">
//                     No active resolutions found
//                   </Text>
//                 }
//               />
//             </TabsContent>

//             <TabsContent value="archive">
//               <FlatList
//                 data={filteredData.filter(row => row.res_is_archive)}
//                 renderItem={renderItem}
//                 keyExtractor={item => item.res_num.toString()}
//                 contentContainerStyle={{ paddingBottom: 500 }}
//                 ListEmptyComponent={
//                   <Text className="text-center text-gray-500 py-4">
//                     No archived resolutions found
//                   </Text>
//                 }
//               />
//             </TabsContent>
//           </Tabs>

//           {/* View Images Modal */}
//           <Modal
//             visible={viewImagesModalVisible}
//             transparent={true}
//             onRequestClose={() => {
//               setViewImagesModalVisible(false);
//               setCurrentZoomScale(1);
//             }}
//           >
//             <View className="flex-1 bg-black/90">
//               {/* Header with close button and file name */}
//               <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
//                 <Text className="text-white text-lg font-medium w-[90%]">
//                   {selectedImages[currentIndex]?.rsd_name || 'Document'}
//                 </Text>
//                 <TouchableOpacity 
//                   onPress={() => {
//                     setViewImagesModalVisible(false);
//                     setCurrentZoomScale(1);
//                   }}
//                 >
//                   <X size={24} color="white" />
//                 </TouchableOpacity>
//               </View>

//               {/* Image with zoom capability */}
//               <ScrollView
//                 className="flex-1"
//                 maximumZoomScale={3}
//                 minimumZoomScale={1}
//                 zoomScale={currentZoomScale}
//                 onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
//                 contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
//               >
//                 <Image
//                   source={{ uri: selectedImages[currentIndex]?.rsd_url }}
//                   style={{ width: '100%', height: 400 }}
//                   resizeMode="contain"
//                 />
//               </ScrollView>

//               {/* Pagination indicators at the bottom */}
//               {selectedImages.length > 1 && (
//                 <View className="absolute bottom-4 left-0 right-0 items-center">
//                   <View className="flex-row bg-black/50 rounded-full px-3 py-1">
//                     {selectedImages.map((_, index) => (
//                       <TouchableOpacity
//                         key={index}
//                         onPress={() => {
//                           setCurrentIndex(index);
//                           setCurrentZoomScale(1);
//                         }}
//                         className="p-1"
//                       >
//                         <View 
//                           className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
//                         />
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//               )}

//               {/* Navigation arrows for multiple files */}
//               {selectedImages.length > 1 && (
//                 <>
//                   {currentIndex > 0 && (
//                     <TouchableOpacity
//                       className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                       onPress={() => {
//                         setCurrentIndex(prev => prev - 1);
//                         setCurrentZoomScale(1);
//                       }}
//                     >
//                       <ChevronLeft size={24} color="white" />
//                     </TouchableOpacity>
//                   )}
//                   {currentIndex < selectedImages.length - 1 && (
//                     <TouchableOpacity
//                       className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                       onPress={() => {
//                         setCurrentIndex(prev => prev + 1);
//                         setCurrentZoomScale(1);
//                       }}
//                     >
//                       <ChevronRight size={24} color="white" />
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </View>
//           </Modal>
//         </View>
//       )}
//     </PageLayout>
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
  const [filter, setFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
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

  // Extract unique years from resolution data
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    
    // Add years from res_date_approved
    resolutionData.forEach(record => {
      if (record.res_date_approved) {
        try {
          const date = new Date(record.res_date_approved);
          if (!isNaN(date.getTime())) {
            years.add(date.getFullYear());
          }
        } catch (error) {
          console.error('Error parsing date:', record.res_date_approved, error);
        }
      }
    });

    // Convert to array and sort descending (most recent first)
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    // Create options array with "All Years" first
    const options = [{ id: "all", name: "All Years" }];
    
    // Add each year as an option
    sortedYears.forEach(year => {
      options.push({ id: year.toString(), name: year.toString() });
    });

    return options;
  }, [resolutionData]);

  const filteredData = useMemo(() => {
    let result = resolutionData.filter(row => 
      activeTab === "active" ? !row.res_is_archive : row.res_is_archive
    );

    // Apply area of focus filter
    if (filter !== "all") {
      result = result.filter(record => record.res_area_of_focus.includes(filter));
    }

    // Apply year filter
    if (yearFilter !== "all") {
      result = result.filter(record => {
        try {
          const date = new Date(record.res_date_approved);
          const year = date.getFullYear();
          return year === parseInt(yearFilter);
        } catch (error) {
          return false;
        }
      });
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
  }, [resolutionData, activeTab, filter, yearFilter, searchQuery]);

  const handleDelete = (res_num: number) => deleteRes(String(res_num));
  const handleArchive = (res_num: number) => archiveRestore({ res_num: String(res_num), res_is_archive: true });
  const handleRestore = (res_num: number) => archiveRestore({ res_num: String(res_num), res_is_archive: false });

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
        resolution_supp: JSON.stringify(item.resolution_supp || []),
        gpr_id: item.gpr_id
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
          <CardTitle className="text-lg text-[#2a3a61]">Resolution No. {item.res_num}</CardTitle>
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
            <View className="flex-row items-center gap-2 pb-3">
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
                  placeholder="Area Filter"
                  isInModal={false}
                />
              </View>
            </View>

              {/* Year Filter - Added here */}
            <View className="pb-5">
              <SelectLayout
                options={yearOptions.map(y => ({ label: y.name, value: y.id }))}
                className="h-8"
                selectedValue={yearFilter}
                onSelect={(option) => setYearFilter(option.value)}
                placeholder="Year Filter"
                isInModal={false}
              />
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