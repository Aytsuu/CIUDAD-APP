import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Printer, Search } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../firstaid-report/export-report";
import { ExportDropdown } from "../firstaid-report/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select";
import { VaccinationRecord } from "../../vaccination/tables/columns/types";
import { useVaccineRecords} from "./queries/fetchQueries";

export default function MonthlyVaccinationDetails() {
  const location = useLocation();
  const state = location.state as {
    monthlyrcplist_id: string;
    month: string;
    monthName: string;
    recordCount: number;
    records: VaccinationRecord[];
    report: any;
  };

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { monthlyrcplist_id, month, monthName, recordCount } = state || {};

  const { data: apiResponse, isLoading, error } = useVaccineRecords(month);
  const monthlyData = apiResponse?.data || [];
  const currentMonthData =
    monthlyData.find((m) => m.month === month) || monthlyData[0];
  const records = currentMonthData?.records || [];
  const report = currentMonthData?.report;

  const staffDetails = report?.staff_details?.rp?.per;
  const signatureBase64 = report?.signature;
  const staffName = staffDetails
    ? `${staffDetails.per_fname} ${staffDetails.per_mname || ""} ${
        staffDetails.per_lname
      }`.trim()
    : "—";
  const position = report?.staff_details?.pos?.pos_title || "—";

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;

    const searchLower = searchTerm.toLowerCase();
    return records.filter((record: VaccinationRecord) => {
      const patient = record.patient;
      const personalInfo = patient?.personal_info;
      const fullName = [
        personalInfo?.per_fname,
        personalInfo?.per_mname,
        personalInfo?.per_lname,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const vaccineName = record.vaccine_stock?.vaccinelist?.vac_name?.toLowerCase() || "";
      const doseNumber = record.vachist_doseNo?.toString() || "";
      const date = record.date_administered
        ? new Date(record.date_administered).toLocaleDateString().toLowerCase()
        : "";
      const status = record.vachist_status?.toLowerCase() || "";

      return (
        fullName.includes(searchLower) ||
        vaccineName.includes(searchLower) ||
        doseNumber.includes(searchLower) ||
        date.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [records, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredRecords, currentPage, pageSize]);

  const prepareExportData = () => {
    return filteredRecords.map((record: VaccinationRecord) => {
      const patient = record.patient;
      const personalInfo = patient?.personal_info;
      const fullName = [
        personalInfo?.per_fname,
        personalInfo?.per_mname,
        personalInfo?.per_lname,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        "Date Administered": record.date_administered
          ? new Date(record.date_administered).toLocaleDateString()
          : "N/A",
        "Patient Name": fullName || "N/A",
        "Vaccine Name": record.vaccine_stock?.vaccinelist?.vac_name ?? "N/A",
        "Dose Number": record.vachist_doseNo ?? "N/A",
        "Age at Vaccination": record.vachist_age || "N/A",
        "Status": record.vachist_status || "No status provided",
        "Follow-up Date": record.follow_up_visit?.followv_date 
          ? new Date(record.follow_up_visit.followv_date).toLocaleDateString() 
          : "N/A"
      };
    });
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(
      dataToExport,
      `vaccination_records_${monthName}_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(
      dataToExport,
      `vaccination_records_${monthName}_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF(
      dataToExport,
      `vaccination_records_${monthName}_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
  };

  const tableHeader = [
    "Date Administered",
    "Patient Name",
    "Patient ID",
    "Vaccine Name",
    "Dose No.",
    "Age",
    "Status",
    "Follow-up Date"
  ];

  const tableRows = paginatedRecords.map((record: VaccinationRecord) => {
    const patient = record.patient;
    const personalInfo = patient?.personal_info;
    const fullName = [
      personalInfo?.per_fname,
      personalInfo?.per_mname,  
      personalInfo?.per_lname,
    ]
      .filter(Boolean)
      .join(" ");

    return [
      record.date_administered
        ? new Date(record.date_administered).toLocaleDateString()
        : "N/A",
      <div className="w-32">{fullName || "N/A"}</div>,
      record.vaccine_stock?.vaccinelist?.vac_name ?? "N/A",
      record.vachist_doseNo ?? "N/A",
      record.vachist_age || "N/A",
      record.vachist_status || "No status provided",
      record.follow_up_visit?.followv_date 
        ? new Date(record.follow_up_visit.followv_date).toLocaleDateString() 
        : "N/A"
    ];
  });

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-80 bg-white rounded-md border border-gray-200 h-fit overflow-hidden">
        <div className="flex flex-col">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2">
            <div className="flex items-center justify-between mb-4">
              <Button
                className="hover:bg-transparent hover:text-blue-700 text-gray-600"
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="font-medium text-sm">Back</span>
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Export Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="font-medium text-gray-800 text-sm">
                  Export Options
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportPDF={handleExportPDF}
                  className="w-full border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                />
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="w-full gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 hover:text-blue-700 transition-all duration-200"
                >
                  <Printer className="h-4 w-4" />
                  <span className="text-sm">Print Report</span>
                </Button>
              </div>
            </div>

            {/* Primary Action */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h4 className="font-medium text-gray-800 text-sm">Actions</h4>
              </div>

              <Button className="w-full" asChild>
                <Link
                  to={{
                    pathname: "/edit-monthly-recipient-list",
                  }}
                  state={{
                    reports: report,
                    monthlyrcplist_id: monthlyrcplist_id,
                    recordCount: recordCount,
                    state_office: report?.office || "",
                    state_control: report?.control_no || "",
                    year:
                      month?.split("-")[0] ||
                      new Date().getFullYear().toString(),
                  }}
                >
                  <span className="font-medium">Edit Monthly List</span>
                </Link>
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h4 className="font-medium text-gray-800 text-sm">
                  Search & Filter
                </h4>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search records..."
                  className="w-full pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm rounded-lg transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={() => setSearchTerm("")}
                  >
                  </Button>
                )}
              </div>

              {/* Page Size Selector */}
              <div className="space-y-2">
                <Label className="text-gray-700 text-xs font-medium uppercase tracking-wide">
                  Show Entries
                </Label>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    const numValue = parseInt(value);
                    setPageSize(numValue >= 1 ? numValue : 1);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} per page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pagination */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <h4 className="font-medium text-gray-800 text-sm">
                    Navigation
                  </h4>
                </div>
                <div className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              <div className="flex justify-center">
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 pb-10">
        <div
          className="bg-white py-4 px-4"
          id="printable-area"
          style={{
            width: "8.5in",
            minHeight: "14in",
            position: "relative",
            margin: "0 auto",
            paddingBottom: "120px",
          }}
        >
          <div className="p-2 border-black flex items-center">
            <div className="left-0 top-0 flex items-center justify-center w-28 h-28 bg-gray-200 rounded-full">
              <div className="text-xs text-gray-500">Upload Logo</div>
            </div>

            <div className="flex-1 text-center mr-28">
              <Label className="text-xs font-bold uppercase block">
                Republic of the Philippines
              </Label>
              <Label className="text-sm font-bold uppercase block">
                Cebu City Health Department
              </Label>
              <Label className="text-xs block">
                General Maxilom Extension, Carreta, Cebu City
              </Label>
              <Label className="text-xs block">(032) 232-6820; 232-6863</Label>
            </div>
          </div>

          <div className="text-center py-2">
            <Label className="text-sm font-bold uppercase tracking-widest underline block">
              VACCINATION RECORDS
            </Label>
            <Label className="font-medium items-center block">
              Month: {monthName}
            </Label>
          </div>

          <div className="pb-4 order-b sm:items-center gap-4">
            <div className="flex flex-col space-y-2 mt-6">
              <div className="flex justify-between items-end">
                <div className="flex items-end gap-2 flex-1 mr-8">
                  <Label className="font-medium whitespace-nowrap text-xs">
                    Office:
                  </Label>
                  <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                    {report?.office || "N/A"}
                  </div>
                </div>

                <div className="flex items-end gap-2 flex-1">
                  <Label className="text-xs font-medium whitespace-nowrap">
                    Control No:
                  </Label>
                  <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                    {report?.control_no || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="flex items-end gap-2 flex-1 mr-8">
                  <Label className="font-medium whitespace-nowrap text-xs">
                    Vaccine Description:
                  </Label>
                  <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                    {searchTerm || "All Vaccines"}
                  </div>
                </div>

                <div className="flex items-end gap-2 flex-1">
                  <Label className="font-medium whitespace-nowrap text-xs">
                    Total:
                  </Label>
                  <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                    {filteredRecords.length} records
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TableLayout
            header={tableHeader}
            rows={tableRows}
            tableClassName="border rounded-lg"
            bodyCellClassName="border border-gray-600 text-center text-xs p-1"
            headerCellClassName="font-bold text-xs border border-gray-600 text-black text-center"
          />

          <div className="mt-4">
            <Label className="text-xs font-normal">
              Hereby certify that the names listed above are recipients of the
              vaccines as indicated
            </Label>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: 0,
              right: 0,
              padding: "0 32px",
            }}
          >
            <div className="mt-8">
              {signatureBase64 && (
                <div className="flex justify-center relative">
                  <div>
                    <img
                      src={`data:image/png;base64,${signatureBase64}`}
                      alt="Authorized Signature"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <div className="flex justify-center flex-col items-center">
                  <div className="border-b border-b-black w-48 text-xs text-center pb-1">
                    {staffName}
                  </div>
                  <Label className="text-xs font-medium">
                    Printed Name and Signature
                  </Label>
                </div>

                <div className="flex justify-center flex-col items-center">
                  <div className="border-b border-b-black text-xs w-48 text-center pb-1">
                    {position}
                  </div>
                  <Label className="text-xs font-medium">Position</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}