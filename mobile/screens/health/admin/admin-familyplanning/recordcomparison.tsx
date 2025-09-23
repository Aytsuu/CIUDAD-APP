// RecordComparisonScreen.tsx
import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { FamilyPlanningRecordDetail } from './familyplanningtypes'; // Import your type definition
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

// Helper function to check for differences between two values
const hasDifferences = (val1: any, val2: any): boolean => {
  // Simple comparison for primitive types
  if (typeof val1 !== 'object' && typeof val2 !== 'object') {
    return val1 !== val2;
  }
  // For arrays or objects, stringify and compare
  return JSON.stringify(val1) !== JSON.stringify(val2);
};

interface FieldRowProps {
  label: string;
  value1: any;
  value2: any;
  isBoolean?: boolean;
  isSignature?: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value1, value2, isBoolean = false, isSignature = false }) => {
  const diff = hasDifferences(value1, value2);

  const formatValue = (value: any, isBool: boolean, isSig: boolean) => {
    if (isSig) {
      return value ? (
        <Image source={{ uri: value as string }} className="w-24 h-10 border border-gray-300 rounded-md" resizeMode="contain" />
      ) : (
        <Text className="text-xs text-gray-500 italic">N/A</Text>
      );
    }
    if (isBool) {
      return value === true ? 'Yes' : value === false ? 'No' : 'N/A';
    }
    return value !== undefined && value !== null && String(value).trim() !== ''
      ? String(value)
      : 'N/A';
  };

  return (
    <View className={`flex-row items-center mb-2 py-1 border-b border-gray-100 ${diff ? 'bg-red-50' : ''}`}>
      <Text className={`text-sm font-semibold w-2/5 pr-2 ${diff ? 'text-red-700' : 'text-gray-700'}`}>{label}</Text>
      <View className="flex-1 px-1">
        {isSignature ? formatValue(value1, isBoolean, isSignature) : <Text className="text-sm text-gray-600">{formatValue(value1, isBoolean, isSignature)}</Text>}
      </View>
      <View className="flex-1 px-1">
        {isSignature ? formatValue(value2, isBoolean, isSignature) : <Text className="text-sm text-gray-600">{formatValue(value2, isBoolean, isSignature)}</Text>}
      </View>
    </View>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View className="bg-white rounded-lg p-4 mb-5 shadow-sm shadow-black/20">
    <Text className="text-xl font-bold text-blue-600 pb-2 mb-3 border-b border-gray-200">{title}</Text>
    <View>
      {children}
    </View>
  </View>
);

const RecordComparisonScreen: React.FC = () => {
  // const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the records with proper typing
  const record1 = params.record1 ? JSON.parse(params.record1 as string) as FamilyPlanningRecordDetail : null;
  const record2 = params.record2 ? JSON.parse(params.record2 as string) as FamilyPlanningRecordDetail : null;

  if (!record1 || !record2) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-base text-red-600 text-center mb-4">
          Please select exactly two records for comparison.
        </Text>
        <TouchableOpacity 
          className="bg-gray-200 px-4 py-2 rounded-lg" 
          onPress={() => router.back()}
        >
          <Text className="text-gray-800 text-base font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <TouchableOpacity className="self-start mb-4 px-3 py-2 rounded-lg bg-gray-200" onPress={() => router.back()}>
        <Text className="text-gray-800 text-base font-bold">← Back to History</Text>
      </TouchableOpacity>

      <Text className="text-2xl font-bold text-gray-800 mb-1">Family Planning Record Comparison</Text>
      <Text className="text-lg text-gray-600 mb-5">Comparing two selected records</Text>

      <View className="flex-row bg-blue-600 rounded-lg mb-4 py-3 items-center">
        <View className="w-2/5"></View> {/* Spacer for label column */}
        <View className="flex-1 items-center px-2">
          <Text className="text-lg font-bold text-white">Record {record1.fprecord}</Text>
          <Text className="text-xs text-blue-100 mt-1">{new Date(record1.created_at).toLocaleDateString()}</Text>
        </View>
        <View className="flex-1 items-center px-2">
          <Text className="text-lg font-bold text-white">Record {record2.fprecord}</Text>
          <Text className="text-xs text-blue-100 mt-1">{new Date(record2.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Patient Information */}
        <Section title="Patient Information">
          <FieldRow label="Client ID" value1={record1.client_id} value2={record2.client_id} />
          <FieldRow label="Occupation" value1={record1.occupation} value2={record2.occupation} />
          <FieldRow label="Educational Attainment" value1={record1.educationalAttainment} value2={record2.educationalAttainment} />
          <FieldRow label="Philhealth No." value1={record1.philhealthNo} value2={record2.philhealthNo} />
          <FieldRow label="NHTS Status" value1={record1.nhts_status} value2={record2.nhts_status} isBoolean />
          <FieldRow label="4Ps Member" value1={record1.fourps} value2={record2.fourps} isBoolean />
          <FieldRow label="Average Monthly Income" value1={record1.avg_monthly_income} value2={record2.avg_monthly_income} />
        </Section>

        {/* Spouse Information */}
        {(record1.spouse || record2.spouse) && (
          <Section title="Spouse Information">
            <FieldRow label="Last Name" value1={record1.spouse?.s_lastName} value2={record2.spouse?.s_lastName} />
            <FieldRow label="Given Name" value1={record1.spouse?.s_givenName} value2={record2.spouse?.s_givenName} />
            <FieldRow label="Middle Initial" value1={record1.spouse?.s_middleInitial} value2={record2.spouse?.s_middleInitial} />
            <FieldRow label="Date of Birth" value1={record1.spouse?.s_dateOfBirth} value2={record2.spouse?.s_dateOfBirth} />
            <FieldRow label="Age" value1={record1.spouse?.s_age} value2={record2.spouse?.s_age} />
            <FieldRow label="Occupation" value1={record1.spouse?.s_occupation} value2={record2.spouse?.s_occupation} />
          </Section>
        )}

        {/* FP Record Details */}
        <Section title="FP Record Details">
          <FieldRow label="Type of Client" value1={record1.typeOfClient} value2={record2.typeOfClient} />
          <FieldRow label="Subtype of Client" value1={record1.subTypeOfClient} value2={record2.subTypeOfClient} />
          <FieldRow label="Reason for FP" value1={record1.reasonForFP} value2={record2.reasonForFP} />
          <FieldRow label="Other Reason for FP" value1={record1.otherReasonForFP} value2={record2.otherReasonForFP} />
          <FieldRow label="Method Currently Used" value1={record1.methodCurrentlyUsed} value2={record2.methodCurrentlyUsed} />
          <FieldRow label="Other Method" value1={record1.otherMethod} value2={record2.otherMethod} />
        </Section>

        {/* Medical History */}
        {(record1.medicalHistory || record2.medicalHistory) && (
          <Section title="Medical History">
            <FieldRow label="Severe Headaches" value1={record1.medicalHistory?.severeHeadaches} value2={record2.medicalHistory?.severeHeadaches} isBoolean />
            <FieldRow label="Stroke/Heart Attack/Hypertension" value1={record1.medicalHistory?.strokeHeartAttackHypertension} value2={record2.medicalHistory?.strokeHeartAttackHypertension} isBoolean />
            <FieldRow label="Hematoma/Bruising/Bleeding" value1={record1.medicalHistory?.hematomaBruisingBleeding} value2={record2.medicalHistory?.hematomaBruisingBleeding} isBoolean />
            <FieldRow label="Breast Cancer History" value1={record1.medicalHistory?.breastCancerHistory} value2={record2.medicalHistory?.breastCancerHistory} isBoolean />
            <FieldRow label="Severe Chest Pain" value1={record1.medicalHistory?.severeChestPain} value2={record2.medicalHistory?.severeChestPain} isBoolean />
            <FieldRow label="Cough (>2 weeks)" value1={record1.medicalHistory?.cough} value2={record2.medicalHistory?.cough} isBoolean />
            <FieldRow label="Jaundice" value1={record1.medicalHistory?.jaundice} value2={record2.medicalHistory?.jaundice} isBoolean />
            <FieldRow label="Unexplained Vaginal Bleeding" value1={record1.medicalHistory?.unexplainedVaginalBleeding} value2={record2.medicalHistory?.unexplainedVaginalBleeding} isBoolean />
            <FieldRow label="Abnormal Vaginal Discharge" value1={record1.medicalHistory?.abnormalVaginalDischarge} value2={record2.medicalHistory?.abnormalVaginalDischarge} isBoolean />
            <FieldRow label="Phenobarbital/Rifampicin Use" value1={record1.medicalHistory?.phenobarbitalOrRifampicin} value2={record2.medicalHistory?.phenobarbitalOrRifampicin} isBoolean />
            <FieldRow label="Smoker" value1={record1.medicalHistory?.smoker} value2={record2.medicalHistory?.smoker} isBoolean />
            <FieldRow label="Disability" value1={record1.medicalHistory?.disability} value2={record2.medicalHistory?.disability} isBoolean />
            <FieldRow label="Disability Details" value1={record1.medicalHistory?.disabilityDetails} value2={record2.medicalHistory?.disabilityDetails} />
          </Section>
        )}

        {/* Obstetrical History */}
        {(record1.obstetrical_history || record2.obstetrical_history) && (
          <Section title="Obstetrical History">
            <FieldRow label="G (Pregnancies)" value1={record1.obstetrical_history?.g_pregnancies} value2={record2.obstetrical_history?.g_pregnancies} />
            <FieldRow label="P (Deliveries)" value1={record1.obstetrical_history?.p_pregnancies} value2={record2.obstetrical_history?.p_pregnancies} />
            <FieldRow label="Full Term" value1={record1.obstetrical_history?.fullTerm} value2={record2.obstetrical_history?.fullTerm} />
            <FieldRow label="Premature" value1={record1.obstetrical_history?.premature} value2={record2.obstetrical_history?.premature} />
            <FieldRow label="Abortion" value1={record1.obstetrical_history?.abortion} value2={record2.obstetrical_history?.abortion} />
            <FieldRow label="Living Children" value1={record1.obstetrical_history?.livingChildren} value2={record2.obstetrical_history?.livingChildren} />
            <FieldRow label="Last Delivery Date" value1={record1.obstetrical_history?.lastDeliveryDate} value2={record2.obstetrical_history?.lastDeliveryDate} />
            <FieldRow label="Type of Last Delivery" value1={record1.obstetrical_history?.typeOfLastDelivery} value2={record2.obstetrical_history?.typeOfLastDelivery} />
            <FieldRow label="Last Menstrual Period" value1={record1.obstetrical_history?.lastMenstrualPeriod} value2={record2.obstetrical_history?.lastMenstrualPeriod} />
            <FieldRow label="Previous Menstrual Period" value1={record1.obstetrical_history?.previousMenstrualPeriod} value2={record2.obstetrical_history?.previousMenstrualPeriod} />
            <FieldRow label="Menstrual Flow" value1={record1.obstetrical_history?.menstrualFlow} value2={record2.obstetrical_history?.menstrualFlow} />
            <FieldRow label="Dysmenorrhea" value1={record1.obstetrical_history?.dysmenorrhea} value2={record2.obstetrical_history?.dysmenorrhea} isBoolean />
            <FieldRow label="Hydatidiform Mole" value1={record1.obstetrical_history?.hydatidiformMole} value2={record2.obstetrical_history?.hydatidiformMole} isBoolean />
            <FieldRow label="Ectopic Pregnancy History" value1={record1.obstetrical_history?.ectopicPregnancyHistory} value2={record2.obstetrical_history?.ectopicPregnancyHistory} isBoolean />
          </Section>
        )}

        {/* STI Risk Assessment */}
        {(record1.sexuallyTransmittedInfections || record2.sexuallyTransmittedInfections) && (
          <Section title="STI Risk Assessment">
            <FieldRow label="Abnormal Discharge" value1={record1.sexuallyTransmittedInfections?.abnormalDischarge} value2={record2.sexuallyTransmittedInfections?.abnormalDischarge} isBoolean />
            <FieldRow label="Discharge From" value1={record1.sexuallyTransmittedInfections?.dischargeFrom} value2={record2.sexuallyTransmittedInfections?.dischargeFrom} />
            <FieldRow label="Sores" value1={record1.sexuallyTransmittedInfections?.sores} value2={record2.sexuallyTransmittedInfections?.sores} isBoolean />
            <FieldRow label="Pain" value1={record1.sexuallyTransmittedInfections?.pain} value2={record2.sexuallyTransmittedInfections?.pain} isBoolean />
            <FieldRow label="History" value1={record1.sexuallyTransmittedInfections?.history} value2={record2.sexuallyTransmittedInfections?.history} isBoolean />
            <FieldRow label="HIV" value1={record1.sexuallyTransmittedInfections?.hiv} value2={record2.sexuallyTransmittedInfections?.hiv} isBoolean />
          </Section>
        )}

        {/* VAW Assessment */}
        {(record1.violence_against_women || record2.violence_against_women) && (
          <Section title="Violence Against Women Assessment">
            <FieldRow label="Unpleasant Relationship" value1={record1.violence_against_women?.unpleasantRelationship} value2={record2.violence_against_women?.unpleasantRelationship} isBoolean />
            <FieldRow label="Partner Disapproval" value1={record1.violence_against_women?.partnerDisapproval} value2={record2.violence_against_women?.partnerDisapproval} isBoolean />
            <FieldRow label="Domestic Violence" value1={record1.violence_against_women?.domesticViolence} value2={record2.violence_against_women?.domesticViolence} isBoolean />
            <FieldRow label="Referred To" value1={record1.violence_against_women?.referredTo} value2={record2.violence_against_women?.referredTo} />
          </Section>
        )}

        {/* Physical Examination */}
        {(record1.physical_exam || record2.physical_exam) && (
          <Section title="Physical Examination">
            <FieldRow label="Weight (kg)" value1={record1.physical_exam?.weight} value2={record2.physical_exam?.weight} />
            <FieldRow label="Height (cm)" value1={record1.height} value2={record2.height} />
            <FieldRow label="Pulse Rate" value1={record1.pulseRate} value2={record2.pulseRate} />
            <FieldRow label="Blood Pressure" value1={record1.physical_exam ? `${record1.physical_exam.bp_systolic}/${record1.physical_exam.bp_diastolic}` : null} value2={record2.physical_exam ? `${record2.physical_exam.bp_systolic}/${record2.physical_exam.bp_diastolic}` : null} />
            <FieldRow label="Temperature (°C)" value1={record1.physical_exam?.temperature} value2={record2.physical_exam?.temperature} />
            <FieldRow label="HEENT" value1={record1.physical_exam?.heent} value2={record2.physical_exam?.heent} isBoolean />
            <FieldRow label="Chest" value1={record1.physical_exam?.chest} value2={record2.physical_exam?.chest} isBoolean />
            <FieldRow label="Abdomen" value1={record1.physical_exam?.abdomen} value2={record2.physical_exam?.abdomen} isBoolean />
            <FieldRow label="Extremities" value1={record1.physical_exam?.extremities} value2={record2.physical_exam?.extremities} isBoolean />
            <FieldRow label="Skin" value1={record1.physical_exam?.skin} value2={record2.physical_exam?.skin} isBoolean />
          </Section>
        )}

        {/* Pelvic Examination */}
        {(record1.pelvicExamination || record2.pelvicExamination) && (
          <Section title="Pelvic Examination">
            <FieldRow label="Cervical Consistency" value1={record1.cervicalConsistency} value2={record2.cervicalConsistency} />
            <FieldRow label="Cervical Tenderness" value1={record1.cervicalTenderness} value2={record2.cervicalTenderness} isBoolean />
            <FieldRow label="Cervical Adnexal Mass Tenderness" value1={record1.cervicalAdnexalMassTenderness} value2={record2.cervicalAdnexalMassTenderness} isBoolean />
            <FieldRow label="Uterine Position" value1={record1.uterinePosition} value2={record2.uterinePosition} />
            <FieldRow label="Uterine Depth" value1={record1.uterineDepth} value2={record2.uterineDepth} />
          </Section>
        )}

        {/* Service Provision Records */}
        {(record1.serviceProvisionRecords?.[0] || record2.serviceProvisionRecords?.[0]) && (
          <Section title="Service Provision Record">
            <FieldRow label="Date of Visit" value1={record1.serviceProvisionRecords?.[0]?.dateOfVisit} value2={record2.serviceProvisionRecords?.[0]?.dateOfVisit} />
            <FieldRow label="Method Accepted" value1={record1.serviceProvisionRecords?.[0]?.methodAccepted} value2={record2.serviceProvisionRecords?.[0]?.methodAccepted} />
            <FieldRow label="Method Quantity" value1={Array.isArray(record1.serviceProvisionRecords?.[0]?.methodQuantity) ? record1.serviceProvisionRecords?.[0]?.methodQuantity.join(', ') : record1.serviceProvisionRecords?.[0]?.methodQuantity} value2={Array.isArray(record2.serviceProvisionRecords?.[0]?.methodQuantity) ? record2.serviceProvisionRecords?.[0]?.methodQuantity.join(', ') : record2.serviceProvisionRecords?.[0]?.methodQuantity} />
            <FieldRow label="Service Provider" value1={record1.serviceProvisionRecords?.[0]?.nameOfServiceProvider} value2={record2.serviceProvisionRecords?.[0]?.nameOfServiceProvider} />
            <FieldRow label="Date of Follow Up" value1={record1.serviceProvisionRecords?.[0]?.dateOfFollowUp} value2={record2.serviceProvisionRecords?.[0]?.dateOfFollowUp} />
            <FieldRow label="Service Provider Signature" value1={record1.serviceProvisionRecords?.[0]?.serviceProviderSignature} value2={record2.serviceProvisionRecords?.[0]?.serviceProviderSignature} isSignature />
            <FieldRow label="Medical Findings" value1={record1.serviceProvisionRecords?.[0]?.medicalFindings} value2={record2.serviceProvisionRecords?.[0]?.medicalFindings} />
          </Section>
        )}

        {/* Pregnancy Check */}
        {(record1.pregnancy_check || record2.pregnancy_check) && (
          <Section title="Pregnancy Check">
            <FieldRow label="Breastfeeding" value1={record1.pregnancy_check?.breastfeeding} value2={record2.pregnancy_check?.breastfeeding} isBoolean />
            <FieldRow label="Abstained" value1={record1.pregnancy_check?.abstained} value2={record2.pregnancy_check?.abstained} isBoolean />
            <FieldRow label="Recent Baby" value1={record1.pregnancy_check?.recent_baby} value2={record2.pregnancy_check?.recent_baby} isBoolean />
            <FieldRow label="Recent Period" value1={record1.pregnancy_check?.recent_period} value2={record2.pregnancy_check?.recent_period} isBoolean />
            <FieldRow label="Recent Abortion" value1={record1.pregnancy_check?.recent_abortion} value2={record2.pregnancy_check?.recent_abortion} isBoolean />
            <FieldRow label="Using Contraceptive" value1={record1.pregnancy_check?.using_contraceptive} value2={record2.pregnancy_check?.using_contraceptive} isBoolean />
          </Section>
        )}

        {/* Acknowledgement */}
        {(record1.acknowledgement || record2.acknowledgement) && (
          <Section title="Acknowledgement">
            <FieldRow label="Selected Method" value1={record1.acknowledgement?.selectedMethod} value2={record2.acknowledgement?.selectedMethod} />
            <FieldRow label="Client Name" value1={record1.acknowledgement?.clientName} value2={record2.acknowledgement?.clientName} />
            <FieldRow label="Client Signature Date" value1={record1.acknowledgement?.clientSignatureDate} value2={record2.acknowledgement?.clientSignatureDate} />
            <FieldRow label="Client Signature" value1={record1.acknowledgement?.clientSignature} value2={record2.acknowledgement?.clientSignature} isSignature />
            <FieldRow label="Guardian Name" value1={record1.acknowledgement?.guardianName} value2={record2.acknowledgement?.guardianName} />
            <FieldRow label="Guardian Signature" value1={record1.acknowledgement?.guardianSignature} value2={record2.acknowledgement?.guardianSignature} isSignature />
          </Section>
        )}
      </ScrollView>
    </View>
  );
};

export default RecordComparisonScreen;
