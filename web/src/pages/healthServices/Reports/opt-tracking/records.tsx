import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Search, Loader2, Filter } from "lucide-react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "../firstaid-report/export-report";
import { ExportDropdown } from "../firstaid-report/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useMonthlyOPTRecords } from "./queries/fetch";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import { OPTChildHealthRecord } from "./types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const ageRangeOptions = [
  { value: "0-71", label: "All" },
  { value: "0-5", label: "0-5 months" },
  { value: "6-11", label: "6-11 months" },
  { value: "12-23", label: "12-23 months (1-2 years)" },
  { value: "24-35", label: "24-35 months (2-3 years)" },
  { value: "36-47", label: "36-47 months (3-4 years)" },
  { value: "48-59", label: "48-59 months (4-5 years)" },
  { value: "60-71", label: "60-71 months (5-6 years)" },
];

export default function OPTTrackingDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};
  const { showLoading, hideLoading } = useLoading();
  const [sitioSearch, setSitioSearch] = useState("");
  const [nutritionalStatus, setNutritionalStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [ageRange, setAgeRange] = useState("");
  const [showSitioFilter, setShowSitioFilter] = useState(false);
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);

  // Fetch sitio list
  const { data: sitioData, isLoading: isLoadingSitios } = useSitioList();
  const sitios = sitioData || [];

  const debouncedSitioSearch = useDebounce(sitioSearch, 500);
  const debouncedNutritionalStatus = useDebounce(nutritionalStatus, 500);
  const debouncedAgeRange = useDebounce(ageRange, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSitioSearch, debouncedNutritionalStatus, debouncedAgeRange, selectedSitios]);

  // Combine manual search with selected sitios
  const combinedSitioSearch = selectedSitios.length > 0 
    ? selectedSitios.join(',')
    : sitioSearch;

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useMonthlyOPTRecords(
    month,
    currentPage,
    pageSize,
    combinedSitioSearch,
    debouncedNutritionalStatus,
    debouncedAgeRange
  );

  const records: OPTChildHealthRecord[] =
    apiResponse?.results?.report_data || [];
  const totalEntries = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalEntries / pageSize);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch OPT records");
      console.error("API Error:", error);
    }
  }, [error]);

  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  const prepareExportData = useCallback(() => {
    return records.map((item) => ({
      "Household No": item.household_no || "N/A",
      "Child Name": item.child_name || "N/A",
      Sex: item.sex || "N/A",
      "Date of Birth": item.date_of_birth || "N/A",
      "Age (months)": item.age_in_months?.toString() || "N/A",
      "Name of Household Head/Mother/Caregiver":
        item.parents?.mother || item.parents?.father || "N/A",
      Address: item.address || "N/A",
      Sitio: item.sitio || "N/A",
      Transient: item.transient ? "Yes" : "No",
      "Date of Weighing": item.date_of_weighing || "N/A",
      "Weight (kg)": item.weight?.toString() || "N/A",
      "Height (cm)": item.height?.toString() || "N/A",
      "WFA Status": item.nutritional_status?.wfa || "N/A",
      "LHFA Status": item.nutritional_status?.lhfa || "N/A",
      "WFL Status": item.nutritional_status?.wfl || "N/A",
      "MUAC (mm)": item.nutritional_status?.muac?.toString() || "N/A",
      Edema: item.nutritional_status?.edema || "N/A",
      "MUAC Status": item.nutritional_status?.muac_status || "N/A",
      "Type of Feeding": item.type_of_feeding || "N/A",
    }));
  }, [records]);

  const handleExportCSV = () =>
    exportToCSV(
      prepareExportData(),
      `opt_records_${monthName.replace(" ", "_")}`
    );

  const handleExportExcel = () =>
    exportToExcel(
      prepareExportData(),
      `opt_records_${monthName.replace(" ", "_")}`
    );

  const handleExportPDF = () =>
    exportToPDF(
      prepareExportData(),
      `opt_records_${monthName.replace(" ", "_")}`
    );

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-PH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
  };

  const handleSitioSelection = (sitio_name: string, checked: boolean) => {
    if (checked) {
      setSelectedSitios([...selectedSitios, sitio_name]);
      setSitioSearch(""); // Clear manual search when selecting sitios
    } else {
      setSelectedSitios(selectedSitios.filter(sitio => sitio !== sitio_name));
    }
  };

  const handleSelectAllSitios = (checked: boolean) => {
    if (checked && sitios.length > 0) {
      setSelectedSitios(sitios.map((sitio: any) => sitio.sitio_name));
      setSitioSearch(""); // Clear manual search when selecting all
    } else {
      setSelectedSitios([]);
    }
  };

  const handleManualSitioSearch = (value: string) => {
    setSitioSearch(value);
    if (value) {
      setSelectedSitios([]); // Clear selected sitios when manually searching
    }
  };

  return (
    <LayoutWithBack
      title={`OPT Tracking`}
      description={`${monthName} Child Health Records`}
    >
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Name or Sitio..."
              className="pl-10 w-full"
              value={sitioSearch}
              onChange={(e) => handleManualSitioSearch(e.target.value)}
            />
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by nutritional status..."
              className="pl-10 w-full"
              value={nutritionalStatus}
              onChange={(e) => setNutritionalStatus(e.target.value)}
            />
          </div>
          {/* Age Range Filter */}
          <div className="flex-1 max-w-md">
            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by age range" />
              </SelectTrigger>
              <SelectContent>
                {ageRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Sitio Filter Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowSitioFilter(!showSitioFilter)}
              className="gap-2"
              variant="outline"
            >
              <Filter className="h-4 w-4" />
              Filter Sitios
              {selectedSitios.length > 0 && ` (${selectedSitios.length})`}
            </Button>
            
            {showSitioFilter && (
              <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white border rounded-md shadow-lg z-10 p-3">
                {isLoadingSitios ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading sitios...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 mb-2 p-2 border-b">
                      <Checkbox
                        id="select-all-sitios"
                        checked={selectedSitios.length === sitios.length && sitios.length > 0}
                        onCheckedChange={(checked) => handleSelectAllSitios(checked as boolean)}
                      />
                      <label
                        htmlFor="select-all-sitios"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Select All
                      </label>
                    </div>
                    
                    {sitios.map((sitio:any) => (
                      <div key={sitio.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                        <Checkbox
                          id={`sitio-${sitio.id}`}
                          checked={selectedSitios.includes(sitio.sitio_name)}
                          onCheckedChange={(checked) => handleSitioSelection(sitio.sitio_name, checked as boolean)}
                        />
                        <label
                          htmlFor={`sitio-${sitio.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {sitio.sitio_name}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            className="border-gray-200 hover:bg-gray-50"
          />
          <Button
            onClick={handlePrint}
            className="gap-2 border-gray-200 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 " />
            <span>Print</span>
          </Button>
        </div>
      </div>
      {/* Display selected sitios as chips */}
      {selectedSitios.length > 0 && (
        <div className="bg-gray-50 p-3 flex flex-wrap gap-2">
          <span className="text-sm font-medium">Filtered by sitios:</span>
          {selectedSitios.map(sitio => (
            <span 
              key={sitio} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {sitio}
              <button
                onClick={() => handleSitioSelection(sitio, false)}
                className="ml-1.5 rounded-full flex-shrink-0"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => setSelectedSitios([])}
            className="text-xs text-blue-600 hover:text-blue-800 ml-2"
          >
            Clear all
          </button>
        </div>
      )}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <Input
            type="number"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="w-20 h-8 bg-white border rounded-md text-sm text-center"
          />
          <span className="text-sm text-gray-700">entries</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `Showing ${startIndex} - ${endIndex} of ${totalEntries} records`
            )}
          </span>
          {!isLoading && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="text-sm"
            />
          )}
        </div>
      </div>
      <div className="bg-white rounded-b-lg overflow-hidden">
        <div
          id="printable-area"
          className="p-4"
          style={{
            width: "100%",
            overflowX: "auto",
            fontSize: "12px",
          }}
        >
          <div className="min-w-[1000px]"> 
            <div className="flex-1 text-center ">
              <Label className="text-xs font-bold uppercase block">
                Department of Health{" "}
              </Label>
              <Label className="text-sm font-bold uppercase block">
                NATIONAL NUTRITIONAL COUNCIL
              </Label>
              <Label className="text-xs block">CEBU CITY HEALTH DEPARTMENT</Label>
            </div>
            <div className="flex mt-4 d text-xs">
              <p className="font-semibold uppercase mr-1">OPT PLUS FORM NO. 1</p>
              <p className="">
                List of Preschooler with Weight and Height measurement &
                Identified status
              </p>
            </div>
            <div className="text-start mb-6 mt-4 flex justify-between items-center text-xs">
            <div className="flex">
          <span className="mr-1 font-semibold">Barangay/Sitio:</span>
          <span className="underline">
            {/* Show selected sitios or manual search */}
            {selectedSitios.length > 0 
              ? selectedSitios.join(", ") 
              : sitioSearch || "All Sitios"
            }
          </span>
        </div>
              <span className="font-semibold">Province of Cebu</span>
              <div>
                <span className=" font-semibold">Year: </span>{" "}
                <span className="underline">{new Date().getFullYear()}</span>
              </div>
              <div className="">
                <span className=" font-semibold">Date of OPT Plus: </span>
                <span className="underline">{monthName}</span>
              </div>
            </div>
            {isLoading ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <span className="text-sm text-gray-600">
                    Loading records...
                  </span>
                </div>
              </div>
            ) : records.length === 0 ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {sitioSearch || nutritionalStatus || ageRange || selectedSitios.length > 0
                      ? "No records found matching your filters"
                      : "No records found for this month"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-xs text-center">
                    <tr className="">
                      <th rowSpan={2} className="border p-1 w-[5%]">
                        HH No.
                      </th>
                      <th rowSpan={2} className="border p-1 w-[20%]">
                        Name of Household Head/Mother/Caregiver
                      </th>
                      <th colSpan={2} className="border p-1 ">
                        FP ACCEPTOR
                      </th>
                      <th rowSpan={2} className="border p-1  w-[15%]">
                        Name of Preschoolers weighed
                      </th>
                      <th rowSpan={2} className="border p-1  w-[3%]">
                        <div className="flex flex-col items-center">
                          <span>S</span>
                          <span>E</span>
                          <span>X</span>
                        </div>
                      </th>
                      <th rowSpan={2} className="border p-1  w-[10%]">
                        Date of Birth
                      </th>
                      <th rowSpan={2} className="border p-1  w-[8%]">
                        Date of Weighing
                      </th>
                      <th rowSpan={2} className="border p-1  w-[5%]">
                        MOS
                      </th>
                      <th rowSpan={2} className="border p-1  w-[7%]">
                        Weight (kg)
                      </th>
                      <th rowSpan={2} className="border p-1  w-[7%]">
                        Height (cm)
                      </th>
                      <th colSpan={4} className="border p-1">
                        NUTRITIONAL STATUS
                      </th>
                      <th rowSpan={2} className="border p-1  w-[7%]">
                        Sitio
                      </th>
                    </tr>
                    <tr className="">
                      <th className="border p-1 ">Method</th>
                      <th className="border p-1 ">None</th>
                      <th className="border p-1">WFA</th>
                      <th className="border p-1 ">HFA</th>
                      <th className="border p-1">WFL</th>
                      <th className="border p-1 text-center">MUAC</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-center">
                    {records.map((item, index) => (
                      <tr key={index} >
                        <td className="border p-1">{item.household_no}</td>
                        <td className="border p-1">
                          {item.parents?.mother || item.parents?.father || "N/A"}
                        </td>
                        <td className="border p-1 "></td>
                        <td className="border p-1 "></td>
                        <td className="border p-1">{item.child_name || "N/A"}</td>
                        <td className="border p-1 ">
                          {item.sex === "Male"
                            ? "M"
                            : item.sex === "Female"
                            ? "F"
                            : "N/A"}
                        </td>
                        <td className="border p-1 text-center">
                          {formatDate(item.date_of_birth)}
                        </td>
                        <td className="border p-1 text-center">
                          {formatDate(item.date_of_weighing)}
                        </td>
                        <td className="border p-1 text-center">
                          {item.age_in_months?.toString() || "N/A"}
                        </td>
                        <td className="border p-1 text-center">
                          {item.weight ? Number(item.weight).toFixed(2) : "N/A"}
                        </td>
                        <td className="border p-1 text-center">
                          {item.height ? Number(item.height).toFixed(1) : "N/A"}
                        </td>
                        <td className="border p-1 text-center">
                          {item.nutritional_status?.wfa || "N/A"}
                        </td>
                        <td className="border p-1 text-center">
                          {item.nutritional_status?.lhfa || "N/A"}
                        </td>
                        <td className="border p-1 text-center">
                          {item.nutritional_status?.wfl || "N/A"}
                        </td>
                        <td className="border p-1 text-center">
                          {item.nutritional_status?.muac || "N/A"}
                        </td>
                        <td className="border p-1 text-center">
                          {item.sitio || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="font-semibold mb-1 mt-4">*Codes of Nutritional Status:</p>
            <div className="flex flex-col sm:flex-row justify-between text-xs">
              <div className="flex justify-between gap-4  sm:mb-0">
                <div>
                  <p>WFA – (Weight for Age) N – (Normal)</p>
                  <p>L/HFA – (Length/Height for age) N – (Normal)</p>
                  <p>WFH/Length – (Weight for height/length) N – (Normal)</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 ">
                  <p>N – (Normal)</p>
                  <p>UW – (Underweight)</p>
                  <p>ST – (Stunted)</p>
                  <p>W – (Wasted)</p>
                  <p>SW – (Severely Wasted)</p>
                  <p>SST – (Severely Stunted)</p>
                </div>
                <div>
                  <p>SUW – (Severely underweight)</p>
                  <div className="flex gap-4">
                    <p>T – Tall</p>
                    <p>OB – Obese</p>
                  </div>
                  <p>OW – Overweight</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}