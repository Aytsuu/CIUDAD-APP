import CardLayout from "@/components/ui/card/card-layout";
import { Link, useLocation } from "react-router-dom";
import { Search, Clock, AlertTriangle, ArrowUpRight, CheckCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState, useEffect } from "react";
import { useGetLuponCaseList, useGetConciliationCardAnalytics } from "../queries/summonFetchQueries";
import type { SummonCaseList } from "../summon-types";
import { useLoading } from "@/context/LoadingContext";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchParams } from "react-router-dom";

const styles = {
    cardContent: "font-semibold text-[12px]",
    cardInfoRow: "flex flex-grid items-center gap-3",
    cardInfo: "font-sm text-[12px]",
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

// Analytics cards configuration
const conciliationCards = [
    {
        title: "Waiting for Schedule",
        dataKey: "waiting" as const,
        icon: Clock,
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-100"
    },
    {
        title: "Ongoing Cases",
        dataKey: "ongoing" as const,
        icon: AlertTriangle,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-100"
    },
    {
        title: "Escalated Cases",
        dataKey: "escalated" as const,
        icon: ArrowUpRight,
        iconColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-100"
    },
    {
        title: "Resolved Cases",
        dataKey: "resolved" as const,
        icon: CheckCircle,
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-100"
    },
];

// Resident badge component
function ResidentBadge() {
    return (
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
            Resident
        </span>
    );
}

// Format array data to display multiple items properly
const formatNames = (data: string[] | string | null | undefined): string => {
    if (!data) return "N/A";
    
    if (Array.isArray(data)) {
        const validNames = data.filter(name => name != null && name !== "");
        return validNames.length > 0 ? validNames.join(', ') : "N/A";
    }
    
    return String(data || "N/A");
};

function LuponCases(){  
    const { showLoading, hideLoading } = useLoading();
    const location = useLocation();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [pageSize, setPageSize] = useState(10);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    const handlePageChange = (page: number) => {
        setSearchParams({ page: String(page) });
    };

    const filterOptions = [
        { id: "All", name: "All" },
        { id: "Ongoing", name: "Ongoing" },
        { id: "Resolved", name: "Resolved" },
        { id: "Escalated", name: "Escalated" },
        { id: "Waiting for Schedule", name: "Waiting for Schedule" },
    ];

    // Fetch analytics data for cards
    const { data: analyticsData, isLoading: isLoadingAnalytics } = useGetConciliationCardAnalytics();
    
    // Use the hook with pagination and filtering parameters
    const { data: luponCaseData = { results: [], count: 0 }, isLoading: isLoadingCases } = useGetLuponCaseList(
        currentPage, 
        pageSize, 
        debouncedSearchQuery, 
        selectedFilter
    );

    const isLoading = isLoadingAnalytics || isLoadingCases;
    const luponCases = luponCaseData.results || [];
    const totalItems = luponCaseData.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Loading state management
    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);

    // Set initial loading state
    useEffect(() => {
        if (luponCaseData.results !== undefined) {
            setIsInitialLoading(false);
        }
    }, [luponCaseData]);

    // Reset to first page when filters change
    useEffect(() => {
        if (debouncedSearchQuery === "" && searchQuery !== "") return;
        if (selectedFilter !== "All") {
            handlePageChange(1);
        }
    }, [debouncedSearchQuery, selectedFilter]);

    const hasResidentComplainant = (item: SummonCaseList) => {
        if (!item.complainant_rp_ids) return false;
        
        if (Array.isArray(item.complainant_rp_ids)) {
            return item.complainant_rp_ids.some(rpId => rpId != null);
        }
        
        return item.complainant_rp_ids != null;
    };

    // Show only initial loading spinner, not during searches
    if (isInitialLoading && !searchQuery) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
                <span className="ml-2 text-gray-600">Loading lupon cases...</span>
            </div>
        );
    }

    return(
        <div className="w-full h-full flex flex-col">
            {/* Header Section - Fixed height - ALWAYS VISIBLE */}
            <div className="flex-shrink-0">
                <div className="flex flex-col gap-3 mb-3">
                    <div className="flex flex-row gap-4">
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                            Conciliation Proceedings Cases
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-darkGray">
                        View, manage, and track the status of lupon mediation cases.
                    </p>
                </div>
                <hr className="border-gray mb-7 sm:mb-8" />
            </div>

            {/* Analytics Cards Section */}
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {conciliationCards.map((card) => {
                        const Icon = card.icon;
                        const value = analyticsData?.[card.dataKey] ?? 0;
                        
                        return (
                            <div 
                                key={card.title}
                                className={`${card.bgColor} border ${card.borderColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search and Filter Section - ALWAYS VISIBLE */}
            <div className="flex-shrink-0 mb-6 mt-6">
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
                            {isLoadingCases && searchQuery && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <Spinner size="sm" />
                                </div>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="w-full md:w-[250px]">
                            <SelectLayout
                                className="w-full bg-white"
                                placeholder="All Status"
                                options={filterOptions}
                                value={selectedFilter}
                                label=""
                                onChange={(value) => {
                                    handlePageChange(1);
                                    setSelectedFilter(value);
                                }}
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
                                handlePageChange(1)
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

            {/* Content Area - Shows loading or data */}
            <div className="flex-1 overflow-y-auto">
                {isLoadingCases ? (
                    // ALWAYS show loading spinner when isLoadingCases is true
                    // This covers: initial load, page changes, filter changes, etc.
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="md" />
                        <span className="ml-2 text-gray-600">
                            {searchQuery ? "Searching lupon cases..." : "Loading lupon cases..."}
                        </span>
                    </div>
                ) : totalItems === 0 ? (
                    // Empty state - only show when NOT loading
                    <div className="flex flex-col items-center justify-center py-10">
                        <p className="text-gray-500 text-lg">No lupon cases found</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {searchQuery || selectedFilter !== "All" 
                                ? "No results matching your criteria" 
                                : "Try changing your filters"
                            }
                        </p>
                    </div>
                ) : (
                    // Data state - only show when data is loaded and has items
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6"> 
                            {luponCases.map((item: SummonCaseList) => (
                                <Link 
                                    key={item.sc_id}
                                    to='/view-conciliation-details'  
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
                                        // Preserve current page state for back navigation
                                        fromPage: currentPage,
                                        fromPath: location.pathname,
                                        fromSearchParams: Object.fromEntries(searchParams.entries())
                                    }} 
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardLayout
                                        title={
                                            <div className="flex flex-row">
                                                <div className="flex justify-between items-center w-full">
                                                    <p className="text-primary flex items-center font-semibold text-lg mb-2">
                                                        Case No. {item.sc_code}
                                                        {hasResidentComplainant(item) && <ResidentBadge />}
                                                    </p>
                                                </div>
                                            </div>
                                        }
                                        content={
                                            <div className="flex flex-col gap-2">
                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Complainant: </p>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={styles.cardInfo}>
                                                            {formatNames(item.complainant_names)}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Accused: </p>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={styles.cardInfo}>
                                                            {formatNames(item.accused_names)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Incident: </p>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={styles.cardInfo}>{item.incident_type}</p>
                                                    </div>
                                                </div>

                                                <div className={styles.cardInfoRow}>
                                                    <p className={styles.cardContent}>Status: </p>
                                                    <p className={`${styles.cardInfo} ${getStatusColor(item.sc_conciliation_status || item.sc_mediation_status)}`}>
                                                        {item.sc_conciliation_status || item.sc_mediation_status || "Unknown"}
                                                    </p>
                                                </div>
                                            </div>
                                        }
                                    />
                                </Link>  
                            ))}
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
                                    onPageChange={handlePageChange} 
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default LuponCases;