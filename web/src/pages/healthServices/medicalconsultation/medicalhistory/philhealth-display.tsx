// components/PhysicalExamTable.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import PHIllnessTable from "../medicalhistory/past-medical-history";

interface PhysicalExamTableProps {
  consultation: any;
  examSections: any[];
  isPhysicalExamLoading: boolean;
}

export default function PhysicalExamTable({ consultation, patientData, examSections, isPhysicalExamLoading,phHistoryData, isLoading, isError  }: any) {
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
                  <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.iswith_atc === true ? "bg-black" : "bg-white"}`}>{consultation.iswith_atc === true && <Check className="h-4 w-4 text-white" />}</div>
                  <Label className="ml-2 text-black">WALK-IN WITH ATC</Label>
                </div>

                {/* Walk-In WITHOUT ATC - Checked when false */}
                <div className="flex items-center">
                  <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.iswith_atc === false ? "bg-black" : "bg-white"}`}>{consultation.iswith_atc === false && <Check className="h-4 w-4 text-white" />}</div>
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
              <span className="text-sm">{consultation.pat_details?.additional_info?.philhealth_id || ""}</span>
            </td>
            <td className="w-1/4 border border-black p-2 align-top">
              <div className="flex flex-col gap-2">
                {/* Member - Checked when true */}
                <div className="flex items-center">
                  <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.dependent_or_member === "member" ? "bg-black" : "bg-white"}`}>{consultation.dependent_or_member === "member" && <Check className="h-4 w-4 text-white" />}</div>
                  <Label className="ml-2 text-black">Member</Label>
                </div>

                {/* Dependent - Checked when true */}
                <div className="flex items-center">
                  <div className={`h-5 w-5 border border-black flex items-center justify-center ${consultation.dependent_or_member === "dependent" ? "bg-black" : "bg-white"}`}>{consultation.dependent_or_member === "dependent" && <Check className="h-4 w-4 text-white" />}</div>
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
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${patientData.personal_info.per_sex?.toLowerCase() === "female" ? "bg-black" : "bg-white"}`}>{patientData.personal_info.per_sex?.toLowerCase() === "female" && <Check className="h-4 w-4 text-white" />}</div>
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
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${patientData.personal_info.marital_status === "Single" ? "bg-black" : "bg-white"}`}>{patientData.personal_info.marital_status === "Single" && <Check className="h-4 w-4 text-white" />}</div>
                    <Label className="ml-2 text-black">Single</Label>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${patientData.personal_info.marital_status === "Married" ? "bg-black" : "bg-white"}`}>{patientData.personal_info.marital_status === "Married" && <Check className="h-4 w-4 text-white" />}</div>
                    <Label className="ml-2 text-black">Married</Label>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${patientData.personal_info.marital_status === "Widow/er" ? "bg-black" : "bg-white"}`}>{patientData.personal_info.marital_status === "Widow/er" && <Check className="h-4 w-4 text-white" />}</div>
                    <Label className="ml-2 text-black">Widow/er</Label>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-5 w-5 border border-black flex items-center justify-center ${patientData.personal_info.marital_status === "Others" ? "bg-black" : "bg-white"}`}>{patientData.personal_info.marital_status === "Others" && <Check className="h-4 w-4 text-white" />}</div>
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

      <table className="w-full border border-black">
        <tbody>
          <tr>
            <td className="border border-black p-2 text-left align-top" style={{ width: "50%" }}>
              <table className="w-full border-collapse">
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

              <table>
                <div className="mb-6 w-full">
                  <PHIllnessTable phHistoryData={phHistoryData} isLoading={!phHistoryData} isError={false} />
                </div>
              </table>
            </td>

            <td className="border border-black p-2 text-left align-top" style={{ width: "50%" }}>
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
