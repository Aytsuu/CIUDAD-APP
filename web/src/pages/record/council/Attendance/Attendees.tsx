// import { Label } from "@/components/ui/label";
// import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button/button";
// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import MarkAttendeesSchema from "@/form-schema/council/markAttendees";
// import { useGetAttendees } from "../Calendar/queries/councilEventfetchqueries";
// import { useAddAttendee } from "../Calendar/queries/councilEventaddqueries";
// import { useUpdateAttendee } from "../Calendar/queries/councilEventupdatequeries";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { AttendeesProps } from "../Calendar/councilEventTypes";

// function Attendees({ isEditMode, onEditToggle, onSave, ceId }: AttendeesProps) {
//   if (!ceId) {
//     return <div className="w-full h-full p-4 text-center text-red-500">Error: ceId is undefined</div>;
//   }

//   const { data: eventAttendees = [], isLoading, error } = useGetAttendees(ceId);
//   const addAttendee = useAddAttendee();
//   const updateAttendee = useUpdateAttendee();
//   const [isSubmitting, _setIsSubmitting] = useState(false);

//   if (error) {
//     return <div className="w-full h-full p-4 text-center text-red-500">Error loading attendees: {error.message}</div>;
//   }

//   const form = useForm<z.infer<typeof MarkAttendeesSchema>>({
//     resolver: zodResolver(MarkAttendeesSchema),
//     defaultValues: {
//       attendees: [],
//     },
//   });

//   useEffect(() => {
//     if (isLoading || !eventAttendees) return;
//     if (eventAttendees.length > 0) {
//       const presentAttendees = eventAttendees
//         .filter((attendee) => attendee.atn_present_or_absent === "Present")
//         .map((attendee) => attendee.atn_name);
//       form.reset({ attendees: presentAttendees });
//     }
//   }, [eventAttendees, form, isLoading]);

// async function onSubmit(values: z.infer<typeof MarkAttendeesSchema>) {
//     try {
//       const attendees = values.attendees || [];
      
//       // Create an array of promises for all mutations
//       const mutationPromises = eventAttendees.map(async (attendee) => {
//         const isPresent = attendees.includes(attendee.atn_name);
//         const status = isPresent ? "Present" : "Absent";
        
//         if (attendee.atn_id) {
//           return updateAttendee.mutateAsync({
//             atn_id: attendee.atn_id,
//             attendeeInfo: {
//               atn_present_or_absent: status,
//             },
//           });
//         } else {
//           return addAttendee.mutateAsync({
//             atn_name: attendee.atn_name,
//             atn_designation: attendee.atn_designation || "No Designation",
//             atn_present_or_absent: status,
//             ce_id: ceId,
//             staff_id: attendee.staff_id || null,
//           });
//         }
//       });

//       // Wait for all mutations to complete
//       await Promise.all(mutationPromises);
      
//       // Only call onSave if all mutations were successful
//       onSave();
//     } catch (error) {
//     }
//   }

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       const allAttendeeNames = eventAttendees.map((attendee) => attendee.atn_name);
//       form.setValue("attendees", allAttendeeNames);
//     } else {
//       form.setValue("attendees", []);
//     }
//   };

//   const selectedAttendees = form.watch("attendees") ?? [];
//   const isAllSelected = selectedAttendees.length === eventAttendees.length && eventAttendees.length > 0;

//   if (isLoading) {
//     return <div className="w-full h-full p-4 text-center">Loading attendees...</div>;
//   }

//   return (
//     <div className="w-full h-auto flex flex-col">
//       <div className="p-4 flex-grow">
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             {eventAttendees.length > 0 && (
//               <div className="flex items-center space-x-3 border border-gray-opacity p-1.5 rounded-sm">
//                 <Checkbox
//                   id="select-all"
//                   className="h-5 w-5"
//                   checked={isAllSelected}
//                   onCheckedChange={(checked) => handleSelectAll(!!checked)}
//                   disabled={!isEditMode}
//                 />
//                 <Label htmlFor="select-all" className="cursor-pointer">
//                   Select All
//                 </Label>
//               </div>
//             )}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
//               {eventAttendees.length > 0 ? (
//                 eventAttendees.map((attendee, index) => (
//                   <FormField
//                     key={attendee.atn_id || index}
//                     control={form.control}
//                     name="attendees"
//                     render={({ field }) => {
//                       const selectedAttendees = field.value ?? [];
//                       return (
//                         <FormItem className="flex flex-row items-start space-x-3 space-y-0.5 border border-gray-opacity p-1.5 rounded-sm">
//                           <FormControl>
//                             <Checkbox
//                               id={`attendee-${attendee.atn_id || index}`}
//                               className="h-5 w-5"
//                               checked={selectedAttendees.includes(attendee.atn_name)}
//                               onCheckedChange={(checked) => {
//                                 const newValue = checked
//                                   ? [...selectedAttendees, attendee.atn_name]
//                                   : selectedAttendees.filter((name: string) => name !== attendee.atn_name);
//                                 field.onChange(newValue);
//                               }}
//                               disabled={!isEditMode}
//                             />
//                           </FormControl>
//                           <FormLabel
//                             htmlFor={`attendee-${attendee.atn_id || index}`}
//                             className="cursor-pointer whitespace-normal break-words flex-1"
//                             style={{ wordBreak: "break-all" }}
//                           >
//                             {attendee.atn_name}
//                             {attendee.atn_designation && (
//                               <span className="block text-xs text-gray-500">
//                                 {attendee.atn_designation}
//                               </span>
//                             )}
//                           </FormLabel>
//                         </FormItem>
//                       );
//                     }}
//                   />
//                 ))
//               ) : (
//                 <div className="col-span-2 text-center py-4 text-gray-500">
//                   No attendees found for this event
//                 </div>
//               )}
//             </div>
//           </form>
//         </Form>

//         {eventAttendees.length > 0 && (
//           <div className="flex justify-end pt-10">
//             {isEditMode ? (
//                <ConfirmationModal
//               trigger={
//                 <Button className="w-full sm:w-20" disabled={isSubmitting}>
//                   {isSubmitting ? "Saving..." : "Save"}
//                 </Button>
//               }
//               title="Confirm Attendance"
//               description="Are you sure you want to save these attendance changes?"
//               actionLabel="Confirm"
//               onClick={form.handleSubmit(onSubmit)}
//             />
//             ) : (
//               <Button
//                 type="button"
//                 className="w-full sm:w-20"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   onEditToggle(true);
//                 }}
//               >
//                 Edit
//               </Button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Attendees;