import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getIssuedCertificates, getIssuedBusinessPermits, getAllPurposes, type IssuedCertificate, type IssuedBusinessPermit, type Purpose } from "@/pages/record/clearances/queries/issuedFetchQueries";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import TemplateMainPage from "../council/templates/template-main";
import { useGetStaffList } from "@/pages/record/clearances/queries/certFetchQueries";
import { calculateAge } from "@/helpers/ageCalculator";

interface ExtendedIssuedCertificate extends IssuedCertificate {
  AsignatoryStaff?: string;
  SpecificPurpose?: string;
}

function IssuedCertificates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const staffId = (user?.staff?.staff_id as string | undefined) || undefined;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [activeTab, setActiveTab] = useState<"certificates" | "businessPermits">("certificates");
  
  // Business permit states
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [businessFilterValue, setBusinessFilterValue] = useState("All");

  // Template/dialog states for issued certificates (match Certification UX)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<IssuedCertificate | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<ExtendedIssuedCertificate | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [purposeInput, setPurposeInput] = useState("");

  // Fetch staff for signatory selection
  const { data: staffList = [] } = useGetStaffList();
  const staffOptions = useMemo(() => {
    return staffList.map((staff: any) => ({
      id: staff.staff_id,
      name: staff.full_name,
    }));
  }, [staffList]);

  React.useEffect(() => {
    console.log("IssuedCertificates: resolved staffId from useAuth:", staffId);
  }, [staffId]);

  const handleViewFile = (certificate: IssuedCertificate) => {
    setSelectedCertificate(null);
    setViewingCertificate(certificate);
    setSelectedStaffId("");
    setPurposeInput("");
    setIsDialogOpen(true);
  };

  const handleProceedToTemplate = () => {
    setIsDialogOpen(false);
    if (viewingCertificate && selectedStaffId) {
      const selectedStaff = staffOptions.find((s) => s.id === selectedStaffId);
      const extended: ExtendedIssuedCertificate = {
        ...viewingCertificate,
        AsignatoryStaff: selectedStaff?.name,
        SpecificPurpose: purposeInput,
      };
      setSelectedCertificate(extended);
    }
  };

  const handleViewBusinessFile = (permit: IssuedBusinessPermit) => {
    // Navigate to ViewDocument with the business permit data
    navigate(`/record/clearances/ViewDocument/${permit.ibp_id}`, {
      state: {
        name: permit.business_name,
        purpose: permit.purpose,
        date: permit.dateIssued,
        requestId: permit.original_permit?.bpr_id || permit.ibp_id,
        requestDate: permit.original_permit?.req_request_date || permit.dateIssued,
        paymentMethod: permit.original_permit?.req_pay_method || "Walk-in",
        isIssued: true, 
        originalPermit: permit.original_permit,
        isBusinessPermit: true, 
      },
    });
  };

  const certificateColumns: ColumnDef<IssuedCertificate>[] = [
    {
      accessorKey: "requester",
      header: "Requester",
      cell: ({ row }) => <div className="capitalize">{row.getValue("requester")}</div>,
    },
    {
      accessorKey: "dateIssued",
      header: "Date Issued",
      cell: ({ row }) => {
        const dateStr = row.getValue("dateIssued") as string;
        try {
          const date = parseISO(dateStr);
          return <div>{format(date, "MM/dd/yyyy")}</div>;
        } catch (e) {
          console.error("Error formatting date:", e);
          return <div>{dateStr || ""}</div>;
        }
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const value = row.getValue("purpose") as string;
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
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => row.original && handleViewFile(row.original)}
            className="text-darkBlue2 hover:text-white hover:bg-darkBlue2"
          >
            View File
          </Button>
        </div>
      ),
    },
  ];

  const businessPermitColumns: ColumnDef<IssuedBusinessPermit>[] = [
    {
      accessorKey: "business_name",
      header: "Business Name",
      cell: ({ row }) => <div className="capitalize">{row.getValue("business_name")}</div>,
    },
    {
      accessorKey: "dateIssued",
      header: "Date Issued",
      cell: ({ row }) => {
        const dateStr = row.getValue("dateIssued") as string;
        try {
          const date = parseISO(dateStr);
          return <div>{format(date, "MM/dd/yyyy")}</div>;
        } catch (e) {
          console.error("Error formatting date:", e);
          return <div>{dateStr || ""}</div>;
        }
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const value = row.getValue("purpose") as string;
        const capitalizedValue = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
        let bg = "bg-[#eaf4ff]";
        let text = "text-[#2563eb]";
        let border = "border border-[#b6d6f7]";
        if (capitalizedValue === "Commercial Building Permit") {
          bg = "bg-[#fffbe6]";
          text = "text-[#b59f00]";
          border = "border border-[#f7e7b6]";
        } else if (capitalizedValue === "Residential Permit") {
          bg = "bg-[#eaffea]";
          text = "text-[#15803d]";
          border = "border border-[#b6e7c3]";
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
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => row.original && handleViewBusinessFile(row.original)}
            className="text-darkBlue2 hover:text-white hover:bg-darkBlue2"
          >
            View File
          </Button>
        </div>
      ),
    },
  ];

  const { data: certificates, isLoading, error } = useQuery<IssuedCertificate[]>({
    queryKey: ["issuedCertificates"],
    queryFn: getIssuedCertificates,
  });

  const { data: businessPermits, isLoading: businessPermitsLoading, error: businessPermitsError } = useQuery<IssuedBusinessPermit[]>({
    queryKey: ["issuedBusinessPermits"],
    queryFn: getIssuedBusinessPermits,
  });

  const { data: allPurposes, isLoading: purposesLoading } = useQuery<Purpose[]>({
    queryKey: ["allPurposes"],
    queryFn: getAllPurposes,
  });

  // Filter purposes to show only personal purposes for certificates
  const personalPurposes = allPurposes?.filter(purpose => 
    purpose.pr_category === "Personal And Others" && !purpose.pr_is_archive
  ) || [];

  // Filter purposes to show only permit purposes for business permits
  const permitPurposes = allPurposes?.filter(purpose => 
    purpose.pr_category === "Permit Clearance" && !purpose.pr_is_archive
  ) || [];

  const filteredCertificates = certificates?.filter((cert: IssuedCertificate) => {
    const matchesSearch = cert.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (cert.purpose && cert.purpose.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterValue === "All" || cert.purpose === filterValue;
    return matchesSearch && matchesFilter;
  });

  const filteredBusinessPermits = businessPermits?.filter((permit: IssuedBusinessPermit) => {
    const matchesSearch = permit.business_name.toLowerCase().includes(businessSearchQuery.toLowerCase()) ||
                         (permit.purpose && permit.purpose.toLowerCase().includes(businessSearchQuery.toLowerCase()));
    const matchesFilter = businessFilterValue === "All" || permit.purpose === businessFilterValue;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Issued Certifications</h1>
        <p className="text-xs sm:text-sm text-darkGray">Collection of issued certifications.</p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {activeTab === "certificates" && (
        <div className="relative w-full flex justify-between items-center mb-4">
          <div className="flex gap-x-2">
            <div className="relative flex-1 bg-white">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search..." 
                className="pl-10 w-72" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter by Purpose"
              label=""
              className="bg-white"
              options={[
                { id: "All", name: "All" },
                ...personalPurposes.map(purpose => ({ id: purpose.pr_purpose, name: purpose.pr_purpose }))
              ]}
              value={filterValue}
              onChange={(value) => setFilterValue(value)}
            />
          </div>
        </div>
      )}

      {activeTab === "businessPermits" && (
        <div className="relative w-full flex justify-between items-center mb-4">
          <div className="flex gap-x-2">
            <div className="relative flex-1 bg-white">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search..." 
                className="pl-10 w-72" 
                value={businessSearchQuery}
                onChange={(e) => setBusinessSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter by Purpose"
              label=""
              className="bg-white"
              options={[
                { id: "All", name: "All" },
                ...permitPurposes.map(purpose => ({ id: purpose.pr_purpose, name: purpose.pr_purpose }))
              ]}
              value={businessFilterValue}
              onChange={(value) => setBusinessFilterValue(value)}
            />
          </div>
        </div>
      )}

      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white p-3">
          <div className="flex gap-x-4 items-center">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input type="number" className="w-14 h-8" defaultValue="10" />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            
            {/* Tabs moved side by side with Show Entries */}
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
              <button
                onClick={() => setActiveTab("certificates")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                  activeTab === "certificates"
                    ? "bg-[#eaf4ff] text-[#2563eb] border-[#b6d6f7] shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                }`}
              >
                Certificates
              </button>
              <button
                onClick={() => setActiveTab("businessPermits")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                  activeTab === "businessPermits"
                    ? "bg-[#eaf4ff] text-[#2563eb] border-[#b6d6f7] shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                }`}
              >
                Business Permits
              </button>
            </div>
          </div>
        </div>

        {activeTab === "certificates" && (
          <div className="bg-white w-full overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#1273B8]" />
              </div>
            ) : error ? (
              <div className="text-center py-5 text-red-500">Error loading data</div>
            ) : (
              <DataTable 
                columns={certificateColumns} 
                data={filteredCertificates || []} 
                header={true} 
              />
            )}
          </div>
        )}

        {activeTab === "businessPermits" && (
          <div className="bg-white w-full overflow-x-auto">
            {businessPermitsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#1273B8]" />
              </div>
            ) : businessPermitsError ? (
              <div className="text-center py-5 text-red-500">Error loading data</div>
            ) : (
              <DataTable 
                columns={businessPermitColumns} 
                data={filteredBusinessPermits || []} 
                header={true} 
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-10 of {activeTab === "certificates" ? (filteredCertificates?.length || 0) : (filteredBusinessPermits?.length || 0)} rows
        </p>
      </div>

      {/* Render TemplateMainPage for issued certificate like Certification page */}
      {selectedCertificate && (
        <TemplateMainPage
          key={selectedCertificate.ic_id + Date.now()}
          fname={(selectedCertificate.requester || '').split(' ')[0] || ''}
          lname={(selectedCertificate.requester || '').split(' ').slice(1).join(' ') || ''}
          age={calculateAge("2003-09-04")}
          birthdate={"2003-09-04"}
          address={"Sitio Palma"}
          purpose={selectedCertificate.purpose}
          Signatory={selectedCertificate.AsignatoryStaff}
          specificPurpose={selectedCertificate.SpecificPurpose}
          issuedDate={selectedCertificate.dateIssued || new Date().toISOString()}
          isNonResident={false}
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
                  <Button type="button" onClick={handleProceedToTemplate} disabled={!selectedStaffId || !purposeInput}>
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

export default IssuedCertificates; 