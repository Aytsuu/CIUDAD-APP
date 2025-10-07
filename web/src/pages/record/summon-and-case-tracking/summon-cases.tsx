// import CardLayout from "@/components/ui/card/card-layout";
// import { Label } from "@/components/ui/label";
// import { Link } from "react-router-dom";
// import { Search } from 'lucide-react';
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { useState } from "react";
// import { useGetSummonCaseList } from "./queries/summonFetchQueries";
// import type { SummonCaseList } from "./summon-types";


// const styles = {
//     cardContent: "font-semibold text-[14px]",
//     cardInfoRow: "flex flex-grid items-center gap-5",
//     cardInfo: "font-sm text-[14px]",
//     statusOngoing: "font-bold text-[#5B72CF]",
//     statusResolved: "font-bold text-[#17AD00]",
//     statusEscalated: "font-bold text-[#FF0000]",
//     statusWaiting: "font-bold text-[#EAB308]",
//     decisionDate: "text-sm text-gray-500 mt-2"
// };

// function getStatusColor(status: string) {
//     switch(status) {
//         case "Ongoing":
//             return styles.statusOngoing;
//         case "Resolved":
//             return styles.statusResolved;
//         case "Escalated":
//             return styles.statusEscalated;
//         case "Waiting for Schedule":
//             return styles.statusWaiting;
//         default:
//             return "";
//     }
// }

// function SummonCases(){  
//     const filter = [
//         { id: "All", name: "All" },
//         { id: "Ongoing", name: "Ongoing" },
//         { id: "Resolved", name: "Resolved" },
//         { id: "Escalated", name: "Escalated" },
//         { id: "Waiting for Schedule", name: "Waiting for Schedule" },
//     ];

//     const { data: fetchedData = [], isLoading } = useGetSummonCaseList();
    
//     const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
//     const [searchTerm, setSearchTerm] = useState("");

//     // Filter data based on selected filter and search term
//     const filteredData = fetchedData.filter(item => {
//         const matchesFilter = selectedFilter === "All" || item.sc_case_status === selectedFilter;
        
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

//     return(
//          <div className="w-full h-full flex flex-col">
//             {/* Header Section - Fixed height */}
//             <div className="flex-shrink-0">
//                 <div className="flex flex-col gap-3 mb-3">
//                     <div className="flex flex-row gap-4">
//                         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//                         Summon Cases
//                         </h1>
//                     </div>
//                     <p className="text-xs sm:text-sm text-darkGray">
//                         View, manage, and track the status of summon cases.
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

//             {/* Cards Area - This will scroll independently */}
//             <div className="flex-1 overflow-y-auto">
//                     {isLoading ? (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {[...Array(4)].map((_, index) => (
//                                 <div key={index} className="p-4 border rounded-lg">
//                                     <Skeleton className="h-8 w-1/3 mb-4" />
//                                     <div className="space-y-3">
//                                         <Skeleton className="h-4 w-full" />
//                                         <Skeleton className="h-4 w-2/3" />
//                                         <Skeleton className="h-4 w-3/4" />
//                                         <Skeleton className="h-4 w-1/2" />
//                                     </div>
//                                     <Skeleton className="h-16 w-full mt-4" />
//                                 </div>
//                             ))}
//                         </div>
//                     ) : filteredData.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center py-10">
//                             <p className="text-gray-500 text-lg">No summons or cases found</p>
//                             <p className="text-sm text-gray-400 mt-2">
//                                 {searchTerm ? `No results for "${searchTerm}"` : "Try changing your filters"}
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6"> 
//                             {filteredData.map((item: SummonCaseList) => (
//                                 <Link 
//                                     key={item.sc_id}
//                                     to='/view-case'  
//                                     state={{ sc_id: item.sc_id, incident_type: item.incident_type,
//                                         comp_names: Array.isArray(item.complainant_names) 
//                                         ? item.complainant_names 
//                                         : [item.complainant_names || "N/A"],
//                                         acc_names: Array.isArray(item.accused_names) 
//                                         ? item.accused_names 
//                                         : [item.accused_names || "N/A"],
//                                         complainant_addresses: Array.isArray(item.complainant_addresses) 
//                                         ? item.complainant_addresses 
//                                         : [item.complainant_addresses || "N/A"],
//                                         accused_addresses: Array.isArray(item.accused_addresses) 
//                                         ? item.accused_addresses 
//                                         : [item.accused_addresses || "N/A"]
//                                     }} 
//                                     className="hover:shadow-lg transition-shadow"
//                                 >
//                                     <CardLayout
//                                         title={
//                                             <div className="flex flex-row">
//                                                 <div className="flex justify-between items-center w-full">
//                                                     <p className="text-primary flex items-center font-semibold text-xl mb-2">
//                                                         Case No. {item.sc_code}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         }
//                                         content={
//                                             <div className="flex flex-col gap-2">
//                                                 <div className={styles.cardInfoRow}>
//                                                     <p className={styles.cardContent}>Complainant: </p>
//                                                      <p className={styles.cardInfo}>
//                                                         {Array.isArray(item.complainant_names) 
//                                                         ? item.complainant_names.join(', ') 
//                                                         : item.complainant_names}
//                                                     </p>
//                                                 </div>
                                                
//                                                 <div className={styles.cardInfoRow}>
//                                                     <p className={styles.cardContent}>Accused: </p>
//                                                     <p className={styles.cardInfo}>
//                                                         {Array.isArray(item.accused_names) 
//                                                         ? item.accused_names.join(', ') 
//                                                         : item.accused_names}
//                                                     </p>
//                                                 </div>

//                                                 <div className={styles.cardInfoRow}>
//                                                     <p className={styles.cardContent}>Incident Type: </p>
//                                                     <p className={styles.cardInfo}>{item.incident_type}</p>
//                                                 </div>

//                                                 <div className={styles.cardInfoRow}>
//                                                     <p className={styles.cardContent}>Status: </p>
//                                                     <p className={`${styles.cardInfo} ${getStatusColor(item.sc_case_status)}`}>
//                                                         {item.sc_case_status || "Unknown"}
//                                                     </p>
//                                                 </div>

//                                             </div>
//                                         }
//                                     />
//                                 </Link>  
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//     )
// }

// export default SummonCases;


import CardLayout from "@/components/ui/card/card-layout";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState } from "react";
import { useGetSummonCaseList } from "./queries/summonFetchQueries";
import type { SummonCaseList } from "./summon-types";


const styles = {
    cardContent: "font-semibold text-[14px]",
    cardInfoRow: "flex flex-grid items-center gap-5",
    cardInfo: "font-sm text-[14px]",
    statusOngoing: "font-bold text-[#5B72CF]",
    statusResolved: "font-bold text-[#17AD00]",
    statusEscalated: "font-bold text-[#FF0000]",
    statusWaiting: "font-bold text-[#EAB308]",
    decisionDate: "text-sm text-gray-500 mt-2"
};

function getStatusColor(status: string) {
    switch(status) {
        case "Ongoing":
            return styles.statusOngoing;
        case "Resolved":
            return styles.statusResolved;
        case "Escalated":
            return styles.statusEscalated;
        case "Waiting for Schedule":
            return styles.statusWaiting;
        default:
            return "";
    }
}

// Resident badge component
function ResidentBadge() {
    return (
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
            Resident
        </span>
    );
}

function SummonCases(){  
    const filter = [
        { id: "All", name: "All" },
        { id: "Ongoing", name: "Ongoing" },
        { id: "Resolved", name: "Resolved" },
        { id: "Escalated", name: "Escalated" },
        { id: "Waiting for Schedule", name: "Waiting for Schedule" },
    ];

    const { data: fetchedData = [], isLoading } = useGetSummonCaseList();
    
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter data based on selected filter and search term
    const filteredData = fetchedData.filter(item => {
        const matchesFilter = selectedFilter === "All" || item.sc_case_status === selectedFilter;
        
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

    console.log('ids', fetchedData.map(item => item.complainant_rp_ids));

    return(
         <div className="w-full h-full flex flex-col">
            {/* Header Section - Fixed height */}
            <div className="flex-shrink-0">
                <div className="flex flex-col gap-3 mb-3">
                    <div className="flex flex-row gap-4">
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                        Summon Cases
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-darkGray">
                        View, manage, and track the status of summon cases.
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

            {/* Cards Area - This will scroll independently */}
            <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <Skeleton className="h-8 w-1/3 mb-4" />
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <Skeleton className="h-16 w-full mt-4" />
                                </div>
                            ))}
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <p className="text-gray-500 text-lg">No summons or cases found</p>
                            <p className="text-sm text-gray-400 mt-2">
                                {searchTerm ? `No results for "${searchTerm}"` : "Try changing your filters"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6"> 
                            {filteredData.map((item: SummonCaseList) => (
                                <Link 
                                    key={item.sc_id}
                                    to='/view-case'  
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
                                        complainant_rp_ids: item.complainant_rp_ids // Pass rp_ids to details page
                                    }} 
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardLayout
                                        title={
                                            <div className="flex flex-row">
                                                <div className="flex justify-between items-center w-full">
                                                    <p className="text-primary flex items-center font-semibold text-xl mb-2">
                                                        Case No. {item.sc_code}
                                                        {/* Show resident badge if any complainant is a resident */}
                                                        {hasResidentComplainant(item) && <ResidentBadge />}
                                                    </p>
                                                </div>
                                            </div>
                                        }
                                        content={
                                            <div className="flex flex-col gap-2">
                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Complainant: </p>
                                                    <div className="flex items-center">
                                                        <p className={styles.cardInfo}>
                                                            {Array.isArray(item.complainant_names) 
                                                            ? item.complainant_names.join(', ') 
                                                            : item.complainant_names}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Accused: </p>
                                                    <p className={styles.cardInfo}>
                                                        {Array.isArray(item.accused_names) 
                                                        ? item.accused_names.join(', ') 
                                                        : item.accused_names}
                                                    </p>
                                                </div>

                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Incident Type: </p>
                                                    <p className={styles.cardInfo}>{item.incident_type}</p>
                                                </div>

                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Status: </p>
                                                    <p className={`${styles.cardInfo} ${getStatusColor(item.sc_case_status)}`}>
                                                        {item.sc_case_status || "Unknown"}
                                                    </p>
                                                </div>

                                            </div>
                                        }
                                    />
                                </Link>  
                            ))}
                        </div>
                    )}
                </div>
            </div>
    )
}

export default SummonCases;