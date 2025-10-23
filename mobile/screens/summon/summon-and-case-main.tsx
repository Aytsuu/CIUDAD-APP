// import PageLayout from "../_PageLayout"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { useGetServiceChargeRequest } from "./queries/summonFetchQueries"
// import { TouchableOpacity, View, Text, ActivityIndicator, ScrollView } from "react-native"
// import { ChevronLeft } from "@/lib/icons/ChevronLeft"
// import { ChevronRight } from "@/lib/icons/ChevronRight"
// import { useRouter } from "expo-router"
// import { formatDate } from "@/helpers/dateHelpers"
// import { SelectLayout } from "@/components/ui/select-layout"
// import { useState, useMemo } from "react"

// export default function SummonAndCaseMain() {
//   const router = useRouter();
//   // const { data: fetchedData = [], isLoading } = useGetServiceChargeRequest();
//   const isLoading = false; // Mock loading state

//   // Mock data - this would be replaced by the actual fetchedData
//   const fetchedData = [
//     {
//       sr_id: "1",
//       sr_code: "001-25",
//       complainant_name: "John Doe",
//       incident_type: "Noise Complaint",
//       accused_names: ["Jane Smith", "Mike Johnson"],
//       decision_date: "2023-05-15",
//       allegation: "Excessive noise during quiet hours disturbing the peace",
//       status: "Ongoing"
//     },
//     {
//       sr_id: "2",
//       sr_code: "002-25",
//       complainant_name: "Sarah Williams",
//       incident_type: "Property Damage",
//       accused_names: ["Robert Brown"],
//       decision_date: "2023-04-22",
//       allegation: "Intentional damage to common area property",
//       status: "Resolved"
//     },
//     {
//       sr_id: "3",
//       sr_code: "003*25",
//       complainant_name: "Community Board",
//       incident_type: "Rule Violation",
//       accused_names: ["David Wilson"],
//       decision_date: "2023-06-10",
//       allegation: "Repeated violation of community guidelines",
//       status: "Escalated"
//     },
//     {
//       sr_id: "4",
//       sr_code: "004-25",
//       complainant_name: "Emma Davis",
//       incident_type: "Parking Dispute",
//       accused_names: ["Thomas Miller"],
//       decision_date: null,
//       allegation: "Unauthorized use of assigned parking space",
//       status: "Ongoing"
//     }
//   ];

//   const filterOptions = [
//     { id: "all", name: "All" },
//     { id: "Ongoing", name: "Ongoing" },
//     { id: "Resolved", name: "Resolved" },
//     { id: "Escalated", name: "Escalated" },
//   ];
//   const [filter, setFilter] = useState<string>("all");

//   // Filter logic using useMemo for optimization
//   const filteredData = useMemo(() => {
//     if (filter === "all") {
//       return fetchedData;
//     }
//     return fetchedData.filter(request => request.status === filter);
//   }, [fetchedData, filter]);

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "resolved":
//         return "text-green-600 bg-green-50"
//       case "escalated":
//         return "text-red-600 bg-red-50"
//       case "ongoing":
//         return "text-blue-600 bg-blue-50"
//       default:
//         return "text-gray-600 bg-gray-50"
//     }
//   }

//   const handleCaseOpen = (sr_id: string) => {
//       router.push({
//         pathname: '/(summon)/summon-view-details',
//         params: {
//           sr_id: sr_id
//         }
//       })
//   }

//   return (
//     <PageLayout
//       leftAction={
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
//         >
//           <ChevronLeft size={24} className="text-gray-700" />
//         </TouchableOpacity>
//       }
//       headerTitle={<Text className="text-gray-900 text-[13px]">Summon & Case Tracker</Text>}
//       rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>}
//     >
//       <View className="flex-1 bg-gray-50">
//         {isLoading ? (
//           <View className="flex-1 items-center justify-center">
//             <ActivityIndicator size="large" color="#3B82F6" />
//             <Text className="text-gray-500 text-sm mt-2">Loading summons...</Text>
//           </View>
//         ) : (
//           <>
//             {/* Filter Dropdown */}
//             <View className="flex-row justify-end px-4 pt-3 pb-5 mb-3">
//               <View className="w-[120px]">
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

//             {/* Results */}
//             {filteredData.length === 0 ? (
//               <View className="flex-1 items-center justify-center py-20">
//                 <Text className="text-gray-500 text-base">No summons found</Text>
//                 <Text className="text-gray-400 text-sm mt-1">
//                   {filter !== "all" ? "No cases with this status" : "Check back later for updates"}
//                 </Text>
//               </View>
//             ) : (
//               <ScrollView 
//                 className="flex-1" 
//                 contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
//                 showsVerticalScrollIndicator={false}
//               >
//                 {filteredData.map((request) => (
//                   <TouchableOpacity
//                     key={request.sr_id}
//                     activeOpacity={0.8}
//                     className="mb-3"
//                     onPress={() => handleCaseOpen(request.sr_id)}

//                   >
//                     <Card className="border border-gray-200 rounded-lg bg-white">
//                       <CardHeader className="border-b border-gray-200 p-4">
//                         <View className="flex-row justify-between items-center">
//                           <View className="flex-1">
//                             <Text className="font-medium text-gray-900">{request.complainant_name}</Text>
//                             <Text className="text-sm text-gray-500 mt-1">Case: {request.sr_code}</Text>
//                           </View>
//                           <View className="flex-row gap-1 items-center">
//                             <View className={`px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
//                               <Text className={`text-xs font-medium ${getStatusColor(request.status).split(" ")[0]}`}>
//                                 {request.status}
//                               </Text>
//                             </View>
//                             <ChevronRight size={18} color="#6b7280" />
//                           </View>
//                         </View>
//                       </CardHeader>
//                       <CardContent className="p-4">
//                         <View className="gap-3">
//                           <View className="flex-row justify-between">
//                             <Text className="text-sm text-gray-600">Incident Type:</Text>
//                             <Text className="text-sm font-medium flex-1 text-right">{request.incident_type}</Text>
//                           </View>
//                           <View className="flex-row justify-between">
//                             <Text className="text-sm text-gray-600">Accused:</Text>
//                             <Text className="text-sm font-medium flex-1 text-right">
//                               {request.accused_names.length > 0 ? request.accused_names.join(", ") : "N/A"}
//                             </Text>
//                           </View>
//                           {request.decision_date && (
//                             <View className="flex-row justify-between">
//                               <Text className="text-sm text-gray-600">Decision Date:</Text>
//                               <Text className="text-sm">{formatDate(request.decision_date)}</Text>
//                             </View>
//                           )}
//                           {request.allegation && (
//                             <View className="mt-2 pt-2 border-t border-gray-100">
//                               <Text className="text-xs text-gray-500 mb-1">Allegation:</Text>
//                               <Text className="text-sm text-gray-700" numberOfLines={2}>
//                                 {request.allegation}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
//                       </CardContent>
//                     </Card>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             )}
//           </>
//         )}
//       </View>
//     </PageLayout>
//   );
// }