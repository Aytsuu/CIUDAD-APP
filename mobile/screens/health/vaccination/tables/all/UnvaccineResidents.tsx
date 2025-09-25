// "use client";

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Search } from "lucide-react";
// import { calculateAge, getAgeInUnit } from "@/helpers/ageCalculator";
// import { Link } from "react-router-dom";
// import { useUnvaccinatedResidents } from "../../queries/fetch";
// import type {
//   Resident,
//   UnvaccinatedResident,
//   GroupedResidents,
// } from "../columns/types";
// import { ResidentListPanel } from "./ResidentListDialog";
// import { Loader2 } from "lucide-react";

// export default function UnvaccinatedResidents() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { data: unvaccinated, isLoading } = useUnvaccinatedResidents();

//   const [panelOpen, setPanelOpen] = useState(false);
//   const [currentPanelTitle, setCurrentPanelTitle] = useState("");
//   const [currentPanelResidents, setCurrentPanelResidents] = useState<
//     UnvaccinatedResident[]
//   >([]);

//   // Get all vaccine names from the API response
//   const allVaccineNames = React.useMemo(() => {
//     if (!unvaccinated || typeof unvaccinated !== "object") return [];
//     return Object.keys(unvaccinated);
//   }, [unvaccinated]);

//   // Flatten and format all residents
//   const allResidents: UnvaccinatedResident[] = React.useMemo(() => {
//     if (!unvaccinated || typeof unvaccinated !== "object") return [];
//     return Object.entries(unvaccinated).flatMap(([vaccine_name, residents]) =>
//       Array.isArray(residents) && residents.length > 0
//         ? residents.map((resident: Resident) => ({
//             vaccine_name:
//               resident.vaccine_not_received?.vac_name || vaccine_name,
//             pat_id: resident.pat_id?.toString() || "N/A",
//             fname: resident.personal_info?.per_fname || "N/A",
//             lname: resident.personal_info?.per_lname || "N/A",
//             mname: resident.personal_info?.per_mname || null,
//             sex: resident.personal_info?.per_sex || "N/A",
//             dob: resident.personal_info?.per_dob || "N/A",
//             age: resident.personal_info?.per_dob
//               ? calculateAge(resident.personal_info.per_dob).toString()
//               : "N/A",
//             sitio: resident.personal_info?.per_addresses?.[0]?.sitio || "N/A",
//             address: [
//               resident.personal_info?.per_addresses?.[0]?.add_street,
//               resident.personal_info?.per_addresses?.[0]?.sitio,
//               resident.personal_info?.per_addresses?.[0]?.add_barangay,
//               resident.personal_info?.per_addresses?.[0]?.add_city,
//               resident.personal_info?.per_addresses?.[0]?.add_province,
//             ]
//               .filter(Boolean)
//               .join(", "),
//             pat_type: "Resident",
//             age_group_name:
//               resident.vaccine_not_received?.age_group?.agegroup_name ||
//               "Unknown Age Group",
//             min_age: resident.vaccine_not_received?.age_group?.min_age || 0,
//             max_age: resident.vaccine_not_received?.age_group?.max_age || 0,
//             time_unit:
//               resident.vaccine_not_received?.age_group?.time_unit || "NA",
//           }))
//         : []
//     );
//   }, [unvaccinated]);

//   // Group residents by vaccine and age group
//   const groupedData: GroupedResidents = React.useMemo(() => {
//     const groups: GroupedResidents = {};

//     allVaccineNames.forEach((vaccineName) => {
//       groups[vaccineName] = {};
//     });

//     allResidents.forEach((resident) => {
//       const vaccineName = resident.vaccine_name;
//       const ageGroupName = resident.age_group_name;
//       const groupMinAge = resident.min_age;
//       const groupMaxAge = resident.max_age;
//       const groupTimeUnit = resident.time_unit;

//       let shouldIncludeResidentInGroup = true;

//       if (resident.dob && groupTimeUnit !== "NA") {
//         const residentAgeInUnit = getAgeInUnit(
//           resident.dob,
//           groupTimeUnit as "years" | "months" | "weeks" | "days"
//         );
//         if (
//           residentAgeInUnit < groupMinAge ||
//           residentAgeInUnit > groupMaxAge
//         ) {
//           shouldIncludeResidentInGroup = false;
//         }
//       } else if (
//         !resident.dob &&
//         (groupMinAge !== 0 || groupMaxAge !== 0) &&
//         groupTimeUnit !== "NA"
//       ) {
//         shouldIncludeResidentInGroup = false;
//       }

//       if (shouldIncludeResidentInGroup) {
//         groups[vaccineName] = groups[vaccineName] || {};
//         groups[vaccineName][ageGroupName] =
//           groups[vaccineName][ageGroupName] || [];
//         groups[vaccineName][ageGroupName].push(resident);
//       }
//     });

//     return groups;
//   }, [allResidents, allVaccineNames]);

//   // Filter vaccine cards based on search query
//   const filteredVaccineNames = React.useMemo(() => {
//     if (!searchQuery.trim()) return allVaccineNames;

//     const query = searchQuery.toLowerCase();

//     return allVaccineNames.filter((vaccineName) => {
//       // Check vaccine name match
//       if (vaccineName.toLowerCase().includes(query)) return true;

//       // Check age groups in this vaccine
//       const ageGroups = groupedData[vaccineName] || {};
//       return Object.entries(ageGroups).some(([ageGroupName, residents]) => {
//         if (!residents || residents.length === 0) return false;

//         const firstResident = residents[0];
//         const ageRange =
//           firstResident &&
//           firstResident.min_age !== undefined &&
//           firstResident.max_age !== undefined
//             ? `${firstResident.min_age}-${firstResident.max_age}`
//             : "";

//         // Check age group name or age range match
//         return (
//           ageGroupName.toLowerCase().includes(query) ||
//           ageRange.includes(searchQuery) // exact match for numbers
//         );
//       });
//     });
//   }, [searchQuery, allVaccineNames, groupedData]);

//   const handleOpenPanel = (
//     vaccineName: string,
//     ageGroupName: string,
//     residents: UnvaccinatedResident[]
//   ) => {
//     setCurrentPanelTitle(`${vaccineName} - ${ageGroupName}`);
//     setCurrentPanelResidents(residents);
//     setPanelOpen(true);
//   };

//   const handleClosePanel = () => {
//     setPanelOpen(false);
//   };

//   return (
//     <div className="w-full h-full flex flex-col">
//       <div className="w-full flex gap-2 mr-2 mb-4 mt-4">
//         <div className="w-full flex gap-2 mr-2">
//           <div className="relative flex-1">
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
//               size={17}
//             />
//             <Input
//               placeholder="Search vaccine name or age group..."
//               className="pl-10 bg-white w-full"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </div>
//         <div>
//           <Button className="w-full sm:w-auto">
//             <Link
//               to="/patNewVacRecF3/vaccination-record-form"
//               state={{ mode: "newvaccination_record" }}
//             >
//               New Record
//             </Link>
//           </Button>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="w-full h-[100px] flex items-center justify-center">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           <span className="ml-2">loading....</span>
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredVaccineNames.map((vaccineName) => {
//               const ageGroups = groupedData[vaccineName] || {};
//               const hasResidents = Object.values(ageGroups).some(
//                 (residents) => residents && residents.length > 0
//               );

//               return (
//                 <div
//                   key={vaccineName}
//                   className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
//                 >
//                   <h3 className="text-xl font-semibold text-darkBlue2 mb-4">
//                     {vaccineName}
//                   </h3>

//                   {!hasResidents ? (
//                     <div className="text-center text-gray-500 py-4">
//                       No unvaccinated residents found
//                     </div>
//                   ) : (
//                     <div className="space-y-3">
//                       {Object.entries(ageGroups).map(
//                         ([ageGroupName, residents]) => {
//                           if (!residents || residents.length === 0) return null;

//                           const firstResident = residents[0];
//                           const ageRange =
//                             firstResident &&
//                             firstResident.min_age !== undefined &&
//                             firstResident.max_age !== undefined
//                               ? `${firstResident.min_age}-${
//                                   firstResident.max_age
//                                 } ${
//                                   firstResident.time_unit === "NA"
//                                     ? ""
//                                     : firstResident.time_unit
//                                 }`
//                               : "";

//                           return (
//                             <div key={`${vaccineName}-${ageGroupName}`}>
//                               <Button
//                                 variant="outline"
//                                 className="w-full justify-between p-4 h-auto text-left flex items-center bg-gray-50 hover:bg-gray-100"
//                                 onClick={() =>
//                                   handleOpenPanel(
//                                     vaccineName,
//                                     ageGroupName,
//                                     residents
//                                   )
//                                 }
//                               >
//                                 <span className="font-medium text-darkBlue1">
//                                   {ageGroupName}{" "}
//                                   {ageRange ? `(${ageRange})` : ""}
//                                 </span>
//                                 <span className="text-sm text-gray-600">
//                                   {residents.length} Residents
//                                 </span>
//                               </Button>
//                             </div>
//                           );
//                         }
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {filteredVaccineNames.length === 0 && !isLoading && (
//             <div className="text-center text-gray-500 py-10">
//               {searchQuery.trim()
//                 ? "No matching vaccines or age groups found"
//                 : "No vaccine data available"}
//             </div>
//           )}

//           <ResidentListPanel
//             isOpen={panelOpen}
//             onClose={handleClosePanel}
//             title={currentPanelTitle}
//             residents={currentPanelResidents}
//           />
//         </>
//       )}
//     </div>
//   );
// }
