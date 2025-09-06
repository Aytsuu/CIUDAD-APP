import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// Components
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import { ChevronLeft, Printer, Loader2, X, Filter, Search } from "lucide-react";

// Hooks
import { useLoading } from "@/context/LoadingContext";
import { useOPTMonthlyReport, } from "./queries/fetch";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";



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

export default function OPTMonthlyDetails() {
  const location = useLocation();
  const { month, monthName } = location.state;
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [sitioSearch, setSitioSearch] = useState("");
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);
  const [showSitioFilter, setShowSitioFilter] = useState(false);

  // Fetch sitio list
  const { data: sitioData, isLoading: isLoadingSitios } = useSitioList();
  const sitios = sitioData || [];

  const debouncedSitioSearch = useDebounce(sitioSearch, 500);

  // Combine selected sitios for API call
  const sitioFilter = selectedSitios.length > 0 ? selectedSitios.join(',') : '';

  const {
    data: reportData,
    isLoading,
    error,
    refetch,
  } = useOPTMonthlyReport(month, sitioFilter);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch OPT report");
      toast("Retrying to fetch report...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [error]);

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleClearFilter = () => {
    setSelectedSitios([]);
    setSitioSearch("");
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

  const filteredSitios = sitios.filter((sitio: any) =>
    sitio.sitio_name.toLowerCase().includes(debouncedSitioSearch.toLowerCase())
  );

  const renderValue = (value: number) => {
    return value === 0 ? '-' : value;
  };

  const renderOPTSummaryTable = () => {
    if (!reportData?.report) return null;

    const { WFA, HFA, WFH } = reportData.report;

    const ageGroups = [
      "0-5",
      "6-11",
      "12-23",
      "24-35",
      "36-47",
      "48-59",
      "60-71",
    ];

    const formatAgeGroup = (age: string) => {
      return age + " months";
    };

    // Calculate totals for each category
    const calculateCategoryTotals = (category: any) => {
      const totals: any = {
        Male: 0,
        Female: 0,
        N: { Male: 0, Female: 0 },
        SUW: { Male: 0, Female: 0 },
        UW: { Male: 0, Female: 0 },
        OW: { Male: 0, Female: 0 },
        T: { Male: 0, Female: 0 },
        SST: { Male: 0, Female: 0 },
        ST: { Male: 0, Female: 0 },
        W: { Male: 0, Female: 0 },
        SW: { Male: 0, Female: 0 },
      };

      ageGroups.forEach((ageGroup) => {
        Object.keys(category.age_groups[ageGroup] || {}).forEach((status) => {
          if (status !== "Total") {
            totals.Male += category.age_groups[ageGroup][status]?.Male || 0;
            totals.Female += category.age_groups[ageGroup][status]?.Female || 0;

            if (totals[status]) {
              totals[status].Male +=
                category.age_groups[ageGroup][status]?.Male || 0;
              totals[status].Female +=
                category.age_groups[ageGroup][status]?.Female || 0;
            }
          }
        });
      });

      return totals;
    };

    const wfaTotals = calculateCategoryTotals(WFA);
    const hfaTotals = calculateCategoryTotals(HFA);
    const wfhTotals = calculateCategoryTotals(WFH);

    return (
      <div className="overflow-x-auto border-2 border-black">
        <table className="w-full border-collapse text-xs">
          {/* Table Headers */}
          <thead>
            <tr className="">
              <th
                rowSpan={3}
                className="border border-black p-2 min-w-20 text-center"
              >
                <div className="font-bold text-xs">AGE IN</div>
                <div className="font-bold text-xs">MONTHS</div>
              </th>
              {/* Weight for Age - 10 columns */}
              <th
                colSpan={10}
                className="border border-black px-1 py-3 text-center font-bold text-xs"
              >
                WEIGHT FOR AGE
              </th>
              {/* Height for Age - 10 columns */}
              <th
                colSpan={10}
                className="border border-black px-1 py-3 text-center font-bold text-xs"
              >
                HEIGHT FOR AGE
              </th>
              {/* Weight for Height - 8 columns */}
              <th
                colSpan={8}
                className="border border-black px-1 py-3 text-center font-bold text-xs"
              >
                WEIGHT FOR HEIGHT
              </th>
            </tr>
            <tr className="">
              {/* WFA sub-headers */}
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                NORMAL
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                SEVERELY
                <br />
                UNDERWEIGHT
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                UNDERWEIGHT
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                OVERWEIGHT
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center font-bold  text-xs"
              >
                TOTAL
              </th>

              {/* HFA sub-headers */}
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                NORMAL
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                TALL
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                SST
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                STUNTED
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center font-bold  text-xs"
              >
                TOTAL
              </th>

              {/* WFH sub-headers */}
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                NORMAL
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                WASTED
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center text-xs"
              >
                OVERWEIGHT
              </th>
              <th
                colSpan={2}
                className="border border-black px-1 py-3 text-center font-bold  text-xs"
              >
                TOTAL
              </th>
            </tr>
            <tr className="">
              {/* M F headers for all columns */}
              {Array(28)
                .fill(null)
                .map((_, i) => (
                  <th
                    key={i}
                    className="border border-black px-1 py-3 w-6 font-bold text-xs"
                  >
                    {i % 2 === 0 ? "M" : "F"}
                  </th>
                ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {ageGroups.map((ageGroup) => (
              <tr key={ageGroup}>
                <td className="border border-black p-2 font-medium text-left text-xs">
                  {formatAgeGroup(ageGroup)}
                </td>

                {/* WFA Data */}
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.N?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.N?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.SUW?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.SUW?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.UW?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.UW?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.OW?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.OW?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.Total?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                  {renderValue(WFA.age_groups[ageGroup]?.Total?.Female || 0)}
                </td>

                {/* HFA Data */}
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.N?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.N?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.T?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.T?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.SST?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.SST?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.ST?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.ST?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.Total?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                  {renderValue(HFA.age_groups[ageGroup]?.Total?.Female || 0)}
                </td>

                {/* WFH Data */}
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFH.age_groups[ageGroup]?.N?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFH.age_groups[ageGroup]?.N?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue((WFH.age_groups[ageGroup]?.W?.Male || 0) + (WFH.age_groups[ageGroup]?.SW?.Male || 0))}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue((WFH.age_groups[ageGroup]?.W?.Female || 0) + (WFH.age_groups[ageGroup]?.SW?.Female || 0))}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFH.age_groups[ageGroup]?.OW?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center text-xs">
                  {renderValue(WFH.age_groups[ageGroup]?.OW?.Female || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                  {renderValue(WFH.age_groups[ageGroup]?.Total?.Male || 0)}
                </td>
                <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                  {renderValue(WFH.age_groups[ageGroup]?.Total?.Female || 0)}
                </td>
              </tr>
            ))}

            {/* Comprehensive Total Row */}
            <tr className="font-bold">
              <td className="border border-black p-2 text-xs">TOTAL</td>

              {/* WFA Totals */}
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfaTotals.N.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfaTotals.N.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfaTotals.SUW.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfaTotals.SUW.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfaTotals.UW.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfaTotals.UW.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfaTotals.OW.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfaTotals.OW.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                {renderValue(wfaTotals.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                {renderValue(wfaTotals.Female)}
              </td>

              {/* HFA Totals */}
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(hfaTotals.N.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(hfaTotals.N.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(hfaTotals.T.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(hfaTotals.T.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(hfaTotals.SST.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(hfaTotals.SST.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(hfaTotals.ST.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(hfaTotals.ST.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                {renderValue(hfaTotals.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                {renderValue(hfaTotals.Female)}
              </td>

              {/* WFH Totals */}
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfhTotals.N.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfhTotals.N.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfhTotals.W.Male + wfhTotals.SW.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfhTotals.W.Female + wfhTotals.SW.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfhTotals.OW.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center text-xs italic text-gray-500">
                {renderValue(wfhTotals.OW.Female)}
              </td>
              <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                {renderValue(wfhTotals.Male)}
              </td>
              <td className="border border-black px-1 py-3 text-center font-semibold text-xs">
                {renderValue(wfhTotals.Female)}
              </td>
            </tr>

            {/* Grand Summary Row */}
            <tr className="font-bold">
              <td className="border border-black p-2 text-xs">GRAND TOTAL</td>
              <td
                colSpan={10}
                className="border border-black p-2 text-center text-xs"
              >
                WFA: {wfaTotals.Male + wfaTotals.Female}
              </td>
              <td
                colSpan={10}
                className="border border-black p-2 text-center text-xs"
              >
                HFA: {hfaTotals.Male + hfaTotals.Female}
              </td>
              <td
                colSpan={8}
                className="border border-black p-2 text-center text-xs"
              >
                WFH: {wfhTotals.Male + wfhTotals.Female}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            OPT Tracking for {monthName}
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Detailed nutritional status breakdown
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="flex flex-col p-4 border bg-white py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by sitio..."
                className="pl-10 w-full"
                value={sitioSearch}
                onChange={(e) => handleManualSitioSearch(e.target.value)}
              />
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
                      
                      {filteredSitios.map((sitio: any) => (
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
          
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>

        {/* Display selected sitios as chips */}
        {selectedSitios.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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
              onClick={handleClearFilter}
              className="text-xs text-blue-600 hover:text-blue-800 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div id="printable-area" className="bg-white h-full border">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">OPT SUMMARY</h2>
          <h3 className="text-lg font-bold">CEBU CITY HEALTH DEPARTMENT</h3>
          <h4 className="text-base font-semibold mb-4">NUTRITION PROGRAM</h4>
          <div className="text-sm mb-4">
            <p>
              <strong>OPT Month:</strong> {monthName}
            </p>
            {selectedSitios.length > 0 && (
              <p>
                <strong>Filtered by Sitio:</strong> {selectedSitios.join(", ")}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading report...</span>
          </div>
        ) : reportData ? (
          <>{renderOPTSummaryTable()}</>
        ) : (
          <div className="text-center text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
}