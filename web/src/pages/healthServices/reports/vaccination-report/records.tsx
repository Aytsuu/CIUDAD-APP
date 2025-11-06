import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToPDF } from "../export/export-report";
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
import { toTitleCase } from "@/helpers/ToTitleCase";
import { calculateAge } from "@/helpers/ageCalculator";

// Helper function to convert base64 to image file
const base64ToImageFile = async (base64Data: string, fileName: string): Promise<File | null> => {
  try {
    let dataUrl = base64Data;

    // If it's raw base64 without data URL prefix, add it
    if (base64Data.startsWith("iVBORw0KGgo")) {
      dataUrl = `data:image/png;base64,${base64Data}`;
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: "image/png" });
  } catch (error) {
    console.error("Error converting base64 to file:", error);
    return null;
  }
};

export default function MonthlyVaccinationDetails() {
  const location = useLocation();
  const state = location.state as {
    month: string;
    monthName: string;
    recordCount: number;
  };

  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const { month, monthName } = state || {};

  // Use the hook with pagination parameters
  const { data: apiResponse, isLoading, error } = useVaccineReports(month, currentPage, pageSize, searchTerm);

  // Add a defensive check to ensure apiResponse is defined before accessing its properties
  const responseData = apiResponse?.results || {};
  const records = useMemo(() => responseData?.records || [], [responseData]);

  // Get pagination info from API response
  const totalItems = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate display range
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch vaccination records");
    }
  }, [error]);

  const prepareExportData = () => {
    return records.map((record: any) => {
      const patient = record.patient;
      const personalInfo = patient?.personal_info;
      const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");
      const address = patient?.address?.full_address || "N/A";
      const vitalSigns = record.vital_signs;

      return {
        Date: record.date_administered ? new Date(record.date_administered).toLocaleDateString() : "N/A",
        Name: toTitleCase(fullName || "N/A"),
        DOB: personalInfo?.per_dob ? new Date(personalInfo.per_dob).toLocaleDateString() : "N/A",
        Address: toTitleCase(address),
        "Vaccine Name": record.vac_details?.vac_name || record.vaccine_stock?.vaccinelist?.vac_name || "N/A",
        "Dose Number": record.vachist_doseNo ? `${getOrdinalSuffix(Number(record.vachist_doseNo))} dose` : "N/A",
        "Age at Vaccination": personalInfo?.per_dob && record.created_at ? calculateAge(personalInfo.per_dob, record.created_at) : "N/A",
        Status: record.vachist_status || "No status provided",
        "Follow-up Date": record.follow_up_visit?.followv_date ? new Date(record.follow_up_visit.followv_date).toLocaleDateString() : "N/A",
        // Vital Signs
        "BP Systolic": vitalSigns?.vital_bp_systolic || "N/A",
        "BP Diastolic": vitalSigns?.vital_bp_diastolic || "N/A",
        Temperature: vitalSigns?.vital_temp ? `${vitalSigns.vital_temp}°C` : "N/A",
        "Respiratory Rate": vitalSigns?.vital_RR || "N/A",
        "Oxygen Saturation": vitalSigns?.vital_o2 || "N/A",
        "Pulse Rate": vitalSigns?.vital_pulse || "N/A",
        "Vital Signs Taken": vitalSigns?.created_at ? new Date(vitalSigns.created_at).toLocaleDateString() : "N/A",
        // Signature info
        "Signature Available": record.signature ? "Yes" : "No",
      };
    });
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const dataToExport = prepareExportData();
      exportToCSV(dataToExport, `vaccination_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
      console.error("CSV export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      // Dynamically import xlsx library
      const XLSX = await import("xlsx");

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Prepare data for Excel
      const excelData = records.map((record: any, index: number) => {
        const patient = record.patient;
        const personalInfo = patient?.personal_info;
        const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");
        const address = patient?.address?.full_address || "N/A";
        const vitalSigns = record.vital_signs;

        return {
          Date: record.date_administered ? new Date(record.date_administered).toLocaleDateString() : "N/A",
          Name: toTitleCase(fullName || "N/A"),
          DOB: personalInfo?.per_dob ? new Date(personalInfo.per_dob).toLocaleDateString() : "N/A",
          Address: toTitleCase(address),
          "Vaccine Name": record.vac_details?.vac_name || record.vaccine_stock?.vaccinelist?.vac_name || "N/A",
          "Dose Number": record.vachist_doseNo ? `${getOrdinalSuffix(Number(record.vachist_doseNo))} dose` : "N/A",
          "Age at Vaccination": personalInfo?.per_dob && record.created_at ? calculateAge(personalInfo.per_dob, record.created_at) : "N/A",
          Status: record.vachist_status || "No status provided",
          "Follow-up Date": record.follow_up_visit?.followv_date ? new Date(record.follow_up_visit.followv_date).toLocaleDateString() : "N/A",
          "BP Systolic": vitalSigns?.vital_bp_systolic || "N/A",
          "BP Diastolic": vitalSigns?.vital_bp_diastolic || "N/A",
          Temperature: vitalSigns?.vital_temp ? `${vitalSigns.vital_temp}°C` : "N/A",
          "Respiratory Rate": vitalSigns?.vital_RR || "N/A",
          "Oxygen Saturation": vitalSigns?.vital_o2 || "N/A",
          "Pulse Rate": vitalSigns?.vital_pulse || "N/A",
          "Vital Signs Taken": vitalSigns?.created_at ? new Date(vitalSigns.created_at).toLocaleDateString() : "N/A",
          "Signature Available": record.signature ? "Yes" : "No",
        };
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Vaccination Records");

      // Generate Excel file and download
      XLSX.writeFile(wb, `vaccination_records_${monthName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      toast.error("Failed to export Excel");
      console.error("Excel export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    exportToPDF("landscape");
  };

  // Function to handle signature image display
  const renderSignature = (signatureData: string) => {
    if (!signatureData) return "No Signature";

    // Check if it's a base64 encoded image
    if (signatureData.startsWith("data:image/") || signatureData.startsWith("iVBORw0KGgo")) {
      return (
        <img src={signatureData.startsWith("data:image/") ? signatureData : `data:image/png;base64,${signatureData}`} alt="Signature" className="h-5 w-18 object-contain " title="Patient Signature" />
      );
    }

    return "Invalid Signature";
  };

  const tableHeader = ["Date", "Name", "DOB", "Address", "Vaccine Name", "Dose No.", "Age", "BP", "Temp", "Pulse", "O2 Sat", "Signature"];

  const tableRows = records.map((record: any) => {
    const patient = record.patient;
    const personalInfo = patient?.personal_info;
    const fullName = [personalInfo?.per_fname, personalInfo?.per_mname, personalInfo?.per_lname].filter(Boolean).join(" ");
    const vitalSigns = record.vital_signs;

    // Calculate age using created_at date and patient DOB
    const age = personalInfo?.per_dob && record.created_at ? calculateAge(personalInfo.per_dob, record.created_at) : "N/A";

    // Extract the full address
    const address = patient?.address?.full_address || "N/A";

    // Get vaccine name from either vac_details or vaccine_stock
    const vaccineName = record.vac_details?.vac_name || record.vaccine_stock?.vaccinelist?.vac_name || "N/A";

    // Format vital signs
    const bloodPressure = vitalSigns ? `${vitalSigns.vital_bp_systolic || "N/A"}/${vitalSigns.vital_bp_diastolic || "N/A"}` : "N/A";
    const temperature = vitalSigns?.vital_temp ? `${vitalSigns.vital_temp}°C` : "N/A";
    const pulse = vitalSigns?.vital_pulse || "N/A";
    const oxygenSaturation = vitalSigns?.vital_o2 || "N/A";

    return [
      record.date_administered ? new Date(record.date_administered).toLocaleDateString() : "N/A",
      toTitleCase(fullName || "N/A"),
      personalInfo?.per_dob ? new Date(personalInfo.per_dob).toLocaleDateString() : "N/A",
      toTitleCase(address),
      vaccineName,
      record.vachist_doseNo ? `${getOrdinalSuffix(Number(record.vachist_doseNo))} dose` : "N/A",
      age,
      bloodPressure,
      temperature,
      pulse,
      oxygenSaturation,
      // Render signature as image or text
      <div className="flex justify-center">{renderSignature(record.signature)}</div>,
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
            <p className="text-sm text-gray-600 mt-1">Month: {monthName}</p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        {/* Export Actions */}
        <div className="bg-white p-4 border">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name, vaccine, dose..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
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
                {[12].map((size) => (
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
              Showing {startIndex} to {endIndex} of {totalItems} records
              {searchTerm && ` for "${searchTerm}"`}
            </span>
            {/* {!isLoading && totalPages > 1 &&  */}
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />
            {/* // } */}
          </div>
        </div>
      </div>

      {/* PRINTTABLE REPORT */}
      <div className="flex-1 mb-10 bg-white">
        <div
          style={{
            width: "20in",
            overflowX: "auto",
            position: "relative",
            margin: "0 auto",
            fontSize: "12px",
          }}
        >
          <div className="py-4 px-4" id="printable-area">
            <div className="text-center py-2">
              <Label className="text-sm font-bold uppercase tracking-widest underline block">VACCINATION RECORDS</Label>
              <Label className="font-medium items-center block">Month: {monthName}</Label>
            </div>

            <div className="pb-4 border-b sm:items-center gap-4">
              <div className="flex flex-col space-y-2 mt-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-end gap-2 flex-1 mr-8">
                    <Label className="font-medium whitespace-nowrap text-xs">Vaccine Name:</Label>
                    <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">{searchTerm || "All Vaccines"}</div>
                  </div>

                  <div className="flex items-end gap-2 flex-1">
                    <Label className="font-medium whitespace-nowrap text-xs">Total:</Label>
                    <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">{totalItems} records</div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading vaccination records...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <span>No vaccination records found for the selected criteria.</span>
              </div>
            ) : (
              <TableLayout
                header={tableHeader}
                rows={tableRows}
                tableClassName="border rounded-lg w-full"
                bodyCellClassName="border border-gray-600 text-center text-sm p-2"
                headerCellClassName="font-bold text-sm border border-gray-600 text-black text-center p-2"
                defaultRowCount={12}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
