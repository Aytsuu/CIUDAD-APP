import React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFPCompleteRecord } from "@/pages/familyplanning/request-db/GetRequest";
import type { FormData } from "@/form-schema/FamilyPlanningSchema";
import { ChevronLeft } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface InputLineProps {
  className?: string;
  value: string | number | boolean | Date | undefined | null;
}

const InputLine: React.FC<InputLineProps> = ({ className, value }) => {
  const displayValue = React.useMemo(() => {
    if (value === undefined || value === null) return "";
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  }, [value]);

  return (
    <span
      className={cn(
        "inline-block border-b border-black text-xs px-1",
        className
      )}
    >
      {displayValue}
    </span>
  );
};

const YesNoCheckbox = ({ label, checked }: { label: string; checked: boolean | undefined }) => (
  <div className="flex items-center gap-1">
    <Checkbox checked={checked === true} disabled className="h-3 w-3" />
    <Label className="text-xs">{label}</Label>
  </div>
);

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

const getIncomeName = (incomeId: any) => {
  const option = INCOME_OPTIONS.find((opt) => opt.id === incomeId);
  return option ? option.name : incomeId || "N/A";
};

type STIKey = "abnormalDischarge" | "sores" | "pain" | "history";

export const FamilyPlanningView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fprecordId } = location.state || {};

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
  contentRef: componentRef,
  pageStyle: `
    @page {
      size: 8.5in 13in;
      margin: 0.25in; /* Reduced margin to fit more content */
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
      .print-content {
        height: 100%; /* Ensure content uses full page height */
        overflow: visible; /* Prevent overflow issues */
      }
    }
  `,
});

  const {
    data: recordData,
    isLoading,
    isError,
    error,
  } = useQuery<FormData, Error>({
    queryKey: ["fpCompleteRecordView", fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId,
  });

  const getCustomIllnesses = () => {
    if (!recordData) return [];

    const illnesses = [];

    const exactStandardConditions = [
      "severe headaches / migraine",
      "history of stroke / heart attack / hypertension",
      "non-traumatic hematoma / frequent bruising or gum bleeding",
      "current or history of breast cancer / breast mass",
      "severe chest pain",
      "cough for more than 14 days",
      "jaundice",
      "unexplained vaginal bleeding",
      "abnormal vaginal discharge",
      "intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)",
      "Is the client a SMOKER?",
      "With Disability?",
    ];

    if (
      recordData.medicalHistory?.disabilityDetails &&
      recordData.medicalHistory.disabilityDetails.trim() !== ""
    ) {
      const disabilityDetail = recordData.medicalHistory.disabilityDetails.trim();
      const isExactStandard = exactStandardConditions.some(
        (condition) => condition.toLowerCase() === disabilityDetail.toLowerCase()
      );
      if (!isExactStandard) {
        illnesses.push(disabilityDetail);
      }
    }

    // Uncomment and fix this section if you need to process medical history records
    /*
    if (recordData?.medical_history_records) {
      recordData?.medical_history_records.forEach(record => {
        const isExactStandard = exactStandardConditions.some(condition =>
          condition.toLowerCase() === record.illname.toLowerCase()
        );
        if (!isExactStandard) {
          illnesses.push(record.illname);
        }
      });
    }
    */

    return illnesses;
  };

  const hasCustomIllnesses = () => {
    return getCustomIllnesses().length > 0;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading record details...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading record: {error?.message}
      </div>
    );
  }

  if (!recordData) {
    return (
      <div className="text-center py-8">
        No record found for ID: {fprecordId}
      </div>
    );
  }

  const SignatureDisplay = ({ signatureData }: { signatureData: string | undefined }) => {
    if (!signatureData)
      return <div className="h-8 border-b border-black w-full"></div>;

    return (
      <div className="flex items-center">
        <img
          src={signatureData}
          alt="Signature"
          className="h-8 border-b border-black"
        />
      </div>
    );
  };

  return (
    <div className="mx-auto p-4 bg-white max-w-3xl text-[10px]">
      <div className="flex justify-between items-center mb-1 no-print">
        <Button
          className="text-black p-1 self-start"
          variant="outline"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button onClick={handlePrint} className="ml-auto">
          Print Side A
        </Button>
      </div>

      <div ref={componentRef} className="print-content">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-bold ">SIDE A</div>
          <div className="text-center font-bold text-sm">
            FAMILY PLANNING (FP) FORM 1
          </div>
          <div className="text-xs font-bold">ver 3.0</div>
        </div>

        <div className="border border-black">
          <div className="flex">
            <div className="w-2/3 border-r bg-gray-200 border-black p-1">
              <div className=" text-sm mb-1 font-bold">
                FAMILY PLANNING CLIENT ASSESSMENT RECORD
              </div>
              <p className="text-xs italic">
                Instructions for Physicians, Nurses, and Midwives:{" "}
                <strong>
                  Make sure that the client is not pregnant by using the question
                  listed in SIDE B.{" "}
                </strong>
                Completely fill out or check the required information. Refer
                accordingly for any abnormal history/findings for further medical
                evaluation.
              </p>
            </div>

            <div className="w-1/3 p-1 bg-gray-200">
              <div className="flex items-center mb-1">
                <Label className="text-xs  mr-2 whitespace-nowrap">
                  CLIENT ID.:
                </Label>
                <InputLine className="flex-1 h-4" value={recordData.client_id} />
              </div>
              <div className="flex items-center mb-1">
                <Label className="text-xs  mr-2 whitespace-nowrap">
                  PHILHEALTH NO.:
                </Label>
                <InputLine className="flex-1 h-4" value={recordData.philhealthNo} />
              </div>
              <div className="flex items-center gap-1 mb-1">
                <Label className="text-xs ">NHTS?</Label>
                <YesNoCheckbox
                  label="Yes"
                  checked={recordData.nhts_status === true}
                />
                <YesNoCheckbox
                  label="No"
                  checked={recordData.nhts_status === false}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs ">4Ps:</Label>
                <YesNoCheckbox
                  label="Yes"
                  checked={recordData.fourps === true}
                />
                <YesNoCheckbox
                  label="No"
                  checked={recordData.fourps === false}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-black border-b p-1">
            <div className="mb-1 ">
              <Label className=" text-xs">NAME OF CLIENT: </Label>
              <div className="flex grid-cols-12 gap-1 mt-1">
                <div className="col-span-2">
                  <Label className="text-xs">Last Name </Label>
                  <InputLine className="h-4" value={recordData.lastName} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Given Name</Label>
                  <InputLine className="h-4" value={recordData.givenName} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">M.I.</Label>
                  <InputLine className="h-4" value={recordData.middleInitial} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs align-center">Date of Birth</Label>
                  <InputLine className="h-4" value={recordData.dateOfBirth} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Age</Label>
                  <InputLine className="h-4" value={recordData.age} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Educ. Attain.</Label>
                  <InputLine className="h-4" value={recordData.educationalAttainment} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Occupation</Label>
                  <InputLine className="h-4" value={recordData.occupation} />
                </div>
              </div>
            </div>

            <div className="mb-1">
              <Label className=" text-xs">ADDRESS</Label>
              <div className="flex  grid-cols-12 gap-6 mt-1">
                <div className="col-span-3">
                  <Label className="text-xs">No. Street</Label>
                  <InputLine className="h-4" value={recordData.address?.houseNumber} />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Barangay: </Label>
                  <InputLine className="h-4" value={recordData.address?.barangay} />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Municipality/City: </Label>
                  <InputLine className="h-4" value={recordData.address?.municipality} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Province: </Label>
                  <InputLine className="h-4" value={recordData.address?.province} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Contact Number: </Label>
                  <InputLine className="h-4" value={recordData.contact} />
                </div>
              </div>
            </div>

            <div className="mb-1">
              <Label className=" text-xs">NAME OF SPOUSE:</Label>
              <div className="flex grid-cols-12 gap-5 mt-1">
                <div className="col-span-4">
                  <Label className="text-xs">Last Name:</Label>
                  <InputLine className="h-4" value={recordData.spouse?.s_lastName} />
                </div>
                <div className="col-span-4">
                  <Label className="text-xs">Given Name: </Label>
                  <InputLine className="h-4" value={recordData.spouse?.s_givenName} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">M.I.</Label>
                  <InputLine className="h-4" value={recordData.spouse?.s_middleInitial} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Date of Birth: </Label>
                  <InputLine className="h-4" value={recordData.spouse?.s_dateOfBirth} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Age: </Label>
                  <InputLine className="h-4" value={recordData.spouse?.s_age} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Occupation: </Label>
                  <InputLine className="h-4" value={recordData.spouse?.s_occupation} />
                </div>
              </div>
            </div>

            <div className="flex grid-cols-4 gap-9 mb-1">
              <div>
                <Label className=" text-xs">NO. OF LIVING CHILDREN:</Label>
                <InputLine
                  className="h-4 mt-1"
                  value={recordData.obstetricalHistory?.numOfLivingChildren || recordData?.num_of_children}
                />
              </div>
              <div>
                <Label className=" text-xs">PLAN TO HAVE MORE CHILDREN?</Label>
                <div className="flex gap-1 mt-1">
                  <YesNoCheckbox
                    label="Yes"
                    checked={recordData.plan_more_children === true}
                  />
                  <YesNoCheckbox
                    label="No"
                    checked={recordData.plan_more_children === false}
                  />
                </div>
              </div>
              <div className="">
                <Label className=" text-xs">AVERAGE MONTHLY INCOME:</Label>
                <InputLine
                  className="h-4 mt-1"
                  value={getIncomeName(recordData.avg_monthly_income)}
                />
              </div>
            </div>

            <div className="pt-1 mt-2 grid grid-cols-12 gap-1">
              <Label className=" col-span-2">Type of Client:</Label>
              <InputLine className="col-span-4" value={recordData.typeOfClient} />
              {recordData.typeOfClient === "Current User" && (
                <>
                  <Label className=" col-span-2 mt-0">Subtype of Client:</Label>
                  <InputLine className="col-span-4" value={recordData.subTypeOfClient} />
                </>
              )}

              <Label className=" col-span-2">Reason for FP:</Label>
              <InputLine className="col-span-4" value={recordData.reasonForFP} />
              {(recordData.reasonForFP === "Others" ||
                recordData.reasonForFP === "sideeffects") && (
                <>
                  <Label className=" col-span-2 mt-0">
                    {recordData.reasonForFP === "Others"
                      ? "Other Reason for FP:"
                      : "Side Effect:"}
                  </Label>
                  <InputLine className="col-span-4" value={recordData.fp_type?.fpt_reason} />
                </>
              )}

              <Label className=" col-span-2">Method Used:</Label>
              <InputLine className="col-span-4" value={recordData.methodCurrentlyUsed} />
              {recordData.methodCurrentlyUsed === "Others" && (
                <>
                  <Label className=" col-span-2 mt-0">Other Method:</Label>
                  <InputLine className="col-span-4" value={recordData.otherMethod} />
                </>
              )}
            </div>
          </div>

          <div className="flex border-t border-black">
            <div className="w-1/2 border-r border-black">
              <div className="p-1">
                <Label className="text-xs block">I. MEDICAL HISTORY</Label>
                <div className="text-xs">
                  <div>Does the client have any of the following?</div>
                  {[
                    { label: "severe headaches / migraine", key: "severeHeadaches" },
                    {
                      label: "history of stroke / heart attack / hypertension",
                      key: "strokeHeartAttackHypertension",
                    },
                    {
                      label: "non-traumatic hematoma / frequent bruising or gum bleeding",
                      key: "hematomaBruisingBleeding",
                    },
                    {
                      label: "current or history of breast cancer / breast mass",
                      key: "breastCancerHistory",
                    },
                    { label: "severe chest pain", key: "severeChestPain" },
                    { label: "cough for more than 14 days", key: "cough" },
                    { label: "jaundice", key: "jaundice" },
                    {
                      label: "unexplained vaginal bleeding",
                      key: "unexplainedVaginalBleeding",
                    },
                    {
                      label: "abnormal vaginal discharge",
                      key: "abnormalVaginalDischarge",
                    },
                    {
                      label: "intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)",
                      key: "phenobarbitalOrRifampicin",
                    },
                    { label: "Is the client a SMOKER?", key: "smoker" },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-0.5">
                      <span>• {item.label}</span>
                      <div className="flex gap-1">
                        <YesNoCheckbox
                          label="Yes"
                          checked={
                            recordData.medicalHistory?.[
                              item.key as keyof typeof recordData.medicalHistory
                            ] === true
                          }
                        />
                        <YesNoCheckbox
                          label="No"
                          checked={
                            recordData.medicalHistory?.[
                              item.key as keyof typeof recordData.medicalHistory
                            ] === false
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {/* <div className="flex justify-between items-center py-0.5">
                    <span>• With Disability?</span>
                    <div className="flex gap-1">
                      <YesNoCheckbox
                        label="Yes"
                        checked={
                          recordData.medicalHistory?.disability === true ||
                          hasCustomIllnesses()
                        }
                      />
                      <YesNoCheckbox
                        label="No"
                        checked={
                          recordData.medicalHistory?.disability === false &&
                          !hasCustomIllnesses()
                        }
                      />
                    </div>
                  </div> */}

                  {hasCustomIllnesses() && (
                    <div className="mt-1">
                      <div className="flex items-center gap-1">
                        <p className="italic text-xs">If YES, please specify:</p>
                        <InputLine
                          className="flex-1 h-4"
                          value={getCustomIllnesses().join(", ")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-black p-1">
                <Label className=" text-xs block">II. OBSTETRICAL HISTORY</Label>
                <div className="grid grid-cols-2 gap-1 text-xs ">
                  <div className="flex items-center gap-1">
                    <span>Number of pregnancies:</span>
                    <span>G</span>
                    <InputLine
                      className="w-8 h-4"
                      value={recordData.obstetricalHistory?.g_pregnancies}
                    />
                    <span>P</span>
                    <InputLine
                      className="w-8 h-4"
                      value={recordData.obstetricalHistory?.p_pregnancies}
                    />
                  </div>
                  <div></div>
                  <div className="flex items-center gap-1">
                    <InputLine
                      className="w-8 h-4"
                      value={recordData.obstetricalHistory?.fullTerm}
                    />
                    <span>Full term</span>
                    <InputLine
                      className="w-8 h-4"
                      value={recordData.obstetricalHistory?.premature}
                    />
                    <span>Premature</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <InputLine
                      className="w-8 h-4"
                      value={recordData.obstetricalHistory?.abortion}
                    />
                    <span>Abortion</span>
                    <InputLine
                      className="w-8 h-4"
                      value={recordData.obstetricalHistory?.numOfLivingChildren}
                    />
                    <span>Living children</span>
                  </div>
                </div>
                <div className="text-xs ">
                  <div className="flex items-center gap-1">
                    <span>Date of last delivery:</span>
                    <InputLine
                      className="inline-block w-24 h-4"
                      value={recordData.obstetricalHistory?.lastDeliveryDate}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Type of last delivery:</span>
                    <div className="flex gap-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            recordData.obstetricalHistory?.typeOfLastDelivery ===
                            "Vaginal"
                          }
                          disabled
                          className="h-3 w-3"
                        />
                        <span>Vaginal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            recordData.obstetricalHistory?.typeOfLastDelivery ===
                            "Cesarean section"
                          }
                          disabled
                          className="h-3 w-3"
                        />
                        <span>Cesarean Section</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Last menstrual period:</span>
                    <InputLine
                      className="inline-block w-24 h-4"
                      value={recordData.obstetricalHistory?.lastMenstrualPeriod}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Previous menstrual period:</span>
                    <InputLine
                      className="inline-block w-24 h-4"
                      value={recordData.obstetricalHistory?.previousMenstrualPeriod}
                    />
                  </div>
                  <div>
                    <div>Menstrual flow:</div>
                    <div className="ml-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            recordData.obstetricalHistory?.menstrualFlow === "Scanty"
                          }
                          disabled
                          className="h-3 w-3"
                        />
                        <span>scanty (1-2 pads per day)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            recordData.obstetricalHistory?.menstrualFlow === "Moderate"
                          }
                          disabled
                          className="h-3 w-3"
                        />
                        <span>moderate (3-5 pads per day)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            recordData.obstetricalHistory?.menstrualFlow === "Heavy"
                          }
                          disabled
                          className="h-3 w-3"
                        />
                        <span>heavy (5/more pads per day)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={recordData.obstetricalHistory?.dysmenorrhea === true}
                        disabled
                        className="h-3 w-3"
                      />
                      <span>Dysmenorrhea</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={
                          recordData.obstetricalHistory?.hydatidiformMole === true
                        }
                        disabled
                        className="h-3 w-3"
                      />
                      <span>Hydatidiform mole (within the last 12 months)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={
                          recordData.obstetricalHistory?.ectopicPregnancyHistory ===
                          true
                        }
                        disabled
                        className="h-3 w-3"
                      />
                      <span>History of ectopic pregnancy</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-black p-1">
                <Label className=" text-xs block">
                  III. RISKS FOR SEXUALLY TRANSMITTED INFECTIONS
                </Label>
                <div className="text-xs">
                  <div>
                    Does the client or the client's partner have any of the
                    following?
                  </div>
                  {[
                    { label: "abnormal discharge", key: "abnormalDischarge" as STIKey },
                    {
                      label: "sores or ulcers in the genital area",
                      key: "sores" as STIKey,
                    },
                    {
                      label: "pain or burning sensation in the genital area",
                      key: "pain" as STIKey,
                    },
                    {
                      label: "history of treatment for sexually transmitted infections",
                      key: "history" as STIKey,
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-0.5">
                      <span>• {item.label}</span>
                      <div className="flex gap-1">
                        <YesNoCheckbox
                          label="Yes"
                          checked={
                            recordData.sexuallyTransmittedInfections?.[item.key] ===
                            true
                          }
                        />
                        <YesNoCheckbox
                          label="No"
                          checked={
                            recordData.sexuallyTransmittedInfections?.[item.key] ===
                            false
                          }
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-0.5">
                    <span>• HIV / AIDS / Pelvic inflammatory disease</span>
                    <div className="flex gap-1">
                      <YesNoCheckbox
                        label="Yes"
                        checked={
                          recordData.sexuallyTransmittedInfections?.hiv === true
                        }
                      />
                      <YesNoCheckbox
                        label="No"
                        checked={
                          recordData.sexuallyTransmittedInfections?.hiv === false
                        }
                      />
                    </div>
                  </div>
                  {recordData.sexuallyTransmittedInfections?.abnormalDischarge && (
                    <div className="mt-1 ml-4">
                      <span>Abnormal Discharge From: </span>
                      <span className="font-semibold underline">
                        {recordData.sexuallyTransmittedInfections.dischargeFrom}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-1/2">
              <div className="p-1">
                <Label className=" text-xs block mb-1">
                  IV. RISKS FOR VIOLENCE AGAINST WOMEN (VAW)
                </Label>
                <div className="text-xs">
                  {[
                    {
                      label: "history of domestic violence or VAW",
                      key: "domesticViolence" as const,
                    },
                    {
                      label: "unpleasant relationship with partner",
                      key: "unpleasantRelationship" as const,
                    },
                    {
                      label: "partner does not approve of the visit to FP clinic",
                      key: "partnerDisapproval" as const,
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-0.5">
                      <span>• {item.label}</span>
                      <div className="flex gap-1">
                        <YesNoCheckbox
                          label="Yes"
                          checked={recordData.violenceAgainstWomen?.[item.key] === true}
                        />
                        <YesNoCheckbox
                          label="No"
                          checked={
                            recordData.violenceAgainstWomen?.[item.key] === false
                          }
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-2">
                    <span>Referred to: </span>
                    <InputLine
                      className="inline-block w-20 h-4 ml-1"
                      value={recordData.violenceAgainstWomen?.referredTo}
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-black p-1">
                <Label className=" text-xs block mb-1">V. PHYSICAL EXAMINATION</Label>
                <div className="text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1">
                      <span>Weight:</span>
                      <InputLine className="flex-1 h-4" value={recordData.weight} />
                      <span>kg</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Blood pressure:</span>
                      <InputLine
                        className="flex-1 h-4"
                        value={recordData.bloodPressure}
                      />
                      <span>mmHg</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Height:</span>
                      <InputLine className="flex-1 h-4" value={recordData.height} />
                      <span>cm</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Pulse rate:</span>
                      <InputLine className="flex-1 h-4" value={recordData.pulseRate} />
                      <span>/min</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      {" "}
                      SKIN:{" "}
                      <InputLine className="h-4" value={recordData.fp_physical_exam.skin_exam} />
                    </div>
                    <div>
                      {" "}
                      CONJUNCTIVA:{" "}
                      <InputLine
                        className="h-4"
                        value={recordData.fp_physical_exam.conjunctiva_exam}
                      />{" "}
                    </div>
                    <div>
                      NECK:
                      <InputLine className="h-4" value={recordData.fp_physical_exam.neck_exam} />{" "}
                    </div>
                    <div>
                      {" "}
                      BREAST:{" "}
                      <InputLine className="h-4" value={recordData.fp_physical_exam.breast_exam} />{" "}
                    </div>
                    <div>
                      {" "}
                      ABDOMEN:{" "}
                      <InputLine className="h-4" value={recordData.fp_physical_exam.abdomen_exam} />{" "}
                    </div>
                    <div>
                      {" "}
                      EXTREMITIES{" "}
                      <InputLine
                        className="h-4"
                        value={recordData.fp_physical_exam.extremities_exam}
                      />{" "}
                    </div>
                  </div>

                  <div className="mt-2">
  <div className="font-semibold">
    PELVIC EXAMINATION (For IUD Acceptors):
  </div>
  <div className="grid grid-cols-2 gap-1">
    <div className="flex items-center gap-1">
      <span>Pelvic Examination:</span>
      <InputLine
        className="flex-1 h-4"
        value={recordData.fp_pelvic_exam?.pelvicExamination ?? "N/A"}
      />
    </div>
    <div className="flex items-center gap-1">
      <span>Cervical Consistency:</span>
      <InputLine
        className="flex-1 h-4"
        value={recordData.fp_pelvic_exam?.cervicalConsistency ?? "N/A"}
      />
    </div>
    <div className="flex items-center gap-1">
      <span>Cervical Tenderness:</span>
      <div className="flex gap-1">
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={recordData.fp_pelvic_exam?.cervicalTenderness === true}
            disabled
            className="h-3 w-3"
          />
          <span>Yes</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={recordData.fp_pelvic_exam?.cervicalTenderness === false}
            disabled
            className="h-3 w-3"
          />
          <span>No</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-1">
      <span>Adnexal mass/tenderness:</span>
      <div className="flex gap-1">
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={recordData.fp_pelvic_exam?.cervicalAdnexal === true}
            disabled
            className="h-3 w-3"
          />
          <span>Yes</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={recordData.fp_pelvic_exam?.cervicalAdnexal === false}
            disabled
            className="h-3 w-3"
          />
          <span>No</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-1">
      <span>Uterine Position:</span>
      <InputLine
        className="flex-1 h-4"
        value={recordData.fp_pelvic_exam?.uterinePosition ?? "N/A"}
      />
    </div>
    <div className="flex items-center gap-1">
      <span>Uterine depth:</span>
      <InputLine
        className="flex-1 h-4"
        value={recordData.fp_pelvic_exam?.uterineDepth ?? "N/A"}
      />
      <span>cm</span>
    </div>
  </div>
</div>
                </div>
              </div>

              <div className="border-t border-black p-1">
                <Label className=" text-xs block mb-1">ACKNOWLEDGEMENT:</Label>
                <div className="text-xs">
                  <p className="mb-1">
                    This is to certify that the Physician/Nurse/Midwife of the
                    clinic has fully explained to me the different methods
                    available in family planning and I freely choose the{" "}
                    <span className="font-semibold underline">
                      {recordData.acknowledgement?.selectedMethod || "_______"}
                    </span>{" "}
                    method.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-1">
                    <div>
                      <SignatureDisplay
                        signatureData={recordData.acknowledgement?.clientSignature}
                      />
                      <div>Client Signature</div>
                    </div>
                    <div>
                      <div>Date</div>
                      <InputLine
                        className="h-4"
                        value={recordData.acknowledgement?.clientSignatureDate}
                      />
                    </div>
                  </div>

                  <p className="mb-1">
                    For WRA below 18 yrs. old:
                    <br />
                    I hereby consent{" "}
                    <span className="font-semibold underline">
                      {recordData.acknowledgement?.clientName || "_______"}
                    </span>{" "}
                    to accept the Family Planning method
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div>Parent/Guardian Signature</div>
                      <SignatureDisplay
                        signatureData={recordData.acknowledgement?.guardianSignature}
                      />
                    </div>
                    <div>
                      <div>Date</div>
                      <InputLine
                        className="h-4"
                        value={recordData.acknowledgement?.guardianSignatureDate}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-black p-1 text-xs">
                <div className="justify-text italic gap-4">
                  <div className="text-xs space-y-0.5">
                    <small>
                      Implant = Progestin subdermal implant; IUD = Intrauterine
                      device; BTL = Bilateral tubal ligation; <br></br>NSV =
                      No-scalpel vasectomy; COC = Combined Oral Contraceptive; POP
                      = Progestin only pills
                      <br></br>LAM = Lactational amenorrhea method; SDM = Standard
                      days method; BBT = Basal body temperature; BOM = Billings
                      ovulation method; CMM = Cervical mucus method; STM =
                      Symptothermal method
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 no-print">
        <Button
          onClick={() =>
            navigate("/services/familyplanning/view2", { state: { fprecordId: fprecordId } })
          }
        >
          Next (Side B)
        </Button>
      </div>
    </div>
  );
};