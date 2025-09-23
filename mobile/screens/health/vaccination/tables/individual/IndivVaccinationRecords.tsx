// import React, { useState, useEffect } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ArrowUpDown, Search, ChevronLeft, AlertCircle } from "lucide-react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown/dropdown-menu";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { Syringe,Loader2 } from "lucide-react";
// import { IndivVaccineColumns } from "../columns/indiv_vac-col";
// import { PatientInfoCard } from "@/components/ui//patientInfoCard";
// import { Label } from "@/components/ui/label";
// import { Patient } from "@/pages/healthServices/restful-api-patient/type";
// import { filter } from "../columns/types";
// import {
//   useIndivPatientVaccinationRecords,
//   useFollowupVaccines,
//   useUnvaccinatedVaccines,
//   usePatientVaccinationDetails,
// } from "../../queries/fetch";
// import { VaccinationStatusCards } from "@/components/ui/vaccination-status";
// import { FollowUpsCard } from "@/components/ui/ch-vac-followup";
// import { VaccinationStatusCardsSkeleton } from "@/pages/healthServices/skeleton/vaccinationstatus-skeleton";

// export default function IndivVaccinationRecords() {
//   const location = useLocation();
//   const { params } = location.state || {};
//   const { patientData } = params || {};
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pageSize, setPageSize] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filter, setfilter] = useState<filter>("all");

//   // Guard clause for missing patientData
//   if (!patientData?.pat_id) {
//     return <div>Error: Patient ID not provided</div>;
//   }
//   const [selectedPatientData, setSelectedPatientData] =
//     useState<Patient | null>(null);

//   useEffect(() => {
//     // Get patient data from route state
//     if (location.state?.params?.patientData) {
//       const patientData = location.state.params.patientData;
//       setSelectedPatientData(patientData);
//     }
//   }, [location.state]);
//   const { data: vaccinationRecords, isLoading: isVaccinationRecordsLoading } =
//     useIndivPatientVaccinationRecords(patientData?.pat_id);

//   const vaccinationCount = vaccinationRecords?.length ?? 0;

//   const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } =
//     useUnvaccinatedVaccines(
//       patientData?.pat_id,
//       patientData.personal_info.per_dob
//     );

//   const { data: followupVaccines = [], isLoading: isFollowVaccineLoading } =
//     useFollowupVaccines(patientData?.pat_id);
//   const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } =
//     usePatientVaccinationDetails(patientData?.pat_id);

//   const isLoading =
//     isCompleteVaccineLoading ||
//     isUnvaccinatedLoading ||
//     isFollowVaccineLoading ||
//     isVaccinationRecordsLoading;
//   const filteredData = React.useMemo(() => {
//     if (!vaccinationRecords) return [];
//     return vaccinationRecords.filter((record) => {
//       const searchText =
//         `${record.vachist_id} ${record.vaccine_name} ${record.batch_number} ${record.vachist_doseNo} ${record.vachist_status}`.toLowerCase();
//       const matchesSearch = searchText.includes(searchQuery.toLowerCase());
//       const matchesFilter = true;
//       // if (filter !== "all") {
//       //   const status = (record.vachist_status ?? "").toLowerCase();
//       //   if (filter === "partially_vaccinated") {
//       //     matchesFilter = status === "partially vaccinated";
//       //   } else if (filter === "completed") {
//       //     matchesFilter = status === "completed";
//       //   }
//       // }
//       return matchesSearch && matchesFilter;
//     });
//   }, [searchQuery, vaccinationRecords, filter]);

//   const totalPages = Math.ceil(filteredData.length / pageSize);
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );
//   // In your IndivVaccinationRecords component:
//   const columns = IndivVaccineColumns(patientData, vaccinationRecords || []);
//   return (
//     <>
//       <div className="flex flex-col sm:flex-row gap-4 ">
//         <Button
//           className="text-black p-2 mb-2 self-start"
//           variant={"outline"}
//           onClick={() => navigate(-1)}
//         >
//           <ChevronLeft />
//         </Button>
//         <div className="flex-col items-center mb-4">
//           <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//             Vaccination Records
//           </h1>
//           <p className="text-xs sm:text-sm text-darkGray">
//             Manage and view patient's vaccination records
//           </p>
//         </div>
//       </div>
//       <hr className="border-gray mb-5 sm:mb-8" />

//       <div className="   border-gray-200  mb-4">
//         {selectedPatientData ? (
//           <div className="mb-4">
//             <PatientInfoCard patient={selectedPatientData} />
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertCircle className="h-4 w-4 text-yellow-500" />
//               <Label className="text-base font-semibold text-yellow-500">
//                 No patient selected
//               </Label>
//             </div>
//             <p className="text-sm text-gray-700">
//               Please select a patient from the medicine records page first.
//             </p>
//           </div>
//         )}

//         {isLoading ? (
//           <VaccinationStatusCardsSkeleton />
//         ) : (
//           <>
//             <div className="flex flex-col lg:flex-row gap-6 mb-4">
//               <div className="w-full">
//                 <VaccinationStatusCards
//                   unvaccinatedVaccines={unvaccinatedVaccines}
//                   vaccinations={vaccinations}
//                 />
//               </div>

//               <div className="w-full">
//                 <FollowUpsCard followupVaccines={followupVaccines} />
//               </div>
//             </div>
//           </>
//         )}

//         <div className="flex flex-col sm:flex-row w-full items-center mb-4 gap-4 sm:gap-2">
//           <div className="flex flex-col sm:flex-row gap-4 w-full">
//             <div className="flex flex-col sm:flex-row gap-2 items-center justify-center ">
//               <div className="flex items-center justify-center">
//                 <Syringe className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-800 pr-2 text-center sm:text-left">
//                   Total Medicine Records
//                 </p>
//               </div>
//               <p className="text-2xl font-bold text-gray-900 text-center sm:text-left">
//                 {vaccinationCount ?? 0}
//               </p>
//             </div>
//             <div className="relative flex-1 w-full">
//               <Search
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
//                 size={17}
//               />
//               <Input
//                 placeholder="Search records..."
//                 className="pl-10 bg-white w-full"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 w-full sm:w-auto">
//             {/* <div className="w-full sm:w-auto">
//                   <SelectLayout
//                     placeholder="Filter"
//                     label=""
//                     className="bg-white w-full sm:w-48"
//                     options={[
//                       { id: "all", name: "All" },
//                       {
//                         id: "partially_vaccinated",
//                         name: "partially vaccinated",
//                       },
//                       { id: "completed", name: "completed" },
//                     ]}
//                     value={filter}
//                     onChange={(value) => setfilter(value as filter)}
//                   />
//                 </div> */}
//             <Button className="w-full sm:w-auto">
//               <Link
//                 to="/vaccination-record-form"
//                 state={{
//                   mode: "addnewvaccination_record",
//                   params: { patientData },
//                 }}
//               >
//                 New Vaccination Record
//               </Link>
//             </Button>
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
//                     <ArrowUpDown className="mr-2 h-4 w-4" />
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

//           {isLoading ? (
//             <div className="w-full h-[100px] flex items-center justify-center">
//               <Loader2 className="h-8 w-8 animate-spin text-primary" />
//               <span className="ml-2">loading....</span>
//             </div>
//           ) : (
//             <DataTable columns={columns} data={paginatedData} />
//           )}
//           </div>

//           <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//             <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//               Showing{" "}
//               {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
//               {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//               {filteredData.length} records
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
