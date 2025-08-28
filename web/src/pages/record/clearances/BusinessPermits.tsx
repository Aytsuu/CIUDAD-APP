import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {Search, ArrowUpDown, Loader2, CheckCircle } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table-click";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { getBusinessPermit, markBusinessPermitAsIssued, type BusinessPermit, type MarkBusinessPermitVariables } from "@/pages/record/clearances/queries/busFetchQueries";
import { toast } from "sonner";

// Type imported from queries

function BusinessDocumentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

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
      staff_id: "00003250722", 
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (row: BusinessPermit) => {
    navigate(`/record/clearances/BusinessPermitDocumentation/${row.bpr_id}`, {
      state: {
        requestNo: row.bpr_id,
        businessName: row.business_name,
        businessAddress: row.business_address, 
        paymentMethod: row.req_pay_method,
        dateRequested: row.req_request_date,
        dateClaim: row.req_claim_date,
        status: row.req_status,
        paymentStatus: row.req_payment_status,
        transactionId: row.req_transac_id,
        grossSales: row.business_gross_sales,
        purpose: row.req_purpose,
        pr_id: row.pr_id, 
      },
    });
  };

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
      cell: ({ row }) => <div>₱ {row.getValue("business_gross_sales")}</div>,
    },
    {
      accessorKey: "req_pay_method",
      header: "Payment Method",
      cell: ({ row }) => {
        const value = row.getValue("req_pay_method") as string;
        const capitalizedValue = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
        // Define walk-in payment methods
        const walkInMethods = ["Walk-in", "Cash", "Over-the-counter"];
        let bg = "bg-[#eaffea]"; 
        let text = "text-[#15803d]"; 
        let border = "border border-[#b6e7c3]";
        if (capitalizedValue === "Cash") {
          bg = "bg-[#eaffea]";
          text = "text-[#15803d]";
          border = "border border-[#b6e7c3]";
        } else if (value && walkInMethods.includes(capitalizedValue)) {
        } else {
          bg = "bg-[#f3f2f2]";
          text = "text-black";
          border = "border border-[#e5e7eb]";
        }
        return (
          <span
            className={`px-4 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${border}`}
            style={{ display: "inline-block", minWidth: 80, textAlign: "center" }}
          >
            {capitalizedValue}
          </span>
        );
      },
    },
    {
      accessorKey: "req_request_date",
      header: "Date Requested",
      cell: ({ row }) => <div>{row.getValue("req_request_date")}</div>,
    },
    {
      accessorKey: "req_claim_date",
      header: "Date to Claim",
      cell: ({ row }) => <div>{row.getValue("req_claim_date")}</div>,
    },

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
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
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
              <Loader2 className="h-8 w-8 animate-spin text-[#1273B8]" />
            </div>
          ) : error ? (
            <div className="text-center py-5 text-red-500">Error loading data</div>
          ) : (
            <DataTable columns={columns} data={businessPermits || []} onRowClick={handleRowClick} header={true} />
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
    </div>
  );
}

export default BusinessDocumentPage;
