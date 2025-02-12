// Import necessary components and icons
import Card from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Scroll, Eye, Minus } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";

// Array of months for display
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Define the type for the RecentRecord component props
type RecentRecordProps = {
    title: string;
    status: string;
}

// RecentRecord component to display individual records
const RecentRecord = ({ title, status }: RecentRecordProps) => (
    <div className="w-full h-auto flex flex-row justify-center items-center p-2 sm:p-0">
        {/* Icon for the record */}
        <div className="w-[20%] flex items-center justify-start">
            <Scroll className="w-[30px] h-[30px] stroke-[1px]" />
        </div>

        {/* Title and status of the record */}
        <div className="w-full flex flex-col">
            <Label className="text-[14px] sm:text-[16px]">{title}</Label>
            <Label className="text-[12px] sm:text-[14px]">{status}</Label>
        </div>

        {/* Action buttons with tooltips */}
        <div className="w-1/4 flex justify-center items-center gap-2">
            {/* View button with tooltip */}
            <TooltipLayout
                trigger={<div className="w-[40px] h-[35px] border border-gray flex justify-center items-center rounded-[5px] shadow-sm"><Eye className="h-[1rem] text-black" /></div>}
                content='View'
            />
            {/* Remove button with tooltip */}
            <TooltipLayout
                trigger={<div className="w-[40px] h-[35px] bg-red-500 flex justify-center items-center rounded-[5px] shadow-sm"><Minus className="h-[1rem] text-white" /></div>}
                content='Remove'
            />
        </div>
    </div>
);

// Main component for the DRR Monthly AR Report
export default function DRRMonthlyARReport() {
    return (
        // Main container for the page
        <div className="w-screen h-screen bg-snow flex justify-center items-center p-4 sm:p-0">
            {/* Container for the left and right sections */}
            <div className="w-full sm:w-[80%] h-full sm:h-4/5 flex flex-col-reverse sm:flex-row gap-3">

                {/* Left Section: Displays months as cards */}
                <div className="w-full sm:w-full h-auto sm:h-full flex flex-col bg-white border border-gray rounded-[5px] p-3 sm:p-5 gap-3">
                    {/* Year selection dropdown */}
                    <div className="w-full flex justify-between items-center">
                        <SelectLayout
                            placeholder="Year"
                            label=""
                            className=""
                            options={[]}
                            value=""
                            onChange={() => { }}
                        />
                    </div>

                    {/* Grid of months displayed as cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full h-full gap-3">
                        {months.map((month, index) => (
                            <Card
                                key={index}
                                title={month}
                                actionText="View"
                                icon={null}
                                className="w-full h-full bg-white border"
                            />
                        ))}
                    </div>
                </div>

                {/* Right Section: Displays recent records */}
                <div className="sm:w-[50%] sm:h-full bg-white border border-gray flex flex-col rounded-[5px] p-3 sm:p-5 gap-3 overflow-auto">
                    {/* List of recent records */}
                    {months.map((_, index) => (
                        <RecentRecord
                            key={index}
                            title='4th Weekly AR, Nov. 2024'
                            status='Unsigned'
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}