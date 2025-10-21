import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
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

// Age calculation helper function
const calculateAge = (dob: string, referenceDate: string) => {
  const birthDate = new Date(dob);
  const refDate = new Date(referenceDate);
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = refDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function MonthlyVaccinationDetails() {
  const location = useLocation();
  const state = location.state as {
    month: string;
    monthName: string;
    recordCount: number;
    vaccineName?: string;
  };

  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { month, monthName, vaccineName } = state || {};

  // Auto-set search term when vaccineName is passed
  useEffect(() => {
    if (vaccineName) {
      setSearchTerm(vaccineName);
    }
  }, [vaccineName]);

  const { data: apiResponse, isLoading, error } = useVaccineReports(month);
  const monthlyData = apiResponse?.data as { records: MonthlyVaccineRecord[]; report: any } | undefined;

  const records = monthlyData?.records || [];

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
      const patientName = record.patient_name?.toLowerCase() || "";
      const vaccineName = record.vaccine_name?.toLowerCase() || "";
      const doseNumber = record.vachist_doseNo?.toString() || "";
      const date = record.date_administered ? new Date(record.date_administered).toLocaleDateString().toLowerCase() : "";
      const status = record.vachist_status?.toLowerCase() || "";

      return patientName.includes(searchLower) || 
             vaccineName.includes(searchLower) || 
             doseNumber.includes(searchLower) || 
             date.includes(searchLower) || 
             status.includes(searchLower);
    });
  }, [records, searchTerm]);

  // Calculate dynamic headers based on dose timeline keys from all records
  const dynamicHeaders = useMemo(() => {
    const baseHeaders = [ "Name", "DOB", "Vaccine Name"];
    
    // Collect all unique dose timeline keys from all records
    const allDoseKeys = new Set<string>();
    
    records.forEach((record: any) => {
      if (record.dose_timeline) {
        Object.keys(record.dose_timeline).forEach(key => {
          allDoseKeys.add(key);
        });
      }
    });

    // Convert dose keys to proper header format and sort by dose number
    const doseHeaders = Array.from(allDoseKeys)
      .map(key => {
        // Extract dose number and create proper header
        const doseNumber = parseInt(key.split('_')[0]);
        return {
          key,
          header: `${getOrdinalSuffix(doseNumber)} Dose`,
          doseNumber
        };
      })
      .sort((a, b) => a.doseNumber - b.doseNumber)
      .map(item => item.header);

    return [...baseHeaders, ...doseHeaders, "Age at Vaccination"];
  }, [records]);

  // Get sorted dose keys for consistent column ordering
  const sortedDoseKeys = useMemo(() => {
    const allDoseKeys = new Set<string>();
    
    records.forEach((record: any) => {
      if (record.dose_timeline) {
        Object.keys(record.dose_timeline).forEach(key => {
          allDoseKeys.add(key);
        });
      }
    });

    return Array.from(allDoseKeys)
      .map(key => ({
        key,
        doseNumber: parseInt(key.split('_')[0])
      }))
      .sort((a, b) => a.doseNumber - b.doseNumber)
      .map(item => item.key);
  }, [records]);

  // Total items count
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Pagination info indexes
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const prepareExportData = () => {
    return filteredRecords.map((record: any) => {
      // Base export data
      const exportData: any = {
        "Record ID": record.vachist_id || "",
        "Record Date": record.created_at || "",
        "Date Administered": record.date_administered ? new Date(record.date_administered).toLocaleDateString() : "",
        Name: record.patient_name || "",
        DOB: record.patient_dob ? new Date(record.patient_dob).toLocaleDateString() : "",
        "Vaccine Name": record.vaccine_name || "",
        "Age at Vaccination": record.patient_dob && record.date_administered ? calculateAge(record.patient_dob, record.date_administered) : "",
        Status: record.vachist_status || "No status provided",
        "Patient ID": record.patient_id || "",
        "Patient Address": record.patient_address || "",
        "Staff Name": record.staff_name || ""
      };

      // Add dose timeline data to export with vaccination history ID
      if (record.dose_timeline) {
        sortedDoseKeys.forEach(doseKey => {
          const doseData = record.dose_timeline[doseKey];
          if (doseData) {
            const doseNumber = parseInt(doseKey.split('_')[0]);
            const suffix = getOrdinalSuffix(doseNumber);
            exportData[`${doseNumber}${suffix} Dose - Date Administered`] = doseData.date || "";
            exportData[`${doseNumber}${suffix} Dose - Record Date`] = doseData.created_at || "";
          }
        });
      }

      return exportData;
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
    exportToPDF(`vaccination_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  };

  const tableRows = paginatedRecords.map((record: any) => {
    // Calculate age using date_administered and patient DOB
    const age = record.patient_dob && record.date_administered 
      ? calculateAge(record.patient_dob, record.date_administered) 
      : "";

    // Base row data - Use created_at for record date (when it was created)
    const rowData = [
      record.patient_name || "",
      record.patient_dob ? new Date(record.patient_dob).toLocaleDateString() : "",
      record.vaccine_name || "",
    ];

    // Add dose timeline data in consistent order
    // Each dose shows: Date Administered (from date field in dose_timeline)
    sortedDoseKeys.forEach(doseKey => {
      const doseInfo = record.dose_timeline?.[doseKey];
      if (doseInfo) {
        // Display the date when the dose was administered
        rowData.push(doseInfo.date ? new Date(doseInfo.date).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "");
      } else {
        rowData.push("");
      }
    });

    // Add age at the end
    rowData.push(age);

    return rowData;
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
        <div className="bg-white p-4 border">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search records..." 
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
              <ExportDropdown 
                onExportCSV={handleExportCSV} 
                onExportExcel={handleExportExcel} 
                onExportPDF={handleExportPDF} 
                className="border-gray-200 hover:bg-gray-50" 
              />
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
                {[10, 25, 50, 100].map((size) => (
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
            <PaginationLayout 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
              className="text-sm" 
            />
          </div>
        </div>
      </div>

      {/* PRINTABLE REPORT */}
      <div className="flex-1 mb-10 bg-white">
        <div
          className="py-4 px-4"
          id="printable-area"
          style={{
            width: "full",
            minHeight: "8.5in",
            position: "relative",
            margin: "0 auto",
            paddingBottom: "120px"
          }}
        >
          <div className="text-center py-2">
            <Label className="text-sm font-bold uppercase tracking-widest underline block">
              VACCINATION RECORDS
            </Label>
            <Label className="font-medium items-center block">Month: {monthName}</Label>
          </div>

          <div className="pb-4 order-b sm:items-center gap-4">
            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex justify-between items-end">
                <div className="flex items-end gap-2 flex-1 mr-8">
                  <Label className="font-medium whitespace-nowrap text-xs">Vaccine Name:</Label>
                  <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                    {searchTerm || "All Vaccines"}
                  </div>
                </div>

                <div className="flex items-end gap-2 flex-1">
                  <Label className="font-medium whitespace-nowrap text-xs">Total:</Label>
                  <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                    {filteredRecords.length} records
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">loading....</span>
            </div>
          ) : (
            <TableLayout 
              header={dynamicHeaders} 
              rows={tableRows} 
              tableClassName="border rounded-lg w-full" 
              bodyCellClassName="border border-gray-600 text-center text-xs p-2" 
              headerCellClassName="font-bold text-xs border border-gray-600 text-black text-center p-2" 
            />
          )}
        </div>
      </div>
    </div>
  );
}