// Import necessary components and icons
import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  MessageSquareWarning,
  Clock4,
  CalendarDays,
  Trash,
  ImageOff,
} from "lucide-react";
import React from "react";
import { useLocation } from "react-router";

// Main component for the DRR Report Form
export default function IRFormLayout() {
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const data = React.useMemo(() => params?.data, [params]);

  return (
    // Main container for the form
    <LayoutWithBack title="Incident Report Details" description="This page contains complete details of the reported incident.">
      <Card className="w-full h-full flex flex-col gap-3 p-10">
        <div className="w-full h-[5%] flex justify-between items-start text-darkGray">

          <Label className="flex items-center gap-1">
            <MapPin className="w-[16px]" /> Location: {data.ir_location}
          </Label>

          <Label className="flex items-center gap-1">
            <MessageSquareWarning className="w-[16px]" /> Reported By: {data.ir_reported_by}
          </Label>

          <Label className="flex items-center gap-1">
            <CalendarDays className="w-[16px]" /> Date: {data.ir_date}
          </Label>

          <Label className="flex items-center gap-1">
              <Clock4 className="w-[16px]" /> Time: {data.ir_time}
            </Label>
        </div>

        <div className="flex flex-col gap-2 w-full h-full">
          <Textarea className="w-full h-full" value={data.ir_add_details}/>
        </div>

        <div className="w-full h-full p-2 flex flex-col mt-2 rounded-[5px]">
          <Label className="font-semibold">Uploaded Image</Label>
          <div className="w-full h-full flex flex-col justify-center items-center text-gray">
            <ImageOff className="w-[5rem] h-[5rem]" />
            <Label className="text-[24px]">No image uploaded</Label>
          </div>
        </div>

        <div className="w-full h-[15%] flex justify-end gap-2 mt-2">
          <Button variant={"destructive"}>
            <Trash />
          </Button>
          <Button variant={"outline"}>
            Create Acknowledgement Report
          </Button>
        </div>
      </Card>
    </LayoutWithBack>
  );
}
