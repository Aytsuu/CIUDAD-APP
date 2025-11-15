import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, FileInput, Users, Home, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { calculateAge } from "@/helpers/ageCalculator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useLoading } from "@/context/LoadingContext";
import { VaccinationRecord } from "../../vaccination/tables/columns/types";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/use-debounce";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
import { api2 } from "@/api/api";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import TableLoading from "../../../../components/ui/table-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useScheduledVaccinationColumns } from "./columns/scheduledvac-col";

export const getScheduledVaccinations = async (assigned_to: string, search = "", patientType = "all", page = 1, pageSize = 10): Promise<any> => {
  try {
    const params = new URLSearchParams({
      search,
      patient_type: patientType,
      page: page.toString(),
      page_size: pageSize.toString()
    });
    const response = await api2.get(`/vaccination/to-be-administered/${assigned_to}/?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vaccination records:", error);
    throw error;
  }
};

export default function ForwardedScheduledVaccinationsTables() {
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id;

  const [searchQuery, setSearchQuery] = useState("");
  const [patientType, setPatientType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [residentCount, setResidentCount] = useState(0);
  const [transientCount, setTransientCount] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: vaccinationData, isLoading } = useQuery({
    queryKey: ["scheduledVaccination", staff_id, debouncedSearchQuery, patientType, currentPage, pageSize],
    queryFn: () => getScheduledVaccinations(staff_id!, debouncedSearchQuery, patientType, currentPage, pageSize),
    refetchOnMount: true,
    staleTime: 300000,
    gcTime: 600000,
    enabled: !!staff_id
  });

  const { showLoading, hideLoading } = useLoading();
  const columns = useScheduledVaccinationColumns();

  const formatVaccinationData = useCallback((): VaccinationRecord[] => {
    if (!vaccinationData?.results) return [];

    return vaccinationData.results.map((record: any) => {
      const patientDetails = record.patient || {};
      const personalInfo = patientDetails.personal_info || {};
      const address = patientDetails.address || {};
      const vitalSigns = record.vital_signs || {};
      const vaccineStock = record.vaccine_stock || {};
      const vaccineList = vaccineStock.vaccinelist || {};
      const invDetails = vaccineStock.inv_details || {};
      const vacrecDetails = record.vacrec_details || {};

      const fullAddress = address.full_address || [address.add_street, address.add_barangay, address.add_city, address.add_province].filter(Boolean).join(", ") || "";

      return {
        ...record,
        vaccine_name: vaccineList.vac_name || "Unknown Vaccine",
        vachist_doseNo: record.vachist_doseNo || "",
        vacrec_totaldose: vacrecDetails.vacrec_totaldose || 1,
        status: record.vachist_status || "",
        patrec_id: vacrecDetails.patrec_id || "",
        batch_number: vaccineStock.batch_number || "",
        expiry_date: invDetails.expiry_date || "",
        patient: {
          pat_id: patientDetails.pat_id || "",
          pat_type: patientDetails.pat_type || "",
          personal_info: personalInfo,
          address: {
            add_street: address.add_street || "",
            add_barangay: address.add_barangay || "",
            add_city: address.add_city || "",
            add_province: address.add_province || "",
            add_sitio: address.add_sitio || "",
            full_address: fullAddress
          }
        },
        vital_signs: {
          vital_bp_systolic: vitalSigns.vital_bp_systolic || "N/A",
          vital_bp_diastolic: vitalSigns.vital_bp_diastolic || "N/A",
          vital_temp: vitalSigns.vital_temp || "N/A",
          vital_pulse: vitalSigns.vital_pulse || "N/A",
          vital_RR: vitalSigns.vital_RR || "N/A",
          vital_o2: vitalSigns.vital_o2 || "N/A",
          created_at: vitalSigns.created_at || ""
        },
        vaccine_stock: {
          ...vaccineStock,
          vaccinelist: vaccineList
        },
        vacrec_details: vacrecDetails
      };
    });
  }, [vaccinationData]);

  const calculateCounts = useCallback(() => {
    if (!vaccinationData?.results) return;

    const total = vaccinationData.count || 0;
    let residents = 0;
    let transients = 0;

    vaccinationData.results.forEach((record: any) => {
      const patType = record.patient?.pat_type;
      if (patType === "Resident") residents++;
      if (patType === "Transient") transients++;
    });

    setTotalCount(total);
    setResidentCount(residents);
    setTransientCount(transients);
    setTotalPages(Math.ceil(total / pageSize));
  }, [vaccinationData, pageSize]);

  useEffect(() => {
    calculateCounts();
  }, [calculateCounts]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, patientType]);

  const handlePatientTypeChange = (value: string) => {
    setPatientType(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize >= 1 ? newPageSize : 1);
    setCurrentPage(1);
  };

  const currentData = formatVaccinationData();

  if (!staff_id) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Unable to load staff information</p>
          <p className="text-sm text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayoutComponent title="Scheduled Vaccinations" description="Manage and view scheduled vaccinations for patients.">
      {/* Enhanced Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <EnhancedCardLayout title="Total Scheduled" description="All scheduled vaccinations" value={totalCount} valueDescription="Total records" icon={<Users className="h-6 w-6 text-blue-600" />} cardClassName="border-blue-100" />
        <EnhancedCardLayout title="Residents" description="Scheduled for residents" value={residentCount} valueDescription="Resident records" icon={<Home className="h-6 w-6 text-green-600" />} cardClassName="border-green-100" />
        <EnhancedCardLayout title="Transients" description="Scheduled for transients" value={transientCount} valueDescription="Transient records" icon={<UserCheck className="h-6 w-6 text-purple-600" />} cardClassName="border-purple-100" />
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white">
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search patients, ID, or vaccine..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <SelectLayout
            placeholder="Filter patient type"
            label=""
            className="bg-white w-full sm:w-48"
            options={[
              { id: "all", name: "All Types" },
              { id: "resident", name: "Resident" },
              { id: "transient", name: "Transient" }
            ]}
            value={patientType}
            onChange={handlePatientTypeChange}
          />
        </div>
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" value={pageSize} onChange={(e) => handlePageSizeChange(+e.target.value)} min="1" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Export data">
                  <FileInput className="mr-2 h-4 w-4" />
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
        <div className="bg-white w-full overflow-x-auto">{isLoading ? <TableLoading /> : <DataTable columns={columns} data={currentData} />}</div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
          </p>
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}
