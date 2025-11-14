// components/PhysicalExamTable.tsx

import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import PHIllnessTable from "../medicalhistory/past-medical-history";
import FamhistTable from "./family-history";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button/button";
import { toTitleCase } from "@/helpers/ToTitleCase";

export default function PhysicalExamTable({ consultation, patientData, examSections, isPhysicalExamLoading, phHistoryData, famHistoryData }: any) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Add helper variable for civil status
  const civilStatus = (consultation.philhealth_details?.civil_status || "").toUpperCase();

  const splitOptionsIntoColumns = (options: any[]) => {
    const midIndex = Math.ceil(options.length / 2);
    const firstColumn = options.slice(0, midIndex);
    const secondColumn = options.slice(midIndex);
    return { firstColumn, secondColumn };
  };

  const generatePDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [215.9, 330.2],
      });
      const imgWidth = 200;
      const pageHeight = 317;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 5;
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={generatePDF} variant="outline" disabled={isGeneratingPDF} className="flex gap-2 py-2 px-4 rounded border border-zinc-400">
          <Printer /> {isGeneratingPDF ? "Generating..." : "Print"}
        </Button>
      </div>

      <div ref={printRef}>
        <span className="font-bold text-black text-md pb-4">Individual Health Profile:</span>

        {/* First table - consistent borders with border-collapse */}
        <table className="w-full border-collapse border border-black mt-4">
          <tbody>
            <tr>
              <td className="w-1/4 border border-black pb-3 px-3 align-top">
                <div className="flex flex-col gap-2 pb-1 items-start">
                  <div className="flex">
                    <span>{consultation.philhealth_details?.iswith_atc === true ? "(✓)" : "( )"}</span>
                    <Label className="ml-2 mt-2 text-black">WALK-IN WITH ATC</Label>
                  </div>
                  <div className="flex items-center">
                    <span>{consultation.philhealth_details?.iswith_atc === false ? "(✓)" : "( )"}</span>
                    <Label className="ml-2 text-black">WALK-IN W/O ATC</Label>
                  </div>
                </div>
              </td>
              <td className="w-1/4 border border-black pb-1 px-2 align-top">
                <Label className="font-bold">Assessment Date: </Label>
                <span className="text-sm">{localDateFormatter(consultation.created_at)}</span>
              </td>
              <td className="w-1/4 border border-black pb-1 px-2 align-top">
                <Label className="font-bold">PIN: </Label>
                <span className="text-sm">{consultation.patrec_details?.patient_details?.additional_info?.philhealth_id?.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3") || ""}</span>
              </td>
              <td className="w-1/4 border border-black pb-3 px-3 align-top">
                <div className="flex flex-col pb-1 items-start">
                  <div className="flex">
                    <span>{consultation.philhealth_details?.dependent_or_member === "MEMBER" ? "(✓)" : "( )"}</span>
                    <Label className="ml-2 mt-2 text-black">Member</Label>
                  </div>
                  <div className="flex items-center">
                    <span>{consultation.philhealth_details?.dependent_or_member === "DEPENDENT" ? "(✓)" : "( )"}</span>
                    <Label className="ml-2 text-black">Dependent</Label>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="w-1/3 border-b border-black pb-1 px-2 align-top">
                <div className="flex flex-wrap items-center justify-between gap-8">
                  <div className="flex items-center">
                    <Label className="text-md font-bold mr-2">Name:</Label>
                    <span className="truncate py-2">{` ${toTitleCase(patientData?.personal_info?.per_lname)} ${toTitleCase(patientData?.personal_info?.per_fname)} ${toTitleCase(
                      patientData?.personal_info?.per_mname || ""
                    )} ${toTitleCase(patientData?.personal_info?.per_suffix || "")}`}</span>
                  </div>
                  <div className="flex gap-2 pb-1">
                    <div className="flex">
                      <span>{patientData.personal_info.per_sex?.toLowerCase() === "female" ? "(✓)" : "( )"}</span>
                      <Label className="ml-2 mt-2 text-black">Female</Label>
                    </div>
                    <div className="flex items-center">
                      <span>{patientData.personal_info.per_sex?.toLowerCase() === "male" ? "(✓)" : "( )"}</span>
                      <Label className="ml-2 text-black">Male</Label>
                    </div>
                  </div>
                  <div className="flex gap-2 pb-1">
                    <div className="flex items-center">
                      <span>{civilStatus === "SINGLE" ? "(✓)" : "( )"}</span>
                      <Label className="ml-2 text-black">Single</Label>
                    </div>
                    <div className="flex items-center">
                      <span>{civilStatus === "MARRIED" ? "(✓)" : "( )"}</span>
                      <Label className="ml-2 text-black">Married</Label>
                    </div>
                    <div className="flex items-center">
                      <span>{civilStatus === "WIDOWER" ? "(✓)" : "( )"}</span>
                      <Label className="ml-2 text-black">Widow/er</Label>
                    </div>
                    <div className="flex items-center">
                      <span>{!["SINGLE", "MARRIED", "WIDOWER"].includes(civilStatus) ? "(✓)" : "( )"}</span>
                      <Label className="ml-2 text-black">Others</Label>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/4 border-b border-black pb-1 px-2 align-top">
                <Label className="font-bold text-md">Sitio/Street</Label>: <span>{toTitleCase(patientData.address.add_sitio || "N/A")}</span>
              </td>
              <td className="w-1/4 border-l  border-b border-black pb-1 px-2 align-top">
                <Label className="font-bold text-md">Barangay</Label>: <span>{toTitleCase(patientData.address.add_barangay || "N/A")}</span>
              </td>
              <td className="w-1/4 border-l border-b border-black pb-1 px-2 align-top">
                <Label className="font-bold text-md">City/Municipality</Label>: <span>{toTitleCase(patientData.address.add_city || "N/A")}</span>
              </td>
              <td className="w-1/4 border-l  border-b border-black pb-1 px-2 align-top">
                <Label className="font-bold text-md">Province</Label>: <span>{toTitleCase(patientData.address.add_province || "Cebu")}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Age/Birthday/Contact table */}
        <table className="w-full ">
          <tbody>
            <tr>
              <td className="w-1/3 border-l border-b border-black pb-1 px-2 align-top">
                <Label className="font-bold text-md">Age</Label>: <span>{calculateAgeFromDOB(patientData.personal_info.per_dob, consultation.created_at).years} years old</span>
              </td>
              <td className="w-1/3 border-l  border-b border-black pb-1 px-2 align-top">
                <Label className="font-bold text-md">Birthday</Label>: <span>{patientData.personal_info.per_dob}</span>
              </td>
              <td className="w-1/3 border-l border-r border-b border-black pb-1 px-2 align-top">
                <Label className="font-bold text-md">Contact Number</Label>: <span>{patientData.personal_info.per_contact || "N/A"}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Headers table */}
        <table className="w-full">
          <tbody>
            <tr>
              <td className=" border-l border-b border-black pb-1 px-2 align-top">Pertinent Physical Examination</td>
              <td className=" border-l border-b border-black pb-1 px-2 align-top">Pertinent Findings Per System</td>
            </tr>
          </tbody>
        </table>

        {/* Main content table */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="align-top" style={{ width: "50%" }}>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-black pb-1 px-2">Blood Pressure</td>
                      <td className="border border-black pb-1 px-2">
                        <span className="underline">{consultation.vital_signs.vital_bp_diastolic}</span> / <span className="underline">{consultation.vital_signs.vital_bp_systolic}</span> mmHg
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black pb-1 px-2">Heart Rate</td>
                      <td className="border border-black pb-1 px-2">
                        <span className="underline">{consultation.vital_signs.vital_pulse}</span> /min
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black pb-1 px-2">Respiratory Rate</td>
                      <td className="border border-black pb-1 px-2">
                        <span className="underline">{consultation.vital_signs.vital_RR}</span> /min
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black pb-1 px-2">Height (cm)</td>
                      <td className="border border-black pb-1 px-2">
                        <span className="underline">
                          {parseFloat(consultation.bmi_details?.height ?? "0")
                            .toFixed(2)
                            .replace(/\.00$/, "")}
                        </span>{" "}
                        cm
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black pb-1 px-2">Weight (kg)</td>
                      <td className="border border-black pb-1 px-2">
                        <span className="underline">
                          {parseFloat(consultation.bmi_details?.weight ?? "0")
                            .toFixed(2)
                            .replace(/\.00$/, "")}
                        </span>{" "}
                        kg
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black pb-1 px-2">BMI</td>
                      <td className="border border-black pb-1 px-2">
                        <span className="underline">
                          {consultation.bmi_details?.weight && consultation.bmi_details?.height
                            ? (parseFloat(consultation.bmi_details.weight) / Math.pow(parseFloat(consultation.bmi_details.height) / 100, 2)).toFixed(2)
                            : "N/A"}
                        </span>{" "}
                        kg/m²
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black pb-1 px-2">Temperature</td>
                      <td className="border border-black pb-1 px-2">
                        <span className="underline">{consultation.vital_signs.vital_temp}</span> °C
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="w-full mt-1">
                  <FamhistTable famhistData={famHistoryData} isLoading={!famHistoryData} isError={false} />
                </div>
                <div className="w-full mt-1">
                  <PHIllnessTable phHistoryData={phHistoryData} isLoading={!phHistoryData} isError={false} />
                </div>
                <div className="border border-black pb-1 px-2 w-full mt-1">
                  <div>
                    <Label>LMP</Label>: <span className="underline">{consultation.philhealth_details?.obs_details?.obs_lmp || ""}</span>
                  </div>
                  <div className="ml-6">
                    <div>
                      <Label>OBS Score G</Label>: <span className="underline">{consultation.philhealth_details?.obs_details?.obs_gravida || 0}</span> <Label>P</Label>:{" "}
                      <span className="underline">{consultation.obs_details?.obs_para || 0}</span>
                    </div>
                    <div>
                      <Label>(TPAL)</Label>: <span className="underline">{consultation.philhealth_details?.obs_details?.obs_fullterm || 0}</span> -{" "}
                      <span className="underline">{consultation.philhealth_details?.obs_details?.obs_preterm || 0}</span> -{" "}
                      <span className="underline">{consultation.philhealth_details?.obs_details?.obs_abortion || 0}</span> -{" "}
                      <span className="underline">{consultation.philhealth_details?.obs_details?.obs_living_ch || 0}</span>
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
                <div className="border border-black pb-1 px-2 w-full mt-1">
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
                    <span className="underline px-2">{consultation.philhealth_details?.alcohol_bottles_per_day || "0"}</span>
                    <Label>bottles/day</Label>
                  </div>
                </div>
              </td>
              <td className="text-left align-top" style={{ width: "50%" }}>
                {!isPhysicalExamLoading && examSections.length > 0 && (
                  <div>
                    <table className="pe-table border-collapse border border-black w-full">
                      <tbody>
                        {examSections.map((section: any) => {
                          const { firstColumn, secondColumn } = splitOptionsIntoColumns(section.options);
                          return (
                            <tr key={section.pe_section_id}>
                              <td className="font-bold border border-black pb-1 px-2" style={{ width: "25%", verticalAlign: "top" }}>
                                {section.title}
                              </td>
                              <td className="border border-black pb-1 px-2" style={{ width: "37.5%", verticalAlign: "top" }}>
                                {firstColumn.map((option: any) => (
                                  <div key={option.pe_option_id} className={option.isSelected ? "pe-finding" : "pe-option"}>
                                    {option.isSelected ? "✓ " : "__"} {option.text}
                                  </div>
                                ))}
                              </td>
                              <td className="border border-black pb-1 px-2" style={{ width: "37.5%", verticalAlign: "top" }}>
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

                {/* Laboratory table */}
                <table className="w-full border-collapse border border-black mt-4 text-md">
                  <thead>
                    <tr>
                      <th colSpan={5} className="border-b border-black pb-1 px-2 font-bold text-left">
                        Laboratory request/s:
                      </th>
                    </tr>
                    <tr className="text-center">
                      <th className="border-r border-b border-black pb-1 w-8"></th>
                      <th className="border-r border-b border-black pb-1 w-8"></th>
                      <th className="border-r border-b border-black pb-1 px-2 w-54">Laboratory</th>
                      <th className="border-r border-b border-black pb-1 px-2 w-15">Date</th>
                      <th className="border-b border-black pb-1 px-2 w-15">Result/s</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td rowSpan={6} className="border-r border-black align-middle text-center px-1">
                        <div className="flex flex-col">
                          <span>as</span>
                          <span>required</span>
                        </div>
                      </td>
                      <td rowSpan={6} className="border-r border-black align-middle text-center text-md px-1">
                        All ages
                      </td>
                      <td className="border-r border-black p-1 text-md">{consultation.find_details?.lab_details?.is_cbc && <b>✓</b>} CBC w/ platelet count</td>
                      <td className="border-r border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_cbc ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_urinalysis && <b>✓</b>} Urinalysis</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_urinalysis ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_fecalysis && <b>✓</b>} Fecalysis</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_fecalysis ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_sputum_microscopy && <b>✓</b>} Sputum Microscopy</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_sputum_microscopy ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_creatine && <b>✓</b>} Creatinine</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_creatine ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_hba1c && <b>✓</b>} HbA1C</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_hba1c ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td rowSpan={7} className="border-r border-t border-black align-middle text-center px-1">
                        mandatory
                      </td>
                      <td className="border-r border-t border-black text-center align-middle w-8">≥10</td>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_chestxray && <b>✓</b>} Chest X-Ray</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_chestxray ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black text-center align-middle w-8">≥20</td>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_papsmear && <b>✓</b>} Pap smear</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_papsmear ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td rowSpan={3} className="border-r border-t border-black text-center align-middle w-8">
                        ≥40
                      </td>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_fbs && <b>✓</b>} FBS</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_fbs ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black p-1 text-md">
                        {consultation.find_details?.lab_details?.is_oralglucose && <b>✓</b>} Oral Glucose
                        <br />
                        Tolerance Test
                      </td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_oralglucose ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black p-1 text-md">
                        {consultation.find_details?.lab_details?.is_lipidprofile && <b>✓</b>} Lipid profile (Total Cholesterol, HDL and LDL Cholesterol, Triglycerides)
                      </td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_lipidprofile ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black text-center align-middle w-8">≥50</td>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_fecal_occult_blood && <b>✓</b>} Fecal Occult Blood</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_fecal_occult_blood ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td className="border-r border-t border-black text-center align-middle w-8">≥60</td>
                      <td className="border-r border-t border-black p-1 text-md">{consultation.find_details?.lab_details?.is_ecg && <b>✓</b>} ECG</td>
                      <td className="border-r border-t border-black p-1 text-sm">
                        {consultation.find_details?.lab_details?.is_ecg ? localDateFormatter(consultation.find_details?.lab_details?.created_at) : ""}
                      </td>
                      <td className="border-t border-black p-1"></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="border-t border-black pb-1 px-2">
                        <span className="font-bold">Others:</span>
                        <div className="mt-1 text-md">{consultation.find_details?.lab_details?.others || ""}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
