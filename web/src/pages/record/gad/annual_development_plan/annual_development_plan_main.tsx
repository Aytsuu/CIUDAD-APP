import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Archive, FileCheck, FileText, ScrollText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Link, useLocation } from "react-router";
import { useLoading } from "@/context/LoadingContext";
import AnnualDevelopmentPlanView from './annual_development_plan_view.tsx';
import AnnualDevelopmentPlanArchive from './annual_development_plan_archive.tsx';
import {getAnnualDevPlans } from "./restful-api/annualGetAPI";
import { useGetArchivedAnnualDevPlans, useGetMandatedPlansCount, useGetPlansWithProposalsCount, useGetPlansWithResolutionsCount } from "./queries/annualDevPlanFetchQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function AnnualDevelopmentPlan(){
    const { showLoading, hideLoading } = useLoading();
    const location = useLocation();
    const [openedYear, setOpenedYear] = useState<number | null>(
        (location.state as any)?.openedYear || null
    );
    const [years, setYears] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'main' | 'archive'>('main');

    // Get archived plans count
    const { data: archivedPlansData } = useGetArchivedAnnualDevPlans(1, 1);
    const archivedCount = archivedPlansData?.count || 0;

    // Get analytics data
    const { data: mandatedData, isLoading: isLoadingMandated } = useGetMandatedPlansCount();
    const { data: proposalsData, isLoading: isLoadingProposals } = useGetPlansWithProposalsCount();
    const { data: resolutionsData, isLoading: isLoadingResolutions } = useGetPlansWithResolutionsCount();

    const mandatedCount = mandatedData?.count || 0;
    const proposalsCount = proposalsData?.count || 0;
    const resolutionsCount = resolutionsData?.count || 0;

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            setIsLoading(true);
            showLoading();
            const response = await getAnnualDevPlans(undefined, 1, 10000, false); // Exclude archived for main view
            const allPlans = (response.results || response) as any[];
            const uniqueYears: number[] = [...new Set(allPlans.map((plan: any) => new Date(plan.dev_date).getFullYear()))].sort((a: number, b: number) => b - a); // Sort descending
            setYears(uniqueYears);
        } catch (error) {
            setYears([]);
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

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Mandated
                        </CardTitle>
                        <div className="p-2 rounded-full bg-purple-50">
                            <FileCheck className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {isLoadingMandated ? (
                                <Skeleton className="h-8 w-16 bg-slate-200" />
                            ) : (
                                mandatedCount
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Mandated development plans
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            With Project Proposal
                        </CardTitle>
                        <div className="p-2 rounded-full bg-blue-50">
                            <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {isLoadingProposals ? (
                                <Skeleton className="h-8 w-16 bg-slate-200" />
                            ) : (
                                proposalsCount
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Plans with project proposals
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            With Resolution
                        </CardTitle>
                        <div className="p-2 rounded-full bg-green-50">
                            <ScrollText className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {isLoadingResolutions ? (
                                <Skeleton className="h-8 w-16 bg-slate-200" />
                            ) : (
                                resolutionsCount
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Plans with resolutions
                        </p>
                    </CardContent>
                </Card>
            </div>   

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

            <div className="flex justify-end items-center gap-4"> 
                <Link to="/gad-annual-development-plan/create"><Button>+ Create New</Button></Link>
            </div>

            <div className="mt-5">
                <div className="bg-white border border-gray-300 rounded-[5px] p-5 min-h-[20rem] flex flex-col items-center justify-start">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Spinner size="lg" />
                        </div>
                    ) : (
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
