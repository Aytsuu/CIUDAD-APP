import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Search,} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router";

import AnnualDevelopmentPlanView from './annual_development_plan_view.tsx';
import { getAnnualDevPlanYears } from "./restful-api/annualGetAPI";

function AnnualDevelopmentPlan(){
    const [openedYear, setOpenedYear] = useState<number | null>(null);
    const [years, setYears] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            const data = await getAnnualDevPlanYears();
            setYears(data);
        } catch (error) {
            console.error("Error fetching years:", error);
        } finally {
            setIsLoading(false);
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

            <div className="flex flex-col md:flex-row justify-between items-center gap-4"> 
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1 max-w-[20rem]">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                                size={17}
                            />
                            <Input 
                                placeholder="Search..." 
                                className="pl-10 w-full bg-white text-sm" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                    ) : years.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            {/* Empty State Icon */}
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
                            {(search ? years.filter(y => String(y).includes(search.trim())) : years).map(year => (
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
            </div>
        </div>
    )
}

export default AnnualDevelopmentPlan