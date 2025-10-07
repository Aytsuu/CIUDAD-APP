// components/PhysicalExamTable.tsx
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import PHIllnessTable from "../medicalhistory/past-medical-history";
import FamhistTable from "./family-history";

export default function PhysicalExamTable({ consultation, patientData, examSections, isPhysicalExamLoading, phHistoryData, famHistoryData }: any) {
  const splitOptionsIntoColumns = (options: any[]) => {
    const midIndex = Math.ceil(options.length / 2);
    const firstColumn = options.slice(0, midIndex);
    const secondColumn = options.slice(midIndex);
    return { firstColumn, secondColumn };
  };

  return (
    <div>
      <span className="font-bold text-black text-sm">Individual Health Profile:</span>
      <table className="w-full border border-black">
        <tbody>
          <tr>
            <td className="w-1/4 border border-black p-2 align-top">
              <div className="flex flex-col gap-2">
                {/* Walk-In WITH ATC - Checked when true */}
                <div className="flex items-center">
                  <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.philhealth_details?.iswith_atc === true ? "bg-black" : "bg-white"}`}>{consultation.philhealth_details?.iswith_atc === true && <Check className="h-4 w-4 text-white" />}</div>
                  <Label className="ml-2 text-black">WALK-IN WITH ATC</Label>
                </div>

                {/* Walk-In WITHOUT ATC - Checked when false */}
                <div className="flex items-center">
                  <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.philhealth_details?.iswith_atc === false ? "bg-black" : "bg-white"}`}>{consultation.philhealth_details?.iswith_atc === false && <Check className="h-4 w-4 text-white" />}</div>
                  <Label className="ml-2 text-black">WALK-IN W/O ATC</Label>
                </div>
              </div>
            </td>
            <td className="w-1/4 border border-black p-2 align-top">
              <Label className="font-bold">Assessment Date: </Label>
              <span className="text-sm">{localDateFormatter(consultation.created_at)}</span>
            </td>
            <td className="w-1/4 border border-black p-2 align-top">
              <Label className="font-bold">PIN: </Label>
              <span className="text-sm">{consultation.patrec_details?.patient_details?.additional_info?.philhealth_id?.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3") || ""}</span>
            </td>
            <td className="w-1/4 border border-black p-2 align-top">
              <div className="flex flex-col gap-2">
                {/* Member - Checked when true */}
                <div className="flex items-center">
                  <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.philhealth_details?.dependent_or_member === "MEMBER" ? "bg-black" : "bg-white"}`}>
                    {consultation.philhealth_details?.dependent_or_member === "MEMBER" && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <Label className="ml-2 text-black">Member</Label>
                </div>

                {/* Dependent - Checked when true */}
                <div className="flex items-center">
                  <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.philhealth_details?.dependent_or_member === "DEPENDENT" ? "bg-black" : "bg-white"}`}>
                    {consultation.philhealth_details?.dependent_or_member === "DEPENDENT" && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <Label className="ml-2 text-black">Dependent</Label>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td colSpan={4} className="p-2 border border-black">
              <div className="flex flex-wrap items-center justify-between gap-8">
                {/* Name Section */}
                <div className="flex items-center">
                  <Label className="text-md font-bold mr-2">Name:</Label>
                  <span className="truncate">{` ${patientData?.personal_info?.per_lname} ${patientData?.personal_info?.per_fname} ${patientData?.personal_info?.per_mname || ""} ${patientData?.personal_info?.per_suffix || ""}`}</span>
                </div>

                {/* Gender Section */}
                <div className="flex gap-2">
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${patientData.personal_info.per_sex?.toLowerCase() === "female" ? "bg-black" : "bg-white"}`}>
                      {patientData.personal_info.per_sex?.toLowerCase() === "female" && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <Label className="ml-2 text-black">Female</Label>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${patientData.personal_info.per_sex?.toLowerCase() === "Male" ? "bg-black" : "bg-white"}`}>{patientData.personal_info.per_sex === "Male" && <Check className="h-4 w-4 text-white" />}</div>
                    <Label className="ml-2 text-black">Male</Label>
                  </div>
                </div>

                {/* Marital Status Section */}
                <div className="flex gap-2">
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.philhealth_details?.civil_status.toUpperCase() === "SINGLE" ? "bg-black" : "bg-white"}`}>
                      {consultation.philhealth_details?.civil_status.toUpperCase() === "SINGLE" && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <Label className="ml-2 text-black">Single</Label>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.philhealth_details?.civil_status.toUpperCase() === "MARRIED" ? "bg-black" : "bg-white"}`}>
                      {consultation.philhealth_details?.civil_status.toUpperCase() === "MARRIED" && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <Label className="ml-2 text-black">Married</Label>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.philhealth_details?.civil_status.toUpperCase() === "WIDOWER" ? "bg-black" : "bg-white"}`}>
                      {consultation.philhealth_details?.civil_status.toUpperCase() === "WIDOWER" && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <Label className="ml-2 text-black">Widow/er</Label>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${!["SINGLE", "MARRIED", "WIDOWER"].includes(consultation.philhealth_details?.civil_status.toUpperCase()) ? "bg-black" : "bg-white"}`}>
                      {!["SINGLE", "MARRIED", "WIDOWER"].includes(consultation.philhealth_details?.civil_status.toUpperCase()) && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <Label className="ml-2 text-black">Others</Label>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="w-1/4 border border-black p-2 align-top">
              <Label className="font-bold text-md">Sitio/Street</Label>: <span>{patientData.address.add_sitio || "N/A"}</span>
            </td>
            <td className="w-1/4 border border-black p-2 align-top">
              <Label className="font-bold text-md">barangay</Label>: <span>{patientData.address.add_barangay || "N/A"}</span>
            </td>
            <td className="w-1/4 border border-black p-2 align-top">
              <Label className="font-bold text-md">City/Municipality</Label>: <span>{patientData.address.add_city || "N/A"}</span>
            </td>
            <td className="w-1/4 border border-black p-2 align-top">
              <Label className="font-bold text-md">Province</Label>: <span>{patientData.address.add_province || "Cebu"}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full">
        <tr className="border-b">
          <td className="w-1/3 border border-t-0 border-black p-2 align-top ">
            <Label className="font-bold text-md">Age</Label>: <span>{calculateAgeFromDOB(patientData.personal_info.per_dob, consultation.created_at).years} years old</span>
          </td>
          <td className="w-1/3 border border-t-0 border-black p-2 align-top ">
            <Label className="font-bold text-md">Birthday</Label>: <span>{patientData.personal_info.per_dob}</span>
          </td>
          <td className="w-1/3 border border-t-0 border-black p-2 align-top ">
            <Label className="font-bold text-md">Contact Number</Label>: <span>{patientData.personal_info.per_contact || "N/A"}</span>
          </td>
        </tr>
      </table>

      <table className="w-full border border-black">
        <tr>
          <td className="border border-black p-2 text-left">Pertinent Physical Examination</td>
          <td className="border border-black p-2 text-left">Pertinent Findings Per System</td>
        </tr>
      </table>

      <table className="w-full ">
        <tbody>
          <tr>
            <td className=" align-top" style={{ width: "50%" }}>
              <table className="w-full ">
                <tbody>
                  <tr className="border border-black">
                    <td className="border border-black p-2">Blood Pressure</td>
                    <td className="border border-black p-2">
                      <span className="underline">{consultation.vital_signs.vital_bp_diastolic}</span> / <span className="underline">{consultation.vital_signs.vital_bp_systolic}</span> mmHg
                    </td>
                  </tr>
                  <tr className="border border-black">
                    <td className="border border-black p-2">Heart Rate</td>
                    <td className="border border-black p-2">
                      <span className="underline">{consultation.vital_signs.vital_pulse}</span> /min
                    </td>
                  </tr>
                  <tr className="border border-black">
                    <td className="border border-black p-2">Respiratory Rate</td>
                    <td className="border border-black p-2">
                      <span className="underline">{consultation.vital_signs.vital_RR}</span> /min
                    </td>
                  </tr>
                  <tr className="border border-black">
                    <td className="border border-black p-2">Height (cm)</td>
                    <td className="border border-black p-2">
                      <span className="underline">
                        {parseFloat(consultation.bmi_details?.height ?? "0")
                          .toFixed(2)
                          .replace(/\.00$/, "")}
                      </span>{" "}
                      cm
                    </td>
                  </tr>
                  <tr className="border border-black">
                    <td className="border border-black p-2">Weight (kg)</td>
                    <td className="border border-black p-2">
                      <span className="underline">
                        {parseFloat(consultation.bmi_details?.weight ?? "0")
                          .toFixed(2)
                          .replace(/\.00$/, "")}
                      </span>{" "}
                      kg
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">BMI</td>
                    <td className="border border-black p-2">
                      <span className="underline">{consultation.bmi_details?.weight && consultation.bmi_details?.height ? (parseFloat(consultation.bmi_details.weight) / Math.pow(parseFloat(consultation.bmi_details.height) / 100, 2)).toFixed(2) : "N/A"}</span> kg/m²
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">Temperature</td>
                    <td className="border border-black p-2">
                      <span className="underline">{consultation.vital_signs.vital_temp}</span> °C
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full mt-1">
                <div className=" w-full">
                  <FamhistTable famhistData={famHistoryData} isLoading={!famHistoryData} isError={false} />
                </div>
              </table>
              <table className="w-full  mt-1">
                <div className=" w-full">
                  <PHIllnessTable phHistoryData={phHistoryData} isLoading={!phHistoryData} isError={false} />
                </div>
              </table>

              <table className="w-full  mt-1">
                <div className="border border-black p-2 w-full">
                  <div>
                    <Label>LMP</Label>: <span className="underline">{consultation.philhealth_details?.obs_details?.obs_lmp || ""}</span>
                  </div>
                  <div className="ml-6">
                    <div>
                      <Label>OBS Score G</Label>: <span className="underline">{consultation.philhealth_details?.obs_details?.obs_gravida || 0}</span> <Label>P</Label>: <span className="underline">{consultation.obs_details?.obs_para || 0}</span>
                    </div>

                    <div>
                      <Label>(TPAL)</Label>: <span className="underline">{consultation.philhealth_details?.obs_details?.obs_fullterm || 0}</span> - <span className="underline">{consultation.philhealth_details?.obs_details?.obs_preterm || 0}</span> -{" "}
                      <span className="underline">{consultation.philhealth_details?.obs_details?.obs_abortion || 0}</span> - <span className="underline">{consultation.philhealth_details?.obs_details?.obs_living_ch || 0}</span>
                    </div>
                    <div>
                      <Label>AOG</Label> <span className="underline"></span>
                    </div>
                    <div>
                      <Label>TT Status</Label> <span className="underline">{consultation.philhealth_details?.tts_details?.tts_status}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Contraceptive used:</Label> <span className="underline">{}</span>
                  </div>
                </div>
              </table>

              <table className="w-full  mt-1">
                <div className="border border-black p-2 w-full">
                  <div>
                    <Label>Smoker:</Label> <span className="underline">{consultation.philhealth_details?.smk_sticks_per_day || ""}</span>
                    <Label>sticks/day x </Label>
                    <span className="underline">{consultation.philhealth_details?.smk_years}</span>;
                  </div>
                  <div>
                    <span className="underline px-2">{consultation.philhealth_details?.is_passive_smoker ? "✓" : "x"}</span> <Label>passive</Label>
                  </div>
                  <div>
                    <Label>Alcohol:</Label>
                    <span className="underline px-2">{consultation.philhealth_details?.alcohol_bottles_per_day || ""}</span>
                    <Label>bottles/day</Label>
                  </div>
                </div>
              </table>
            </td>

            <td className=" text-left align-top" style={{ width: "50%" }}>
              {/* Physical Examination Results */}
              {!isPhysicalExamLoading && examSections.length > 0 && (
                <div>
                  <table className="pe-table border border-black w-full">
                    <tbody>
                      {examSections.map((section: any) => {
                        const { firstColumn, secondColumn } = splitOptionsIntoColumns(section.options);

                        return (
                          <tr key={section.pe_section_id}>
                            <td className="font-bold border border-black p-2" style={{ width: "25%", verticalAlign: "top" }}>
                              {section.title}
                            </td>
                            <td className="border border-black p-2" style={{ width: "37.5%", verticalAlign: "top" }}>
                              {firstColumn.map((option: any) => (
                                <div key={option.pe_option_id} className={option.isSelected ? "pe-finding" : "pe-option"}>
                                  {option.isSelected ? "✓ " : "__"} {option.text}
                                </div>
                              ))}
                            </td>
                            <td className="border border-black p-2" style={{ width: "37.5%", verticalAlign: "top" }}>
                              {secondColumn.map((option: any) => (
                                <div key={option.pe_option_id} className={option.isSelected ? "pe-finding" : "pe-option"}>
                                  {option.isSelected ? "✓ " : "__"} {option.text}
                                </div>
                              ))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

                {/* LABORATORY REQUEST */}
                <table className="w-full border-collapse border border-black mt-4 text-md">
                <thead>
                  <tr>
                  <th colSpan={5} className="border-b border-black p-2 font-bold text-left">
                    Laboratory request/s:
                  </th>
                  </tr>
                  <tr className="border-b border-black text-center">
                  <th className="border-r border-black p-2" style={{ width: "8%" }}></th>
                  <th className="border-r border-black p-2" style={{ width: "8%" }}></th>
                  <th className="border-r border-black p-2" style={{ width: "54%" }}>
                    Laboratory
                  </th>
                  <th className="border-r border-black p-2" style={{ width: "15%" }}>
                    Date
                  </th>
                  <th className="p-2" style={{ width: "15%" }}>
                    Result/s
                  </th>
                  </tr>
                </thead>

                <tbody>
                  {/* ---------- AS REQUIRED (All Ages) ---------- */}
                  <tr>
                  <td
                    rowSpan={6}
                    className="border-r border-black align-middle text-center"
                    style={{
                    width: "8%",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    whiteSpace: "nowrap"
                    }}
                  >
                    as required
                  </td>

                  <td
                    rowSpan={6}
                    className="border-r border-black align-middle text-center text-md"
                    style={{
                    width: "8%",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    whiteSpace: "nowrap"
                    }}
                  >
                    All ages
                  </td>

                  {/* All ages rows */}
                  <td className="border-r border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_cbc && <b>✓</b>} CBC w/ platelet count
                  </td>
                  <td className="border-r border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_cbc ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="p-1"></td>
                  </tr>

                  <tr>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_urinalysis && <b>✓</b>} Urinalysis
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_urinalysis ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  <tr>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_fecalysis && <b>✓</b>} Fecalysis
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_fecalysis ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  <tr>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_sputum_microscopy && <b>✓</b>} Sputum Microscopy
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_sputum_microscopy ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  <tr>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_creatine && <b>✓</b>} Creatinine
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_creatine ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  <tr>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_hba1c && <b>✓</b>} HbA1C
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_hba1c ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  {/* ---------- MANDATORY ---------- */}
                  <tr>
                  <td
                    rowSpan={7}
                    className="border-r border-t border-black align-middle text-center"
                    style={{
                    width: "8%",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    whiteSpace: "nowrap"
                    }}
                  >
                    mandatory
                  </td>

                  {/* ≥10 */}
                  <td className="border-r border-t border-black text-center align-middle" style={{ width: "8%" }}>
                    ≥10
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">Chest X-Ray</td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_chestxray ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  {/* ≥20 */}
                  <tr>
                  <td className="border-r border-t border-black text-center align-middle" style={{ width: "8%" }}>
                    ≥20
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">Pap smear</td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_papsmear ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  {/* ≥40 (3 rows) */}
                  <tr>
                  <td rowSpan={3} className="border-r border-t border-black text-center align-middle" style={{ width: "8%" }}>
                    ≥40
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_fbs && <b>✓</b>} FBS
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_fbs ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  <tr>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_oralglucose && <b>✓</b>} Oral Glucose
                    <br />
                    Tolerance Test
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_oralglucose ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  <tr>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_lipidprofile && <b>✓</b>} Lipid profile (Total Cholesterol, HDL and LDL Cholesterol, Triglycerides)
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_lipidprofile ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  {/* ≥50 */}
                  <tr>
                  <td className="border-r border-t border-black text-center align-middle" style={{ width: "8%" }}>
                    ≥50
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">Fecal Occult Blood</td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_fecal_occult_blood ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  {/* ≥60 */}
                  <tr>
                  <td className="border-r border-t border-black text-center align-middle" style={{ width: "8%" }}>
                    ≥60
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_ecg && <b>✓</b>} ECG
                  </td>
                  <td className="border-r border-t border-black p-1 text-md">
                    {consultation.philhealth_details?.lab_details?.is_ecg ? localDateFormatter(consultation.philhealth_details?.lab_details?.created_at) : ""}
                  </td>
                  <td className="border-t border-black p-1"></td>
                  </tr>

                  {/* Others */}
                  <tr>
                  <td colSpan={5} className="border-t border-black p-2">
                    <span className="font-bold">Others:</span>
                    <div className="mt-1 text-md">{consultation.philhealth_details?.lab_details?.others || ""}</div>
                  </td>
                  </tr>
                </tbody>
                </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
