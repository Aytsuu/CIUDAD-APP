import React from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFPCompleteRecord } from "@/pages/familyplanning/request-db/GetRequest"; // Adjust path if needed
import type { FormData } from "@/form-schema/FamilyPlanningSchema"; // Import your FormData type
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputLineProps {
  className?: string;
  value: string | number | boolean | undefined;
}

const InputLine: React.FC<InputLineProps> = ({ className, value }) => (
  <Input
    className={cn("border-0 border-b border-black rounded-none w-full px-2 py-1 h-6", className)}
    readOnly
    value={value !== undefined && value !== null ? String(value) : ""}
  />
);

const YesNoRadioView = ({ name, value, checkedValue }: { name: string; value: string; checkedValue: string | undefined }) => (
  <div className="flex items-center space-x-1">
    <input
      type="radio"
      id={`${name}-${value}`}
      name={name}
      value={value}
      checked={checkedValue === value}
      readOnly
      className="h-4 w-4"
    />
    <Label htmlFor={`${name}-${value}`} className="text-sm">
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </Label>
  </div>
);

const YesNoCheckboxView = ({ label, checked }: { label: string; checked: boolean | undefined }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked === true}
      disabled
      className="h-4 w-4"
    />
    <Label className="text-sm">{label}</Label>
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

export default function FamilyPlanningView2() {
  const navigate = useNavigate();
  const { fprecordId } = useParams<{ fprecordId: string }>();

  const { data: recordData, isLoading, isError, error } = useQuery<FormData, Error>({
    queryKey: ['fpCompleteRecordView', fprecordId], // Use the same query key if data is shared
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading record details...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Error loading record: {error?.message}</div>;
  }

  if (!recordData) {
    return <div className="text-center py-8">No record found for ID: {fprecordId}</div>;
  }

  const SignatureDisplay = ({ signatureData }: { signatureData: string | undefined }) => {
  if (!signatureData) return <InputLine value="" />;
  
  return (
    <div className="flex items-center">
      <img 
        src={signatureData} 
        alt="Signature"
        className="h-14 border-b border-black" // Match the height and border of InputLine
      />
    </div>
  );
};

  return (
    <div className="container bg-white mx-auto p-4 max-w-7xl">
      <Button
        className="text-black p-2 self-start"
        variant={"outline"}
        onClick={() => navigate(`/familyplanning/view/${fprecordId}`)} // Navigate back to ViewPage1
      >
        <ChevronLeft />
      </Button>

      {/* Form Title */}
      <div className="mb-6">
        <div className="text-right text-sm text-gray-600 mb-2">SIDE B</div>
        <div className="text-right text-sm text-gray-600">FP FORM 1</div>
        <h1 className="text-center text-xl font-semibold mb-6">FAMILY PLANNING CLIENT ASSESSMENT RECORD</h1>
      </div>

      {/* Main Table */}
      

      {/* Physical Examination */}
      <div className="border border-black p-3 mb-6">
        <h2 className="font-bold text-lg mb-2">PHYSICAL EXAMINATION:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="font-bold">Weight (kg):</Label>
            <InputLine value={recordData.weight} />
          </div>
          <div>
            <Label className="font-bold">Height (cm):</Label>
            <InputLine value={recordData.height} />
          </div>
          <div>
            <Label className="font-bold">Blood Pressure (mmHg):</Label>
            <InputLine value={recordData.bloodPressure} />
          </div>
          <div>
            <Label className="font-bold">Pulse Rate (bpm):</Label>
            <InputLine value={recordData.pulseRate} />
          </div>
        </div>
        <div className="mt-4">
          <Label className="font-bold block mb-2">General Physical Examination:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
            {[
              { label: "Skin:", value: recordData.skinExamination },
              { label: "Conjunctiva:", value: recordData.conjunctivaExamination },
              { label: "Neck:", value: recordData.neckExamination },
              { label: "Breast:", value: recordData.breastExamination },
              { label: "Abdomen:", value: recordData.abdomenExamination },
              { label: "Extremities:", value: recordData.extremitiesExamination },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Label className="text-sm font-bold">{item.label}</Label>
                <InputLine className="flex-1" value={item.value} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pelvic Examination */}
      <div className="border border-black p-3 mb-6">
        <h2 className="font-bold text-lg mb-2">PELVIC EXAMINATION:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="font-bold">Pelvic Examination:</Label>
            <InputLine value={recordData.pelvicExamination} />
          </div>
          <div>
            <Label className="font-bold">Cervical Consistency:</Label>
            <InputLine value={recordData.cervicalConsistency} />
          </div>
          <div className="flex items-center gap-4">
            <Label className="font-bold">Cervical Tenderness:</Label>
            <YesNoCheckboxView label="Yes" checked={recordData.fp_pelvic_exam?.cervicalTenderness === true} />
            <YesNoCheckboxView label="No" checked={recordData.fp_pelvic_exam?.cervicalTenderness === false} />
          </div>
          <div className="flex items-center gap-4">
            <Label className="font-bold">Cervical Adnexal Mass Tenderness:</Label>
            <YesNoCheckboxView label="Yes" checked={recordData.fp_pelvic_exam?.cervicalAdnexal === true} />
            <YesNoCheckboxView label="No" checked={recordData.fp_pelvic_exam?.cervicalAdnexal === false} />
          </div>
          <div>
            <Label className="font-bold">Uterine Position:</Label>
            <InputLine value={recordData.uterinePosition} />
          </div>
          <div>
            <Label className="font-bold">Uterine Depth (cm):</Label>
            <InputLine value={recordData.uterineDepth} />
          </div>
        </div>
      </div>

      {/* Acknowledgement */}
     <div className="border border-black p-4 mb-6">
  <h2 className="font-bold text-lg mb-3">ACKNOWLEDGEMENT:</h2>
  <p className="mb-4 text-md">
    This is to certify that the Physician/Nurse/Midwife of the clinic has fully
    explained to me the different methods available in family planning and I
    freely choose the <span className="font-semibold underline">{recordData.acknowledgement?.selectedMethod}</span> method. 
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div>
      <Label className="font-bold">Client Signature:</Label>
      <SignatureDisplay signatureData={recordData.acknowledgement?.clientSignature} />
    </div>
    <div>
      <Label className="font-bold">Date:</Label>
      <span className="font-semibold underline"> <br/>
      {recordData.acknowledgement?.clientSignatureDate}</span>
     
    </div>
  </div>

  <p className="mb-4 text-md">
  For WRA below 18 yrs. old:<br />
  I hereby consent <span className="font-semibold underline">{recordData.acknowledgement?.clientName}</span> to accept the Family Planning method
</p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label className="font-bold">Parent/Guardian Signature:</Label>
      <SignatureDisplay signatureData={recordData.acknowledgement?.guardianSignature} />
    </div>
    <div>
      <Label className="font-bold">Date:</Label>
      <span className="font-semibold underline"> <br/>
      {recordData.acknowledgement?.guardianSignatureDate}</span>
    </div>
  </div>
</div>


      {/* Service Provision Records - You might need to iterate over an array here */}
      {/* Service Provision Records - Updated to match the image */}
<div className="border border-black p-3 mb-6">
  <h2 className="font-bold text-lg mb-2">SERVICE PROVISION RECORDS:</h2>
  {recordData.serviceProvisionRecords && recordData.serviceProvisionRecords.length > 0 ? (
    recordData.serviceProvisionRecords.map((service, index) => (
      <div key={index} className="mb-6 border-b pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="font-bold">Date of Visit:</Label>
            <InputLine value={service.dateOfVisit} />
          </div>
          <div>
          <Label className="font-bold">Date of Follow Up:</Label>
          <InputLine value={service.dateOfFollowUp || ""} />
        </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="font-bold">Weight (kg):</Label>
            <InputLine value={recordData.weight} />
          </div>
          <div>
            <Label className="font-bold">Blood Pressure (mmHg):</Label>
            <InputLine value={recordData.bloodPressure} />
          </div>
        </div>

        <div className="mb-4">
          <Label className="font-bold">Findings:</Label>
          <InputLine value={service.medicalFindings} />
        </div>

        <div className="mb-4">
          <Label className="font-bold">Method Accepted:</Label>
          <InputLine value={recordData.acknowledgement?.selectedMethod || recordData.methodCurrentlyUsed} />
        </div>

        <div className="mb-4">
          <Label className="font-bold">Quantity:</Label>
          <InputLine value={recordData.fp_assessment?.quantity} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="font-bold">Signature of Service Provider:</Label>
            {service.serviceProviderSignature ? (
              <img 
                src={service.serviceProviderSignature} 
                alt="Provider Signature" 
                className="h-20 mb-5border-b border-black"
              />
              
            ) 
            : (
              <InputLine value="" />
            )}
           
          </div>
          <div>
            <Label className="font-bold">Name of Service Provider:</Label>
            <InputLine value= {service.nameOfServiceProvider}/>
           
          </div>
        </div>

       
      </div>
    ))
  ) : (
    <p>No service provision records found.</p>
  )}
</div>
      
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left w-2/3">How to be Reasonably Sure a Client is Not Pregnant</th>
              <th className="border border-black p-2 text-center w-1/6">Yes</th>
              <th className="border border-black p-2 text-center w-1/6">No</th>
            </tr>
          </thead>
          <tbody>
            {pregnancyQuestions.map((q, index) => (
              <tr key={index}>
                <td className="border border-black p-2">{q.text}</td>
                <td className="border border-black p-2 text-center">
                  <input
                    type="radio"
                    checked={recordData.pregnancyCheck?.[q.key as keyof typeof recordData.pregnancyCheck] === true}
                    disabled
                  />
                </td>
                <td className="border border-black p-2 text-center">
                  <input
                    type="radio"
                    checked={recordData.pregnancyCheck?.[q.key as keyof typeof recordData.pregnancyCheck] === false}
                    disabled
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 rounded-md text-xs bg-gray-50">
              <div className="font-medium mb-2">
                ■ If the client answered YES to at least one of the questions and she is free of signs or symptoms of
                pregnancy, provide client with desired method.
              </div>
              <div className="font-medium mb-2">
                ■ If the client answered NO to all of the questions, pregnancy cannot be ruled out. The client should
                await menses or use a pregnancy test.
              </div>
            </div>
      </div>
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/familyplanning/view/${fprecordId}`)} // Back to ViewPage1
        >
          Previous
        </Button>
        <Button onClick={() => navigate("/FamPlanning_table")}>
          Back to Overall Records
        </Button>
      </div>
    </div>
  );
}