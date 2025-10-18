import { useState, useMemo, useEffect } from "react";
import {  useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "./export-report";
import { ExportDropdown } from "./export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useFirstAidReports } from "@/pages/healthServices/reports/firstaid-report/queries/fetch";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function MonthlyFirstAidDetails() {
  const location = useLocation();
  const state = location.state as {
    monthlyrcplist_id: string;
    month: string;
    monthName: string;
    recordCount: number;
  };

  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { monthlyrcplist_id, month, monthName } = state;

  const { data: apiResponse, isLoading, error } = useFirstAidReports(month, currentPage, pageSize, searchTerm);

  // Safely access the nested data
  const results = apiResponse?.results || {
    data: [],
    records: [],
    report: {
      staff_details: {} as any,
      signature: "",
      control_no: "",
      office: ""
    },
    total_months: 0,
    record_count: 0
  };

  const records = results.records || [];
  const report = results.report || {};
  // const totalRecords = results.record_count;

  const staffDetails = report?.staff_details?.rp?.per;
  const signatureBase64 = report?.signature;
  const staffName = staffDetails ? `${staffDetails.per_fname} ${staffDetails.per_mname || ""} ${staffDetails.per_lname}`.trim() : "—";
  const position = report?.staff_details?.pos?.pos_title || "—";

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch report");
      toast("Retrying to fetch report...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [error]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;

    const searchLower = searchTerm.toLowerCase();
    return records.filter((record: any) => {
      const patient = record.patrec_details;
      const personalInfo = patient?.pat_details?.personal_info;
      const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ").toLowerCase();

      const itemName = record.finv_details?.fa_detail?.fa_name?.toLowerCase() || "";
      const reason = record.reason?.toLowerCase() || "";
      const date = record.created_at ? new Date(record.created_at).toLocaleDateString().toLowerCase() : "";
      const address = record.patrec_details?.pat_details?.address?.full_address?.toLowerCase() || "";

      return fullName.includes(searchLower) || itemName.includes(searchLower) || reason.includes(searchLower) || date.includes(searchLower) || address.includes(searchLower);
    });
  }, [records, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Calculate pagination info
  const totalItems = filteredRecords.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const prepareExportData = () => {
    return filteredRecords.map((record: any) => {
      const patient = record.patrec_details;
      const personalInfo = patient?.pat_details?.personal_info;
      const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");

      return {
        "Date Administered": record.created_at ? new Date(record.created_at).toLocaleDateString() : "N/A",
        "Patient Name": fullName || "N/A",
        "Patient ID": patient?.pat_details?.pat_id || "",
        "Item Name": record.finv_details?.fa_detail?.fa_name ?? "N/A",
        "Quantity Used": record.qty ?? "N/A",
        Reason: record.reason || "No reason provided"
      };
    });
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `first_aid_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `first_aid_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    exportToPDF(`first_aid_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;

    const printStyles = `
      <style>
        @media print {
          @page {
            size: 8.5in 13in;
            margin: 0.5in;
          }
          body {
            margin: 0;
            padding: 0;
            height: 100vh;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            width: 100% !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            position: relative;
          }
          .signature-section {
            position: absolute;
            bottom: 0.5in;
            left: 0.5in;
            right: 0.5in;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          .content-area {
            min-height: calc(13in - 2in);
            padding-bottom: 2in;
          }
        }
      </style>
    `;

    const originalContents = document.body.innerHTML;
    const printableContent = printContent.innerHTML;

    document.body.innerHTML = printStyles + printableContent;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const tableHeader = ["Date Administered", "Patient Name", "Address", "Item Name", "Quantity Used", "Reason"];

  const tableRows = paginatedRecords.map((record: any) => {
    const patient = record.patrec_details;
    const personalInfo = patient?.pat_details?.personal_info;
    const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");

    return [
      record.created_at ? new Date(record.created_at).toLocaleDateString() : "N/A",
      <div className="w-32">{fullName || "N/A"}</div>,
      record.patrec_details?.pat_details?.address?.full_address || "N/A",
      record.finv_details?.fa_detail?.fa_name ?? "N/A",
      record.qty ?? "N/A",
      record.reason || "No reason provided"
    ];
  });

  return (
    <LayoutWithBack title="First Aid Records" description="View and manage monthly first aid records">
      <div>
        {/* Controls Section - Hidden when printing */}
        <div className="bg-white border border-gray-200 p-6 no-print">
          {/* Search and Actions Row */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Search records..." 
                  className="w-full pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm rounded-lg transition-all duration-200" 
                  value={searchTerm} 
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }} 
                />
                {searchTerm && (
                  <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100" onClick={() => setSearchTerm("")}>
                    ×
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200" />
                <Button variant="outline" onClick={handlePrint} className="gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 hover:text-blue-700 transition-all duration-200">
                  <Printer className="h-4 w-4" />
                  <span className="text-sm">Print Report</span>
                </Button>
              </div>

              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link
                  to={{
                    pathname: "/edit-monthly-recipient-list"
                  }}
                  state={{
                    reports: report,
                    monthlyrcplist_id: monthlyrcplist_id,
                    recordCount: totalItems,
                    state_office: report?.office || "",
                    state_control: report?.control_no || "",
                    year: month?.split("-")[0] || new Date().getFullYear().toString()
                  }}
                >
                  <span className="font-medium">Edit Monthly List</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 border border-gray-200 p-4 no-print">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Label className="text-gray-700 text-sm whitespace-nowrap">Show</Label>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                const numValue = parseInt(value);
                setPageSize(numValue >= 1 ? numValue : 1);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label className="text-gray-700 text-sm whitespace-nowrap">entries per page</Label>
          </div>

          {/* Pagination Info */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-sm text-gray-600">
              Showing {startIndex} to {endIndex} of {totalItems} entries
            </span>
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />
          </div>
        </div>

        {/* Printable Report Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div
            className="p-8 print-area"
            id="printable-area"
            style={{
              minHeight: "13in",
              position: "relative",
              margin: "0 auto",
              padding: "0.5in",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              height: "13in"
            }}
          >
            {/* Main Content Area */}
            <div className="content-area flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 border-black flex items-center">
                  <div className="left-0 top-0 flex items-center justify-center w-28 h-28 bg-gray-200 rounded-full overflow-hidden">
                    {report.logo ? (
                      <img
                        src={report.logo || ""}
                        alt="Department Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-xs text-gray-500 text-center">No Logo</div>
                    )}
                  </div>
                </div>
                <div className="flex-1 text-center mx-4">
                  <Label className="text-xs font-bold uppercase block text-gray-700">Republic of the Philippines</Label>
                  <Label className="text-sm font-bold uppercase block">Cebu City Health Department</Label>
                  <Label className="text-xs block text-gray-600">General Maxilom Extension, Carreta, Cebu City</Label>
                  <Label className="text-xs block text-gray-600">(032) 232-6820; 232-6863</Label>
                </div>
                <div className="w-24"></div>
              </div>

              {/* Title */}
              <div className="text-center py-2 mb-6 pb-4">
                <Label className="text-lg font-bold uppercase tracking-widest underline block">FIRST AID RECORDS LEDGER</Label>
                <Label className="font-medium text-gray-700 block text-sm">Month: {monthName}</Label>
              </div>

              {/* Report Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="font-medium text-sm whitespace-nowrap min-w-[120px]">Office:</Label>
                    <div className="text-sm border-b flex-1 pb-1">{report?.office || "N/A"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-medium text-sm whitespace-nowrap min-w-[120px]">Item Description:</Label>
                    <div className="text-sm border-b flex-1 pb-1">{searchTerm || "All Items"}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="font-medium text-sm whitespace-nowrap min-w-[100px]">Control No:</Label>
                    <div className="text-sm border-b flex-1 pb-1">{report?.control_no || "N/A"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-medium text-sm whitespace-nowrap min-w-[100px]">Total Records:</Label>
                    <div className="text-sm border-b flex-1 pb-1">{filteredRecords.length}</div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              {isLoading ? (
                <div className="w-full h-32 flex items-center justify-center text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm">Loading records...</span>
                </div>
              ) : (
                <div className="w-full">
                  <TableLayout 
                    header={tableHeader} 
                    rows={tableRows} 
                    tableClassName="border rounded w-full" 
                    bodyCellClassName="border text-center text-xs p-2" 
                    headerCellClassName="font-bold text-xs border text-gray-900 text-center p-2" 
                  />
                </div>
              )}

              {/* Certification */}
              <div className="mt-6 mb-4">
                <Label className="text-sm font-normal text-gray-700">Hereby certify that the names listed above are recipients of the first aid items as indicated</Label>
              </div>
            </div>

            {/* Signature Section */}
            <div className="signature-section mt-auto pt-8">
              <div className="flex flex-col items-center gap-6">
                {signatureBase64 && (
                  <div className="mb-2">
                    <img src={`data:image/png;base64,${signatureBase64}`} alt="Authorized Signature" className="h-12 w-auto object-contain" />
                  </div>
                )}

                <div className="flex flex-col items-center gap-1">
                  <div className="border-b border-gray-400 w-64 text-center pb-1 text-sm">{staffName}</div>
                  <Label className="text-xs font-medium text-gray-600">Printed Name and Signature</Label>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="border-b border-gray-400 w-64 text-center pb-1 text-sm">{position}</div>
                  <Label className="text-xs font-medium text-gray-600">Position</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}