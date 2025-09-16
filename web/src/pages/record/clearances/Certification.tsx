import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, CheckCircle, Eye } from 'lucide-react';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { getCertificates, markCertificateAsIssued, type Certificate, type MarkCertificateVariables } from "@/pages/record/clearances/queries/certFetchQueries";
import { toast } from "sonner";
import TemplateMainPage from "../council/templates/template-main";
import { calculateAge } from '@/helpers/ageCalculator';
import { useUpdateCertStatus, useUpdateNonCertStatus } from "./queries/certUpdateQueries";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import { useGetStaffList } from "@/pages/record/clearances/queries/certFetchQueries";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Combobox } from "@/components/ui/combobox";
import { useAuth } from "@/context/AuthContext";


interface ExtendedCertificate extends Certificate {
  AsignatoryStaff?: string;
  SpecificPurpose?: string;
}

function CertificatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const staffId = (user?.staff?.staff_id as string | undefined) || undefined;
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [filterPurpose, setFilterPurpose] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const {mutate: updateStatus} = useUpdateCertStatus()
  const {mutate: updateNonResStatus} = useUpdateNonCertStatus()
  
  const { data: staffList = []} = useGetStaffList();

  const [isDialogOpen, setIsDialogOpen] = useState(false); 
  const [viewingCertificate, setViewingCertificate] = useState<ExtendedCertificate | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<ExtendedCertificate | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState(""); 
  const [purposeInput, setPurposeInput] = useState("");

  const staffOptions = useMemo(() => {
    return staffList.map((staff) => ({
      id: staff.staff_id,
      name: staff.full_name,
    }));
  }, [staffList]);

  console.log("STAFF OPTIONS: ", staffOptions)

  const { data: certificates, isLoading, error } = useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: getCertificates,
  });

  // Filter and search logic
  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];
    
    return certificates.filter(certificate => {
      // Filter by type (resident/non-resident)
      const typeMatch = filterType === "all" || 
        (filterType === "resident" && !certificate.is_nonresident) ||
        (filterType === "nonresident" && certificate.is_nonresident);
      
      // Filter by purpose
      const purposeMatch = filterPurpose === "all" || 
        (filterPurpose === "employment" && certificate.req_purpose?.toLowerCase() === "employment") ||
        (filterPurpose === "bir" && certificate.req_purpose?.toLowerCase() === "bir");
      
      // Search filter
      const searchMatch = searchTerm === "" || 
        certificate.cr_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.resident_details?.per_fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.resident_details?.per_lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (certificate.is_nonresident && certificate.nrc_requester?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return typeMatch && purposeMatch && searchMatch;
    });
  }, [certificates, filterType, filterPurpose, searchTerm]);

  const markAsIssuedMutation = useMutation<any, unknown, MarkCertificateVariables>({
    mutationFn: markCertificateAsIssued,
    onSuccess: async (_data, variables) => {
      const certificateType = variables.is_nonresident ? 'Non-resident certificate' : 'Certificate';
      const certificateId = variables.is_nonresident ? variables.nrc_id : variables.cr_id;
      
      toast.success(`${certificateType} ${certificateId} marked as printed successfully!`);
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      
      try {
        // Only call updateStatus for resident certificates
        if (!variables.is_nonresident) {
          await updateStatus(variables.cr_id);
        }
        else{
          await updateNonResStatus(Number(variables.nrc_id))
        }

        setSelectedCertificate(null);
      } catch (error) {
        toast.error("First mutation succeeded but second failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to mark certificate as printed");
    },
  });

  const handleMarkAsPrinted = (certificate: Certificate) => {
    const markData: MarkCertificateVariables = {
      cr_id: certificate.cr_id,
      // Include staff_id if available and valid (backend now strictly validates; no upsert)
      staff_id: staffId,
      is_nonresident: certificate.is_nonresident || false,
    };

    if (certificate.is_nonresident && certificate.nrc_id) {
      markData.nrc_id = certificate.nrc_id;
    }

    console.log("Mark as Printed payload:", {
      staffId,
      is_nonresident: markData.is_nonresident,
      cr_id: markData.cr_id,
      nrc_id: markData.nrc_id,
    });

    markAsIssuedMutation.mutate(markData);
  };

  const handleViewFile = (certificate: Certificate) => {
    setSelectedCertificate(null); // previous selection
    setViewingCertificate(certificate);
    setSelectedStaffId(""); // Reset selected staff every time
    setPurposeInput("")
    setIsDialogOpen(true);
  }

  const handleViewFile2 = () => {
    setIsDialogOpen(false); 

    if (viewingCertificate && selectedStaffId) {
      // Find the selected staff details
      const selectedStaff = staffOptions.find(staff => staff.id === selectedStaffId);
      
      //with both certificate and staff data
      const certDetails: ExtendedCertificate = {
        ...viewingCertificate,
        AsignatoryStaff: selectedStaff?.name,
        SpecificPurpose: purposeInput
      };
      
      setSelectedCertificate(certDetails);// Close the dialog
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const handleRowClick = (row: Certificate) => {
  //   const fullName = `${row.resident_details?.per_fname || ''} ${row.resident_details?.per_lname || ''}`.trim();
  //   navigate(`/record/clearances/ViewDocument/${row.cr_id}`, {
  //     state: {
  //       name: fullName || row.cr_id,
  //       purpose: row.req_purpose || row.req_type,
  //       date: row.req_claim_date,
  //       requestId: row.cr_id,
  //       requestDate: row.req_request_date,
  //       paymentMethod: row.req_pay_method,
  //       isNonResident: row.is_nonresident,
  //       nonResidentData: row.is_nonresident ? {
  //         requester: row.nrc_requester,
  //         address: row.nrc_address,
  //         birthdate: row.nrc_birthdate,
  //       } : undefined,
  //     },
  //   });
  // };

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
      cell: ({ row }) => (
        <div className="capitalize flex justify-center items-center gap-2">
          {row.original.is_nonresident && (
            <TooltipLayout 
              trigger={''} 
              content="Non-resident" 
            />
          )}
          {row.getValue("cr_id")}
        </div>
      ),
    },
    {
      accessorKey: "resident_details.per_fname",
      header: "First Name",
      cell: ({ row }) => <div>{row.original.resident_details?.per_fname || row.original.nrc_requester || 'N/A'}</div>,
    },
    {
      accessorKey: "resident_details.per_lname",
      header: "Last Name",
      cell: ({ row }) => <div>{row.original.resident_details?.per_lname || 'N/A'}</div>,
    },
    {
      accessorKey: "req_request_date",
      header: "Date Requested",
      cell: ({ row }) => <div>{localDateFormatter(row.getValue("req_request_date"))}</div>,
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
          // blue (default)
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
      id: "certificate_type",
      header: "Type",
      cell: ({ row }) => {
        const isNonResident = row.original.is_nonresident;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isNonResident 
                ? "bg-purple-100 text-purple-700 border border-purple-200" 
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            {isNonResident ? "Non-resident" : "Resident"}
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
          <div className="flex justify-center gap-3" onClick={(e) => e.stopPropagation()}>
            <TooltipLayout
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewFile(certificate)}
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
              title="Mark Certificate as Printed"
              description={`Are you sure you want to mark ${certificate.is_nonresident ? 'non-resident ' : ''}certificate ${certificate.cr_id} as printed? This will move it to the Issued Certificates page.`}
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
        <p className="text-xs sm:text-sm text-darkGray">Manage and view paid certification requests (residents and non-residents)</p>
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
            placeholder="Filter by type"
            label=""
            className="bg-white"
            options={[
              { id: "all", name: "All Types" },
              { id: "resident", name: "Residents" },
              { id: "nonresident", name: "Non-residents" },
            ]}
            value={filterType}
            onChange={(value) => setFilterType(value)}
          />
          <SelectLayout
            placeholder="Filter by purpose"
            label=""
            className="bg-white"
            options={[
              { id: "all", name: "All Purposes" },
              { id: "employment", name: "Employment" },
              { id: "bir", name: "BIR" },
            ]}
            value={filterPurpose}
            onChange={(value) => setFilterPurpose(value)}
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
            <DataTable 
              columns={columns} 
              data={filteredCertificates} 
              header={true} 
            />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-{Math.min(10, filteredCertificates.length)} of {filteredCertificates.length} rows
        </p>

        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            totalPages={Math.ceil((filteredCertificates.length || 1) / 10)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Render TemplateMainPage when a certificate is selected */}
      {selectedCertificate && (
        <TemplateMainPage
          key={selectedCertificate.cr_id + Date.now()}
          fname={selectedCertificate.resident_details?.per_fname || selectedCertificate.nrc_requester?.split(' ')[0] || ''}
          lname={selectedCertificate.resident_details?.per_lname || selectedCertificate.nrc_requester?.split(' ').slice(1).join(' ') || ''}
          age={calculateAge(selectedCertificate.nrc_birthdate || "2003-09-04")}
          birthdate={selectedCertificate.nrc_birthdate || "2003-09-04"}
          address={selectedCertificate.nrc_address || "Sitio Palma"}
          purpose={selectedCertificate.req_purpose}
          Signatory={selectedCertificate.AsignatoryStaff}
          specificPurpose={selectedCertificate.SpecificPurpose}
          issuedDate={new Date().toISOString()}
          isNonResident={selectedCertificate.is_nonresident}
          showAddDetails={false}
        />
      )}


      <DialogLayout
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
        }}
        className="max-w-[30%] h-[330px] flex flex-col overflow-auto scrollbar-custom"
        title="Additional Details"
        description={`Please provide the needed details for the certificate.`}
        mainContent={
          <div>
            {viewingCertificate ? (
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

                <Label className="pb-1">Purpose</Label>           
                <div className="w-full pb-3">
                  <Input 
                    placeholder="Specify Purpose"
                    value={purposeInput} 
                    onChange={(e) => setPurposeInput(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                    <Button type="button" onClick={handleViewFile2} disabled={!selectedStaffId || !purposeInput} >
                        Proceed
                    </Button>
                </div>                       
              </div>
            ) : (
              <p>No certificate selected</p>
            )}
          </div>
        }
      />
    </div>
  );
}

export default CertificatePage;