// Import necessary components and icons
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, MessageSquareWarning, Clock4, ClockAlert, CalendarDays, Trash, ImageOff, ChartBarStacked } from "lucide-react";

// Main component for the DRR Report Form
export default function IRFormLayout() {
    return (
        // Main container for the form
        <div className="w-full h-full flex flex-col gap-3">

            {/* Top section: Displays metadata about the report */}
            <div className="w-full h-[5%] flex justify-between items-start text-darkGray">
                {/* Category */}
                <Label className="flex items-center gap-1">
                    <ChartBarStacked className="w-[16px]"/> Category:
                </Label>

                {/* Location */}
                <Label className="flex items-center gap-1">
                    <MapPin className="w-[16px]"/> Location:
                </Label>

                {/* Reported By */}
                <Label className="flex items-center gap-1">
                    <MessageSquareWarning className="w-[16px]"/> Reported By:
                </Label>

                {/* Date */}
                <Label className="flex items-center gap-1">
                    <CalendarDays className="w-[16px]"/> Date:
                </Label>
            </div>

            {/* Middle section: Description and incident/reported times */}
            <div className="flex flex-col gap-2 w-full h-full">
                {/* Textarea for entering the report description */}
                <Textarea className="w-full h-full" />

                {/* Incident and Reported Times */}
                <div className="flex flex-row gap-5 justify-end text-darkGray">
                    {/* Incident Time */}
                    <Label className="flex items-center gap-1">
                        <Clock4 className="w-[16px]"/> Incident Time:
                    </Label>

                    {/* Time Reported */}
                    <Label className="flex items-center gap-1">
                        <ClockAlert className="w-[16px]"/> Time Reported:
                    </Label>
                </div>
            </div>

            {/* Bottom section: Uploaded Image placeholder */}
            <div className="w-full h-full p-2 flex flex-col mt-2 rounded-[5px]">
                {/* Label for the uploaded image section */}
                <Label className="font-semibold">Uploaded Image</Label>

                {/* Placeholder for when no image is uploaded */}
                <div className="w-full h-full flex flex-col justify-center items-center text-gray">
                    <ImageOff className="w-[5rem] h-[5rem]"/>
                    <Label className="text-[24px]">No image uploaded</Label>
                </div>
            </div>

            {/* Action buttons at the bottom */}
            <div className="w-full h-[15%] flex justify-end gap-2 mt-2">
                {/* Delete button */}
                <Button variant={"destructive"}>
                    <Trash/>
                </Button>

                {/* Create AR button */}
                <Button className="bg-blue hover:bg-blue hover:opacity-[95%]">
                    Create AR
                </Button>
            </div>
        </div>
    )
}