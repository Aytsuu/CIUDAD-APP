import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader2, Search, ChevronLeft, Users, Home, UserCheck, FileInput } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { api2 } from "@/api/api";
import { calculateAge } from "@/helpers/ageCalculator";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useLoading } from "@/context/LoadingContext";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/use-debounce";

export default function ForwardedCombinedHealthRecordsTable() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const staffId = user?.staff?.staff_id || "";
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");
  const { showLoading, hideLoading } = useLoading();

  // Fetch combined records
  const { data: combinedData, isLoading: combinedLoading } = useQuery({
    queryKey: ["CombinedHealthRecords", debouncedSearchQuery, recordTypeFilter, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearchQuery,
        record_type: recordTypeFilter,
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      const response = await api2.get(`/medical-consultation/combined-health-records/${staffId}/?${params}`);
      return response.data;
    }
  });

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, recordTypeFilter]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize >= 1 ? newPageSize : 1);
    setCurrentPage(1);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "record_type",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Record Type <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm min-w-[120px] capitalize text-center">
          {row.original.record_type.replace("-", " ")}
        </div>
      )
    },
    {
      accessorKey: "patient_info",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient Info <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const data = row.original.data;
        let patientDetails = null;
        
        if (row.original.record_type === 'child-health') {
          patientDetails = data.chrec_details?.patrec_details?.pat_details;
        } else {
          patientDetails = data.patrec_details?.patient_details;
        }
        
        const personalInfo = patientDetails?.personal_info || {};
        const fullName = `${personalInfo.per_lname || ''}, ${personalInfo.per_fname || ''} ${personalInfo.per_mname || ''}`.trim();
        
        return (
          <div className="flex flex-col min-w-[200px]">
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-gray-500">
              {personalInfo.per_sex}, {personalInfo.per_dob ? calculateAge(personalInfo.per_dob) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">ID: {patientDetails?.pat_id || 'N/A'}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "details",
      header: "Record Details",
      cell: ({ row }) => {
        const data = row.original.data;
        
        if (row.original.record_type === 'child-health') {
          return (
            <div className="grid grid-cols-1 gap-1 text-sm min-w-[180px]">
              <div>UFC No: {data.chrec_details?.ufc_no || 'N/A'}</div>
              <div>Family No: {data.chrec_details?.family_no || 'N/A'}</div>
              <div>TT Status: {data.tt_status || 'N/A'}</div>
              <div>Status: {data.status || 'N/A'}</div>
            </div>
          );
        } else {
          return (
            <div className="grid grid-cols-1 gap-1 text-sm min-w-[200px]">
              <div>Chief Complaint: {data.medrec_chief_complaint || 'N/A'}</div>
              <div>Status: {data.medrec_status || 'N/A'}</div>
              <div>Age: {data.medrec_age || 'N/A'}</div>
            </div>
          );
        }
      }
    },
    {
      accessorKey: "vital_signs",
      header: "Vital Signs",
      cell: ({ row }) => {
        const data = row.original.data;
        
        if (row.original.record_type === 'child-health') {
          const vitalSigns = data.child_health_vital_signs?.[0];
          const bmDetails = vitalSigns?.bm_details;
          const temp = vitalSigns?.temp;
          
          return (
            <div className="text-sm min-w-[180px]">
              {temp && <div>Temp: {temp}°C</div>}
              {bmDetails && (
                <>
                  <div>Height: {bmDetails.height || 'N/A'} cm</div>
                  <div>Weight: {bmDetails.weight || 'N/A'} kg</div>
                  <div>WFA: {bmDetails.wfa || 'N/A'}</div>
                  <div>LHFA: {bmDetails.lhfa || 'N/A'}</div>
                </>
              )}
            </div>
          );
        } else {
          const vitalSigns = data.vital_signs || {};
          const bmiDetails = data.bmi_details || {};
          
          return (
            <div className="text-sm min-w-[180px]">
              <div>BP: {vitalSigns.vital_bp_systolic || 'N/A'}/{vitalSigns.vital_bp_diastolic || 'N/A'}</div>
              <div>Temp: {vitalSigns.vital_temp || 'N/A'}°C</div>
              <div>Pulse: {vitalSigns.vital_pulse || 'N/A'}</div>
              <div>RR: {vitalSigns.vital_RR || 'N/A'}</div>
              <div>Height: {bmiDetails.height || 'N/A'} cm</div>
              <div>Weight: {bmiDetails.weight || 'N/A'} kg</div>
            </div>
          );
        }
      }
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const data = row.original.data;
        let address = null;
        
        if (row.original.record_type === 'child-health') {
          address = data.chrec_details?.patrec_details?.pat_details?.address;
        } else {
          address = data.patrec_details?.patient_details?.address;
        }
        
        return (
          <div className="w-[200px] break-words text-sm">
            {address?.full_address || 'No address provided'}
          </div>
        );
      }
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created At <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.data.created_at ? new Date(row.original.data.created_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original.data;
        let patientData = null;
        
        if (row.original.record_type === 'child-health') {
          const patDetails = data.chrec_details?.patrec_details?.pat_details;
          const personalInfo = patDetails?.personal_info || {};
          const address = patDetails?.address || {};
          
          patientData = {
            pat_id: patDetails?.pat_id,
            pat_type: patDetails?.pat_type,
            age: personalInfo.per_dob ? calculateAge(personalInfo.per_dob).toString() : '',
            addressFull: address.full_address,
            address: {
              add_street: address.add_street,
              add_barangay: address.add_barangay,
              add_city: address.add_city,
              add_province: address.add_province,
              add_sitio: address.add_sitio
            },
            households: patDetails?.households || [],
            personal_info: personalInfo
          };
        } else {
          const patDetails = data.patrec_details?.patient_details;
          const personalInfo = patDetails?.personal_info || {};
          const address = patDetails?.address || {};
          
          patientData = {
            pat_id: data.patrec_details?.pat_id,
            pat_type: patDetails?.pat_type,
            age: personalInfo.per_dob ? calculateAge(personalInfo.per_dob).toString() : '',
            addressFull: address.full_address,
            address: {
              add_street: address.add_street,
              add_barangay: address.add_barangay,
              add_city: address.add_city,
              add_province: address.add_province,
              add_sitio: address.add_sitio
            },
            households: patDetails?.households || [],
            personal_info: personalInfo
          };
        }
        
        return (
          <div className="flex justify-center gap-2">
            <Link
              to={row.original.record_type === "child-health" ? `/child-medical-consultation` : "/medical-consultation-flow"}
              state={{
                patientData,
                ...(row.original.record_type === "child-health" ? { checkupData: data } : { MedicalConsultation: data })
              }}
            >
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        );
      }
    }
  ];

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
      let patType = '';
      
      if (record.record_type === 'child-health') {
        patType = record.data.chrec_details?.patrec_details?.pat_details?.pat_type || '';
      } else {
        patType = record.data.patrec_details?.patient_details?.pat_type || '';
      }
      
      if (patType === 'Resident') residents++;
      if (patType === 'Transient') transients++;
    });
    
    return { residents, transients };
  }, [combinedData]);
  
  const { residents, transients } = calculateCounts();

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center mb-4">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Combined Health Records</h1>
            <p className="text-xs sm:text-sm text-darkGray">View and manage all health records in one place</p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        {/* Summary Cards - Improved from reference design */}
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
                <p className="text-2xl font-bold text-gray-800">{residents}</p>
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
                <p className="text-2xl font-bold text-gray-800">{transients}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">Transient</span>
            </div>
          </div>
        </div>

        {/* Filters Section - Improved styling */}
        <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white rounded-t-lg">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search patients, ID, or details..." 
                className="pl-10 bg-white w-full" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <SelectLayout
              placeholder="Filter record type"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All Types" },
                { id: "child-health", name: "Child Health" },
                { id: "medical-consultation", name: "Medical Consultation" }
              ]}
              value={recordTypeFilter}
              onChange={(value) => setRecordTypeFilter(value)}
            />
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(+e.target.value)}
                min="1"
              />
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
          
          <div className="bg-white w-full overflow-x-auto border">
            {combinedLoading ? (
              <div className="w-full h-[100px] flex items-center text-gray-500 justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              <DataTable columns={columns} data={combinedData?.results || []} />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white rounded-b-lg border">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {(combinedData?.results || []).length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}