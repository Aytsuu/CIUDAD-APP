import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import { MessageSquareWarning } from "lucide-react";
import { 
    Clock4, 
    ClockAlert,
    CalendarDays,
    Trash,
    ImageOff,
    ChartBarStacked
} from "lucide-react";

export default function DRRReportForm(){
    return (
        <div className="w-full h-full flex flex-col  gap-3">

            <div className="w-full h-[5%] flex justify-between items-start text-darkGray">

                <Label className="flex items-center gap-1">
                    <ChartBarStacked className="w-[16px]"/> Category:
                </Label>

                <Label className="flex items-center gap-1">
                    <MapPin className="w-[16px]"/> Location:
                </Label>

                <Label className="flex items-center gap-1">
                    <MessageSquareWarning className="w-[16px]"/> Reported By:
                </Label>     

                <Label className="flex items-center gap-1">
                    <CalendarDays className="w-[16px]"/> Date:
                </Label>     
                
            </div>
            <div className="flex flex-col gap-2 w-full h-full">
                <Textarea className="w-full h-full"/>
                <div className="flex flex-row gap-5 justify-end text-darkGray">
                    <Label className="flex items-center gap-1">
                        <Clock4 className="w-[16px]"/> Incident Time:
                    </Label>

                    <Label className="flex items-center gap-1">
                        <ClockAlert className="w-[16px] "/> Time Reported:
                    </Label>
                </div>
            </div>
            <div className="w-full h-full p-2 flex flex-col mt-2 rounded-[5px]">
                <Label className="font-semibold">Uploaded Image</Label>
                <div className="w-full h-full flex flex-col justify-center items-center text-gray">
                    <ImageOff className="w-[5rem] h-[5rem]"/>
                    <Label className="text-[24px]">No image uploaded</Label>
                </div>
            </div>

            <div className="w-full h-[15%] flex justify-end gap-2 mt-2">
                <Button variant={"destructive"}>
                    <Trash/>
                </Button>
                <Button className="bg-blue hover:bg-blue hover:opacity-[95%]">
                    Create AR
                </Button>
            </div>
        </div>

    )
}