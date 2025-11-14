// MonthlyMorbidityDetails.tsx
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Loader2, Edit } from "lucide-react";
import { exportToPDF } from "../export/export-report";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useMonthlyMorbidityDetails } from "./queries/fetch";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { EditHeaderDialog } from "./edit_header";

interface MonthlyMorbidityDetailsProps {
  state?: {
    month: string;
    monthName: string;
    recordCount?: number;
    totalIllnesses?: number;
  };
  showLayout?: boolean;
}

export default function MonthlyMorbidityDetails({ state: propState }: MonthlyMorbidityDetailsProps) {
  const location = useLocation();
  const locationState = location.state as {
    month: string;
    monthName: string;
    recordCount: number;
    totalIllnesses: number;
  };

  // Use prop state if provided, otherwise fall back to location state
  const state = propState || locationState;

  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { month } = state || {};

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // The hook should now handle pagination parameters
  const { data: apiResponse, isLoading, error } = useMonthlyMorbidityDetails(month || "", currentPage, pageSize, "");

  // Extract paginated data from API response
  const morbidityData = useMemo(() => apiResponse?.morbidity_data || [], [apiResponse]);
  const headerDisplay = useMemo(() => apiResponse?.header_recipient_list || {}, [apiResponse]);

  // Get pagination metadata from API response
  const paginationInfo = useMemo(() => {
    if (!apiResponse) return null;

    // Django REST framework pagination response structure
    return {
      count: apiResponse.count || morbidityData.length,
      next: apiResponse.next,
      previous: apiResponse.previous,
      totalPages: Math.ceil((apiResponse.count || morbidityData.length) / pageSize),
    };
  }, [apiResponse, morbidityData.length, pageSize]);

  const totalItems = paginationInfo?.count || 0;
  const totalPages = paginationInfo?.totalPages || 1;

  // Calculate display range
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch morbidity details");
    }
  }, [error]);

  const handleExportPDF = () => {
    exportToPDF("landscape");
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  // Create table header with M and F under each age group
  const tableHeader = useMemo(() => {
    if (!morbidityData.length || !morbidityData[0]?.age_groups) {
      return ["Illness", "Code", "Total M", "Total F", "Total Both"];
    }

    const ageGroupHeaders: any[] = [];

    morbidityData[0].age_groups.forEach((ageGroup: any) => {
      ageGroupHeaders.push({
        main: ageGroup.age_range,
        subHeaders: ["M", "F"],
      });
    });

    return [{ main: "Illness", colSpan: 1 }, { main: "Code", colSpan: 1 }, ...ageGroupHeaders, { main: "Total M", colSpan: 1 }, { main: "Total F", colSpan: 1 }, { main: "Total Both", colSpan: 1 }];
  }, [morbidityData]);

  // Create table rows with M, F for each age group
  const tableRows = useMemo(() => {
    return morbidityData.map((illness: any) => {
      const ageGroupCells: any[] = [];

      // For each age group, create cells for M, F
      illness.age_groups.forEach((ageGroup: any) => {
        ageGroupCells.push(
          <div key={`${illness.illness_id}-${ageGroup.age_range}-M`} className="text-center">
            {ageGroup.M}
          </div>,
          <div key={`${illness.illness_id}-${ageGroup.age_range}-F`} className="text-center">
            {ageGroup.F}
          </div>
        );
      });

      return [
        <div key={`${illness.illness_id}-name`} className="text-left min-w-[150px]">
          <div className="font-medium">{illness.illness_name}</div>
        </div>,
        <div key={`${illness.illness_id}-code`} className="text-center w-[90px] break-words whitespace-pre-line">
          {illness.illness_description || ""}
        </div>,
        ...ageGroupCells,
        <div key={`${illness.illness_id}-total-m`} className="text-center font-bold">
          {illness.totals.M}
        </div>,
        <div key={`${illness.illness_id}-total-f`} className="text-center font-bold">
          {illness.totals.F}
        </div>,
        <div key={`${illness.illness_id}-total-both`} className="text-center font-bold">
          {illness.totals.Both}
        </div>,
      ];
    });
  }, [morbidityData]);

  // Custom table header renderer to handle main headers and subheaders
  const renderCustomHeader = () => {
    if (!tableHeader.length) return null;

    return (
      <thead>
        {/* Custom Info Row (Province, Municipality/City, Health Facility, Projected Population) */}
        <tr className="h-40">
          <th className="px-4 border border-black" style={{ width: "7rem" }}>
            {headerDisplay.doh_logo ? (
              <img
                src={headerDisplay.doh_logo || ""}
                alt="Department Logo"
                style={{ width: "90px", height: "90px", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="text-xs text-gray-500 text-center" style={{ width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                No Logo
              </div>
            )}
          </th>
          <th colSpan={tableHeader.reduce((total: number, header: any) => total + (header.subHeaders ? header.subHeaders.length : 1), 1)} className="p-0 border-b-0 border-black">
            <div className="flex w-full">
              <div className="flex flex-col flex-1 justify-around items-center">
                <div className="flex justify-center items-center py-2 border-b border-black w-full bg-gray-200">
                  <Label className="text-2xl font-bold italic">FHIS REPORT</Label>
                </div>
                <div className="flex px-8 py-2 items-center justify-between w-full gap-14">
                  <div className="flex flex-col items-center min-w-[120px] flex-1">
                    <span className="h-4 font-medium pb-7 w-full border-b border-black">{headerDisplay.province}</span>
                    <Label className="text-md font-normal italic">Province</Label>
                  </div>
                  <div className="flex flex-col items-center min-w-[150px] flex-1">
                    <span className="h-4 font-medium pb-7 w-full border-b border-black">{headerDisplay.city}</span>
                    <Label className="text-md font-normal italic">Municipality/City</Label>
                  </div>
                  <div className="flex flex-col items-center min-w-[150px] flex-1">
                    <span className="h-4 font-medium pb-7 w-full border-b border-black">{headerDisplay.health_facility}</span>
                    <Label className="text-md font-normal italic">Health Facility</Label>
                  </div>
                  <div className="flex flex-col items-center min-w-[200px] flex-1">
                    <span className="h-4 font-medium pb-7 w-full border-b border-black">{headerDisplay.total_resident}</span>
                    <Label className="text-md font-normal italic">Projected Population of the Year</Label>
                  </div>
                </div>
                <div className="flex justify-center items-center py-2 border-t border-black w-full">
                  <Label className="text-md font-bold">MORBIDITY Report</Label>
                </div>
              </div>

              <div className="w-52 border-l border-black h-40 flex items-center justify-center">
                <div className="flex flex-col justify-center items-center w-full">
                  <Label className="text-7xl pb-8">M2</Label>
                  <Label>Total / Annual {month?.includes(" ") ? month?.split(" ")[0] : month?.slice(0, 4)}</Label>
                </div>
              </div>
            </div>
          </th>
        </tr>

        {/* Main Header Row */}
        <tr>
          {tableHeader.map((header: any, index: number) => (
            <th
              key={`main-${index}`}
              colSpan={header.colSpan || (header.subHeaders ? header.subHeaders.length : 1)}
              className={`font-bold text-sm border border-black text-black text-center p-2 ${index === 0 ? "min-w-[150px]" : ""}`}
            >
              {header.main}
            </th>
          ))}
        </tr>

        {/* Sub Header Row */}
        <tr>
          {tableHeader.map((header: any, index: number) => {
            if (header.subHeaders) {
              return header.subHeaders.map((subHeader: string, subIndex: number) => (
                <th key={`sub-${index}-${subIndex}`} className="font-bold text-xs border border-black text-black text-center p-2">
                  {subHeader}
                </th>
              ));
            } else {
              // For the last header, show "Both" instead of blank
              if (index === tableHeader.length - 1) {
                return (
                  <th key={`sub-${index}`} className={`font-bold text-xs border border-black text-black text-center p-1 ${index === 0 ? "min-w-[150px]" : ""}`}>
                    Both
                  </th>
                );
              }
              return (
                <th key={`sub-${index}`} className={`font-bold text-xs border border-black text-black text-center p-1 ${index === 0 ? "min-w-[150px]" : ""}`}>
                  &nbsp;
                </th>
              );
            }
          })}
        </tr>
      </thead>
    );
  };

  return (
    <>
      {/* Export Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-end gap-2 items-center mb-4">
            <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2">
              <Printer className="h-4 w-4 mr-1" />
              Export PDF
            </Button>

            {/* Add the Edit Header Button */}
            <Button onClick={() => setIsEditDialogOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4" />
              Edit Header
            </Button>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 h-8 bg-white border rounded-md text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[15, 30, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  `Showing ${startIndex} to ${endIndex} of ${totalItems} illnesses`
                )}
              </span>
              {/* {!isLoading && totalPages > 1 && ( */}
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />
              {/* )} */}
            </div>
          </div>

          {/* Morbidity Data Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Loading morbidity details...</span>
                </div>
              </div>
            ) : (
              <div
                className="overflow-x-auto print-area"
                id="printable-area"
                style={{
                  width: "19in",
                  position: "relative",
                  margin: "0 auto",
                  padding: "0.5in",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <table className="w-full border border-black">
                  {renderCustomHeader()}
                  <tbody>
                    {morbidityData.length > 0 ? (
                      tableRows.map((row: any, rowIndex: number) => (
                        <tr key={rowIndex}>
                          {row.map((cell: any, cellIndex: number) => (
                            <td key={cellIndex} className="border border-black text-sm p-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : null}
                    {/* Empty rows for consistent height */}
                    {Array.from({ length: pageSize - morbidityData.length }).map((_, index) => (
                      <tr key={`empty-${index}`}>
                        {Array.from({ length: tableHeader.reduce((total: number, header: any) => total + (header.subHeaders ? header.subHeaders.length : 1), 0) }).map((_, cellIndex) => (
                          <td key={cellIndex} className="border border-black text-sm p-2 h-11">
                            &nbsp;
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add the EditHeaderDialog component */}
      <EditHeaderDialog isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} headerData={headerDisplay} />
    </>
  );
}
