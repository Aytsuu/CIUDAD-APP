import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Printer, Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../export/export-report";
import { ExportDropdown } from "../export/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useVaccineReports } from "./queries/fetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { getOrdinalSuffix } from "@/helpers/getOrdinalSuffix";
import { MonthlyVaccineRecord } from "./types";
import { toTitleCase } from "@/helpers/ToTitleCase";
import { calculateAge } from "@/helpers/ageCalculator";

export default function MonthlyVaccinationDetails() {
  const location = useLocation();
  const state = location.state as {
    monthlyrcplist_id: string;
    month: string;
    monthName: string;
    recordCount: number;
  };

  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(18);
  const [currentPage, setCurrentPage] = useState(1);

  const { month, monthName } = state || {};

  const { data: apiResponse, isLoading, error } = useVaccineReports(month);
  const monthlyData = apiResponse?.data as { records: MonthlyVaccineRecord[]; report: any } | undefined;

  const records = useMemo(() => monthlyData?.records || [], [monthlyData]);
  const report = monthlyData?.report;

  // const signatureBase64 = report?.signature;

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
      const patient = record.patient;
      const personalInfo = patient?.personal_info;
      const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ").toLowerCase();

      const vaccineName = record.vaccine_stock?.vaccinelist?.vac_name?.toLowerCase() || "";
      const doseNumber = record.vachist_doseNo?.toString() || "";
      const date = record.date_administered ? new Date(record.date_administered).toLocaleDateString().toLowerCase() : "";
      const status = record.vachist_status?.toLowerCase() || "";

      return fullName.includes(searchLower) || vaccineName.includes(searchLower) || doseNumber.includes(searchLower) || date.includes(searchLower) || status.includes(searchLower);
    });
  }, [records, searchTerm]);

  // Total items count
  const totalItems = report?.total_items ? Number(report.total_items) : filteredRecords.length;

  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Pagination info indexes
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const prepareExportData = () => {
    return filteredRecords.map((record: any) => {
      const patient = record.patient;
      const personalInfo = patient?.personal_info;
      const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");
      const address = patient?.address?.full_address || "N/A";

      return {
        Date: record.date_administered ? new Date(record.date_administered).toLocaleDateString() : "N/A",
        Name: toTitleCase(fullName || "N/A"),
        DOB: personalInfo?.per_dob ? new Date(personalInfo.per_dob).toLocaleDateString() : "N/A",
        Address: toTitleCase(address), // Place the address column after DOB
        "Vaccine Name": record.vaccine_stock?.vaccinelist?.vac_name ?? "N/A",
        "Dose Number": record.vachist_doseNo ? `${getOrdinalSuffix(Number(record.vachist_doseNo))} dose` : "N/A",
        "Age at Vaccination": personalInfo?.per_dob && record.created_at ? calculateAge(personalInfo.per_dob, record.created_at) : "N/A",
        Status: record.vachist_status || "No status provided",
        "Follow-up Date": record.follow_up_visit?.followv_date ? new Date(record.follow_up_visit.followv_date).toLocaleDateString() : "N/A",
      };
    });
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `vaccination_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `vaccination_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    exportToPDF("landscape");
  };

  // Update the table header to place "Address" after "DOB"
  const tableHeader = ["Date", "Name", "DOB", "Address", "Vaccine Name", "Dose No.", "Age"];

  // Update the tableRows to place the address column after DOB
  const tableRows = paginatedRecords.map((record: any) => {
    const patient = record.patient;
    const personalInfo = patient?.personal_info;
    const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");

    // Calculate age using created_at date and patient DOB
    const age = personalInfo?.per_dob && record.created_at ? calculateAge(personalInfo.per_dob, record.created_at) : "N/A";

    // Extract the full address
    const address = patient?.address?.full_address || "N/A";

    return [
      record.date_administered ? new Date(record.date_administered).toLocaleDateString() : "N/A",
      toTitleCase(fullName || "N/A"),
      personalInfo?.per_dob ? new Date(personalInfo.per_dob).toLocaleDateString() : "N/A",
      toTitleCase(address), // Place the address column after DOB
      record.vaccine_stock?.vaccinelist?.vac_name ?? "N/A",
      record.vachist_doseNo ? `${getOrdinalSuffix(Number(record.vachist_doseNo))} dose` : "N/A",
      age, // Use the calculated age instead of record.vachist_age
    ];
  });

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center ">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Monthly Vaccination Records</h1>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        {/* Export Actions */}
        <div className="bg-white p-4  border">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search records..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className=" px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[18].map((size) => (
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
              Showing {startIndex} - {endIndex} of {totalItems} records
            </span>
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />
          </div>
        </div>
      </div>

      {/* PRINTTABLE REPORT */}
      <div className="flex-1 mb-10 bg-white">
        <div
          style={{
            width: "16in",
            overflowX: "auto",
            position: "relative",
            margin: "0 auto",
            fontSize: "12px",
          }}
        >
          <div className=" py-4 px-4" id="printable-area">
            <div className="text-center py-2">
              <Label className="text-sm font-bold uppercase tracking-widest underline block">VACCINATION RECORDS</Label>
              <Label className="font-medium items-center block">Month: {monthName}</Label>
            </div>

            <div className="pb-4 order-b sm:items-center gap-4">
              <div className="flex flex-col space-y-2 mt-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-end gap-2 flex-1 mr-8">
                    <Label className="font-medium whitespace-nowrap text-xs">Vaccine Name:</Label>
                    <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">{searchTerm || "All Vaccines"}</div>
                  </div>

                  <div className="flex items-end gap-2 flex-1">
                    <Label className="font-medium whitespace-nowrap text-xs">Total:</Label>
                    <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">{filteredRecords.length} records</div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500  items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">loading....</span>
              </div>
            ) : (
              <TableLayout
                header={tableHeader}
                rows={tableRows}
                tableClassName="border rounded-lg w-full"
                bodyCellClassName="border border-gray-600 text-center text-sm p-2"
                headerCellClassName="font-bold text-sm border border-gray-600 text-black text-center p-2"
                defaultRowCount={18}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
