import { Label } from "@/components/ui/label";
import { Scroll } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WeeklyARReport(){
    return (
        <div className="w-full h-[100vh] flex flex-col">
            <Record 
                title="4th Weekly AR, Nov. 2024"
                status="Signed"
                date="Nov 9, 2024"
            />
        </div>
    );
}

const Record = (({title, status, date} : {title: string, status: string, date: string}) => (
    <div className="w-full flex justify-between items-center">
        <div className="flex items-center justify-start">
            <Scroll className="w-[30px] h-[30px] stroke-[1px]"/>
        </div> 
        <Label className="text-[16px]">{title}</Label>
        <Label>{status}</Label>
        <Label>{date}</Label>
        <Button variant={'outline'} className="">
            View
        </Button>
    </div>
))