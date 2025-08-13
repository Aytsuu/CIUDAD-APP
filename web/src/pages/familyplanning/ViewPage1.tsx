
import type React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useNavigate, useLocation } from "react-router-dom" // Use react-router-dom for Link and useParams
import { useQuery } from "@tanstack/react-query"
import { getFPCompleteRecord } from "@/pages/familyplanning/request-db/GetRequest" // Adjust path if needed
import type { FormData } from "@/form-schema/FamilyPlanningSchema" // Import your FormData type
import { ChevronLeft } from "lucide-react"

interface InputLineProps {
  className?: string
  value: string | number | boolean | undefined // Allow for different types
}

const InputLine: React.FC<InputLineProps> = ({ className, value }) => (
  <Input
    className={cn("border-0 border-b border-black rounded-none w-full px-2 py-1 h-6", className)}
    readOnly
    value={value !== undefined && value !== null ? String(value) : ""} // Ensure value is string
  />
)

const YesNoCheckbox = ({ label, checked }: { label: string; checked: boolean | undefined }) => (
  <div className="flex items-center gap-2 ">
    <Checkbox checked={checked === true} disabled />
    <Label className="text-sm font-semibold">{label}</Label>
  </div>
)

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

// Utility function to map income ID to name
const getIncomeName = (incomeId) => {
  const option = INCOME_OPTIONS.find((opt) => opt.id === incomeId);
  return option ? option.name : incomeId || 'N/A'; // Fallback to ID or 'N/A' if not found
};

const FamilyPlanningView: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { fprecordId } = location.state || {} 
 
  const {
    data: recordData,
    isLoading,
    isError,
    error,
  } = useQuery<FormData, Error>({
    queryKey: ["fpCompleteRecordView", fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId,
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading record details...</div>
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Error loading record: {error?.message}</div>
  }

  if (!recordData) {
    return <div className="text-center py-8">No record found for ID: {fprecordId}</div>
  }

  // Helper to safely access nested properties
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj)
  }

  return (
    <div className="mx-auto p-4 bg-white">
      <Button
        className="text-black p-2 self-start mg-5 bg-transparent"
        variant="outline"
        onClick={() => navigate(-1)}
        type="button"
      >
        <ChevronLeft />
      </Button>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold">SIDE A</div>
        <div className="text-center font-bold text-base md:text-lg">FAMILY PLANNING (FP) FORM 1</div>
        <div className="text-sm font-bold">ver 3.0</div>
      </div>

      <div className="border p-4">
        {/* Top Section */}
        <div>
          <div className="flex bg-gray">
            <div className="md:col-span-2 bg-gray p-2 border border-black">
              <Label className="font-bold block mb-2">FAMILY PLANNING CLIENT ASSESSMENT RECORD</Label>
              <p className="text-sm">
                Instructions for Physicians, Nurses, and Midwives:{" "}
                <strong>Make sure that the client is not pregnant by using the question listed in SIDE B.</strong>{" "}
                Completely fill out or check the required information. Refer accordingly for any abnormal
                history/findings for further medical evaluation.
              </p>
            </div>
            {/* Right Section */}
            <div className="border border-black flex-grow pl-3 pt-1 pr-3">
              <div className="flex items-center mb-2 w-full">
                <Label className="text-sm font-bold whitespace-nowrap mr-2">CLIENT ID.:</Label>
                <div className="w-full">
                  <InputLine className="w-full box-border" value={recordData.client_id} />
                </div>
              </div>
              <div className="flex items-center mb-2 w-full">
                <Label className="text-sm font-bold whitespace-nowrap mr-2">PHILHEALTH NO.:</Label>
                <div className="w-full">
                  <InputLine className="w-full box-border" value={recordData.philhealthNo} />
                </div>
              </div>
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-bold whitespace-nowrap">NHTS?</Label>
                  <div className="flex items-center gap-4">
                    <YesNoCheckbox label="Yes" checked={recordData.nhts_status === true} />
                    <YesNoCheckbox label="No" checked={recordData.nhts_status === false} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-bold whitespace-nowrap">Pantawid Pamilya Pilipino (4Ps):</Label>
                  <div className="flex items-center gap-4">
                    <YesNoCheckbox label="Yes" checked={recordData.fourps === true} />
                    <YesNoCheckbox label="No" checked={recordData.fourps === false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2"></div>
        </div>

        {/* Client Details Section */}
        <div className="w-full border border-black p-3">
          <div className="w-full">
            <Label className="font-bold whitespace-nowrap">NAME OF CLIENT:</Label>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
              <div className="flex-1">
                <InputLine value={recordData.lastName} />
                <Label className="text-xs">Last Name</Label>
              </div>
              <div className="flex-1">
                <InputLine value={recordData.givenName} />
                <Label className="text-xs">Given Name</Label>
              </div>
              <div className="w-20">
                <InputLine value={recordData.middleInitial} />
                <Label className="text-xs">M.I.</Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-4">
            <div className="flex-1">
              <Label className="font-bold">Date of Birth:</Label>
              <InputLine value={recordData.dateOfBirth} />
            </div>
            <div className="w-20">
              <Label className="font-bold">Age:</Label>
              <InputLine value={recordData.age} />
            </div>
            <div className="flex-1">
              <Label className="font-bold">Educational Attainment:</Label>
              <InputLine value={recordData.educationalAttainment} />
            </div>
            <div className="flex-1">
              <Label className="font-bold">Occupation:</Label>
              <InputLine value={recordData.occupation} />
            </div>
          </div>

          <div className="mt-4">
            <Label className="font-bold">Address:</Label>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
              <div className="flex-1">
                <InputLine value={recordData.address?.houseNumber} />
                <Label className="text-xs">House No./Street</Label>
              </div>
              <div className="flex-1">
                <InputLine value={recordData.address?.barangay} />
                <Label className="text-xs">Barangay</Label>
              </div>
              <div className="flex-1">
                <InputLine value={recordData.address?.municipality} />
                <Label className="text-xs">City/Municipality</Label>
              </div>
              <div className="flex-1">
                <InputLine value={recordData.address?.province} />
                <Label className="text-xs">Province</Label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Label className="font-bold">NAME OF SPOUSE (if applicable):</Label>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
              <div className="flex-1">
                <InputLine value={recordData.spouse?.s_lastName} />
                <Label className="text-xs">Last Name</Label>
              </div>
              <div className="flex-1">
                <InputLine value={recordData.spouse?.s_givenName} />
                <Label className="text-xs">Given Name</Label>
              </div>
              <div className="w-20">
                <InputLine value={recordData.spouse?.s_middleInitial} />
                <Label className="text-xs">M.I.</Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-4">
            <div className="flex-1">
              <Label className="font-bold">Date of Birth:</Label>
              <InputLine value={recordData.spouse?.s_dateOfBirth} />
            </div>
            <div className="w-20">
              <Label className="font-bold">Age:</Label>
              <InputLine value={recordData.spouse?.s_age} />
            </div>
            <div className="flex-1">
              <Label className="font-bold">Occupation:</Label>
              <InputLine value={recordData.spouse?.s_occupation} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Label className="font-bold">No. of Living Children:</Label>
              <InputLine value={recordData.obstetricalHistory?.numOfLivingChildren} />
            </div>
            <div className="flex-1">
              <Label className="font-bold">Plan to have more children?</Label>
              <div className="flex items-center gap-4 mt-2">
                <YesNoCheckbox label="Yes" checked={recordData.plan_more_children === true} />
                <YesNoCheckbox label="No" checked={recordData.plan_more_children === false} />
              </div>
            </div>
            <div className="flex-1">
              <Label className="font-bold">Average Monthly Income:</Label>
              <InputLine value={getIncomeName(recordData.avg_monthly_income)} />
            </div>
          </div>

          {/* Client Type, Reason for FP, Method Currently Used */}
          <div className="mt-4">
            <Label className="font-bold">Type of Client:</Label>
            <InputLine value={recordData.typeOfClient} />
            {recordData.typeOfClient === "Current User" && (
              <>
                <Label className="font-bold mt-2">Sub Type of Client:</Label>
                <InputLine value={recordData.subTypeOfClient} />
              </>
            )}

            <Label className="font-bold mt-4">Reason for FP:</Label>
            <InputLine value={recordData.reasonForFP} />
            {(recordData.reasonForFP === "fp_others" || recordData.reasonForFP === "sideeffects") && (
              <>
                <Label className="font-bold mt-2">
                  {recordData.reasonForFP === "fp_others" ? "Other Reason for FP:" : "Side Effects Detail:"}
                </Label>
                <InputLine value={recordData.otherReasonForFP} />
              </>
            )}
            <Label className="font-bold mt-4">Method Currently Used:</Label>
            <InputLine value={recordData.methodCurrentlyUsed} />
            {recordData.methodCurrentlyUsed === "Others" && (
              <>
                <Label className="font-bold mt-2">Other Method:</Label>
                <InputLine value={recordData.otherMethod} />
              </>
            )}
          </div>
        </div>

        {/* Medical History */}
        <div className="w-full border border-black p-3 mt-4">
          <Label className="font-bold block mb-2">MEDICAL HISTORY:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
          {(
            [
              { label: "severe headaches / migraine", key: "severeHeadaches" },
              { label: "history of stroke / heart attack / hypertension", key: "strokeHeartAttackHypertension" },
              { label: "non-traumatic hematoma / frequent bruising or gum bleeding", key: "hematomaBruisingBleeding" },
              { label: "current or history of breast cancer / breast mass", key: "breastCancerHistory" },
              { label: "severe chest pain", key: "severeChestPain" },
              { label: "cough for more than 14 days", key: "cough" },
              { label: "jaundice", key: "jaundice" },
              { label: "unexplained vaginal bleeding", key: "unexplainedVaginalBleeding" },
              { label: "abnormal vaginal discharge", key: "abnormalVaginalDischarge" },
              { label: "intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)", key: "phenobarbitalOrRifampicin" },
              { label: "Is this client a SMOKER?", key: "smoker" },
              { label: "With Disability/Others?", key: "disability" },
            ] as const
          ).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <Label className="text-sm">{item.label}</Label>
              {/* NEW: Wrap Yes/No checkboxes in a flex container */}
              <div className="flex items-center gap-4">
                <YesNoCheckbox
                  label="Yes"
                  checked={recordData.medicalHistory?.[item.key as keyof typeof recordData.medicalHistory] === true}
                />
                <YesNoCheckbox
                  label="No"
                  checked={recordData.medicalHistory?.[item.key as keyof typeof recordData.medicalHistory] === false}
                />
              </div>
            </div>
          ))}
          {recordData.medicalHistory?.disability && (
            <div className="md:col-span-2">
              <Label className="text-sm">Specify Disability:</Label>
              <InputLine value={recordData.medicalHistory.disabilityDetails} />
            </div>
          )}
        </div>

          {/* Debug: Show selected illness records */}
          {/* {recordData.medical_history_records && recordData.medical_history_records.length > 0 && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <Label className="text-sm font-bold">Selected Medical Conditions:</Label>
              <div className="text-xs mt-1">
                {recordData.medical_history_records.map((record: any, index: number) => (
                  <span key={index} className="inline-block bg-blue-100 px-2 py-1 rounded mr-2 mb-1">
                    {record.illname}
                  </span>
                ))}
              </div>
            </div>
          )} */}
        </div>

        {/* Obstetrical History */}
        <div className="w-full border border-black p-3 mt-4">
          <Label className="font-bold block mb-2">OBSTETRICAL HISTORY:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">G (Gravida):</Label>
              <InputLine className="w-20" value={recordData.obstetricalHistory?.g_pregnancies} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">P (Para):</Label>
              <InputLine className="w-20" value={recordData.obstetricalHistory?.p_pregnancies} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Full Term:</Label>
              <InputLine className="w-20" value={recordData.obstetricalHistory?.fullTerm} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Premature:</Label>
              <InputLine className="w-20" value={recordData.obstetricalHistory?.premature} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Abortion:</Label>
              <InputLine className="w-20" value={recordData.obstetricalHistory?.abortion} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Living Children:</Label>
              <InputLine className="w-20" value={recordData.obstetricalHistory?.numOfLivingChildren} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
            <div>
              <Label className="text-sm">Last Delivery Date:</Label>
              <InputLine value={recordData.obstetricalHistory?.lastDeliveryDate} />
            </div>
            <div>
              <Label className="text-sm">Type of Last Delivery:</Label>
              <InputLine value={recordData.obstetricalHistory?.typeOfLastDelivery} />
            </div>
            <div>
              <Label className="text-sm">Last Menstrual Period:</Label>
              <InputLine value={recordData.obstetricalHistory?.lastMenstrualPeriod} />
            </div>
            <div>
              <Label className="text-sm">Previous Menstrual Period:</Label>
              <InputLine value={recordData.obstetricalHistory?.previousMenstrualPeriod} />
            </div>
            <div>
              <Label className="text-sm">Menstrual Flow:</Label>
              <InputLine value={recordData.obstetricalHistory?.menstrualFlow} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Dysmenorrhea:</Label>
              <YesNoCheckbox label="Yes" checked={recordData.obstetricalHistory?.dysmenorrhea === true} />
              <YesNoCheckbox label="No" checked={recordData.obstetricalHistory?.dysmenorrhea === false} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Hydatidiform Mole (within the last 12 months):</Label>
              <YesNoCheckbox label="Yes" checked={recordData.obstetricalHistory?.hydatidiformMole === true} />
              <YesNoCheckbox label="No" checked={recordData.obstetricalHistory?.hydatidiformMole === false} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">History of Ectopic Pregnancy:</Label>
              <YesNoCheckbox label="Yes" checked={recordData.obstetricalHistory?.ectopicPregnancyHistory === true} />
              <YesNoCheckbox label="No" checked={recordData.obstetricalHistory?.ectopicPregnancyHistory === false} />
            </div>
          </div>
        </div>

        {/* Sexually Transmitted Infections */}
        <div className="w-full border border-black p-3 mt-4">
          <Label className="font-bold block mb-2">SEXUALLY TRANSMITTED INFECTIONS (STIs):</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
            {[
              { label: "Abnormal discharge", key: "abnormalDischarge" },
              { label: "Sores in genital area", key: "sores" },
              { label: "Pain in lower abdomen", key: "pain" },
              { label: "History of STI", key: "history" },
              { label: "HIV", key: "hiv" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <Label className="text-sm">{item.label}</Label>
                <YesNoCheckbox
                  label="Yes"
                  checked={getNestedValue(recordData, `sexuallyTransmittedInfections.${item.key}`) === true}
                />
                <YesNoCheckbox
                  label="No"
                  checked={getNestedValue(recordData, `sexuallyTransmittedInfections.${item.key}`) === false}
                />
              </div>
            ))}
            {recordData.sexuallyTransmittedInfections?.abnormalDischarge && (
              <div className="md:col-span-2">
                <Label className="text-sm">Abnormal Discharge From: </Label>
                <span className="font-semibold underline">
                  {recordData.sexuallyTransmittedInfections.dischargeFrom}{" "}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* VAW Risk Assessment */}
        <div className="w-full border border-black p-3 mt-4">
          <Label className="font-bold block mb-2">VAW RISK ASSESSMENT:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
            {[
              { label: "Unpleasant relationship with partner", key: "unpleasantRelationship" },
              { label: "Partner does not approve of the visit to FP clinic", key: "partnerDisapproval" },
              { label: "History of domestic violence or VAW", key: "domesticViolence" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <Label className="text-sm">{item.label}</Label>
                <YesNoCheckbox
                  label="Yes"
                  checked={getNestedValue(recordData, `violenceAgainstWomen.${item.key}`) === true}
                />
                <YesNoCheckbox
                  label="No"
                  checked={getNestedValue(recordData, `violenceAgainstWomen.${item.key}`) === false}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label className="text-sm">Referred To:</Label>
              <InputLine value={recordData.violenceAgainstWomen.referredTo || ""} />
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="flex justify-end mt-6">
           <Button onClick={() => navigate("/familyplanning/view2", { state: { fprecordId: fprecordId } })}>Next</Button> 
        </div>
      </div>
    </div>
  )
}

export default FamilyPlanningView
