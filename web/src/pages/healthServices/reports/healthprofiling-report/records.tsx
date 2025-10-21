import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Download, Loader2 } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { usePopulationStructureReport } from "./queries/fetchQueries";
import type { PopulationStructureData } from "./types";
import { useReactToPrint } from "react-to-print";

export default function PopulationStructureRecords() {
  const location = useLocation();
  const state = location.state as {
    year: string;
    totalPopulation: number;
    totalFamilies: number;
    totalHouseholds: number;
  };

  const { showLoading, hideLoading } = useLoading();
  const printRef = useRef<HTMLDivElement>(null);
  const { year } = state || {};

  const { data: reportResponse, isLoading, error } = usePopulationStructureReport(year, "all");
  const reportData: PopulationStructureData | null = reportResponse?.data || null;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch population structure report");
    }
  }, [error]);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Population_Structure_${year}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  if (isLoading) {
    return (
      <LayoutWithBack title="Population Structure Report" description="Loading report data...">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </LayoutWithBack>
    );
  }

  return (
    <LayoutWithBack
      title={`Population Structure Report - ${year}`}
      description="Barangay San Roque, Ciudad - Population structure by age group and demographics"
    >
      <div className="space-y-6">
        {/* Action Buttons - No Print */}
        <div className="flex justify-end gap-3 no-print">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </div>

        {/* Printable Report Content */}
        <div ref={printRef} className="bg-white p-8 rounded-lg shadow-sm border">
          {/* Report Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
            <h1 className="text-2xl font-bold uppercase mb-2">
              Barangay San Roque, Ciudad
            </h1>
            <h2 className="text-xl font-semibold uppercase mb-3">
              Population Structure
            </h2>
            <p className="text-lg">
              C.Y. <span className="font-semibold underline decoration-2 underline-offset-4">{year}</span>
            </p>
          </div>

          <div className="space-y-8">
            {/* Total Population */}
            <div className="mb-6">
              <p className="text-lg flex items-baseline gap-2">
                <span className="font-semibold">Total Population:</span>
                <span className="text-2xl font-bold underline decoration-2 underline-offset-4 decoration-gray-400 px-4">
                  {reportData?.totalPopulation?.toLocaleString() || "_______________"}
                </span>
              </p>
            </div>

            {/* Age Group Table */}
            <div className="mb-8">
              <table className="w-full border-2 border-gray-900">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-2 border-gray-900 p-3 text-left font-bold text-base">
                      Age Group
                    </th>
                    <th className="border-2 border-gray-900 p-3 text-center font-bold text-base">
                      Male
                    </th>
                    <th className="border-2 border-gray-900 p-3 text-center font-bold text-base">
                      Female
                    </th>
                    <th className="border-2 border-gray-900 p-3 text-center font-bold text-base">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.ageGroups?.map((ageGroup, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-900 p-3 font-medium">
                        {ageGroup.ageGroup}
                      </td>
                      <td className="border-2 border-gray-900 p-3 text-center">
                        {ageGroup.male}
                      </td>
                      <td className="border-2 border-gray-900 p-3 text-center">
                        {ageGroup.female}
                      </td>
                      <td className="border-2 border-gray-900 p-3 text-center font-semibold">
                        {ageGroup.total}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-gray-200 font-bold">
                    <td className="border-2 border-gray-900 p-3 text-base">Total:</td>
                    <td className="border-2 border-gray-900 p-3 text-center">
                      {reportData?.ageGroups?.reduce((sum, ag) => sum + ag.male, 0) || 0}
                    </td>
                    <td className="border-2 border-gray-900 p-3 text-center">
                      {reportData?.ageGroups?.reduce((sum, ag) => sum + ag.female, 0) || 0}
                    </td>
                    <td className="border-2 border-gray-900 p-3 text-center">
                      {reportData?.totalPopulation || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Demographics Section */}
            <div className="space-y-3 text-base">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold min-w-[200px]">No. of Families:</span>
                <span className="flex-1 border-b-2 border-gray-400 px-2">
                  {reportData?.numberOfFamilies || ""}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-semibold min-w-[200px]">No. of Households:</span>
                <span className="flex-1 border-b-2 border-gray-400 px-2">
                  {reportData?.numberOfHouseholds || ""}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-semibold min-w-[200px]">Types of Toilet:</span>
                <span className="flex-1 border-b-2 border-gray-400 px-2"></span>
              </div>

              <div className="pl-8 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="min-w-[150px]">Sanitary:</span>
                  <span className="flex-1 border-b-2 border-gray-400 px-2">
                    {reportData?.toiletTypes?.sanitary || ""}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="min-w-[150px]">Unsanitary:</span>
                  <span className="flex-1 border-b-2 border-gray-400 px-2">
                    {reportData?.toiletTypes?.unsanitary || ""}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="min-w-[150px]">None:</span>
                  <span className="flex-1 border-b-2 border-gray-400 px-2">
                    {reportData?.toiletTypes?.none || ""}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mt-4">
                <span className="font-semibold min-w-[200px]">Water Source:</span>
                <span className="flex-1 border-b-2 border-gray-400 px-2"></span>
              </div>

              <div className="pl-8 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="min-w-[280px]">L1 Point Source (e.g. tabay, puso) =</span>
                  <span className="flex-1 border-b-2 border-gray-400 px-2">
                    {reportData?.waterSources?.l1PointSource || ""}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="min-w-[280px]">L2 Communal (e.g. hakot system/buying) =</span>
                  <span className="flex-1 border-b-2 border-gray-400 px-2">
                    {reportData?.waterSources?.l2Communal || ""}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="min-w-[320px]">L3 Complete Source/Direct to the house (e.g. MCWD) =</span>
                  <span className="flex-1 border-b-2 border-gray-400 px-2">
                    {reportData?.waterSources?.l3CompleteSource || ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
