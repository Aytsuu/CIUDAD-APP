// import CardLayout from "@/components/ui/card/card-layout";
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



export default function SummonRemarksMain(){  

    // if (isLoading) {
    //     return (
    //         <div className="flex items-center justify-center py-12">
    //             <Spinner size="lg" />
    //             <span className="ml-2 text-gray-600">Loading summon cases...</span>
    //         </div>
    //     );
    // }

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
        </div>
    )
}

