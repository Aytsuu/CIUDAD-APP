import Card from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Scroll, Eye, Minus } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

interface RecentRecordProps{
    title: string,
    status: string,
}

const RecentRecord = ({title, status} : RecentRecordProps) => (
    <div className="w-full h-[10%] flex flex-row justify-center items-center">
        <div className="w-[20%] flex items-center justify-start">
            <Scroll className="w-[30px] h-[30px] stroke-[1px]"/>
        </div>
        <div className="w-full flex flex-col">
            <Label className="text-[16px]">{title}</Label>
            <Label>{status}</Label>
        </div>
        <div className="w-1/4 flex justify-center items-center gap-2">
            <TooltipLayout
                trigger={<div className="w-[40px] h-[35px] border border-gray flex justify-center items-center rounded-[5px] shadow-sm" ><Eye className="h-[1rem] text-black" /></div>}
                content='View'
            />
            <TooltipLayout
                trigger={<div className="w-[40px] h-[35px] bg-red-500 flex justify-center items-center rounded-[5px] shadow-sm" ><Minus className="h-[1rem] text-white" /></div>}
                content='Remove'
            />
        </div>
    </div>
)

export default function DRRMonthlyARReport(){
    return(
        <div className="w-screen h-screen bg-snow flex justify-center items-center">
            <div className="w-[80%] h-4/5 flex gap-3">

                <div className="w-full h-full flex flex-col bg-white border border-gray rounded-[5px] p-5 gap-3">
                    <div className="w-full flex justify-between items-center">
                        <SelectLayout
                            placeholder="Year"
                            label=""
                            options={[]}
                            value=""
                            onChange={()=>{}}

                        />
                    </div>
                    <div className="grid grid-cols-4 w-full h-full gap-3">
                        {
                            months.map((month, index) => (
                                <Card
                                    key={index}
                                    title={month}
                                    actionText="View"
                                    icon={null}
                                    className="w-full h-full bg-white border"
                                />
                            ))
                        }

                    </div>
                </div>
                <div className="w-[50%] h-full bg-white border border-gray flex flex-col rounded-[5px] p-5 gap-6 overflow-auto">
                    {
                        months.map((_, index) => (
                            <RecentRecord
                                key={index}
                                title='4th Weekly AR, Nov. 2024' 
                                status='Unsigned'
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

