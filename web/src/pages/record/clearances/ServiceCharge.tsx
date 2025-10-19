import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { getPaidServiceCharges, type ServiceCharge } from "@/pages/record/clearances/queries/serviceChargeFetchQueries";
import { markServiceChargeAsIssued } from "@/pages/record/clearances/queries/serviceChargeUpdateQueries";
import TemplateMainPage from "../council/templates/template-main";
import { formatDate } from "@/helpers/dateHelper";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useLoading } from "@/context/LoadingContext";


interface ExtendedServiceCharge extends ServiceCharge {}

function ServiceChargePage() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSC, setSelectedSC] = useState<ExtendedServiceCharge | null>(null);

  const { data: serviceChargesData, isLoading, error } = useQuery({
    queryKey: ["paidServiceCharges", currentPage, searchTerm, filterStatus],
    queryFn: () => getPaidServiceCharges(searchTerm, currentPage, 10, filterStatus === "all" ? undefined : filterStatus),
  });

  // Handle loading state
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const serviceCharges = serviceChargesData?.results || [];
  const totalCount = serviceChargesData?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);

  // Since we're now using backend filtering, we don't need frontend filtering
  const filteredServiceCharges = serviceCharges;

  // Mutation for marking service charge as issued
  const markAsIssuedMutation = useMutation<any, unknown, { sr_id: string; pay_id: string }>({
    mutationFn: markServiceChargeAsIssued,
    onSuccess: async (_data, variables) => {
      showSuccessToast(`Service Charge ${variables.sr_id} marked as printed successfully!`);
      queryClient.invalidateQueries({ queryKey: ["paidServiceCharges"] });
      setSelectedSC(null);
    },
    onError: (error: any) => {
      showErrorToast(error.response?.data?.error || "Failed to mark service charge as printed");
    },
  });

  // Mark as Printed -> behave like Certification: mark as issued and move to Issued Certificates
  const handleMarkAsPrinted = (sc: ServiceCharge) => {
    markAsIssuedMutation.mutate({ sr_id: sc.sr_id, pay_id: sc.sr_id });
  };

  // Eye icon: open populated template immediately
  const handleViewFile = (sc: ServiceCharge) => {
    setSelectedSC(sc as ExtendedServiceCharge);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: ColumnDef<ServiceCharge>[] = [
    {
      accessorKey: "sr_code",
      header: ({ column }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SR No.
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize flex justify-center items-center gap-2">
          {row.getValue("sr_code")}
        </div>
      ),
    },
    {
      accessorKey: "complainant_names",
      header: "Complainant(s)",
      cell: ({ row }) => {
        const names = row.original.complainant_names || (row.original.complainant_name ? [row.original.complainant_name] : []);
        if (!names.length) return <div>—</div>;
        return <div className="text-sm">{names.join(', ')}</div>;
      },
    },
    {
      id: "complainant_addresses",
      header: "Complainant Address",
      cell: ({ row }) => {
        const addrs = row.original.complainant_addresses || [];
        if (!addrs.length) return <div>—</div>;
        return <div className="text-sm">{addrs.filter(Boolean).join(', ')}</div>;
      },
    },
    {
      accessorKey: "accused_names",
      header: "Respondent",
      cell: ({ row }) => {
        const names = row.original.accused_names || [];
        if (!names.length) return <div>—</div>;
        return <div className="text-sm">{names.join(', ')}</div>;
      },
    },
    {
      id: "accused_addresses",
      header: "Respondent Address",
      cell: ({ row }) => {
        const addrs = row.original.accused_addresses || [];
        if (!addrs.length) return <div>—</div>;
        return <div className="text-sm">{addrs.filter(Boolean).join(', ')}</div>;
      },
    },
    {
      accessorKey: "sr_req_date",
      header: "Date Requested",
      cell: ({ row }) => <div>{formatDate(row.getValue("sr_req_date"), "long")}</div>,
    },
    {
      id: "actions",
      header: () => (
        <div className="w-full h-full flex justify-center items-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const sc = row.original;
        return (
          <div className="flex justify-center gap-3" onClick={(e) => e.stopPropagation()}>
            <TooltipLayout
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewFile(sc)}
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
              title="Mark Service Charge as Printed"
              description={`Are you sure you want to mark service charge ${sc.sr_code} as printed? This will move it to the Issued Certificates page.`}
              actionLabel="Mark as Printed"
              onClick={() => handleMarkAsPrinted(sc)}
            />        
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Service Charge</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view paid service charge requests</p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2 items-center">
          <div className="relative flex-1 bg-white">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-72" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <SelectLayout
            placeholder="Filter by status"
            label=""
            className="bg-white"
            options={[
              { id: "all", name: "All Status" },
              { id: "completed", name: "Completed" },
              { id: "declined", name: "Declined" },
            ]}
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
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
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-5 text-red-500">Error loading data</div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredServiceCharges} 
              header={true} 
            />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalCount)} of {totalCount} rows
        </p>

        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {selectedSC && (
        <TemplateMainPage
          key={selectedSC.sr_id + Date.now()}
          fname={(selectedSC.complainant_names && selectedSC.complainant_names.length ? selectedSC.complainant_names.join(', ') : (selectedSC.complainant_name || ''))}
          lname={''}
          age={undefined as any}
          birthdate={selectedSC.sr_req_date as unknown as string}
          address={(selectedSC.complainant_addresses && selectedSC.complainant_addresses.length ? selectedSC.complainant_addresses.filter(Boolean).join(', ') : '')}
          purpose={'File Action'}
          Signatory={''}
          specificPurpose={`${(selectedSC.accused_names || []).join(', ')}` + "\n" + `${(() => { const addr = (selectedSC.accused_addresses || []).filter(Boolean).join(', '); return addr ? `${addr}, Brgy. San Roque Ciudad Cebu City` : 'Brgy. San Roque Ciudad Cebu City'; })()}`}
          issuedDate={new Date().toISOString()}
          isNonResident={false}
          showAddDetails={false}
          businessName={ selectedSC.sr_code}
        />
      )}
    </div>
  );
}

export default ServiceChargePage;