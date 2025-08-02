

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Printer } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "./export-report";
import { ExportDropdown } from "./export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFirstaidRecords } from "../firstaid-report/restful-api/getAPI";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";

export default function MonthlyFirstAidDetails() {
  const location = useLocation();
  const state = location.state as {
    monthlyrcplist_id: string;
    month: string; // format YYYY-MM
    monthName: string;
    recordCount: number;
  };

  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { monthlyrcplist_id, month, monthName, recordCount } = state;

  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ["firstAidRecordsByMonth", month],
    queryFn: () => getFirstaidRecords(month),
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch first aid records");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);

  const monthlyData = apiResponse?.data || [];
  const currentMonthData = monthlyData.find(m => m.month === month) || monthlyData[0];
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
    return records.filter((record: any) => {
      const patient = record.patrec_details;
      const personalInfo = patient?.pat_details?.personal_info;
      const fullName = [
        personalInfo?.per_fname,
        personalInfo?.per_mname,
        personalInfo?.per_lname,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const itemName = record.finv_details?.fa_detail?.fa_name?.toLowerCase() || "";
      const reason = record.reason?.toLowerCase() || "";
      const date = record.created_at
        ? new Date(record.created_at).toLocaleDateString().toLowerCase()
        : "";
      const patientId = patient?.pat_details?.pat_id?.toLowerCase() || "";

      return (
        fullName.includes(searchLower) ||
        itemName.includes(searchLower) ||
        reason.includes(searchLower) ||
        date.includes(searchLower) ||
        patientId.includes(searchLower)
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
    return filteredRecords.map((record: any) => {
      const patient = record.patrec_details;
      const personalInfo = patient?.pat_details?.personal_info;
      const fullName = [
        personalInfo?.per_fname,
        personalInfo?.per_mname,
        personalInfo?.per_lname,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        "Date Administered": record.created_at
          ? new Date(record.created_at).toLocaleDateString()
          : "N/A",
        "Patient Name": fullName || "N/A",
        "Patient ID": patient?.pat_details?.pat_id || "",
        "Item Name": record.finv_details?.fa_detail?.fa_name ?? "N/A",
        "Quantity Used": record.qty ?? "N/A",
        Reason: record.reason || "No reason provided",
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
    const dataToExport = prepareExportData();
    exportToPDF(dataToExport, `first_aid_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
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
    "Date",
    "Name",
    "Address",
    "Item Name",
    "Quantity Used",
    "Reason",
  ];

  const tableRows = paginatedRecords.map((record: any) => {
    const patient = record.patrec_details;
    const personalInfo = patient?.pat_details?.personal_info;
    const fullName = [
      personalInfo?.per_fname,
      personalInfo?.per_mname,
      personalInfo?.per_lname,
    ]
      .filter(Boolean)
      .join(" ");

    return [
      record.created_at
        ? new Date(record.created_at).toLocaleDateString()
        : "N/A",
      <div className="w-32">{fullName || "N/A"}</div>,
      record.patrec_details?.pat_details?.address?.full_address || "N/A",
      record.finv_details?.fa_detail?.fa_name ?? "N/A",
      record.qty ?? "N/A",
      record.reason || "No reason provided",
    ];
  });

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-80 bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button
              className="text-darkBlue2 hover:text-darkBlue hover:bg-blue-50 w-fit p-2 -ml-2 transition-colors duration-200"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              <span className="font-medium">Back</span>
            </Button>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-gray-800 text-lg mb-3">
              Report Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Month:</span>
                <span className="font-medium text-blue-600">{monthName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Records:</span>
                <span className="font-medium text-blue-600">{recordCount}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-800 text-lg">Export Options</h3>
            <div className="flex flex-col gap-3">
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                className="w-full border-gray-300 hover:border-gray-400"
              />
              <Button
                variant="outline"
                onClick={handlePrint}
                className="w-full gap-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 text-gray-700" />
                <span className="text-gray-800">Print Report</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              asChild
            >
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
                  year: month?.split("-")[0] || new Date().getFullYear().toString(),
                }}
              >
                Edit Monthly List
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 mb-2 block">Show Entries</Label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={pageSize}
                  onChange={(e) => {
                    const value = +e.target.value;
                    setPageSize(value >= 1 ? value : 1);
                    setCurrentPage(1);
                  }}
                >
                  {[5, 10, 20].map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700">Quick Search</Label>
                <Input
                  type="text"
                  placeholder="Search records..."
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="w-full flex justify-center pt-2">
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
            width: '8.5in',
            minHeight: '14in',
            position: 'relative',
            margin: '0 auto',
            paddingBottom: '120px'
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
              <Label className="text-xs block">
                (032) 232-6820; 232-6863
              </Label>
            </div>
          </div>
          
          <div className="text-center py-2">
            <Label className="text-sm font-bold uppercase tracking-widest underline block">
              RECIPIENTS LEDGER / LIST
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
                    Item Description:
                  </Label>
                  <div className="text-sm border-b border-black bg-transparent min-w-0 flex-1 pb-1">
                    {searchTerm || "All Items"}
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
            bodyCellClassName="border border-gray-600 text-center text-xs"
            headerCellClassName="font-bold text-xs border border-gray-600 text-black text-center"
          />

          <div className="mt-4">
            <Label className="text-xs font-normal">
              Hereby certify that the names listed above are recipients of the
              item as indicated below
            </Label>
          </div>

          <div 
            style={{
              position: 'absolute',
              bottom: '40px',
              left: 0,
              right: 0,
              padding: '0 32px'
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
                <div className="flex justify-center flex-col items-center ">
                  <div className="border-b border-b-black w-48 text-xs text-center pb-1" >
                    {staffName}
                  </div>
                  <Label className="text-xs font-medium">Printed Name and Signature</Label>
                </div>

                <div className="flex justify-center flex-col items-center ">
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