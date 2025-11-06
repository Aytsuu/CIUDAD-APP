import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../export/export-report";
import { ExportDropdown } from "../export/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useMedicineDetailedReports } from "./queries/fetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { toTitleCase } from "@/helpers/ToTitleCase";

export default function MonthlyMedicineDetails() {
  const location = useLocation();
  const state = location.state as {
    monthlyrcplist_id: string;
    month: string;
    monthName: string;
    recordCount: number;
    records: any[];
    report: any;
    medicineName?: string;
  };

  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const { monthlyrcplist_id, month, monthName, medicineName } = state || {};

  // Auto-set search term when medicineName is passed
  useEffect(() => {
    if (medicineName) {
      setSearchTerm(medicineName);
    }
  }, [medicineName]);

  // Use the hook with pagination parameters
  const { data: apiResponse, isLoading, error } = useMedicineDetailedReports(
    month, 
    currentPage, 
    pageSize, 
    searchTerm
  );

  // Extract data from the new response structure
  const responseData = apiResponse?.data || apiResponse?.results?.data;
  const records = useMemo(() => responseData?.records || [], [responseData]);
  const report = useMemo(() => responseData?.report || {}, [responseData]);
  
  // Get pagination info from API response
  const totalItems = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate display range
  const startIndex = totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

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
    }
  }, [error]);

  // Get the current search medicine for display
  const currentSearchMedicine = searchTerm || "All Medicines";

  const prepareExportData = () => {
    return records.map((record: any) => {
      const personalInfo = record?.pat_details?.personal_info;
      const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");
      const address = record?.pat_details?.address;

      return {
        "Date Requested": record.created_at ? new Date(record.created_at).toLocaleDateString() : "N/A",
        Name: toTitleCase(fullName) || "N/A",
        Address: address ? toTitleCase(`${address.full_address}`) : "N/A",
        "Medicine Name": record.med_details?.med_name ?? "N/A",
        "Medicine Details": `${record.med_details?.med_name || ''} ${record.med_details?.med_dsg || ''} ${record.med_details?.med_dsg_unit || ''} ${record.med_details?.med_form || ''}`.trim(),
        Quantity: record.total_allocated_qty ?? "N/A",
        Unit: record.unit || "N/A",
        Reason: record.reason || "No reason provided",
      };
    });
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    const fileName = searchTerm
      ? `medicine_${searchTerm.replace(/\s+/g, "_")}_${monthName}_${new Date().toISOString().slice(0, 10)}`
      : `medicine_records_${monthName}_${new Date().toISOString().slice(0, 10)}`;
    exportToCSV(dataToExport, fileName);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    const fileName = searchTerm
      ? `medicine_${searchTerm.replace(/\s+/g, "_")}_${monthName}_${new Date().toISOString().slice(0, 10)}`
      : `medicine_records_${monthName}_${new Date().toISOString().slice(0, 10)}`;
    exportToExcel(dataToExport, fileName);
  };

  const handleExportPDF = () => {
    exportToPDF();
  };

  const tableHeader = ["Date", "Name", "Address", "Medicine", "Quantity", "Reason"];

  const tableRows = records.map((record: any) => {
    const personalInfo = record?.pat_details?.personal_info;
    const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");
    const address = record?.pat_details?.address;

    // Combine medicine details into one string
    const medicineDetails = [
      record.med_details?.med_name,
      record.med_details?.med_dsg,
      record.med_details?.med_dsg_unit,
      record.med_details?.med_form
    ].filter(Boolean).join(" ");

    return [
      record.created_at ? new Date(record.created_at).toLocaleDateString() : "N/A",
      <div key={`${record.medreqitem_id}-name`} className="items-center">{toTitleCase(fullName) || "N/A"}</div>,
      <div key={`${record.medreqitem_id}-address`} className="items-center">
        {address ? toTitleCase(address.full_address) : "N/A"}
      </div>,
      <div key={`${record.medreqitem_id}-medicine`} className="items-center">
        {medicineDetails || "N/A"}
      </div>,
      <div key={`${record.medreqitem_id}-quantity`}>
        {record.total_allocated_qty ?? "N/A"} {record.unit ? `(${record.unit})` : ""}
      </div>,
      <div key={`${record.medreqitem_id}-reason`}>{record.reason || "No reason provided"}</div>,
    ];
  });

  return (
    <LayoutWithBack title="Medicine Distribution Records" description="View and manage monthly medicine distribution records">
      <div>
        {/* Controls Section */}
        <div className="bg-white border border-gray-200 p-6">
          {/* Search and Actions Row */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by patient name, medicine, reason..."
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
              {/* Show current filter info */}
              {medicineName && searchTerm === medicineName && (
                <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <span>
                    Showing results for: <strong>{medicineName}</strong>
                  </span>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-blue-100" onClick={() => setSearchTerm("")} title="Clear filter">
                    ×
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportPDF={handleExportPDF}
                  className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                />
              </div>

              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link
                  to={{
                    pathname: "/edit-monthly-recipient-list",
                  }}
                  state={{
                    reports: report,
                    monthlyrcplist_id: monthlyrcplist_id,
                    recordCount: totalItems,
                    state_office: report?.office || "",
                    state_control: report?.control_no || "",
                    year: month?.split("-")[0] || new Date().getFullYear().toString(),
                  }}
                >
                  <span className="font-medium">Edit Monthly List</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 border border-gray-200 p-4">
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
                {[10, 30, 50, 100].map((size) => (
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
              {searchTerm && ` for "${searchTerm}"`}
            </span>
            {!isLoading && totalPages > 1 && (
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />
            )}
          </div>
        </div>

        {/* Report Display Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto py-8">
          <div
            className="border border-black"
            style={{
              minHeight: "19in",
              width: "13in",
              position: "relative",
              margin: "0 auto",
              padding: "0.5in",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              height: "19in",
            }}
          >
            <div className="p-4 print-area" id="printable-area">
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
                <Label className="text-lg font-bold uppercase tracking-widest underline block">MEDICINE DISTRIBUTION RECORDS</Label>
                <Label className="font-medium text-gray-700 block text-sm">Month: {monthName}</Label>
                {searchTerm && <Label className="font-medium text-gray-700 block text-sm">Medicine: {searchTerm}</Label>}
              </div>
              {/* Report Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="font-medium text-sm whitespace-nowrap min-w-[120px]">Office:</Label>
                    <div className="text-sm border-b border-black flex-1 pb-1">{report?.office || "N/A"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-medium text-sm whitespace-nowrap min-w-[120px]">Medicine Description:</Label>
                    <div className="text-sm border-b border-black flex-1 pb-1">{currentSearchMedicine}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="font-medium text-sm whitespace-nowrap min-w-[100px]">Control No:</Label>
                    <div className="text-sm border-b border-black flex-1 pb-1">{report?.control_no || "N/A"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-medium text-sm whitespace-nowrap min-w-[100px]">Total Records:</Label>
                    <div className="text-sm border-b border-black flex-1 pb-1">{totalItems}</div>
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
                    tableClassName="border border-black rounded w-full"
                    bodyCellClassName="border border-black text-center text-sm p-2"
                    headerCellClassName="font-bold text-sm border border-black text-gray-900 text-center p-2"
                    defaultRowCount={30}
                  />
                </div>
              )}
              {/* Certification */}
              <div className="mt-6 mb-4">
                <Label className="text-sm font-normal ">Hereby certify that the names listed above are recipients of the medicines as indicated</Label>
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
                    <div className="border-b border-black w-64 text-center pb-1 text-sm">{toTitleCase(staffName)}</div>
                    <Label className="text-sm font-medium ">Printed Name and Signature</Label>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="border-b border-gray-400 w-64 text-center pb-1 text-sm">{toTitleCase(position)}</div>
                    <Label className="text-sm font-medium ">Position</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}