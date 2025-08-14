// import { Button } from "@/components/ui/button/button";
// import { Plus, Trash2 } from "lucide-react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { Form } from "@/components/ui/form/form";
// import { SummonTimeSchema } from "@/form-schema/summon-time-schema";
// import { Card } from "@/components/ui/card/card";
// import { useState } from "react";
// import { Label } from "@/components/ui/label";
// import { useAddSummonTimeSlots } from "./queries/summonInsertQueries";

// // Sample data type
// type TimeSlot = {
//   id: number;
//   startTime: string;
//   endTime: string;
// };

// const formatTimeTo12Hour = (timeString: string) => {
//   if (!timeString) return "";
  
//   const [hours, minutes] = timeString.split(':');
//   const hourNum = parseInt(hours, 10);
//   const period = hourNum >= 12 ? 'pm' : 'am';
//   const hour12 = hourNum % 12 || 12;
  
//   return `${hour12}:${minutes}${period}`;
// };

// const formatTimeTo24Hour = (timeString: string) => {
//   if (!timeString) return "";
//   const time = timeString.toLowerCase();
//   const [timePart, period] = time.split(/(am|pm)/);
//   const [hours, minutes] = timePart.split(':');
  
//   let hourNum = parseInt(hours, 10);
//   if (period === 'pm' && hourNum !== 12) {
//     hourNum += 12;
//   } else if (period === 'am' && hourNum === 12) {
//     hourNum = 0;
//   }
  
//   return `${hourNum.toString().padStart(2, '0')}:${minutes || '00'}`;
// };

// export default function SummonTimeSlot({ sd_id }: { sd_id?: number }) {
//   const timeSlotsToSubmit = []
//   const {mutate: addTimeSlot, isPending} = useAddSummonTimeSlots()
//   const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

//   const form = useForm<z.infer<typeof SummonTimeSchema>>({
//     resolver: zodResolver(SummonTimeSchema),
//     defaultValues: {
//       start_time: "",
//       end_time: "",
//       sd_id: String(sd_id)
//     }
//   });

//   const handleAddTimeSlot = () => {
//     const startTime24h = formatTimeTo24Hour(form.getValues("start_time"));
//     const endTime24h = formatTimeTo24Hour(form.getValues("end_time"));
    
//     const newTimeSlot = {
//       id: Date.now(),
//       startTime: formatTimeTo12Hour(startTime24h),
//       endTime: formatTimeTo12Hour(endTime24h)
//     };
//     timeSlotsToSubmit.push(newTimeSlot);
//     setTimeSlots([...timeSlots, newTimeSlot]);
//     form.reset();
//   };

//   const handleDeleteTimeSlot = (id: number) => {
//     setTimeSlots(timeSlots.filter(slot => slot.id !== id));
//   };

//   // const handleSubmit = () => {
//   //   console.log(newTimeSlot)
//   //   addTimeSlot(newTimeSlot)
//   // }


//   return (
//     <div className="space-y-6">
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Current Time Slots</h2>
//         <div className="space-y-2">
//           {timeSlots.length > 0 ? (
//             timeSlots.map((slot) => (
//               <Card key={slot.id} className="flex items-center justify-between p-3">
//                 <Label className="font-medium">{slot.startTime} - {slot.endTime}</Label>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="text-destructive hover:text-destructive"
//                   onClick={() => handleDeleteTimeSlot(slot.id)}
//                 >
//                   <Trash2 size={16} />
//                 </Button>
//               </Card>
//             ))
//           ) : (
//             <Card className="p-4">
//               <h4 className="text-muted-foreground">No time slots added yet</h4>
//             </Card>
//           )}
//         </div>
//       </div>

//       <Form {...form}>
//         <form className="space-y-4">
//           <div className="flex flex-col gap-4 md:flex-row justify-center items-center w-full">
//             <FormDateTimeInput
//               control={form.control}
//               label="Start Time"
//               type="time"
//               name="start_time"
//             />

//             <FormDateTimeInput
//               control={form.control}
//               label="End Time"
//               type="time"
//               name="end_time"
//             />
//           </div>
//           <div className='flex flex-col sm:flex-row justify-center items-center gap-2'>
//             <Button 
//               type="button"  
//               variant="outline" 
//               onClick={handleAddTimeSlot}
//               disabled={!form.formState.isValid}
//             >
//               <Plus size={16} className="mr-2" /> 
//               Add Time Slot
//             </Button>

//             <Button type="button" onClick={form.handleSubmit(handleSubmit)} disabled={isPending}>
//               {isPending ? "Saving..." : "Save"}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }


// import { Plus, Trash2 } from "lucide-react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { Form } from "@/components/ui/form/form";
// import { SummonTimeSchema } from "@/form-schema/summon-time-schema";
// import { Card } from "@/components/ui/card/card";
// import { useState } from "react";
// import { Label } from "@/components/ui/label";
// import { useAddSummonTimeSlots } from "./queries/summonInsertQueries";
// import { useGetSummonTimeSlots, type SummonTimeSlots } from "./queries/summonFetchQueries";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button/button";

// type TimeSlot = {
//   st_id: number;
//   st_start_time: string;
//   st_end_time: string;
// };

// const formatTimeTo12Hour = (timeString: string): string => {
//   if (!timeString) return "";
//   const [hours, minutes] = timeString.split(':');
//   const hourNum = parseInt(hours, 10);
//   if (isNaN(hourNum)) return "";
//   const period = hourNum >= 12 ? 'pm' : 'am';
//   const hour12 = hourNum % 12 || 12;
//   return `${hour12}:${minutes || '00'}${period}`;
// };

// const formatTimeTo24Hour = (timeString: string): string => {
//   if (!timeString) return "";
//   const time = timeString.toLowerCase();
//   const periodMatch = time.match(/(am|pm)/);
//   if (!periodMatch) return "";
//   const period = periodMatch[0];
//   const timePart = time.split(/(am|pm)/)[0].trim();
//   const [hours, minutes] = timePart.split(':');
//   let hourNum = parseInt(hours, 10);
//   if (isNaN(hourNum)) return "";
//   if (period === 'pm' && hourNum !== 12) {
//     hourNum += 12;
//   } else if (period === 'am' && hourNum === 12) {
//     hourNum = 0;
//   }
//   return `${hourNum.toString().padStart(2, '0')}:${minutes || '00'}`;
// };

// export default function SummonTimeSlot({ sd_id }: { sd_id?: number }) {
//   const [newTimeSlots, setNewTimeSlots] = useState<TimeSlot[]>([]);
//   const { mutate: addTimeSlots, isPending } = useAddSummonTimeSlots();
//   const { data: existingTimeSlots = [], isLoading } = useGetSummonTimeSlots(sd_id || 0);

//   const form = useForm<z.infer<typeof SummonTimeSchema>>({
//     resolver: zodResolver(SummonTimeSchema),
//     defaultValues: {
//       start_time: "",
//       end_time: "",
//       sd_id: String(sd_id)
//     }
//   });

//   const handleAddTimeSlot = () => {
//     const values = form.getValues();
//     const startTime24h = formatTimeTo24Hour(values.start_time);
//     const endTime24h = formatTimeTo24Hour(values.end_time);
//     if (!startTime24h || !endTime24h) return;
    
//     const newTimeSlot = {
//       sd_id: Number(sd_id),
//       st_start_time: formatTimeTo12Hour(startTime24h),
//       st_end_time: formatTimeTo12Hour(endTime24h),
//       st_id: Date.now() // Temporary ID for local management
//     };
    
//     setNewTimeSlots([...newTimeSlots, newTimeSlot]);
//     form.reset();
//   };

//   const handleDeleteTimeSlot = (id: number) => {
//     setNewTimeSlots(newTimeSlots.filter(slot => slot.st_id !== id));
//   };

//   const handleSubmitAll = () => {
//     const slotsToSubmit = newTimeSlots.map(slot => ({
//       start_time: formatTimeTo24Hour(slot.st_start_time),
//       end_time: formatTimeTo24Hour(slot.st_end_time),
//       sd_id: Number(sd_id)
//     }));
//     console.log(slotsToSubmit)
//     // addTimeSlots(slotsToSubmit);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Section for newly added time slots */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">New Time Slots</h2>
//         <div className="space-y-2">
//           {isLoading ? (
//             <>
//               <Skeleton className="h-12 w-full mb-2" />
//               <Skeleton className="h-12 w-full mb-2" />
//               <Skeleton className="h-12 w-full mb-2" />
//             </>
//           ) : newTimeSlots.length > 0 ? (
//             newTimeSlots.map((slot) => (
//               <Card key={slot.st_id} className="flex items-center justify-between p-3">
//                 <Label className="font-medium">{slot.st_start_time} - {slot.st_end_time}</Label>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="text-destructive hover:text-destructive"
//                   // onClick={() => handleDeleteTimeSlot(slot.st_id)}
//                 >
//                   <Trash2 size={16} />
//                 </Button>
//               </Card>
//             ))
//           ) : (
//             <Card className="p-4">
//               <h4 className="text-muted-foreground">No new time slots added yet</h4>
//             </Card>
//           )}
//         </div>
//       </div>

//       {/* Section for existing time slots (optional) */}
//       {existingTimeSlots.length > 0 && (
//         <div className="space-y-4">
//           <h2 className="text-lg font-semibold">Existing Time Slots</h2>
//           <div className="space-y-2">
//             {existingTimeSlots.map((slot) => (
//               <Card key={slot.st_id} className="flex items-center justify-between p-3">
//                 <Label className="font-medium">{slot.st_start_time} - {slot.st_end_time}</Label>
//               </Card>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Form for adding new time slots */}
//       <Form {...form}>
//         <form className="space-y-4">
//           <div className="flex flex-col gap-4 md:flex-row justify-center items-center w-full">
//             <FormDateTimeInput
//               control={form.control}
//               label="Start Time"
//               type="time"
//               name="start_time"
//             />
//             <FormDateTimeInput
//               control={form.control}
//               label="End Time"
//               type="time"
//               name="end_time"
//             />
//           </div>
//           <div className='flex flex-col sm:flex-row justify-center items-center gap-2'>
//             <Button 
//               type="button"  
//               variant="outline" 
//               onClick={handleAddTimeSlot}
//               disabled={!form.formState.isValid}
//             >
//               <Plus size={16} className="mr-2" /> 
//               Add Time Slot
//             </Button>
//             <Button 
//               type="button" 
//               onClick={handleSubmitAll} 
//               disabled={isPending || newTimeSlots.length === 0}
//             >
//               {isPending ? "Saving..." : "Save All Time Slots"}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }

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
import { useAddSummonTimeSlots } from "./queries/summonInsertQueries";

type TimeSlot = {
  id: number;
  displayStart: string; // Formatted for display (12-hour)
  displayEnd: string;   // Formatted for display (12-hour)
  rawStart: string;    // Raw value from input (24-hour)
  rawEnd: string;      // Raw value from input (24-hour)
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
      sd_id: String(sd_id)
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
      st_start_time: slot.rawStart, // Using raw 24-hour value
      st_end_time: slot.rawEnd      // Using raw 24-hour value
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