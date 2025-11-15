import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Download, Loader2 } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useHealthProfilingSummary } from "./queries/fetchQueries";
import type { HealthProfilingSummaryData } from "./summary-types";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";

export default function HealthProfilingSummaryReport() {
  const location = useLocation();
  const state = location.state as {
    year: string;
  };

  const { showLoading, hideLoading } = useLoading();
  const printRef = useRef<HTMLDivElement>(null);
  const { year } = state || {};

  const { data: reportResponse, isLoading, error } = useHealthProfilingSummary(year, "all");
  const reportData: HealthProfilingSummaryData | null = reportResponse?.data || null;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch health profiling summary");
    }
  }, [error]);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Health_Profiling_Summary_${year}`,
    pageStyle: `
      @page {
        size: legal;
        margin: 0.4in 0.6in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        * {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  // Export as PDF handler
  const handleExportPdf = async () => {
    if (!printRef.current) return;
    try {
      showLoading();
      const element = printRef.current;
      const filename = `Health_Profiling_Summary_${year || "all"}.pdf`;

      const opt = {
        margin: [0.4, 0.6, 0.4, 0.6],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "in", format: "legal", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      } as const;

      await html2pdf().set(opt as any).from(element).save(filename);
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      hideLoading();
    }
  };

  if (isLoading) {
    return (
      <LayoutWithBack title="Health Profiling Summary" description="Loading report data...">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </LayoutWithBack>
    );
  }

  return (
    <LayoutWithBack
      title={`Health Profiling Summary - ${year}`}
      description="Barangay San Roque, Ciudad - Comprehensive health profiling summary"
    >
      <div className="space-y-6">
        {/* Action Buttons - No Print */}
        <div className="flex justify-end gap-3 no-print">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
          <Button onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </div>

        {/* Printable Report Content */}
        <div ref={printRef} className="bg-white print:bg-white">
          <div className="max-w-[8.5in] mx-auto p-6 print:p-0">
            {/* Report Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black uppercase mb-2">
                BARANGAY SAN ROQUE, CIUDAD
              </h1>
            </div>

            {/* Main Summary Table */}
            <div className="mb-5">
              <table className="w-full border-2 border-gray-900">
                <tbody>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold w-1/2">Projected Population</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.projectedPopulation?.toLocaleString() || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold">Actual Population</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.actualPopulation?.toLocaleString() || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold">No. of Families</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.numberOfFamilies?.toLocaleString() || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold">No. of Households</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.numberOfHouseholds?.toLocaleString() || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold">OPT Targets</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.optTargets?.toLocaleString() || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold">OPT Accomplishments</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.optAccomplishments?.toLocaleString() || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold bg-gray-100" colSpan={2}>NORMAL:</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 pl-8">Male</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.nutritionalStatus?.normal?.male || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 pl-8">Female</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.nutritionalStatus?.normal?.female || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold bg-gray-100" colSpan={2}>UNDERWEIGHT:</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 pl-8">Male</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.nutritionalStatus?.underweight?.male || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 pl-8">Female</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.nutritionalStatus?.underweight?.female || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold bg-gray-100" colSpan={2}>SEVERELY UNDERWEIGHT:</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 pl-8">Male</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.nutritionalStatus?.severelyUnderweight?.male || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 pl-8">Female</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.nutritionalStatus?.severelyUnderweight?.female || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold bg-gray-100" colSpan={2}>OVERWEIGHT:</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 pl-8">Male</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.nutritionalStatus?.overweight?.male || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 pl-8">Female</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.nutritionalStatus?.overweight?.female || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold">DIABETIC:</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.diabetic || ""}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-900 py-2 px-4 font-bold">HYPERTENSION:</td>
                    <td className="border-2 border-gray-900 py-2 px-4">{reportData?.hypertension || ""}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Section - Two Columns */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Water Type */}
                <div>
                  <h3 className="font-bold text-lg mb-2">WATER TYPE</h3>
                  <table className="w-full border-2 border-gray-900">
                    <tbody>
                      <tr>
                        <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">LEVEL 1</td>
                        <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.waterType?.level1 || ""}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">LEVEL 2</td>
                        <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.waterType?.level2 || ""}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">LEVEL 3</td>
                        <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.waterType?.level3 || ""}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Type of Toilet */}
                <div>
                  <h3 className="font-bold text-lg mb-2">TYPE OF TOILET</h3>
                  <table className="w-full border-2 border-gray-900">
                    <tbody>
                      <tr>
                        <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">Sanitary</td>
                        <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.toiletType?.sanitary || ""}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">Unsanitary</td>
                        <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.toiletType?.unsanitary || ""}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h3 className="font-bold text-lg mb-2">FAMILY PLANNING METHOD</h3>
                <table className="w-full border-2 border-gray-900">
                  <tbody>
                    <tr>
                      <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">IUD</td>
                      <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.familyPlanningMethods?.iud || ""}</td>
                    </tr>
                    <tr>
                      <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">INJECTABLES</td>
                      <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.familyPlanningMethods?.injectables || ""}</td>
                    </tr>
                    <tr>
                      <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">PILLS</td>
                      <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.familyPlanningMethods?.pills || ""}</td>
                    </tr>
                    <tr>
                      <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">CONDOM</td>
                      <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.familyPlanningMethods?.condom || ""}</td>
                    </tr>
                    <tr>
                      <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">NFP/LAM</td>
                      <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.familyPlanningMethods?.nfpLam || ""}</td>
                    </tr>
                    <tr>
                      <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">VASECTOMY</td>
                      <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.familyPlanningMethods?.vasectomy || ""}</td>
                    </tr>
                    <tr>
                      <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">BTL</td>
                      <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.familyPlanningMethods?.btl || ""}</td>
                    </tr>
                    <tr>
                      <td className="border-2 border-gray-900 py-1.5 px-3 font-bold">IMPLANON</td>
                      <td className="border-2 border-gray-900 py-1.5 px-3">{reportData?.familyPlanningMethods?.implanon || ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer - Print Only */}
            {/* <div className="mt-8 pt-4 border-t border-gray-300 text-sm text-gray-600 text-center print:block hidden">
              Generated on {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div> */}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
