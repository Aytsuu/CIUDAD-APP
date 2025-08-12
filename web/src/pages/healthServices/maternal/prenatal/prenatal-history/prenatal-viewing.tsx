import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { usePrenatalRecordComplete } from "../../queries/maternalFetchQueries"

interface PrenatalViewingOneProps {
  pfId?: string;
}

// Keep your existing InputLine component
export const InputLine = ({className, value}: {className: string, value?: string}) => (
  <Input 
    className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none", className)} 
    value={value || ""} 
    readOnly
  />
)

export default function PrenatalViewingOne({ pfId }: PrenatalViewingOneProps) {
  const { 
    data: prenatalFormData, 
    isLoading, 
    error 
  } = usePrenatalRecordComplete(pfId || "");

  const prenatalForm = prenatalFormData?.prenatal_form;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !prenatalForm) {
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load prenatal form data. Please try again.
      </div>
    );
  }

  // Extract data from the API response
  const personalInfo = prenatalForm.patient_details?.personal_info;
  const address = prenatalForm.patient_details?.address;
  const family = prenatalForm.patient_details?.family;
  const bodyMeasurement = prenatalForm.body_measurement_details;
  const vitalSigns = prenatalForm.vital_signs_details;
  const obstetricHistory = prenatalForm.obstetric_history_details;
  const medicalHistory = prenatalForm.medical_histories || [];
  const previousHospitalizations = prenatalForm.previous_hospitalizations || [];
  const previousPregnancies = prenatalForm.previous_pregnancies || [];
  const labResults = prenatalForm.laboratory_results || [];
  const riskCodes = prenatalForm.obstetric_risk_codes;
  const birthPlan = prenatalForm.birth_plan_details;
  const prenatalCare = prenatalForm.prenatal_care_entries || [];
  const ancVisit = prenatalForm.anc_visit_guide;

  return (
    <div className="max-w-7xl mx-auto m-5 p-5 border border-gray-300">
      {/* Header */}
      <div>
        <p className="text-sm pb-5 mt-10">CEBU CITY HEALTH DEPARTMENT <br /> 2020</p>
        <h4 className="text-center text-lg pb-5"><b>MATERNAL HEALTH RECORD</b></h4>
      </div>

      {/* Personal Information */}
      <div className="flex flex-col">
        <div className="flex pb-2">
          <Label className="mt-4">FAMILY NO:</Label>
          <InputLine className="w-1/6" value={family?.fam_id || ""} />
          <Label className="mt-4">NAME:</Label>
          <InputLine 
            className="w-1/2" 
            value={`${personalInfo?.per_lname || ""}, ${personalInfo?.per_fname || ""} ${personalInfo?.per_mname || ""}`.trim()} 
          />
          <Label className="mt-4">AGE:</Label>
          <InputLine 
            className="w-[90px]" 
            value={personalInfo?.per_dob ? 
              Math.floor((new Date().getTime() - new Date(personalInfo.per_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString() 
              : ""} 
          />
        </div>

        <div className="flex pb-2">
          <Label className="mt-4">DATE OF BIRTH:</Label>
          <InputLine className="w-[100px]" value={personalInfo?.per_dob || ""} />
          <Label className="mt-4">HUSBAND'S NAME:</Label>
          <InputLine 
            className="w-1/3" 
            value={`${prenatalForm.spouse_details?.spouse_fname || ""} ${prenatalForm.spouse_details?.spouse_lname || ""}`.trim()} 
          />
          <Label className="mt-4">OCCUPATION:</Label>
          <InputLine className="w-1/4" value={prenatalForm.spouse_details?.spouse_occupation || ""} />
        </div>

        <div className="flex pb-2">
          <Label className="mt-4">ADDRESS:</Label>
          <InputLine 
            className="w-1/2" 
            value={`${address?.add_street || ""} ${address?.add_sitio || ""} ${address?.add_brgy || ""} ${address?.add_city || ""} ${address?.add_province || ""}`.trim()} 
          />
          <Label className="mt-4">WT:</Label>
          <InputLine className="w-[90px]" value={bodyMeasurement?.weight || ""} />
          <Label className="mt-4">HT:</Label>
          <InputLine className="w-[90px]" value={bodyMeasurement?.height || ""} />
          <Label className="mt-4">BMI:</Label>
          <InputLine className="w-[90px]" value={bodyMeasurement?.bmi || ""} />
          <Label className="mt-4">{bodyMeasurement?.bmi_category || ""}</Label>
        </div>
      </div>

      {/* Obstetric History */}
      <div className="flex justify-between pr-[10rem]">
        <div className="flex flex-col">
          <h6 className="text-sm mt-3 underline"><b>OBSTETRIC HISTORY</b></h6>
          <div className="flex">
            <Label className="mt-4">NO. OF CHILDREN BORN ALIVE:</Label>
            <InputLine className="w-20" value={obstetricHistory?.obs_ch_born_alive?.toString() || ""} />
          </div>
          <div className="flex">
            <Label className="mt-4">NO. OF LIVING CHILDREN:</Label>
            <InputLine className="w-20" value={obstetricHistory?.obs_living_ch?.toString() || ""} />
          </div>
          <div className="flex">
            <Label className="mt-4">NO. OF ABORTION:</Label>
            <InputLine className="w-20" value={obstetricHistory?.obs_abortion?.toString() || ""} />
          </div>
          <div className="flex">
            <Label className="mt-4">NO. OF STILL BIRTHS/FETAL DEATH:</Label>
            <InputLine className="w-20" value={obstetricHistory?.obs_still_birth?.toString() || ""} />
          </div>
          <div className="flex">
            <Label className="mt-4">HISTORY OF LARGE BABIES (8LBS):</Label>
            <InputLine className="w-20" value={obstetricHistory?.obs_lg_babies?.toString() || ""} />
          </div>
          <div className="flex">
            <Label className="mt-4">HISTORY OF DIABETES:</Label>
            <InputLine className="w-20" value="" />
          </div>
        </div>

        {/* Medical History */}
        <div className="flex">
          <div className="flex flex-col">
            <h6 className="text-sm mt-3 underline"><b>MEDICAL HISTORY</b></h6>
            {medicalHistory.map((history: any, index: number) => (
              <div key={index} className="flex">
                <Label className="mt-4">PREVIOUS ILLNESS:</Label>
                <InputLine className="w-[350px]" value={history.illness_name || ""} />
              </div>
            ))}
            {previousHospitalizations.map((hosp: any, index: number) => (
              <div key={index} className="flex">
                <Label className="mt-4">PREVIOUS HOSPITALIZATION:</Label>
                <InputLine className="w-[350px]" value={`${hosp.pfph_prev_hospi || ""} (${hosp.pfph_prev_hospi_year || ""})`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Present Pregnancy */}
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h6 className="text-sm mt-4 underline"><b>PRESENT PREGNANCY</b></h6>
          <div className="flex">
            <Label className="mt-4">GRAVIDA:</Label>
            <InputLine className="w-14" value={obstetricHistory?.obs_gravida?.toString() || ""} />
            <Label className="mt-4">PARA:</Label>
            <InputLine className="w-14" value={obstetricHistory?.obs_para?.toString() || ""} />
            <Label className="mt-4">FULLTERM:</Label>
            <InputLine className="w-14" value={obstetricHistory?.obs_fullterm?.toString() || ""} />
            <Label className="mt-4">PRETERM:</Label>
            <InputLine className="w-14" value={obstetricHistory?.obs_preterm?.toString() || ""} />
          </div>
          <div className="flex">
            <Label className="mt-4">LMP:</Label>
            <InputLine className="w-[208px]" value={prenatalForm.pf_lmp || ""} />
            <Label className="mt-4">EDC:</Label>
            <InputLine className="w-[208px]" value={prenatalForm.pf_edc || ""} />
          </div>
        </div>

        {/* Guide for 4ANC Visits */}
        <div className="flex flex-col">
          <h6 className="text-sm mt-4"><b>Guide for 4ANC Visits: (date)</b></h6>
          {ancVisit && (
            <div className="flex flex-col">
              <div className="flex">
                <Label className="mt-4">1st tri:</Label>
                <InputLine className="w-[150px]" value={ancVisit.pfav_1st_tri || ""} />
              </div>
              <div className="flex">
                <Label className="mt-4">2nd tri:</Label>
                <InputLine className="w-[150px]" value={ancVisit.pfav_2nd_tri || ""} />
              </div>
              <div className="flex">
                <Label className="mt-4">3rd tri (1):</Label>
                <InputLine className="w-[150px]" value={ancVisit.pfav_3rd_tri_one || ""} />
              </div>
              <div className="flex">
                <Label className="mt-4">3rd tri (2):</Label>
                <InputLine className="w-[150px]" value={ancVisit.pfav_3rd_tri_two || ""} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Laboratory Results */}
      {labResults.length > 0 && (
        <div className="flex flex-col">
          <h6 className="text-sm mt-4 underline"><b>LABORATORY RESULTS: (DATE AND RESULT)</b></h6>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {labResults.map((lab: any, index: number) => (
              <div key={index} className="flex">
                <Label className="mt-4">{lab.lab_type}:</Label>
                <InputLine 
                  className="w-20" 
                  value={lab.result_date || "To be followed"} 
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Codes */}
      {riskCodes && (
        <div className="flex flex-col">
          <h6 className="text-sm mt-4 underline"><b>RISK CODES:</b></h6>
          <div className="flex justify-between">
            <p className="text-sm mt-4">( ) HAS ONE OR MORE OF THE FF:</p>
            <p className="text-sm mt-4 mr-[20rem]">( ) Having one or more 1 conditions:</p>
          </div>
          
          <div className="flex flex-row">
            <div className="flex flex-col">
              <div className="flex">
                <Checkbox 
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_previous_caesarian || false} 
                  disabled
                />
                <Label className="mr-[8rem] mt-4">PREVIOUS CAESARIAN</Label>
              </div>
              <div className="flex">
                <Checkbox 
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_3_consecutive_miscarriages || false} 
                  disabled
                />
                <Label className="mr-[8rem] mt-4">3 consecutive miscarriages</Label>
              </div>
              <div className="flex">
                <Checkbox 
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_postpartum_hemorrhage || false} 
                  disabled
                />
                <Label className="mr-[8rem] mt-4">Postpartum hemorrhage</Label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Birth Plan */}
      {birthPlan && (
        <div className="flex mt-5">
          <Label className="mt-4">PLAN FOR PLACE OF DELIVERY:</Label>
          <InputLine className="w-[300px]" value={birthPlan.place_of_delivery_plan || ""} />
          <Label className="mt-4">PLAN FOR NEWBORN SCREENING:</Label>
          <div className="flex">
            <Checkbox 
              className="mt-4 mr-2 ml-4" 
              checked={birthPlan.newborn_screening_plan || false} 
              disabled
            />
            <p className="mt-3">YES</p>
            <Checkbox className="mt-4 mr-2 ml-4" checked={!birthPlan.newborn_screening_plan} disabled />
            <p className="mt-3">NO</p>
          </div>
        </div>
      )}

      {/* Assessed By */}
      <div className="flex flex-col mb-10">
        <Label className="mt-4">ASSESSED BY:</Label>
        <InputLine 
          className="w-1/6" 
          value={`${prenatalForm.staff_details?.staff_fname || ""} ${prenatalForm.staff_details?.staff_lname || ""}`.trim()} 
        />
      </div>
    </div>
  );
}