import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Plus, Search, ArrowUpDown, Loader2 } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
// import AddBusinessDocument from "@/pages/record/clearances/CreateBusinessModal";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button/button";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { getBusinessPermit } from "@/pages/record/clearances/restful-api/businessGetAPI"; 

type BusinessDocument = {
  permit_req_no: string;
  business_details: {
    bus_id: number;
    bus_name: string;
    bus_gross_sales: string;
    bus_province: string;
    bus_city: string;
    bus_barangay: string;
    bus_street: string;
    bus_respondentLname: string;
    bus_respondentFname: string;
    bus_respondentMname: string;
    bus_respondentSex: string;
    bus_respondentDob: string;
    bus_date_registered: string;
    sitio_id: string;
    staff_id: string;
  };
  req_sales_proof: string;
  req_pay_method: string;
  req_request_date: string;
  req_claim_date: string;
  req_status: string;
  req_payment_status: string;
  req_transac_id: string;
  issued_permit: null | any;
};

export const columns: ColumnDef<BusinessDocument>[] = [
  {
    accessorKey: "permit_req_no",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Request No.
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("permit_req_no")}</div>,
  },
  {
    accessorKey: "business_details.bus_name",
    header: "Business Name",
    cell: ({ row }) => <div className="capitalize">{row.original.business_details.bus_name}</div>,
  },
  {
    accessorKey: "business_details",
    header: "Address",
    cell: ({ row }) => {
      const details = row.original.business_details;
      return (
        <div>
          {`${details.bus_street}, ${details.bus_barangay}, ${details.bus_city}, ${details.bus_province}`}
        </div>
      );
    },
  },
  {
    accessorKey: "req_sales_proof",
    header: "Gross Sales",
    cell: ({ row }) => <div>₱ {row.getValue("req_sales_proof")}</div>,
  },
  {
    accessorKey: "req_pay_method",
    header: "Payment Method",
    cell: ({ row }) => <div>{row.getValue("req_pay_method")}</div>,
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
  }
];

function BusinessDocumentPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch business data using React Query
  const { data: businessDocuments, isLoading, error } = useQuery({
    queryKey: ["businessDocuments"],
    queryFn: getBusinessPermit,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (row: BusinessDocument) => {
    navigate(`/record/clearances/ViewDocument/${row.permit_req_no}`, {
      state: {
        requestNo: row.permit_req_no,
        purpose: row.issued_permit?.pr_purpose || row.business_details.bus_name,
        paymentMethod: row.req_pay_method,
        dateRequested: row.req_request_date,
        dateClaim: row.req_claim_date,
        status: row.req_status,
        paymentStatus: row.req_payment_status,
        transactionId: row.req_transac_id,
        type: row.business_details.bus_name,
        rate: row.issued_permit?.ags_rate,
        category: row.issued_permit?.pr_category,
      },
    });
  };

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
            options={[
              { id: "employment", name: "Employment" },
              { id: "bir", name: "BIR" },
            ]}
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
            <DataTable columns={columns} data={businessDocuments || []} onRowClick={handleRowClick} header={true} />
          )}
        </div>
      </div>

      {/* Pagination and Rows Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        {/* Showing Rows Info */}
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-10 of {businessDocuments ? businessDocuments.length : 0} rows
        </p>

        {/* Pagination */}
        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            totalPages={Math.ceil((businessDocuments?.length || 1) / 10)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default BusinessDocumentPage;
