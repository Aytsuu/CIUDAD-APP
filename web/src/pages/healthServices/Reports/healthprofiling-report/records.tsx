"use client"

import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button/button"
import { Printer, Download, Loader2 } from "lucide-react"
import { useLoading } from "@/context/LoadingContext"
import { toast } from "sonner"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { usePopulationStructureReport } from "./queries/fetchQueries"
import type { PopulationStructureData } from "./types"
import { useReactToPrint } from "react-to-print"
import html2pdf from "html2pdf.js"

export default function PopulationStructureRecords() {
  const location = useLocation()
  const state = location.state as {
    year: string
    totalPopulation: number
    totalFamilies: number
    totalHouseholds: number
  }

  const { showLoading, hideLoading } = useLoading()
  const printRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const { year } = state || {}

  const { data: reportResponse, isLoading, error } = usePopulationStructureReport(year, "all")
  const reportData: PopulationStructureData | null = reportResponse?.data || null

  useEffect(() => {
    if (isLoading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoading, showLoading, hideLoading])

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch population structure report")
    }
  }, [error])

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Population_Structure_${year}`,
    pageStyle: `
      @page {
        size: legal;
        margin: 0.3in 0.5in;
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
  })

  // Export to PDF handler using html2pdf.js
  const handleExportPdf = async () => {
    const element = printRef.current
    if (!element) return
    try {
      setExporting(true)
      const filename = `Population_Structure_${year || "all"}.pdf`
      await html2pdf()
        .set({
          margin: [0.3, 0.5, 0.3, 0.5],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "in", format: "legal", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        } as any)
        .from(element)
        .save()
      
    } catch (e) {
      toast.error("Failed to export PDF")
    } finally {
      setExporting(false)
    }
  }

  if (isLoading) {
    return (
      <LayoutWithBack title="Population Structure Report" description="Loading report data...">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </LayoutWithBack>
    )
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
          <Button onClick={handleExportPdf} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {exporting ? "Exporting…" : "Export as PDF"}
          </Button>
        </div>

        {/* Printable Report Content */}
        <div ref={printRef} className="bg-white print:bg-white">
          <div className="max-w-[8.5in] mx-auto p-6 print:p-0">
            {/* Report Header */}
            <div className="text-center mb-3 pb-2 border-b-2 border-gray-800">
              <h1 className="text-2xl font-bold uppercase mb-2">Barangay San Roque, Ciudad</h1>
              <h2 className="text-xl font-semibold uppercase mb-3">Population Structure</h2>
              <p className="text-lg font-medium">
                C.Y. <span className="font-bold">{year}</span>
              </p>
            </div>

            <div className="space-y-3">
              {/* Total Population */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-semibold text-base">Total Population:</span>
                <span className="text-xl font-bold border-b-2 border-gray-800 px-4 min-w-[150px] text-center">
                  {reportData?.totalPopulation?.toLocaleString() || ""}
                </span>
              </div>

              {/* Age Group Table - Balanced Spacing */}
              <div className="mb-3">
                <table className="w-full border-collapse border-2 border-gray-900 text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border-2 border-gray-900 py-2 px-3 text-left font-bold">Age Group</th>
                      <th className="border-2 border-gray-900 py-2 px-3 text-center font-bold w-24">Male</th>
                      <th className="border-2 border-gray-900 py-2 px-3 text-center font-bold w-24">Female</th>
                      <th className="border-2 border-gray-900 py-2 px-3 text-center font-bold w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.ageGroups?.map((ageGroup, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-900 py-1.5 px-3 font-medium">{ageGroup.ageGroup}</td>
                        <td className="border border-gray-900 py-1.5 px-3 text-center">{ageGroup.male}</td>
                        <td className="border border-gray-900 py-1.5 px-3 text-center">{ageGroup.female}</td>
                        <td className="border border-gray-900 py-1.5 px-3 text-center font-semibold">
                          {ageGroup.total}
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-gray-300 font-bold">
                      <td className="border-2 border-gray-900 py-2 px-3">Total:</td>
                      <td className="border-2 border-gray-900 py-2 px-3 text-center">
                        {reportData?.ageGroups?.reduce((sum, ag) => sum + ag.male, 0) || 0}
                      </td>
                      <td className="border-2 border-gray-900 py-2 px-3 text-center">
                        {reportData?.ageGroups?.reduce((sum, ag) => sum + ag.female, 0) || 0}
                      </td>
                      <td className="border-2 border-gray-900 py-2 px-3 text-center">
                        {reportData?.totalPopulation || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Demographics Section - Compressed Spacing */}
              <div className="space-y-1.5 text-sm mt-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-semibold w-48">No. of Families:</span>
                  <span className="flex-1 border-b-2 border-gray-800 px-3 pb-1">
                    {reportData?.numberOfFamilies || ""}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-semibold w-48">No. of Households:</span>
                  <span className="flex-1 border-b-2 border-gray-800 px-3 pb-1">
                    {reportData?.numberOfHouseholds || ""}
                  </span>
                </div>

                <div className="mt-2 pt-1">
                  <div className="font-semibold mb-1">Types of Toilet:</div>
                  <div className="pl-8 space-y-1">
                    <div className="flex items-baseline gap-3">
                      <span className="w-36">Sanitary:</span>
                      <span className="flex-1 border-b-2 border-gray-800 px-3 pb-1">
                        {reportData?.toiletTypes?.sanitary || ""}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="w-36">Unsanitary:</span>
                      <span className="flex-1 border-b-2 border-gray-800 px-3 pb-1">
                        {reportData?.toiletTypes?.unsanitary || ""}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="w-36">None:</span>
                      <span className="flex-1 border-b-2 border-gray-800 px-3 pb-1">
                        {reportData?.toiletTypes?.none || ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-1">
                  <div className="font-semibold mb-1">Water Source:</div>
                  <div className="pl-8 space-y-1">
                    <div className="flex items-baseline gap-3">
                      <span className="w-80">L1 Point Source (e.g. tabay, puso) =</span>
                      <span className="flex-1 border-b-2 border-gray-800 px-3 pb-1">
                        {reportData?.waterSources?.l1PointSource || ""}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="w-80">L2 Communal (e.g. hakot system/buying) =</span>
                      <span className="flex-1 border-b-2 border-gray-800 px-3 pb-1">
                        {reportData?.waterSources?.l2Communal || ""}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="w-80">L3 Complete Source/Direct to house (e.g. MCWD) =</span>
                      <span className="flex-1 border-b-2 border-gray-800 px-3 pb-1">
                        {reportData?.waterSources?.l3CompleteSource || ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Print Only */}
              <div className="mt-4 pt-2 border-t border-gray-300 text-sm text-gray-600 text-center print:block hidden">
                Generated on{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  )
}
