// import { Label } from "@/components/ui/label";
// import { Link } from "react-router-dom";
// import { Search } from 'lucide-react';
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
// import { ChevronRight } from "lucide-react";

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

// // Format array data to display multiple items
// const formatArrayData = (data: string[] | string | null | undefined): string => {
//     if (!data) return "N/A";
//     if (Array.isArray(data)) {
//         return data.filter(item => item != null && item !== "").join(', ') || "N/A";
//     }
//     return String(data || "N/A");
// };

// export default function SummonRemarksMain(){  
//     const filter = [
//         { id: "All", name: "All" },
//         { id: "Ongoing", name: "Ongoing" },
//         { id: "Resolved", name: "Resolved" },
//         { id: "Escalated", name: "Escalated" },
//         { id: "Waiting for Schedule", name: "Waiting for Schedule" },
//     ];

//     const { data: fetchedData = [], isLoading } = useGetSummonCaseList();
//     const { showLoading, hideLoading } = useLoading();
    
//     const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
//     const [searchTerm, setSearchTerm] = useState("");

//     // Loading state management
//     useEffect(() => {
//         if (isLoading) {
//             showLoading();
//         } else {
//             hideLoading();
//         }
//     }, [isLoading, showLoading, hideLoading]);

//     // Filter data based on selected filter and search term
//     const filteredData = fetchedData.filter(item => {
//         const matchesFilter = selectedFilter === "All" || item.sc_mediation_status === selectedFilter;
        
//         if (searchTerm === "") return matchesFilter;
        
//         const searchTermLower = searchTerm.toLowerCase();
        
//         // Safe search across all fields
//         const matchesCode = String(item.sc_code || '').toLowerCase().includes(searchTermLower);
//         const matchesComplainant = String(item.complainant_names || '').toLowerCase().includes(searchTermLower);
//         const matchesIncidentType = String(item.incident_type || '').toLowerCase().includes(searchTermLower);
        
//         // Safe accused names search
//         let matchesAccused = false;
        
//         if (item.accused_names != null) {
//             if (Array.isArray(item.accused_names)) {
//                 matchesAccused = item.accused_names
//                     .map(name => String(name || ''))
//                     .some(name => name.toLowerCase().includes(searchTermLower));
//             } else {
//                 matchesAccused = String(item.accused_names).toLowerCase().includes(searchTermLower);
//             }
//         }
        
//         const matchesSearch = matchesCode || matchesComplainant || matchesAccused || 
//                             matchesIncidentType;
        
//         return matchesFilter && matchesSearch;
//     });

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
//           header: "Case No.",
//           cell: ({ row }) => (
//             <div className="flex items-center gap-2 justify-center">
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
//             <div className="flex items-center justify-center">
//                 <span className="text-sm line-clamp-2">
//                     {formatArrayData(row.original.complainant_names)}
//                 </span>
//             </div>
//           ),
//         },
//         {
//           accessorKey: "accused_names",
//           header: "Respondent/s",
//           cell: ({ row }) => (
//             <div className="flex items-center justify-center">
//                 <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium line-clamp-2">
//                     {formatArrayData(row.original.accused_names)}
//                 </span>
//             </div>
//           ),
//         },
//         {
//           accessorKey: "incident_type",
//           header: "Incident Type",
//           cell: ({ row }) => (
//             <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
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
//                 <Spinner size="lg" />
//                 <span className="ml-2 text-gray-600">Loading summon cases...</span>
//             </div>
//         );
//     }

//     return(
//          <div className="w-full h-full flex flex-col">
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

//             {/* Search and Filter - Fixed height */}
//             <div className="flex-shrink-0 mb-4">
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
//                     {/* Search */}
//                     <div className="relative w-full sm:w-auto sm:flex-1 max-w-2xl">
//                         <Search
//                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//                             size={17}
//                         />
//                         <Input 
//                             placeholder="Search..." 
//                             className="pl-10 w-full bg-white text-sm"
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                     </div>     

//                     {/* Filter */}
//                     <div className='flex flex-row items-center gap-4 w-full sm:w-auto'>
//                         <Label className="whitespace-nowrap">Filter: </Label>
//                         <SelectLayout 
//                             className="bg-white w-full sm:w-[200px]" 
//                             options={filter} 
//                             placeholder="Filter" 
//                             value={selectedFilter} 
//                             label="Status" 
//                             onChange={setSelectedFilter}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* DataTable Area - This will scroll independently */}
//             <div className="flex-1 overflow-y-auto">
//                 {filteredData.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-10">
//                         <p className="text-gray-500 text-lg">No summon cases found</p>
//                         <p className="text-sm text-gray-400 mt-2">
//                             {searchTerm ? `No results for "${searchTerm}"` : "Try changing your filters"}
//                         </p>
//                     </div>
//                 ) : (
//                     <div className="pb-6 bg-white">
//                         <DataTable columns={columns} data={filteredData}/>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Search } from 'lucide-react';
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
import { ChevronRight } from "lucide-react";

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
    const filter = [
        { id: "All", name: "All" },
        { id: "Ongoing", name: "Ongoing" },
        { id: "Resolved", name: "Resolved" },
        { id: "Escalated", name: "Escalated" },
        { id: "Waiting for Schedule", name: "Waiting for Schedule" },
    ];

    const { data: fetchedData = [], isLoading } = useGetSummonCaseList();
    const { showLoading, hideLoading } = useLoading();
    
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
    const [searchTerm, setSearchTerm] = useState("");

    // Loading state management
    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);

    // Filter data based on selected filter and search term
    const filteredData = fetchedData.filter(item => {
        const matchesFilter = selectedFilter === "All" || item.sc_mediation_status === selectedFilter;
        
        if (searchTerm === "") return matchesFilter;
        
        const searchTermLower = searchTerm.toLowerCase();
        
        // Safe search across all fields
        const matchesCode = String(item.sc_code || '').toLowerCase().includes(searchTermLower);
        const matchesComplainant = String(item.complainant_names || '').toLowerCase().includes(searchTermLower);
        const matchesIncidentType = String(item.incident_type || '').toLowerCase().includes(searchTermLower);
        
        // Safe accused names search
        let matchesAccused = false;
        
        if (item.accused_names != null) {
            if (Array.isArray(item.accused_names)) {
                matchesAccused = item.accused_names
                    .map(name => String(name || ''))
                    .some(name => name.toLowerCase().includes(searchTermLower));
            } else {
                matchesAccused = String(item.accused_names).toLowerCase().includes(searchTermLower);
            }
        }
        
        const matchesSearch = matchesCode || matchesComplainant || matchesAccused || 
                            matchesIncidentType;
        
        return matchesFilter && matchesSearch;
    });

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
          header: "Case No.",
          size: 150, // Fixed width for case number
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
          size: 250, // Wider space for complainants
          cell: ({ row }) => (
            <div className="min-w-[200px] justify-center items-center flex">
                {formatNamesAsPills(row.original.complainant_names, "bg-purple-100 text-purple-800")}
            </div>
          ),
        },
        {
          accessorKey: "accused_names",
          header: "Respondent/s",
          size: 250, // Wider space for respondents
          cell: ({ row }) => (
            <div className="min-w-[200px] justify-center items-center flex">
                {formatNamesAsPills(row.original.accused_names, "bg-blue-100 text-blue-800")}
            </div>
          ),
        },
        {
          accessorKey: "incident_type",
          header: "Incident Type",
          size: 180, // Fixed width for incident type
          cell: ({ row }) => (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {row.original.incident_type}
            </span>
          ),
        },
        {
            accessorKey: "",
            header: "Case Status",
            size: 150, // Fixed width for status
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
            size: 120, // Fixed width for action button
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
                <Spinner size="lg" />
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

            {/* Search and Filter - Fixed height */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
                    {/* Search */}
                    <div className="relative w-full sm:w-auto sm:flex-1 max-w-2xl">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                        />
                        <Input 
                            placeholder="Search..." 
                            className="pl-10 w-full bg-white text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>     

                    {/* Filter */}
                    <div className='flex flex-row items-center gap-4 w-full sm:w-auto'>
                        <Label className="whitespace-nowrap">Filter: </Label>
                        <SelectLayout 
                            className="bg-white w-full sm:w-[200px]" 
                            options={filter} 
                            placeholder="Filter" 
                            value={selectedFilter} 
                            label="Status" 
                            onChange={setSelectedFilter}
                        />
                    </div>
                </div>
            </div>

            {/* DataTable Area - This will scroll independently */}
            <div className="flex-1 overflow-y-auto">
                {filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <p className="text-gray-500 text-lg">No summon cases found</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {searchTerm ? `No results for "${searchTerm}"` : "Try changing your filters"}
                        </p>
                    </div>
                ) : (
                    <div className="pb-6 bg-white">
                        <DataTable columns={columns} data={filteredData}/>
                    </div>
                )}
            </div>
        </div>
    )
}