import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getFPCompleteRecord } from "@/pages/familyplanning/request-db/GetRequest";
import { Button } from "@/components/ui/button/button";
import { ArrowLeft, UserSquare, Baby, Cross, ShieldAlert, Stethoscope, HeartPulse, LayoutList } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputLineProps {
  className?: string;
  value: string | number | boolean | undefined | null;
}

const InputLine: React.FC<InputLineProps> = ({ className, value }) => (
  <div
    className={cn(
      "w-full px-3 py-2 min-h-[36px] text-sm bg-white border border-gray-300 rounded-md flex items-center shadow-sm transition-colors hover:border-gray-400",
      className
    )}
  >
    {value !== undefined && value !== null && String(value).trim() !== ''
      ? <span className="text-gray-900">{String(value)}</span>
      : <span className="text-gray-400 italic">N/A</span>
    }
  </div>
);

interface YesNoCheckboxViewProps {
  label: string;
  value: boolean | undefined;
}

const YesNoCheckboxView: React.FC<YesNoCheckboxViewProps> = ({ value }) => (
  <div className="w-full px-3 py-2 min-h-[36px] bg-white border border-gray-300 rounded-md flex items-center shadow-sm transition-colors hover:border-gray-400">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={value === true}
        disabled
        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      <span className="text-sm">
        {value === true ? (
          <span>Yes</span>
        ) : value === false ? (
          <span>No</span>
        ) : (
          <span className="text-gray-400 italic">No data</span>
        )}
      </span>
    </div>
  </div>
);

// Define the FullFPRecordDetail type as provided in the context
type FullFPRecordDetail = {
  fprecord_id: number;
  client_id: string;
  avg_monthly_income_display: string;
  fourps: boolean;
  plan_more_children: boolean;
  avg_monthly_income: string;
  occupation: string;
  created_at: string;
  updated_at: string;
  hrd: null;
  patrec: number;
  spouse: {
    s_lastName: string;
    s_givenName: string;
    s_middleInitial: string;
    s_dateOfBirth: string;
    s_age: number;
    s_occupation: string;
  };
  pat: string;
  medhist: null;
  fp_type: {
    fpt_id: number;
    fpt_client_type: string;
    fpt_reason_fp: string;
    fpt_subtype: string | null;
    fpt_otherreason_na: string | null;
    fpt_otherreason_cu: string | null;
    fpt_method_used: string;
    fpt_other_method: string | null;
    fpt_reason: string;
    fprecord_id: number;
  };
  typeOfClient: string;
  subTypeOfClient: string | null;
  reasonForFP: string;
  reason: string | null;
  otherReasonForFP: string | null;
  methodCurrentlyUsed: string;
  otherMethod: string | null;
  pat_id: string;
  lastName: string;
  givenName: string;
  middleInitial: string;
  dateOfBirth: string;
  age: number;
  educationalAttainment: string;
  philhealthNo: string;
  nhts_status: boolean;
  address: {
    houseNumber: string;
    street: string;
    barangay: string;
    municipality: string;
    province: string;
  };
  fp_obstetrical_history: {
    fpob_id: number;
    fpob_last_delivery: string;
    fpob_type_last_delivery: string;
    fpob_last_period: string;
    fpob_previous_period: string;
    fpob_mens_flow: string;
    fpob_dysme: boolean;
    fpob_hydatidiform: boolean;
    fpob_ectopic_pregnancy: boolean;
    fprecord_id: number;
    obs_id: number;
  };
  obstetricalHistory: {
    lastDeliveryDate: string;
    typeOfLastDelivery: string;
    lastMenstrualPeriod: string;
    previousMenstrualPeriod: string;
    menstrualFlow: string;
    dysmenorrhea: boolean;
    hydatidiformMole: boolean;
    ectopicPregnancyHistory: boolean;
    g_pregnancies: number;
    p_pregnancies: number;
    fullTerm: number;
    premature: number;
    abortion: number;
    numOfLivingChildren: number;
  };
  risk_sti: {
    sti_id: number;
    abnormalDischarge: boolean;
    dischargeFrom: string | null;
    sores: boolean;
    pain: boolean;
    history: boolean;
    hiv: boolean;
    fprecord_id: number;
  };
  sexuallyTransmittedInfections: {
    abnormalDischarge: boolean;
    dischargeFrom: string | null;
    sores: boolean;
    pain: boolean;
    history: boolean;
    hiv: boolean;
  };
  risk_vaw: {
    vaw_id: number;
    unpleasant_relationship: boolean;
    partner_disapproval: boolean;
    domestic_violence: boolean;
    referredTo: string;
    fprecord_id: number;
  };
  violenceAgainstWomen: {
    unpleasantRelationship: boolean;
    partnerDisapproval: boolean;
    domesticViolence: boolean;
    referredTo: string;
  };
  fp_physical_exam: {
    fp_pe_id: number;
    skin_exam: string;
    conjunctiva_exam: string;
    neck_exam: string;
    breast_exam: string;
    abdomen_exam: string;
    extremities_exam: string;
    fprecord_id: number;
    bm: number;
    vital: number;
  };
  pregnancyCheck: {
    breastfeeding: boolean;
    abstained: boolean;
    recent_baby: boolean;
    recent_period: boolean;
    recent_abortion: boolean;
    using_contraceptive: boolean;
  };
  fp_pregnancy_check: {
    fp_pc_id: number;
    fp_pc_breastfeeding: boolean;
    fp_pc_abstained: boolean;
    fp_pc_recent_baby: boolean;
    fp_pc_recent_period: boolean;
    fp_pc_recent_abortion: boolean;
    fp_pc_using_contraceptive: boolean;
    fprecord: number;
  };
  skinExamination: string;
  conjunctivaExamination: string;
  neckExamination: string;
  breastExamination: string;
  abdomenExamination: string;
  extremitiesExamination: string;
  body_measurement: {
    bm_id: number;
    age: string;
    height: string;
    weight: string;
    created_at: string;
    patrec: number;
    staff: null;
  };
  weight: string;
  height: string;
  pulseRate: string;
  bloodPressure: string;
  fp_pelvic_exam: {
pelvicExamination: null;
  cervicalConsistency: string | null;
  cervicalTenderness: boolean;
  cervicalAdnexal: boolean;
  uterinePosition: string | null;
  uterineDepth: string | null;
    
  };
  
  fp_acknowledgement: {
    ack_id: number;
    client_name: string;
    ack_clientSignature: string;
    ack_clientSignatureDate: string;
    guardian_signature_date: string;
    fprecord_id: number;
    type: number;
  };
  acknowledgement: {
    selectedMethod: string;
    clientSignature: string;
    clientSignatureDate: string;
    clientName: string;
    guardianName: string;
    guardianSignature: string;
  };
  serviceProvisionRecords: {
    dateOfVisit: string;
    dateOfFollowUp: string;
    weight: number;
    bloodPressure: string;
    medicalFindings: string;
    methodAccepted: string;
    methodQuantity: number;
    serviceProviderSignature: string;
    nameOfServiceProvider: string;
    fprecord_id: number;
  }[];
  medicalHistory: {
    severeHeadaches: boolean;
    strokeHeartAttackHypertension: boolean;
    hematomaBruisingBleeding: boolean;
    breastCancerHistory: boolean; 
    severeChestPain: boolean; 
    cough: boolean;
    jaundice: boolean;
    unexplainedVaginalBleeding: boolean;
    abnormalVaginalDischarge: boolean;
    phenobarbitalOrRifampicin: boolean;
    smoker: boolean;
    disability: boolean;
    disabilityDetails: string;
  };
};

interface FieldRowProps {
  label: string;
  values: (string | number | boolean | undefined | null)[];
  isBoolean?: boolean;
  isSignature?: boolean;
  hasDifferences?: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, values, isBoolean = false, isSignature = false, hasDifferences = false }) => {
  const minWidth = 200 + (values.length * 200);
  
  return (
    <div 
      className="grid gap-6 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors" 
      style={{ 
        gridTemplateColumns: `minmax(200px, 1fr) repeat(${values.length}, minmax(200px, 1fr))`,
        minWidth: `${minWidth}px`
      }}
    >
      <div className="flex items-center sticky left-0 bg-white z-10 pr-4">
        <Label className={cn(
          "text-sm font-medium text-gray-700 leading-relaxed",
          hasDifferences && "text-red-600 font-semibold"
        )}>
          {label}
        </Label>
      </div>
      {values.map((value, index) => (
        <div key={index} className="flex items-center border-r border-gray-100 last:border-r-0">
          {isBoolean ? (
            <YesNoCheckboxView label="" value={value as boolean} />
          ) : isSignature ? (
            <div className="w-full px-3 py-2 min-h-[36px] bg-white border border-gray-300 rounded-md flex items-center shadow-sm">
              {value ? (
                <img
                  src={value as string}
                  alt="Signature"
                  className="max-h-8 max-w-full object-contain"
                />
              ) : (
                <span className="text-gray-400 italic text-sm">No signature</span>
              )}
            </div>
          ) : (
            <InputLine value={value} />
          )}
        </div>
      ))}
    </div>
  );
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div className="mb-8 min-w-max">
    <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-100 sticky left-0">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-0">
      {children}
    </div>
  </div>
);

const MultiRecordComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recordIds: number[] = (location.state as { recordIds: number[] })?.recordIds || [];

  const results = useQueries({
    queries: recordIds.map((id) => ({
      queryKey: ["fpCompleteRecord", id],
      queryFn: () => getFPCompleteRecord(id),
      enabled: !!id,
    })),
  });

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);
  const error = results.find((query) => query.isError)?.error;

  const recordsToDisplay: FullFPRecordDetail[] = useMemo(() => {
    return results
      .filter((query) => query.isSuccess && query.data)
      .map((query) => query.data as FullFPRecordDetail);
  }, [results]);

  const hasDifferences = (values: any[]) => {
    if (values.length <= 1) return false;
    const baseValue = values[0];
    return values.some((value, index) => 
      index > 0 && JSON.stringify(value) !== JSON.stringify(baseValue)
    );
  };

  // Helper function to get service provision record for a specific fprecord_id
  const getServiceProvisionForRecord = (record: FullFPRecordDetail) => {
    if (!record.serviceProvisionRecords || record.serviceProvisionRecords.length === 0) {
      return null;
    }
    
    // Find the service provision record that matches this fprecord_id
    const matchingRecord = record.serviceProvisionRecords.find(
      (sp) => sp.fprecord_id === record.fprecord_id
    );
    
    // If no matching record found, return the first one (fallback)
    return matchingRecord || record.serviceProvisionRecords[0];
  };

  if (!recordIds.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600 bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl mb-4">No records selected for comparison.</p>
          <Button onClick={() => navigate(-1)} className="px-6 py-2">Go Back</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading records for comparison...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-600 mb-4">
            <Cross className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg">Error loading records</p>
            <p className="text-sm text-gray-600 mt-2">{error?.message || "An unknown error occurred."}</p>
          </div>
          <Button onClick={() => navigate(-1)} className="px-6 py-2">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Family Planning Record Comparison</h1>
                <p className="text-gray-600 mt-1">Comparing {recordsToDisplay.length} selected records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="overflow-x-auto scroll-smooth">
          <div className="min-w-max bg-white rounded-lg shadow-md">
            {/* Records Header - Scrollable */}
            <div className="overflow-x-auto scroll-smooth mb-6">
              <div className="min-w-max bg-white rounded-lg shadow-md">
                <div className="bg-sky-600 text-white p-4">
                  <div 
                    className="grid gap-10 ml-10"
                    style={{ gridTemplateColumns: `minmax(280px, 1fr) repeat(${recordsToDisplay.length}, minmax(300px, 1fr))` }}
                  >
                    <div className="font-semibold text-xl sticky left-0 "></div>
                    {recordsToDisplay.map((record) => (
                      <div key={record.fprecord_id} className="font-semibold text-lg">
                        Record {record.fprecord_id}
                        <div className="text-sm font-normal opacity-90 mt-1">
                          <p>Date: {new Date(record.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* FP Record Details */}
              <Section
                title="FP Record Details"
                icon={<LayoutList size={20} className="text-blue-600" />}
              >
                <FieldRow
                  label="Client ID"
                  values={recordsToDisplay.map(r => r.client_id)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.client_id))}
                />
                 <FieldRow
                  label="Philhealth ID"
                  values={recordsToDisplay.map(r => r.philhealthNo)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.philhealthNo))}
                />

                <FieldRow
                  label="4Ps Member"
                  values={recordsToDisplay.map(r => r.fourps)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fourps))}
                />
                 <FieldRow
                  label="NHTS?"
                  values={recordsToDisplay.map(r => r.nhts_status)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.nhts_status))}
                />
                <FieldRow
                  label="Plan More Children"
                  values={recordsToDisplay.map(r => r.plan_more_children)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.plan_more_children))}
                />
                <FieldRow
                  label="Average Monthly Income"
                  values={recordsToDisplay.map(r => r.avg_monthly_income_display)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.avg_monthly_income_display))}
                />
                <FieldRow
                  label="Occupation"
                  values={recordsToDisplay.map(r => r.occupation)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.occupation))}
                />
                <FieldRow
                  label="Type of Client"
                  values={recordsToDisplay.map(r => r.typeOfClient)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.typeOfClient))}
                />
                
                <FieldRow
                  label="Subtype of Client (for Current User)"
                  values={recordsToDisplay.map(r => r.subTypeOfClient)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.subTypeOfClient))}
                />
                <FieldRow
                  label="Reason for Family Planning"
                  values={recordsToDisplay.map(r => r.reasonForFP)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.reasonForFP))}
                />
                <FieldRow
                  label="Other Reason for Family Planning"
                  values={recordsToDisplay.map(r => r.fp_type?.fpt_reason)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_type?.fpt_reason))}
                />
                <FieldRow
                  label="Method Currently Used"
                  values={recordsToDisplay.map(r => r.methodCurrentlyUsed)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.methodCurrentlyUsed))}
                />
                <FieldRow
                  label="Other Method"
                  values={recordsToDisplay.map(r => r.fp_type?.fpt_other_method)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_type?.fpt_other_method))}
                />
              </Section>
              
              {/* Medical History */}
              <Section
                title="Medical History"
                icon={<HeartPulse size={20} className="text-pink-600" />}
              >
                <FieldRow
                  label="Severe headaches / migraine"
                  values={recordsToDisplay.map(r => r.medicalHistory.severeHeadaches)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.severeHeadaches))}
                />
                <FieldRow
                  label="History of stroke / heart attack / hypertension"
                  values={recordsToDisplay.map(r => r.medicalHistory.strokeHeartAttackHypertension)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.strokeHeartAttackHypertension))}
                />
                <FieldRow
                  label="Hematoma/Bruising/Bleeding"
                  values={recordsToDisplay.map(r => r.medicalHistory.hematomaBruisingBleeding)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.hematomaBruisingBleeding))}
                />
                <FieldRow
                  label="Current or history of breast cancer / breast mass"
                  values={recordsToDisplay.map(r => r.medicalHistory.breastCancerHistory)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.breastCancerHistory))}
                />
                <FieldRow
                  label="Severe Chest Pain"
                  values={recordsToDisplay.map(r => r.medicalHistory.severeChestPain)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.severeChestPain))}
                />
                <FieldRow
                  label="Cough (more than 2 weeks)"
                  values={recordsToDisplay.map(r => r.medicalHistory.cough)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.cough))}
                />
                <FieldRow
                  label="Jaundice"
                  values={recordsToDisplay.map(r => r.medicalHistory.jaundice)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.jaundice))}
                />
                <FieldRow
                  label="Unexplained vaginal bleeding"
                  values={recordsToDisplay.map(r => r.medicalHistory.unexplainedVaginalBleeding)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.unexplainedVaginalBleeding))}
                />
                <FieldRow
                  label="Abnormal vaginal discharge"
                  values={recordsToDisplay.map(r => r.medicalHistory.abnormalVaginalDischarge)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.abnormalVaginalDischarge))}
                />
                <FieldRow
                  label="Phenobarbital or Rifampicin Use"
                  values={recordsToDisplay.map(r => r.medicalHistory.phenobarbitalOrRifampicin)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.phenobarbitalOrRifampicin))}
                />
                <FieldRow
                  label="Smoker"
                  values={recordsToDisplay.map(r => r.medicalHistory.smoker)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.smoker))}
                />
                {/* <FieldRow
                  label="With disability?"
                  values={recordsToDisplay.map(r => r.medicalHistory.disability)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.disability))}
                /> */}
                {/* <FieldRow
                  label="Disability Details"
                  values={recordsToDisplay.map(r => r.medicalHistory.disabilityDetails)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.medicalHistory.disabilityDetails))}
                /> */}
              </Section>

              {/* Obstetrical History */}
              <Section
                title="Obstetrical History"
                icon={<Baby size={20} className="text-pink-600" />}
              >
                <FieldRow
                  label="Last Delivery Date"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.lastDeliveryDate)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.lastDeliveryDate))}
                />
                <FieldRow
                  label="Type of Last Delivery"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.typeOfLastDelivery)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.typeOfLastDelivery))}
                />
                <FieldRow
                  label="Last Menstrual Period"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.lastMenstrualPeriod)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.lastMenstrualPeriod))}
                />
                <FieldRow
                  label="Previous Menstrual Period"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.previousMenstrualPeriod)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.previousMenstrualPeriod))}
                />
                <FieldRow
                  label="Menstrual Flow"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.menstrualFlow)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.menstrualFlow))}
                />
                <FieldRow
                  label="Dysmenorrhea"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.dysmenorrhea)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.dysmenorrhea))}
                />
                <FieldRow
                  label="Hydatidiform Mole"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.hydatidiformMole)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.hydatidiformMole))}
                />
                <FieldRow
                  label="Ectopic Pregnancy History"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.ectopicPregnancyHistory)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.ectopicPregnancyHistory))}
                />
                <FieldRow
                  label="Gravida (Pregnancies)"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.g_pregnancies)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.g_pregnancies))}
                />
                <FieldRow
                  label="Para (Deliveries)"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.p_pregnancies)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.p_pregnancies))}
                />
                <FieldRow
                  label="Full Term"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.fullTerm)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.fullTerm))}
                />
                <FieldRow
                  label="Premature"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.premature)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.premature))}
                />
                <FieldRow
                  label="Abortion"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.abortion)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.abortion))}
                />
                <FieldRow
                  label="Living Children"
                  values={recordsToDisplay.map(r => r.obstetricalHistory.numOfLivingChildren)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.obstetricalHistory.numOfLivingChildren))}
                />
              </Section>

              {/* STI Risk */}
              <Section
                title="STI Risk Assessment"
                icon={<Cross size={20} className="text-red-600" />}
              >
                <FieldRow
                  label="Abnormal Discharge"
                  values={recordsToDisplay.map(r => r.sexuallyTransmittedInfections.abnormalDischarge)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.sexuallyTransmittedInfections.abnormalDischarge))}
                />
                <FieldRow
                  label="Discharge from"
                  values={recordsToDisplay.map(r => r.sexuallyTransmittedInfections.dischargeFrom)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.sexuallyTransmittedInfections.dischargeFrom))}
                />
                <FieldRow
                  label="Sores"
                  values={recordsToDisplay.map(r => r.sexuallyTransmittedInfections.sores)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.sexuallyTransmittedInfections.sores))}
                  isBoolean
                />
                <FieldRow
                  label="Pain"
                  values={recordsToDisplay.map(r => r.sexuallyTransmittedInfections.pain)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.sexuallyTransmittedInfections.pain))}
                />
                <FieldRow
                  label="History"
                  values={recordsToDisplay.map(r => r.sexuallyTransmittedInfections.history)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.sexuallyTransmittedInfections.history))}
                />
                <FieldRow
                  label="HIV"
                  values={recordsToDisplay.map(r => r.sexuallyTransmittedInfections.hiv)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.sexuallyTransmittedInfections.hiv))}
                />
              </Section>

              {/* VAW Assessment */}
              <Section
                title="Violence Against Women Assessment"
                icon={<ShieldAlert size={20} className="text-orange-600" />}
              >
                <FieldRow
                  label="Unpleasant Relationship"
                  values={recordsToDisplay.map(r => r.violenceAgainstWomen.unpleasantRelationship)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.violenceAgainstWomen.unpleasantRelationship))}
                />
                <FieldRow
                  label="Partner Disapproval"
                  values={recordsToDisplay.map(r => r.violenceAgainstWomen.partnerDisapproval)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.violenceAgainstWomen.partnerDisapproval))}
                />
                <FieldRow
                  label="Domestic Violence"
                  values={recordsToDisplay.map(r => r.violenceAgainstWomen.domesticViolence)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.violenceAgainstWomen.domesticViolence))}
                />
                <FieldRow
                  label="Referred To"
                  values={recordsToDisplay.map(r => r.violenceAgainstWomen.referredTo)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.violenceAgainstWomen.referredTo))}
                />
              </Section>

              {/* Physical Examination */}
              <Section
                title="Physical Examination"
                icon={<Stethoscope size={20} className="text-green-600" />}
              >
                <FieldRow
                  label="Weight (kg)"
                  values={recordsToDisplay.map(r => r.weight)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.weight))}
                />
                <FieldRow
                  label="Height (cm)"
                  values={recordsToDisplay.map(r => r.height)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.height))}
                />
                <FieldRow
                  label="Pulse Rate"
                  values={recordsToDisplay.map(r => r.pulseRate)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.pulseRate))}
                />
                <FieldRow
                  label="Blood Pressure"
                  values={recordsToDisplay.map(r => r.bloodPressure)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.bloodPressure))}
                />
                <FieldRow
                  label="Skin Examination"
                  values={recordsToDisplay.map(r => r.fp_physical_exam.skin_exam)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_physical_exam.skin_exam))}
                />
                <FieldRow
                  label="Conjunctiva Examination"
                  values={recordsToDisplay.map(r => r.fp_physical_exam.conjunctiva_exam)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_physical_exam.conjunctiva_exam))}
                />
                <FieldRow
                  label="Neck Examination"
                  values={recordsToDisplay.map(r => r.fp_physical_exam.neck_exam)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_physical_exam.neck_exam))}
                />
                <FieldRow
                  label="Breast Examination"
                  values={recordsToDisplay.map(r => r.fp_physical_exam.breast_exam)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_physical_exam.breast_exam))}
                />
                <FieldRow
                  label="Abdomen Examination"
                  values={recordsToDisplay.map(r => r.fp_physical_exam.abdomen_exam)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_physical_exam.abdomen_exam))}
                />
                <FieldRow
                  label="Extremities Examination"
                  values={recordsToDisplay.map(r => r.fp_physical_exam.extremities_exam)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_physical_exam.extremities_exam))}
                />
              </Section>

               {/* Pelvic Examination */}
              <Section
  title="Pelvic Examination"
  icon={<UserSquare size={20} className="text-indigo-600" />}
>
  <FieldRow
    label="Pelvic Exam"
    values={recordsToDisplay.map(r => r.fp_pelvic_exam?.pelvicExamination || null)}
    hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_pelvic_exam?.pelvicExamination))}
  />
  <FieldRow
    label="Cervical Consistency"
    values={recordsToDisplay.map(r => r.fp_pelvic_exam?.cervicalConsistency || null)}
    hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_pelvic_exam?.cervicalConsistency))}
  />
  <FieldRow
    label="Cervical Tenderness"
    values={recordsToDisplay.map(r => r.fp_pelvic_exam?.cervicalTenderness)}
    isBoolean
    hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_pelvic_exam?.cervicalTenderness))}
  />
  <FieldRow
    label="Adnexal Mass / Tenderness"
    values={recordsToDisplay.map(r => r.fp_pelvic_exam?.cervicalAdnexal)}
    isBoolean
    hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_pelvic_exam?.cervicalAdnexal))}
  />
  <FieldRow
    label="Uterine Position"
    values={recordsToDisplay.map(r => r.fp_pelvic_exam?.uterinePosition || null)}
    hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_pelvic_exam?.uterinePosition))}
  />
  <FieldRow
    label="Uterine Depth"
    values={recordsToDisplay.map(r => r.fp_pelvic_exam?.uterineDepth || null)}
    hasDifferences={hasDifferences(recordsToDisplay.map(r => r.fp_pelvic_exam?.uterineDepth))}
  />
</Section>


              {/* Acknowledgement */}
              <Section
                title="Acknowledgement"
                icon={<HeartPulse size={20} className="text-purple-600" />}
              >
                <FieldRow
                  label="Selected Method"
                  values={recordsToDisplay.map(r => r.acknowledgement.selectedMethod)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.acknowledgement.selectedMethod))}
                />
                <FieldRow
                  label="Client Name"
                  values={recordsToDisplay.map(r => r.acknowledgement.clientName)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.acknowledgement.clientName))}
                />
                <FieldRow
                  label="Client Signature Date"
                  values={recordsToDisplay.map(r => r.acknowledgement.clientSignatureDate)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.acknowledgement.clientSignatureDate))}
                />
                <FieldRow
                  label="Guardian Name"
                  values={recordsToDisplay.map(r => r.acknowledgement.guardianName)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.acknowledgement.guardianName))}
                />
                <FieldRow
                  label="Guardian Signature"
                  values={recordsToDisplay.map(r => r.acknowledgement.guardianSignature)}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.acknowledgement.guardianSignature))}
                  isSignature
                />
              </Section>
             
            
              {/* Service Provision Record - Fixed to show correct records */}
              <Section
                title="Service Provision Record"
                icon={<HeartPulse size={20} className="text-purple-600" />}
              >
                <FieldRow
                  label="Date of Visit"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.dateOfVisit || "N/A";
                  })}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.dateOfVisit;
                  }))}
                />
                <FieldRow
                  label="Date of Follow Up"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.dateOfFollowUp || "N/A";
                  })}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.dateOfFollowUp;
                  }))}
                />
                <FieldRow
                  label="Weight"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.weight || "N/A";
                  })}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.weight;
                  }))}
                />
                <FieldRow
                  label="Blood Pressure"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.bloodPressure || "N/A";
                  })}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.bloodPressure;
                  }))}
                />
                <FieldRow
                  label="Medical Findings"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.medicalFindings || "N/A";
                  })}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.medicalFindings;
                  }))}
                />
                <FieldRow
                  label="Method Accepted"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.methodAccepted || "N/A";
                  })}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.methodAccepted;
                  }))}
                />
                <FieldRow
                  label="Method Quantity"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.methodQuantity || "N/A";
                  })}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.methodQuantity;
                  }))}
                />
                <FieldRow
                  label="Service Provider Name"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.nameOfServiceProvider || "N/A";
                  })}
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.nameOfServiceProvider;
                  }))}
                />
                <FieldRow
                  label="Service Provider Signature"
                  values={recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.serviceProviderSignature || "N/A";
                  })}
                  isSignature
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => {
                    const serviceRecord = getServiceProvisionForRecord(r);
                    return serviceRecord?.serviceProviderSignature;
                  }))}
                />
              </Section>

                {/* Pregnancy Check - Fixed to use correct data structure */}
              <Section
                title="Pregnancy Check"
                icon={<Baby size={20} className="text-purple-600" />}
              >
                <FieldRow
                  label="Breastfeeding"
                  values={recordsToDisplay.map(r => r.pregnancyCheck?.breastfeeding)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.pregnancyCheck?.breastfeeding))}
                />
                <FieldRow
                  label="Abstained"
                  values={recordsToDisplay.map(r => r.pregnancyCheck?.abstained)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.pregnancyCheck?.abstained))}
                />
                <FieldRow
                  label="Recent Baby"
                  values={recordsToDisplay.map(r => r.pregnancyCheck?.recent_baby)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.pregnancyCheck?.recent_baby))}
                />
                <FieldRow
                  label="Recent Period"
                  values={recordsToDisplay.map(r => r.pregnancyCheck?.recent_period)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.pregnancyCheck?.recent_period))}
                />
                <FieldRow
                  label="Recent Abortion"
                  values={recordsToDisplay.map(r => r.pregnancyCheck?.recent_abortion)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.pregnancyCheck?.recent_abortion))}
                />
                <FieldRow
                  label="Using Contraceptive"
                  values={recordsToDisplay.map(r => r.pregnancyCheck?.using_contraceptive)}
                  isBoolean
                  hasDifferences={hasDifferences(recordsToDisplay.map(r => r.pregnancyCheck?.using_contraceptive))}
                />
              </Section>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiRecordComparisonPage;