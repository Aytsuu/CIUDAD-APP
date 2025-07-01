// import React, { useState, useMemo } from 'react';
// import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { 
//   Button,
//   Input,
//   Table,
//   TableHeader,
//   TableRow,
//   TableCell,
//   TableBody,
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   Badge,
//   Card,
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
//   Separator
// } from '@components/ui';
// import { CheckCircle2, Clock, Download, Filter, RefreshCw, Search, XCircle } from 'lucide-react-native';

// type RequestStatus = "pending" | "approved" | "rejected" | "completed";

// interface ResidentRequest {
//   id: string;
//   residentName: string;
//   residentId: string;
//   requestType: "medicine" | "appointment" | "document" | "service" | "other";
//   requestDetails: string;
//   status: RequestStatus;
//   dateSubmitted: string;
//   dateUpdated?: string;
//   priority: "low" | "medium" | "high";
//   attachments?: number;
// }

// export default function AdminRequestsDashboard() {
//   const insets = useSafeAreaInsets();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
//   const [typeFilter, setTypeFilter] = useState<string>("all");
//   const [priorityFilter, setPriorityFilter] = useState<string>("all");

//   // Mock data
//   const requests: ResidentRequest[] = [
//     {
//       id: "REQ-001",
//       residentName: "Juan Dela Cruz",
//       residentId: "RES-2023-001",
//       requestType: "medicine",
//       requestDetails: "Request for hypertension medication refill",
//       status: "pending",
//       dateSubmitted: "2023-11-15T09:30:00Z",
//       priority: "medium",
//       attachments: 1
//     },
//     // ... other mock data items
//   ];

//   const filteredRequests = useMemo(() => {
//     return requests.filter(request => {
//       const matchesSearch = 
//         request.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         request.residentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         request.requestDetails.toLowerCase().includes(searchQuery.toLowerCase());
      
//       const matchesStatus = statusFilter === "all" || request.status === statusFilter;
//       const matchesType = typeFilter === "all" || request.requestType === typeFilter;
//       const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
      
//       return matchesSearch && matchesStatus && matchesType && matchesPriority;
//     });
//   }, [requests, searchQuery, statusFilter, typeFilter, priorityFilter]);

//   const stats = [
//     { title: "Total Requests", value: requests.length, icon: null },
//     { title: "Pending", value: requests.filter(r => r.status === "pending").length, icon: <Clock size={16} color="#eab308" /> },
//     { title: "Approved", value: requests.filter(r => r.status === "approved").length, icon: <CheckCircle2 size={16} color="#3b82f6" /> },
//     { title: "Completed", value: requests.filter(r => r.status === "completed").length, icon: <CheckCircle2 size={16} color="#10b981" /> },
//     { title: "Rejected", value: requests.filter(r => r.status === "rejected").length, icon: <XCircle size={16} color="#ef4444" /> }
//   ];

//   const statusBadge = (status: RequestStatus) => {
//     const statusMap = {
//       pending: { text: "Pending", bg: "bg-yellow-100", textColor: "text-yellow-800" },
//       approved: { text: "Approved", bg: "bg-blue-100", textColor: "text-blue-800" },
//       rejected: { text: "Rejected", bg: "bg-red-100", textColor: "text-red-800" },
//       completed: { text: "Completed", bg: "bg-green-100", textColor: "text-green-800" }
//     };
//     return (
//       <Badge className={`${statusMap[status].bg} ${statusMap[status].textColor}`}>
//         {statusMap[status].text}
//       </Badge>
//     );
//   };

//   const priorityBadge = (priority: string) => {
//     const priorityMap = {
//       low: { text: "Low", bg: "bg-gray-100", textColor: "text-gray-800" },
//       medium: { text: "Medium", bg: "bg-blue-100", textColor: "text-blue-800" },
//       high: { text: "High", bg: "bg-red-100", textColor: "text-red-800" }
//     };
//     return (
//       <Badge className={`${priorityMap[priority].bg} ${priorityMap[priority].textColor}`}>
//         {priorityMap[priority].text}
//       </Badge>
//     );
//   };

//   return (
//     <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
//       <ScrollView className="flex-1 p-4">
//         {/* Header */}
//         <View className="flex-row justify-between items-center mb-6">
//           <View>
//             <Text className="text-2xl font-bold text-gray-800">Resident Requests</Text>
//             <Text className="text-sm text-gray-600">Manage all requests from residents</Text>
//           </View>
//           <View className="flex-row gap-2">
//             <Button variant="outline" size="sm" className="flex-row gap-2">
//               <RefreshCw size={16} />
//               <Text>Refresh</Text>
//             </Button>
//             <Button size="sm" className="flex-row gap-2 bg-blue-600">
//               <Download size={16} />
//               <Text>Export</Text>
//             </Button>
//           </View>
//         </View>

//         {/* Stats Cards */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
//           <View className="flex-row gap-3">
//             {stats.map((stat, index) => (
//               <Card key={index} className="w-32 p-3">
//                 <View className="flex-row justify-between items-center mb-2">
//                   <Text className="text-sm font-medium text-gray-600">{stat.title}</Text>
//                   {stat.icon}
//                 </View>
//                 <Text className="text-xl font-bold">{stat.value}</Text>
//               </Card>
//             ))}
//           </View>
//         </ScrollView>

//         {/* Filters */}
//         <View className="mb-6">
//           <Input
//             placeholder="Search requests..."
//             leftIcon={<Search size={16} color="#9ca3af" />}
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             className="mb-3"
//           />
          
//           <View className="flex-row gap-2">
//             <Select onValueChange={(value) => setStatusFilter(value as RequestStatus | "all")}>
//               <SelectTrigger className="flex-1">
//                 <View className="flex-row items-center gap-2">
//                   <Filter size={16} />
//                   <Text>{statusFilter === "all" ? "Status" : statusFilter}</Text>
//                 </View>
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Statuses</SelectItem>
//                 <SelectItem value="pending">Pending</SelectItem>
//                 <SelectItem value="approved">Approved</SelectItem>
//                 <SelectItem value="rejected">Rejected</SelectItem>
//                 <SelectItem value="completed">Completed</SelectItem>
//               </SelectContent>
//             </Select>

//             <Select onValueChange={setTypeFilter}>
//               <SelectTrigger className="flex-1">
//                 <Text>{typeFilter === "all" ? "Type" : typeFilter}</Text>
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Types</SelectItem>
//                 <SelectItem value="medicine">Medicine</SelectItem>
//                 <SelectItem value="appointment">Appointment</SelectItem>
//                 <SelectItem value="document">Document</SelectItem>
//                 <SelectItem value="service">Service</SelectItem>
//                 <SelectItem value="other">Other</SelectItem>
//               </SelectContent>
//             </Select>
//           </View>
//         </View>

//         {/* Tabs */}
//         <Tabs defaultValue="all" className="mb-6">
//           <TabsList>
//             <TabsTrigger value="all" onPress={() => setStatusFilter("all")}>
//               <Text>All</Text>
//             </TabsTrigger>
//             <TabsTrigger value="pending" onPress={() => setStatusFilter("pending")}>
//               <Text>Pending</Text>
//             </TabsTrigger>
//             <TabsTrigger value="approved" onPress={() => setStatusFilter("approved")}>
//               <Text>Approved</Text>
//             </TabsTrigger>
//             <TabsTrigger value="completed" onPress={() => setStatusFilter("completed")}>
//               <Text>Completed</Text>
//             </TabsTrigger>
//           </TabsList>
//         </Tabs>

//         {/* Requests Table */}
//         {filteredRequests.length === 0 ? (
//           <View className="p-8 items-center">
//             <Text className="text-gray-500">
//               {searchQuery || statusFilter !== "all" 
//                 ? "No requests found matching your criteria" 
//                 : "No requests available"}
//             </Text>
//           </View>
//         ) : (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableCell>Request ID</TableCell>
//                 <TableCell>Resident</TableCell>
//                 <TableCell>Type</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredRequests.map((request) => (
//                 <TableRow key={request.id}>
//                   <TableCell>
//                     <Text className="font-medium text-blue-600">{request.id}</Text>
//                   </TableCell>
//                   <TableCell>
//                     <View>
//                       <Text className="font-medium">{request.residentName}</Text>
//                       <Text className="text-sm text-gray-500">{request.residentId}</Text>
//                     </View>
//                   </TableCell>
//                   <TableCell>
//                     <Text>{request.requestType}</Text>
//                   </TableCell>
//                   <TableCell>
//                     {statusBadge(request.status)}
//                   </TableCell>
//                   <TableCell>
//                     <View className="flex-row gap-2">
//                       <Button variant="outline" size="sm">
//                         <Text>View</Text>
//                       </Button>
//                       {request.status === "pending" && (
//                         <>
//                           <Button size="sm" className="bg-blue-600">
//                             <Text>Approve</Text>
//                           </Button>
//                         </>
//                       )}
//                     </View>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}

//         <View className="mt-4">
//           <Text className="text-sm text-gray-600">
//             Showing {filteredRequests.length} of {requests.length} requests
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }