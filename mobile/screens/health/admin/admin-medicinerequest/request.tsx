// import { useState } from "react"
// import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, RefreshControl } from "react-native"
// import { router } from "expo-router"
// import { ArrowLeft, Search, Filter, Eye, CheckCircle, XCircle, Clock, User, Pill, Calendar, MapPin, Phone, ChevronLeft } from "lucide-react-native"
// import { useProcessingMedrequest } from "./Request/queries.tsx/fetch"
// import PageLayout from "@/screens/_PageLayout"

// // Updated types for the medicine request data
// interface MedicineRequest {
//   medreq_id: string;
//   requested_at: string;
//   status: string;
//   mode: string;
//   pat_id: string;
//   rp_id: any;
//   pat_type: string;
//   pat_id_value: string;
//   address: {
//     add_street: string;
//     add_barangay: string;
//     add_city: string;
//     add_province: string;
//     add_sitio: string;
//     full_address: string;
//   };
//   personal_info: {
//     per_fname: string;
//     per_lname: string;
//     per_mname: string;
//     per_suffix: string;
//     per_dob: string;
//     per_sex: string;
//     per_status: string;
//     per_edAttainment: string;
//     per_religion: string;
//     per_contact: string;
//   };
//   total_quantity: number;
//   items?: Array<{
//     minv_id: {
//       med_id: {
//         med_name: string;
//         med_type: string;
//       };
//       minv_dsg?: string;
//       minv_form?: string;
//     };
//     medreqitem_qty: number;
//     reason?: string;
//   }>;
//   medicine_files?: Array<{
//     medf_url: string;
//     medf_name: string;
//   }>;
// }

// export default function AdminMedicineRequests() {
//   const [searchQuery, setSearchQuery] = useState('')
//   const [refreshing, setRefreshing] = useState(false)
//   const [selectedRequest, setSelectedRequest] = useState<MedicineRequest | null>(null)
//   const [showDetailsModal, setShowDetailsModal] = useState(false)
//   const [filterStatus, setFilterStatus] = useState<string>('all')

//   const { data: fetchedRequests, isLoading: isFetching, error, refetch } = useProcessingMedrequest()

//   const requests: MedicineRequest[] = fetchedRequests?.results || fetchedRequests || []

//   // Handle refresh
//   const onRefresh = () => {
//     setRefreshing(true)
//     refetch().finally(() => setRefreshing(false))
//   }

//   // Filter requests based on search and status
//   const filteredRequests = requests.filter(request => {
//     const matchesSearch = searchQuery === '' || 
//       request.medreq_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       request.personal_info.per_fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       request.personal_info.per_lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       request.personal_info.per_contact.includes(searchQuery)

//     const matchesStatus = filterStatus === 'all' || request.status === filterStatus

//     return matchesSearch && matchesStatus
//   })

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'pending': return 'bg-yellow-500'
//       case 'confirmed': return 'bg-green-500'
//       case 'referred': return 'bg-blue-500'
//       case 'declined': return 'bg-red-500'
//       case 'processing': return 'bg-purple-500'
//       default: return 'bg-gray-500'
//     }
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'pending': return <Clock size={16} color="#fff" />
//       case 'confirmed': return <CheckCircle size={16} color="#fff" />
//       case 'referred': return <Eye size={16} color="#fff" />
//       case 'declined': return <XCircle size={16} color="#fff" />
//       default: return <Clock size={16} color="#fff" />
//     }
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const getPatientName = (request: MedicineRequest) => {
//     const { per_fname, per_lname, per_mname, per_suffix } = request.personal_info;
//     let name = `${per_fname} ${per_mname || ''} ${per_lname}`.trim();
//     if (per_suffix) {
//       name += ` ${per_suffix}`;
//     }
//     return name;
//   }

//   const getPatientContact = (request: MedicineRequest) => {
//     return request.personal_info.per_contact || 'No contact info';
//   }

//   const getPatientTypeDisplay = (patType: string) => {
//     switch (patType) {
//       case 'Resident': return 'Resident';
//       case 'Transient': return 'Visitor';
//       default: return patType;
//     }
//   }

//   if (error) {
//     return (
//       <SafeAreaView className="flex-1 bg-white justify-center items-center">
//         <Text className="text-red-500 text-lg">Error loading requests</Text>
//         {/* <TouchableOpacity onPress={refetch} className="bg-blue-500 px-4 py-2 rounded mt-4"> */}
//           {/* <Text className="text-white">Retry</Text> */}
//         {/* </TouchableOpacity> */}
//       </SafeAreaView>
//     )
//   }

//   return (
//     <PageLayout
//               leftAction={
//                 <TouchableOpacity
//                   onPress={() => router.back()}
//                   className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
//                 >
//                   <ChevronLeft size={24} className="text-gray-700" />
//                 </TouchableOpacity>
//               }
//               headerTitle={<Text className="text-gray-900 text-[13px]">All requests</Text>}
//                rightAction={<View className="w-10 h-10" />}
//             >
//       {/* Header */}
//       <View className="bg-white px-4 py-4 border-b border-gray-200">
      

//         {/* Search Bar */}
//         <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mt-3">
//           <Search size={20} color="#6B7280" />
//           <TextInput
//             className="flex-1 ml-2 text-gray-700"
//             placeholder="Search by request ID, patient name..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>

//         {/* Status Filter */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
//           <TouchableOpacity
//             onPress={() => setFilterStatus('all')}
//             className={`px-4 py-2 rounded-full mr-2 ${filterStatus === 'all' ? 'bg-blue-500' : 'bg-gray-200'}`}
//           >
//             <Text className={filterStatus === 'all' ? 'text-white' : 'text-gray-700'}>All</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setFilterStatus('pending')}
//             className={`px-4 py-2 rounded-full mr-2 ${filterStatus === 'pending' ? 'bg-yellow-500' : 'bg-gray-200'}`}
//           >
//             <Text className={filterStatus === 'pending' ? 'text-white' : 'text-gray-700'}>Pending</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setFilterStatus('processing')}
//             className={`px-4 py-2 rounded-full mr-2 ${filterStatus === 'processing' ? 'bg-purple-500' : 'bg-gray-200'}`}
//           >
//             <Text className={filterStatus === 'processing' ? 'text-white' : 'text-gray-700'}>Processing</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setFilterStatus('confirmed')}
//             className={`px-4 py-2 rounded-full mr-2 ${filterStatus === 'confirmed' ? 'bg-green-500' : 'bg-gray-200'}`}
//           >
//             <Text className={filterStatus === 'confirmed' ? 'text-white' : 'text-gray-700'}>Confirmed</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>

//       {/* Requests List */}
//       <ScrollView
//         className="flex-1"
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         contentContainerClassName="p-4"
//       >
//         {isFetching ? (
//           <ActivityIndicator size="large" color="#3B82F6" className="my-8" />
//         ) : filteredRequests.length === 0 ? (
//           <View className="items-center justify-center py-12">
//             <Text className="text-gray-500 text-lg">No requests found</Text>
//             {searchQuery && (
//               <Text className="text-gray-400 mt-2">Try adjusting your search</Text>
//             )}
//           </View>
//         ) : (
//           filteredRequests.map((request) => (
//             <TouchableOpacity
//               key={request.medreq_id}
//               onPress={() => {
//                 setSelectedRequest(request)
//                 setShowDetailsModal(true)
//               }}
//               className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
//             >
//               <View className="flex-row justify-between items-start mb-3">
//                 <View className="flex-1">
//                   <Text className="text-lg font-semibold text-gray-800">#{request.medreq_id}</Text>
//                   <Text className="text-gray-600 text-sm">{formatDate(request.requested_at)}</Text>
//                 </View>
//                 <View className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor(request.status)}`}>
//                   {getStatusIcon(request.status)}
//                   <Text className="text-white text-xs font-medium ml-1 capitalize">
//                     {request.status}
//                   </Text>
//                 </View>
//               </View>

//               <View className="mb-3">
//                 <View className="flex-row items-center mb-1">
//                   <User size={16} color="#6B7280" />
//                   <Text className="text-gray-700 ml-2 font-medium">{getPatientName(request)}</Text>
//                 </View>
//                 <View className="flex-row items-center">
//                   <Text className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
//                     {getPatientTypeDisplay(request.pat_type)}
//                   </Text>
//                   <Text className="text-gray-500 text-xs ml-2">{request.personal_info.per_contact}</Text>
//                 </View>
//               </View>

//               <View className="flex-row justify-between items-center">
//                 <Text className="text-gray-500 text-xs">Total Items: {request.total_quantity}</Text>
//                 <TouchableOpacity className="flex-row items-center">
//                   <Eye size={16} color="#3B82F6" />
//                   <Text className="text-blue-600 text-sm ml-1">View Details</Text>
//                 </TouchableOpacity>
//               </View>
//             </TouchableOpacity>
//           ))
//         )}
//       </ScrollView>

//       {/* Details Modal */}
//       <Modal
//         visible={showDetailsModal}
//         animationType="slide"
//         onRequestClose={() => setShowDetailsModal(false)}
//       >
//         <SafeAreaView className="flex-1 bg-white">
//           {selectedRequest && (
//             <>
//               <View className="px-4 py-4 border-b border-gray-200">
//                 <View className="flex-row items-center">
//                   <TouchableOpacity onPress={() => setShowDetailsModal(false)} className="p-2 mr-2">
//                     <ArrowLeft size={24} color="#333" />
//                   </TouchableOpacity>
//                   <Text className="text-xl font-bold text-gray-800">Request Details</Text>
//                 </View>
//               </View>

//               <ScrollView className="flex-1 p-4">
//                 {/* Request Info */}
//                 <View className="bg-gray-50 rounded-2xl p-4 mb-4">
//                   <Text className="text-lg font-semibold text-gray-800 mb-3">Request Information</Text>
//                   <View className="space-y-2">
//                     <View className="flex-row justify-between">
//                       <Text className="text-gray-600">Request ID:</Text>
//                       <Text className="text-gray-800 font-medium">#{selectedRequest.medreq_id}</Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                       <Text className="text-gray-600">Status:</Text>
//                       <View className={`px-3 py-1 rounded-full ${getStatusColor(selectedRequest.status)}`}>
//                         <Text className="text-white text-xs font-medium capitalize">
//                           {selectedRequest.status}
//                         </Text>
//                       </View>
//                     </View>
//                     <View className="flex-row justify-between">
//                       <Text className="text-gray-600">Requested At:</Text>
//                       <Text className="text-gray-800">{formatDate(selectedRequest.requested_at)}</Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                       <Text className="text-gray-600">Mode:</Text>
//                       <Text className="text-gray-800 capitalize">{selectedRequest.mode}</Text>
//                     </View>
//                   </View>
//                 </View>

//                 {/* Patient Info */}
//                 <View className="bg-gray-50 rounded-2xl p-4 mb-4">
//                   <Text className="text-lg font-semibold text-gray-800 mb-3">Patient Information</Text>
//                   <View className="space-y-3">
//                     <View className="flex-row items-center">
//                       <User size={16} color="#6B7280" />
//                       <Text className="text-gray-800 ml-2 font-medium">{getPatientName(selectedRequest)}</Text>
//                     </View>
                    
//                     <View className="flex-row items-center">
//                       <Phone size={16} color="#6B7280" />
//                       <Text className="text-gray-800 ml-2">{getPatientContact(selectedRequest)}</Text>
//                     </View>
                    
//                     <View className="flex-row items-center">
//                       <Calendar size={16} color="#6B7280" />
//                       <Text className="text-gray-800 ml-2">
//                         {selectedRequest.personal_info.per_dob} • {selectedRequest.personal_info.per_sex}
//                       </Text>
//                     </View>
                    
//                     <View className="flex-row items-center">
//                       <MapPin size={16} color="#6B7280" />
//                       <Text className="text-gray-800 ml-2 flex-1">{selectedRequest.address.full_address}</Text>
//                     </View>
                    
//                     <View className="bg-blue-50 rounded-xl p-2">
//                       <Text className="text-blue-800 text-xs">
//                         Patient Type: {getPatientTypeDisplay(selectedRequest.pat_type)} • ID: {selectedRequest.pat_id_value}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>

//                 {/* Add other sections for medicines and files if they exist in your data */}
//               </ScrollView>
//             </>
//           )}
//         </SafeAreaView>
//       </Modal>
//       </PageLayout>
//   )
// }