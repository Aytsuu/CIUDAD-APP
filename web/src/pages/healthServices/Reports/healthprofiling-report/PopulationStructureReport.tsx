import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Loader2, Download, Users, Home, Droplet, Toilet, FileText } from "lucide-react";
import { usePopulationStructureReport, useSitios } from "./queries/fetchQueries";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { useReactToPrint } from "react-to-print";
import type { PopulationStructureData } from "./types";

export default function PopulationStructureReport() {
  const { showLoading, hideLoading } = useLoading();
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sitioFilter, setSitioFilter] = useState<string>("all");
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const { data: reportResponse, isLoading, error } = usePopulationStructureReport(yearFilter, sitioFilter);
  const { data: sitiosResponse } = useSitios();

  const reportData: PopulationStructureData | null = reportResponse?.data || null;
  const sitios = sitiosResponse?.data || [];

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch population structure report");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Generate year options for the last 10 years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Population_Structure_Report_${yearFilter}_${sitioFilter}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
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
      title="Health Profiling Population Structure"
      description="Barangay San Roque, Ciudad - Population structure report by age group and demographics"
    >
      <div className="space-y-6">
        {/* Filters and Actions - No Print */}
        <Card className="no-print">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Filter by Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Filter by Sitio</label>
                <Select value={sitioFilter} onValueChange={setSitioFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select sitio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sitios</SelectItem>
                    {sitios.map((sitio: any) => (
                      <SelectItem key={sitio.sitio_id} value={sitio.sitio_name}>
                        {sitio.sitio_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePrint} className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Printable Report Content */}
        <div ref={printRef} className="bg-white">
          {/* Report Header */}
          <div className="text-center mb-8 p-8 border-b-2 border-gray-300">
            <h1 className="text-2xl font-bold uppercase mb-2">
              Barangay San Roque, Ciudad
            </h1>
            <h2 className="text-xl font-semibold uppercase mb-4">
              Population Structure
            </h2>
            {yearFilter !== "all" && (
              <p className="text-lg">
                C.Y. <span className="font-semibold">{yearFilter}</span>
              </p>
            )}
            {sitioFilter !== "all" && (
              <p className="text-md text-gray-600">
                Sitio: <span className="font-semibold">{sitioFilter}</span>
              </p>
            )}
          </div>

          <div className="px-8 pb-8">
            {/* Total Population */}
            <div className="mb-6">
              <p className="text-lg">
                <span className="font-semibold">Total Population:</span>{" "}
                <span className="text-2xl font-bold text-blue-600">
                  {reportData?.totalPopulation?.toLocaleString() || 0}
                </span>
              </p>
            </div>

            {/* Age Group Table */}
            <div className="mb-8">
              <table className="w-full border-2 border-gray-800">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border-2 border-gray-800 p-3 text-left font-bold">
                      Age Group
                    </th>
                    <th className="border-2 border-gray-800 p-3 text-center font-bold">
                      Male
                    </th>
                    <th className="border-2 border-gray-800 p-3 text-center font-bold">
                      Female
                    </th>
                    <th className="border-2 border-gray-800 p-3 text-center font-bold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.ageGroups?.map((ageGroup, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border-2 border-gray-800 p-3 font-medium">
                        {ageGroup.ageGroup}
                      </td>
                      <td className="border-2 border-gray-800 p-3 text-center">
                        {ageGroup.male}
                      </td>
                      <td className="border-2 border-gray-800 p-3 text-center">
                        {ageGroup.female}
                      </td>
                      <td className="border-2 border-gray-800 p-3 text-center font-semibold">
                        {ageGroup.total}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-blue-100 font-bold">
                    <td className="border-2 border-gray-800 p-3">Total:</td>
                    <td className="border-2 border-gray-800 p-3 text-center">
                      {reportData?.ageGroups?.reduce((sum, ag) => sum + ag.male, 0) || 0}
                    </td>
                    <td className="border-2 border-gray-800 p-3 text-center">
                      {reportData?.ageGroups?.reduce((sum, ag) => sum + ag.female, 0) || 0}
                    </td>
                    <td className="border-2 border-gray-800 p-3 text-center">
                      {reportData?.totalPopulation || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">No. of Families:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData?.numberOfFamilies?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Home className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">No. of Households:</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData?.numberOfHouseholds?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Toilet className="h-6 w-6 text-purple-600" />
                    <p className="font-semibold text-gray-700">Types of Toilet:</p>
                  </div>
                  <div className="space-y-2 pl-8">
                    <p className="text-sm">
                      <span className="font-medium">Sanitary:</span>{" "}
                      <span className="font-bold text-purple-600">
                        {reportData?.toiletTypes?.sanitary || 0}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Unsanitary:</span>{" "}
                      <span className="font-bold text-orange-600">
                        {reportData?.toiletTypes?.unsanitary || 0}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">None:</span>{" "}
                      <span className="font-bold text-red-600">
                        {reportData?.toiletTypes?.none || 0}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplet className="h-6 w-6 text-cyan-600" />
                    <p className="font-semibold text-gray-700">Water Source:</p>
                  </div>
                  <div className="space-y-2 pl-8 text-sm">
                    <p>
                      <span className="font-medium">L1 Point Source (e.g. tabay, puso):</span>{" "}
                      <span className="font-bold text-cyan-600">
                        {reportData?.waterSources?.l1PointSource || 0}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">L2 Communal (e.g. hakot system/buying):</span>{" "}
                      <span className="font-bold text-cyan-600">
                        {reportData?.waterSources?.l2Communal || 0}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">L3 Complete Source/Direct to house (e.g. MCWD):</span>{" "}
                      <span className="font-bold text-cyan-600">
                        {reportData?.waterSources?.l3CompleteSource || 0}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-300">
              <p className="text-sm text-gray-600 text-center">
                Generated on {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards - No Print */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Population</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData?.totalPopulation?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Families</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData?.numberOfFamilies?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Home className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Households</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {reportData?.numberOfHouseholds?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <FileText className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Report Generated</p>
                  <p className="text-sm font-semibold text-cyan-600">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithBack>
  );
}
