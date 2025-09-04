// MonthlyChildrenDetails.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Search, Loader2, User, MapPin } from "lucide-react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "../firstaid-report/export-report";
import { ExportDropdown } from "../firstaid-report/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select";
import { useMonthlyChildrenDetails } from "./queries/fetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { ChildDetail } from "./types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

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

export default function MonthlyNewChildrenDetails() {
  const location = useLocation();
  const state = location.state as {
    month: string;
    monthName: string;
    recordCount: number;
  };

  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { month, monthName, recordCount } = state || {};

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const { data: apiResponse, isLoading, error } = useMonthlyChildrenDetails(month || "");
  const childrenData = apiResponse?.records || [];
  const totalRecords = apiResponse?.total_records || 0;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch children details");
      toast("Retrying to fetch details...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [error]);

  const filteredRecords = useCallback(() => {
    if (!debouncedSearchTerm) return childrenData;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return childrenData.filter((record: ChildDetail) => {
      const childName = record.child_name?.toLowerCase() || "";
      const motherName = record.parents.mother?.toLowerCase() || "";
      const fatherName = record.parents.father?.toLowerCase() || "";
      const address = record.address?.toLowerCase() || "";
      const sitio = record.sitio?.toLowerCase() || "";
      const householdNo = record.household_no?.toLowerCase() || "";

      return (
        childName.includes(searchLower) ||
        motherName.includes(searchLower) ||
        address.includes(searchLower) ||
        sitio.includes(searchLower) ||
        householdNo.includes(searchLower)
      );
    });
  }, [childrenData, debouncedSearchTerm]);

  const filteredData = filteredRecords();
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedRecords = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startIndex = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredData.length);

  const prepareExportData = useCallback(() => {
    return filteredData.map((record: ChildDetail) => {
      return {
        "Date Added": record.created_at
          ? new Date(record.created_at).toLocaleDateString()
          : "N/A",
        "Child Name": record.child_name || "N/A",
        "Sex": record.sex || "N/A",
        "Date of Birth": record.date_of_birth || "N/A",
        "Age (months)": record.age_in_months || "N/A",
        "Mother's Name": record.parents.mother || "N/A",
        "Father's Name": record.parents.father || "N/A",
        "Address": record.address || "N/A",
        "Sitio": record.sitio || "N/A",
        "Household No": record.household_no || "N/A",
      };
    });
  }, [filteredData]);

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(
      dataToExport,
      `children_records_${monthName}_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(
      dataToExport,
      `children_records_${monthName}_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF(
      dataToExport,
      `children_records_${monthName}_${new Date().toISOString().slice(0, 10)}`
    );
  };

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

  const tableHeader = [
    "Date Added",
    "Child Name",
    "Sex",
    "Date of Birth",
    "Age (months)",
    "Mother's Name",
    "Father's Name",
    "Address",
    "Sitio",
  ];

  const tableRows = paginatedRecords.map((record: ChildDetail) => {
    return [
      record.created_at
        ? new Date(record.created_at).toLocaleDateString()
        : "N/A",
      <div className="flex items-center gap-2">
        {record.child_name || "N/A"}
      </div>,
      record.sex || "N/A",
      record.date_of_birth || "N/A",
      record.age_in_months || "N/A",
      record.parents.mother || "N/A",
      record.parents.father || "N/A",

      <div className="flex items-center justify-center gap-2">
        {record.address || "N/A"}
      </div>,
      record.sitio || "N/A",
    ];
  });

  return (
    <LayoutWithBack
      title="New Children Registration"
      description={`${monthName} Records`}
    >
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search records..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-20 h-8 bg-white border rounded-md text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
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
              `Showing ${startIndex} - ${endIndex} of ${filteredData.length} records`
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
          

            <div className="text-center py-2">
              <Label className="text-sm font-bold uppercase tracking-widest underline block">
                NEW CHILDREN REGISTRATION RECORDS
              </Label>
              <Label className="font-medium items-center block">
                Month: {monthName}
              </Label>
            </div>

            <div className="pb-4 border-b sm:items-center gap-4">
              <div className="flex flex-col space-y-2 mt-6">
                <div className="flex justify-between items-end">
                  <div className="flex items-end gap-2 flex-1 mr-8">
                    <Label className="font-medium whitespace-nowrap text-xs">
                      Total Records:
                    </Label>
                    <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                      {totalRecords} children
                    </div>
                  </div>

                  <div className="flex items-end gap-2 flex-1">
                    <Label className="text-xs font-medium whitespace-nowrap">
                      Report Date:
                    </Label>
                    <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex items-end gap-2 flex-1 mr-8">
                    <Label className="font-medium whitespace-nowrap text-xs">
                      Filter:
                    </Label>
                    <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                      {searchTerm || "All Records"}
                    </div>
                  </div>

                  <div className="flex items-end gap-2 flex-1">
                    <Label className="font-medium whitespace-nowrap text-xs">
                      Showing:
                    </Label>
                    <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                      {filteredData.length} of {totalRecords} records
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <span className="text-sm text-gray-600">
                    Loading children details...
                  </span>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {searchTerm
                      ? "No records found matching your search"
                      : "No records found for this month"}
                  </p>
                </div>
              </div>
            ) : (
              <TableLayout
                header={tableHeader}
                rows={tableRows}
                tableClassName="border rounded-lg mt-4"
                bodyCellClassName="border border-gray-600 text-center text-xs p-1"
                headerCellClassName="font-bold text-xs border border-gray-600 text-black text-center"
              />
            )}

            <div className="mt-4">
              <Label className="text-xs font-normal">
                This report shows all new children registered in the system for the specified month.
              </Label>
            </div>

          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}