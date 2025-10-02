// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { View, Text, FlatList, TouchableOpacity } from "react-native";
// import { Link } from "expo-router";
// import {
//   Plus,
//   ArrowUp,
//   ArrowDown,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   Users,
//   Home,
//   UserCog,
//   FileInput,
// } from "lucide-react-native";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { usePatients } from "../restful-api/patientsrecord/queries/fetch";

// type Report = {
//   id: string;
//   sitio: string;
//   lastName: string;
//   firstName: string;
//   mi: string;
//   type: string;
//   noOfRecords?: number;
// };

// interface Patients {
//   pat_id: string;
//   pat_type: string;
//   personal_info: {
//     per_fname: string;
//     per_lname: string;
//     per_mname: string;
//   };
//   address: {
//     add_sitio?: string;
//   };
// }

// const transformPatientsToReports = (patients: Patients[]): Report[] => {
//   return patients.map((patient) => ({
//     id: patient.pat_id.toString(),
//     sitio: patient.address?.add_sitio || "N/A",
//     lastName: patient.personal_info?.per_lname || "",
//     firstName: patient.personal_info?.per_fname || "",
//     mi: patient.personal_info?.per_mname || "N/A",
//     type: patient.pat_type || "Resident",
//   }));
// };

// // Custom pagination component for mobile
// const CustomPagination = ({
//   currentPage,
//   totalPages,
//   onPageChange,
// }: {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
// }) => (
//   <View className="flex flex-row items-center justify-center gap-x-2">
//     <Button
//       variant="outline"
//       size="icon"
//       onPress={() => onPageChange(currentPage - 1)}
//       disabled={currentPage === 1}
//     >
//       <ChevronLeft className="h-4 w-4" />
//     </Button>
//     <Text className="text-sm font-semibold">
//       {currentPage} of {totalPages}
//     </Text>
//     <Button
//       variant="outline"
//       size="icon"
//       onPress={() => onPageChange(currentPage + 1)}
//       disabled={currentPage === totalPages}
//     >
//       <ChevronRight className="h-4 w-4" />
//     </Button>
//   </View>
// );

// export default function PatientsRecord() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pageSize, setPageSize] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filteredData, setFilteredData] = useState<Report[]>([]);
//   const { data: patientData, isLoading } = usePatients();

//   const transformedPatients = useMemo(() => {
//     if (!patientData) return [];
//     return transformPatientsToReports(patientData);
//   }, [patientData]);

//   const totalPatients = transformedPatients.length;
//   const residents = transformedPatients.filter((p) =>
//     p.type.includes("Resident")
//   ).length;
//   const transients = transformedPatients.filter((p) =>
//     p.type.includes("Transient")
//   ).length;
//   const residentPercentage =
//     totalPatients > 0 ? Math.round((residents / totalPatients) * 100) : 0;
//   const transientPercentage =
//     totalPatients > 0 ? Math.round((transients / totalPatients) * 100) : 0;

//   useEffect(() => {
//     const filtered = transformedPatients.filter((report) => {
//       const searchText =
//         `${report.id} ${report.sitio} ${report.lastName} ${report.firstName} ${report.mi} ${report.type}`.toLowerCase();
//       return searchText.includes(searchQuery.toLowerCase());
//     });
//     setFilteredData(filtered);
//     setCurrentPage(1); // Reset to first page on search
//   }, [searchQuery, transformedPatients]);

//   const totalPages = Math.ceil(filteredData.length / pageSize);
//   const startIndex = (currentPage - 1) * pageSize;
//   const endIndex = startIndex + pageSize;
//   const currentData = filteredData.slice(startIndex, endIndex);

//   return (
//     <View className="flex-1 p-4 bg-background">
//       {/* Back button and title (adapted from LayoutWithBack) */}
//       <View className="flex-row items-center justify-between mb-6">
//         <View>
//           <Text className="text-2xl font-bold">Patients Records</Text>
//           <Text className="text-sm text-muted-foreground">
//             Manage and view patients information
//           </Text>
//         </View>
//       </View>

//       {/* Stats Cards */}
//       <View className="flex-row justify-between mb-4">
//         <Card className="flex-1 mx-1">
//           <CardHeader>
//             <Text className="text-sm font-semibold">Total Patients</Text>
//             <Text className="text-xs text-muted-foreground">
//               All registered patients
//             </Text>
//           </CardHeader>
//           <CardContent className="flex flex-row items-center justify-between">
//             <Text className="text-3xl font-bold">{totalPatients}</Text>
//             <Users size={24} className="text-muted-foreground" />
//           </CardContent>
//         </Card>
//       </View>

//       {/* Search and Filter */}
//       <View className="relative w-full mb-4">
//         <View className="flex-row gap-x-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={20} />
//             <Input
//               placeholder="Search..."
//               className="pl-10 w-full"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" className="w-24">
//                 <Text>Filter</Text>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-40">
//               <DropdownMenuItem onPress={() => setFilteredData(transformedPatients)}>
//                 <Text>All</Text>
//               </DropdownMenuItem>
//               <DropdownMenuItem onPress={() => setFilteredData(transformedPatients.filter(p => p.type.includes("Resident")))}>
//                 <Text>Resident</Text>
//               </DropdownMenuItem>
//               <DropdownMenuItem onPress={() => setFilteredData(transformedPatients.filter(p => p.type.includes("Transient")))}>
//                 <Text>Transient</Text>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </View>
//       </View>

//         <FlatList
//           data={currentData}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <Card className="mb-4">
//               <CardHeader>
//                 <CardTitle>{`${item.firstName} ${item.mi} ${item.lastName}`}</CardTitle>
//                 <CardDescription>Patient ID: {item.id}</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 <View>
//                   <Text className="font-semibold">Sitio:</Text>
//                   <Text>{item.sitio}</Text>
//                 </View>
//                 <View>
//                   <Text className="font-semibold">Type:</Text>
//                   <Text>{item.type}</Text>
//                 </View>
//                 <View>
//                   <Text className="font-semibold">Records:</Text>
//                   {/* NOTE: You need to implement PatientRecordCount for React Native */}
//                   {/* <PatientRecordCount patientId={item.id} /> */}
//                 </View>
//                 <RouterLink
//         to={`/view-patients-record/${row.getValue("id")}`}
//         state={{ patientId: row.getValue("id") }}
//       >
//         <Button variant="outline">View</Button>
//       </RouterLink>
//                   <Button className="mt-2 w-full">
//                     <Text>View</Text>
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           )}
//         />

//       {/* Pagination & Info */}
//       <View className="flex-col items-center justify-between w-full py-3">
//         <Text className="text-sm font-normal text-gray-500 mb-2">
//           Showing{" "}
//           {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
//           {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//           {filteredData.length} patients
//         </Text>
//         <CustomPagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//         />
//       </View>
//     </View>
//   );
// }