import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Home, UserCheck, FileInput } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useLoading } from "@/context/LoadingContext";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/use-debounce";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import TableLoading from "../../table-loading";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
import { useCombinedConsultationColumns } from "./columns/combineconsult-col";
import { useCombinedHealthRecords } from "./queries/fetch";
import { Link } from "react-router";
import { useReportsCount } from "../../count-return/count";

export default function ForwardedCombinedHealthRecordsTable() {
  const { user } = useAuth();
  const staffId = user?.staff?.staff_id || "";
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");
  const { showLoading, hideLoading } = useLoading();
  const { data: count_data, isLoading: count_loading } = useReportsCount();

  const { data: combinedData, isLoading: combinedLoading } = useCombinedHealthRecords(staffId, debouncedSearchQuery, recordTypeFilter, currentPage, pageSize);
  const columns = useCombinedConsultationColumns();

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, recordTypeFilter]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize >= 1 ? newPageSize : 1);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (combinedLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [combinedLoading, showLoading, hideLoading]);

  const totalPages = Math.ceil((combinedData?.count || 0) / pageSize);
  const totalCount = combinedData?.count || 0;

  // Calculate resident and transient counts
  const calculateCounts = useCallback(() => {
    if (!combinedData?.results) return { residents: 0, transients: 0 };

    let residents = 0;
    let transients = 0;

    combinedData.results.forEach((record: any) => {
      let patType = "";

      if (record.record_type === "child-health") {
        patType = record.data.chrec_details?.patrec_details?.pat_details?.pat_type || "";
      } else {
        patType = record.data.patrec_details?.patient_details?.pat_type || "";
      }

      if (patType === "Resident") residents++;
      if (patType === "Transient") transients++;
    });

    return { residents, transients };
  }, [combinedData]);

  const { residents, transients } = calculateCounts();

  return (
    <MainLayoutComponent title="Referred Patients" description="List of referred patient for consultation ">
      <div className="w-full h-full flex flex-col">
        <div className="flex gap-4 mb-4 justify-end">
          <Link to="/referred-patients/upcoming-consultations" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-medium transition border-2">
            Upcoming Appointments
            {!count_loading && count_data?.data?.confirmed_appointments_count > 0 && (
              <span className="ml-2 text-xs font-semibold text-white bg-red-600 rounded-full px-2 h-5 min-w-[20px] flex items-center justify-center ">
                {count_data.data.confirmed_appointments_count > 99 ? "99+" : count_data.data.confirmed_appointments_count}
              </span>
            )}
          </Link>
        
        </div>
        {/* Enhanced Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <EnhancedCardLayout
            title="Total Records"
            description="All health consultation records"
            value={totalCount}
            valueDescription="Total records"
            icon={<Users className="h-6 w-6 text-blue-600" />}
            cardClassName="border-blue-100"
          />
          <EnhancedCardLayout
            title="Residents"
            description="Resident consultation records"
            value={residents}
            valueDescription="Resident records"
            icon={<Home className="h-6 w-6 text-green-600" />}
            cardClassName="border-green-100"
          />
          <EnhancedCardLayout
            title="Transients"
            description="Transient consultation records"
            value={transients}
            valueDescription="Transient records"
            icon={<UserCheck className="h-6 w-6 text-purple-600" />}
            cardClassName="border-purple-100"
          />
        </div>

        {/* Filters Section */}
        <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input placeholder="Search patients, ID, or details..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <SelectLayout
              placeholder="Filter record type"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All Types" },
                { id: "child-health", name: "Child Health" },
                { id: "medical-consultation", name: "Medical Consultation" },
                { id: "prenatal", name: "Prenatal" },
              ]}
              value={recordTypeFilter}
              onChange={(value) => setRecordTypeFilter(value)}
            />
          </div>
        </div>

        <div className="h-full w-full">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input type="number" className="w-14 h-8" value={pageSize} onChange={(e) => handlePageSizeChange(+e.target.value)} min="1" />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Export data" className="flex items-center gap-2">
                    <FileInput className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-white w-full overflow-x-auto border">{combinedLoading ? <TableLoading /> : <DataTable columns={columns} data={combinedData?.results || []} />}</div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white border">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {(combinedData?.results || []).length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}
