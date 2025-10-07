// import { format, isValid, isSameDay } from "date-fns";
// import {
//   Disability,
//   CHNotes,
//   CHSupplement,
//   EBFCheck,
//   CHSSupplementStat,
//   ChildHealthHistoryRecord,
//   FieldConfig,
// } from "./types";
// import { View } from "react-native";

// export const recordOverviewFields: FieldConfig[] = [
//   // { label: "Record ID", path: ["chhist_id"] },
//   // {
//   //   label: "Created At",
//   //   path: ["created_at"],
//   //   format: (val: string) =>
//   //     val && isValid(new Date(val)) ? format(new Date(val), "PPP p") : "N/A",
//   // },
//   { label: "TT Status", path: ["tt_status"] },
//   // { label: "Status", path: ["status"] },
// ];



// const formatSupplement = (supplement: CHSupplement): string => {
//   const medDetails = supplement.medrec_details?.minv_details;
//   if (!medDetails) return "N/A";
//   const name = medDetails.med_detail?.med_name || "Unknown Medicine";
//   const dosage = medDetails.minv_dsg
//     ? `${medDetails.minv_dsg}${medDetails.minv_dsg_unit || ""}`
//     : "N/A";
//   const form = medDetails.minv_form || "N/A";
//   const qty = supplement.medrec_details?.medrec_qty || "N/A";
//   return `${name} - Dosage: ${dosage} - Form: ${form} - Qty: ${qty}`;
// };


// export const childPersonalInfoFields: FieldConfig[] = [
//   {
//     label: "Patient ID",
//     path: ["chrec_details", "patrec_details", "pat_details", "pat_id"],
//   },
//   {
//     label: "Last Name",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "personal_info",
//       "per_lname",
//     ],
//   },
//   {
//     label: "First Name",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "personal_info",
//       "per_fname",
//     ],
//   },
//   {
//     label: "Middle Name",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "personal_info",
//       "per_mname",
//     ],
//   },
//   {
//     label: "Date of Birth",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "personal_info",
//       "per_dob",
//     ],
//     format: (val: string) =>
//       val && isValid(new Date(val)) ? format(new Date(val), "PPP") : "N/A",
//   },
//   {
//     label: "Sex",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "personal_info",
//       "per_sex",
//     ],
//   },
//   {
//     label: "Contact",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "personal_info",
//       "per_contact",
//     ],
//   },
// ];

// export const familyHeadInfoFields: FieldConfig[] = [
//   {
//     label: "Mother's Name",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "family_head_info",
//       "family_heads",
//       "mother",
//       "personal_info",
//     ],
//     format: (val: any) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A"),
//   },
//   {
//     label: "Mother's Contact",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "family_head_info",
//       "family_heads",
//       "mother",
//       "personal_info",
//       "per_contact",
//     ],
//   },
//   {
//     label: "Father's Name",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "family_head_info",
//       "family_heads",
//       "father",
//       "personal_info",
//     ],
//     format: (val: any) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A"),
//   },
//   {
//     label: "Father's Contact",
//     path: [
//       "chrec_details",
//       "patrec_details",
//       "pat_details",
//       "family_head_info",
//       "family_heads",
//       "father",
//       "personal_info",
//       "per_contact",
//     ],
//   },
//   { label: "Family No.", path: ["chrec_details", "family_no"] },
//   {
//     label: "Mother's Occupation",
//     path: ["chrec_details", "mother_occupation"],
//   },
//   {
//     label: "Father's Occupation",
//     path: ["chrec_details", "father_occupation"],
//   },
// ];

// export const disabilitiesFields: FieldConfig[] = [
//   {
//     label: "Disabilities",
//     path: ["disabilities"],
//     format: (val: Disability[]) =>
//       val && val.length > 0
//         ? val
//             .map(
//               (d: Disability) =>
//                 d.disability_details?.disability_name || "Unknown"
//             )
//             .join(", ")
//         : "No disabilities recorded",
//   },
// ];

// export const vitalSignsFields: FieldConfig[] = [
//   {
//     label: "Age",
//     path: ["child_health_vital_signs", "0", "bm_details", "age"],
//   },
//   {
//     label: "Weight (kg)",
//     path: ["child_health_vital_signs", "0", "bm_details", "weight"],
//   },
//   {
//     label: "Height (cm)",
//     path: ["child_health_vital_signs", "0", "bm_details", "height"],
//   },
//   {
//     label: "Temperature (°C)",
//     path: ["child_health_vital_signs", "0", "temp"],
//   },
// ];


// export const findingsFields: FieldConfig[] = [
//   {
//     label: "Assessment Summary",
//     path: ["child_health_vital_signs", "0", "find_details", "assessment_summary"],
//     format: (val: string): JSX.Element[] => {
//       if (!val || val.trim() === "") {
//         return [
//           <View key="no-assessment" className="text-center">
//             <span>No assessment summary found</span>
//           </View>,
//         ];
//       }
      
//       // Split by new lines and filter empty lines
//       const lines = val.split('\n').filter(line => line.trim() !== '');
      
//       return lines.map((line, index) => (
//         <View key={`assessment-${index}`} className="flex justify-center mb-1">
//           <View className="text-left">
//             {line.startsWith(',') ? (
//               <View>- {line.substring(1).trim()}</View>
//             ) : (
//               <View>{line}</View>
//             )}
//           </View>
//         </View>
//       ));
//     }
//   },
//   {
//     label: "Objective Findings",
//     path: ["child_health_vital_signs", "0", "find_details", "obj_summary"],
//     format: (val: string) => {
//       if (!val || val.trim() === "") {
//         return [
//           <View key="no-objective" className="text-center">
//             <span>No objective findings</span>
//           </View>,
//         ];
//       }
      
//       const lines = val.split('\n').filter(line => line.trim() !== '');
      
//       return lines.map((line, index) => (
//         <View key={`objective-${index}`} className="flex justify-center mb-1">
//           <View className="text-left">
//             {line.startsWith('-') ? (
//               <View>- {line.substring(1).trim()}</View>
//             ) : (
//               <View>{line}</View>
//             )}
//           </View>
//         </View>
//       ));
//     }
//   },
//   {
//     label: "Subjective Findings",
//     path: ["child_health_vital_signs", "0", "find_details", "subj_summary"],
//     format: (val: string) => {
//       if (!val || val.trim() === "") {
//         return [
//           <View key="no-subjective" className="text-center">
//             <span>No subjective findings</span>
//           </View>,
//         ];
//       }
      
//       return [
//         <View key="subjective" className="flex justify-center">
//           <View className="text-left">{val}</View>
//         </View>,
//       ];
//     }
//   },
//   {
//     label: "Plan/Treatment",
//     path: ["child_health_vital_signs", "0", "find_details", "plantreatment_summary"],
//     format: (val: string): JSX.Element[] => {
//       if (!val || val.trim() === "") {
//         return [
//           <View key="no-plan" className="text-center">
//             <span>No treatment plan found</span>
//           </View>,
//         ];
//       }
      
//       const lines = val.split('\n').filter(line => line.trim() !== '');
      
//       return lines.map((line, index) => (
//         <View key={`plan-${index}`} className="flex justify-center mb-1">
//           <View className="text-left">
//             {line.startsWith('-') ? (
//               <View>- {line.substring(1).trim()}</View>
//             ) : (
//               <View>{line}</View>
//             )}
//           </View>
//         </View>
//       ));
//     }
//   }
// ];


// export const nutritionStatusesFields: FieldConfig[] = [
//   { label: "Weight-for-Age (WFA)", path: ["nutrition_statuses", "0", "wfa"] },
//   {
//     label: "Length/Height-for-Age (LHFA)",
//     path: ["nutrition_statuses", "0", "lhfa"],
//   },
//   {
//     label: "Weight-for-Length (WFL)",
//     path: ["nutrition_statuses", "0", "wfl"],
//   },
//   { label: "MUAC", path: ["nutrition_statuses", "0", "muac"] },
//   { label: "MUAC Status", path: ["nutrition_statuses", "0", "muac_status"] },
// ];


// export const notesFields: FieldConfig[] = [
//   {
//     label: "Clinical Notes",
//     path: ["child_health_notes"],
//     format: (val: CHNotes[]) => {
//       if (!val || val.length === 0) {
//         return [
//           <View key="no-notes" className="text-center">
//             <span>No clinical notes found</span>
//           </View>,
//         ];
//       }

//       // Filter out notes with empty content
//       const validNotes = val.filter(
//         (note) => note.chn_notes && note.chn_notes.trim() !== ""
//       );

//       // Return empty state if all notes were filtered out
//       if (validNotes.length === 0) {
//         return [
//           <View key="no-valid-notes" className="text-center">
//             <span>No clinical notes with content found</span>
//           </View>,
//         ];
//       }

//       return validNotes.map((note, index) => {
//         const staffName = note.staff_details?.rp?.per
//           ? `${note.staff_details.rp.per.per_fname} ${note.staff_details.rp.per.per_lname}`
//           : "Unknown staff";

//         return (
//           <View
//             key={`note-${note.chnotes_id || index}`}
//             className="flex justify-center space-y-1 mb-2"
//           >
//             <View className="font-medium flex flex-col text-left">
//               <View className="text-left">-{note.chn_notes}</View>
//               <View className="text-xs font-normal ml-4">
//                 Created by {staffName} at{" "}
//                 {new Date(note.created_at).toLocaleTimeString()}
//               </View>
//             </View>
//           </View>
//         );
//       });
//     },
//   },
//   {
//     label: "Follow-ups",
//     path: ["child_health_notes"],
//     format: (val: CHNotes[]) => {
//       const followUps = val?.filter((note) => note.followv_details) || [];
//       if (followUps.length === 0) {
//         return [
//           <View key="no-followups" className="text-center">
//             <span>No follow-ups scheduled</span>
//           </View>,
//         ];
//       }

//       return followUps.map((note, index) => {
//         const followv = note.followv_details!;

//         return (
//           <View key={`followup-${index}`} className="mb-2 flex justify-center">
//             <View className="text-left">
//               <View> -{followv.followv_description || ""} </View>

//               <View className="ml-4 flex flex-row gap-2">
//                 <View>
//                   Scheduled on
//                   {new Date(followv.followv_date).toLocaleDateString()}
//                 </View>
//                 <View className="font-normal text-xs">
//                   {" "}
//                   [Status:
//                   {followv.followv_status}]
//                 </View>
//               </View>
//             </View>
//           </View>
//         );
//       });
//     },
//   },
// ];



// export const supplementsFields: FieldConfig[] = [
//   {
//     label: "Supplements",
//     path: ["child_health_supplements"],
//     format: (val: CHSupplement[]) => {
//       if (!val || val.length === 0) {
//         return [
//           <View key="no-supplements" className="text-center">
//             <span>No supplements recorded</span>
//           </View>,
//         ];
//       }

//       return val.map((supplement, index) => {
//         const formatted = formatSupplement(supplement);
//         if (formatted === "N/A") {
//           return (
//             <View key={`supplement-na-${index}`} className="text-center">
//               <span>N/A</span>
//             </View>
//           );
//         }

//         return (
//           <View key={`supplement-${index}`} className="mb-2 flex justify-center">
//             <View className="text-left">
//               <View className="font-medium">
//                 {supplement.medrec_details?.minv_details?.med_detail?.med_name || "Unknown Medicine"}{" "}{formatDosage(supplement)}
//               </View>
              
//               <View className="ml-4 flex flex-col gap-1 text-sm">
                
//                 <View className="">
//                  ({supplement.medrec_details?.minv_details?.minv_form || "N/A"})
//                 </View>
//                 <View>
//                   <span className="font-semibold">Quantity:</span> {supplement.medrec_details?.medrec_qty || "N/A"}
//                 </View>
//               </View>
//             </View>
//           </View>
//         );
//       });
//     },
//   },
// ];

// const formatDosage = (supplement: CHSupplement): string => {
//   const medDetails = supplement.medrec_details?.minv_details;
//   if (!medDetails) return "N/A";
//   return medDetails.minv_dsg
//     ? `${medDetails.minv_dsg}${medDetails.minv_dsg_unit || ""}`
//     : "N/A";
// };

// export const exclusiveBfCheckFields: FieldConfig[] = [
//   {
//     label: "EBF Check Dates",
//     path: ["exclusive_bf_checks"],
//     format: (val) =>
//       val && val.length > 0
//         ? val.map((ebf: EBFCheck) => ({
//             date:
//               ebf.ebf_date && isValid(new Date(ebf.ebf_date))
//                 ? format(new Date(ebf.ebf_date), "PPP")
//                 : "N/A",
//             id: ebf.ebf_id,
//           }))
//         : [],
//   },
// ];

// export const immunizationTrackingFields: FieldConfig[] = [
//   {
//     label: "Immunizations",
//     path: ["immunization_tracking"],
//     format: (val: any[]) => {
//       if (!val || val.length === 0) {
//         return [
//           <View key="no-immunizations" className="text-center">
//             <span>No immunization records</span>
//           </View>,
//         ];
//       }

//       return val.map((imt, index) => {
//         const vachist = imt.vachist_details;
//         if (!vachist) {
//           return (
//             <View key={`no-details-${index}`} className="text-center">
//               <span>No vaccination details</span>
//             </View>
//           );
//         }

//         const vaccine = vachist.vaccine_stock?.vaccinelist;
//         const doseNumber = vachist.vachist_doseNo;
//         const doseSuffix =
//           doseNumber === 1
//             ? "1st dose"
//             : doseNumber === 2
//             ? "2nd dose"
//             : doseNumber === 3
//             ? "3rd dose"
//             : `${doseNumber}th dose`;

//         return (
//           <View key={`immunization-${index}`} className="mb-2 flex justify-center">
//             <View className="text-left">
//               <View className="font-medium">
//               - {vaccine?.vac_name || vachist.vac_details?.vac_name} ({doseSuffix})
//               </View>
              
//               <View className="ml-4 flex flex-col gap-1 text-sm">
//                 <View>
//                   <span className="font-semibold">Status:</span> {vachist.vachist_status}
//                 </View>
//                 <View>
//                   <span className="font-semibold">Date:</span> {new Date(vachist.created_at).toLocaleDateString()}
//                 </View>
//                 <View>
//                   <span className="font-semibold">Age at vaccination:</span> {vachist.vachist_age}
//                 </View>
//                 {vachist.follow_up_visit && (
//                   <View className=" bg-red-100 rounded-md p-1 text-red-500">
//                     <span className="font-semibold ">Next follow-up:</span> {new Date(vachist.follow_up_visit.followv_date).toLocaleDateString()}
//                   </View>
//                 )}
//               </View>
//             </View>
//           </View>
//         );
//       });
//     },
//   },
// ];


// export const getSupplementStatusesFields = (
//   fullHistoryData: ChildHealthHistoryRecord[]
// ): FieldConfig[] => [
//   {
//     label: "Supplement Statuses",
//     path: ["supplements_statuses"],
//     format: (val, record) => {
//       if (!record)
//         return [<span key="no-status">No supplement statuses recorded</span>];

//       // Get statuses directly associated with this record
//       const directStatuses = val && val.length > 0 ? val : [];

//       // Find statuses from other records where updated_at matches this record's created_at and date_completed is not null
//       const matchingStatuses: CHSSupplementStat[] = [];
//       fullHistoryData.forEach((otherRecord) => {
//         if (otherRecord.chhist_id !== record.chhist_id) {
//           otherRecord.supplements_statuses.forEach((status) => {
//             if (
//               status.updated_at &&
//               record.created_at &&
//               isValid(new Date(status.updated_at)) &&
//               isValid(new Date(record.created_at)) &&
//               isSameDay(
//                 new Date(status.updated_at),
//                 new Date(record.created_at)
//               ) &&
//               status.date_completed && // Only include statuses with a valid date_completed
//               isValid(new Date(status.date_completed))
//             ) {
//               matchingStatuses.push(status);
//             }
//           });
//         }
//       });

//       const allStatuses = [...directStatuses, ...matchingStatuses];

//       if (allStatuses.length === 0)
//         return [<span key="no-status">No supplement statuses recorded</span>];

//       return allStatuses.map((status: CHSSupplementStat, index: number) => {
//         const dateCompleted =
//           status?.date_completed && isValid(new Date(status.date_completed))
//             ? format(new Date(status.date_completed), "PPP")
//             : "N/A";
//         const isMatchingStatus = matchingStatuses.includes(status);

//         // Check if updated_at matches created_at
//         const showCompletedDate =
//           status.updated_at &&
//           record.created_at &&
//           isSameDay(new Date(status.updated_at), new Date(record.created_at));

//         // Check if status contains keywords
//         const hasBirthwt =
//           status?.status_type?.toLowerCase().includes("birthwt") ||
//           status?.status_type?.toLowerCase().includes("birth weight");
//         // const hasAnemic = status?.status_type?.toLowerCase().includes("anemic");

//         return (
//           <View className="flex justify-center">
//             <View
//               key={`${status.chssupplementstat_id}-${index}`}
//               className={isMatchingStatus ? "text-red-500 font-semibold" : ""}
//             >
//               <View className="font-medium text-left">
//                 {status?.status_type || "N/A"}
//               </View>
//               {hasBirthwt && (
//                 <View className="ml-4 text-left">
//                   - Birth Weight: {status?.birthwt || "N/A"}
//                 </View>
//               )}

//               <View className="ml-4 text-left">
//                 - Seen:{" "}
//                 {status?.date_seen && isValid(new Date(status.date_seen))
//                   ? format(new Date(status.date_seen), "PPP")
//                   : "N/A"}
//               </View>
//               <View className="ml-4 text-left">
//                 - Given Iron:{" "}
//                 {status?.date_given_iron &&
//                 isValid(new Date(status.date_given_iron))
//                   ? format(new Date(status.date_given_iron), "PPP")
//                   : "N/A"}
//               </View>
//               {showCompletedDate && (
//                 <View className="ml-4 text-left bg-red-100 rounded-md p-1 text-red-500">
//                   - Completed: {dateCompleted}
//                 </View>
//               )}
//             </View>
//           </View>
//         );
//       });
//     },
//   },
// ];