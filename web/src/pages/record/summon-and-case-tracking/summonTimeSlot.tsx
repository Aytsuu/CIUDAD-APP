import { Button } from "@/components/ui/button/button";
import { Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { SummonTimeSchema } from "@/form-schema/summon-time-schema";
import { Card } from "@/components/ui/card/card";
import { useState } from "react";
import { Label } from "@/components/ui/label";

// Sample data type
type TimeSlot = {
  id: number;
  startTime: string;
  endTime: string;
};

// Helper function to convert 24-hour time to 12-hour format
const formatTimeTo12Hour = (timeString: string) => {
  if (!timeString) return "";
  
  const [hours, minutes] = timeString.split(':');
  const hourNum = parseInt(hours, 10);
  const period = hourNum >= 12 ? 'pm' : 'am';
  const hour12 = hourNum % 12 || 12;
  
  return `${hour12}:${minutes}${period}`;
};

// Helper function to convert 12-hour time to 24-hour format for form submission
const formatTimeTo24Hour = (timeString: string) => {
  if (!timeString) return "";
  
  const time = timeString.toLowerCase();
  const [timePart, period] = time.split(/(am|pm)/);
  const [hours, minutes] = timePart.split(':');
  
  let hourNum = parseInt(hours, 10);
  if (period === 'pm' && hourNum !== 12) {
    hourNum += 12;
  } else if (period === 'am' && hourNum === 12) {
    hourNum = 0;
  }
  
  return `${hourNum.toString().padStart(2, '0')}:${minutes || '00'}`;
};

export default function SummonTimeSlot({ sd_id }: { sd_id?: number }) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, startTime: "1:00pm", endTime: "4:00pm" },
    { id: 2, startTime: "6:00pm", endTime: "9:00pm" },
    { id: 3, startTime: "10:00am", endTime: "12:00pm" },
  ]);

  const form = useForm<z.infer<typeof SummonTimeSchema>>({
    resolver: zodResolver(SummonTimeSchema),
    defaultValues: {
      start_time: "",
      end_time: ""
    }
  });

  const handleAddTimeSlot = () => {
    const startTime24h = formatTimeTo24Hour(form.getValues("start_time"));
    const endTime24h = formatTimeTo24Hour(form.getValues("end_time"));
    
    const newTimeSlot = {
      id: Date.now(),
      startTime: formatTimeTo12Hour(startTime24h),
      endTime: formatTimeTo12Hour(endTime24h)
    };
    
    setTimeSlots([...timeSlots, newTimeSlot]);
    form.reset();
  };

  const handleDeleteTimeSlot = (id: number) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Current Time Slots</h2>
        <div className="space-y-2">
          {timeSlots.length > 0 ? (
            timeSlots.map((slot) => (
              <Card key={slot.id} className="flex items-center justify-between p-3">
                <Label className="font-medium">{slot.startTime} - {slot.endTime}</Label>
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

            <Button type="button">
              Save 
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}