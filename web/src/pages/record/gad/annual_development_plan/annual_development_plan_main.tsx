import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Search, ChevronLeft, ChevronRight, Archive } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router";
import { useLoading } from "@/context/LoadingContext";
import AnnualDevelopmentPlanView from './annual_development_plan_view.tsx';
import AnnualDevelopmentPlanArchive from './annual_development_plan_archive.tsx';
import {getAnnualDevPlans } from "./restful-api/annualGetAPI";
import { useGetArchivedAnnualDevPlans } from "./queries/annualDevPlanFetchQueries";

function AnnualDevelopmentPlan(){
    const { showLoading, hideLoading } = useLoading();
    const [openedYear, setOpenedYear] = useState<number | null>(null);
    const [years, setYears] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [plans, setPlans] = useState<any[]>([]);
    const [showPlans, setShowPlans] = useState(false);
    const [activeTab, setActiveTab] = useState<'main' | 'archive'>('main');
    const pageSize = 10;

    // Get archived plans count
    const { data: archivedPlansData } = useGetArchivedAnnualDevPlans(1, 1);
    const archivedCount = archivedPlansData?.count || 0;

    useEffect(() => {
        if (search.trim()) {
            fetchPlans();
        } else {
            fetchYears();
        }
    }, [search, currentPage]);

    const fetchYears = async () => {
        try {
            setIsLoading(true);
            showLoading();
            const response = await getAnnualDevPlans(undefined, 1, 10000);
            const allPlans = (response.results || response) as any[];
            const uniqueYears: number[] = [...new Set(allPlans.map((plan: any) => new Date(plan.dev_date).getFullYear()))].sort((a: number, b: number) => b - a); // Sort descending
            setYears(uniqueYears);
            setShowPlans(false);
        } catch (error) {
            console.error("Error fetching years:", error);
            setYears([]);
        } finally {
            setIsLoading(false);
            hideLoading();
        }
    };


    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            showLoading();
            const response = await getAnnualDevPlans(search || undefined, currentPage, pageSize);
            
            if (response.results) {
                // Paginated response
                setPlans(response.results);
                setTotalPages(Math.ceil(response.count / pageSize));
                setTotalCount(response.count);
                setShowPlans(true);
            } else {
                // Non-paginated response (fallback)
                setPlans(response);
                setTotalPages(1);
                setTotalCount(response.length);
                setShowPlans(true);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
        } finally {
            setIsLoading(false);
            hideLoading();
        }
    };

    const handleOpen = (year: number) => {
        setOpenedYear(year);
    };

    const handleBack = () => {
        setOpenedYear(null);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleClearSearch = () => {
        setSearch("");
        setCurrentPage(1);
        setShowPlans(false);
    };

    if (openedYear) {
        return <AnnualDevelopmentPlanView year={openedYear} onBack={handleBack} />;
    }

    if (activeTab === 'archive') {
        return <AnnualDevelopmentPlanArchive onBack={() => setActiveTab('main')} />;
    }

    return(
        <div className="bg-snow w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Annual Development Plan</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Plan, monitor, and achieve your annual development goals with structured strategies and progress tracking.
                </p>
            </div>
            <hr className="border-gray mb-5 sm:mb-4" />   

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    onClick={() => setActiveTab('main')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        (activeTab as string) === 'main'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Development Plans
                </button>
                <button
                    onClick={() => setActiveTab('archive')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        (activeTab as string) === 'archive'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Archive size={16} />
                    Archived
                    {archivedCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {archivedCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4"> 
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1 max-w-[20rem]">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                                size={17}
                            />
                            <Input 
                                placeholder="Search development plans..." 
                                className="pl-10 w-full bg-white text-sm" 
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>
                  </div>
                <div className="">
                     <Link to="/gad-annual-development-plan/create"><Button>+ Create New</Button></Link>
                </div>
            </div>

            <div className="mt-5">
                <div className="bg-white border border-gray-300 rounded-[5px] p-5 min-h-[20rem] flex flex-col items-center justify-start">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Spinner size="lg" />
                        </div>
                    ) : showPlans ? (
                        // Show plans when searching
                        <div className="w-full">
                            {plans.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <div className="mb-10 mt-10">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                                                <svg 
                                                    className="w-12 h-12 text-blue-500" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={1.5} 
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        No Development Plans Found
                                    </h3>
                                    <p className="text-gray-600 mt-2">
                                        Try adjusting your search terms
                                    </p>
                                    <Button onClick={handleClearSearch} className="mt-4">
                                        Clear Search
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Search Results ({totalCount} found)
                                            </h3>
                                            {search && (
                                                <p className="text-sm text-gray-600">
                                                    Searching for: "{search}"
                                                </p>
                                            )}
                                        </div>
                                        <Button onClick={handleClearSearch} variant="outline">
                                            Clear Search
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {plans.map((plan) => (
                                            <div key={plan.dev_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 mb-1">
                                                            {Array.isArray(plan.dev_project) ? plan.dev_project.join(', ') : plan.dev_project}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {plan.dev_client}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Date: {new Date(plan.dev_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            ₱{plan.dev_gad_budget?.toLocaleString() || '0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-6 flex justify-center items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Previous
                                            </Button>
                                            
                                            <div className="flex space-x-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                                    if (pageNum > totalPages) return null;
                                                    
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={currentPage === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        // Show years when not searching
                        <div className="w-full">
                            {years.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <div className="mb-10 mt-10">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                                                <svg 
                                                    className="w-12 h-12 text-blue-500" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={1.5} 
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        No Annual Development Plans Found
                                    </h3>
                                </div>
                            ) : (
                                <div className="w-full flex flex-row items-start">
                                    {years.map(year => (
                                        <div key={year} onClick={() => handleOpen(year)} className="flex flex-col items-center group cursor-pointer mx-8 select-none">
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 group-hover:scale-105 transition-transform">
                                                <rect x="3" y="6" width="18" height="14" rx="2" fill="#FFE082"/>
                                                <path d="M3 8V6a2 2 0 0 1 2-2h3.17a2 2 0 0 1 1.41.59l1.83 1.83A2 2 0 0 0 12.83 7H19a2 2 0 0 1 2 2v1" fill="#FFD54F"/>
                                                <rect x="3" y="6" width="18" height="14" rx="2" stroke="#FFB300" strokeWidth="1.5"/>
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">Year {year}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnnualDevelopmentPlan
