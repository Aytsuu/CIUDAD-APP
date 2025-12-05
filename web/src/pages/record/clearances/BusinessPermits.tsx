import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {Search, ArrowUpDown, CheckCircle, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef, Column } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import TemplateMainPage from "../council/templates/template-main";
import { getBusinessPermit, type BusinessPermit } from "@/pages/record/clearances/queries/busFetchQueries";
import { markBusinessPermitAsIssued, type MarkBusinessPermitVariables } from "@/pages/record/clearances/queries/busUpdateQueries";
import { getAllPurposes, type Purpose } from "@/pages/record/clearances/queries/issuedFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { formatDate } from "@/helpers/dateHelper";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useGetStaffList } from "@/pages/record/clearances/queries/certFetchQueries";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

type ExtendedBusinessPermit = BusinessPermit & {
  signatory?: string;
};

function BusinessDocumentPage() {
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingPermit, setViewingPermit] = useState<BusinessPermit | null>(null);
  const [selectedPermit, setSelectedPermit] = useState<ExtendedBusinessPermit | null>(null);
  // Staff list for signatory
  const { data: staffList = [] } = useGetStaffList();
  const staffOptions = useMemo(() => staffList.map((staff: any) => ({ id: staff.staff_id, name: staff.full_name })), [staffList]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("all");

  const { data: businessPermits, isLoading, error } = useQuery<BusinessPermit[]>({
    queryKey: ["businessPermits"],
    queryFn: getBusinessPermit,
  });

  // Fetch purposes for filter dropdown
  const { data: allPurposes = [] } = useQuery<Purpose[]>({
    queryKey: ["allPurposes"],
    queryFn: getAllPurposes,
  });

  // Filter purposes to show only Barangay Permit and Barangay Clearance categories (for business permits)
  const businessPurposes = useMemo(() => {
    return allPurposes
      .filter(purpose => 
        !purpose.pr_is_archive && 
        (purpose.pr_category === "Barangay Permit" || purpose.pr_category === "Barangay Clearance")
      )
      .map(purpose => ({
        id: purpose.pr_purpose.toLowerCase(),
        name: purpose.pr_purpose
      }));
  }, [allPurposes]);

  // Show only paid permits and apply filters
  const paidPermits = useMemo(() => {
    let filtered = (businessPermits || [])
      .filter((p) => String(p.req_payment_status || "").toLowerCase() === "paid")
      .filter((p) => String(p.req_status || "").toLowerCase() !== "completed");
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => 
        p.business_name?.toLowerCase().includes(searchLower) ||
        p.bpr_id?.toLowerCase().includes(searchLower) ||
        (p.purpose as string)?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply purpose filter
    if (filterPurpose !== "all") {
      filtered = filtered.filter((p) => {
        const permitPurpose = (p.purpose as string)?.toLowerCase() || "";
        return permitPurpose === filterPurpose.toLowerCase();
      });
    }
    
    return filtered;
  }, [businessPermits, searchTerm, filterPurpose]);

  // Handle loading state
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Handle error state
  useEffect(() => {
    if (error) {
      showErrorToast("Failed to load business permit data. Please try again.");
    }
  }, [error]);

  
  const markAsIssuedMutation = useMutation<any, unknown, MarkBusinessPermitVariables>({
    mutationFn: markBusinessPermitAsIssued,
    onSuccess: (_data, variables) => {
      showSuccessToast(`Business permit ${variables.bpr_id} marked as printed successfully!`);
      
      queryClient.invalidateQueries({ queryKey: ["businessPermits"] });
    },
    onError: (error: any) => {
      showErrorToast(error.response?.data?.error || "Failed to mark business permit as printed");
    },
  });

  const handleMarkAsPrinted = (permit: BusinessPermit) => {
    if (!selectedStaffId) {
      showErrorToast("Please select a signatory before printing/issuing the business permit.");
      return;
    }
    markAsIssuedMutation.mutate({
      bpr_id: permit.bpr_id,
      staff_id: selectedStaffId,
    });
  };

  const handleViewFile = (permit: BusinessPermit) => {
    setSelectedPermit(null); // Clear previous selection
    setViewingPermit(permit);
    setSelectedStaffId("");
    setIsDialogOpen(true);
  };

  const handleProceed = () => {
    setIsDialogOpen(false);

    if (viewingPermit && selectedStaffId) {
      const selectedStaff = staffOptions.find(staff => staff.id === selectedStaffId);
      
      // Create permit details with staff data
      const permitDetails: ExtendedBusinessPermit = {
        ...viewingPermit,
        signatory: selectedStaff?.name,
      };
      
      setSelectedPermit(permitDetails);
      setSelectedStaffId("");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  const columns: ColumnDef<BusinessPermit>[] = [
    {
      accessorKey: "bpr_id",
      header: ({ column }: { column: Column<BusinessPermit> }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Request No.
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize flex justify-center items-center">
          <span className="px-4 py-1 rounded-full text-xs font-semibold bg-[#fffbe6] text-[#b59f00] border border-[#f7e7b6]">
            {row.getValue("bpr_id")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "business_name",
      header: ({ column }: { column: Column<BusinessPermit> }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Business Name
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => <div className="text-center capitalize">{row.getValue("business_name")}</div>,
    },
    // {
    //   accessorKey: "business_gross_sales",
    //   header: "Gross Sales",
    //   cell: ({ row }) => {
    //     const original = row.original as any;
    //     const agsId = original?.ags_id;
    //     const inputtedGrossSales = original?.bus_clearance_gross_sales;
    //     const businessGrossSales = original?.business_gross_sales;

    //     let displayAmount: number | null = null;

    //     // Priority 1: Show inputted gross sales (for new businesses with barangay clearance)
    //     if (inputtedGrossSales && agsId) {
    //       const parsed = parseFloat(inputtedGrossSales.toString());
    //       displayAmount = isNaN(parsed) ? null : parsed;
    //     }
    //     // Priority 2: Show business gross sales if available (for existing businesses)
    //     else if (businessGrossSales !== undefined && businessGrossSales !== null && businessGrossSales !== "") {
    //       const parsed = typeof businessGrossSales === 'string' ? parseFloat(businessGrossSales) : businessGrossSales;
    //       displayAmount = isNaN(parsed as number) ? null : (parsed as number);
    //     }

    //     if (displayAmount === null) {
    //       return <div className="text-center text-gray-500">Not Set</div>;
    //     }

    //     return (
    //       <div className="text-center">
    //         ₱{displayAmount.toLocaleString()}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "purpose",
      header: ({ column }: { column: Column<BusinessPermit> }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purpose
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => {
        const raw = (row.original as any)?.purpose as string | undefined;
        const value = raw ? raw.toString() : "";
        const capitalizedValue = value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "";

        let bg = "bg-[#eaf4ff]";
        let text = "text-[#2563eb]";
        let border = "border border-[#b6d6f7]";

        if (capitalizedValue === "Business clearance") {
          // blue (default)
        } else if (capitalizedValue === "Barangay sinulog permit") {
          bg = "bg-[#f0fff4]";
          text = "text-[#006400]";
          border = "border border-[#c6eac6]";
        } else if (capitalizedValue === "Barangay Fiesta Permit") {
          bg = "bg-[#fffaf0]";
          text = "text-[#b45309]";
          border = "border border-[#fcd34d]";
        } else if (capitalizedValue) {
          bg = "bg-[#f3f2f2]";
          text = "text-black";
          border = "border border-[#e5e7eb]";
        }

        const label = capitalizedValue || "Not Set";

        return (
          <div className="flex justify-center">
            <span
              className={`px-4 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${border}`}
              style={{ display: "inline-block", minWidth: 80, textAlign: "center" }}
            >
              {label}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "req_request_date",
      header: ({ column }: { column: Column<BusinessPermit> }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Requested
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => <div className="text-center">{formatDate(row.getValue("req_request_date"), "long")}</div>,
    },
    // {
    //   accessorKey: "req_claim_date",
    //   header: "Date to Claim",
    //   cell: ({ row }) => <div>{row.getValue("req_claim_date")}</div>,
    // },

    {
      id: "actions",
      header: () => (
        <div className="w-full h-full flex justify-center items-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const permit = row.original;
        return (
          <div className="flex justify-center gap-3" onClick={(e) => e.stopPropagation()}>
            <TooltipLayout
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewFile(permit)}
                >
                  <Eye size={16} />
                </Button> 
              }
              content="View File"
            />
            
            <ConfirmationModal
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-white hover:bg-green-600 border-green-600"
                >
                  <CheckCircle size={16} className="mr-1" />
                  Mark as Printed
                </Button>
              }
              title="Mark Business Permit as Printed"
              description={`Are you sure you want to mark business permit ${permit.bpr_id} as printed? This will move it to the Issued Business Permits page.`}
              actionLabel="Mark as Printed"
              onClick={() => handleMarkAsPrinted(permit)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Business Permit Request
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view business permit requests
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Main Content */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        {/* Filter Section */}
        <div className="flex gap-x-2">
          <div className="relative flex-1 bg-white">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-72" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          <SelectLayout
            placeholder="Filter by purpose"
            label=""
            className="bg-white"
            options={[
              { id: "all", name: "All Purposes" },
              ...businessPurposes
            ]}
            value={filterPurpose}
            onChange={(value) => {
              setFilterPurpose(value);
              setCurrentPage(1); // Reset to first page when filtering
            }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white p-3">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" defaultValue="10" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-5 text-red-500">Error loading data</div>
          ) : (
            <DataTable 
            columns={columns} 
            data={paidPermits}
            header={true} />
          )}
        </div>
      </div>

      {/* Pagination and Rows Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        {/* Showing Rows Info */}
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-10 of {paidPermits.length} rows
        </p>

        {/* Pagination */}
        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            totalPages={Math.ceil((paidPermits.length || 1) / 10)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Render TemplateMainPage when a permit is selected */}
      {selectedPermit && (
        <TemplateMainPage
          businessName={selectedPermit.business_name}
          address={selectedPermit.business_address}
          purpose={selectedPermit.purpose}
          issuedDate={new Date().toISOString()}
          Signatory={selectedPermit.signatory || ""}
          showAddDetails={false}
        />
      )}

      {/* Dialog for signatory selection */}
      <DialogLayout
    isOpen={isDialogOpen}
    onOpenChange={(open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
        setSelectedStaffId("");
      }
    }}
    className="max-w-[35%] max-h-[85vh] flex flex-col overflow-auto scrollbar-custom"
    title="Additional Details"
    description={`Please provide the needed details for the certificate.`}
    mainContent={
      <div>
        {viewingPermit ? (
          <div className="space-y-3">
            <Label className="pb-1">Signatory</Label>
            <div className="w-full pb-3">
              <Combobox
                options={staffOptions}
                value={selectedStaffId}
                onChange={(value) => setSelectedStaffId(value || "")}
                placeholder="Select signatory staff member"
                emptyMessage="No staff found"
                triggerClassName="w-full"
                contentClassName="w-full"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                className="bg-[#2563eb] hover:bg-[#1746a2] text-white"
                onClick={handleProceed}
                disabled={!selectedStaffId}
              >
                Proceed
              </Button>
            </div>
          </div>
        ) : (
          <p>No permit selected</p>
        )}
      </div>
    }
  />
    </div>
  );
}

export default BusinessDocumentPage;
