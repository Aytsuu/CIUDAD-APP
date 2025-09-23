// // src/features/vaccination/pages/AllVaccinationRecords.tsx
// import React, { useState } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Search, FileInput, Users2, Loader2 } from "lucide-react";
// import { Link } from "react-router-dom";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown/dropdown-menu";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { useVaccinationRecords } from "../../queries/fetch";
// import { calculateAge } from "@/helpers/ageCalculator";
// import CardLayout from "@/components/ui/card/card-layout";
// import { vaccinationColumns } from "../columns/all-vac-col";
// import {
//   BasicInfoVaccinationRecord,
//   VaccinationCounts,
// } from "../columns/types";

// export default function AllVaccinationRecords() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pageSize, setPageSize] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [patientTypeFilter, setPatientTypeFilter] = useState<string>("all");

//   const { data: basicInfoVaccinationRecord, isLoading } =
//     useVaccinationRecords();

//   const formatVaccinationData =
//     React.useCallback((): BasicInfoVaccinationRecord[] => {
//       if (!basicInfoVaccinationRecord) return [];

//       return basicInfoVaccinationRecord.map((record: any) => {
//         const info = record.patient_details.personal_info || {};
//         const address = record.patient_details.address || {};

//         const addressString =
//           [
//             address.add_street,
//             address.add_barangay,
//             address.add_city,
//             address.add_province,
//           ]
//             .filter((part) => part && part.trim().length > 0)
//             .join(", ") || "";

//         return {
//           pat_id: record.pat_id,
//           fname: info.per_fname || "",
//           lname: info.per_lname || "",
//           mname: info.per_mname || "",
//           sex: info.per_sex || "",
//           age: calculateAge(info.per_dob).toString(),
//           dob: info.per_dob || "",
//           householdno: record.patient_details?.households?.[0]?.hh_id || "",
//           street: address.add_street || "",
//           sitio: address.add_sitio || "",
//           barangay: address.add_barangay || "",
//           city: address.add_city || "",
//           province: address.add_province || "",
//           pat_type: record.patient_details.pat_type || "",
//           address: addressString,
//           vaccination_count: record.vaccination_count || 0,
//         };
//       });
//     }, [basicInfoVaccinationRecord]);

//   const { residentCount, transientCount, totalCount }: VaccinationCounts =
//     React.useMemo(() => {
//       const formattedData = formatVaccinationData();
//       const resident = formattedData.filter(
//         (record) => record.pat_type.toLowerCase() === "resident"
//       ).length;
//       const transient = formattedData.filter(
//         (record) => record.pat_type.toLowerCase() === "transient"
//       ).length;
//       const total = formattedData.length;

//       return {
//         residentCount: resident,
//         transientCount: transient,
//         totalCount: total,
//       };
//     }, [formatVaccinationData]);

//   const filteredData = React.useMemo(() => {
//     return formatVaccinationData().filter((record) => {
//       const searchText = `${record.pat_id} 
//         ${record.lname} 
//         ${record.fname} 
//         ${record.sitio}`.toLowerCase();

//       const typeMatches =
//         patientTypeFilter === "all" ||
//         record.pat_type.toLowerCase() === patientTypeFilter.toLowerCase();

//       return searchText.includes(searchQuery.toLowerCase()) && typeMatches;
//     });
//   }, [searchQuery, formatVaccinationData, patientTypeFilter]);

//   const totalPages = Math.ceil(filteredData.length / pageSize);
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   return (
//     <>
//       <div className="w-full h-full flex flex-col">
//         {/* Vaccination Counts Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           <CardLayout
//             title={
//               <div className="flex gap-2">
//                 <Users2 className="w-5 h-5" />
//                 <span>Resident Vaccinated</span>
//               </div>
//             }
//             content={
//               <div className="text-2xl font-bold px-6 text-blue-600">
//                 {residentCount}
//               </div>
//             }
//           />

//           <CardLayout
//             title={
//               <div className="flex gap-2">
//                 <Users2 className="w-5 h-5 " />
//                 <span>Transient Vaccinated</span>
//               </div>
//             }
//             content={
//               <div className="text-2xl font-bold px-6  ">{transientCount}</div>
//             }
//           />

//           <CardLayout
//             title={
//               <div className="flex gap-2">
//                 <Users2 className="w-5 h-5 " />
//                 <span>Total Vaccinated</span>
//               </div>
//             }
//             content={
//               <div className="text-2xl font-bold px-6  ">{totalCount}</div>
//             }
//           />
//         </div>

//         <div className="w-full flex flex-col sm:flex-row gap-2 mb-2 mt-4">
//           <div className="w-full flex flex-col sm:flex-row gap-2">
//             <div className="relative flex-1">
//               <Search
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
//                 size={17}
//               />
//               <Input
//                 placeholder="Search..."
//                 className="pl-10 bg-white w-full"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <SelectLayout
//               placeholder="Filter records"
//               label=""
//               className="bg-white w-full sm:w-48"
//               options={[
//                 { id: "all", name: "All Types" },
//                 { id: "resident", name: "Resident" },
//                 { id: "transient", name: "Transient" },
//               ]}
//               value={patientTypeFilter}
//               onChange={(value) => setPatientTypeFilter(value)}
//             />
//           </div>

//           <div className="w-full sm:w-auto">
//             <Button className="w-full sm:w-auto">
//               <Link
//                 to="/vaccination-record-form"
//                 state={{ mode: "newvaccination_record" }}
//               >
//                 New Record
//               </Link>
//             </Button>
//           </div>
//         </div>

//         {/* Table Container */}
//         <div className="h-full w-full rounded-md">
//           <div className="w-full h-auto sm:h-16 bg-white flex sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
//             <div className="flex gap-x-3 justify-start items-center">
//               <p className="text-xs sm:text-sm">Show</p>
//               <Input
//                 type="number"
//                 className="w-[70px] h-8 flex items-center justify-center text-center"
//                 value={pageSize}
//                 onChange={(e) => {
//                   const value = +e.target.value;
//                   setPageSize(value >= 1 ? value : 1);
//                 }}
//                 min="1"
//               />
//               <p className="text-xs sm:text-sm">Entries</p>
//             </div>
//             <div className="flex justify-end sm:justify-start">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button
//                     variant="outline"
//                     aria-label="Export data"
//                     className="flex items-center gap-2"
//                   >
//                     <FileInput />
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
//             {isLoading ? (
//               <div className="w-full h-[100px] flex items-center justify-center">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                 <span className="ml-2">loading....</span>
//               </div>
//             ) : (
//               <DataTable columns={vaccinationColumns} data={paginatedData} />
//             )}
//           </div>
//           <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 ">
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
//     </>
//   );
// }
