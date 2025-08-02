import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Search, ChevronLeft } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Link } from "react-router";
import { Label } from "@/components/ui/label";
import AnnualDevelopmentPlanView from './annual_development_plan_view.tsx';
import { getAnnualDevPlanYears } from "./restful-api/annualGetAPI";

function AnnualDevelopmentPlan(){
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; year: number | null } | null>(null);
    const [openedYear, setOpenedYear] = useState<number | null>(null);
    const [years, setYears] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);

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

    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setContextMenu(null);
            }
        };
        if (contextMenu) {
            document.addEventListener("mousedown", handleClick);
        } else {
            document.removeEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [contextMenu]);

    const handleContextMenu = (e: React.MouseEvent, year: number) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, year });
    };

    const handleOpen = () => {
        if (contextMenu?.year) {
            setOpenedYear(contextMenu.year);
        }
        setContextMenu(null);
    };

    const handleDelete = () => {
        if (contextMenu?.year) {
            alert(`Delete folder for Year ${contextMenu.year}`);
        }
        setContextMenu(null);
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
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" />
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
                            <p>Loading years...</p>
                        </div>
                    ) : years.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            {/* Empty State Icon */}
                            <div className="mb-6">
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
                                    {/* Decorative elements */}
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full opacity-60"></div>
                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full opacity-60"></div>
                                </div>
                            </div>
                            
                            {/* Main Message */}
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                No Annual Development Plans Found
                            </h3>
                            
                                                         {/* Description */}
                             <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                                 
                             </p>
                            
                                                         
                        </div>
                    ) : (
                        <div className="w-full flex flex-row items-start">
                            {years.map(year => (
                                <div key={year} onContextMenu={e => handleContextMenu(e, year)} className="flex flex-col items-center group cursor-pointer mx-8 select-none">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 group-hover:scale-105 transition-transform">
                                        <rect x="3" y="6" width="18" height="14" rx="2" fill="#FFE082"/>
                                        <path d="M3 8V6a2 2 0 0 1 2-2h3.17a2 2 0 0 1 1.41.59l1.83 1.83A2 2 0 0 0 12.83 7H19a2 2 0 0 1 2 2v1" fill="#FFD54F"/>
                                        <rect x="3" y="6" width="18" height="14" rx="2" stroke="#FFB300" strokeWidth="1.5"/>
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Year {year}</span>
                                </div>
                            ))}
                            {contextMenu && (
                                <div
                                    ref={menuRef}
                                    style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, zIndex: 50 }}
                                    className="bg-white border border-gray-300 rounded shadow-lg min-w-[140px]"
                                >
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                                        onClick={handleOpen}
                                    >
                                        Open Folder
                                    </button>
                                    <hr className="my-0" />
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </button>
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