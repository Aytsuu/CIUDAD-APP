import { Button } from "@/components/ui/button/button";
import { Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { SummonTimeSchema } from "@/form-schema/summon-time-schema";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useAddSummonTimeSlots } from "./queries/summonInsertQueries";

type TimeSlot = {
  id: number;
  displayStart: string; 
  displayEnd: string;  
  rawStart: string;   
  rawEnd: string;     
};

const formatTimeTo12Hour = (time24h: string) => {
  if (!time24h) return "";
  
  const [hours, minutes] = time24h.split(':');
  const hourNum = parseInt(hours, 10);
  const period = hourNum >= 12 ? 'pm' : 'am';
  const hour12 = hourNum % 12 || 12;
  
  return `${hour12}:${minutes}${period}`;
};

export default function SummonTimeSlot({ sd_id, onSuccess }: { sd_id?: number, onSuccess: () => void }) {
  const { mutate: addTimeSlot, isPending } = useAddSummonTimeSlots(onSuccess);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const form = useForm<z.infer<typeof SummonTimeSchema>>({
    resolver: zodResolver(SummonTimeSchema),
    defaultValues: {
      start_time: "",
      end_time: "",
      sd_id: String(sd_id),
    }
  });

  const handleAddTimeSlot = () => {
    const rawStart = form.getValues("start_time"); 
    const rawEnd = form.getValues("end_time");    
    
    const newTimeSlot = {
      id: Date.now(),
      displayStart: formatTimeTo12Hour(rawStart),
      displayEnd: formatTimeTo12Hour(rawEnd),
      rawStart,
      rawEnd
    };
    
    setTimeSlots([...timeSlots, newTimeSlot]);
    form.reset();
  };

  const handleDeleteTimeSlot = (id: number) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const handleSubmit = () => {
    const submissionData = timeSlots.map(slot => ({
      sd_id: Number(sd_id),
      st_start_time: slot.rawStart, 
      st_end_time: slot.rawEnd,
      st_is_booked: false
    }));

    console.log("Submitting raw time slots:", submissionData);
    addTimeSlot(submissionData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Current Time Slots</h2>
        <div className="space-y-2">
          {timeSlots.length > 0 ? (
            timeSlots.map((slot) => (
              <Card key={slot.id} className="flex items-center justify-between p-3">
                <Label className="font-medium">
                  {slot.displayStart} - {slot.displayEnd}
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteTimeSlot(slot.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </Card>
            ))
          ) : (
            <Card className="p-4">
              <h4 className="text-muted-foreground">No time slots added yet</h4>
            </Card>
          )}
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row justify-center items-center w-full">
            <FormDateTimeInput
              control={form.control}
              label="Start Time"
              type="time"
              name="start_time"
            />

            <FormDateTimeInput
              control={form.control}
              label="End Time"
              type="time"
              name="end_time"
            />
          </div>
          <div className='flex flex-col sm:flex-row justify-center items-center gap-2'>
            <Button 
              type="button"  
              variant="outline" 
              onClick={handleAddTimeSlot}
              disabled={!form.formState.isValid}
            >
              <Plus size={16} className="mr-2" /> 
              Add Time Slot
            </Button>

            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isPending || timeSlots.length === 0}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}