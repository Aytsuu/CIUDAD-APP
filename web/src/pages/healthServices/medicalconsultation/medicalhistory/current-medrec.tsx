import { useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Printer,Stethoscope } from "lucide-react";
import { usePhysicalExamQueries } from "../../doctor/medical-con/queries.tsx/fetch";
import PhysicalExamTable from "./philhealth-display";
import { useMedConPHHistory, useFamHistory } from "../queries/fetchQueries";
import { ConsultationHistoryTable } from "./table-history";
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
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    {children}
  </button>
);

export default function CurrentConsultationCard({ 
  consultation, 
  patientData, 
  currentConsultationId,
  className = "" 
}: CurrentConsultationCardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"medical" | "philhealth" | "history">("medical");
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

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = printRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Record</title>
          <style>
            @page {
              size: 8.5in 13in;
              margin: 0.5in;
            }
            * {
              box-sizing: border-box;
            }
            body {
              background: white;
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 9pt;
              line-height: 1.3;
              color: black;
            }
            /* Typography */
            h3 {
              font-size: 12pt;
              font-weight: bold;
              color: black;
              text-align: center;
              margin-bottom: 12pt;
              text-transform: uppercase;
            }
            h5 {
              font-size: 10pt;
              font-weight: bold;
              margin-bottom: 6pt;
              text-align: center;
              padding-bottom: 4pt;
            }
            span {
              font-size: 9pt;
            }
            /* Layout Classes */
            .grid {
              display: grid;
            }
            .grid-cols-1 {
              grid-template-columns: 1fr;
            }
            .grid-cols-2 {
              grid-template-columns: 1fr 1fr;
              gap: 16pt;
            }
            .flex {
              display: flex;
            }
            .flex-col {
              flex-direction: column;
            }
            .flex-row {
              flex-direction: row;
            }
            .items-baseline {
              align-items: baseline;
            }
            .gap-2 > * + * {
              margin-left: 4pt;
            }
            .flex-1 {
              flex: 1;
            }
            .min-w-0 {
              min-width: 0;
            }
            /* Spacing */
            .space-y-4 > * + * {
              margin-top: 16pt;
            }
            .space-y-2 > * + * {
              margin-top: 8pt;
            }
            .space-y-3 > * + * {
              margin-top: 12pt;
            }
            /* Margins */
            .mb-6 {
              margin-bottom: 24pt;
            }
            .mb-8 {
              margin-bottom: 32pt;
            }
            .mb-10 {
              margin-bottom: 40pt;
            }
            .mb-2 {
              margin-bottom: 8pt;
            }
            .mb-3 {
              margin-bottom: 12pt;
            }
            .mt-1 {
              margin-top: 4pt;
            }
            .mt-4 {
              margin-top: 16pt;
            }
            .mt-6 {
              margin-top: 24pt;
            }
            .p-4 {
              padding: 16pt;
            }
            .py-4 {
              padding-top: 16pt;
              padding-bottom: 16pt;
            }
            .pb-4 {
              padding-bottom: 16pt;
            }
            .pt-2 {
              padding-top: 8pt;
            }
            .px-3 {
              padding-left: 12pt;
              padding-right: 12pt;
            }
            /* Text styles */
            .font-bold {
              font-weight: bold;
            }
            .text-center {
              text-align: center;
            }
            .text-sm {
              font-size: 8pt;
            }
            .text-black {
              color: black;
            }
            .truncate {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .line-clamp-2 {
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            /* Borders */
            .border-b {
              border-bottom: 1px solid black;
            }
            .border {
              border: 1px solid black;
            }
            .border-black {
              border-color: black;
            }
            /* Physical Exam Styles */
            .pe-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8pt;
            }
            .pe-table th,
            .pe-table td {
              border: 1px solid black;
              padding: 4pt;
              text-align: left;
              font-size: 8pt;
              vertical-align: top;
            }
            .pe-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .pe-finding {
              background-color: #f0f9ff;
              color: #0369a1;
              margin-bottom: 2pt;
              padding: 1pt 2pt;
              border-radius: 2pt;
              display: block;
            }
            .pe-option {
              margin-bottom: 2pt;
              padding: 1pt 2pt;
              display: block;
              font-size: 8pt;
            }
            .pe-no-findings {
              color: #666;
              font-style: italic;
              font-size: 8pt;
            }
            .pe-option-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8pt;
              width: 100%;
            }
            .pe-option-column {
              display: flex;
              flex-direction: column;
            }
            /* Hide print button and tabs */
            .no-print {
              display: none;
            }
            button {
              display: none;
            }
            .tabs-container {
              display: none;
            }
            /* Page breaks */
            .print-section {
              page-break-inside: avoid;
              margin-bottom: 8pt;
            }
            /* Ensure proper width distribution */
            .w-full {
              width: 100%;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Medical Consultation Content
  const MedicalConsultationContent = () => (
    <div>
      {/* Print Button - Only shown in medical consultation tab */}
      <div className="no-print mb-4 flex justify-end gap-2">
        <Button onClick={handlePrint} variant="outline" className="flex gap-2 py-2 px-4 rounded border border-zinc-400">
          <Printer /> Print
        </Button>
      </div>

      <h3 className="text-base sm:text-lg md:text-xl font-bold text-center mb-6 sm:mb-8 md:mb-10">PATIENT RECORD</h3>

      <div className="space-y-6 sm:space-y-8">
        {/* Patient Information Section */}
        {/* Row 1: Name and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Name:</span>
            <div className="border-b border-black flex-1 min-w-0">
              <span className="text-sm truncate">{` ${patientData?.personal_info?.per_lname} ${patientData?.personal_info?.per_fname} ${patientData?.personal_info?.per_mname || ""} ${patientData?.personal_info?.per_suffix || ""}`}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Date:</span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">{formatDate(consultation?.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Age, Sex, and Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Age:</span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">{patientData?.personal_info?.per_dob && consultation?.created_at ? Math.floor((new Date(consultation.created_at).getTime() - new Date(patientData.personal_info.per_dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : "N/A"}</span>
            </div>
            <span className="font-bold text-black text-sm sm:ml-4">Sex:</span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">{patientData?.personal_info?.per_sex}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Date of Birth:</span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">{patientData?.personal_info?.per_dob}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Address and BHW Assigned */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">Address:</span>
            <div className="border-b border-black flex-1 min-w-0">
              <span className="text-sm line-clamp-2">{patientData?.addressFull}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm">BHW Assigned:</span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">{bhw}</span>
            </div>
          </div>
        </div>

        {/* Vital Signs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Column - BP, RR, HR, Temperature */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm">BP:</span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">{consultation?.vital_signs ? `${consultation.vital_signs.vital_bp_systolic}/${consultation.vital_signs.vital_bp_diastolic}` : "N/A"}</span>
                </div>
                <span className="text-black text-sm">mmHg</span>
              </div>
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm">RR:</span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">{consultation?.vital_signs ? consultation.vital_signs.vital_RR : "N/A"}</span>
                </div>
                <span className="text-black text-sm">cpm</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm">HR:</span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">{consultation?.vital_signs?.vital_pulse || "N/A"}</span>
                </div>
                <span className="text-black text-sm">bpm</span>
              </div>
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm">Temperature:</span>
                <div className="border-b border-black flex-1">
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
              <div className="border-b border-black flex-1">
                <span className="text-sm">
                  {parseFloat(consultation?.bmi_details?.weight ?? "0")
                    .toFixed(2)
                    .replace(/\.00$/, "")}
                </span>
              </div>
              <span className="text-black text-sm">kg</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-black text-sm">HT:</span>
              <div className="border-b border-black flex-1">
                <span className="text-sm">
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
            <div className="border-b border-black flex-1 min-w-0">
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
      <PhysicalExamTable 
        consultation={consultation} 
        patientData={patientData} 
        examSections={examSections} 
        isPhysicalExamLoading={isPhysicalExamLoading} 
        phHistoryData={phHistoryData} 
        famHistoryData={famHistoryData}
        isLoading={!phHistoryData} 
        isError={false} 
      />
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

      <ConsultationHistoryTable 
        patientId={patientData?.pat_id}
        currentConsultationId={currentConsultationId}
      />
    </div>
  );

  return (
    <div className={`bg-white ${className}`}>
      {/* Tabs Navigation */}
      <div className="tabs-container no-print border-b border-gray-200 mb-6">
        <div className="flex space-x-4">
          <TabButton 
            active={activeTab === "medical"} 
            onClick={() => setActiveTab("medical")}
          >
            Current Medical Consultation
          </TabButton>
          <TabButton 
            active={activeTab === "philhealth"} 
            onClick={() => setActiveTab("philhealth")}
          >
            PhilHealth
          </TabButton>
          <TabButton 
            active={activeTab === "history"} 
            onClick={() => setActiveTab("history")}
          >
            Consultation History
          </TabButton>
        </div>
      </div>

      {/* Content to be printed */}
      <div ref={printRef}>
        {/* Tab Content */}
        <div className="print-section">
          {activeTab === "medical" && <MedicalConsultationContent />}
          {activeTab === "philhealth" && <PhilHealthContent />}
          {activeTab === "history" && <ConsultationHistoryContent />}
        </div>

        {/* Print version shows all sections */}
        <div className="hidden print:block">
          <div className="mb-8">
            <h4 className="font-bold text-lg mb-4">Current Medical Consultation</h4>
            <MedicalConsultationContent />
          </div>
          <div className="mb-8">
            <h4 className="font-bold text-lg mb-4">PhilHealth</h4>
            <PhilHealthContent />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Consultation History</h4>
            <ConsultationHistoryContent />
          </div>
        </div>
      </div>
    </div>
  );
}