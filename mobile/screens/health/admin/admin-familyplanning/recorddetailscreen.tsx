// // RecordDetailScreen.tsx
// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { getFPCompleteRecord } from './mockapi'; // Mock API import
// import { FamilyPlanningRecordDetail } from './familyplanningtypes'; // Import your type definition

// const { width } = Dimensions.get('window');

// interface FieldRowProps {
//   label: string;
//   value: string | number | boolean | undefined | null;
//   isBoolean?: boolean;
//   isSignature?: boolean;
// }

// const FieldRow: React.FC<FieldRowProps> = ({ label, value, isBoolean = false, isSignature = false }) => {
//   const displayValue = isBoolean
//     ? value === true ? 'Yes' : value === false ? 'No' : 'N/A'
//     : value !== undefined && value !== null && String(value).trim() !== ''
//       ? String(value)
//       : 'N/A';

//   return (
//     <View className="flex-row items-center mb-2 py-1 border-b border-gray-100">
//       <Text className="text-sm font-semibold text-gray-700 w-2/5 pr-2">{label}:</Text>
//       {isSignature ? (
//         value ? (
//           <Image source={{ uri: value as string }} className="w-32 h-12 border border-gray-300 rounded-md" resizeMode="contain" />
//         ) : (
//           <Text className="text-sm text-gray-500 italic flex-1">No signature</Text>
//         )
//       ) : (
//         <Text className="text-sm text-gray-600 flex-1">{displayValue}</Text>
//       )}
//     </View>
//   );
// };

// interface SectionProps {
//   title: string;
//   children: React.ReactNode;
// }

// const Section: React.FC<SectionProps> = ({ title, children }) => (
//   <View className="bg-white rounded-lg p-4 mb-5 shadow-sm shadow-black/20">
//     <Text className="text-xl font-bold text-blue-600 pb-2 mb-3 border-b border-gray-200">{title}</Text>
//     <View>
//       {children}
//     </View>
//   </View>
// );

// const RecordDetailScreen: React.FC = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { fprecordId } = route.params as { fprecordId: number };

//   const [record, setRecord] = useState<FamilyPlanningRecordDetail | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchRecordDetails();
//   }, [fprecordId]);

//   const fetchRecordDetails = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data: FamilyPlanningRecordDetail = await getFPCompleteRecord(fprecordId);
//       setRecord(data);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gray-50">
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text className="mt-2 text-base text-gray-600">Loading record details...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gray-50 p-4">
//         <Text className="text-base text-red-600 text-center mb-4">Error: {error}</Text>
//         <TouchableOpacity className="bg-blue-600 px-5 py-2 rounded-lg" onPress={fetchRecordDetails}>
//           <Text className="text-white text-base font-bold">Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   if (!record) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gray-50 p-4">
//         <Text className="text-base text-gray-500 mb-4">No record data found.</Text>
//         <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded-lg" onPress={() => navigation.goBack()}>
//           <Text className="text-gray-800 text-base font-bold">Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <ScrollView className="flex-1 p-4 bg-gray-50">
//       <TouchableOpacity className="self-start mb-4 px-3 py-2 rounded-lg bg-gray-200" onPress={() => navigation.goBack()}>
//         <Text className="text-gray-800 text-base font-bold">← Back to History</Text>
//       </TouchableOpacity>

//       <Text className="text-2xl font-bold text-gray-800 mb-1">Family Planning Record: FP-{record.fprecord_id.toString().padStart(4, '0')}</Text>
//       <Text className="text-lg text-gray-600 mb-5">Patient: {record.patient_info?.fname} {record.patient_info?.lname}</Text>

//       {/* Patient Information */}
//       <Section title="Patient Information">
//         <FieldRow label="Client ID" value={record.client_id} />
//         <FieldRow label="Last Name" value={record.patient_info?.lname} />
//         <FieldRow label="Given Name" value={record.patient_info?.fname} />
//         <FieldRow label="Middle Initial" value={record.patient_info?.mname} />
//         <FieldRow label="Date of Birth" value={record.patient_info?.dob} />
//         <FieldRow label="Age" value={record.patient_info?.age} />
//         <FieldRow label="Sex" value={record.patient_info?.sex} />
//         <FieldRow label="Address" value={record.patient_info?.address} />
//         <FieldRow label="Occupation" value={record.occupation} />
//         <FieldRow label="Educational Attainment" value={record.educationalAttainment} />
//         <FieldRow label="Philhealth No." value={record.philhealthNo} />
//         <FieldRow label="NHTS Status" value={record.nhts_status} isBoolean />
//         <FieldRow label="4Ps Member" value={record.fourps} isBoolean />
//         <FieldRow label="Average Monthly Income" value={record.avg_monthly_income} />
//       </Section>

//       {/* Spouse Information */}
//       {record.spouse && (
//         <Section title="Spouse Information">
//           <FieldRow label="Last Name" value={record.spouse.s_lastName} />
//           <FieldRow label="Given Name" value={record.spouse.s_givenName} />
//           <FieldRow label="Middle Initial" value={record.spouse.s_middleInitial} />
//           <FieldRow label="Date of Birth" value={record.spouse.s_dateOfBirth} />
//           <FieldRow label="Age" value={record.spouse.s_age} />
//           <FieldRow label="Occupation" value={record.spouse.s_occupation} />
//         </Section>
//       )}

//       {/* FP Record Details */}
//       <Section title="FP Record Details">
//         <FieldRow label="Type of Client" value={record.typeOfClient} />
//         <FieldRow label="Subtype of Client" value={record.subTypeOfClient} />
//         <FieldRow label="Reason for FP" value={record.reasonForFP} />
//         <FieldRow label="Other Reason for FP" value={record.otherReasonForFP} />
//         <FieldRow label="Method Currently Used" value={record.methodCurrentlyUsed} />
//         <FieldRow label="Other Method" value={record.otherMethod} />
//       </Section>

//       {/* Medical History */}
//       {record.medicalHistory && (
//         <Section title="Medical History">
//           <FieldRow label="Severe Headaches" value={record.medicalHistory.severeHeadaches} isBoolean />
//           <FieldRow label="Stroke/Heart Attack/Hypertension" value={record.medicalHistory.strokeHeartAttackHypertension} isBoolean />
//           <FieldRow label="Hematoma/Bruising/Bleeding" value={record.medicalHistory.hematomaBruisingBleeding} isBoolean />
//           <FieldRow label="Breast Cancer History" value={record.medicalHistory.breastCancerHistory} isBoolean />
//           <FieldRow label="Severe Chest Pain" value={record.medicalHistory.severeChestPain} isBoolean />
//           <FieldRow label="Cough (>2 weeks)" value={record.medicalHistory.cough} isBoolean />
//           <FieldRow label="Jaundice" value={record.medicalHistory.jaundice} isBoolean />
//           <FieldRow label="Unexplained Vaginal Bleeding" value={record.medicalHistory.unexplainedVaginalBleeding} isBoolean />
//           <FieldRow label="Abnormal Vaginal Discharge" value={record.medicalHistory.abnormalVaginalDischarge} isBoolean />
//           <FieldRow label="Phenobarbital/Rifampicin Use" value={record.medicalHistory.phenobarbitalOrRifampicin} isBoolean />
//           <FieldRow label="Smoker" value={record.medicalHistory.smoker} isBoolean />
//           <FieldRow label="Disability" value={record.medicalHistory.disability} isBoolean />
//           <FieldRow label="Disability Details" value={record.medicalHistory.disabilityDetails} />
//         </Section>
//       )}

//       {/* Obstetrical History */}
//       {record.obstetrical_history && (
//         <Section title="Obstetrical History">
//           <FieldRow label="G (Pregnancies)" value={record.obstetrical_history.g_pregnancies} />
//           <FieldRow label="P (Deliveries)" value={record.obstetrical_history.p_pregnancies} />
//           <FieldRow label="Full Term" value={record.obstetrical_history.fullTerm} />
//           <FieldRow label="Premature" value={record.obstetrical_history.premature} />
//           <FieldRow label="Abortion" value={record.obstetrical_history.abortion} />
//           <FieldRow label="Living Children" value={record.obstetrical_history.livingChildren} />
//           <FieldRow label="Last Delivery Date" value={record.obstetrical_history.lastDeliveryDate} />
//           <FieldRow label="Type of Last Delivery" value={record.obstetrical_history.typeOfLastDelivery} />
//           <FieldRow label="Last Menstrual Period" value={record.obstetrical_history.lastMenstrualPeriod} />
//           <FieldRow label="Previous Menstrual Period" value={record.obstetrical_history.previousMenstrualPeriod} />
//           <FieldRow label="Menstrual Flow" value={record.obstetrical_history.menstrualFlow} />
//           <FieldRow label="Dysmenorrhea" value={record.obstetrical_history.dysmenorrhea} isBoolean />
//           <FieldRow label="Hydatidiform Mole" value={record.obstetrical_history.hydatidiformMole} isBoolean />
//           <FieldRow label="Ectopic Pregnancy History" value={record.obstetrical_history.ectopicPregnancyHistory} isBoolean />
//         </Section>
//       )}

//       {/* STI Risk Assessment */}
//       {record.sexuallyTransmittedInfections && (
//         <Section title="STI Risk Assessment">
//           <FieldRow label="Abnormal Discharge" value={record.sexuallyTransmittedInfections.abnormalDischarge} isBoolean />
//           <FieldRow label="Discharge From" value={record.sexuallyTransmittedInfections.dischargeFrom} />
//           <FieldRow label="Sores" value={record.sexuallyTransmittedInfections.sores} isBoolean />
//           <FieldRow label="Pain" value={record.sexuallyTransmittedInfections.pain} isBoolean />
//           <FieldRow label="History" value={record.sexuallyTransmittedInfections.history} isBoolean />
//           <FieldRow label="HIV" value={record.sexuallyTransmittedInfections.hiv} isBoolean />
//         </Section>
//       )}

//       {/* VAW Assessment */}
//       {record.violence_against_women && (
//         <Section title="Violence Against Women Assessment">
//           <FieldRow label="Unpleasant Relationship" value={record.violence_against_women.unpleasantRelationship} isBoolean />
//           <FieldRow label="Partner Disapproval" value={record.violence_against_women.partnerDisapproval} isBoolean />
//           <FieldRow label="Domestic Violence" value={record.violence_against_women.domesticViolence} isBoolean />
//           <FieldRow label="Referred To" value={record.violence_against_women.referredTo} />
//         </Section>
//       )}

//       {/* Physical Examination */}
//       {record.physical_exam && (
//         <Section title="Physical Examination">
//           <FieldRow label="Weight (kg)" value={record.physical_exam.weight} />
//           <FieldRow label="Height (cm)" value={record.height} /> {/* Assuming height is directly on record */}
//           <FieldRow label="Pulse Rate" value={record.pulseRate} /> {/* Assuming pulseRate is directly on record */}
//           <FieldRow label="Blood Pressure" value={`${record.physical_exam.bp_systolic}/${record.physical_exam.bp_diastolic}`} />
//           <FieldRow label="Temperature (°C)" value={record.physical_exam.temperature} />
//           <FieldRow label="HEENT" value={record.physical_exam.heent} isBoolean />
//           <FieldRow label="Chest" value={record.physical_exam.chest} isBoolean />
//           <FieldRow label="Abdomen" value={record.physical_exam.abdomen} isBoolean />
//           <FieldRow label="Extremities" value={record.physical_exam.extremities} isBoolean />
//           <FieldRow label="Skin" value={record.physical_exam.skin} isBoolean />
//         </Section>
//       )}

//       {/* Pelvic Examination */}
//       {record.pelvicExamination && ( // Using pelvicExamination from the detailed type
//         <Section title="Pelvic Examination">
//           <FieldRow label="Cervical Consistency" value={record.cervicalConsistency} />
//           <FieldRow label="Cervical Tenderness" value={record.cervicalTenderness} isBoolean />
//           <FieldRow label="Cervical Adnexal Mass Tenderness" value={record.cervicalAdnexalMassTenderness} isBoolean />
//           <FieldRow label="Uterine Position" value={record.uterinePosition} />
//           <FieldRow label="Uterine Depth" value={record.uterineDepth} />
//         </Section>
//       )}

//       {/* Service Provision Records (assuming it's an array and we display the first one for simplicity) */}
//       {record.serviceProvisionRecords && record.serviceProvisionRecords.length > 0 && (
//         <Section title="Service Provision Record">
//           <FieldRow label="Date of Visit" value={record.serviceProvisionRecords[0].dateOfVisit} />
//           <FieldRow label="Method Accepted" value={record.serviceProvisionRecords[0].methodAccepted} />
//           <FieldRow label="Method Quantity" value={Array.isArray(record.serviceProvisionRecords[0].methodQuantity) ? record.serviceProvisionRecords[0].methodQuantity.join(', ') : record.serviceProvisionRecords[0].methodQuantity} />
//           <FieldRow label="Service Provider" value={record.serviceProvisionRecords[0].nameOfServiceProvider} />
//           <FieldRow label="Date of Follow Up" value={record.serviceProvisionRecords[0].dateOfFollowUp} />
//           <FieldRow label="Service Provider Signature" value={record.serviceProvisionRecords[0].serviceProviderSignature} isSignature />
//           <FieldRow label="Medical Findings" value={record.serviceProvisionRecords[0].medicalFindings} />
//         </Section>
//       )}

//       {/* Pregnancy Check */}
//       {record.pregnancy_check && (
//         <Section title="Pregnancy Check">
//           <FieldRow label="Breastfeeding" value={record.pregnancy_check.breastfeeding} isBoolean />
//           <FieldRow label="Abstained" value={record.pregnancy_check.abstained} isBoolean />
//           <FieldRow label="Recent Baby" value={record.pregnancy_check.recent_baby} isBoolean />
//           <FieldRow label="Recent Period" value={record.pregnancy_check.recent_period} isBoolean />
//           <FieldRow label="Recent Abortion" value={record.pregnancy_check.recent_abortion} isBoolean />
//           <FieldRow label="Using Contraceptive" value={record.pregnancy_check.using_contraceptive} isBoolean />
//         </Section>
//       )}

//       {/* Acknowledgement */}
//       {record.acknowledgement && (
//         <Section title="Acknowledgement">
//           <FieldRow label="Selected Method" value={record.acknowledgement.selectedMethod} />
//           <FieldRow label="Client Name" value={record.acknowledgement.clientName} />
//           <FieldRow label="Client Signature Date" value={record.acknowledgement.clientSignatureDate} />
//           <FieldRow label="Client Signature" value={record.acknowledgement.clientSignature} isSignature />
//           <FieldRow label="Guardian Name" value={record.acknowledgement.guardianName} />
//           <FieldRow label="Guardian Signature" value={record.acknowledgement.guardianSignature} isSignature />
//         </Section>
//       )}
//     </ScrollView>
//   );
// };

// export default RecordDetailScreen;
