import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react"


export default function BHWMonthlyReport() {
    return (
        <div className="w-full text-[12px]">
            <div className="flex">
                <Link to="/">
                    <Button 
                        className="text-black p-2 self-start"
                        variant={"outline"}
                    >
                        <ChevronLeft />
                    </Button>                        
                </Link>
                <div className="flex flex-col sm:flex-row ml-3 justify-between items-start sm:items-center gap-4">
                    <div className="flex-col items-center mb-4">
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                            Child Health Record Viewing
                        </h1>
                        <p className="text-xs   sm:text-sm text-darkGray">
                            View child's information
                        </p>
                    </div>
                </div>
            </div>
            

            <div className=" w-[816px] h- mx-auto m-3 p-5 border border-gray-300 bg-white"></div>
        </div>
    )
}