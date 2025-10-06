import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {Search, ArrowUpDown, CheckCircle, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { getBusinessPermit, markBusinessPermitAsIssued, type BusinessPermit, type MarkBusinessPermitVariables } from "@/pages/record/clearances/queries/busFetchQueries";
import { toast } from "sonner";
import TemplateMainPage from "../council/templates/template-main";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useAuth } from "@/context/AuthContext";

function BusinessDocumentPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const staffId = (user?.staff?.staff_id as string | undefined) || undefined;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPermit, setSelectedPermit] = useState<BusinessPermit | null>(null);

  const { data: businessPermits, isLoading, error } = useQuery<BusinessPermit[]>({
    queryKey: ["businessPermits"],
    queryFn: getBusinessPermit,
  });

  
  const markAsIssuedMutation = useMutation<any, unknown, MarkBusinessPermitVariables>({
    mutationFn: markBusinessPermitAsIssued,
    onSuccess: (_data, variables) => {
      toast.success(`Business permit ${variables.bpr_id} marked as printed successfully!`);
      
      queryClient.invalidateQueries({ queryKey: ["businessPermits"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to mark business permit as printed");
    },
  });

  const handleMarkAsPrinted = (permit: BusinessPermit) => {
    markAsIssuedMutation.mutate({
      bpr_id: permit.bpr_id,
      staff_id: staffId, 
    });
  };

  const handleViewFile = (permit: BusinessPermit) => {
    console.log("Eye button clicked for permit:", permit);
    console.log("Setting selectedPermit to:", permit);
    setSelectedPermit(permit); 
    console.log("selectedPermit state should now be:", permit);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const handleRowClick = (row: BusinessPermit) => {
  //   navigate(`/record/clearances/BusinessPermitDocumentation/${row.bpr_id}`, {
  //     state: {
  //       requestNo: row.bpr_id,
  //       businessName: row.business_name,
  //       businessAddress: row.business_address, 
  //       paymentMethod: row.req_pay_method,
  //       dateRequested: row.req_request_date,
  //       dateClaim: row.req_claim_date,
  //       status: row.req_status,
  //       paymentStatus: row.req_payment_status,
  //       transactionId: row.req_transac_id,
  //       grossSales: row.business_gross_sales,
  //       purpose: row.req_purpose,
  //       pr_id: row.pr_id, 
  //     },
  //   });
  // };

  const columns: ColumnDef<BusinessPermit>[] = [
    {
      accessorKey: "bpr_id",
      header: ({ column }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Request No.
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue("bpr_id")}</div>,
    },
    {
      accessorKey: "business_name",
      header: "Business Name",
      cell: ({ row }) => <div className="capitalize">{row.getValue("business_name")}</div>,
    },
    {
      accessorKey: "business_gross_sales",
      header: "Gross Sales",
      cell: ({ row }) => {
        const grossSales = row.getValue("business_gross_sales") as string | number;
        
        // If grossSales is empty, null, or undefined, show "Not Set"
        if (!grossSales || grossSales === "" || grossSales === "0") {
          return <div className="text-center text-gray-500">Not Set</div>;
        }
        
        // Format the gross sales amount
        const amount = typeof grossSales === 'string' ? parseFloat(grossSales) : grossSales;
        
        // Check if it's a valid number
        if (isNaN(amount)) {
          return <div className="text-center text-gray-500">{grossSales}</div>;
        }
        
        return (
          <div className="text-center">
            ₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: "req_pay_method",
      header: "Payment Method",
      cell: ({ }) => {
        // Display "Walk-in" for all business permit requests
        const value = "Walk-in";
        const bg = "bg-[#eaffea]"; 
        const text = "text-[#15803d]"; 
        const border = "border border-[#b6e7c3]";
        
        return (
          <span
            className={`px-4 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${border}`}
            style={{ display: "inline-block", minWidth: 80, textAlign: "center" }}
          >
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: "req_request_date",
      header: "Date Requested",
      cell: ({ row }) => <div>{row.getValue("req_request_date")}</div>,
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
            <Input placeholder="Search..." className="pl-10 w-72" />
          </div>
          <SelectLayout
            placeholder="Filter by"
            label=""
            className="bg-white"
            options={[]}
            value=""
            onChange={() => {}}
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
            data={businessPermits || []}
            header={true} />
          )}
        </div>
      </div>

      {/* Pagination and Rows Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        {/* Showing Rows Info */}
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-10 of {businessPermits ? businessPermits.length : 0} rows
        </p>

        {/* Pagination */}
        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            totalPages={Math.ceil((businessPermits?.length || 1) / 10)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Render Business Permit Template when a permit is selected */}
      {selectedPermit && (
        <DialogLayout
          isOpen={!!selectedPermit}
          onOpenChange={(open) => !open && setSelectedPermit(null)}
          className="max-w-full h-full flex flex-col overflow-auto scrollbar-custom"
          title=""
          description=""
          mainContent={
            <div className="w-full h-full">
              <TemplateMainPage
                businessName={selectedPermit.business_name || "N/A"}
                address={selectedPermit.business_address || "N/A"}
                purpose="bussClear"
                issuedDate={new Date().toISOString()}
              />
            </div>
          }
        />
      )}
    </div>
  );
}

export default BusinessDocumentPage;
