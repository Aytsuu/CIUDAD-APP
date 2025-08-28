import { useState } from "react";
import { useNavigate} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Search, Loader2, CheckCircle } from 'lucide-react';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table-click";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { getCertificates, markCertificateAsIssued, type Certificate, type MarkCertificateVariables } from "@/pages/record/clearances/queries/certFetchQueries";
import { toast } from "sonner";
import TemplateMainPage from "../council/templates/template-main";
import TemplatePreview from "../council/templates/template-preview";

// Type imported from queries

function CertificatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: certificates, isLoading, error } = useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: getCertificates,
  });

 
  const markAsIssuedMutation = useMutation<any, unknown, MarkCertificateVariables>({
    mutationFn: markCertificateAsIssued,
    onSuccess: (_data, variables) => {
      toast.success(`Certificate ${variables.cr_id} marked as printed successfully!`);
      
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to mark certificate as printed");
    },
  });

  const handleMarkAsPrinted = (certificate: Certificate) => {
    // markAsIssuedMutation.mutate({
    //   cr_id: certificate.cr_id,
    //   staff_id: "00005250821", // staff ID
    // });
    <TemplateMainPage
      fname={certificate.resident_details.per_fname}
      lname={certificate.resident_details.per_lname}
      birthdate={"2003-09-04"}
      address={"Sitio Palma"}
      purpose={certificate.req_purpose}
    />
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (row: Certificate) => {
    const fullName = `${row.resident_details?.per_fname || ''} ${row.resident_details?.per_lname || ''}`.trim();
    navigate(`/record/clearances/ViewDocument/${row.cr_id}`, {
      state: {
        name: fullName || row.cr_id, 
        purpose: row.req_purpose || row.req_type, 
        date: row.req_claim_date,
        requestId: row.cr_id,
        requestDate: row.req_request_date,
        paymentMethod: row.req_pay_method,
      },
    });
  };

  const columns: ColumnDef<Certificate>[] = [
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
      accessorKey: "req_purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const value = (row.getValue("req_purpose") as string) || (row.getValue("req_type") as string);
        const capitalizedValue = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
        let bg = "bg-[#eaf4ff]";
        let text = "text-[#2563eb]";
        let border = "border border-[#b6d6f7]";
        if (capitalizedValue === "Employment") {
          // blue
        } else if (capitalizedValue === "Bir") {
          bg = "bg-[#fffbe6]";
          text = "text-[#b59f00]";
          border = "border border-[#f7e7b6]";
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
      id: "actions",
      header: () => (
        <div className="w-full h-full flex justify-center items-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const certificate = row.original;
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
              title="Mark Certificate as Printed"
              description={`Are you sure you want to mark certificate ${certificate.cr_id} as printed? This will move it to the Issued Certificates page.`}
              actionLabel="Mark as Printed"
              onClick={() => handleMarkAsPrinted(certificate)}
            />
          </div>
        );
      },
    },
  ];

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
            <DataTable columns={columns} data={certificates || []} onRowClick={handleRowClick} header={true} />
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
