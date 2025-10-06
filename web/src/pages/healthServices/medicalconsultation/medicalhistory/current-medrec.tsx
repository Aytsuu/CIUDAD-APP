import { format } from "date-fns";
import { MedicalConsultationHistory } from "../types";
import { useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { Printer } from "lucide-react";

interface PatientData {
  pat_id: string;
  personal_info: {
    per_fname: string;
    per_lname: string;
    per_sex: string;
    per_dob: string;
  };
  addressFull: string;
}

interface CurrentConsultationCardProps {
  consultation: MedicalConsultationHistory;
  patientData: PatientData;
  className?: string;
}

export default function CurrentConsultationCard({
  consultation,
  patientData,
  className = "",
}: CurrentConsultationCardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const bhw = `${consultation.staff_details?.rp?.per?.per_fname || ""} ${consultation.staff_details?.rp?.per?.per_lname || ""} ${consultation.staff_details?.rp?.per?.per_mname || ""} ${consultation.staff_details?.rp?.per?.per_suffix || ""}`;
  console.log("BHW Assigned:", bhw);

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
              line-height: 1.2;
              color: black;
            }

            /* Typography */
            h3 {
              font-size: 10pt;
              font-weight: bold;
              color: black;
              text-align: center;
              margin-bottom: 8pt;
            }

            h5 {
              font-size: 9pt;
              font-weight: bold;
              margin-bottom: 4pt;
              text-align: center;
              padding-bottom: 8pt;
            }

            span {
              font-size: 8pt;
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

            .mt-1 {
              margin-top: 4pt;
            }

            .mt-4 {
              margin-top: 16pt;
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

            /* Responsive behavior for print */
            .sm\\:grid-cols-2 {
              grid-template-columns: 1fr 1fr;
            }

            .sm\\:flex-row {
              flex-direction: row;
            }

          

          

            .sm\\:ml-4 {
              margin-left: 16pt;
            }

            .sm\\:space-y-8 > * + * {
              margin-top: 15pt;
            }

            .sm\\:mb-8 {
              margin-bottom: 32pt;
            }

            .sm\\:mb-10 {
              margin-bottom: 40pt;
            }

            /* Hide print button */
            .no-print {
              display: none;
            }

            button {
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

  return (
    <div className={`bg-white ${className}`}>
      {/* Print Button */}
      <div className="no-print mb-4 flex justify-end">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex gap-2 py-2 px-4 rounded border border-zinc-400"
        >
          <Printer /> Print
        </Button>
      </div>

      {/* Content to be printed */}
      <div ref={printRef}>
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
          PATIENT RECORD
        </h3>

        {/* Patient Information Section */}
        <div className="space-y-6 sm:space-y-8">
          {/* Row 1: Name and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row items-baseline gap-2">
              <span className="font-bold text-black text-sm ">
                Name:
              </span>
              <div className="border-b border-black flex-1 min-w-0">
                <span className="text-sm truncate">
                  {`${patientData?.personal_info?.per_fname} ${patientData?.personal_info?.per_lname}`}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-baseline gap-2">
              <span className="font-bold text-black text-sm ">
                Date:
              </span>
              <div className="border-b border-black flex-1">
                <span className="text-sm">
                  {consultation.created_at ? format(new Date(consultation.created_at), "MMM d, yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Age, Sex, and Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row items-baseline gap-2">
              <span className="font-bold text-black text-sm ">
                Age:
              </span>
              <div className="border-b border-black flex-1">
                <span className="text-sm">{consultation.medrec_age}</span>
              </div>
              <span className="font-bold text-black text-sm  sm:ml-4">
                Sex:
              </span>
              <div className="border-b border-black flex-1">
                <span className="text-sm">
                  {patientData.personal_info.per_sex}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-baseline gap-2">
              <span className="font-bold text-black text-sm ">
                Date of Birth:
              </span>
              <div className="border-b border-black flex-1">
                <span className="text-sm">
                  {patientData.personal_info.per_dob}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Address and BHW Assigned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row items-baseline gap-2">
              <span className="font-bold text-black text-sm ">
                Address:
              </span>
              <div className="border-b border-black flex-1 min-w-0">
                <span className="text-sm line-clamp-2">
                  {patientData.addressFull}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-baseline gap-2">
              <span className="font-bold text-black text-sm ">
                BHW Assigned:
              </span>
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
                <div className="flex items-baseline gap-2  flex-1">
                  <span className="font-bold text-black text-sm ">
                    BP:
                  </span>
                  <div className="border-b border-black flex-1">
                    <span className="text-sm">
                      {consultation.vital_signs ? `${consultation.vital_signs.vital_bp_systolic}/${consultation.vital_signs.vital_bp_diastolic}` : "N/A"}
                    </span>
                  </div>
                  <span className="text-black text-sm">mmHg</span>
                </div>
                <div className="flex items-baseline gap-2 flex-1">
                  <span className="font-bold text-black text-sm ">
                    RR:
                  </span>
                  <div className="border-b border-black flex-1">
                    <span className="text-sm">
                      {consultation.vital_signs ? consultation.vital_signs.vital_RR : "N/A"}
                    </span>
                  </div>
                  <span className="text-black text-sm">cpm</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-baseline gap-2  flex-1">
                  <span className="font-bold text-black text-sm ">
                    HR:
                  </span>
                  <div className="border-b border-black flex-1">
                    <span className="text-sm">
                      {consultation.vital_signs?.vital_pulse || "N/A"}
                    </span>
                  </div>
                  <span className="text-black text-sm">bpm</span>
                </div>
                <div className="flex items-baseline gap-2 flex-1">
                  <span className="font-bold text-black text-sm ">
                    Temperature:
                  </span>
                  <div className="border-b border-black flex-1">
                    <span className="text-sm">
                      {consultation.vital_signs?.vital_temp || "N/A"}
                    </span>
                  </div>
                  <span className="text-black text-sm">°C</span>
                </div>
              </div>
            </div>

            {/* Right Column - WT, HT */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-black text-sm ">
                  WT:
                </span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">
                    {parseFloat(consultation.bmi_details?.weight ?? "0").toFixed(2).replace(/\.00$/, "")}
                  </span>
                </div>
                <span className="text-black text-sm">kg</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-black text-sm ">
                  HT:
                </span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">
                      {parseFloat(consultation.bmi_details?.height ?? "0").toFixed(2).replace(/\.00$/, "")}
                  </span>
                </div>
                <span className="text-black text-sm">cm</span>
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row items-baseline gap-2">
              <span className="font-bold text-black text-sm sm:min-w-[120px]">
                Chief of Complaint:
              </span>
              <div className="border-b border-black flex-1 min-w-0">
                <span className="text-sm">
                  {consultation.medrec_chief_complaint}
                </span>
              </div>
            </div>
          </div>

          <div className="py-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* History of Present Illness/Findings */}
              <div className="border border-black py-4">
                <h5 className="text-md font-bold mb-2 text-center border-b border-black pb-4">
                  History of Present Illness/Findings
                </h5>
                <div className="space-y-2 p-4">
                  <div>
                    <span className="font-bold text-black text-sm">
                      Subjective Summary:
                    </span>
                    <div className="text-sm mt-1">
                      {consultation.find_details?.subj_summary}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-black text-sm">
                      Objective Summary:
                    </span>
                    <div className="text-sm mt-1">
                      {consultation.find_details?.obj_summary
                        ?.split("-")
                        .map((line: any, index: any) => (
                          <div key={index}>{line.trim()}</div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-black text-sm">
                      Diagnosis:
                    </span>
                    <div className="text-sm mt-1">
                      {consultation.find_details?.assessment_summary
                        ?.split(",")
                        .map((item: any, index: any) => (
                          <div key={index}>{item.trim()}</div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan/Treatment */}
              <div className="border border-black py-4">
                <h5 className="text-md font-bold mb-2 text-center border-b border-black pb-4">
                  Plan Treatment
                </h5>
                <div className="space-y-2 p-4">
                  <div>
                    <div className="text-sm mt-1">
                      {consultation.find_details?.plantreatment_summary
                        ?.split("-")
                        .map((item, index) => (
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
    </div>
  );
}