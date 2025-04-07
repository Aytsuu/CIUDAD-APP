import RatesPage1 from "./rates-page1"
import RatesPage2 from "./rates-page2"
import RatesPage3 from "./rates-page3"
import RatesPage4 from "./rates-page4"
import RatesPage5 from "./rates-page5"
import { Button } from "@/components/ui/button/button"
import { useState } from "react"

function RatesForm(){
    const [currentPage, setCurrentPage] = useState(1);
    const handleNext = () => {
        setCurrentPage((prev) => {
            return prev + 1;
        });
    };
    
    const handlePrevious = () => {
        setCurrentPage((prev) => prev - 1);
    };

    return(
         <div className='w-full h-full bg-snow'>
             <div className="flex flex-col gap-3 mb-3">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Rates</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                Manage and configure rates for business permits, personal clearances, service charges, and other barangay fees.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            <div className="w-full">
                {currentPage == 1 && (
                    <RatesPage1
                    onNext2 = {handleNext}
                    />
                )}

                {currentPage == 2 && (
                    <RatesPage2
                    onNext3 = {handleNext}
                    onPrevious1 = {handlePrevious}
                    />
                )}

                {currentPage == 3 && (
                    <RatesPage3
                    onNext4 = {handleNext}
                    onPrevious2 = {handlePrevious}
                    />
                )}

                {currentPage == 4 && (
                    <RatesPage4
                    onNext5 = {handleNext}
                    onPrevious3 = {handlePrevious}
                    />
                )}

                {currentPage == 5 && (
                    <RatesPage5
                    onPrevious4 = {handlePrevious}
                    />
                )}
            </div>
            
         </div>
    )
}

export default RatesForm