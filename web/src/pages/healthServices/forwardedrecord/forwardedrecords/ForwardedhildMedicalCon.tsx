// import React, { useState } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Button } from "@/components/ui/button/button";
// import { Input } from "@/components/ui/input";
// import { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown, Eye, Search, ChevronLeft } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Toaster } from "sonner";
// import { api2 } from "@/api/api";
// import { calculateAge } from "@/helpers/ageCalculator";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { FileInput } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown/dropdown-menu";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";

// export interface ChildPatientRecord {
//   pat_id: string;
//   fname: string;
//   lname: string;
//   mname: string;
//   sex: string;
//   age: string;
//   dob: string;
//   householdno: string;
//   street: string;
//   sitio: string;
//   barangay: string;
//   city: string;
//   province: string;
//   pat_type: string;
//   address: string;
// }

// export interface ChildHealthCheckupRecord {
//   chhist_id: string;
//   chrec_details: {
//     ufc_no: string;
//     family_no: string;
//     mother_occupation: string;
//     father_occupation: string;
//     type_of_feeding: string;
//     newborn_screening: string;
//     place_of_delivery_type: string;
//     birth_order: number;
//     pod_location: string;
//     created_at: string;
//   };
//   created_at: string;
//   tt_status: string;
//   status: string;
// }

// export interface ChildHealthCheckupHistory extends ChildPatientRecord {
//   checkup: ChildHealthCheckupRecord;
// }

// export default function ChildHealthCheckupHistory() {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pageSize, setPageSize] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [statusFilter, setStatusFilter] = useState("all");

//   const { data: CheckupHistory, isLoading } = useQuery({
//     queryKey: ["ChildHealthCheckupHistory"],
//     queryFn: async () => {
//       const response = await api2.get("/child-health/history/checkup/");
//       return response.data || [];
//     },
//   });

//   const formatCheckupHistoryData = React.useCallback((): ChildHealthCheckupHistory[] => {
//     if (!CheckupHistory) return [];

//     return CheckupHistory.map((record: any) => {
//       const details = record.chrec_details.patrec_details?.pat_details || {};
//       const info = details.personal_info || {};
//       const address = details.address || {};

//       // Construct address string
//       const addressParts = [
//         address.add_sitio ? `Sitio ${address.add_sitio}` : '',
//         address.add_street,
//         address.add_barangay, 
//         address.add_city,
//         address.add_province
//       ].filter(Boolean).join(", ");
      
//       const fullAddress = address.full_address || addressParts || "";

//       const patientRecord: ChildPatientRecord = {
//         pat_id: details.pat_id || '',
//         fname: info.per_fname || '',
//         lname: info.per_lname || '',
//         mname: info.per_mname || '',
//         sex: info.per_sex || '',
//         age: calculateAge(info.per_dob).toString(),
//         dob: info.per_dob || '',
//         householdno: details.households?.[0]?.hh_id || "N/A",
//         street: address.add_street || '',
//         sitio: address.add_sitio || '',
//         barangay: address.add_barangay || '',
//         city: address.add_city || '',
//         province: address.add_province || '',
//         pat_type: details.pat_type || '',
//         address: fullAddress,
//       };

//       const checkupRecord: ChildHealthCheckupRecord = {
//         chhist_id: record.chhist_id,
//         chrec_details: {
//           ufc_no: record.chrec_details.ufc_no || 'N/A',
//           family_no: record.chrec_details.family_no || 'N/A',
//           mother_occupation: record.chrec_details.mother_occupation || 'Not specified',
//           father_occupation: record.chrec_details.father_occupation || 'Not specified',
//           type_of_feeding: record.chrec_details.type_of_feeding || 'Not specified',
//           newborn_screening: record.chrec_details.newborn_screening || 'Not done',
//           place_of_delivery_type: record.chrec_details.place_of_delivery_type || 'Not specified',
//           birth_order: record.chrec_details.birth_order || 0,
//           pod_location: record.chrec_details.pod_location || 'Not specified',
//           created_at: record.chrec_details.created_at || '',
//         },
//         created_at: record.created_at || '',
//         tt_status: record.tt_status || 'Not vaccinated',
//         status: record.status || 'check-up',
//       };

//       return {
//         ...patientRecord,
//         checkup: checkupRecord,
//       };
//     });
//   }, [CheckupHistory]);

//   const filteredData = React.useMemo(() => {
//     return formatCheckupHistoryData().filter((record: ChildHealthCheckupHistory) => {
//       const searchText = `${record.pat_id} ${record.lname} ${record.fname} ${record.checkup.tt_status}`.toLowerCase();
      
//       const statusMatches = 
//         statusFilter === "all" || 
//         record.checkup.status.toLowerCase() === statusFilter.toLowerCase();

//       return searchText.includes(searchQuery.toLowerCase()) && statusMatches;
//     });
//   }, [searchQuery, formatCheckupHistoryData, statusFilter]);

//   const totalPages = Math.ceil(filteredData.length / pageSize);
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const columns: ColumnDef<ChildHealthCheckupHistory>[] = [
//     {
//       accessorKey: "patient",
//       header: ({ column }) => (
//         <div className="flex w-full justify-center items-center gap-2 cursor-pointer"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
//           Patient <ArrowUpDown size={15} />
//         </div>
//       ),
//       cell: ({ row }) => {
//         const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
//         return (
//           <div className="flex justify-start min-w-[200px] px-2">
//             <div className="flex flex-col w-full">
//               <div className="font-medium truncate">{fullName}</div>
//               <div className="text-sm text-gray-500">
//                 {row.original.sex}, {row.original.age} 
//               </div>
//               <div className="text-xs text-gray-500">
//                 ID: {row.original.pat_id}
//               </div>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "birth_details",
//       header: "Birth Details",
//       cell: ({ row }) => {
//         const details = row.original.checkup.chrec_details;
//         return (
//           <div className="grid grid-cols-1 gap-1 text-sm min-w-[180px]">
//             <div>Birth Order: {details.birth_order}</div>
//             <div>Delivery: {details.place_of_delivery_type}</div>
//             <div>Location: {details.pod_location || 'N/A'}</div>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "parent_info",
//       header: "Parent Info",
//       cell: ({ row }) => {
//         const details = row.original.checkup.chrec_details;
//         return (
//           <div className="text-sm min-w-[180px]">
//             <div>Mother: {details.mother_occupation}</div>
//             <div>Father: {details.father_occupation}</div>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "feeding",
//       header: "Feeding",
//       cell: ({ row }) => (
//         <div className="text-sm min-w-[120px]">
//           {row.original.checkup.chrec_details.type_of_feeding.replace('_', ' ')}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "vaccination",
//       header: "TT Status",
//       cell: ({ row }) => (
//         <div className="text-sm min-w-[100px]">
//           {row.original.checkup.tt_status}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "newborn_screening",
//       header: "Newborn Screening",
//       cell: ({ row }) => (
//         <div className="text-sm min-w-[150px]">
//           {row.original.checkup.chrec_details.newborn_screening}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "address",
//       header: "Address",
//       cell: ({ row }) => (
//         <div className="flex justify-start px-2">
//           <div className="w-[250px] break-words">{row.original.address || "No address provided"}</div>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "action",
//       header: "Action",
//       cell: ({ row }) => (
//         <div className="flex justify-center gap-2">
//           <Link
//             to={`/child-health/checkup/${row.original.checkup.chhist_id}`}
//             state={{ 
//               patientData: {
//                 pat_id: row.original.pat_id,
//                 pat_type: row.original.pat_type,
//                 age: row.original.age,
//                 addressFull: row.original.address,
//                 address: {
//                   add_street: row.original.street,
//                   add_barangay: row.original.barangay,
//                   add_city: row.original.city,
//                   add_province: row.original.province,
//                   sitio: row.original.sitio,
//                 },
//                 households: [{ hh_id: row.original.householdno }],
//                 personal_info: {
//                   per_fname: row.original.fname,
//                   per_mname: row.original.mname,
//                   per_lname: row.original.lname,
//                   per_dob: row.original.dob,
//                   per_sex: row.original.sex,
//                 },
//               },
//               checkupData: row.original.checkup 
//             }}
//           >
//             <Button variant="outline" size="sm">
//               <Eye className="h-4 w-4" />
//             </Button>
//           </Link>
//         </div>
//       ),
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div className="w-full h-full">
//         <Skeleton className="h-10 w-1/6 mb-3" />
//         <Skeleton className="h-7 w-1/4 mb-6" />
//         <Skeleton className="h-10 w-full mb-4" />
//         <Skeleton className="h-4/5 w-full mb-4" />
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="w-full h-full flex flex-col">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <Button
//             className="text-black p-2 mb-2 self-start"
//             variant={"outline"}
//             onClick={() => navigate(-1)}
//           >
//             <ChevronLeft />
//           </Button>
//           <div className="flex-col items-center mb-4">
//             <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//               Child Health Checkup History
//             </h1>
//             <p className="text-xs sm:text-sm text-darkGray">
//               View and manage child health checkup records
//             </p>
//           </div>
//         </div>
//         <hr className="border-gray mb-5 sm:mb-8" />

//         <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
//           <div className="w-full flex flex-col sm:flex-row gap-2">
//             <div className="relative flex-1">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//                 size={17}
//               />
//               <Input
//                 placeholder="Search patients, ID, or TT status..."
//                 className="pl-10 bg-white w-full"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <SelectLayout
//               placeholder="Filter status"
//               label=""
//               className="bg-white w-full sm:w-48"
//               options={[
//                 { id: "all", name: "All Status" },
//                 { id: "check-up", name: "Check-up" },
//                 { id: "follow-up", name: "Follow-up" },
//               ]}
//               value={statusFilter}
//               onChange={(value) => setStatusFilter(value)}
//             />
//           </div>
//         </div>

//         <div className="h-full w-full rounded-md">
//           <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
//             <div className="flex gap-x-2 items-center">
//               <p className="text-xs sm:text-sm">Show</p>
//               <Input
//                 type="number"
//                 className="w-14 h-8"
//                 value={pageSize}
//                 onChange={(e) => {
//                   const value = +e.target.value;
//                   setPageSize(value >= 1 ? value : 1);
//                 }}
//                 min="1"
//               />
//               <p className="text-xs sm:text-sm">Entries</p>
//             </div>
//             <div>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" aria-label="Export data">
//                     <FileInput className="mr-2 h-4 w-4" />
//                     Export
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   <DropdownMenuItem>Export as CSV</DropdownMenuItem>
//                   <DropdownMenuItem>Export as Excel</DropdownMenuItem>
//                   <DropdownMenuItem>Export as PDF</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//           <div className="bg-white w-full overflow-x-auto">
//             <DataTable columns={columns} data={paginatedData} />
//           </div>
//           <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//             <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//               Showing{" "}
//               {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
//               {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//               {filteredData.length} rows
//             </p>

//             <div className="w-full sm:w-auto flex justify-center">
//               <PaginationLayout
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={setCurrentPage}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//       <Toaster />
//     </>
//   );
// }