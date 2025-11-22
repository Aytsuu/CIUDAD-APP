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
    console.error("Error fetching all data for export:", error);
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
    console.error("CSV export failed:", error);
  }
};

export const handleExportExcel = async (searchQuery: string, showLoading: () => void, hideLoading: () => void) => {
  try {
    const allData = await fetchAllDataForExport(searchQuery, showLoading, hideLoading);
    exportToExcel(allData, "child_health_supplements_complete");
    showSuccessToast(`Exported ${allData.length} records to Excel`);
  } catch (error) {
    console.error("Excel export failed:", error);
  }
};

export const handleExportPDF = async (searchQuery: string, showLoading: () => void, hideLoading: () => void) => {
  try {
    const allData = await fetchAllDataForExport(searchQuery, showLoading, hideLoading);
    exportToPDF('landscape');
    showSuccessToast(`Exported ${allData.length} records to PDF`);
  } catch (error) {
    console.error("PDF export failed:", error);
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
          <tr class="border-b border-gray-300">
            <th rowspan="3" class="border-r border-gray-300 px-2 py-2 text-center font-medium min-w-[80px]">
              Date of Registration
            </th>
            <th rowspan="3" class="border-r border-gray-300 px-2 py-2 text-center font-medium min-w-[120px]">
              Name of Child
            </th>
            <th rowspan="3" class="border-r border-gray-300 px-2 py-2 text-center font-medium min-w-[80px]">
              Date of Birth
            </th>
            <th rowspan="3" class="border-r border-gray-300 px-2 py-2 text-center font-medium min-w-[40px]">
              Sex
            </th>
            <th rowspan="3" class="border-r border-gray-300 px-2 py-2 text-center font-medium min-w-[120px]">
              Name of Mother
            </th>

            <th colspan="9" class="border-r border-gray-300 px-2 py-1 text-center font-medium">
              Vitamin A Supplementation
            </th>
            <th colspan="2" class="border-r border-gray-300 px-2 py-1 text-center font-medium">
              MNP
            </th>
            <th colspan="4" class="border-r border-gray-300 px-2 py-1 text-center font-medium">
              Deworming
            </th>
          
            <th rowspan="3" class="px-2 py-2 text-center font-medium min-w-[100px]">
              Remarks
            </th>
          </tr>
          <tr class="border-b border-gray-300">
            <th colspan="1" class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              6-11 Months
            </th>
            <th colspan="2" class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              12-23 Months
            </th>
            <th colspan="2" class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              24-35 Months
            </th>
            <th colspan="2" class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              36-47 Months
            </th>
            <th colspan="2" class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              48-59 Months
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              6-11 Months
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              12-23 Months
            </th>
            <th colspan="2" class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              12-23 Months
            </th>
            <th colspan="2" class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[10px]">
              24-59 Months
            </th>
          </tr>
          <tr class="border-b border-gray-300">
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              1st Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              1st Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              2nd Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              1st Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              2nd Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              1st Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              2nd Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              1st Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              2nd Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              60 sachets
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              60 sachets
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              1st Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              2nd Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              1st Dose
            </th>
            <th class="border-r border-gray-300 px-1 py-1 text-center font-medium text-[9px]">
              2nd Dose
            </th>
          </tr>
        </thead>
        <tbody>
          ${printRecords
            .map(
              (record) => `
            <tr class="border-b border-gray-200">
              <td class="border-r border-gray-300 px-2 py-2 text-center text-[10px]">
                ${formatDate(record.date_registered)}
              </td>
              <td class="border-r border-gray-300 px-2 py-2 text-left text-[10px] font-medium">
                ${record.child_name}
              </td>
              <td class="border-r border-gray-300 px-2 py-2 text-center text-[10px]">
                ${record.date_of_birth ? formatDate(record.date_of_birth) : "-"}
              </td>
              <td class="border-r border-gray-300 px-2 py-2 text-center text-[10px]">
                ${record.sex || "-"}
              </td>
              <td class="border-r border-gray-300 px-2 py-2 text-left text-[10px]">
                ${record.mother_name === "Not available" ? "-" : record.mother_name}
              </td>
              
              <!-- Vitamin A - 6-11 months -->
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["6-11"])}
              </td>
              
              <!-- Vitamin A - 12-23 months -->
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["12-23"]["1st_dose"])}
              </td>
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["12-23"]["2nd_dose"])}
              </td>
              
              <!-- Vitamin A - 24-35 months -->
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["24-35"]["1st_dose"])}
              </td>
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["24-35"]["2nd_dose"])}
              </td>
              
              <!-- Vitamin A - 36-47 months -->
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["36-47"]["1st_dose"])}
              </td>
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["36-47"]["2nd_dose"])}
              </td>
              
              <!-- Vitamin A - 48-59 months -->
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["48-59"]["1st_dose"])}
              </td>
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.vitamin_a["48-59"]["2nd_dose"])}
              </td>
              
              <!-- MNP -->
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatMnpDates(record.supplements.mnp["6-11"])}
              </td>
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatMnpDates(record.supplements.mnp["12-23"])}
              </td>
              
              <!-- Deworming - 12-23 months -->
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.deworming["12-23"]["1st_dose"])}
              </td>
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.deworming["12-23"]["2nd_dose"])}
              </td>
              
              <!-- Deworming - 24-59 months -->
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.deworming["24-59"]["1st_dose"])}
              </td>
              <td class="border-r border-gray-300 px-1 py-2 text-center text-[10px]">
                ${formatSupplementDate(record.supplements.deworming["24-59"]["2nd_dose"])}
              </td>
              
              <!-- Remarks -->
              <td class="px-2 py-2 text-left text-[10px]">
                ${record.sitio ? `Sitio: ${record.sitio}` : ""}
                ${record.type_of_feeding ? `, ${record.type_of_feeding}` : ""}
              </td>
            </tr>
          `
            )
            .join("")}
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
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              font-size: 10px;
            }
            h1 { 
              font-size: 14px; 
              margin-bottom: 5px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 3px; 
              text-align: center; 
            }
            th { 
              font-weight: bold;
              background-color: #f5f5f5;
            }
            .text-left { text-align: left; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            @page {
              size: legal landscape;
              margin: 10mm;
            }
            @media print {
              body { 
                padding: 0;
              }
              table { 
                page-break-inside: auto;
              }
              tr { 
                page-break-inside: avoid; 
                page-break-after: auto;
              }
            }
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
    console.error("Print failed:", error);
    showErrorToast("Failed to prepare data for printing");
  } finally {
    hideLoading();
  }
};
