import React from 'react';
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFPCompleteRecord } from "@/pages/familyplanning/request-db/GetRequest";
import type { FormData } from "@/form-schema/FamilyPlanningSchema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface InputLineProps {
  className?: string;
  value: string | number | boolean | undefined;
}

const InputLine: React.FC<InputLineProps> = ({ className, value }) => (
  <Input
    className={`border-0 border-b border-black rounded-none w-full px-1 py-0.5 h-5 text-xs ${className}`}
    readOnly
    value={value !== undefined && value !== null ? String(value) : ""}
  />
);

const YesNoCheckboxView = ({ label, checked }: { label: string; checked: boolean | undefined }) => (
  <div className="flex items-center gap-1">
    <input
      type="checkbox"
      checked={checked === true}
      disabled
      className="h-3 w-3"
    />
    <Label className="text-xs">{label}</Label>
  </div>
);

const pregnancyQuestions = [
  { text: "Did you have a baby less than six (6) months ago, are you fully or nearly fully breastfeeding, and have you had no menstrual period since then?", key: "breastfeeding" },
  { text: "Have you abstained from sexual intercourse since your last menstrual period or delivery?", key: "abstained" },
  { text: "Have you had a baby in the last four (4) weeks?", key: "recent_baby" },
  { text: "Did your last menstrual period start within the past seven (7) days?", key: "recent_period" },
  { text: "Have you had miscarriage or abortion in the last seven (7) days?", key: "recent_abortion" },
  { text: "Have you been using a reliable contraceptive method consistently and correctly?", key: "using_contraceptive" },
];

const INCOME_OPTIONS = [
  { id: "lower", name: "Lower than 5,000" },
  { id: "5,000-10,000", name: "5,000-10,000" },
  { id: "10,000-30,000", name: "10,000-30,000" },
  { id: "30,000-50,000", name: "30,000-50,000" },
  { id: "50,000-80,000", name: "50,000-80,000" },
  { id: "80,000-100,000", name: "80,000-100,000" },
  { id: "100,000-200,000", name: "100,000-200,000" },
  { id: "higher", name: "Higher than 200,000" },
];

const getIncomeName = (incomeId: string) => {
  const option = INCOME_OPTIONS.find((opt) => opt.id === incomeId);
  return option ? option.name : incomeId || 'N/A';
};

export default function PrintableFPView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fprecordId } = location.state || {};

  const { data: recordData, isLoading, isError, error } = useQuery<FormData, Error>({
    queryKey: ['fpCompleteRecordView', fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId,
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (isError) return <div className="text-center py-8 text-red-500">Error: {error?.message}</div>;
  if (!recordData) return <div className="text-center py-8">No record found.</div>;

  const SignatureDisplay = ({ signatureData }: { signatureData: string | undefined }) => {
    if (!signatureData) return <InputLine value="" />;
    return (
      <div className="flex items-center">
        <img src={signatureData} alt="Signature" className="h-8 border-b border-black" />
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to safely access nested properties
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div className="mx-auto p-2 bg-white text-black font-sans text-xs max-w-[8.5in]">
      {/* Print and Back Buttons (Hidden in Print) */}
      <div className="flex gap-2 mb-2 print:hidden">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button onClick={handlePrint}>Print Form</Button>
      </div>

      {/* Side A */}
      <div className="page side-a mb-2">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-bold">SIDE A</div>
          <div className="text-center font-bold text-sm">FAMILY PLANNING (FP) FORM 1</div>
          <div className="text-xs font-bold">ver 3.0</div>
        </div>

        <div className="border border-black p-1">
          <div className="flex flex-col sm:flex-row gap-1">
            <div className="flex-1 p-1 border border-black">
              <Label className="font-bold text-xs mb-1">FAMILY PLANNING CLIENT ASSESSMENT RECORD</Label>
              <p className="text-[10px]">
                Instructions for Physicians, Nurses, and Midwives: <strong>Make sure that the client is not pregnant by using the question listed in SIDE B.</strong> Completely fill out or check the required information. Refer accordingly for any abnormal history/findings for further medical evaluation.
              </p>
            </div>
            <div className="flex-1 p-1 border border-black">
              <div className="flex items-center mb-1">
                <Label className="text-xs font-bold mr-1">CLIENT ID:</Label>
                <InputLine className="flex-1" value={recordData.client_id} />
              </div>
              <div className="flex items-center mb-1">
                <Label className="text-xs font-bold mr-1">PHILHEALTH NO.:</Label>
                <InputLine className="flex-1" value={recordData.philhealthNo} />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <Label className="text-xs font-bold">NHTS?</Label>
                  <YesNoCheckboxView label="Yes" checked={recordData.nhts_status === true} />
                  <YesNoCheckboxView label="No" checked={recordData.nhts_status === false} />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="text-xs font-bold">4Ps:</Label>
                  <YesNoCheckboxView label="Yes" checked={recordData.fourps === true} />
                  <YesNoCheckboxView label="No" checked={recordData.fourps === false} />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-black p-1 mt-1">
            <Label className="font-bold text-xs">NAME OF CLIENT:</Label>
            <div className="flex flex-col sm:flex-row gap-1 mt-1">
              <div className="flex-1">
                <InputLine value={recordData.lastName} />
                <Label className="text-[10px]">Last Name</Label>
              </div>
              <div className="flex-1">
                <InputLine value={recordData.givenName} />
                <Label className="text-[10px]">Given Name</Label>
              </div>
              <div className="w-16">
                <InputLine value={recordData.middleInitial} />
                <Label className="text-[10px]">M.I.</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
              <div>
                <Label className="text-xs">Date of Birth:</Label>
                <InputLine value={recordData.dateOfBirth} />
              </div>
              <div>
                <Label className="text-xs">Age:</Label>
                <InputLine value={recordData.age} />
              </div>
              <div>
                <Label className="text-xs">Educational Attainment:</Label>
                <InputLine value={recordData.educationalAttainment} />
              </div>
              <div>
                <Label className="text-xs">Occupation:</Label>
                <InputLine value={recordData.occupation} />
              </div>
            </div>
            <div className="mt-1">
              <Label className="text-xs">Address:</Label>
              <InputLine value={`${recordData.address?.houseNumber} ${recordData.address?.street}, ${recordData.address?.barangay}, ${recordData.address?.municipality}, ${recordData.address?.province}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
              <div>
                <Label className="text-xs">Plan to have more children?</Label>
                <div className="flex gap-2">
                  <YesNoCheckboxView label="Yes" checked={recordData.plan_more_children === true} />
                  <YesNoCheckboxView label="No" checked={recordData.plan_more_children === false} />
                </div>
              </div>
              <div>
                <Label className="text-xs">No. of Living Children:</Label>
                <InputLine value={recordData.numOfLivingChildren} />
              </div>
              <div>
                <Label className="text-xs">Average Monthly Income:</Label>
                <InputLine value={getIncomeName(recordData.avg_monthly_income)} />
              </div>
            </div>
          </div>

          <div className="border border-black p-1 mt-1">
            <Label className="font-bold text-xs">SPOUSE INFORMATION:</Label>
            <div className="flex flex-col sm:flex-row gap-1 mt-1">
              <div className="flex-1">
                <InputLine value={recordData.spouse?.s_lastName} />
                <Label className="text-[10px]">Last Name</Label>
              </div>
              <div className="flex-1">
                <InputLine value={recordData.spouse?.s_givenName} />
                <Label className="text-[10px]">Given Name</Label>
              </div>
              <div className="w-16">
                <InputLine value={recordData.spouse?.s_middleInitial} />
                <Label className="text-[10px]">M.I.</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
              <div>
                <Label className="text-xs">Date of Birth:</Label>
                <InputLine value={recordData.spouse?.s_dateOfBirth} />
              </div>
              <div>
                <Label className="text-xs">Age:</Label>
                <InputLine value={recordData.spouse?.s_age} />
              </div>
              <div>
                <Label className="text-xs">Occupation:</Label>
                <InputLine value={recordData.spouse?.s_occupation} />
              </div>
            </div>
          </div>

          <div className="border border-black p-1 mt-1">
            <Label className="font-bold text-xs">I. MEDICAL HISTORY:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { label: "Severe headaches / migraine", key: "severeHeadaches" },
                { label: "History of stroke / heart attack / hypertension", key: "strokeHeartAttackHypertension" },
                { label: "Non-traumatic hematoma / frequent bruising or gum bleeding", key: "hematomaBruisingBleeding" },
                { label: "Current or history of breast cancer / breast mass", key: "breastCancerHistory" },
                { label: "Severe chest pain", key: "severeChestPain" },
                { label: "Cough for more than 14 days", key: "cough" },
                { label: "Jaundice", key: "jaundice" },
                { label: "Unexplained vaginal bleeding", key: "unexplainedVaginalBleeding" },
                { label: "Abnormal vaginal discharge", key: "abnormalVaginalDischarge" },
                { label: "Intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)", key: "phenobarbitalOrRifampicin" },
                { label: "Is this client a SMOKER?", key: "smoker" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Label className="text-[10px]">{item.label}</Label>
                  <YesNoCheckboxView
                    label="Yes"
                    checked={getNestedValue(recordData, `medicalHistory.${item.key}`) === true}
                  />
                  <YesNoCheckboxView
                    label="No"
                    checked={getNestedValue(recordData, `medicalHistory.${item.key}`) === false}
                  />
                </div>
              ))}
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Disability:</Label>
                <YesNoCheckboxView label="Yes" checked={recordData.medicalHistory?.disability === true} />
                <YesNoCheckboxView label="No" checked={recordData.medicalHistory?.disability === false} />
              </div>
              {recordData.medicalHistory?.disability && (
                <div>
                  <Label className="text-[10px]">Specify Disability:</Label>
                  <InputLine value={recordData.medicalHistory?.disabilityDetails} />
                </div>
              )}
            </div>
          </div>

          <div className="border border-black p-1 mt-1">
            <Label className="font-bold text-xs">OBSTETRICAL HISTORY:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">G (Gravida):</Label>
                <InputLine className="w-16" value={recordData.obstetricalHistory?.g_pregnancies} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">P (Para):</Label>
                <InputLine className="w-16" value={recordData.obstetricalHistory?.p_pregnancies} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Full Term:</Label>
                <InputLine className="w-16" value={recordData.obstetricalHistory?.fullTerm} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Premature:</Label>
                <InputLine className="w-16" value={recordData.obstetricalHistory?.premature} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Abortion:</Label>
                <InputLine className="w-16" value={recordData.obstetricalHistory?.abortion} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Living Children:</Label>
                <InputLine className="w-16" value={recordData.obstetricalHistory?.numOfLivingChildren} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Last Delivery Date:</Label>
                <InputLine value={recordData.obstetricalHistory?.lastDeliveryDate} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Type of Last Delivery:</Label>
                <InputLine value={recordData.obstetricalHistory?.typeOfLastDelivery} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Last Menstrual Period:</Label>
                <InputLine value={recordData.obstetricalHistory?.lastMenstrualPeriod} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Previous Menstrual Period:</Label>
                <InputLine value={recordData.obstetricalHistory?.previousMenstrualPeriod} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px]">Menstrual Flow:</Label>
                <InputLine value={recordData.obstetricalHistory?.menstrualFlow} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px]">Dysmenorrhea:</Label>
                <YesNoCheckboxView label="Yes" checked={recordData.obstetricalHistory?.dysmenorrhea === true} />
                <YesNoCheckboxView label="No" checked={recordData.obstetricalHistory?.dysmenorrhea === false} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px]">Hydatidiform Mole (within the last 12 months):</Label>
                <YesNoCheckboxView label="Yes" checked={recordData.obstetricalHistory?.hydatidiformMole === true} />
                <YesNoCheckboxView label="No" checked={recordData.obstetricalHistory?.hydatidiformMole === false} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px]">History of Ectopic Pregnancy:</Label>
                <YesNoCheckboxView label="Yes" checked={recordData.obstetricalHistory?.ectopicPregnancyHistory === true} />
                <YesNoCheckboxView label="No" checked={recordData.obstetricalHistory?.ectopicPregnancyHistory === false} />
              </div>
            </div>
          </div>

          <div className="border border-black p-1 mt-1">
            <Label className="font-bold text-xs">SEXUALLY TRANSMITTED INFECTIONS (STIs):</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { label: "Abnormal discharge", key: "abnormalDischarge" },
                { label: "Sores in genital area", key: "sores" },
                { label: "Pain in lower abdomen", key: "pain" },
                { label: "History of STI", key: "history" },
                { label: "HIV", key: "hiv" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Label className="text-[10px]">{item.label}</Label>
                  <YesNoCheckboxView
                    label="Yes"
                    checked={getNestedValue(recordData, `sexuallyTransmittedInfections.${item.key}`) === true}
                  />
                  <YesNoCheckboxView
                    label="No"
                    checked={getNestedValue(recordData, `sexuallyTransmittedInfections.${item.key}`) === false}
                  />
                </div>
              ))}
              {recordData.sexuallyTransmittedInfections?.abnormalDischarge && (
                <div>
                  <Label className="text-[10px]">Abnormal Discharge From:</Label>
                  <InputLine value={recordData.sexuallyTransmittedInfections.dischargeFrom} />
                </div>
              )}
            </div>
          </div>

          <div className="border border-black p-1 mt-1">
            <Label className="font-bold text-xs">VAW RISK ASSESSMENT:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { label: "Unpleasant relationship with partner", key: "unpleasantRelationship" },
                { label: "Partner does not approve of the visit to FP clinic", key: "partnerDisapproval" },
                { label: "History of domestic violence or VAW", key: "domesticViolence" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Label className="text-[10px]">{item.label}</Label>
                  <YesNoCheckboxView
                    label="Yes"
                    checked={getNestedValue(recordData, `violenceAgainstWomen.${item.key}`) === true}
                  />
                  <YesNoCheckboxView
                    label="No"
                    checked={getNestedValue(recordData, `violenceAgainstWomen.${item.key}`) === false}
                  />
                </div>
              ))}
              <div>
                <Label className="text-[10px]">Referred To:</Label>
                <InputLine value={recordData.violenceAgainstWomen?.referredTo || ""} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-break" />

      {/* Side B */}
      <div className="page side-b">
        <div className="text-right text-xs text-gray-600 mb-1">SIDE B</div>
        <div className="text-right text-xs text-gray-600">FP FORM 1</div>
        <h1 className="text-center text-lg font-semibold mb-1">FAMILY PLANNING CLIENT ASSESSMENT RECORD</h1>

        <div className="border border-black p-1 mb-1">
          <h2 className="font-bold text-xs mb-1">PHYSICAL EXAMINATION:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <div>
              <Label className="text-[10px] font-bold">Weight (kg):</Label>
              <InputLine value={recordData.weight} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">Height (cm):</Label>
              <InputLine value={recordData.height} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">Blood Pressure (mmHg):</Label>
              <InputLine value={recordData.bloodPressure} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">Pulse Rate (bpm):</Label>
              <InputLine value={recordData.pulseRate} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { label: "Skin:", value: recordData.skinExamination },
                { label: "Conjunctiva:", value: recordData.conjunctivaExamination },
                { label: "Neck:", value: recordData.neckExamination },
                { label: "Breast:", value: recordData.breastExamination },
                { label: "Abdomen:", value: recordData.abdomenExamination },
                { label: "Extremities:", value: recordData.extremitiesExamination },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Label className="text-[10px] font-bold">{item.label}</Label>
                  <InputLine className="flex-1" value={item.value} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-black p-1 mb-1">
          <h2 className="font-bold text-xs mb-1">PELVIC EXAMINATION:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <div>
              <Label className="text-[10px] font-bold">Pelvic Examination:</Label>
              <InputLine value={recordData.pelvicExamination} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">Cervical Consistency:</Label>
              <InputLine value={recordData.cervicalConsistency} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-[10px] font-bold">Cervical Tenderness:</Label>
              <YesNoCheckboxView label="Yes" checked={recordData.cervicalTenderness === true} />
              <YesNoCheckboxView label="No" checked={recordData.cervicalTenderness === false} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-[10px] font-bold">Cervical Adnexal Tenderness/Mass:</Label>
              <YesNoCheckboxView label="Yes" checked={recordData.cervicalAdnexal === true} />
              <YesNoCheckboxView label="No" checked={recordData.cervicalAdnexal === false} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">Uterine Position:</Label>
              <InputLine value={recordData.uterinePosition} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">Uterine Depth (cm):</Label>
              <InputLine value={recordData.uterineDepth} />
            </div>
          </div>
        </div>

        <div className="border border-black p-1 mb-1">
          <h2 className="font-bold text-xs mb-1">ACKNOWLEDGEMENT:</h2>
          <p className="text-[10px] mb-1">
            This is to certify that the Physician/Nurse/Midwife of the clinic has fully explained to me the different methods available in family planning and I freely choose the <span className="font-semibold underline">{recordData.acknowledgement?.selectedMethod}</span> method.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-1">
            <div>
              <Label className="text-[10px] font-bold">Client Signature:</Label>
              <SignatureDisplay signatureData={recordData.acknowledgement?.clientSignature} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">Date:</Label>
              <span className="font-semibold underline text-[10px]">{recordData.acknowledgement?.clientSignatureDate}</span>
            </div>
          </div>
          <p className="text-[10px] mb-1">
            For WRA below 18 yrs. old:<br />
            I hereby consent <span className="font-semibold underline">{recordData.acknowledgement?.clientName}</span> to accept the Family Planning method
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <div>
              <Label className="text-[10px] font-bold">Parent/Guardian Signature:</Label>
              <SignatureDisplay signatureData={recordData.acknowledgement?.guardianSignature} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">Date:</Label>
              <span className="font-semibold underline text-[10px]">{recordData.acknowledgement?.guardianSignatureDate}</span>
            </div>
          </div>
        </div>

        <div className="border border-black p-1 mb-1">
          <h2 className="font-bold text-xs mb-1">SERVICE PROVISION RECORDS:</h2>
          {recordData.serviceProvisionRecords && recordData.serviceProvisionRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black text-[8pt]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-left">Date of Visit</th>
                    <th className="border border-black p-1 text-left">Date of Follow Up</th>
                    <th className="border border-black p-1 text-left">Weight (kg)</th>
                    <th className="border border-black p-1 text-left">Blood Pressure (mmHg)</th>
                    <th className="border border-black p-1 text-left">Findings</th>
                    <th className="border border-black p-1 text-left">Method Accepted</th>
                    <th className="border border-black p-1 text-left">Quantity</th>
                    <th className="border border-black p-1 text-left">Signature of Service Provider</th>
                    <th className="border border-black p-1 text-left">Name of Service Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {recordData.serviceProvisionRecords.map((service, index) => (
                    <tr key={index}>
                      <td className="border border-black p-1">{service.dateOfVisit || ""}</td>
                      <td className="border border-black p-1">{service.dateOfFollowUp || ""}</td>
                      <td className="border border-black p-1">{service.weight || ""}</td>
                      <td className="border border-black p-1">{service.bloodPressure || ""}</td>
                      <td className="border border-black p-1">{service.medicalFindings || ""}</td>
                      <td className="border border-black p-1">{service.methodAccepted || ""}</td>
                      <td className="border border-black p-1">{service.methodQuantity || ""}</td>
                      <td className="border border-black p-1">
                        {service.serviceProviderSignature ? (
                          <img src={service.serviceProviderSignature} alt="Provider Signature" className="h-6 w-auto" />
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="border border-black p-1">{service.nameOfServiceProvider || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[10px]">No service provision records found.</p>
          )}
        </div>

        <div className="overflow-x-auto mb-1">
          <table className="w-full border-collapse border border-black text-[8pt]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 text-left w-3/4">How to be Reasonably Sure a Client is Not Pregnant</th>
                <th className="border border-black p-1 text-center w-1/8">Yes</th>
                <th className="border border-black p-1 text-center w-1/8">No</th>
              </tr>
            </thead>
            <tbody>
              {pregnancyQuestions.map((q, index) => (
                <tr key={index}>
                  <td className="border border-black p-1 text-[8pt]">{q.text}</td>
                  <td className="border border-black p-1 text-center">
                    <input
                      type="radio"
                      checked={recordData.pregnancyCheck?.[q.key as keyof typeof recordData.pregnancyCheck] === true}
                      disabled
                      className="h-3 w-3"
                    />
                  </td>
                  <td className="border border-black p-1 text-center">
                    <input
                      type="radio"
                      checked={recordData.pregnancyCheck?.[q.key as keyof typeof recordData.pregnancyCheck] === false}
                      disabled
                      className="h-3 w-3"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-1 rounded-md text-[8pt] bg-gray-50">
            <div className="font-medium mb-1">
              ■ If the client answered YES to at least one of the questions and she is free of signs or symptoms of pregnancy, provide client with desired method.
            </div>
            <div className="font-medium">
              ■ If the client answered NO to all of the questions, pregnancy cannot be ruled out. The client should await menses or use a pregnancy test.
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}