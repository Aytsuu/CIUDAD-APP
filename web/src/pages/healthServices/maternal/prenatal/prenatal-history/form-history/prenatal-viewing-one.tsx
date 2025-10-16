"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { Loader2 } from "lucide-react"

import { usePrenatalRecordComplete } from "../../../queries/maternalFetchQueries"
import { capitalize } from "@/helpers/capitalize"


interface PrenatalViewingOneProps {
  pfId?: string;
}

export const InputLine = ({className, value}: {className: string, value?: string}) => (
  <Input 
    className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none", className)} 
    value={value || ""} 
    readOnly
  />
)

export const InputLineLonger = ({className, value}: {className: string, value?: string}) => (
  <textarea 
    className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none resize-none overflow-hidden bg-transparent", className)} 
    value={value || ""} 
    readOnly
    rows={1}
    style={{
      minHeight: '2.5rem',
      height: 'auto'
    }}
    ref={(textarea) => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    }}
  />
);


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
        <Loader2 className="animate-spin h-8 w-8 mr-2">Loading records...</Loader2>
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

  // initiating data
  const isResident = prenatalForm.patient_details.pat_type.toLowerCase() === "resident";
  const personalInfo = prenatalForm.patient_details?.personal_info;
  const address = prenatalForm.patient_details?.address;
  const family = prenatalForm.patient_details?.family;
  const bodyMeasurement = prenatalForm.body_measurement_details;
  const obstetricHistory = prenatalForm.obstetric_history;
  const medicalHistory = prenatalForm.medical_history || [];
  const previousHospitalizations = prenatalForm.previous_hospitalizations || [];
  const previousPregnancies = prenatalForm.previous_pregnancy;
  const labResults = prenatalForm.laboratory_results || [];
  const checklist = prenatalForm.checklist_data;
  const riskCodes = prenatalForm.obstetric_risk_codes;
  const birthPlan = prenatalForm.birth_plan_details;
  const assessedBy = prenatalForm.staff_details?.staff_name
  const prenatalCareEntries = prenatalForm.prenatal_care_entries || [];
  const followUpDetails = prenatalForm.follow_up_visit_details;
  
  // Sort TT statuses by TT number (TT1, TT2, TT3, etc.)
  const ttStatuses = (prenatalForm.tt_statuses || []).sort((a: any, b: any) => {
    const extractNumber = (status: string) => {
      const match = status.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    return extractNumber(a.tts_status) - extractNumber(b.tts_status);
  });

  // spouse or father details
  const isFatherFC = prenatalForm.patient_details?.family?.family_heads?.father?.role.toLowerCase() === "father";
  const fatherFC = prenatalForm.patient_details?.family?.family_heads?.father?.personal_info
  const fatherFormattedName = `${fatherFC?.per_lname || ""}, ${fatherFC?.per_fname || ""} ${fatherFC?.per_mname || ""}`.trim();
  
  // age calculation
  const age = personalInfo?.per_dob ? 
    Math.floor((new Date().getTime() - new Date(personalInfo.per_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString() 
    : "";
  
  const ageTenToFourteen = age && parseInt(age) >= 10 && parseInt(age) <= 14;
  const ageFifteenToNineteen = age && parseInt(age) >= 15 && parseInt(age) <= 19;
  const ageTwentyToFortyNine = age && parseInt(age) >= 20 && parseInt(age) <= 49;

  // bmi calculation
  const weight = bodyMeasurement?.weight
  const height = bodyMeasurement?.height
  let bmi: string = "0"

  if (weight && height && height > 0) {
    bmi = (weight / (height / 100) ** 2).toFixed(2)
  } else {
    bmi = "0"
  }
  
  let bmiCategory = ""
  const bmiValue = parseFloat(bmi);
  if (typeof bmiValue === "number" && !isNaN(bmiValue)) {
    if (bmiValue < 18.5) {
      bmiCategory = "Underweight"
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      bmiCategory = "Normal weight"
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      bmiCategory = "Overweight"
    } else if (bmiValue >= 30) {
      bmiCategory = "Obesity"
    }
  }

  const bpLowChecked = bmiCategory === "Underweight";
  const bpHighChecked = bmiCategory === "Obesity" || bmiCategory === "Overweight";
  const bpNormalChecked = bmiCategory === "Normal weight";


  // lab results helper
  const getLabResultDisplay = (type: string) => {
    const result = labResults.find((lab: any) => lab.lab_type === type);
    if (!result) return "";
    if (result.to_be_followed) return "to be followed";
    return result.result_date || "";
  };

  // Helper function to categorize visits by trimester based on AOG
  const categorizeVisitByAOG = (aogWeeks: number, aogDays: number) => {
    const totalDays = (aogWeeks * 7) + (aogDays || 0);
    
    // 1st trimester: 0-12 weeks and 6 days (0-90 days)
    if (totalDays <= 90) return '1st';
    // 2nd trimester: 13-27 weeks and 6 days (91-195 days)
    if (totalDays <= 195) return '2nd';
    // 3rd trimester: 28+ weeks (196+ days)
    return '3rd';
  };

  // Get completed follow-up dates for each trimester
  const getCompletedVisitDate = (trimester: string) => {
    const completedVisits = prenatalCareEntries.filter((entry: any) => {
      const category = categorizeVisitByAOG(entry.pfpc_aog_wks || 0, entry.pfpc_aog_days || 0);
      return category === trimester && entry.pfpc_date;
    });
    
    // Return the first completed visit date for this trimester
    if (completedVisits.length > 0) {
      return completedVisits[0].pfpc_date;
    }
    return "";
  };

  // Get pending follow-up information for advises
  const getPendingFollowUp = () => {
    if (followUpDetails && followUpDetails.followv_status === 'pending' && followUpDetails.followv_date) {
      return `Follow-up visit scheduled on: ${new Date(followUpDetails.followv_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}`;
    }
    return "";
  };

  // Get all lab remarks with lab names
  const getAllLabRemarks = () => {
    const remarks = labResults
      .filter((lab: any) => lab.to_be_followed || lab.result_date)
      .map((lab: any) => {
        const labName = capitalize(lab.lab_type.replace(/_/g, ' '));
        if (lab.to_be_followed) return `${labName}: to be followed`;
        if (lab.result_date) {
          const dateFormatted = new Date(lab.result_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          });
          return `${labName} (${dateFormatted}): ${lab.remarks || ""}   `;
        }
        return "";
      })
      .filter(Boolean);
    
    return remarks.join('; ');
  };


  return (
    <div className="flex max-w-6xl mx-auto m-5 overflow-hidden border border-gray-500">
      <div className="mx-10 my-5">
        {/* Header */}
        <div>
          <p className="text-sm pb-5 mt-10">CEBU CITY HEALTH DEPARTMENT <br /> 2020</p>
          <h4 className="text-center text-lg pb-5"><b>MATERNAL HEALTH RECORD</b></h4>
        </div>

        {/* Personal Information */}
        <div className="flex flex-col">
          <div className="flex flex-col pb-2">
            <div className="flex mb-2">
              <Label className="mt-4">FAMILY NO:</Label>
              <InputLine className="w-1/6" value={family?.fam_id || ""} />
            </div>
            <div className="flex">
              <Label className="mt-4">NAME:</Label>
              <InputLine 
                className="w-[50vh]" 
                value={`${personalInfo?.per_lname || ""}, ${personalInfo?.per_fname || ""} ${personalInfo?.per_mname || ""}`.trim()} 
              />
              <Label className="mt-4">AGE:</Label>
              <InputLine 
                className="w-[90px]" 
                value={personalInfo?.per_dob ? 
                  Math.floor((new Date().getTime() - new Date(personalInfo.per_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString() 
                  : ""} 
              />
              <div className="flex">
                <input 
                  type="checkbox"
                  name="ageTenToFourteen"
                  className="ml-1 mr-1 mt-3" 
                  checked={ageTenToFourteen || false} 
                  readOnly
                />
                <Label className="mt-4">10-14YO</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  name="ageFifteenToNineteen"
                  className="ml-1 mr-1 mt-3" 
                  checked={ageFifteenToNineteen || false} 
                  readOnly
                />
                <Label className="mt-4">15-19</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  name="ageTwentyToFortyNine"
                  className="ml-1 mr-1 mt-3" 
                  checked={ageTwentyToFortyNine || false} 
                  readOnly
                />
                <Label className="mt-4">20-49</Label>
              </div>
            </div>
            
          </div>

          <div className="flex pb-2">
            <Label className="mt-4">DATE OF BIRTH:</Label>
            <InputLine className="w-[100px]" value={personalInfo?.per_dob || ""} />
            <Label className="mt-4">HUSBAND'S NAME:</Label>
            {isResident && isFatherFC ? (
              <InputLine className="w-1/3" value={fatherFormattedName}/>
            ) : (
              <InputLine 
                className="w-1/3" 
                value={`${prenatalForm.spouse_details?.spouse_lname || ""}, ${prenatalForm.spouse_details?.spouse_fname || ""} ${prenatalForm.spouse_details?.spouse_mname || ""}`.trim()} 
              />
            )}
            
            <Label className="mt-4">OCCUPATION:</Label>
            <InputLine className="w-1/6" value={prenatalForm.spouse_details?.spouse_occupation || prenatalForm?.pf_occupation} />
          </div>

          <div className="flex pb-2">
            <Label className="mt-4">ADDRESS:</Label>
            <InputLine 
              className="w-1/3" 
              value={`${address?.add_street || ""} ${address?.add_sitio || ""} ${address?.add_brgy || ""} ${address?.add_city || ""} ${address?.add_province || ""}`.trim()} 
            />
            <Label className="mt-4">WEIGHT:</Label>
            <InputLine className="w-[90px]" value={`${bodyMeasurement?.weight || ""} kg`} />
            
            <Label className="mt-4">HEIGHT:</Label>
            <InputLine className="w-[90px]" value={`${bodyMeasurement?.height || ""} cm`} />

            <Label className="mt-4">BMI:</Label>
            <InputLine className="w-[90px]" value={String(bmi)} />

            <div className="flex">
              <input 
                type="checkbox"
                name="bpLow"
                className="ml-1 mr-1 mt-3" 
                checked={bpLowChecked || false} 
                readOnly
              />
              <Label className="mt-4">LOW</Label>
            </div>
            <div className="flex">
              <input 
                type="checkbox"
                name="bpHigh"
                className="ml-1 mr-1 mt-3" 
                checked={bpHighChecked || false} 
                readOnly
              />
              <Label className="mt-4">HIGH</Label>
            </div>
            <div className="flex">
              <input 
                type="checkbox"
                name="bpNormal"
                className="ml-1 mr-1 mt-3" 
                checked={bpNormalChecked || false} 
                readOnly
              />
              <Label className="mt-4">NORMAL</Label>
            </div>
          </div>
        </div>

        {/* Obstetric History */}
        <div className="grid grid-cols-2 gap-4">
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
              <InputLine className="w-20" value={obstetricHistory?.obs_abortion?.toString() || "0"} />
            </div>
            <div className="flex">
              <Label className="mt-4">NO. OF STILL BIRTHS/FETAL DEATH:</Label>
              <InputLine className="w-20" value={obstetricHistory?.obs_still_birth?.toString() || "0"} />
            </div>
            <div className="flex">
              <Label className="mt-4">HISTORY OF LARGE BABIES (8LBS):</Label>
              <InputLine className="w-20" value={obstetricHistory?.obs_lg_babies?.toString() || "0"} />
            </div>
            <div className="flex">
              <Label className="mt-4">DIABETES:</Label>
              <InputLine className="w-20" value="" />
            </div>
          </div>

          {/* Medical History */}
          <div className="flex">
            <div className="flex flex-col">
              <h6 className="text-sm mt-3 underline"><b>MEDICAL HISTORY</b></h6>
                <div className="flex flex-col">
                  {/* Previous Illness */}
                  <div className="flex">
                    <Label className="mt-4">PREVIOUS ILLNESS:</Label>
                  </div>
                  <div>
                    <InputLineLonger 
                      className="w-[43vh] text-sm" 
                      value={medicalHistory.length > 0 
                        ? medicalHistory.map((pi: any) => `(${pi.ill_date || "unknown date"}) ${pi.illness_name}`).join(', ') 
                        : ""
                      } 
                    />
                  </div>

                  {/* Previous Hospitalization */}
                  <div className="flex">
                    <Label className="mt-4">PREVIOUS HOSPITALIZATION:</Label>
                  </div>
                  <div>
                    <InputLineLonger  
                      className="w-[43vh] text-sm break-words resize-none overflow-y-auto min-h-[3.5rem] max-h-32" 
                      value={previousHospitalizations.length > 0 
                        ? previousHospitalizations.map((hospitalizations: any) => `(${hospitalizations.prev_hospitalization_year}) ${hospitalizations.prev_hospitalization}`).join(', ')
                        : ""
                      } 
                    />
                  </div>
                  {/* Previous Pregnancy Complications */}
                  <div className="flex">
                    <Label className="mt-4">PREVIOUS PREG. COMPLICATION: (SPECIFY) HISTORY OF</Label>
                  </div>
                  <div>
                    <InputLineLonger 
                      className="w-[43vh] text-sm break-words resize-none overflow-y-auto min-h-[3.5rem] max-h-32" 
                      value={prenatalForm.previous_complications} 
                    />
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Previous Pregnancy */}
        <div className="w-full">
          <h6 className="text-sm mt-4"><b>PREVIOUS PREGNANCY</b></h6>
          <div className="grid sm:grid-cols-5 md:grid-cols-7">
            <div className="p-2 border border-black">
              <p className="text-sm">DATE OF DELIVERIES</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">OUTCOME (FULLTERM/PRETERM)</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">TYPE OF DELIVERY (NSVD/CS)</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">BABY'S WT</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">GENDER</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">BALLARD SCORE</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">APGAR SCORE</p>
            </div>
            
            {/* previous pregnancy values */}
            <div className="p-2 border border-black">
              <p className="text-sm">{previousPregnancies?.date_of_delivery}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{previousPregnancies?.outcome}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{previousPregnancies?.type_of_delivery}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{`${previousPregnancies?.babys_wt} lbs`}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{previousPregnancies?.gender}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{previousPregnancies?.ballard_score}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{previousPregnancies?.apgar_score}</p>
            </div>
          </div>
        </div>

        {/* Tetanus Toxoid */}
        <div className="w-full">
          <h6 className="text-sm underline mt-4"><b>TETANUS TOXOID GIVEN: (DATE GIVEN)</b></h6>
          <div className="grid sm:grid-cols-5 md:grid-cols-6">
            <div className="flex text-center items-center justify-center p-2 border border-black">
              <div>
                <p className="text-sm font-semibold">TT1</p>
                <p className="text-xs font-semibold">( FIRST VISIT )</p>
              </div>
            </div>
            <div className="flex text-center items-center justify-center p-2 border border-black">
              <div>
                <p className="text-sm font-semibold">TT2</p>
                <p className="text-xs font-semibold">( ONE MO AFTER THE FIRST DOSE )</p>
              </div>
            </div>
            <div className="flex text-center items-center justify-center p-2 border border-black">
              <div>
                <p className="text-sm font-semibold">TT3</p>
                <p className="text-xs font-semibold">( 6 MONTHS AFTER THE SECOND DOSE )</p>
              </div>
            </div>
            <div className="flex text-center items-center justify-center p-2 border border-black">
              <div>
                <p className="text-sm font-semibold">TT4</p>
                <p className="text-xs font-semibold">( 1 YEAR AFTER THE THIRD DOSE )</p>
              </div>
            </div>
            <div className="flex text-center items-center justify-center p-2 border border-black">
              <div>
                <p className="text-sm font-semibold">TT5</p>
                <p className="text-xs font-semibold">( 1 YEAR AFTER THE FOURTH DOSE )</p>
              </div>
            </div>
            <div className="flex text-center items-center justify-center p-2 border border-black">
              <div>
                <p className="text-sm font-semibold">FIM</p>
              </div>
            </div>

            {/* tetanus values */}
            <div className="p-2 border border-black">
              <p className="text-sm">{ttStatuses.find((tt: any) => tt.tts_status === 'TT1')?.tts_date_given || ''}</p> 
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{ttStatuses.find((tt: any) => tt.tts_status === 'TT2')?.tts_date_given || ''}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{ttStatuses.find((tt: any) => tt.tts_status === 'TT3')?.tts_date_given || ''}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{ttStatuses.find((tt: any) => tt.tts_status === 'TT4')?.tts_date_given || ''}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{ttStatuses.find((tt: any) => tt.tts_status === 'TT5')?.tts_date_given || ''}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-sm">{ttStatuses.find((tt: any) => tt.tts_status === 'FIM')?.tts_date_given || ''}</p>
            </div>
          </div>
        </div>

        {/* Present Pregnancy */}
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <h6 className="text-sm mt-4 underline"><b>PRESENT PREGNANCY</b></h6>
            <div className="flex">
              <Label className="mt-4">GRAVIDA:</Label>
              <InputLine className="w-14" value={obstetricHistory?.obs_gravida?.toString() || "0"} />
              <Label className="mt-4">PARA:</Label>
              <InputLine className="w-14" value={obstetricHistory?.obs_para?.toString() || "0"} />
              <Label className="mt-4">FULLTERM:</Label>
              <InputLine className="w-14" value={obstetricHistory?.obs_fullterm?.toString() || "0"} />
              <Label className="mt-4">PRETERM:</Label>
              <InputLine className="w-14" value={obstetricHistory?.obs_preterm?.toString() || "0"} />
            </div>
            <div className="flex">
              <Label className="mt-4">LMP:</Label>
              <InputLine className="w-[208px]" value={obstetricHistory?.obs_lmp || ""} />
              <Label className="mt-4">EDC:</Label>
              <InputLine className="w-[208px]" value={prenatalForm.pf_edc || ""} />
            </div>
          </div>

          {/* Guide for 4ANC Visits */}
          <div className="flex flex-col">
            <h6 className="text-sm mt-4"><b>Guide for 4ANC Visits: (date)</b></h6>
            <div className="grid grid-cols-3">
              <div className="flex text-center items-center justify-center p-2 border border-black">
                  <p className="text-xs font-semibold">1st tri upto 12wks and 6 days</p>
              </div>
              <div className="flex text-center items-center justify-center p-2 border border-black">
                  <p className="text-xs font-semibold">2nd tri upto 13-27wks and 6 days</p>
              </div>
              <div className="flex text-center items-center justify-center p-2 border border-black">
                  <p className="text-xs font-semibold">3rd tri upto 28wks and more</p>
              </div>

              {/* 4anc visits values - showing completed follow-up dates */}
              <div className="flex text-center items-center justify-center p-3 border border-black">
                  <p className="text-xs font-semibold">
                    {getCompletedVisitDate('1st') ? new Date(getCompletedVisitDate('1st')).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : ""}
                  </p>
              </div>
              <div className="flex text-center items-center justify-center p-2 border border-black">
                  <p className="text-xs font-semibold">
                    {getCompletedVisitDate('2nd') ? new Date(getCompletedVisitDate('2nd')).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : ""}
                  </p>
              </div>
              <div className="grid grid-cols-2">
                <div className="flex text-center items-center justify-center p-2 border border-black">
                  <p className="text-xs font-semibold">
                    {getCompletedVisitDate('3rd') ? new Date(getCompletedVisitDate('3rd')).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : ""}
                  </p>
                </div>
                <div className="flex text-center items-center justify-center p-2 border border-black">
                  <p className="text-xs font-semibold">
                    {/* Second 3rd trimester visit if exists */}
                    {prenatalCareEntries.filter((entry: any) => categorizeVisitByAOG(entry.pfpc_aog_wks || 0, entry.pfpc_aog_days || 0) === '3rd')[1]?.pfpc_date 
                      ? new Date(prenatalCareEntries.filter((entry: any) => categorizeVisitByAOG(entry.pfpc_aog_wks || 0, entry.pfpc_aog_days || 0) === '3rd')[1].pfpc_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="">
              {getPendingFollowUp() && (
                <div className="flex mt-2">
                  <Label className="font-semibold mt-4">Next Follow-Up:</Label>
                  <InputLine className="w-3/4 ml-2 " value={getPendingFollowUp()} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Laboratory Results */}
        <div className="flex flex-col">
          <h6 className="text-sm mt-4 underline"><b>LABORATORY RESULTS: (DATE AND RESULT)</b></h6>
          <span className="text-sm underline">PRE-ECLAMPSIA PANEL:</span>

          {/* first 3 laboratory exams */}
          <div className="flex flex-row gap-14">
            <div className="flex">
              <Label className="mt-4">URINALYSIS:</Label>
              <InputLine className="w-32" value={getLabResultDisplay("urinalysis")} />
            </div>
            <div className="flex">
              <Label className="mt-4">SYPHILLIS:</Label>
              <InputLine className="w-32" value={getLabResultDisplay("syphilis")} />
            </div>
            <div className="flex">
              <Label className="mt-4">OGCT: 50GMS 24-28WKS</Label>
              <InputLine className="w-32" value={getLabResultDisplay("ogct_50gms")} />
              <Label className="mt-4">100GMS</Label>
              <InputLine className="w-32" value={getLabResultDisplay("ogct_100gms")} />
            </div>
          </div>

          {/* the rest of the laboratory exams */}
          <div className="flex gap-10">
            <div className="flex flex-col">
              <div className="flex flex-row ">
                <div className="flex">
                  <Label className="mt-4">CBC:</Label>
                  <InputLine className="w-32" value={getLabResultDisplay("cbc")} />
                </div>
                <div className="flex ml-[105px]">
                  <Label className="mt-4">HIV TEST:</Label>
                  <InputLine className="w-32" value={getLabResultDisplay("hiv_test")} />
                </div>
              </div>
              
              <div className="flex flex-row">
                <div className="flex">
                  <Label className="mt-4">SGOT/SGPT:</Label>
                  <InputLine className="w-32" value={getLabResultDisplay("sgot_sgpt")} />
                </div>
                <div className="flex ml-14">
                  <Label className="mt-4">HEPA B:</Label>
                  <InputLine className="w-32" value={getLabResultDisplay("hepa_b")} />
                </div>
              </div>

              <div className="flex flex-row">
                <div className="flex">
                  <Label className="mt-4">CREATININE SERUM:</Label>
                  <InputLine className="w-32" value={getLabResultDisplay("creatinine_serum")} />
                </div>
                <div className="flex">
                  <Label className="mt-4">BLOOD TYPING:</Label>
                  <InputLine className="w-32" value={getLabResultDisplay("blood_typing")} />
                </div>
              </div>

              <div className="flex flex-row">
                <div className="flex">
                  <Label className="mt-4">BUA/BUN:</Label>
                  <InputLine className="w-32" value={getLabResultDisplay("bua_bun")} />
                </div>
              </div>
            </div>
          </div>
          <div>
            {getAllLabRemarks() && (
              <div className="flex mt-2">
                <Label className="font-semibold mt-4">Laboratory Remarks:</Label>
                <InputLineLonger className="w-3/4 pt-3 ml-2 text-sm" value={getAllLabRemarks()} />
              </div>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="w-full">
          <h6 className="text-sm mt-4 underline"><b>CHECKLIST:</b></h6>
          <span className="text-sm underline">( ) PREECLAMPSIA</span>
          <div className="flex flex-row">
            <div className="flex flex-col">
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.increased_bp || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">INCREASED BP</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.epigastric_pain || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">EPIGASTRIC PAIN</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.nausea || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">NAUSEA/VOMITING</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.blurring_vision || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">BLURRING OF VISION</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.edema || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">EDEMA</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.severe_headache || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">SEVERE HEADACHE</Label>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.abno_vaginal_disch || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">ABNORMAL VAGINAL DISCHARGES</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.vaginal_bleeding || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">VAGINAL BLEEDING</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.chills_fever || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">CHILLS & FEVER</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.diff_in_breathing || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">DIFF. IN BREATHING</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.varicosities || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">VARICOSITIES</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={checklist.abdominal_pain || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">ABDOMINAL PAIN</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Birth Plan */}
        <div className="flex mt-5">
          <Label className="mt-4">PLAN FOR PLACE OF DELIVERY:</Label>
          <InputLine className="w-[300px]" value={birthPlan.place_of_delivery_plan || ""} />
          <Label className="mt-4">PLAN FOR NEWBORN SCREENING:</Label>
          <div className="flex">
            <input 
              type="checkbox"
              className="mt-4 mr-2 ml-4" 
              checked={birthPlan.newborn_screening_plan || false} 
              readOnly
            />
            <p className="mt-3">YES</p>
            <input 
              type="checkbox" 
              className="mt-4 mr-2 ml-4" 
              checked={!birthPlan.newborn_screening_plan} 
              readOnly 
            />
            <p className="mt-3">NO</p>
          </div>
        </div>

        {/* Micronutrient Supplementation */}
        <div className="w-full">
          <h6 className="text-sm mt-4 underline"><b>MICRONUTRIENT SUPPLEMENTATION:</b></h6>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <Label className="mt-4">IRON W/FOLIC ACID: (DATE STARTED)</Label>
              <InputLine className="w-[150px]" value="" />

              <Label className="mt-4">(DATE COMPLETED)</Label>
              <InputLine className="w-[150px]" value="" />

              
            </div>
            <div className="flex flex-row">
              <Label className="mt-4">DEWORMING TAB: (PREFERABLY 3RD TRIMESTER) DATE GIVEN:</Label>
              <InputLine className="w-[150px]" value="" />
            </div>
          </div>
        </div>

        {/* Risk Codes */}
        <div className="flex flex-col">
          <h6 className="text-sm mt-4 underline"><b>RISK CODES:</b></h6>
          <div className="flex flex-row">
            <div className="flex flex-col">
              <p className="text-sm mt-4">( ) HAS ONE OR MORE OF THE FF:</p>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_prev_c_section || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">PREVIOUS CAESARIAN</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_3_consecutive_miscarriages || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">3 consecutive miscarriages of still born baby</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_postpartum_hemorrhage || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">Postpartum hemorrhage</Label>
              </div>
            </div>

            <div className="flex flex-col">
              <p className="text-sm mt-4">( ) HAVING ONE OR MORE 1 CONDITIONS:</p>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_postpartum_hemorrhage || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">Tuberculosis</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_postpartum_hemorrhage || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">Heart Disease</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_postpartum_hemorrhage || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">Diabetes</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_postpartum_hemorrhage || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">Bronchial Asthma</Label>
              </div>
              <div className="flex">
                <input 
                  type="checkbox"
                  className="ml-10 mr-2 mt-4" 
                  checked={riskCodes.pforc_postpartum_hemorrhage || false} 
                  readOnly
                />
                <Label className="mr-[8rem] mt-4">Goiter</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Assessed By */}
        <div className="flex flex-col mb-16">
          <Label className="mt-4">ASSESSED BY:</Label>
          <InputLine 
            className="w-1/6" 
            value={assessedBy || ""} 
          />
        </div>
      </div>
    </div>
  );
}