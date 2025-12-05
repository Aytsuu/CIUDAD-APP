import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef, Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { format, parseISO } from "date-fns";
import { getIssuedCertificates, getIssuedBusinessPermits, getAllPurposes, type IssuedCertificate, type IssuedBusinessPermit, type Purpose } from "@/pages/record/clearances/queries/issuedFetchQueries";
import { getPaidServiceCharges, type ServiceCharge } from "@/pages/record/clearances/queries/serviceChargeFetchQueries";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import { ArrowUpDown } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import TemplateMainPage from "../council/templates/template-main";
import { useGetStaffList } from "@/pages/record/clearances/queries/certFetchQueries";
import { calculateAge } from "@/helpers/ageCalculator";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useLoading } from "@/context/LoadingContext";

interface ExtendedIssuedCertificate extends IssuedCertificate {
  AsignatoryStaff?: string;
  SpecificPurpose?: string;
}

function IssuedCertificates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [activeTab, setActiveTab] = useState<"certificates" | "businessPermits" | "serviceCharges">("certificates");
  
  
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [businessFilterValue, setBusinessFilterValue] = useState("");
  
  const [serviceChargeSearchQuery, setServiceChargeSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<IssuedCertificate | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<ExtendedIssuedCertificate | null>(null);
  const [selectedBusinessPermit, setSelectedBusinessPermit] = useState<IssuedBusinessPermit | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [purposeInput, setPurposeInput] = useState("");

  
  const { data: staffList = [] } = useGetStaffList();
  const staffOptions = useMemo(() => {
    return staffList.map((staff: any) => ({
      id: staff.staff_id,
      name: staff.full_name,
    }));
  }, [staffList]);


  const { showLoading, hideLoading } = useLoading();

  const handleViewFile = (certificate: IssuedCertificate) => {
    setSelectedCertificate(null);
    setViewingCertificate(certificate);
    setSelectedStaffId("");
    setPurposeInput("");
    setIsDialogOpen(true);
  };

  const handleViewServiceChargeFile = (serviceCharge: ServiceCharge) => {
    
    const extended: ExtendedIssuedCertificate = {
      ...serviceCharge as any,
      AsignatoryStaff: "Default Signatory", 
      SpecificPurpose: "File Action", 
    };
    setSelectedCertificate(extended);
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
    setSelectedBusinessPermit(permit);
  };

  const certificateColumns: ColumnDef<IssuedCertificate>[] = [
    {
      accessorKey: "cr_id",
      header: ({ column }: { column: Column<IssuedCertificate> }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Request No.
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => {
        // For non-residents, show nrc_id; for residents, show cr_id
        const certificate = row.original;
        const requestId = certificate.is_nonresident ? certificate.nrc_id : certificate.cr_id;
        return (
          <div className="flex justify-center items-center gap-2">
            <span className="px-4 py-1 rounded-full text-xs font-semibold bg-[#eaf4ff] text-[#2563eb] border border-[#b6d6f7]">
              {requestId || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "requester",
      header: () => <div className="text-center">Requester</div>,
      cell: ({ row }) => <div className="text-center capitalize">{row.getValue("requester")}</div>,
    },
    {
      accessorKey: "dateIssued",
      header: () => <div className="text-center">Date Issued</div>,
      cell: ({ row }) => {
        const dateStr = row.getValue("dateIssued") as string;
        try {
          const date = parseISO(dateStr);
          return <div className="text-center">{format(date, "MM/dd/yyyy")}</div>;
        } catch (e) {
          return <div className="text-center">{dateStr || ""}</div>;
        }
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const value = row.getValue("purpose") as string;
        const capitalizedValue = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
        const lowerValue = value?.toLowerCase() || '';
        
        let bg = "bg-[#eaf4ff]";
        let text = "text-[#2563eb]";
        let border = "border border-[#b6d6f7]";
        
        // Employment - Blue (default)
        if (lowerValue === "employment") {
          bg = "bg-[#eaf4ff]";
          text = "text-[#2563eb]";
          border = "border border-[#b6d6f7]";
        }
        // BIR - Yellow/Amber
        else if (lowerValue === "bir") {
          bg = "bg-[#fffbe6]";
          text = "text-[#b59f00]";
          border = "border border-[#f7e7b6]";
        }
        // Burial - Gray
        else if (lowerValue === "burial") {
          bg = "bg-[#f3f2f2]";
          text = "text-black";
          border = "border border-[#e5e7eb]";
        }
        // First Time Job Seeker - Green
        else if (lowerValue === "first time job seeker") {
          bg = "bg-[#f0fff4]";
          text = "text-[#006400]";
          border = "border border-[#c6eac6]";
        }
        // Identification - Purple
        else if (lowerValue === "identification") {
          bg = "bg-[#f3e8ff]";
          text = "text-[#7c3aed]";
          border = "border border-[#c4b5fd]";
        }
        // Loan - Orange
        else if (lowerValue === "loan") {
          bg = "bg-[#fff7ed]";
          text = "text-[#c2410c]";
          border = "border border-[#fdba74]";
        }
        // SSS - Teal
        else if (lowerValue === "sss") {
          bg = "bg-[#f0fdfa]";
          text = "text-[#0d9488]";
          border = "border border-[#5eead4]";
        }
        // Bank Requirement - Indigo
        else if (lowerValue === "bank requirement") {
          bg = "bg-[#e0e7ff]";
          text = "text-[#4338ca]";
          border = "border border-[#a5b4fc]";
        }
        // Electrical Connection - Amber
        else if (lowerValue === "electrical connection") {
          bg = "bg-[#fef3c7]";
          text = "text-[#d97706]";
          border = "border border-[#fcd34d]";
        }
        // MCWD Requirements - Cyan
        else if (lowerValue === "mcwd requirements") {
          bg = "bg-[#e0f2fe]";
          text = "text-[#0369a1]";
          border = "border border-[#7dd3fc]";
        }
        // Scholarship - Emerald
        else if (lowerValue === "scholarship") {
          bg = "bg-[#d1fae5]";
          text = "text-[#047857]";
          border = "border border-[#6ee7b7]";
        }
        // Postal ID - Rose
        else if (lowerValue === "postal id") {
          bg = "bg-[#fff1f2]";
          text = "text-[#be123c]";
          border = "border border-[#fda4af]";
        }
        // NBI - Slate
        else if (lowerValue === "nbi") {
          bg = "bg-[#f1f5f9]";
          text = "text-[#475569]";
          border = "border border-[#cbd5e1]";
        }
        // Board Examination - Violet
        else if (lowerValue === "board examination") {
          bg = "bg-[#ede9fe]";
          text = "text-[#6d28d9]";
          border = "border border-[#a78bfa]";
        }
        // TESDA - Sky
        else if (lowerValue === "tesda") {
          bg = "bg-[#e0f2fe]";
          text = "text-[#0c4a6e]";
          border = "border border-[#7dd3fc]";
        }
        // PWD Identification - Pink
        else if (lowerValue === "pwd identification") {
          bg = "bg-[#fce7f3]";
          text = "text-[#be185d]";
          border = "border border-[#f9a8d4]";
        }
        // PWD Financial Assistance - Fuchsia
        else if (lowerValue === "pwd financial assistance") {
          bg = "bg-[#fdf4ff]";
          text = "text-[#a21caf]";
          border = "border border-[#f0abfc]";
        }
        // Senior Citizen Identification - Lime
        else if (lowerValue === "senior citizen identification") {
          bg = "bg-[#f7fee7]";
          text = "text-[#365314]";
          border = "border border-[#bef264]";
        }
        // Senior Citizen Financial Assistance - Green
        else if (lowerValue === "senior citizen financial assistance") {
          bg = "bg-[#dcfce7]";
          text = "text-[#166534]";
          border = "border border-[#86efac]";
        }
        // Bail Bond - Red
        else if (lowerValue === "bail bond") {
          bg = "bg-[#fee2e2]";
          text = "text-[#991b1b]";
          border = "border border-[#fca5a5]";
        }
        // Fire Victim - Orange
        else if (lowerValue === "fire victim") {
          bg = "bg-[#ffedd5]";
          text = "text-[#9a3412]";
          border = "border border-[#fdba74]";
        }
        // Cohabitation - Purple
        else if (lowerValue === "cohabitation") {
          bg = "bg-[#f3e8ff]";
          text = "text-[#6b21a8]";
          border = "border border-[#c4b5fd]";
        }
        // Marriage Certification - Rose
        else if (lowerValue === "marriage certification") {
          bg = "bg-[#fff1f2]";
          text = "text-[#9f1239]";
          border = "border border-[#fda4af]";
        }
        // DWUP - Stone
        else if (lowerValue === "dwup") {
          bg = "bg-[#fafaf9]";
          text = "text-[#57534e]";
          border = "border border-[#d6d3d1]";
        }
        // Probation - Zinc
        else if (lowerValue === "probation") {
          bg = "bg-[#fafafa]";
          text = "text-[#3f3f46]";
          border = "border border-[#d4d4d8]";
        }
        // Police Clearance - Blue
        else if (lowerValue === "police clearance") {
          bg = "bg-[#dbeafe]";
          text = "text-[#1e40af]";
          border = "border border-[#93c5fd]";
        }
        // Barangay Clearance - Emerald
        else if (lowerValue === "barangay clearance") {
          bg = "bg-[#d1fae5]";
          text = "text-[#065f46]";
          border = "border border-[#6ee7b7]";
        }
        // Proof of Custody - Indigo
        else if (lowerValue === "proof of custody") {
          bg = "bg-[#e0e7ff]";
          text = "text-[#3730a3]";
          border = "border border-[#a5b4fc]";
        }
        // Good Moral - Teal
        else if (lowerValue === "good moral") {
          bg = "bg-[#ccfbf1]";
          text = "text-[#134e4a]";
          border = "border border-[#5eead4]";
        }
        // Indigency (for minors) - Amber
        else if (lowerValue === "indigency (for minors)") {
          bg = "bg-[#fef3c7]";
          text = "text-[#92400e]";
          border = "border border-[#fcd34d]";
        }
        // Indigency - Yellow
        else if (lowerValue === "indigency") {
          bg = "bg-[#fefce8]";
          text = "text-[#713f12]";
          border = "border border-[#fde047]";
        }
        // Default - Gray
        else {
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
      accessorKey: "bpr_id",
      header: ({ column }: { column: Column<IssuedBusinessPermit> }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Request No.
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center items-center gap-2">
          <span className="px-4 py-1 rounded-full text-xs font-semibold bg-[#fffbe6] text-[#b59f00] border border-[#f7e7b6]">
            {row.getValue("bpr_id")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "business_name",
      header: () => <div className="text-center">Business Name</div>,
      cell: ({ row }) => <div className="text-center capitalize">{row.getValue("business_name")}</div>,
    },
    {
      accessorKey: "dateIssued",
      header: () => <div className="text-center">Date Issued</div>,
      cell: ({ row }) => {
        const dateStr = row.getValue("dateIssued") as string;
        try {
          const date = parseISO(dateStr);
          return <div>{format(date, "MM/dd/yyyy")}</div>;
        } catch (e) {
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
        const lowerValue = value?.toLowerCase() || '';
        
        let bg = "bg-[#eaf4ff]";
        let text = "text-[#2563eb]";
        let border = "border border-[#b6d6f7]";
        
        if (lowerValue === "business clearance") {
          // blue (default)
          bg = "bg-[#eaf4ff]";
          text = "text-[#2563eb]";
          border = "border border-[#b6d6f7]";
        } else if (lowerValue === "barangay sinulog permit") {
          bg = "bg-[#f0fff4]";
          text = "text-[#006400]";
          border = "border border-[#c6eac6]";
        } else if (lowerValue === "barangay fiesta permit") {
          bg = "bg-[#fffaf0]";
          text = "text-[#b45309]";
          border = "border border-[#fcd34d]";
        } else if (lowerValue === "electrical connection") {
          bg = "bg-[#fef3c7]";
          text = "text-[#d97706]";
          border = "border border-[#fcd34d]";
        } else if (lowerValue === "building permit") {
          bg = "bg-[#e0e7ff]";
          text = "text-[#4338ca]";
          border = "border border-[#a5b4fc]";
        } else if (capitalizedValue) {
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

  const serviceChargeColumns: ColumnDef<ServiceCharge>[] = [
    {
      accessorKey: "sr_code",
      header: ({ column }: { column: Column<ServiceCharge> }) => (
        <div
          className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Request No.
          <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center items-center gap-2">
          <span className="px-4 py-1 rounded-full text-xs font-semibold bg-[#e6f7e6] text-[#16a34a] border border-[#d1f2d1]">
            {row.getValue("sr_code")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "complainant_names",
      header: "Complainant",
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
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => row.original && handleViewServiceChargeFile(row.original)}
            className="text-darkBlue2 hover:text-white hover:bg-darkBlue2"
          >
            View File
          </Button>
        </div>
      ),
    },
  ];

  const { data: certificatesPage, isLoading, error } = useQuery({
    queryKey: ["issuedCertificates", searchQuery, currentPage, pageSize, filterValue],
    queryFn: () => getIssuedCertificates(searchQuery, currentPage, pageSize, filterValue),
  });

  const { data: businessPermitsPage, isLoading: businessPermitsLoading, error: businessPermitsError } = useQuery({
    queryKey: ["issuedBusinessPermits", businessSearchQuery, currentPage, pageSize, businessFilterValue],
    queryFn: () => getIssuedBusinessPermits(businessSearchQuery, currentPage, pageSize, businessFilterValue),
  });

  const { data: serviceChargesData, isLoading: serviceChargesLoading, error: serviceChargesError } = useQuery({
    queryKey: ["issuedServiceCharges", serviceChargeSearchQuery, currentPage, pageSize],
    queryFn: () => getPaidServiceCharges(serviceChargeSearchQuery, currentPage, pageSize, 'completed'),
  });

  const serviceCharges = serviceChargesData?.results || [];

  const { data: allPurposes, isLoading: _purposesLoading } = useQuery<Purpose[]>({
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

  const certificates = certificatesPage?.results || [];
  const certCount = certificatesPage?.count || 0;
  const totalPagesCert = Math.ceil(certCount / pageSize) || 1;

  const filteredCertificates = certificates?.filter((cert: IssuedCertificate) => {
    const requestId = cert.is_nonresident ? cert.nrc_id : cert.cr_id;
    const matchesSearch = cert.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (cert.purpose && cert.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (requestId && requestId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = !filterValue || filterValue === "All" || cert.purpose === filterValue;
    return matchesSearch && matchesFilter;
  });

  const sortedCertificates = (filteredCertificates || []).slice().sort((a, b) => {
    const aT = a?.dateIssued ? Date.parse(a.dateIssued as any) : 0;
    const bT = b?.dateIssued ? Date.parse(b.dateIssued as any) : 0;
    return bT - aT;
  });

  const businessPermits = businessPermitsPage?.results || [];
  const bpCount = businessPermitsPage?.count || 0;
  const totalPagesBP = Math.ceil(bpCount / pageSize) || 1;

  useEffect(() => {
    if (isLoading || businessPermitsLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, businessPermitsLoading, showLoading, hideLoading]);

  useEffect(() => {
    setCurrentPage(1);
    // Clear selected certificate/permit when switching tabs
    setSelectedCertificate(null);
    setSelectedBusinessPermit(null);
  }, [activeTab, filterValue, businessFilterValue, searchQuery, businessSearchQuery, pageSize]);

  const filteredBusinessPermits = businessPermits?.filter((permit: IssuedBusinessPermit) => {
    const matchesSearch = permit.business_name.toLowerCase().includes(businessSearchQuery.toLowerCase()) ||
      (permit.purpose && permit.purpose.toLowerCase().includes(businessSearchQuery.toLowerCase()));
    const matchesFilter = !businessFilterValue || businessFilterValue === "All" || permit.purpose === businessFilterValue;
    return matchesSearch && matchesFilter;
  });

  const sortedBusinessPermits = (filteredBusinessPermits || []).slice().sort((a, b) => {
    const aT = a?.dateIssued ? Date.parse(a.dateIssued as any) : 0;
    const bT = b?.dateIssued ? Date.parse(b.dateIssued as any) : 0;
    return bT - aT;
  });

  const filteredServiceCharges = serviceCharges?.filter((sc: ServiceCharge) => {
    const matchesSearch = sc.sr_id?.toLowerCase().includes(serviceChargeSearchQuery.toLowerCase()) ||
                         sc.sr_code?.toLowerCase().includes(serviceChargeSearchQuery.toLowerCase()) ||
                         sc.complainant_name?.toLowerCase().includes(serviceChargeSearchQuery.toLowerCase());
    return matchesSearch;
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
              options={personalPurposes.map(purpose => ({ id: purpose.pr_purpose, name: purpose.pr_purpose }))}
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
              options={permitPurposes.map(purpose => ({ id: purpose.pr_purpose, name: purpose.pr_purpose }))}
              value={businessFilterValue}
              onChange={(value) => setBusinessFilterValue(value)}
            />
          </div>
        </div>
      )}

      {activeTab === "serviceCharges" && (
        <div className="relative w-full flex justify-between items-center mb-4">
          <div className="flex gap-x-2">
            <div className="relative flex-1 bg-white">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search..." 
                className="pl-10 w-72" 
                value={serviceChargeSearchQuery}
                onChange={(e) => setServiceChargeSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white p-3">
          <div className="flex gap-x-4 items-center">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input type="number" className="w-14 h-8" value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value) || 10)} />
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
              <button
                onClick={() => setActiveTab("serviceCharges")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                  activeTab === "serviceCharges"
                    ? "bg-[#eaf4ff] text-[#2563eb] border-[#b6d6f7] shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                }`}
              >
                Service Charges
              </button>
            </div>
          </div>
        </div>

        {activeTab === "certificates" && (
          <div className="bg-white w-full overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-5 text-red-500">Error loading data</div>
            ) : (
              <DataTable 
                columns={certificateColumns} 
                data={sortedCertificates} 
                header={true} 
              />
            )}
          </div>
        )}

        {activeTab === "businessPermits" && (
          <div className="bg-white w-full overflow-x-auto">
            {businessPermitsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : businessPermitsError ? (
              <div className="text-center py-5 text-red-500">Error loading data</div>
            ) : (
              <DataTable 
                columns={businessPermitColumns} 
                data={sortedBusinessPermits} 
                header={true} 
              />
            )}
          </div>
        )}

        {activeTab === "serviceCharges" && (
          <div className="bg-white w-full overflow-x-auto">
            {serviceChargesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : serviceChargesError ? (
              <div className="text-center py-5 text-red-500">Error loading data</div>
            ) : (
              <DataTable 
                columns={serviceChargeColumns} 
                data={filteredServiceCharges || []} 
                header={true} 
              />
            )}
          </div>
        )}
      </div>

      <div className="w-full sm:w-auto flex justify-end">
        <PaginationLayout 
          totalPages={activeTab === 'certificates' ? totalPagesCert : activeTab === 'businessPermits' ? totalPagesBP : 1}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          {activeTab === "certificates" && (
            <>Showing {(certCount === 0 ? 0 : (currentPage - 1) * pageSize + 1)}-{Math.min(currentPage * pageSize, certCount)} of {certCount} rows</>
          )}
          {activeTab === "businessPermits" && (
            <>Showing {(bpCount === 0 ? 0 : (currentPage - 1) * pageSize + 1)}-{Math.min(currentPage * pageSize, bpCount)} of {bpCount} rows</>
          )}
          {activeTab === "serviceCharges" && (
            <>Showing 1-{filteredServiceCharges?.length || 0} of {filteredServiceCharges?.length || 0} rows</>
          )}
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
          isNonResident={selectedCertificate.is_nonresident || false}
          showAddDetails={false}
        />
      )}

      {selectedBusinessPermit && (
        <TemplateMainPage
          key={selectedBusinessPermit.ibp_id + Date.now()}
          businessName={selectedBusinessPermit.business_name || ""}
          address={(selectedBusinessPermit as any)?.original_permit?.business_address || ""}
          purpose={selectedBusinessPermit.purpose as any}
          issuedDate={selectedBusinessPermit.dateIssued || new Date().toISOString()}
          showAddDetails={false}
        />
      )}

      <DialogLayout
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          // Clear viewing certificate when dialog is closed
          if (!open) {
            setViewingCertificate(null);
          }
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