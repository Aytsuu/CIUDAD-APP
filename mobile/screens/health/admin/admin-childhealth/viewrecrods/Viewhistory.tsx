import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator,SafeAreaView,FlatList,} from "react-native";
import { ChevronLeft, ChevronRight, History, Baby } from "lucide-react-native";
import { ChildHealthHistoryRecord } from "./types";
import { getSupplementStatusesFields } from "./config";
import { PatientSummarySection } from "./currenthistory";
import { router } from "expo-router";
import { useChildHealthHistory } from "../queries/fetchQueries";

// interface Props {
//   route: {
//     params: {
//       chrecId: string;
//       chhistId: string;
//     };
//   };
//   navigation: any;
// }

// type HistoryTab = 'tt' | 'ebf' | 'findings' | 'disabilities' | 'vitals' | 'nutrition' | 'immunization' | 'supplements';

// // TT Status Section
// const TTStatusSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
//   const hasData = (record: ChildHealthHistoryRecord) => record.tt_status && record.tt_status !== "N/A";
//   const filteredRecords = records.filter(hasData);

//   return filteredRecords.length > 0 ? (
//     <View className="mb-6">
//       <Text className="font-semibold text-lg mb-2">TT Status (Mother)</Text>
//       <FlatList
//         data={filteredRecords}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `tt-${index}`}
//         renderItem={({ item }) => (
//           <View className="mr-4 p-4 bg-white border border-gray-200 rounded-lg">
//             <Text className="font-medium">
//               {new Date(item.created_at).toLocaleDateString()}
//             </Text>
//             <Text className="text-blue-600">{item.tt_status}</Text>
//           </View>
//         )}
//         contentContainerStyle={{ paddingRight: 16 }}
//       />
//     </View>
//   ) : null;
// };

// // Exclusive Breastfeeding Section
// const ExclusiveBFSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
//   const hasData = (record: ChildHealthHistoryRecord) => 
//     record.exclusive_bf_checks && record.exclusive_bf_checks.some(ebf => ebf.ebf_date && ebf.ebf_date !== "N/A");
//   const filteredRecords = records.filter(hasData);

//   return filteredRecords.length > 0 ? (
//     <View className="mb-6">
//       <Text className="font-semibold text-lg mb-2">Exclusive Breastfeeding Checks</Text>
//       <FlatList
//         data={filteredRecords}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `ebf-${index}`}
//         renderItem={({ item }) => (
//           <View className="mr-4 p-4 bg-white border border-gray-200 rounded-lg">
//             {item.exclusive_bf_checks.map((ebf, ebfIndex) => (
//               ebf.ebf_date && ebf.ebf_date !== "N/A" && (
//                 <View key={`ebf-item-${ebfIndex}`}>
//                   <Text className="font-medium">
//                     {new Date(item.created_at).toLocaleDateString()}
//                   </Text>
//                   <Text className="text-blue-600">{ebf.ebf_date}</Text>
//                 </View>
//               )
//             ))}
//           </View>
//         )}
//         contentContainerStyle={{ paddingRight: 16 }}
//       />
//     </View>
//   ) : null;
// };

// // Findings Section
// const FindingsSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
//   const hasData = (record: ChildHealthHistoryRecord) => 
//     record.child_health_vital_signs.some(vital => vital.find_details && 
//       (vital.find_details.assessment_summary || vital.find_details.obj_summary || 
//        vital.find_details.subj_summary || vital.find_details.plantreatment_summary));
//   const filteredRecords = records.filter(hasData);

//   return filteredRecords.length > 0 ? (
//     <View className="mb-6">
//       <Text className="font-semibold text-lg mb-2">Findings Details</Text>
//       <FlatList
//         data={filteredRecords}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `findings-${index}`}
//         renderItem={({ item }) => (
//           <View className="mr-4 p-4 bg-white border border-gray-200 rounded-lg">
//             {item.child_health_vital_signs.map((vital, vitalIndex) =>
//               vital.find_details && (
//                 (vital.find_details.assessment_summary || vital.find_details.obj_summary || 
//                  vital.find_details.subj_summary || vital.find_details.plantreatment_summary) && (
//                   <View key={`vital-${vitalIndex}`}>
//                     <Text className="font-medium mb-1">
//                       {new Date(item.created_at).toLocaleDateString()}
//                     </Text>
//                     <Text className="font-medium text-blue-600 mb-1">Assessment Summary:</Text>
//                     <Text className="mb-2">{vital.find_details.assessment_summary || 'N/A'}</Text>
//                     <Text className="font-medium text-blue-600 mb-1">Objective Findings:</Text>
//                     <Text className="mb-2">{vital.find_details.obj_summary || 'N/A'}</Text>
//                     <Text className="font-medium text-blue-600 mb-1">Subjective Findings:</Text>
//                     <Text className="mb-2">{vital.find_details.subj_summary || 'N/A'}</Text>
//                     <Text className="font-medium text-blue-600 mb-1">Plan/Treatment:</Text>
//                     <Text>{vital.find_details.plantreatment_summary || 'N/A'}</Text>
//                   </View>
//                 )
//               )
//             )}
//           </View>
//         )}
//         contentContainerStyle={{ paddingRight: 16 }}
//       />
//     </View>
//   ) : null;
// };

// // Disabilities Section
// const DisabilitiesSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
//   const hasData = (record: ChildHealthHistoryRecord) => record.disabilities && record.disabilities.length > 0;
//   const filteredRecords = records.filter(hasData);

//   return filteredRecords.length > 0 ? (
//     <View className="mb-6">
//       <Text className="font-semibold text-lg mb-2">Disabilities</Text>
//       <FlatList
//         data={filteredRecords}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `disabilities-${index}`}
//         renderItem={({ item }) => (
//           <View className="mr-4 p-4 bg-white border border-gray-200 rounded-lg">
//             <Text className="font-medium mb-1">
//               {new Date(item.created_at).toLocaleDateString()}
//             </Text>
//             {item.disabilities.map((disability, dIndex) => (
//               <Text key={`disability-${dIndex}`}>- {disability.disability_details?.disability_name || 'N/A'}</Text>
//             ))}
//           </View>
//         )}
//         contentContainerStyle={{ paddingRight: 16 }}
//       />
//     </View>
//   ) : null;
// };

// // Vital Signs & Notes Section
// const VitalSignsNotesSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
//   const hasData = (record: ChildHealthHistoryRecord) => 
//     (record.child_health_vital_signs.some(vital => vital.bm_details?.age || vital.bm_details?.weight || 
//       vital.bm_details?.height || vital.temp) || 
//      record.child_health_notes.some(note => note.chn_notes || note.followv_details));
//   const filteredRecords = records.filter(hasData);

//   return filteredRecords.length > 0 ? (
//     <View className="mb-6">
//       <Text className="font-semibold text-lg mb-2">Vital Signs & Notes</Text>
//       <FlatList
//         data={filteredRecords}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `vitals-${index}`}
//         renderItem={({ item }) => (
//           <View className="mr-4 p-4 bg-white border border-gray-200 rounded-lg">
//             <Text className="font-medium mb-1">
//               {new Date(item.created_at).toLocaleDateString()}
//             </Text>
//             {item.child_health_vital_signs.map((vital, vitalIndex) => (
//               (vital.bm_details?.age || vital.bm_details?.weight || vital.bm_details?.height || vital.temp) && (
//                 <View key={`vital-detail-${vitalIndex}`} className="mb-2">
//                   <Text>Age: {vital.bm_details?.age || 'N/A'}</Text>
//                   <Text>Weight: {vital.bm_details?.weight || 'N/A'} kg</Text>
//                   <Text>Height: {vital.bm_details?.height || 'N/A'} cm</Text>
//                   <Text>Temperature: {vital.temp || 'N/A'} °C</Text>
//                 </View>
//               )
//             ))}
//             {item.child_health_notes.length > 0 && (
//               <>
//                 <Text className="font-medium text-blue-600 mt-2">Clinical Notes:</Text>
//                 {item.child_health_notes.map((note, noteIndex) => (
//                   (note.chn_notes || note.followv_details) && (
//                     <View key={`note-${noteIndex}`} className="mb-1">
//                       <Text>{note.chn_notes || 'No notes recorded'}</Text>
//                       {note.followv_details && (
//                         <View className="mt-2 pl-2 border-l-2 border-blue-200">
//                           <Text className="font-medium text-blue-600">Follow-up:</Text>
//                           <Text>Date: {note.followv_details.followv_date || 'N/A'}</Text>
//                           <Text>Status: {note.followv_details.followv_status || 'N/A'}</Text>
//                           <Text>Description: {note.followv_details.followv_description || 'N/A'}</Text>
//                           {note.followv_details.completed_at && (
//                             <Text>Completed At: {note.followv_details.completed_at}</Text>
//                           )}
//                         </View>
//                       )}
//                     </View>
//                   )
//                 ))}
//               </>
//             )}
//           </View>
//         )}
//         contentContainerStyle={{ paddingRight: 16 }}
//       />
//     </View>
//   ) : null;
// };

// // Nutritional Status Section
// const NutritionalStatusSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
//   const hasData = (record: ChildHealthHistoryRecord) => 
//     record.nutrition_statuses.some(status => status.wfa || status.lhfa || status.muac || status.muac_status || status.edemaSeverity);
//   const filteredRecords = records.filter(hasData);

//   return filteredRecords.length > 0 ? (
//     <View className="mb-6">
//       <Text className="font-semibold text-lg mb-2">Nutritional Status</Text>
//       <FlatList
//         data={filteredRecords}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `nutrition-${index}`}
//         renderItem={({ item }) => (
//           <View className="mr-4 p-4 bg-white border border-gray-200 rounded-lg">
//             <Text className="font-medium mb-1">
//               {new Date(item.created_at).toLocaleDateString()}
//             </Text>
//             {item.nutrition_statuses.map((status, statusIndex) => (
//               (status.wfa || status.lhfa || status.muac || status.muac_status || status.edemaSeverity) && (
//                 <View key={`status-${statusIndex}`} className="mb-2">
//                   <Text>Weight for Age (WFA): {status.wfa || 'N/A'}</Text>
//                   <Text>Length/Height for Age (LHFA): {status.lhfa || 'N/A'}</Text>
//                   <Text>Weight-for-Length (WFL): {status.wfl || 'N/A'}</Text>
//                   <Text>MUAC: {status.muac || 'N/A'}</Text>
//                   <Text>MUAC Status: {status.muac_status || 'N/A'}</Text>
//                 </View>
//               )
//             ))}
//           </View>
//         )}
//         contentContainerStyle={{ paddingRight: 16 }}
//       />
//     </View>
//   ) : null;
// };

// // Immunization Section
// const ImmunizationSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
//   const hasData = (record: ChildHealthHistoryRecord) => 
//     record.immunization_tracking.some(imt => imt.vachist_details?.vaccine_stock?.vaccinelist?.vac_name || 
//       imt.vachist_details?.vachist_doseNo || imt.vachist_details?.date_administered || 
//       imt.vachist_details?.vachist_status || imt.vachist_details?.vachist_age || 
//       imt.vachist_details?.follow_up_visit);
//   const filteredRecords = records.filter(hasData);

//   return filteredRecords.length > 0 ? (
//     <View className="mb-6">
//       <Text className="font-semibold text-lg mb-2">Immunization Tracking</Text>
//       <FlatList
//         data={filteredRecords}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `immunization-${index}`}
//         renderItem={({ item }) => (
//           <View className="mr-4 p-4 bg-white border border-gray-200 rounded-lg">
//             <Text className="font-medium mb-1">
//               {new Date(item.created_at).toLocaleDateString()}
//             </Text>
//             {item.immunization_tracking.length > 0 ? (
//               item.immunization_tracking.map((imt, imtIndex) => (
//                 (imt.vachist_details?.vaccine_stock?.vaccinelist?.vac_name || 
//                  imt.vachist_details?.vachist_doseNo || imt.vachist_details?.date_administered || 
//                  imt.vachist_details?.vachist_status || imt.vachist_details?.vachist_age || 
//                  imt.vachist_details?.follow_up_visit) && (
//                   <View key={`imt-${imtIndex}`} className="mb-2">
//                     <Text>Vaccine: {imt.vachist_details?.vaccine_stock?.vaccinelist?.vac_name || 'N/A'}</Text>
//                     <Text>Dose Number: {imt.vachist_details?.vachist_doseNo || 'N/A'}</Text>
//                     <Text>Date Administered: {imt.vachist_details?.date_administered || 'N/A'}</Text>
//                     <Text>Status: {imt.vachist_details?.vachist_status || 'N/A'}</Text>
//                     <Text>Age at Administration: {imt.vachist_details?.vachist_age || 'N/A'}</Text>
//                     {imt.vachist_details?.follow_up_visit && (
//                       <>
//                         <Text className="font-medium text-blue-600 mt-1">Follow-up:</Text>
//                         <Text>Date: {imt.vachist_details.follow_up_visit.followv_date}</Text>
//                         <Text>Description: {imt.vachist_details.follow_up_visit.followv_description}</Text>
//                         <Text>Status: {imt.vachist_details.follow_up_visit.followv_status}</Text>
//                       </>
//                     )}
//                   </View>
//                 )
//               ))
//             ) : null}
//           </View>
//         )}
//         contentContainerStyle={{ paddingRight: 16 }}
//       />
//     </View>
//   ) : null;
// };

// // Supplements Section
// const SupplementsSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
//   const hasData = (record: ChildHealthHistoryRecord) => 
//     (record.child_health_supplements.some(sup => sup.medrec_details?.minv_details?.med_detail?.med_name) || 
//      record.supplements_statuses.some(status => status.status_type || status.birthwt || status.date_seen || 
//        status.date_given_iron || status.date_completed));
//   const filteredRecords = records.filter(hasData);

//   return filteredRecords.length > 0 ? (
//     <View className="mb-6">
//       <Text className="font-semibold text-lg mb-2">Supplements & Status</Text>
//       <FlatList
//         data={filteredRecords}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `supplements-${index}`}
//         renderItem={({ item }) => (
//           <View className="mr-4 p-4 bg-white border border-gray-200 rounded-lg">
//             <Text className="font-medium mb-1">
//               {new Date(item.created_at).toLocaleDateString()}
//             </Text>
//             {item.child_health_supplements.length > 0 && (
//               <>
//                 <Text className="font-medium text-blue-600">Supplements:</Text>
//                 {item.child_health_supplements.map((supplement, suppIndex) => (
//                   (supplement.medrec_details?.minv_details?.med_detail?.med_name) && (
//                     <View key={`supplement-${suppIndex}`} className="mb-2">
//                       <Text>Medicine: {supplement.medrec_details?.minv_details?.med_detail?.med_name || 'N/A'}</Text>
//                       <Text>Dosage: {supplement.medrec_details?.minv_details?.minv_dsg || 'N/A'} {supplement.medrec_details?.minv_details?.minv_dsg_unit || ''}</Text>
//                       <Text>Quantity: {supplement.medrec_details?.medrec_qty || 'N/A'}</Text>
//                     </View>
//                   )
//                 ))}
//               </>
//             )}
//             {item.supplements_statuses.length > 0 && (
//               <>
//                 <Text className="font-medium text-blue-600 mt-2">Supplement Statuses:</Text>
//                 {item.supplements_statuses.map((status, statusIndex) => (
//                   (status.status_type || status.birthwt || status.date_seen || 
//                    status.date_given_iron || status.date_completed) && (
//                     <View key={`status-${statusIndex}`} className="mb-2">
//                       <Text>Status Type: {status.status_type || 'N/A'}</Text>
//                       <Text>Birth Weight: {status.birthwt || 'N/A'} kg</Text>
//                       <Text>Date Seen: {status.date_seen || 'N/A'}</Text>
//                       <Text>Date Given Iron: {status.date_given_iron || 'N/A'}</Text>
//                       <Text>Date Completed: {status.date_completed || 'N/A'}</Text>
//                     </View>
//                   )
//                 ))}
//               </>
//             )}
//           </View>
//         )}
//         contentContainerStyle={{ paddingRight: 16 }}
//       />
//     </View>
//   ) : null;
// };

// // Tabbed History View Component
// const TabbedHistoryView = ({ recordsToDisplay }: { recordsToDisplay: ChildHealthHistoryRecord[] }) => {
//   const [activeTab, setActiveTab] = useState<HistoryTab>('tt');
  
//   // Check which tabs have data with defensive checks
//   const hasTTData = recordsToDisplay.some(record => record.tt_status && record.tt_status !== "N/A");
//   const hasEBFData = recordsToDisplay.some(record => 
//     Array.isArray(record.exclusive_bf_checks) && 
//     record.exclusive_bf_checks.some(ebf => ebf.ebf_date && ebf.ebf_date !== "N/A")
//   );
//   const hasFindingsData = recordsToDisplay.some(record => 
//     Array.isArray(record.child_health_vital_signs) && 
//     record.child_health_vital_signs.some(vital => 
//       vital.find_details && 
//       (vital.find_details.assessment_summary || 
//        vital.find_details.obj_summary || 
//        vital.find_details.subj_summary || 
//        vital.find_details.plantreatment_summary)
//     )
//   );
//   const hasDisabilitiesData = recordsToDisplay.some(record => 
//     Array.isArray(record.disabilities) && record.disabilities.length > 0
//   );
//   const hasVitalsData = recordsToDisplay.some(record => 
//     (Array.isArray(record.child_health_vital_signs) && 
//      record.child_health_vital_signs.some(vital => 
//        vital.bm_details?.age || 
//        vital.bm_details?.weight || 
//        vital.bm_details?.height || 
//        vital.temp
//      )) || 
//     (Array.isArray(record.child_health_notes) && 
//      record.child_health_notes.some(note => note.chn_notes || note.followv_details))
//   );
//   const hasNutritionData = recordsToDisplay.some(record => 
//     Array.isArray(record.nutrition_statuses) && 
//     record.nutrition_statuses.some(status => 
//       status.wfa || status.lhfa || status.muac || status.muac_status || status.edemaSeverity
//     )
//   );
//   const hasImmunizationData = recordsToDisplay.some(record => 
//     Array.isArray(record.immunization_tracking) && 
//     record.immunization_tracking.some(imt => 
//       imt.vachist_details?.vaccine_stock?.vaccinelist?.vac_name || 
//       imt.vachist_details?.vachist_doseNo || 
//       imt.vachist_details?.date_administered || 
//       imt.vachist_details?.vachist_status || 
//       imt.vachist_details?.vachist_age || 
//       imt.vachist_details?.follow_up_visit
//     )
//   );
//   const hasSupplementsData = recordsToDisplay.some(record => 
//     (Array.isArray(record.child_health_supplements) && 
//      record.child_health_supplements.some(sup => sup.medrec_details?.minv_details?.med_detail?.med_name)) || 
//     (Array.isArray(record.supplements_statuses) && 
//      record.supplements_statuses.some(status => 
//        status.status_type || status.birthwt || status.date_seen || 
//        status.date_given_iron || status.date_completed
//      ))
//   );

//   // Set initial tab to the first one with data
//   useEffect(() => {
//     if (hasTTData) setActiveTab('tt');
//     else if (hasEBFData) setActiveTab('ebf');
//     else if (hasFindingsData) setActiveTab('findings');
//     else if (hasDisabilitiesData) setActiveTab('disabilities');
//     else if (hasVitalsData) setActiveTab('vitals');
//     else if (hasNutritionData) setActiveTab('nutrition');
//     else if (hasImmunizationData) setActiveTab('immunization');
//     else if (hasSupplementsData) setActiveTab('supplements');
//   }, [hasTTData, hasEBFData, hasFindingsData, hasDisabilitiesData, hasVitalsData, hasNutritionData, hasImmunizationData, hasSupplementsData]);

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'tt':
//         return hasTTData ? <TTStatusSection records={recordsToDisplay} /> : <NoDataMessage />;
//       case 'ebf':
//         return hasEBFData ? <ExclusiveBFSection records={recordsToDisplay} /> : <NoDataMessage />;
//       case 'findings':
//         return hasFindingsData ? <FindingsSection records={recordsToDisplay} /> : <NoDataMessage />;
//       case 'disabilities':
//         return hasDisabilitiesData ? <DisabilitiesSection records={recordsToDisplay} /> : <NoDataMessage />;
//       case 'vitals':
//         return hasVitalsData ? <VitalSignsNotesSection records={recordsToDisplay} /> : <NoDataMessage />;
//       case 'nutrition':
//         return hasNutritionData ? <NutritionalStatusSection records={recordsToDisplay} /> : <NoDataMessage />;
//       case 'immunization':
//         return hasImmunizationData ? <ImmunizationSection records={recordsToDisplay} /> : <NoDataMessage />;
//       case 'supplements':
//         return hasSupplementsData ? <SupplementsSection records={recordsToDisplay} /> : <NoDataMessage />;
//       default:
//         return <NoDataMessage />;
//     }
//   };

//   return (
//     <View className="w-full">
//       {/* Tab Navigation */}
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         className="border-b bg-blue-50 border-gray-200 mb-4"
//       >
//         <View className="flex-row">
//           {hasTTData && (
//             <TouchableOpacity
//               className={`px-4 py-2 ${activeTab === 'tt' ? 'border-b-2 border-blue-500' : ''}`}
//               onPress={() => setActiveTab('tt')}
//             >
//               <Text className={`font-medium ${activeTab === 'tt' ? 'text-blue-600' : 'text-gray-500'}`}>
//                 TT Status
//               </Text>
//             </TouchableOpacity>
//           )}
//           {hasEBFData && (
//             <TouchableOpacity
//               className={`px-4 py-2 ${activeTab === 'ebf' ? 'border-b-2 border-blue-500' : ''}`}
//               onPress={() => setActiveTab('ebf')}
//             >
//               <Text className={`font-medium ${activeTab === 'ebf' ? 'text-blue-600' : 'text-gray-500'}`}>
//                 Breastfeeding
//               </Text>
//             </TouchableOpacity>
//           )}
//           {hasFindingsData && (
//             <TouchableOpacity
//               className={`px-4 py-2 ${activeTab === 'findings' ? 'border-b-2 border-blue-500' : ''}`}
//               onPress={() => setActiveTab('findings')}
//             >
//               <Text className={`font-medium ${activeTab === 'findings' ? 'text-blue-600' : 'text-gray-500'}`}>
//                 Findings
//               </Text>
//             </TouchableOpacity>
//           )}
//           {hasDisabilitiesData && (
//             <TouchableOpacity
//               className={`px-4 py-2 ${activeTab === 'disabilities' ? 'border-b-2 border-blue-500' : ''}`}
//               onPress={() => setActiveTab('disabilities')}
//             >
//               <Text className={`font-medium ${activeTab === 'disabilities' ? 'text-blue-600' : 'text-gray-500'}`}>
//                 Disabilities
//               </Text>
//             </TouchableOpacity>
//           )}
//           {hasVitalsData && (
//             <TouchableOpacity
//               className={`px-4 py-2 ${activeTab === 'vitals' ? 'border-b-2 border-blue-500' : ''}`}
//               onPress={() => setActiveTab('vitals')}
//             >
//               <Text className={`font-medium ${activeTab === 'vitals' ? 'text-blue-600' : 'text-gray-500'}`}>
//                 Vital Signs & Notes
//               </Text>
//             </TouchableOpacity>
//           )}
//           {hasNutritionData && (
//             <TouchableOpacity
//               className={`px-4 py-2 ${activeTab === 'nutrition' ? 'border-b-2 border-blue-500' : ''}`}
//               onPress={() => setActiveTab('nutrition')}
//             >
//               <Text className={`font-medium ${activeTab === 'nutrition' ? 'text-blue-600' : 'text-gray-500'}`}>
//                 Nutrition
//               </Text>
//             </TouchableOpacity>
//           )}
//           {hasImmunizationData && (
//             <TouchableOpacity
//               className={`px-4 py-2 ${activeTab === 'immunization' ? 'border-b-2 border-blue-500' : ''}`}
//               onPress={() => setActiveTab('immunization')}
//             >
//               <Text className={`font-medium ${activeTab === 'immunization' ? 'text-blue-600' : 'text-gray-500'}`}>
//                 Immunization
//               </Text>
//             </TouchableOpacity>
//           )}
//           {hasSupplementsData && (
//             <TouchableOpacity
//               className={`px-4 py-2 ${activeTab === 'supplements' ? 'border-b-2 border-blue-500' : ''}`}
//               onPress={() => setActiveTab('supplements')}
//             >
//               <Text className={`font-medium ${activeTab === 'supplements' ? 'text-blue-600' : 'text-gray-500'}`}>
//                 Supplements
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </ScrollView>

//       {/* Tab Content */}
//       <View className="mt-4">
//         {renderTabContent()}
//       </View>
//     </View>
//   );
// };
// const NoDataMessage = () => (
//   <View className="p-6 items-center">
//     <Text className="text-gray-600 text-center">
//       No data available for this section.
//     </Text>
//   </View>
// );

// export default function ChildHealthHistoryDetail({ route, navigation }: Props) {
//   // Navigation and routing
//   const { chrecId, chhistId } = route.params || {};
//   console.log('ChildHealthHistoryDetail: Received params:', { chrecId, chhistId });

//   // State management
//   const [fullHistoryData, setFullHistoryData] = useState<ChildHealthHistoryRecord[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

//   const supplementStatusesFields = useMemo(
//     () => getSupplementStatusesFields(fullHistoryData),
//     [fullHistoryData]
//   );

  const { data: historyData, isLoading, } = useChildHealthHistory(chrecId);

//   useEffect(() => {
//     console.log('ChildHealthHistoryDetail: historyData:', historyData);
//     if (historyData) {
//       const sortedHistory = (historyData[0]?.child_health_histories || [])
//         .sort((a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
//           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//         );
      
//       setFullHistoryData(sortedHistory);
//       console.log('ChildHealthHistoryDetail: sortedHistory:', sortedHistory);

//       // Set initial index to the selected record
//       const initialIndex = sortedHistory.findIndex(
//         (record: ChildHealthHistoryRecord) => record.chhist_id === chhistId
//       );
//       setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
//     }
//   }, [historyData, chhistId]);

//   const recordsToDisplay = useMemo(() => {
//     if (fullHistoryData.length === 0) return [];
//     return fullHistoryData; // Return all records for horizontal swipe
//   }, [fullHistoryData]);

//   // Loading component
//   const LoadingComponent = () => (
//     <View className="flex-1 justify-center items-center p-6">
//       <ActivityIndicator size="large" color="#3B82F6" />
//       <Text className="text-gray-500 mt-4">Loading health history...</Text>
//     </View>
//   );

//   // Tab button component
//   const TabButton = ({ value, label, icon, isActive, onPress }: any) => (
//     <TouchableOpacity
//       className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${
//         isActive ? 'bg-blue-100' : 'bg-gray-100'
//       }`}
//       onPress={() => onPress(value)}
//     >
//       {icon}
//       <Text className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );

//   // Loading state
//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 bg-white">
//         <LoadingComponent />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView className="flex-1 mt-10">
//         {/* Header Section */}
//         <View className="px-6 pt-4">
//           <View className="flex-row items-center mb-4">
//             <TouchableOpacity
//               className="rounded-lg mr-4"
//               onPress={() => router.back()}
//             >
//               <ChevronLeft size={20} color="#374151" />
//             </TouchableOpacity>
//             <View className="flex-1">
//               <Text className="font-semibold text-xl text-gray-800">
//                 Child Health History Records
//               </Text>
//               <Text className="text-sm text-gray-600">
//                 View and compare child's health history
//               </Text>
//             </View>
//           </View>
          
//           <View className="h-px bg-gray-200 mb-6" />
//         </View>

//         {/* Main Content */}
//         <View className="px-6">
//           {/* Tab Navigation */}
//           <View className="flex-row gap-2 mb-6">
//             <TabButton
//               value="current"
//               label="Current Record"
//               icon={<Baby size={16} color={activeTab === "current" ? "#2563EB" : "#6B7280"} />}
//               isActive={activeTab === "current"}
//               onPress={setActiveTab}
//             />
//             <TabButton
//               value="history"
//               label="View History"
//               icon={<History size={16} color={activeTab === "history" ? "#2563EB" : "#6B7280"} />}
//               isActive={activeTab === "history"}
//               onPress={setActiveTab}
//             />
//           </View>

//           {/* Tab Content */}
//           {activeTab === "current" && (
//             <PatientSummarySection
//               recordsToDisplay={[fullHistoryData[currentIndex]]}
//               fullHistoryData={fullHistoryData}
//               chhistId={chhistId}
//             />
//           )}

//           {activeTab === "history" && (
//             <>
//               {recordsToDisplay.length === 0 ? (
//                 <View className="p-6 items-center">
//                   <Text className="text-gray-600 text-center">
//                     No health history found for this child.
//                   </Text>
//                 </View>
//               ) : (
//                 <View className="border border-gray-200 rounded-lg bg-white">
//                   <View className="p-6">
//                     {/* Tabbed History View */}
//                     <TabbedHistoryView recordsToDisplay={recordsToDisplay} />
//                   </View>
//                 </View>
//               )}
//             </>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }