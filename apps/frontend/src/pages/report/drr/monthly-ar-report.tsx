import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Scroll, Eye, Minus } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

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

export default function MonthlyARReport(){
    return(
        <div className="w-full h-[100vh] bg-snow flex justify-center items-center">
            <div className="w-[80%] h-4/5 flex gap-3">
                <div className="grid grid-cols-4 w-full h-full bg-white border border-gray rounded-[5px] p-5 gap-3">
                    {
                        months.map((month) => (<Card
                            title={month}
                            actionText="View"
                            icon={null}
                            className="w-full h-full"
                        />))
                    }

                </div>
                <div className="w-[50%] h-full bg-white border border-gray flex flex-col rounded-[5px] p-5 gap-6 overflow-auto">
                    {
                        months.map(() => (<RecentRecord
                        title='4th Weekly AR, Nov. 2024' 
                        status='Unsigned'
                    />))
                    }
                </div>
            </div>
        </div>
    );
}


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
                trigger={<Button variant={'outline'} className="w-[40px] h-[35px]" ><Eye/></Button>}
                content='View'
            />
            <TooltipLayout
                trigger={<Button variant={'destructive'} className="w-[40px] h-[35px]" ><Minus/></Button>}
                content='Remove'
            />
        </div>
    </div>
)
