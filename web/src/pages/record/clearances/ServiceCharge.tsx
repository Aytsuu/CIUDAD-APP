import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Eye, CheckCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { getPaidServiceCharges, type ServiceCharge } from "@/pages/record/clearances/queries/certFetchQueries";
import TemplateMainPage from "../council/templates/template-main";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";


interface ExtendedServiceCharge extends ServiceCharge {}

function ServiceChargePage() {
  // const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSC, setSelectedSC] = useState<ExtendedServiceCharge | null>(null);
  const queryClient = useQueryClient();
  const [refreshTick, setRefreshTick] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: serviceCharges, isLoading, error } = useQuery<ServiceCharge[]>({
    queryKey: ["paidServiceCharges"],
    queryFn: getPaidServiceCharges,
  });

  // Filter and search logic
  const filteredServiceCharges = useMemo(() => {
    if (!serviceCharges) return [];
    return serviceCharges.filter(sc => {
      const searchMatch = searchTerm === "" || 
        sc.sr_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sc.sr_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sc.complainant_name?.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  }, [serviceCharges, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((filteredServiceCharges?.length || 0) / pageSize));
  }, [filteredServiceCharges, pageSize]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredServiceCharges.slice(start, end);
  }, [filteredServiceCharges, currentPage, pageSize]);

  // Mark as Printed opens the print view immediately
  const handleMarkAsPrinted = (sc: ServiceCharge) => {
    setSelectedSC(sc as ExtendedServiceCharge);
  };

  // Eye icon: open populated template immediately
  const handleViewFile = (sc: ServiceCharge) => {
    setSelectedSC(sc as ExtendedServiceCharge);
  }

  // When print dialog/template closes, refresh table and force a remount to avoid UI glitch
  const handleTemplateClose = async () => {
    setSelectedSC(null);
    await queryClient.invalidateQueries({ queryKey: ["paidServiceCharges"] });
    setRefreshTick(t => t + 1);
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
      cell: ({ row }) => <div>{localDateFormatter(row.getValue("sr_req_date"))}</div>,
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
              title="Mark as Printed"
              description={`Open the File Action print view for ${sc.sr_code}?`}
              actionLabel="Open Print View"
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
          </div>
        </div>

        <div className="bg-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6">
            <div className="flex items-center gap-4">
              <div className="flex gap-x-2 items-center">
                <p className="text-xs sm:text-sm">Show</p>
                <Input type="number" className="w-14 h-8" value={pageSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value || '10', 10);
                    const safe = isNaN(val) || val <= 0 ? 10 : val;
                    setPageSize(safe);
                    setCurrentPage(1);
                  }}
                />
                <p className="text-xs sm:text-sm">Entries</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1273B8]" />
            </div>
          ) : error ? (
            <div className="text-center py-5 text-red-500">Error loading data</div>
          ) : (
            <DataTable 
              key={refreshTick}
              columns={columns} 
              data={paginatedData} 
              header={true} 
            />
          )}
        </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0 mt-4">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          {(() => {
            const total = filteredServiceCharges?.length || 0;
            const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
            const end = Math.min(total, currentPage * pageSize);
            return `Showing ${start}-${end} of ${total} rows`;
          })()}
        </p>

        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            className=""
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(p) => setCurrentPage(p)}
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
          onClose={handleTemplateClose}
        />
      )}
    </div>
  );
}

export default ServiceChargePage;