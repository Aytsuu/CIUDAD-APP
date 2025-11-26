import { Button } from "@/components/ui/button/button";
import { Plus, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { SummonTimeSchema } from "@/form-schema/summon-time-schema";
import { useState } from "react";
import { useAddSummonTimeSlots } from "../queries/summonInsertQueries";

type TimeSlot = {
  id: number;
  displayStart: string; 
  rawStart: string;    
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
      sd_id: String(sd_id),
    }
  });

  // Watch the start_time value to enable/disable the button
  const currentTimeValue = form.watch("start_time");

  const handleAddTimeSlot = () => {
    const rawStart = form.getValues("start_time"); 
    
    // Manual validation
    if (!rawStart) {
      return;
    }
    
    const newTimeSlot = {
      id: Date.now(),
      displayStart: formatTimeTo12Hour(rawStart),
      rawStart,
    };
    
    setTimeSlots([...timeSlots, newTimeSlot]);
    form.setValue("start_time", ""); // Clear the input instead of full reset
  };

  const handleDeleteTimeSlot = (id: number) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const handleSubmit = () => {
    const submissionData = timeSlots.map(slot => ({
      sd_id: Number(sd_id),
      st_start_time: slot.rawStart, 
      st_is_booked: false
    }));

    addTimeSlot(submissionData);
  };

  return (
    <div className="space-y-4">
      {/* Current Time Slots - Pill Design */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold">Current Time Slots</h2>
          <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
            {timeSlots.length} added
          </span>
        </div>
        
        <div className="min-h-20 max-h-32 overflow-y-auto border rounded-lg p-3">
          {timeSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 text-sm font-medium"
                >
                  <span>{slot.displayStart}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTimeSlot(slot.id)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} className="text-red-500"/>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <h4 className="text-sm text-muted-foreground">No time slots added yet</h4>
              <p className="text-xs text-muted-foreground mt-1">Add your first time slot below</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Time Slot Form */}
      <Form {...form}>
        <form className="space-y-4">
          <div className="w-full">
            <FormDateTimeInput
              control={form.control}
              label="Time"  
              type="time"
              name="start_time"
            />
          </div>
          <div className='flex flex-col sm:flex-row gap-2 w-full'>
            <Button 
              type="button"  
              variant="outline" 
              onClick={handleAddTimeSlot}
              disabled={!currentTimeValue} 
              className="w-full sm:flex-1"
            >
              <Plus size={16} className="mr-2" /> 
              Add Time Slot
            </Button>

            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isPending || timeSlots.length === 0}
              className="w-full sm:flex-1"
            >
              {isPending ? "Saving..." : "Save All"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}