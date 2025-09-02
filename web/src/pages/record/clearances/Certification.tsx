import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from 'lucide-react';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { getCertificates } from "@/pages/record/clearances/restful-api/certificateGetAPI";

type Certificate = {
  cr_id: string;
  resident_details: {
    per_fname: string;
    per_lname: string;
  };
  req_pay_method: string;
  req_request_date: string;
  req_claim_date: string;
  req_type: string;
  req_payment_status: string;
  req_transac_id: string;
  invoice?: {
    inv_num: string;
    inv_serial_num: string;
    inv_date: string;
    inv_amount: string;
    inv_nat_of_collection: string;
  };
};

export const columns: ColumnDef<Certificate>[] = [
  {
    accessorKey: "cr_id",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Request No.
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("cr_id")}</div>,
  },
  {
    accessorKey: "resident_details.per_fname",
    header: "First Name",
    cell: ({ row }) => <div>{row.original.resident_details?.per_fname}</div>,
  },
  {
    accessorKey: "resident_details.per_lname",
    header: "Last Name",
    cell: ({ row }) => <div>{row.original.resident_details?.per_lname}</div>,
  },
  {
    accessorKey: "req_pay_method",
    header: "Payment Method",
    cell: ({ row }) => <div className="capitalize">{row.getValue("req_pay_method")}</div>,
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
    accessorKey: "req_type",
    header: "Purpose",
    cell: ({ row }) => <div className="capitalize">{row.getValue("req_type")}</div>,
  }
];

function CertificatePage() {
  // const navigate = useNavigate();
  // const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [_isModalOpen, _setIsModalOpen] = useState(false);

  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ["certificates"],
    queryFn: getCertificates,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const handleRowClick = (row: Certificate) => {
  //   const fullName = `${row.resident_details?.per_fname || ''} ${row.resident_details?.per_lname || ''}`.trim();
  //   navigate(`/record/clearances/ViewDocument/${row.cr_id}`, {
  //     state: {
  //       name: fullName || row.cr_id, // Use full name if available, fallback to ID
  //       purpose: row.req_type,
  //       date: row.req_claim_date,
  //       requestId: row.cr_id,
  //       requestDate: row.req_request_date,
  //       paymentMethod: row.req_pay_method,
  //     },
  //   });
  // };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Certification Request</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view paid certification requests</p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2 items-center">
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

        {/* <DialogLayout
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          trigger={<Button onClick={() => setIsModalOpen(true)}><Plus className="mr-2" /> Create Certificate</Button>}
          className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
          title="Create Certificate"
          description="Request a new certificate."
          mainContent={<AddCertificate closeModal={() => setIsModalOpen(false)} />}
        /> */}
      </div>

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
            <DataTable columns={columns} data={certificates || []} />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-10 of {certificates ? certificates.length : 0} rows
        </p>

        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            totalPages={Math.ceil((certificates?.length || 1) / 10)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default CertificatePage;
