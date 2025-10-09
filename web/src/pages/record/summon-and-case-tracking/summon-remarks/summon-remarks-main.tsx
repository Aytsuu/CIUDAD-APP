// import { Link } from "react-router-dom";
// import { Search, ChevronRight, ArrowUpDown } from 'lucide-react';
// import { Input } from "@/components/ui/input";
// import { Spinner } from "@/components/ui/spinner";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { useState, useEffect } from "react";
// import { useGetSummonCaseList } from "../queries/summonFetchQueries";
// import type { SummonCaseList } from "../summon-types";
// import { useLoading } from "@/context/LoadingContext";
// import { DataTable } from "@/components/ui/table/data-table";
// import { ColumnDef} from "@tanstack/react-table";
// import { Button } from "@/components/ui/button/button";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
// import { useDebounce } from "@/hooks/use-debounce";

// // Status color mapping
// const getStatusColor = (status: string | null | undefined) => {
//     if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    
//     switch(status.toLowerCase()) {
//         case "ongoing":
//             return "bg-blue-100 text-blue-800 border-blue-200";
//         case "resolved":
//             return "bg-green-100 text-green-800 border-green-200";
//         case "escalated":
//             return "bg-red-100 text-red-800 border-red-200";
//         case "waiting for schedule":
//             return "bg-yellow-100 text-yellow-800 border-yellow-200";
//         default:
//             return "bg-gray-100 text-gray-800 border-gray-200";
//     }
// };

// // Resident badge component
// function ResidentBadge() {
//     return (
//         <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
//             Resident
//         </span>
//     );
// }

// // Format array data to display multiple items as individual pills
// const formatNamesAsPills = (data: string[] | string | null | undefined, pillColor: string) => {
//     if (!data) {
//         return (
//             <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
//                 N/A
//             </span>
//         );
//     }
    
//     const names = Array.isArray(data) ? data : [data];
//     const validNames = names.filter(name => name != null && name !== "");
    
//     if (validNames.length === 0) {
//         return (
//             <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
//                 N/A
//             </span>
//         );
//     }
    
//     return (
//         <div className="flex flex-wrap gap-1">
//             {validNames.map((name, index) => (
//                 <span
//                     key={index}
//                     className={`px-2 py-1 rounded-full text-xs font-medium ${pillColor} whitespace-nowrap`}
//                 >
//                     {name}
//                 </span>
//             ))}
//         </div>
//     );
// };

// export default function SummonRemarksMain(){  
//     const { showLoading, hideLoading } = useLoading();
    
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedFilter, setSelectedFilter] = useState("All");
//     const [pageSize, setPageSize] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const debouncedSearchQuery = useDebounce(searchQuery, 300);

//     const filterOptions = [
//         { id: "All", name: "All" },
//         { id: "Ongoing", name: "Ongoing" },
//         { id: "Resolved", name: "Resolved" },
//         { id: "Escalated", name: "Escalated" },
//         { id: "Waiting for Schedule", name: "Waiting for Schedule" },
//     ];

//     // Use the hook with pagination and filtering parameters
//     const { data: summonCaseData = { results: [], count: 0 }, isLoading } = useGetSummonCaseList(
//         currentPage, 
//         pageSize, 
//         debouncedSearchQuery, 
//         selectedFilter
//     );

//     const summonCases = summonCaseData.results || [];
//     const totalItems = summonCaseData.count || 0;
//     const totalPages = Math.ceil(totalItems / pageSize);

//     // Loading state management
//     useEffect(() => {
//         if (isLoading) {
//             showLoading();
//         } else {
//             hideLoading();
//         }
//     }, [isLoading, showLoading, hideLoading]);

//     // Reset to first page when filters change
//     useEffect(() => {
//         setCurrentPage(1);
//     }, [debouncedSearchQuery, selectedFilter, pageSize]);

//     const hasResidentComplainant = (item: SummonCaseList) => {
//         if (!item.complainant_rp_ids) return false;
        
//         if (Array.isArray(item.complainant_rp_ids)) {
//             return item.complainant_rp_ids.some(rpId => rpId != null);
//         }
        
//         return item.complainant_rp_ids != null;
//     };

//     const columns: ColumnDef<SummonCaseList>[] = [
//         {
//           accessorKey: "sc_code",
//           header: ({ column }) => (
//             <div
//               className="flex w-full justify-center items-center gap-2 cursor-pointer"
//               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//             >
//               Case No.
//               <ArrowUpDown size={14} />
//             </div>
//           ),
//           cell: ({ row }) => (
//             <div className="flex justify-center items-center gap-2">
//                 <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
//                     {row.original.sc_code}
//                 </span>
//                 {hasResidentComplainant(row.original) && <ResidentBadge />}
//             </div>
//           ),
//         },
//         {
//           accessorKey: "complainant_names",
//           header: "Complainant/s",
//           cell: ({ row }) => (
//             <div className="min-w-[200px] justify-center items-center flex">
//                 {formatNamesAsPills(row.original.complainant_names, "bg-purple-100 text-purple-800")}
//             </div>
//           ),
//         },
//         {
//           accessorKey: "accused_names",
//           header: "Respondent/s",
//           cell: ({ row }) => (
//             <div className="min-w-[200px] justify-center items-center flex">
//                 {formatNamesAsPills(row.original.accused_names, "bg-blue-100 text-blue-800")}
//             </div>
//           ),
//         },
//         {
//           accessorKey: "incident_type",
//           header: "Incident Type",
//           cell: ({ row }) => (
//             <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
//               {row.original.incident_type}
//             </span>
//           ),
//         },
//         {
//             accessorKey: "",
//             header: "Case Status",
//             cell: ({ row }) => {
//                 const status = row.original.sc_conciliation_status || row.original.sc_mediation_status;
//                 const statusColor = getStatusColor(status);
                
//                 return (
//                     <div className="flex justify-center">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
//                             {status || "No Status"}
//                         </span>
//                     </div>
//                 );
//             },
//         },
//         {
//             accessorKey: "",
//             header: " ",
//             cell: ({row}) => {
//                 const item = row.original;
//                 return (
//                     <div className="flex items-center justify-center">
//                         <Link 
//                             to='/view-remarks-details'
//                             state={{ 
//                                 sc_id: item.sc_id, 
//                                 incident_type: item.incident_type,
//                                 hasResident: hasResidentComplainant(item),
//                                 comp_names: Array.isArray(item.complainant_names) 
//                                     ? item.complainant_names 
//                                     : [item.complainant_names || "N/A"],
//                                 acc_names: Array.isArray(item.accused_names) 
//                                     ? item.accused_names 
//                                     : [item.accused_names || "N/A"],
//                                 complainant_addresses: Array.isArray(item.complainant_addresses) 
//                                     ? item.complainant_addresses 
//                                     : [item.complainant_addresses || "N/A"],
//                                 accused_addresses: Array.isArray(item.accused_addresses) 
//                                     ? item.accused_addresses 
//                                     : [item.accused_addresses || "N/A"],
//                                 complainant_rp_ids: item.complainant_rp_ids,
//                                 sc_code: item.sc_code,
//                                 sc_mediation_status: item.sc_mediation_status
//                             }}
//                         >
//                             <Button className="flex items-center gap-2 text-primary bg-white shadow-none hover:bg-white group">
//                                 <span className="text-sm font-medium group-hover:text-primary">View</span>
//                                 <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary transition-colors">
//                                     <ChevronRight className="h-3 w-3 text-primary group-hover:text-white transition-colors" />
//                                 </div>
//                             </Button>
//                         </Link>
//                     </div>
//                 )
//             }
//         }
//     ];

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center py-12">
//                 <Spinner size="md" />
//                 <span className="ml-2 text-gray-600">Loading summon cases...</span>
//             </div>
//         );
//     }

//     return(
//         <div className="w-full h-full flex flex-col">
//             {/* Header Section - Fixed height */}
//             <div className="flex-shrink-0">
//                 <div className="flex flex-col gap-3 mb-3">
//                     <div className="flex flex-row gap-4">
//                         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//                             Summon Remarks
//                         </h1>
//                     </div>
//                     <p className="text-xs sm:text-sm text-darkGray">
//                         Record remarks, attach files, and close hearing schedules.
//                     </p>
//                 </div>
//                 <hr className="border-gray mb-7 sm:mb-8" />
//             </div>

//             {/* Main Content Area */}
//             <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden">
//                 {/* Header with Count, Search, and Filters */}
//                 <div className="flex flex-col gap-4 p-6">
//                     {/* Filters Row */}
//                     <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
//                         {/* Left Group - Search and Status Filter */}
//                         <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-3xl">
//                             {/* Search Input */}
//                             <div className="relative flex-1 max-w-[500px]">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
//                                 <Input
//                                     placeholder="Search cases..."
//                                     className="pl-10 bg-white w-full"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                 />
//                             </div>

//                             {/* Status Filter */}
//                             <div className="w-full md:w-[250px]">
//                                 <SelectLayout
//                                     className="w-full bg-white"
//                                     placeholder="Filter by Status"
//                                     options={filterOptions}
//                                     value={selectedFilter}
//                                     label=""
//                                     onChange={(value) => setSelectedFilter(value)}
//                                 />
//                             </div>
//                         </div>

//                         {/* Right Group - Page Size Control */}
//                         <div className="flex items-center gap-2 w-full md:w-auto justify-end">
//                             <span className="text-sm whitespace-nowrap">Show</span>
//                             <Select 
//                                 value={pageSize.toString()} 
//                                 onValueChange={(value) => {
//                                     setPageSize(Number.parseInt(value))
//                                     setCurrentPage(1)
//                                 }}
//                             >
//                                 <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="5">5</SelectItem>
//                                     <SelectItem value="10">10</SelectItem>
//                                     <SelectItem value="25">25</SelectItem>
//                                     <SelectItem value="50">50</SelectItem>
//                                     <SelectItem value="100">100</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                             <span className="text-sm whitespace-nowrap">entries</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* DataTable Container */}
//                 <div className="p-6 pt-0">
//                     {totalItems === 0 ? (
//                         <div className="text-center py-12">
//                             <p className="text-gray-500">
//                                 {searchQuery || selectedFilter !== "All" 
//                                     ? "No summon cases found matching your criteria." 
//                                     : "No summon cases found."
//                                 }
//                             </p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="space-y-3">
//                                 <DataTable columns={columns} data={summonCases}/>
//                             </div>
                            
//                             {/* Pagination Footer */}
//                             <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4 mt-6">
//                                 <p className="text-gray-600">
//                                     Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
//                                     {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
//                                 </p>
//                                 {totalItems > 0 && (
//                                     <PaginationLayout 
//                                         currentPage={currentPage} 
//                                         totalPages={totalPages} 
//                                         onPageChange={setCurrentPage} 
//                                     />
//                                 )}
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

import { Link } from "react-router-dom";
import { Search, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState, useEffect } from "react";
import { useGetSummonCaseList } from "../queries/summonFetchQueries";
import type { SummonCaseList } from "../summon-types";
import { useLoading } from "@/context/LoadingContext";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef} from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { useDebounce } from "@/hooks/use-debounce";

// Status color mapping
const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    
    switch(status.toLowerCase()) {
        case "ongoing":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "resolved":
            return "bg-green-100 text-green-800 border-green-200";
        case "escalated":
            return "bg-red-100 text-red-800 border-red-200";
        case "waiting for schedule":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

// Resident badge component
function ResidentBadge() {
    return (
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
            Resident
        </span>
    );
}

// Format array data to display multiple items as individual pills
const formatNamesAsPills = (data: string[] | string | null | undefined, pillColor: string) => {
    if (!data) {
        return (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                N/A
            </span>
        );
    }
    
    const names = Array.isArray(data) ? data : [data];
    const validNames = names.filter(name => name != null && name !== "");
    
    if (validNames.length === 0) {
        return (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                N/A
            </span>
        );
    }
    
    return (
        <div className="flex flex-wrap gap-1">
            {validNames.map((name, index) => (
                <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${pillColor} whitespace-nowrap`}
                >
                    {name}
                </span>
            ))}
        </div>
    );
};

export default function SummonRemarksMain(){  
    const { showLoading, hideLoading } = useLoading();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const filterOptions = [
        { id: "All", name: "All" },
        { id: "Ongoing", name: "Ongoing" },
        { id: "Resolved", name: "Resolved" },
        { id: "Escalated", name: "Escalated" },
        { id: "Waiting for Schedule", name: "Waiting for Schedule" },
    ];

    // Use the hook with pagination and filtering parameters
    const { data: summonCaseData = { results: [], count: 0 }, isLoading } = useGetSummonCaseList(
        currentPage, 
        pageSize, 
        debouncedSearchQuery, 
        selectedFilter
    );

    const summonCases = summonCaseData.results || [];
    const totalItems = summonCaseData.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Loading state management
    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, selectedFilter, pageSize]);

    const hasResidentComplainant = (item: SummonCaseList) => {
        if (!item.complainant_rp_ids) return false;
        
        if (Array.isArray(item.complainant_rp_ids)) {
            return item.complainant_rp_ids.some(rpId => rpId != null);
        }
        
        return item.complainant_rp_ids != null;
    };

    const columns: ColumnDef<SummonCaseList>[] = [
        {
          accessorKey: "sc_code",
          header: ({ column }) => (
            <div
              className="flex w-full justify-center items-center gap-2 cursor-pointer"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Case No.
              <ArrowUpDown size={14} />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex justify-center items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                    {row.original.sc_code}
                </span>
                {hasResidentComplainant(row.original) && <ResidentBadge />}
            </div>
          ),
        },
        {
          accessorKey: "complainant_names",
          header: "Complainant/s",
          cell: ({ row }) => (
            <div className="min-w-[200px] justify-center items-center flex">
                {formatNamesAsPills(row.original.complainant_names, "bg-purple-100 text-purple-800")}
            </div>
          ),
        },
        {
          accessorKey: "accused_names",
          header: "Respondent/s",
          cell: ({ row }) => (
            <div className="min-w-[200px] justify-center items-center flex">
                {formatNamesAsPills(row.original.accused_names, "bg-blue-100 text-blue-800")}
            </div>
          ),
        },
        {
          accessorKey: "incident_type",
          header: "Incident Type",
          cell: ({ row }) => (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {row.original.incident_type}
            </span>
          ),
        },
        {
            accessorKey: "",
            header: "Case Status",
            cell: ({ row }) => {
                const status = row.original.sc_conciliation_status || row.original.sc_mediation_status;
                const statusColor = getStatusColor(status);
                
                return (
                    <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                            {status || "No Status"}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "",
            header: " ",
            cell: ({row}) => {
                const item = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <Link 
                            to='/view-remarks-details'
                            state={{ 
                                sc_id: item.sc_id, 
                                incident_type: item.incident_type,
                                hasResident: hasResidentComplainant(item),
                                comp_names: Array.isArray(item.complainant_names) 
                                    ? item.complainant_names 
                                    : [item.complainant_names || "N/A"],
                                acc_names: Array.isArray(item.accused_names) 
                                    ? item.accused_names 
                                    : [item.accused_names || "N/A"],
                                complainant_addresses: Array.isArray(item.complainant_addresses) 
                                    ? item.complainant_addresses 
                                    : [item.complainant_addresses || "N/A"],
                                accused_addresses: Array.isArray(item.accused_addresses) 
                                    ? item.accused_addresses 
                                    : [item.accused_addresses || "N/A"],
                                complainant_rp_ids: item.complainant_rp_ids,
                                sc_code: item.sc_code,
                                sc_mediation_status: item.sc_mediation_status
                            }}
                        >
                            <Button className="flex items-center gap-2 text-primary bg-white shadow-none hover:bg-white group">
                                <span className="text-sm font-medium group-hover:text-primary">View</span>
                                <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary transition-colors">
                                    <ChevronRight className="h-3 w-3 text-primary group-hover:text-white transition-colors" />
                                </div>
                            </Button>
                        </Link>
                    </div>
                )
            }
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
                <span className="ml-2 text-gray-600">Loading summon cases...</span>
            </div>
        );
    }

    return(
        <div className="w-full h-full flex flex-col">
            {/* Header Section - Fixed height */}
            <div className="flex-shrink-0">
                <div className="flex flex-col gap-3 mb-3">
                    <div className="flex flex-row gap-4">
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                            Summon Remarks
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-darkGray">
                        Record remarks, attach files, and close hearing schedules.
                    </p>
                </div>
                <hr className="border-gray mb-7 sm:mb-8" />
            </div>

            {/* Main Content Area - REMOVED flex-1 and overflow-hidden */}
            <div className="bg-white rounded-lg shadow-sm">
                {/* Header with Count, Search, and Filters */}
                <div className="flex flex-col gap-4 p-6">
                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
                        {/* Left Group - Search and Status Filter */}
                        <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-3xl">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-[500px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                                <Input
                                    placeholder="Search cases..."
                                    className="pl-10 bg-white w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="w-full md:w-[250px]">
                                <SelectLayout
                                    className="w-full bg-white"
                                    placeholder="All Status"
                                    options={filterOptions}
                                    value={selectedFilter}
                                    label=""
                                    onChange={(value) => setSelectedFilter(value)}
                                />
                            </div>
                        </div>

                        {/* Right Group - Page Size Control */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <span className="text-sm whitespace-nowrap">Show</span>
                            <Select 
                                value={pageSize.toString()} 
                                onValueChange={(value) => {
                                    setPageSize(Number.parseInt(value))
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm whitespace-nowrap">entries</span>
                        </div>
                    </div>
                </div>

                {/* DataTable Container */}
                <div className="p-6 pt-0">
                    {totalItems === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                {searchQuery || selectedFilter !== "All" 
                                    ? "No summon cases found matching your criteria." 
                                    : "No summon cases found."
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <DataTable columns={columns} data={summonCases}/>
                            </div>
                            
                            {/* Pagination Footer */}
                            <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4 mt-6">
                                <p className="text-gray-600">
                                    Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
                                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                                </p>
                                {totalItems > 0 && (
                                    <PaginationLayout 
                                        currentPage={currentPage} 
                                        totalPages={totalPages} 
                                        onPageChange={setCurrentPage} 
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}