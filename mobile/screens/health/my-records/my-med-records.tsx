// import React, { useState, useEffect } from "react";
// import { 
//   View, 
//   Text, 
//   ScrollView, 
//   TextInput, 
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
//   Modal,
//   Pressable
// } from "react-native";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useQuery } from "@tanstack/react-query";
// import { getIndividualMedicineRecords } from "../admin/admin-medicinerequest/restful-api/getAPI";
// import { AlertCircle, Pill, ChevronLeft, Search } from "lucide-react-native";

// // Document Modal Component for viewing medicine documents
// const DocumentModal = ({ files, isOpen, onClose, isLoading = false }) => {
//   if (!isOpen) return null;

//   return (
//     <Modal
//       visible={isOpen}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <View className="flex-1 bg-black/50 justify-center items-center p-4">
//         <View className="bg-white rounded-lg w-full max-w-md max-h-[80vh]">
//           {/* Modal Header */}
//           <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
//             <Text className="text-lg font-semibold text-gray-800">
//               Medicine Documents
//             </Text>
//             <Pressable onPress={onClose}>
//               <Text className="text-gray-500 text-2xl">×</Text>
//             </Pressable>
//           </View>
          
//           {/* Modal Content */}
//           <ScrollView className="p-6">
//             {isLoading ? (
//               <View className="flex-row flex-wrap justify-between">
//                 {[1, 2, 3, 4].map((index) => (
//                   <View key={index} className="border rounded-lg p-4 w-[48%] mb-4">
//                     <View className="bg-gray-200 h-4 w-3/4 mb-3 rounded"></View>
//                     <View className="bg-gray-200 h-48 w-full rounded"></View>
//                   </View>
//                 ))}
//               </View>
//             ) : files.length > 0 ? (
//               <View className="flex-row flex-wrap justify-between">
//                 {files.map((file, index) => (
//                   <View 
//                     key={file.medf_id || index} 
//                     className="border border-gray-200 rounded-lg p-4 w-[48%] mb-4"
//                   >
//                     <View className="mb-2">
//                       <Text className="text-sm font-medium text-gray-700 truncate">
//                         {file.medf_name || `Document ${index + 1}`}
//                       </Text>
//                     </View>
//                     <View className="overflow-hidden rounded-md border border-gray-200 bg-gray-50 h-48 justify-center items-center">
//                       <Image 
//                         source={{ uri: file.medf_url }} 
//                         className="w-full h-full object-contain p-2" 
//                         resizeMode="contain"
//                       />
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             ) : (
//               <View className="py-12 items-center justify-center">
//                 <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
//                 <Text className="text-lg font-medium text-gray-500">
//                   No documents available
//                 </Text>
//               </View>
//             )}
//           </ScrollView>
          
//           {/* Modal Footer */}
//           <View className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
//             <View className="flex-row justify-end">
//               <Button
//                 onPress={onClose}
//                 variant="outline"
//                 className="px-4 py-2"
//               >
//                 Close
//               </Button>
//             </View>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// // Medicine Record Card Component
// const MedicineRecordCard = ({ record }: { record: any }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const files = record.files || [];

//   return (
//     <Card className="mb-4">
//       <CardHeader>
//         <CardTitle className="text-lg">{record.medicine_name || "Unknown"}</CardTitle>
//         <Text className="text-sm text-gray-600">
//           {record.dosage} {record.form}
//         </Text>
//       </CardHeader>
//       <CardContent>
//         <View className="flex-row justify-between mb-3">
//           <View>
//             <Text className="text-sm font-medium">Quantity</Text>
//             <Text className="text-sm">
//               {record.medrec_qty} {record.minv_details?.minv_qty_unit === "boxes" ? "pcs" : record.minv_details?.minv_qty_unit}
//             </Text>
//           </View>
//           <View>
//             <Text className="text-sm font-medium">Date Requested</Text>
//             <Text className="text-sm">
//               {new Date(record.requested_at || Date.now()).toLocaleDateString()}
//             </Text>
//           </View>
//         </View>
        
//         {record.signature ? (
//           <View className="mb-3">
//             <Text className="text-sm font-medium mb-1">Signature</Text>
//             <View className="h-12 w-32 border border-gray-200 rounded bg-white p-1">
//               <Image 
//                 source={{ uri: `data:image/png;base64,${record.signature}` }}
//                 className="h-full w-full object-contain"
//                 resizeMode="contain"
//               />
//             </View>
//           </View>
//         ) : null}
        
//         <View className="flex-row justify-between items-center">
//           <Text className="text-sm font-medium">Documents</Text>
//           {files.length > 0 ? (
//             <>
//               <Button 
//                 onPress={() => setIsModalOpen(true)}
//                 size="sm"
//                 className="flex-row items-center"
//               >
//                 <Pill className="mr-1" size={16} />
//                 View ({files.length})
//               </Button>
//               <DocumentModal 
//                 files={files} 
//                 isOpen={isModalOpen} 
//                 onClose={() => setIsModalOpen(false)} 
//               />
//             </>
//           ) : (
//             <Text className="text-xs text-gray-400 italic">No documents</Text>
//           )}
//         </View>
//       </CardContent>
//     </Card>
//   );
// };

// export default function IndivMedicineRecords({ navigation:any }) {
//   const { user } = useAuth();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const pageSize = 10;

//   // Get patient ID from authenticated user
//   const patientId = user?.resident?.rp_id;

//   // Debounce search query
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearch(searchQuery);
//       setPage(1); // Reset to first page when search changes
//     }, 500);

//     return () => clearTimeout(handler);
//   }, [searchQuery]);

//   // Fetch medicine records for the authenticated user
//   const { data: apiResponse, isLoading, error } = useQuery({
//     queryKey: ["individualMedicineRecords", patientId, page, pageSize, debouncedSearch],
//     queryFn: () => getIndividualMedicineRecords(patientId, page, pageSize, debouncedSearch),
//     enabled: !!patientId,
//     refetchOnMount: true,
//     staleTime: 0,
//   });

//   // Extract data from paginated response
//   const medicineRecords = apiResponse?.results || [];
//   const totalCount = apiResponse?.count || 0;

//   if (!patientId) {
//     return (
//       <View className="flex-1 justify-center items-center p-4">
//         <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
//         <Text className="text-lg font-semibold text-yellow-500 mb-2">
//           No patient selected
//         </Text>
//         <Text className="text-center text-gray-700">
//           Please log in with a patient account to view medicine records.
//         </Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <Text className="text-red-500">Error loading medicine records</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className="bg-white p-4 border-b border-gray-200">
//         <View className="flex-row items-center mb-4">
//           <Button 
//             variant="outline" 
//             size="sm"
//             onPress={() => navigation.goBack()}
//             className="mr-3"
//           >
//             <ChevronLeft className="text-black" />
//           </Button>
//           <View>
//             <Text className="text-xl font-semibold text-darkBlue2">
//               My Medicine Records
//             </Text>
//             <Text className="text-sm text-darkGray">
//               View your medicine request history
//             </Text>
//           </View>
//         </View>

//         {/* Search Bar */}
//         <View className="flex-row items-center mb-4">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-black z-10" size={17} />
//             <Input
//               placeholder="Search by medicine name, category..."
//               className="pl-10 bg-white"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>
//         </View>

//         {/* Stats */}
//         <View className="flex-row items-center p-3 bg-blue-50 rounded-lg">
//           <Pill className="h-6 w-6 text-blue-600 mr-2" />
//           <Text className="text-sm font-medium text-gray-800">
//             Total Medicine Records: 
//           </Text>
//           <Text className="text-lg font-bold text-gray-900 ml-2">
//             {totalCount}
//           </Text>
//         </View>
//       </View>

//       {/* Content */}
//       <ScrollView className="flex-1 p-4">
//         {isLoading ? (
//           <View className="flex-1 justify-center items-center py-8">
//             <ActivityIndicator size="large" className="text-primary mb-4" />
//             <Text className="text-gray-500">Loading medicine records...</Text>
//           </View>
//         ) : medicineRecords.length === 0 ? (
//           <View className="flex-1 justify-center items-center py-8">
//             <Pill className="h-12 w-12 text-gray-300 mb-4" />
//             <Text className="text-lg text-gray-500 mb-2">
//               {debouncedSearch ? "No records found for your search" : "No medicine records found"}
//             </Text>
//             {!debouncedSearch && (
//               <Button onPress={() => navigation.navigate('MedicineRequestForm')}>
//                 Request Medicine
//               </Button>
//             )}
//           </View>
//         ) : (
//           <View>
//             {medicineRecords.map((record:any) => (
//               <MedicineRecordCard key={record.medrec_id} record={record} />
//             ))}
            
//             {/* Pagination Controls */}
//             {totalCount > pageSize && (
//               <View className="flex-row justify-between items-center mt-4">
//                 <Button
//                   variant="outline"
//                   disabled={page === 1}
//                   onPress={() => setPage(page - 1)}
//                 >
//                   Previous
//                 </Button>
//                 <Text className="text-sm text-gray-600">
//                   Page {page} of {Math.ceil(totalCount / pageSize)}
//                 </Text>
//                 <Button
//                   variant="outline"
//                   disabled={page * pageSize >= totalCount}
//                   onPress={() => setPage(page + 1)}
//                 >
//                   Next
//                 </Button>
//               </View>
//             )}
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }