// import CardLayout from "@/components/ui/card/card-layout";
// import { Label } from "@/components/ui/label";
// import { Link } from "react-router-dom";
// import { Search } from 'lucide-react';
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { useState } from "react";
// import { useGetServiceChargeRequest, type ServiceChargeRequest } from "./queries/summonFetchQueries";
// import { formatTimestamp } from "@/helpers/timestampformatter";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import SummonCalendar from "./summonCalendar";

// const styles = {
//     cardContent: "font-semibold text-[14px]",
//     cardInfoRow: "flex flex-grid items-center gap-5",
//     cardInfo: "font-sm text-[14px]",
//     statusOngoing: "text-[#5B72CF]",
//     statusResolved: "text-[#17AD00]",
//     statusEscalated: "text-[#FF0000]",
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
//         default:
//             return "";
//     }
// }

// function SummonTrackingMain(){  
//     const filter = [
//         { id: "All", name: "All" },
//         { id: "Ongoing", name: "Ongoing" },
//         { id: "Resolved", name: "Resolved" },
//         { id: "Escalated", name: "Escalated" },
//     ];

//     const { data: fetchedData = [], isLoading } = useGetServiceChargeRequest();
//     const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
//     const [activeTab, setActiveTab] = useState("list"); // State for active tab

//     // Filter data based on selected filter
//     const filteredData = selectedFilter === "All" 
//         ? fetchedData 
//         : fetchedData.filter(item => item.status === selectedFilter);

//     return(
//         <div className="w-full h-full overflow-y-auto">
//             <div>
//                 {/* Header */}
//                 <div className="flex flex-col gap-3 mb-3">
//                     <div className='flex flex-row gap-4'>
//                         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//                             Summon & Case Tracker
//                         </h1>
//                     </div>
//                     <p className="text-xs sm:text-sm text-darkGray">
//                         Manage summons, schedule hearings, and generate summon and file action documents.
//                     </p>
//                 </div>
//                 <hr className="border-gray mb-7 sm:mb-8" /> 

//                 {/* Tabs */}
//                 <Tabs defaultValue="list" className="w-full">
//                     <TabsList className="grid w-full grid-cols-2 bg-gray-100">
//                         <TabsTrigger value="list" onClick={() => setActiveTab("list")}>
//                             List of Summon Cases
//                         </TabsTrigger>
//                         <TabsTrigger value="calendar" onClick={() => setActiveTab("calendar")}>
//                             Calendar
//                         </TabsTrigger>
//                     </TabsList>

//                     {/* List Tab Content */}
//                     <TabsContent value="list">
//                         {/* Search and Filter*/}
//                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full mt-4">
//                             {/* Search */}
//                             <div className="relative w-full sm:w-auto sm:flex-1 max-w-2xl">
//                                 <Search
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//                                     size={17}
//                                 />
//                                 <Input 
//                                     placeholder="Search..." 
//                                     className="pl-10 w-full bg-white text-sm" 
//                                 />
//                             </div>     

//                             {/* Filter */}
//                             <div className='flex flex-row items-center gap-4 w-full sm:w-auto'>
//                                 <Label className="whitespace-nowrap">Filter: </Label>
//                                 <SelectLayout 
//                                     className="bg-white w-full sm:w-[200px]" 
//                                     options={filter} 
//                                     placeholder="Filter" 
//                                     value={selectedFilter} 
//                                     label="Status" 
//                                     onChange={setSelectedFilter}
//                                 />
//                             </div>
//                         </div>

//                         {isLoading ? (
//                             <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
//                                 {[...Array(4)].map((_, index) => (
//                                     <div key={index} className="p-4 border rounded-lg">
//                                         <Skeleton className="h-8 w-1/3 mb-4" />
//                                         <div className="space-y-3">
//                                             <Skeleton className="h-4 w-full" />
//                                             <Skeleton className="h-4 w-2/3" />
//                                             <Skeleton className="h-4 w-3/4" />
//                                             <Skeleton className="h-4 w-1/2" />
//                                         </div>
//                                         <Skeleton className="h-16 w-full mt-4" />
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : filteredData.length === 0 ? (
//                             <div className="flex flex-col items-center justify-center mt-10 h-[calc(100vh-300px)]">
//                                 <p className="text-gray-500 text-lg">No summons or cases found</p>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4 pb-6"> 
//                                 {filteredData.map((item: ServiceChargeRequest) => (
//                                     <Link 
//                                         key={item.sr_id}
//                                         to='/summon-and-case-view'  
//                                         state={{ sr_id: item.sr_id }} 
//                                         className="hover:shadow-lg transition-shadow"
//                                     >
//                                         <CardLayout
//                                             title={
//                                                 <div className="flex flex-row">
//                                                     <div className="flex justify-between items-center w-full">
//                                                         <p className="text-primary flex items-center font-semibold text-xl mb-2">
//                                                             No. {item.sr_code}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             }
//                                             content={
//                                                 <div className="flex flex-col gap-2">
//                                                     <div className={styles.cardInfoRow}>
//                                                         <p className={styles.cardContent}>Complainant: </p>
//                                                         <p className={styles.cardInfo}>{item.complainant_name}</p>
//                                                     </div>
                                                    
//                                                     <div className={styles.cardInfoRow}>
//                                                         <p className={styles.cardContent}>Accused: </p>
//                                                         <p className={styles.cardInfo}>
//                                                             {Array.isArray(item.accused_names) 
//                                                             ? item.accused_names.join(', ') 
//                                                             : item.accused_names}
//                                                         </p>
//                                                     </div>

//                                                     <div className={styles.cardInfoRow}>
//                                                         <p className={styles.cardContent}>Incident Type: </p>
//                                                         <p className={styles.cardInfo}>{item.incident_type}</p>
//                                                     </div>

//                                                     <div className={styles.cardInfoRow}>
//                                                         <p className={styles.cardContent}>Status: </p>
//                                                         <p className={`${styles.cardInfo} ${getStatusColor(item.status)}`}>
//                                                             {item.status || "Unknown"}
//                                                         </p>
//                                                     </div>

//                                                     {(item.status === "Resolved" || item.status === "Escalated") && item.decision_date && (
//                                                         <div className={styles.cardInfoRow}>
//                                                             <p className={styles.cardContent}>Decision Date: </p>
//                                                             <p className={styles.cardInfo}>
//                                                                 {formatTimestamp(item.decision_date)}
//                                                             </p>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             }
//                                             description={
//                                                 <div className="mb-5">
//                                                     <p>{item.allegation}</p>
//                                                 </div>
//                                             }  
//                                         />
//                                     </Link>  
//                                 ))}
//                             </div>
//                         )}
//                     </TabsContent>

//                     {/* Calendar Tab Content */}
//                     <TabsContent value="calendar">
//                             <SummonCalendar/>
//                     </TabsContent>
//                 </Tabs>
//             </div>
//         </div>
//     )
// }

// export default SummonTrackingMain;

import CardLayout from "@/components/ui/card/card-layout";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState } from "react";
import { useGetServiceChargeRequest, type ServiceChargeRequest } from "./queries/summonFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";

// Mock data for development
const mockServiceChargeData: ServiceChargeRequest[] = [
  {
    sr_id: '1',
    sr_code: "SC-2024-001",
    complainant_name: "Maria Santos",
    accused_names: ["Juan Dela Cruz", "Pedro Reyes"],
    incident_type: "Workplace Harassment",
    status: "Ongoing",
    allegation: "Verbal abuse and inappropriate behavior towards colleagues during work hours",
    decision_date: ''
  },
  {
    sr_id: '2',
    sr_code: "SC-2024-002",
    complainant_name: "Robert Lim",
    accused_names: ["Anna Torres"],
    incident_type: "Theft",
    status: "Resolved",
    allegation: "Unauthorized taking of company property",
    decision_date: "2024-01-15T08:30:00Z"
  },
  {
    sr_id: '3',
    sr_code: "SC-2024-003",
    complainant_name: "Company Management",
    accused_names: ["Michael Chen", "Sarah Gomez", "David Kim"],
    incident_type: "Insubordination",
    status: "Escalated",
    allegation: "Repeated refusal to follow direct orders from supervisors",
    decision_date: "2024-02-20T14:45:00Z"
  },
  {
    sr_id: '4',
    sr_code: "SC-2024-004",
    complainant_name: "Liza Mendoza",
    accused_names: ["Carlos Ramirez"],
    incident_type: "Attendance Violation",
    status: "Ongoing",
    allegation: "Chronic tardiness and unauthorized absences affecting team productivity",
    decision_date: ''
  },
  {
    sr_id: '5',
    sr_code: "SC-2024-005",
    complainant_name: "Johnny Sy",
    accused_names: ["Melissa Tan", "Andrew Ong"],
    incident_type: "Data Breach",
    status: "Resolved",
    allegation: "Unauthorized access and sharing of confidential company information",
    decision_date: "2024-03-10T10:15:00Z"
  },
  {
    sr_id: '6',
    sr_code: "SC-2024-006",
    complainant_name: "Security Department",
    accused_names: ["Anthony Lim"],
    incident_type: "Security Violation",
    status: "Ongoing",
    allegation: "Bypassing security protocols and allowing unauthorized personnel entry",
    decision_date: ''
  }
];

// Mock hook implementation for development
const useMockServiceChargeRequest = () => {
  const [data, setData] = useState<ServiceChargeRequest[]>(mockServiceChargeData);
  const isLoading = false;
  
  return { data, isLoading };
};

const styles = {
    cardContent: "font-semibold text-[14px]",
    cardInfoRow: "flex flex-grid items-center gap-5",
    cardInfo: "font-sm text-[14px]",
    statusOngoing: "text-[#5B72CF]",
    statusResolved: "text-[#17AD00]",
    statusEscalated: "text-[#FF0000]",
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
        default:
            return "";
    }
}

function SummonCases(){  
    const filter = [
        { id: "All", name: "All" },
        { id: "Ongoing", name: "Ongoing" },
        { id: "Resolved", name: "Resolved" },
        { id: "Escalated", name: "Escalated" },
    ];

    // Use mock data instead of the actual hook for development
    // const { data: fetchedData = [], isLoading } = useGetServiceChargeRequest();
    const { data: fetchedData = [], isLoading } = useMockServiceChargeRequest();
    
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter data based on selected filter and search term
    const filteredData = fetchedData.filter(item => {
        const matchesFilter = selectedFilter === "All" || item.status === selectedFilter;
        
        if (searchTerm === "") return matchesFilter;
        
        const searchTermLower = searchTerm.toLowerCase();
        
        // Safe search across all fields
        const matchesCode = String(item.sr_code || '').toLowerCase().includes(searchTermLower);
        const matchesComplainant = String(item.complainant_name || '').toLowerCase().includes(searchTermLower);
        const matchesIncidentType = String(item.incident_type || '').toLowerCase().includes(searchTermLower);
        const matchesAllegation = String(item.allegation || '').toLowerCase().includes(searchTermLower);
        
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
                            matchesIncidentType || matchesAllegation;
        
        return matchesFilter && matchesSearch;
    });

    return(
        <div className="w-full">
            {/* Search and Filter */}
            <div>
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

            {/* Cards Area - This will be scrolled by the parent */}
            <div className="mt-4">
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
                        {filteredData.map((item: ServiceChargeRequest) => (
                            <Link 
                                key={item.sr_id}
                                to='/summon-and-case-view'  
                                state={{ sr_id: item.sr_id }} 
                                className="hover:shadow-lg transition-shadow"
                            >
                                <CardLayout
                                    title={
                                        <div className="flex flex-row">
                                            <div className="flex justify-between items-center w-full">
                                                <p className="text-primary flex items-center font-semibold text-xl mb-2">
                                                    No. {item.sr_code}
                                                </p>
                                            </div>
                                        </div>
                                    }
                                    content={
                                        <div className="flex flex-col gap-2">
                                            <div className={styles.cardInfoRow}>
                                                <p className={styles.cardContent}>Complainant: </p>
                                                <p className={styles.cardInfo}>{item.complainant_name}</p>
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
                                                <p className={`${styles.cardInfo} ${getStatusColor(item.status)}`}>
                                                    {item.status || "Unknown"}
                                                </p>
                                            </div>

                                            {(item.status === "Resolved" || item.status === "Escalated") && item.decision_date && (
                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Decision Date: </p>
                                                    <p className={styles.cardInfo}>
                                                        {formatTimestamp(item.decision_date)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    }
                                    description={
                                        <div className="mb-5">
                                            <p>{item.allegation}</p>
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