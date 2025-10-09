// "use client"

// import { View, Text, ScrollView, ActivityIndicator } from "react-native"
// import { useEffect, useState } from "react"
// import { usePatientPostpartumAllRecords } from "../queries/maternalFetchQueries"

// interface PostpartumRecord {
//   date: string
//   familyNo: string
//   name: string
//   age: string
//   husbandName: string
//   address: string
//   dateTimeOfDelivery: string
//   placeOfDelivery: string
//   attendedBy: string
//   outcome: string
//   ttStatus: string
//   ironSupplementationDate: string
//   lochialDischarges: string
//   vitASupplementation: string
//   numOfPadsPerDay: string
//   mebendazoleGiven: string
//   dateTimeInitiatedBF: string
//   bloodPressure: string
//   feeding: string
//   findings: string
//   nursesNotes: string
// }

// interface PostpartumCareHistoryProps {
//   pregnancyId?: string
//   route?: any // React Navigation route prop
// }

// const StyledView = styled(View)
// const StyledText = styled(Text)
// const StyledScrollView = styled(ScrollView)
// const StyledActivityIndicator = styled(ActivityIndicator)

// export default function PostpartumCareHistory({ pregnancyId: propPregnancyId, route }: PostpartumCareHistoryProps) {
//   const [postpartumRecords, setPostpartumRecords] = useState<PostpartumRecord[]>([])
//   const [pregnancyId, setPregnancyId] = useState<string>("")

//   useEffect(() => {
//     if (propPregnancyId) {
//       setPregnancyId(propPregnancyId)
//     } else if (route?.params?.pregnancyId) {
//       setPregnancyId(route.params.pregnancyId)
//     }
//   }, [propPregnancyId, route?.params])

//   const { data: postpartumData, isLoading, error } = usePatientPostpartumAllRecords(pregnancyId)

//   useEffect(() => {
//     if (postpartumData && Array.isArray(postpartumData)) {
//       const transformedRecords: PostpartumRecord[] = postpartumData.map((record: any) => {
//         const personalInfo = record.patient_details?.personal_info
//         const address = record.patient_details?.address
//         const family = record.patient_details?.family
//         const deliveryRecord = record.delivery_records?.[0]
//         const vitalSigns = record.vital_signs
//         const assessment = record.assessments?.[0]

//         const isResident = record.patient_details?.pat_type?.toLowerCase() === "resident"
//         const fatherInfo = record.patient_details?.family?.family_heads?.father?.personal_info
//         const spouseInfo = record.spouse

//         const age = personalInfo?.per_dob
//           ? Math.floor(
//               (new Date().getTime() - new Date(personalInfo.per_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
//             ).toString()
//           : ""

//         return {
//           date: assessment?.ppa_date_of_visit || "N/A",
//           familyNo: family?.fam_id || "N/A",
//           name: `${personalInfo?.per_lname || ""}, ${personalInfo?.per_fname || ""} ${personalInfo?.per_mname || ""}`.trim(),
//           age: age,
//           husbandName:
//             isResident && fatherInfo
//               ? `${fatherInfo.per_lname || ""}, ${fatherInfo.per_fname || ""} ${fatherInfo.per_mname || ""}`.trim()
//               : spouseInfo
//                 ? `${spouseInfo.spouse_lname || ""}, ${spouseInfo.spouse_fname || ""} ${spouseInfo.spouse_mname || ""}`.trim()
//                 : "N/A",
//           address:
//             `${address?.add_street || ""} ${address?.add_sitio || ""} ${address?.add_barangay || ""} ${address?.add_city || ""} ${address?.add_province || ""}`.trim(),
//           dateTimeOfDelivery: deliveryRecord
//             ? `${deliveryRecord.ppdr_date_of_delivery || ""} ${deliveryRecord.ppdr_time_of_delivery || ""}`.trim()
//             : "N/A",
//           placeOfDelivery: deliveryRecord?.ppdr_place_of_delivery || "N/A",
//           attendedBy: deliveryRecord?.ppdr_attended_by || "N/A",
//           outcome: deliveryRecord?.ppdr_outcome || "N/A",
//           ttStatus: "N/A",
//           ironSupplementationDate: "N/A",
//           lochialDischarges: record.ppr_lochial_discharges || "N/A",
//           vitASupplementation: record.ppr_vit_a_date_given || "N/A",
//           numOfPadsPerDay: record.ppr_num_of_pads?.toString() || "N/A",
//           mebendazoleGiven: record.ppr_mebendazole_date_given || "N/A",
//           dateTimeInitiatedBF:
//             record.ppr_date_of_bf && record.ppr_time_of_bf
//               ? `${record.ppr_date_of_bf} ${record.ppr_time_of_bf}`.trim()
//               : "N/A",
//           bloodPressure: vitalSigns ? `${vitalSigns.vital_bp_systolic}/${vitalSigns.vital_bp_diastolic}` : "N/A",
//           feeding: assessment?.ppa_feeding || "N/A",
//           findings: assessment?.ppa_findings || "N/A",
//           nursesNotes: assessment?.ppa_nurses_notes || "N/A",
//         }
//       })

//       setPostpartumRecords(transformedRecords)
//     }
//   }, [postpartumData])

//   if (isLoading) {
//     return (
//       <StyledView className="flex-1 justify-center items-center p-4">
//         <StyledActivityIndicator size="large" color="#3b82f6" />
//         <StyledText className="mt-3 text-sm text-slate-600">Loading postpartum records...</StyledText>
//       </StyledView>
//     )
//   }

//   if (error) {
//     return (
//       <StyledView className="flex-1 justify-center items-center p-4">
//         <StyledText className="text-sm text-red-600 text-center px-4">
//           Failed to load postpartum records. Please try again.
//         </StyledText>
//       </StyledView>
//     )
//   }

//   const hasData = postpartumRecords && postpartumRecords.length > 0

//   const fieldLabels = [
//     { key: "date", label: "Date" },
//     { key: "familyNo", label: "Family No." },
//     { key: "name", label: "Name" },
//     { key: "age", label: "Age" },
//     { key: "husbandName", label: "Husband's Name" },
//     { key: "address", label: "Address" },
//     { key: "dateTimeOfDelivery", label: "Date and Time of Delivery" },
//     { key: "placeOfDelivery", label: "Place of Delivery" },
//     { key: "attendedBy", label: "Attended By" },
//     { key: "outcome", label: "Outcome" },
//     { key: "ttStatus", label: "TT Status" },
//     { key: "ironSupplementationDate", label: "Iron Supplementation Date" },
//     { key: "lochialDischarges", label: "Lochial Discharges" },
//     { key: "vitASupplementation", label: "Vit A Supplementation" },
//     { key: "numOfPadsPerDay", label: "No. of Pad / Day" },
//     { key: "mebendazoleGiven", label: "Mebendazole Given" },
//     { key: "dateTimeInitiatedBF", label: "Date and Time Initiated BF" },
//     { key: "bloodPressure", label: "B/P" },
//     { key: "feeding", label: "Feeding" },
//     { key: "findings", label: "Findings" },
//     { key: "nursesNotes", label: "Nurses Notes" },
//   ]

//   return (
//     <StyledScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
//       {hasData ? (
//         <StyledView className="gap-6">
//           {postpartumRecords.map((record, recordIndex) => (
//             <StyledView
//               key={recordIndex}
//               className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4"
//             >
//               <StyledView className="bg-blue-50 px-4 py-3 border-b border-gray-300">
//                 <StyledText className="text-sm font-semibold text-gray-800">
//                   Postpartum Record #{recordIndex + 1} - {record.name}
//                 </StyledText>
//               </StyledView>

//               <StyledView className="bg-white">
//                 {fieldLabels.map((field, fieldIndex) => (
//                   <StyledView
//                     key={fieldIndex}
//                     className={`flex-row border-b border-gray-200 ${fieldIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
//                   >
//                     <StyledView className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
//                       <StyledText className="text-[13px] font-medium text-gray-700">{field.label}</StyledText>
//                     </StyledView>
//                     <StyledView className="flex-[1.5] px-4 py-3 justify-center">
//                       <StyledText className="text-[13px] text-gray-900">
//                         {record[field.key as keyof PostpartumRecord] || "N/A"}
//                       </StyledText>
//                     </StyledView>
//                   </StyledView>
//                 ))}
//               </StyledView>
//             </StyledView>
//           ))}
//         </StyledView>
//       ) : (
//         <StyledView className="items-center py-16 px-4 bg-white rounded-lg border border-slate-200">
//           <StyledText className="text-6xl mb-4">📄</StyledText>
//           <StyledText className="text-lg font-medium text-slate-700 mb-2">No Postpartum Records Available</StyledText>
//           <StyledText className="text-sm text-slate-600 text-center">
//             No postpartum records have been documented for this patient.
//           </StyledText>
//         </StyledView>
//       )}
//     </StyledScrollView>
//   )
// }
