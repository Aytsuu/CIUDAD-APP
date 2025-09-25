import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Search, ArrowUpDown, FileInput, Loader2, Users, Home, UserCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { calculateAge } from "@/helpers/ageCalculator";
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { useLoading } from "@/context/LoadingContext";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/context/AuthContext";
import ViewButton from "@/components/ui/view-button";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

export const getChildHealthHistoryRecordRecords = async (assigned_to: string, search = "", patientType = "all", page = 1, pageSize = 10): Promise<any> => {
  try {
    const params = new URLSearchParams({
      search,
      patient_type: patientType,
      page: page.toString(),
      page_size: pageSize.toString()
    });
    const response = await api2.get(`/child-health/child-immunization-status-table/${assigned_to}/?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};

export default function ForwardedCHimmunizationTable() {
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id; // use this as assigned to parameter
  const [searchQuery, setSearchQuery] = useState("");
  const [patientType, setPatientType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [residentCount, setResidentCount] = useState(0);
  const [transientCount, setTransientCount] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: immunizationData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["ChildHealthHistoryRecordRecords", staff_id, debouncedSearchQuery, patientType, currentPage, pageSize],
    queryFn: () => getChildHealthHistoryRecordRecords(staff_id!, debouncedSearchQuery, patientType, currentPage, pageSize),
    refetchOnMount: true,
    staleTime: 300000,
    gcTime: 600000,
    enabled: !!staff_id // Only run query if staff_id is available
  });

  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const formatRecordForTable = useCallback((): any[] => {
    if (!immunizationData?.results) return [];
    return immunizationData.results.map((record: any) => {
      const chrecDetails = record.chrec_details || {};
      const patrecDetails = chrecDetails.patrec_details || {};
      const patDetails = patrecDetails.pat_details || {};
      const personalInfo = patDetails.personal_info || {};
      const addressInfo = patDetails.address || {};

      const familyHeadInfo = patDetails.family_head_info || {};
      const familyHeads = familyHeadInfo.family_heads || {};
      const motherInfo = familyHeads.mother?.personal_info || {};
      const fatherInfo = familyHeads.father?.personal_info || {};

      return {
        record,
        chrec_id: record.chrec || "",
        pat_id: patDetails.pat_id || "",
        fname: personalInfo.per_fname || "",
        lname: personalInfo.per_lname || "",
        mname: personalInfo.per_mname || "",
        sex: personalInfo.per_sex || "",
        age: personalInfo.per_dob ? calculateAge(personalInfo.per_dob).toString() : "",
        dob: personalInfo.per_dob || "",
        householdno: patDetails.households?.[0]?.hh_id || "",
        address: addressInfo.full_address || "No address Provided",
        sitio: addressInfo.add_sitio || "",
        landmarks: addressInfo.add_landmarks || "",
        pat_type: patDetails.pat_type || "",
        mother_fname: motherInfo.per_fname || "",
        mother_lname: motherInfo.per_lname || "",
        mother_mname: motherInfo.per_mname || "",
        mother_contact: motherInfo.per_contact || "",
        mother_occupation: motherInfo.per_occupation || chrecDetails.mother_occupation || "",
        father_fname: fatherInfo.per_fname || "",
        father_lname: fatherInfo.per_lname || "",
        father_mname: fatherInfo.per_mname || "",
        father_contact: fatherInfo.per_contact || "",
        father_occupation: fatherInfo.per_occupation || chrecDetails.father_occupation || "",
        family_no: chrecDetails.family_no || "Not Provided",
        birth_weight: chrecDetails.birth_weight || 0,
        birth_height: chrecDetails.birth_height || 0,
        type_of_feeding: chrecDetails.type_of_feeding || "Unknown",
        delivery_type: chrecDetails.place_of_delivery_type || "",
        place_of_delivery_type: chrecDetails.place_of_delivery_type || "",
        pod_location: chrecDetails.pod_location || "",
        pod_location_details: chrecDetails.pod_location_details || "",
        health_checkup_count: chrecDetails.health_checkup_count || 0,
        birth_order: chrecDetails.birth_order || "",
        tt_status: record.tt_status || ""
      };
    });
  }, [immunizationData]);

  // Calculate counts from filtered data for accurate totals
  const calculateCounts = useCallback(() => {
    if (!immunizationData?.results) return;

    const results = immunizationData.results;
    const total = immunizationData.count || 0;

    // Calculate resident and transient counts from all data (not just current page)
    // Since we have pagination, we need to use the totals from backend if available
    // or calculate from current page data
    let residents = 0;
    let transients = 0;

    results.forEach((record: any) => {
      const patType = record.chrec_details?.patrec_details?.pat_details?.pat_type;
      if (patType === "Resident") residents++;
      if (patType === "Transient") transients++;
    });

    setTotalCount(total);
    // For accurate counts, we should ideally get these from the backend
    // For now, we'll use the current page data as an approximation
    setResidentCount(residents);
    setTransientCount(transients);
    setTotalPages(Math.ceil(total / pageSize));
  }, [immunizationData, pageSize]);

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

  // Reset to first page when search or filter changes
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "child",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Child <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {row.original.sex}, {row.original.age}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "mother",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Mother <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.mother_lname}, ${row.original.mother_fname} ${row.original.mother_mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div className="w-[250px] break-words">{row.original.address}</div>
        </div>
      )
    },
    {
      accessorKey: "family_no",
      header: "Family No.",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.family_no || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "delivery_type",
      header: "Delivery Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full capitalize">{row.original.delivery_type?.toLowerCase() || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "pat_type",
      header: "Patient Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full capitalize">{row.original.pat_type?.toLowerCase() || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <div className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-1.5 rounded cursor-pointer">
            <ViewButton
              onClick={() => {
                navigate("/child-immunization", {
                  state: {
                    ChildHealthRecord: row.original,
                    mode: "immunization"
                  }
                });
              }}
            />
          </div>
        </div>
      )
    }
  ];

  const currentData = formatRecordForTable();

  // Show loading or error state if staff_id is not available
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
    <MainLayoutComponent title="Child Immunization" description="Forwarded records for child immunization">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">All</span>
          </div>
        </div>

        {/* Resident Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Residents</p>
              <p className="text-2xl font-bold text-gray-800">{residentCount}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Resident</span>
          </div>
        </div>

        {/* Transient Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transients</p>
              <p className="text-2xl font-bold text-gray-800">{transientCount}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">Transient</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white">
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search by name, family no, UFC no..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <SelectLayout
            placeholder="Filter records"
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

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Export data" className="flex items-center gap-2">
                  <FileInput size={16} />
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

        <div className="bg-white w-full overflow-x-auto border">
          {isLoading ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <DataTable columns={columns} data={currentData} />
          )}
        </div>

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
