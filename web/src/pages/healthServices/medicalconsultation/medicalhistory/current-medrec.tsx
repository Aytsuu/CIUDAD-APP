import { useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Printer, Stethoscope } from "lucide-react";
import { usePhysicalExamQueries } from "../../doctor/medical-con/queries.tsx/fetch";
import PhysicalExamTable from "./philhealth-display";
import { useMedConPHHistory, useFamHistory } from "../queries/fetch";
import { ConsultationHistoryTable } from "./table-history";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toTitleCase } from "@/helpers/ToTitleCase";

interface CurrentConsultationCardProps {
  consultation: any;
  patientData: any;
  currentConsultationId: number | undefined;
  className?: string;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric"
  };
  return date.toLocaleDateString("en-US", options);
};

// Tab component
const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
    {children}
  </button>
);

export default function CurrentConsultationCard({ consultation, patientData, currentConsultationId, className = "" }: CurrentConsultationCardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"medical" | "philhealth" | "history">("medical");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const bhw = `${consultation?.staff_details?.rp?.per?.per_fname || ""} ${consultation?.staff_details?.rp?.per?.per_lname || ""} ${consultation?.staff_details?.rp?.per?.per_mname || ""} ${consultation?.staff_details?.rp?.per?.per_suffix || ""}`;
  const { sectionsQuery, optionsQuery } = usePhysicalExamQueries();
  const isPhysicalExamLoading = sectionsQuery.isLoading || optionsQuery.isLoading;
  const { data: phHistoryData } = useMedConPHHistory(patientData?.pat_id || "");
  const { data: famHistoryData } = useFamHistory(patientData?.pat_id || "");

  console.log("consultation data:", consultation);

  // Get selected physical exam option IDs from the consultation data
  const selectedPhysicalExamOptions = useMemo(() => {
    if (!consultation?.find_details?.pe_results) {
      console.log("No PE results found in consultation");
      return [];
    }

    const selectedIds = consultation.find_details.pe_results.map((result: any) => {
      console.log("PE Result:", result);
      return result.pe_option;
    });

    console.log("Selected PE option IDs:", selectedIds);
    return selectedIds;
  }, [consultation]);

  // Process exam sections to match original format
  const examSections = useMemo(() => {
    if (!sectionsQuery.data || !optionsQuery.data) {
      console.log("No sections or options data available");
      return [];
    }

    console.log("All PE options from database:", optionsQuery.data);

    const sections = sectionsQuery.data.map((section: any) => ({
      pe_section_id: section.pe_section_id,
      title: section.title,
      options: []
    }));
    // Group all options by section and mark which ones are selected
    optionsQuery.data.forEach((option: any) => {
      const section = sections.find((s: any) => s.pe_section_id === option.pe_section);
      if (section) {
        // Convert both to numbers for comparison to avoid type issues
        const isSelected = selectedPhysicalExamOptions.includes(Number(option.pe_option_id));
        console.log(`Option ${option.pe_option_id} (${option.text}) is selected: ${isSelected}`);

        section.options.push({
          pe_option_id: option.pe_option_id,
          text: option.text,
          isSelected: isSelected
        });
      }
    });
    console.log("Processed exam sections:", sections);
    return sections;
  }, [sectionsQuery.data, optionsQuery.data, selectedPhysicalExamOptions]);

  const generatePDF = async () => {
    if (!printRef.current) return;

    setIsGeneratingPDF(true);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [215.9, 330.2] // Long bond paper size (8.5 x 13 inches)
      });

      const imgWidth = 190; // mm
      const pageHeight = 320; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Instead of saving, open in new tab
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      // Clean up the URL object after use
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Medical Consultation Content
  const MedicalConsultationContent = () => (
    <div>
      <h3 className="text-base sm:text-lg md:text-xl font-bold text-center mb-6 sm:mb-8 md:mb-10">PATIENT RECORD</h3>

      <div className="space-y-6 sm:space-y-8">
        {/* Patient Information Section */}
        {/* Row 1: Name and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Name:</span>
            <div className="border-b border-black flex-1 min-w-0 pb-1">
                <span className="text-sm ">{toTitleCase(`${patientData?.personal_info?.per_lname} ${patientData?.personal_info?.per_fname} ${patientData?.personal_info?.per_mname || ""} ${patientData?.personal_info?.per_suffix || ""}`)}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Date:</span>
            <div className="border-b border-black flex-1 pb-1">
              <span className="text-sm">{formatDate(consultation?.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Age, Sex, and Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Age:</span>
            <div className="border-b border-black flex-1 pb-1">
              <span className="text-sm">{patientData?.personal_info?.per_dob && consultation?.created_at ? Math.floor((new Date(consultation.created_at).getTime() - new Date(patientData.personal_info.per_dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : "N/A"}</span>
            </div>
            <span className="font-bold text-black text-sm sm:ml-4">Sex:</span>
            <div className="border-b border-black flex-1 pb-1">
              <span className="text-sm">{patientData?.personal_info?.per_sex}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Date of Birth:</span>
            <div className="border-b border-black flex-1 pb-1">
              <span className="text-sm ">{patientData?.personal_info?.per_dob}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Address and BHW Assigned */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Address:</span>
            <div className="border-b border-black flex-1 min-w-0 pb-1">
            <span className="text-sm ">{toTitleCase(patientData?.addressFull)}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">BHW Assigned:</span>
            <div className="border-b border-black flex-1 pb-1">
                <span className="text-sm ">{toTitleCase(bhw)}</span>
            </div>
          </div>
        </div>

        {/* Vital Signs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Column - BP, RR, HR, Temperature */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-baseline gap-2 flex-1 pb-1">
                <span className="font-bold text-black text-sm">BP:</span>
                <div className="border-b border-black flex-1 pb-1">
                  <span className="text-sm">{consultation?.vital_signs ? `${consultation.vital_signs.vital_bp_systolic}/${consultation.vital_signs.vital_bp_diastolic}` : "N/A"}</span>
                </div>
                <span className="text-black text-sm">mmHg</span>
              </div>
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm">RR:</span>
                <div className="border-b border-black flex-1 pb-1">
                  <span className="text-sm">{consultation?.vital_signs ? consultation.vital_signs.vital_RR : "N/A"}</span>
                </div>
                <span className="text-black text-sm">cpm</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm">HR:</span>
                <div className="border-b border-black flex-1 pb-1">
                  <span className="text-sm">{consultation?.vital_signs?.vital_pulse || "N/A"}</span>
                </div>
                <span className="text-black text-sm">bpm</span>
              </div>
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm">Temperature:</span>
                <div className="border-b border-black flex-1 pb-1">
                  <span className="text-sm">{consultation?.vital_signs?.vital_temp || "N/A"}</span>
                </div>
                <span className="text-black text-sm">°C</span>
              </div>
            </div>
          </div>
          {/* Right Column - WT, HT */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-black text-sm">WT:</span>
              <div className="border-b border-black flex-1 pb-1">
                <span className="text-sm">
                  {parseFloat(consultation?.bmi_details?.weight ?? "0")
                    .toFixed(2)
                    .replace(/\.00$/, "")}
                </span>
              </div>
              <span className="text-black text-sm">kg</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-black text-sm pb-1">HT:</span>
              <div className="border-b border-black flex-1">
                <span className="text-sm pb-1">
                  {parseFloat(consultation?.bmi_details?.height ?? "0")
                    .toFixed(2)
                    .replace(/\.00$/, "")}
                </span>
              </div>
              <span className="text-black text-sm">cm</span>
            </div>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm sm:min-w-[120px]">Chief of Complaint:</span>
            <div className="border-b border-black flex-1 min-w-0 pb-1">
              <span className="text-sm">{consultation?.medrec_chief_complaint}</span>
            </div>
          </div>
        </div>

        {/* History and Treatment Section */}
        <div className="py-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* History of Present Illness/Findings */}
            <div className="border border-black py-4">
              <h5 className="text-md font-bold mb-2 text-center border-b border-black pb-4">History of Present Illness/Findings</h5>
              <div className="space-y-3 px-3">
                <div>
                  <span className="font-bold text-black text-sm">Subjective Summary:</span>
                  <div className="text-sm mt-1">{consultation?.find_details?.subj_summary}</div>
                </div>
                <div>
                  <span className="font-bold text-black text-sm">Objective Summary:</span>
                  <div className="text-sm mt-1">
                    {(() => {
                      const lines = consultation?.find_details?.obj_summary?.split("-") || [];
                      const grouped: { [key: string]: string[] } = {};

                      // Group by keyword (part before colon)
                      lines.forEach((line: string) => {
                        const trimmed = line.trim();
                        if (trimmed) {
                          const colonIndex = trimmed.indexOf(":");
                          if (colonIndex > -1) {
                            const keyword = trimmed.substring(0, colonIndex).trim();
                            const value = trimmed.substring(colonIndex + 1).trim();
                            if (!grouped[keyword]) {
                              grouped[keyword] = [];
                            }
                            grouped[keyword].push(value);
                          } else {
                            // If no colon, treat as standalone item
                            if (!grouped["Other"]) {
                              grouped["Other"] = [];
                            }
                            grouped["Other"].push(trimmed);
                          }
                        }
                      });

                      // Render grouped items
                      return Object.entries(grouped).map(([keyword, values], index) => <div key={index}>{keyword !== "Other" ? `${keyword}: ${values.join(", ")}` : values.join(", ")}</div>);
                    })()}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-black text-sm">Diagnosis:</span>
                  <div className="text-sm mt-1">
                    {consultation?.find_details?.assessment_summary?.split(",").map((item: any, index: any) => (
                      <div key={index}>{item.trim()}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Plan/Treatment */}
            <div className="border border-black py-4">
              <h5 className="text-md font-bold mb-2 text-center border-b border-black pb-4">Plan Treatment</h5>
              <div className="space-y-2 px-3">
                <div>
                  <div className="text-sm mt-1">
                    {consultation?.find_details?.plantreatment_summary?.split("-").map((item: any, index: any) => (
                      <div key={index}>{item.trim()}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // PhilHealth Content
  const PhilHealthContent = () => (
    <div>
      <PhysicalExamTable consultation={consultation} patientData={patientData} examSections={examSections} isPhysicalExamLoading={isPhysicalExamLoading} phHistoryData={phHistoryData} famHistoryData={famHistoryData} isLoading={!phHistoryData} isError={false} />
    </div>
  );

  // Consultation History Content
  const ConsultationHistoryContent = () => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Stethoscope className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-gray-900">Consultation History</h2>
          <p className="text-sm text-gray-600">Previous medical consultations and records</p>
        </div>
      </div>

      <ConsultationHistoryTable patientId={patientData?.pat_id} currentConsultationId={currentConsultationId} />
    </div>
  );

  return (
    <div className={`bg-white ${className}`}>
      {/* Tabs Navigation */}
      <div className="tabs-container no-print border-b border-gray-200 mb-6">
        <div className="flex space-x-4">
          <TabButton active={activeTab === "medical"} onClick={() => setActiveTab("medical")}>
            Current Medical Consultation
          </TabButton>
          {consultation.is_phrecord === true && (
            <TabButton active={activeTab === "philhealth"} onClick={() => setActiveTab("philhealth")}>
              PhilHealth
            </TabButton>
          )}
          <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
            Consultation History
          </TabButton>
        </div>
      </div>

      {/* Print Button - Moved OUTSIDE the printRef */}
      {activeTab === "medical" && (
        <div className="no-print mb-4 flex justify-end gap-2">
          <Button onClick={generatePDF} variant="outline" disabled={isGeneratingPDF} className="flex gap-2 py-2 px-4 rounded border border-zinc-400">
            <Printer /> {isGeneratingPDF ? "Generating..." : "Print"}
          </Button>
        </div>
      )}

      {/* Content to be printed - This should ONLY contain what you want in the PDF */}
      <div ref={printRef}>
        {/* Tab Content */}
        <div className="print-section">
          {activeTab === "medical" && <MedicalConsultationContent />}
          {activeTab === "philhealth" && consultation.is_phrecord === true && <PhilHealthContent />}
          {activeTab === "history" && <ConsultationHistoryContent />}
        </div>

        {/* Print version shows all sections */}
        <div className="hidden print:block">
          <div className="mb-8">
            <h4 className="font-bold text-lg mb-4">Current Medical Consultation</h4>
            <MedicalConsultationContent />
          </div>

          {consultation.is_phrecord === true && (
            <div className="mb-8">
              <h4 className="font-bold text-lg mb-4">PhilHealth</h4>
              <PhilHealthContent />
            </div>
          )}

          <div>
            <h4 className="font-bold text-lg mb-4">Consultation History</h4>
            <ConsultationHistoryContent />
          </div>
        </div>
      </div>
    </div>
  );
}