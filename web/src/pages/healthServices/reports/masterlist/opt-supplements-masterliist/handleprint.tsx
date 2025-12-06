import { exportToPDF, exportToCSV, exportToExcel } from "../../export/export-report";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { getFullChildHealthSupplementsReport } from "./restful-api/fetch";
import { formatDate, formatSupplementDate, formatMnpDates } from "@/helpers/dateHelper";

// Helper function to prepare export data from records array
export const prepareExportDataFromRecords = (recordsData: any[]) => {
  return recordsData.map((record) => ({
    "Date Registered": formatDate(record.date_registered),
    "Child Name": record.child_name,
    "Date of Birth": record.date_of_birth ? formatDate(record.date_of_birth) : "-",
    Sex: record.sex || "-",
    "Mother's Name": record.mother_name === "Not available" ? "-" : record.mother_name,
    "Age (months)": record.current_age_months,
    Address: record.address,
    Sitio: record.sitio,
    "Family No": record.family_no,
    "Vitamin A (6-11 months)": formatSupplementDate(record.supplements.vitamin_a["6-11"]),
    "Vitamin A (12-23 months - 1st dose)": formatSupplementDate(record.supplements.vitamin_a["12-23"]["1st_dose"]),
    "Vitamin A (12-23 months - 2nd dose)": formatSupplementDate(record.supplements.vitamin_a["12-23"]["2nd_dose"]),
    "Vitamin A (24-35 months - 1st dose)": formatSupplementDate(record.supplements.vitamin_a["24-35"]["1st_dose"]),
    "Vitamin A (24-35 months - 2nd dose)": formatSupplementDate(record.supplements.vitamin_a["24-35"]["2nd_dose"]),
    "Vitamin A (36-47 months - 1st dose)": formatSupplementDate(record.supplements.vitamin_a["36-47"]["1st_dose"]),
    "Vitamin A (36-47 months - 2nd dose)": formatSupplementDate(record.supplements.vitamin_a["36-47"]["2nd_dose"]),
    "Vitamin A (48-59 months - 1st dose)": formatSupplementDate(record.supplements.vitamin_a["48-59"]["1st_dose"]),
    "Vitamin A (48-59 months - 2nd dose)": formatSupplementDate(record.supplements.vitamin_a["48-59"]["2nd_dose"]),
    "MNP (6-11 months)": formatMnpDates(record.supplements.mnp["6-11"]),
    "MNP (12-23 months)": formatMnpDates(record.supplements.mnp["12-23"]),
    "Deworming (12-23 months - 1st dose)": formatSupplementDate(record.supplements.deworming["12-23"]["1st_dose"]),
    "Deworming (12-23 months - 2nd dose)": formatSupplementDate(record.supplements.deworming["12-23"]["2nd_dose"]),
    "Deworming (24-59 months - 1st dose)": formatSupplementDate(record.supplements.deworming["24-59"]["1st_dose"]),
    "Deworming (24-59 months - 2nd dose)": formatSupplementDate(record.supplements.deworming["24-59"]["2nd_dose"]),
    "Feeding Type": record.type_of_feeding || "N/A"
  }));
};

// Fetch all data for export
export const fetchAllDataForExport = async (searchQuery: string, showLoading: () => void, hideLoading: () => void) => {
  try {
    showLoading();

    const allData = await getFullChildHealthSupplementsReport(searchQuery);

    let exportRecords;

    // Type guard to check response format
    if ("export" in allData && allData.export && "results" in allData) {
      // Backend returned export format
      exportRecords = allData.results;
    } else if ("children" in allData) {
      // Backend returned alternative format
      exportRecords = allData.children;
    } else if ("results" in allData) {
      // Fallback to results array
      exportRecords = allData.results;
    } else {
      throw new Error("Invalid response format from server");
    }

    return prepareExportDataFromRecords(exportRecords);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching all data for export:", error);
    }
    showErrorToast("Failed to fetch all data for export");
    throw error;
  } finally {
    hideLoading();
  }
};

// Export handlers
export const handleExportCSV = async (searchQuery: string, showLoading: () => void, hideLoading: () => void) => {
  try {
    const allData = await fetchAllDataForExport(searchQuery, showLoading, hideLoading);
    exportToCSV(allData, "child_health_supplements_complete");
    showSuccessToast(`Exported ${allData.length} records to CSV`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("CSV export failed:", error);
    }
  }
};

export const handleExportExcel = async (searchQuery: string, showLoading: () => void, hideLoading: () => void) => {
  try {
    const allData = await fetchAllDataForExport(searchQuery, showLoading, hideLoading);
    exportToExcel(allData, "child_health_supplements_complete");
    showSuccessToast(`Exported ${allData.length} records to Excel`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Excel export failed:", error);
    }
  }
};

export const handleExportPDF = async (searchQuery: string, showLoading: () => void, hideLoading: () => void) => {
  try {
    const allData = await fetchAllDataForExport(searchQuery, showLoading, hideLoading);
    exportToPDF('landscape');
    showSuccessToast(`Exported ${allData.length} records to PDF`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("PDF export failed:", error);
    }
  }
};

// Print handler - simplified version that directly prints without showing layout
export const handlePrint = async (searchQuery: string, showLoading: () => void, hideLoading: () => void) => {
  try {
    showLoading();

    // Fetch all data for printing
    const allData = await getFullChildHealthSupplementsReport(searchQuery);
    let printRecords;

    // Type guard to check response format
    if ("export" in allData && allData.export && "results" in allData) {
      printRecords = allData.results;
    } else if ("children" in allData) {
      printRecords = allData.children;
    } else if ("results" in allData) {
      printRecords = allData.results;
    } else {
      throw new Error("Invalid response format from server");
    }

    // Create print content with all data
    const printContent = `
      <div class="mb-4 text-center font-bold">
        <h1>MASTERLIST OF 6-59 MONTH OLD CHILDREN FOR VIT. A, MNP, AND DEWORMING</h1>
        <p class="text-sm mt-2">Total Records: ${printRecords.length}</p>
      </div>
      <table class="min-w-full text-xs">
        <thead>
          ...existing code...
        </thead>
        <tbody>
          ...existing code...
        </tbody>
      </table>
    `;

    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.left = "-9999px";

    iframe.srcdoc = `
      <html>
        <head>
          <title>Child Health Supplements Report</title>
          <style>
            ...existing code...
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            // Automatically trigger print when iframe loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Close the window after printing (optional)
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 200);
            };
          </script>
        </body>
      </html>
    `;

    document.body.appendChild(iframe);

    // Clean up after printing
    iframe.onload = function () {
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Print failed:", error);
    }
    showErrorToast("Failed to prepare data for printing");
  } finally {
    hideLoading();
  }
};
