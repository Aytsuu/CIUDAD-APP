// import { useState, useEffect } from "react";
// import { Box, Container, CardHeader } from "@mui/material";
// import { Button } from "@/components/ui/button/button";
// import { Calendar } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Card, CardContent } from "@/components/ui/card";
// import { useAddSummonDates } from "../queries/summonInsertQueries";
// import { toast } from "sonner";
// import { CircleCheck, Plus, CalendarIcon, Clock, Trash2, Info } from "lucide-react";
// import { useGetSummonDates, useGetSummonTimeSlots } from "../queries/summonFetchQueries";
// import { localDateFormatter } from "@/helpers/localDateFormatter";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import SummonTimeSlot from "./summonTimeSlot";
// import { Label } from "@/components/ui/label";
// import { formatTime } from "@/helpers/timeFormatter";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { useDeleteSummonTime } from "../queries/summonDeleteQueries";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatDate } from "@/helpers/dateHelper";
// import { localizer } from "@/helpers/calendarDateHelper";

// const SummonCalendar = () => {
//   const [selectedDates, setSelectedDates] = useState<Date[]>([]);
//   const [editMode, setEditMode] = useState(false);
//   const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([]);
//   const [selectedDateForTimeSlots, setSelectedDateForTimeSlots] = useState<Date | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [currentSdId, setCurrentSdId] = useState<number | undefined>(undefined);
  
//   // Quarterly editing states
//   const [nextQuarterDates, setNextQuarterDates] = useState<Date[]>([]);
//   const [currentQuarterInfo, setCurrentQuarterInfo] = useState<{ quarter: number; year: number; months: number[] } | null>(null);
//   const [hasChanges, setHasChanges] = useState(false);

//   const onSuccess = () => {
//     toast.success("Dates saved successfully!", {
//       icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//       duration: 2000,
//     });
//   };

//   const { mutate: addDate, isPending: isPendingAdd } = useAddSummonDates(onSuccess);
//   const { data: summonDates = [], isLoading: isLoadingDates } = useGetSummonDates();
//   const { mutate: deleteTimeSlot } = useDeleteSummonTime();

//   // Fetch time slots only when we have a valid sd_id
//   const {
//     data: fetchedTimeSlots = [],
//     isLoading: isLoadingTimeSlots,
//     refetch: refetchTimeSlots,
//   } = useGetSummonTimeSlots(currentSdId || 0);

//   // Calculate next quarter dates
//   useEffect(() => {
//     const calculateNextQuarter = () => {
//       const today = new Date();
//       const currentMonth = today.getMonth(); // 0-11
//       const currentYear = today.getFullYear();
      
//       // Determine current quarter and next quarter
//       let nextQuarter: number;
//       let nextYear: number;
//       let nextQuarterMonths: number[];
      
//       const quarterMonths = [
//         [0, 1, 2],   // Q1: Jan, Feb, Mar
//         [3, 4, 5],   // Q2: Apr, May, Jun
//         [6, 7, 8],   // Q3: Jul, Aug, Sep
//         [9, 10, 11], // Q4: Oct, Nov, Dec
//       ];
      
//       // Find current quarter
//       let currentQuarter = 1;
//       for (let i = 0; i < quarterMonths.length; i++) {
//         if (quarterMonths[i].includes(currentMonth)) {
//           currentQuarter = i + 1;
//           break;
//         }
//       }
      
//       // Calculate next quarter
//       if (currentQuarter === 4) {
//         nextQuarter = 1;
//         nextYear = currentYear + 1;
//       } else {
//         nextQuarter = currentQuarter + 1;
//         nextYear = currentYear;
//       }
      
//       nextQuarterMonths = quarterMonths[nextQuarter - 1];
      
//       // Generate all weekdays for the next quarter
//       const dates: Date[] = [];
      
//       nextQuarterMonths.forEach(month => {
//         const firstDay = new Date(nextYear, month, 1);
//         const lastDay = new Date(nextYear, month + 1, 0);
        
//         for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
//           const date = new Date(nextYear, month, day);
//           // Only include weekdays (Monday to Friday) and future dates
//           if (date.getDay() >= 1 && date.getDay() <= 5 && date >= today) {
//             dates.push(date);
//           }
//         }
//       });
      
//       setNextQuarterDates(dates);
//       setCurrentQuarterInfo({
//         quarter: nextQuarter,
//         year: nextYear,
//         months: nextQuarterMonths
//       });
//     };
    
//     calculateNextQuarter();
//   }, []);

//   // Update currentSdId when selected date changes
//   useEffect(() => {
//     if (selectedDateForTimeSlots) {
//       const found = summonDates.find((item) => {
//         const dbDate = new Date(item.sd_date);
//         return (
//           dbDate.getFullYear() === selectedDateForTimeSlots.getFullYear() &&
//           dbDate.getMonth() === selectedDateForTimeSlots.getMonth() &&
//           dbDate.getDate() === selectedDateForTimeSlots.getDate()
//         );
//       });
//       setCurrentSdId(found?.sd_id);
//     } else {
//       setCurrentSdId(undefined);
//     }
//   }, [selectedDateForTimeSlots, summonDates]);

//   // Initialize selected dates from summonDates
//   useEffect(() => {
//     if (summonDates.length > 0) {
//       const dates = summonDates.map((item) => {
//         const [year, month, day] = item.sd_date.split("-").map(Number);
//         return new Date(year, month - 1, day);
//       });
//       setSelectedDates(dates);
//       setTempSelectedDates(dates);
//     }
//   }, [summonDates]);

//   // Check for changes when in edit mode
//   useEffect(() => {
//     if (editMode) {
//       const hasUnsavedChanges = 
//         tempSelectedDates.length !== selectedDates.length ||
//         tempSelectedDates.some(tempDate => 
//           !selectedDates.some(selectedDate => 
//             selectedDate.getTime() === tempDate.getTime()
//           )
//         ) ||
//         selectedDates.some(selectedDate => 
//           !tempSelectedDates.some(tempDate => 
//             tempDate.getTime() === selectedDate.getTime()
//           )
//         );
      
//       setHasChanges(hasUnsavedChanges);
//     }
//   }, [tempSelectedDates, selectedDates, editMode]);

//   const handleTimeSlotSuccess = () => {
//     setIsDialogOpen(false);
//     if (currentSdId) {
//       refetchTimeSlots();
//     }
//   };

//   const isDateDisabled = (date: Date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     return date < today;
//   };

//   const isDateInNextQuarter = (date: Date) => {
//     if (!currentQuarterInfo) return false;
    
//     return (
//       date.getFullYear() === currentQuarterInfo.year &&
//       currentQuarterInfo.months.includes(date.getMonth())
//     );
//   };

//   // Check if time slot editing is restricted to next quarter only
//   const isTimeSlotEditingRestricted = (): boolean => {
//     return !!(editMode && selectedDateForTimeSlots && !isDateInNextQuarter(selectedDateForTimeSlots));
//   };
//   const handleDateSelection = (date: Date) => {
//     if (isDateDisabled(date)) return;

//     if (!editMode) {
//       const isSelectedDate = selectedDates.some(
//         (d) =>
//           d.getFullYear() === date.getFullYear() &&
//           d.getMonth() === date.getMonth() &&
//           d.getDate() === date.getDate()
//       );

//       if (isSelectedDate) {
//         setSelectedDateForTimeSlots(date);
//       } else {
//         toast.info("Enable this date to view and add time slots.", {
//           duration: 1000
//         });
//       }
//     } else {
//       // In edit mode, only allow selection within next quarter
//       setTempSelectedDates((prev) => {
//         const isSelected = prev.some(
//           (d) =>
//             d.getFullYear() === date.getFullYear() &&
//             d.getMonth() === date.getMonth() &&
//             d.getDate() === date.getDate()
//         );

//         return isSelected
//           ? prev.filter(
//               (d) =>
//                 !(
//                   d.getFullYear() === date.getFullYear() &&
//                   d.getMonth() === date.getMonth() &&
//                   d.getDate() === date.getDate()
//                 )
//             )
//           : [...prev, new Date(date)];
//       });
//     }
//   };

//   const handleEditClick = () => {
//     setTempSelectedDates([...selectedDates]);
//     setEditMode(true);
//     setHasChanges(false);
//   };

//   const handleSave = () => {
//     if (!hasChanges) {
//       toast.info("No changes to save", {
//         description: "You haven't made any changes to the dates.",
//         duration: 2000,
//       });
//       setEditMode(false);
//       return;
//     }

//     // Filter to only include dates from the next quarter in the payload
//     const nextQuarterTempDates = tempSelectedDates.filter(date => 
//       isDateInNextQuarter(date) || selectedDates.some(
//         sd => sd.getFullYear() === date.getFullYear() &&
//               sd.getMonth() === date.getMonth() &&
//               sd.getDate() === date.getDate()
//       )
//     );

//     // Prepare the payloads
//     const newDates: Date[] = [];
//     const oldDates: { sd_id: number; sd_is_checked: boolean }[] = [];

//     nextQuarterTempDates.forEach((date) => {
//       // Check if this date exists in the stored dates
//       const existingDate = summonDates.find((item) => {
//         const dbDate = new Date(item.sd_date);
//         return (
//           dbDate.getFullYear() === date.getFullYear() &&
//           dbDate.getMonth() === date.getMonth() &&
//           dbDate.getDate() === date.getDate()
//         );
//       });

//       if (existingDate) {
//         oldDates.push({
//           sd_id: existingDate.sd_id,
//           sd_is_checked: true, // Since it's in tempSelectedDates, it's checked
//         });
//       } else {
//         // New date - add to newDates payload
//         newDates.push(date);
//       }
//     });

//     // Also need to handle dates that were unchecked (exist in DB but not in tempSelectedDates)
//     // But only for dates in the next quarter
//     summonDates.forEach((dbDate) => {
//       const date = new Date(dbDate.sd_date);
//       const isStillSelected = nextQuarterTempDates.some(
//         (d) =>
//           d.getFullYear() === date.getFullYear() &&
//           d.getMonth() === date.getMonth() &&
//           d.getDate() === date.getDate()
//       );

//       if (!isStillSelected && isDateInNextQuarter(date)) {
//         oldDates.push({
//           sd_id: dbDate.sd_id,
//           sd_is_checked: false, 
//         });
//       }
//     });

//     // Format newDates for API
//     const formattedNewDates = newDates.map((date) => localDateFormatter(date));

//     addDate(
//       {
//         newDates: formattedNewDates,
//         oldDates: oldDates,
//       },
//       {
//         onSuccess: () => {
//           setSelectedDates([...tempSelectedDates]);
//           setEditMode(false);
//           setHasChanges(false);
          
//           const addedCount = newDates.length;
//           const removedCount = oldDates.filter(d => !d.sd_is_checked).length;
          
//           if (addedCount > 0 || removedCount > 0) {
//             toast.success("Calendar updated successfully", {
//               description: `Added ${addedCount} new dates and removed ${removedCount} dates.`,
//               duration: 3000,
//             });
//           }
//         },
//         onError: () => {
//           toast.error("Failed to save changes", {
//             description: "Please try again. If the problem persists, contact support.",
//             duration: 4000,
//           });
//         }
//       }
//     );
//   };

//   const handleCancel = () => {
//     setEditMode(false);
//     setHasChanges(false);
//   };

//   const handleDeleteTimeSlot = (st_id: number) => {
//     if (editMode && selectedDateForTimeSlots && !isDateInNextQuarter(selectedDateForTimeSlots)) {
//       toast.info(`Cannot modify time slots outside Q${currentQuarterInfo?.quarter} ${currentQuarterInfo?.year}`, {
//         description: "Time slot editing is restricted to the next quarter during edit mode.",
//         duration: 3000,
//       });
//       return;
//     }
//     deleteTimeSlot(st_id);
//   };

//   const handleAddTimeSlotClick = () => {
//     if (isTimeSlotEditingRestricted()) {
//       toast.info(`Cannot add time slots outside Q${currentQuarterInfo?.quarter} ${currentQuarterInfo?.year}`, {
//         description: "Time slot editing is restricted to the next quarter during edit mode.",
//         duration: 3000,
//       });
//       return;
//     }
//     setIsDialogOpen(true);
//   };

//   const renderDateCell = (date: Date) => {
//     const isSelected = editMode
//       ? tempSelectedDates.some(
//           (d) =>
//             d.getFullYear() === date.getFullYear() &&
//             d.getMonth() === date.getMonth() &&
//             d.getDate() === date.getDate()
//         )
//       : selectedDates.some(
//           (d) =>
//             d.getFullYear() === date.getFullYear() &&
//             d.getMonth() === date.getMonth() &&
//             d.getDate() === date.getDate()
//         );
    
//     const isDisabled = isDateDisabled(date);
//     const isInNextQuarter = isDateInNextQuarter(date);
//     const isEditMode = editMode;

//     // In edit mode, dates outside next quarter should not be selectable
//     const isSelectable = !isDisabled && (!isEditMode || isInNextQuarter);

//     return (
//       <div
//         className={`absolute inset-0 flex justify-between items-start p-1 rounded ${
//           isSelectable ? "cursor-pointer" : "cursor-not-allowed"
//         } ${
//           isSelected ? "bg-indigo-100" : 
//           isInNextQuarter && isEditMode ? "bg-green-50 border border-green-200" : 
//           ""
//         }`}
//         onClick={() => isSelectable && handleDateSelection(date)}
//       >
//         {editMode && !isDisabled && isInNextQuarter && (
//           <Checkbox 
//             checked={isSelected} 
//             onChange={() => handleDateSelection(date)} 
//             disabled={isPendingAdd} 
//             className="mt-1"
//           />
//         )}
//         <span
//           className={`ml-auto mt-1 text-[0.875rem] ${
//             isSelected ? "font-bold text-indigo-700" : 
//             isInNextQuarter && isEditMode ? "text-green-700 font-medium" : 
//             "font-normal"
//           } ${!isSelectable ? "text-gray-400" : ""}`}
//         ></span>
//       </div>
//     );
//   };

//   const dayHeaderFormat = (date: Date) => {
//     return date.toLocaleString('en-US', { weekday: 'short' });
//   };

//   if (isLoadingDates) {
//     return (
//       <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
//         <Container>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <div className="lg:col-span-2">
//               <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <span className="text-lg font-semibold">Summon Dates</span>
//                   <Skeleton className="rounded w-[100px] h-[36px]" />
//                 </div>
//                 <Skeleton className="rounded w-full h-[900px]" />
//               </div>
//             </div>
//             <div className="lg:col-span-1">
//               <div className="bg-white rounded-xl shadow p-6">
//                 <Skeleton className="rounded w-full h-[400px]" />
//               </div>
//             </div>
//           </div>
//         </Container>
//       </Box>
//     );
//   }
//   return (
//       <div className="w-full">
//         {/* Header Section */}
//         <div className="flex flex-col gap-3 mb-3">
//           <div className="flex flex-row gap-4">
//             <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//               Summon Calendar
//             </h1>
//           </div>
//           <p className="text-xs sm:text-sm text-darkGray">
//             Manage summon schedules, timeslots, and view scheduled sessions.
//           </p>
//         </div>
//         <hr className="border-gray mb-7 sm:mb-8" />

//         {/* Scrollable Content Section */}
//         <div className="overflow-y-auto" style={{ height: 'calc(100vh - 150px)' }}>
//           <Box className="mb-2 flex-grow py-1" component="main">
//             <Container>
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                 {/* Calendar Area */}
//                 <div className="lg:col-span-2">
//                   <Card className="bg-white rounded-xl shadow">
//                     <CardHeader 
//                       className="flex items-center justify-between px-6 py-4"
//                       title="Summon Dates"
//                       action={
//                         editMode ? (
//                           <div className="flex flex-col sm:flex-row gap-3">
//                             <div className="flex gap-2">
//                               <Button onClick={handleSave} disabled={isPendingAdd}>
//                                 {isPendingAdd ? "Saving..." : "Save Changes"}
//                               </Button>
//                             </div>
//                             <Button variant="outline" onClick={handleCancel} disabled={isPendingAdd}>
//                               Cancel
//                             </Button>
//                           </div>
//                         ) : (
//                           <Button onClick={handleEditClick}>
//                             Edit Next Quarter (Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year})
//                           </Button>
//                         )
//                       }
//                     />
//                     <CardContent>
//                       {/* Informative Messages Section - Only Edit Mode */}
//                       {editMode && (
//                         <div className="space-y-3 mb-4">
//                           <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                             <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
//                             <div className="text-sm text-blue-800">
//                               <p className="font-medium mb-1">Editing Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year}</p>
//                               <ul className="list-disc list-inside space-y-1 text-xs">
//                                 <li>Only dates in the <strong>next quarter</strong> can be modified</li>
//                                 <li>Time slot management is also restricted to next quarter dates</li>
//                                 <li>Green-highlighted dates are available for editing</li>
//                                 <li>Use checkboxes to select/deselect available dates</li>
//                               </ul>
//                             </div>
//                           </div>
                          
//                           <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
//                             <div className="flex items-center gap-1">
//                               <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
//                               <span>Available for editing</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <div className="w-3 h-3 bg-indigo-100 rounded"></div>
//                               <span>Selected date</span>
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       <Calendar 
//                         localizer={localizer} 
//                         events={[]} 
//                         startAccessor="start" 
//                         endAccessor="end" 
//                         defaultView="month" 
//                         selectable={false}
//                         formats={{
//                           dayHeaderFormat: dayHeaderFormat,
//                         }}
//                         components={{
//                           dateCellWrapper: ({ children, value }) => (
//                             <div className="relative h-full w-full">
//                               {children}
//                               {renderDateCell(value)}
//                             </div>
//                           ),
//                         }}
//                         style={{ height: 800, width: "100%" }}
//                       />
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Time Slots Management Area */}
//                 <div className="lg:col-span-1">
//                   <Card className="h-fit sticky top-4 bg-white rounded-xl shadow">
//                     <CardHeader
//                       title={
//                         <div className="flex items-center gap-2">
//                           <Clock size={20} />
//                           <span>Time Slots</span>
//                         </div>
//                       }
//                       className="flex items-center justify-between px-6 py-4"
//                     />
//                     <CardContent className="space-y-4">
//                       {/* Viewing Mode Information - Moved here from calendar */}
//                       {!editMode && (
//                         <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
//                           <Info size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
//                           <div className="text-sm text-gray-700">
//                             <p className="font-medium mb-1">Viewing Mode</p>
//                             <ul className="list-disc list-inside space-y-1 text-xs">
//                               <li>Click on <strong>enabled dates</strong> (highlighted in blue) to manage time slots</li>
//                               <li>Use the edit button to modify dates for the next quarter</li>
//                               <li>Only future dates can be selected and managed</li>
//                               <li>Current focus: Preparing Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year} schedule</li>
//                             </ul>
//                           </div>
//                         </div>
//                       )}

//                       {selectedDateForTimeSlots ? (
//                         <>
//                           <div className="text-sm font-medium text-center p-3 bg-blue-50 rounded-lg border">
//                             <div className="flex items-center justify-center gap-2 text-blue-700">
//                               <CalendarIcon size={16} />
//                               <span>{selectedDateForTimeSlots.toLocaleString('default', { weekday: 'long' })}</span>
//                             </div>
//                             <div className="text-lg font-semibold text-blue-800 mt-1">
//                               {formatDate(selectedDateForTimeSlots, "long")}
//                             </div>
//                             {isDateInNextQuarter(selectedDateForTimeSlots) ? (
//                               <div className="text-xs text-green-600 mt-1 bg-green-50 px-2 py-1 rounded">
//                                 Part of Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year} - Editable
//                               </div>
//                             ) : null}
//                           </div>

//                           {/* Existing Time Slots */}
//                           <div>
//                             <Label className="text-sm font-medium">Available Time Slots</Label>
//                             {isLoadingTimeSlots ? (
//                               <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
//                                 {[1, 2, 3].map((_, index) => (
//                                   <div key={index} className="p-3 border rounded-lg animate-pulse">
//                                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                                     <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
//                                   </div>
//                                 ))}
//                               </div>
//                             ) : (
//                               <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
//                                 {fetchedTimeSlots.filter(slot => slot.sd_id === currentSdId).length === 0 ? (
//                                   <div className="text-center py-8">
//                                     <Clock size={32} className="mx-auto text-gray-400 mb-2" />
//                                     <p className="text-sm text-gray-500">No time slots available</p>
//                                     <p className="text-xs text-gray-400">
//                                       {isTimeSlotEditingRestricted() 
//                                         ? "Time slot editing restricted during quarterly edit mode"
//                                         : "Add your first time slot below"
//                                       }
//                                     </p>
//                                   </div>
//                                 ) : (
//                                   fetchedTimeSlots
//                                     .filter(slot => slot.sd_id === currentSdId)
//                                     .map(slot => (
//                                       <div
//                                         key={slot.st_id}
//                                         className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
//                                           slot.st_is_booked
//                                             ? "bg-red-50 border-red-200 hover:bg-red-100"
//                                             : "bg-green-50 border-green-200 hover:bg-green-100"
//                                         } ${isDateInNextQuarter(selectedDateForTimeSlots) ? "border-l-4 border-l-green-400" : ""}`}
//                                       >
//                                         <div className="flex-1">
//                                           <div className="text-sm font-medium">
//                                             {formatTime(slot.st_start_time)}
//                                           </div>
//                                           <div className={`text-xs ${slot.st_is_booked ? "text-red-600" : "text-green-600"}`}>
//                                             {slot.st_is_booked ? "Booked" : "Available"}
//                                           </div>
//                                           {isDateInNextQuarter(selectedDateForTimeSlots) && (
//                                             <div className="text-xs text-green-500 mt-1">
//                                               Q{currentQuarterInfo?.quarter} Schedule
//                                             </div>
//                                           )}
//                                         </div>
//                                         <div className="flex gap-1">
//                                           <ConfirmationModal
//                                             title="Confirm Delete Time Slot"
//                                             description={
//                                               isTimeSlotEditingRestricted()
//                                                 ? "Time slot editing is restricted to next quarter dates during edit mode."
//                                                 : "Are you sure you want to delete this time slot? This action cannot be undone."
//                                             }
//                                             trigger={
//                                               <Button 
//                                                 variant="ghost" 
//                                                 size="sm" 
//                                                 disabled={slot.st_is_booked || isTimeSlotEditingRestricted()}
//                                               >
//                                                 <Trash2 size={12} color={isTimeSlotEditingRestricted() ? "gray" : "red"} />
//                                               </Button>
//                                             }
//                                             onClick={() => handleDeleteTimeSlot(Number(slot.st_id))}
//                                             actionLabel="Confirm"
//                                           />
//                                         </div>
//                                       </div>
//                                     ))
//                                 )}
//                               </div>
//                             )}
//                           </div>

//                           {/* Add New Time Slot */}
//                           <Button 
//                             className="w-full mt-3" 
//                             variant="outline"
//                             onClick={handleAddTimeSlotClick}
//                             disabled={!selectedDateForTimeSlots || !isDateInNextQuarter(selectedDateForTimeSlots)}
//                           >
//                             <Plus size={14} className="mr-2" /> 
//                             Add Time Slot
//                           </Button>

//                           <DialogLayout
//                             trigger={<div style={{ display: 'none' }} />} // Hidden trigger since we're using custom button
//                             title={`Add new time slots for ${formatDate(selectedDateForTimeSlots, "long")}`}
//                             description={
//                               isTimeSlotEditingRestricted()
//                                 ? `Time slot editing is restricted to Q${currentQuarterInfo?.quarter} dates during edit mode.`
//                                 : "Add or manage time slots for the selected date"
//                             }
//                             mainContent={
//                               <SummonTimeSlot
//                                 sd_id={currentSdId}
//                                 onSuccess={handleTimeSlotSuccess}
//                               />
//                             }
//                             isOpen={isDialogOpen}
//                             onOpenChange={setIsDialogOpen}
//                           />
//                         </>
//                       ) : (
//                         <div className="text-center py-12">
//                           <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
//                           <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Date</h3>
//                           <p className="text-sm text-gray-500 mb-4">
//                             {editMode 
//                               ? "Click on highlighted green dates to select/deselect them for the next quarter"
//                               : "Click on an enabled date from the calendar to view and manage time slots"
//                             }
//                           </p>
//                           <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
//                             <p className="font-medium mb-1">💡 Tip:</p>
//                             <p>
//                               {editMode 
//                                 ? `During edit mode, time slot management is restricted to Q${currentQuarterInfo?.quarter} dates only.`
//                                 : "Only dates that are enabled (highlighted) can have time slots"
//                               }
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </Container>
//           </Box>
//         </div>
//       </div>
//     );
//   // return (
//   //   <div className="w-full">
//   //     {/* Header Section */}
//   //     <div className="flex flex-col gap-3 mb-3">
//   //       <div className="flex flex-row gap-4">
//   //         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//   //           Summon Calendar
//   //         </h1>
//   //       </div>
//   //       <p className="text-xs sm:text-sm text-darkGray">
//   //         Manage summon schedules, timeslots, and view scheduled sessions.
//   //       </p>
//   //     </div>
//   //     <hr className="border-gray mb-7 sm:mb-8" />

//   //     {/* Scrollable Content Section */}
//   //     <div className="overflow-y-auto" style={{ height: 'calc(100vh - 150px)' }}>
//   //       <Box className="mb-2 flex-grow py-1" component="main">
//   //         <Container>
//   //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//   //             {/* Calendar Area */}
//   //             <div className="lg:col-span-2">
//   //               <Card className="bg-white rounded-xl shadow">
//   //                 <CardHeader 
//   //                   className="flex items-center justify-between px-6 py-4"
//   //                   title="Summon Dates"
//   //                   action={
//   //                     editMode ? (
//   //                       <div className="flex flex-col sm:flex-row gap-3">
//   //                         <div className="flex gap-2">
//   //                           <Button onClick={handleSave} disabled={isPendingAdd}>
//   //                             {isPendingAdd ? "Saving..." : "Save Changes"}
//   //                           </Button>
//   //                         </div>
//   //                         <Button variant="outline" onClick={handleCancel} disabled={isPendingAdd}>
//   //                           Cancel
//   //                         </Button>
//   //                       </div>
//   //                     ) : (
//   //                       <Button onClick={handleEditClick}>
//   //                         Edit Next Quarter (Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year})
//   //                       </Button>
//   //                     )
//   //                   }
//   //                 />
//   //                 <CardContent>
//   //                   {/* Informative Messages Section */}
//   //                   <div className="space-y-3 mb-4">
//   //                     {editMode ? (
//   //                       <>
//   //                         <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//   //                           <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
//   //                           <div className="text-sm text-blue-800">
//   //                             <p className="font-medium mb-1">Editing Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year}</p>
//   //                             <ul className="list-disc list-inside space-y-1 text-xs">
//   //                               <li>Only dates in the <strong>next quarter</strong> can be modified</li>
//   //                               <li>Time slot management is also restricted to next quarter dates</li>
//   //                               <li>Green-highlighted dates are available for editing</li>
//   //                               <li>Use checkboxes to select/deselect available dates</li>
//   //                             </ul>
//   //                           </div>
//   //                         </div>
                          
//   //                         <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
//   //                           <div className="flex items-center gap-1">
//   //                             <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
//   //                             <span>Available for editing</span>
//   //                           </div>
//   //                           <div className="flex items-center gap-1">
//   //                             <div className="w-3 h-3 bg-indigo-100 rounded"></div>
//   //                             <span>Selected date</span>
//   //                           </div>
//   //                         </div>
//   //                       </>
//   //                     ) : (
//   //                       <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
//   //                         <Info size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
//   //                         <div className="text-sm text-gray-700">
//   //                           <p className="font-medium mb-1">Viewing Mode</p>
//   //                           <ul className="list-disc list-inside space-y-1 text-xs">
//   //                             <li>Click on <strong>enabled dates</strong> (highlighted in blue) to manage time slots</li>
//   //                             <li>Use the edit button to modify dates for the next quarter</li>
//   //                             <li>Only future dates can be selected and managed</li>
//   //                             <li>Current focus: Preparing Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year} schedule</li>
//   //                           </ul>
//   //                         </div>
//   //                       </div>
//   //                     )}
//   //                   </div>

//   //                   <Calendar 
//   //                     localizer={localizer} 
//   //                     events={[]} 
//   //                     startAccessor="start" 
//   //                     endAccessor="end" 
//   //                     defaultView="month" 
//   //                     selectable={false}
//   //                     formats={{
//   //                       dayHeaderFormat: dayHeaderFormat,
//   //                     }}
//   //                     components={{
//   //                       dateCellWrapper: ({ children, value }) => (
//   //                         <div className="relative h-full w-full">
//   //                           {children}
//   //                           {renderDateCell(value)}
//   //                         </div>
//   //                       ),
//   //                     }}
//   //                     style={{ height: 800, width: "100%" }}
//   //                   />
//   //                 </CardContent>
//   //               </Card>
//   //             </div>

//   //             {/* Time Slots Management Area */}
//   //             <div className="lg:col-span-1">
//   //               <Card className="h-fit sticky top-4 bg-white rounded-xl shadow">
//   //                 <CardHeader
//   //                   title={
//   //                     <div className="flex items-center gap-2">
//   //                       <Clock size={20} />
//   //                       <span>Time Slots</span>
//   //                     </div>
//   //                   }
//   //                   className="flex items-center justify-between px-6 py-4"
//   //                 />
//   //                 <CardContent className="space-y-4">
//   //                   {selectedDateForTimeSlots ? (
//   //                     <>
//   //                       <div className="text-sm font-medium text-center p-3 bg-blue-50 rounded-lg border">
//   //                         <div className="flex items-center justify-center gap-2 text-blue-700">
//   //                           <CalendarIcon size={16} />
//   //                           <span>{selectedDateForTimeSlots.toLocaleString('default', { weekday: 'long' })}</span>
//   //                         </div>
//   //                         <div className="text-lg font-semibold text-blue-800 mt-1">
//   //                           {formatDate(selectedDateForTimeSlots, "long")}
//   //                         </div>
//   //                         {isDateInNextQuarter(selectedDateForTimeSlots) ? (
//   //                           <div className="text-xs text-green-600 mt-1 bg-green-50 px-2 py-1 rounded">
//   //                             Part of Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year} - Editable
//   //                           </div>
//   //                         ) : null}
//   //                       </div>

//   //                       {/* Existing Time Slots */}
//   //                       <div>
//   //                         <Label className="text-sm font-medium">Available Time Slots</Label>
//   //                         {isLoadingTimeSlots ? (
//   //                           <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
//   //                             {[1, 2, 3].map((_, index) => (
//   //                               <div key={index} className="p-3 border rounded-lg animate-pulse">
//   //                                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//   //                                 <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
//   //                               </div>
//   //                             ))}
//   //                           </div>
//   //                         ) : (
//   //                           <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
//   //                             {fetchedTimeSlots.filter(slot => slot.sd_id === currentSdId).length === 0 ? (
//   //                               <div className="text-center py-8">
//   //                                 <Clock size={32} className="mx-auto text-gray-400 mb-2" />
//   //                                 <p className="text-sm text-gray-500">No time slots available</p>
//   //                                 <p className="text-xs text-gray-400">
//   //                                   {isTimeSlotEditingRestricted() 
//   //                                     ? "Time slot editing restricted during quarterly edit mode"
//   //                                     : "Add your first time slot below"
//   //                                   }
//   //                                 </p>
//   //                               </div>
//   //                             ) : (
//   //                               fetchedTimeSlots
//   //                                 .filter(slot => slot.sd_id === currentSdId)
//   //                                 .map(slot => (
//   //                                   <div
//   //                                     key={slot.st_id}
//   //                                     className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
//   //                                       slot.st_is_booked
//   //                                         ? "bg-red-50 border-red-200 hover:bg-red-100"
//   //                                         : "bg-green-50 border-green-200 hover:bg-green-100"
//   //                                     } ${isDateInNextQuarter(selectedDateForTimeSlots) ? "border-l-4 border-l-green-400" : ""}`}
//   //                                   >
//   //                                     <div className="flex-1">
//   //                                       <div className="text-sm font-medium">
//   //                                         {formatTime(slot.st_start_time)}
//   //                                       </div>
//   //                                       <div className={`text-xs ${slot.st_is_booked ? "text-red-600" : "text-green-600"}`}>
//   //                                         {slot.st_is_booked ? "Booked" : "Available"}
//   //                                       </div>
//   //                                       {isDateInNextQuarter(selectedDateForTimeSlots) && (
//   //                                         <div className="text-xs text-green-500 mt-1">
//   //                                           Q{currentQuarterInfo?.quarter} Schedule
//   //                                         </div>
//   //                                       )}
//   //                                     </div>
//   //                                     <div className="flex gap-1">
//   //                                       <ConfirmationModal
//   //                                         title="Confirm Delete Time Slot"
//   //                                         description={
//   //                                           isTimeSlotEditingRestricted()
//   //                                             ? "Time slot editing is restricted to next quarter dates during edit mode."
//   //                                             : "Are you sure you want to delete this time slot? This action cannot be undone."
//   //                                         }
//   //                                         trigger={
//   //                                           <Button 
//   //                                             variant="ghost" 
//   //                                             size="sm" 
//   //                                             disabled={slot.st_is_booked || isTimeSlotEditingRestricted()}
//   //                                           >
//   //                                             <Trash2 size={12} color={isTimeSlotEditingRestricted() ? "gray" : "red"} />
//   //                                           </Button>
//   //                                         }
//   //                                         onClick={() => handleDeleteTimeSlot(Number(slot.st_id))}
//   //                                         actionLabel="Confirm"
//   //                                       />
//   //                                     </div>
//   //                                   </div>
//   //                                 ))
//   //                             )}
//   //                           </div>
//   //                         )}
//   //                       </div>

//   //                       {/* Add New Time Slot */}
//   //                       <Button 
//   //                         className="w-full mt-3" 
//   //                         variant="outline"
//   //                         onClick={handleAddTimeSlotClick}
//   //                         disabled={!selectedDateForTimeSlots || !isDateInNextQuarter(selectedDateForTimeSlots)}
//   //                       >
//   //                         <Plus size={14} className="mr-2" /> 
//   //                         Add Time Slot
//   //                       </Button>

//   //                       <DialogLayout
//   //                         trigger={<div style={{ display: 'none' }} />} // Hidden trigger since we're using custom button
//   //                         title={`Add new time slots for ${formatDate(selectedDateForTimeSlots, "long")}`}
//   //                         description={
//   //                           isTimeSlotEditingRestricted()
//   //                             ? `Time slot editing is restricted to Q${currentQuarterInfo?.quarter} dates during edit mode.`
//   //                             : "Add or manage time slots for the selected date"
//   //                         }
//   //                         mainContent={
//   //                           <SummonTimeSlot
//   //                             sd_id={currentSdId}
//   //                             onSuccess={handleTimeSlotSuccess}
//   //                           />
//   //                         }
//   //                         isOpen={isDialogOpen}
//   //                         onOpenChange={setIsDialogOpen}
//   //                       />
//   //                     </>
//   //                   ) : (
//   //                     <div className="text-center py-12">
//   //                       <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
//   //                       <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Date</h3>
//   //                       <p className="text-sm text-gray-500 mb-4">
//   //                         {editMode 
//   //                           ? "Click on highlighted green dates to select/deselect them for the next quarter"
//   //                           : "Click on an enabled date from the calendar to view and manage time slots"
//   //                         }
//   //                       </p>
//   //                       <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
//   //                         <p className="font-medium mb-1">💡 Tip:</p>
//   //                         <p>
//   //                           {editMode 
//   //                             ? `During edit mode, time slot management is restricted to Q${currentQuarterInfo?.quarter} dates only.`
//   //                             : "Only dates that are enabled (highlighted) can have time slots"
//   //                           }
//   //                         </p>
//   //                       </div>
//   //                     </div>
//   //                   )}
//   //                 </CardContent>
//   //               </Card>
//   //             </div>
//   //           </div>
//   //         </Container>
//   //       </Box>
//   //     </div>
//   //   </div>
//   // );
// };

// export default SummonCalendar;

import { useState, useEffect } from "react";
import { Box, Container, CardHeader } from "@mui/material";
import { Button } from "@/components/ui/button/button";
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useAddSummonDates } from "../queries/summonInsertQueries";
import { toast } from "sonner";
import { CircleCheck, Plus, CalendarIcon, Clock, Trash2, Info } from "lucide-react";
import { useGetSummonDates, useGetSummonTimeSlots } from "../queries/summonFetchQueries";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import SummonTimeSlot from "./summonTimeSlot";
import { Label } from "@/components/ui/label";
import { formatTime } from "@/helpers/timeFormatter";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteSummonTime } from "../queries/summonDeleteQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/helpers/dateHelper";
import { localizer } from "@/helpers/calendarDateHelper";

const SummonCalendar = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([]);
  const [selectedDateForTimeSlots, setSelectedDateForTimeSlots] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSdId, setCurrentSdId] = useState<number | undefined>(undefined);
  
  // Quarterly editing states
  const [nextQuarterDates, setNextQuarterDates] = useState<Date[]>([]);
  const [currentQuarterInfo, setCurrentQuarterInfo] = useState<{ quarter: number; year: number; months: number[] } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const onSuccess = () => {
    toast.success("Dates saved successfully!", {
      icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      duration: 2000,
    });
  };

  const { mutate: addDate, isPending: isPendingAdd } = useAddSummonDates(onSuccess);
  const { data: summonDates = [], isLoading: isLoadingDates } = useGetSummonDates();
  const { mutate: deleteTimeSlot } = useDeleteSummonTime();

  // Fetch time slots only when we have a valid sd_id
  const {
    data: fetchedTimeSlots = [],
    isLoading: isLoadingTimeSlots,
    refetch: refetchTimeSlots,
  } = useGetSummonTimeSlots(currentSdId || 0);

  // Calculate next quarter dates
  useEffect(() => {
    const calculateNextQuarter = () => {
      const today = new Date();
      const currentMonth = today.getMonth(); // 0-11
      const currentYear = today.getFullYear();
      
      // Determine current quarter and next quarter
      let nextQuarter: number;
      let nextYear: number;
      let nextQuarterMonths: number[];
      
      const quarterMonths = [
        [0, 1, 2],   // Q1: Jan, Feb, Mar
        [3, 4, 5],   // Q2: Apr, May, Jun
        [6, 7, 8],   // Q3: Jul, Aug, Sep
        [9, 10, 11], // Q4: Oct, Nov, Dec
      ];
      
      // Find current quarter
      let currentQuarter = 1;
      for (let i = 0; i < quarterMonths.length; i++) {
        if (quarterMonths[i].includes(currentMonth)) {
          currentQuarter = i + 1;
          break;
        }
      }
      
      // Calculate next quarter
      if (currentQuarter === 4) {
        nextQuarter = 1;
        nextYear = currentYear + 1;
      } else {
        nextQuarter = currentQuarter + 1;
        nextYear = currentYear;
      }
      
      nextQuarterMonths = quarterMonths[nextQuarter - 1];
      
      // Generate all weekdays for the next quarter
      const dates: Date[] = [];
      
      nextQuarterMonths.forEach(month => {
        const firstDay = new Date(nextYear, month, 1);
        const lastDay = new Date(nextYear, month + 1, 0);
        
        for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
          const date = new Date(nextYear, month, day);
          // Only include weekdays (Monday to Friday) and future dates
          if (date.getDay() >= 1 && date.getDay() <= 5 && date >= today) {
            dates.push(date);
          }
        }
      });
      
      setNextQuarterDates(dates);
      setCurrentQuarterInfo({
        quarter: nextQuarter,
        year: nextYear,
        months: nextQuarterMonths
      });
    };
    
    calculateNextQuarter();
  }, []);

  // Update currentSdId when selected date changes
  useEffect(() => {
    if (selectedDateForTimeSlots) {
      const found = summonDates.find((item) => {
        const dbDate = new Date(item.sd_date);
        return (
          dbDate.getFullYear() === selectedDateForTimeSlots.getFullYear() &&
          dbDate.getMonth() === selectedDateForTimeSlots.getMonth() &&
          dbDate.getDate() === selectedDateForTimeSlots.getDate()
        );
      });
      setCurrentSdId(found?.sd_id);
    } else {
      setCurrentSdId(undefined);
    }
  }, [selectedDateForTimeSlots, summonDates]);

  // Initialize selected dates from summonDates
  useEffect(() => {
    if (summonDates.length > 0) {
      const dates = summonDates.map((item) => {
        const [year, month, day] = item.sd_date.split("-").map(Number);
        return new Date(year, month - 1, day);
      });
      setSelectedDates(dates);
      setTempSelectedDates(dates);
    }
  }, [summonDates]);

  // Check for changes when in edit mode
  useEffect(() => {
    if (editMode) {
      const hasUnsavedChanges = 
        tempSelectedDates.length !== selectedDates.length ||
        tempSelectedDates.some(tempDate => 
          !selectedDates.some(selectedDate => 
            selectedDate.getTime() === tempDate.getTime()
          )
        ) ||
        selectedDates.some(selectedDate => 
          !tempSelectedDates.some(tempDate => 
            tempDate.getTime() === selectedDate.getTime()
          )
        );
      
      setHasChanges(hasUnsavedChanges);
    }
  }, [tempSelectedDates, selectedDates, editMode]);

  const handleTimeSlotSuccess = () => {
    setIsDialogOpen(false);
    if (currentSdId) {
      refetchTimeSlots();
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateInNextQuarter = (date: Date) => {
    if (!currentQuarterInfo) return false;
    
    return (
      date.getFullYear() === currentQuarterInfo.year &&
      currentQuarterInfo.months.includes(date.getMonth())
    );
  };

  // Check if time slot editing is restricted to next quarter only
  const isTimeSlotEditingRestricted = (): boolean => {
    return !!(editMode && selectedDateForTimeSlots && !isDateInNextQuarter(selectedDateForTimeSlots));
  };
  const handleDateSelection = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!editMode) {
      const isSelectedDate = selectedDates.some(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      );

      if (isSelectedDate) {
        setSelectedDateForTimeSlots(date);
      } else {
        toast.info("Enable this date to view and add time slots.", {
          duration: 1000
        });
      }
    } else {
      // In edit mode, only allow selection within next quarter
      setTempSelectedDates((prev) => {
        const isSelected = prev.some(
          (d) =>
            d.getFullYear() === date.getFullYear() &&
            d.getMonth() === date.getMonth() &&
            d.getDate() === date.getDate()
        );

        return isSelected
          ? prev.filter(
              (d) =>
                !(
                  d.getFullYear() === date.getFullYear() &&
                  d.getMonth() === date.getMonth() &&
                  d.getDate() === date.getDate()
                )
            )
          : [...prev, new Date(date)];
      });
    }
  };

  const handleEditClick = () => {
    setTempSelectedDates([...selectedDates]);
    setEditMode(true);
    setHasChanges(false);
  };

  const handleSave = () => {
    if (!hasChanges) {
      toast.info("No changes to save", {
        description: "You haven't made any changes to the dates.",
        duration: 2000,
      });
      setEditMode(false);
      return;
    }

    // Filter to only include dates from the next quarter in the payload
    const nextQuarterTempDates = tempSelectedDates.filter(date => 
      isDateInNextQuarter(date) || selectedDates.some(
        sd => sd.getFullYear() === date.getFullYear() &&
              sd.getMonth() === date.getMonth() &&
              sd.getDate() === date.getDate()
      )
    );

    // Prepare the payloads
    const newDates: Date[] = [];
    const oldDates: { sd_id: number; sd_is_checked: boolean }[] = [];

    nextQuarterTempDates.forEach((date) => {
      // Check if this date exists in the stored dates
      const existingDate = summonDates.find((item) => {
        const dbDate = new Date(item.sd_date);
        return (
          dbDate.getFullYear() === date.getFullYear() &&
          dbDate.getMonth() === date.getMonth() &&
          dbDate.getDate() === date.getDate()
        );
      });

      if (existingDate) {
        oldDates.push({
          sd_id: existingDate.sd_id,
          sd_is_checked: true, // Since it's in tempSelectedDates, it's checked
        });
      } else {
        // New date - add to newDates payload
        newDates.push(date);
      }
    });

    // Also need to handle dates that were unchecked (exist in DB but not in tempSelectedDates)
    // But only for dates in the next quarter
    summonDates.forEach((dbDate) => {
      const date = new Date(dbDate.sd_date);
      const isStillSelected = nextQuarterTempDates.some(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      );

      if (!isStillSelected && isDateInNextQuarter(date)) {
        oldDates.push({
          sd_id: dbDate.sd_id,
          sd_is_checked: false, 
        });
      }
    });

    // Format newDates for API
    const formattedNewDates = newDates.map((date) => localDateFormatter(date));

    addDate(
      {
        newDates: formattedNewDates,
        oldDates: oldDates,
      },
      {
        onSuccess: () => {
          setSelectedDates([...tempSelectedDates]);
          setEditMode(false);
          setHasChanges(false);
          
          const addedCount = newDates.length;
          const removedCount = oldDates.filter(d => !d.sd_is_checked).length;
          
          if (addedCount > 0 || removedCount > 0) {
            toast.success("Calendar updated successfully", {
              description: `Added ${addedCount} new dates and removed ${removedCount} dates.`,
              duration: 3000,
            });
          }
        },
        onError: () => {
          toast.error("Failed to save changes", {
            description: "Please try again. If the problem persists, contact support.",
            duration: 4000,
          });
        }
      }
    );
  };

  const handleCancel = () => {
    setEditMode(false);
    setHasChanges(false);
  };

  const handleDeleteTimeSlot = (st_id: number) => {
    if (editMode && selectedDateForTimeSlots && !isDateInNextQuarter(selectedDateForTimeSlots)) {
      toast.info(`Cannot modify time slots outside Q${currentQuarterInfo?.quarter} ${currentQuarterInfo?.year}`, {
        description: "Time slot editing is restricted to the next quarter during edit mode.",
        duration: 3000,
      });
      return;
    }
    deleteTimeSlot(st_id);
  };

  const handleAddTimeSlotClick = () => {
    if (isTimeSlotEditingRestricted()) {
      toast.info(`Cannot add time slots outside Q${currentQuarterInfo?.quarter} ${currentQuarterInfo?.year}`, {
        description: "Time slot editing is restricted to the next quarter during edit mode.",
        duration: 3000,
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const renderDateCell = (date: Date) => {
    const isSelected = editMode
      ? tempSelectedDates.some(
          (d) =>
            d.getFullYear() === date.getFullYear() &&
            d.getMonth() === date.getMonth() &&
            d.getDate() === date.getDate()
        )
      : selectedDates.some(
          (d) =>
            d.getFullYear() === date.getFullYear() &&
            d.getMonth() === date.getMonth() &&
            d.getDate() === date.getDate()
        );
    
    const isDisabled = isDateDisabled(date);
    const isInNextQuarter = isDateInNextQuarter(date);
    const isEditMode = editMode;

    // In edit mode, dates outside next quarter should not be selectable
    const isSelectable = !isDisabled && (!isEditMode || isInNextQuarter);

    return (
      <div
        className={`absolute inset-0 flex justify-between items-start p-1 rounded ${
          isSelectable ? "cursor-pointer" : "cursor-not-allowed"
        } ${
          isSelected ? "bg-indigo-100" : 
          isInNextQuarter && isEditMode ? "bg-green-50 border border-green-200" : 
          ""
        }`}
        onClick={() => isSelectable && handleDateSelection(date)}
      >
        {editMode && !isDisabled && isInNextQuarter && (
          <Checkbox 
            checked={isSelected} 
            onChange={() => handleDateSelection(date)} 
            disabled={isPendingAdd} 
            className="mt-1"
          />
        )}
        <span
          className={`ml-auto mt-1 text-[0.875rem] ${
            isSelected ? "font-bold text-indigo-700" : 
            isInNextQuarter && isEditMode ? "text-green-700 font-medium" : 
            "font-normal"
          } ${!isSelectable ? "text-gray-400" : ""}`}
        ></span>
      </div>
    );
  };

  const dayHeaderFormat = (date: Date) => {
    return date.toLocaleString('en-US', { weekday: 'short' });
  };

  if (isLoadingDates) {
    return (
      <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
                <div className="flex items-center mb-4">
                </div>
                <Skeleton className="rounded w-full h-[900px]" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow p-6">
                <Skeleton className="rounded w-full h-[400px]" />
              </div>
            </div>
          </div>
        </Container>
      </Box>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-row gap-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
            Date & Time Availability
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage summon dates, and timeslots for hearing.
        </p>
      </div>
      <hr className="border-gray mb-7 sm:mb-8" />

      {/* Scrollable Content Section */}
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 150px)' }}>
        <Box className="mb-2 flex-grow py-1" component="main">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Calendar Area */}
              <div className="lg:col-span-2">
                <Card className="bg-white rounded-xl shadow">
                  <CardHeader 
                    className="flex items-center justify-between px-6 py-4"
                    title="Date & Time Avaiability"
                    action={
                      editMode ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={isPendingAdd}>
                              {isPendingAdd ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                          <Button variant="outline" onClick={handleCancel} disabled={isPendingAdd}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={handleEditClick}>
                          Edit Next Quarter (Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year})
                        </Button>
                      )
                    }
                  />
                  <CardContent>
                    {/* Informative Messages Section */}
                    <div className="space-y-3 mb-4">
                     {editMode && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-green-50 border border-green-300 rounded flex-shrink-0"></div>
                              <span>Available for editing</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-indigo-100 border border-indigo-200 rounded flex-shrink-0"></div>
                              <span>Selected date</span>
                            </div>
                          </div>
                     )}
                    </div>

                    <Calendar 
                      localizer={localizer} 
                      events={[]} 
                      startAccessor="start" 
                      endAccessor="end" 
                      defaultView="month" 
                      selectable={false}
                      formats={{
                        dayHeaderFormat: dayHeaderFormat,
                      }}
                      components={{
                        dateCellWrapper: ({ children, value }) => (
                          <div className="relative h-full w-full">
                            {children}
                            {renderDateCell(value)}
                          </div>
                        ),
                      }}
                      style={{ height: 800, width: "100%" }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Viewing Info and Time Slots */}
            <div className="lg:col-span-1 space-y-4">
              {/* Viewing Information Card */}
              <Card className="bg-white rounded-xl shadow border border-gray-200">
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <Info size={20} className="text-blue-600"/>
                      <Label className='text-lg font-medium text-gray-800'>Viewing Information</Label>
                    </div>
                  }
                  className="px-6 py-4"
                />
                <CardContent className="space-y-4">
                  {editMode ? (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Editing Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year}</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Only dates in the <strong>next quarter</strong> can be modified</li>
                            <li>Time slot management is also restricted to next quarter dates</li>
                            <li>Green-highlighted dates are available for editing</li>
                            <li>Use checkboxes to select/deselect available dates</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Viewing Mode</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Click on <strong>enabled dates</strong> (highlighted in blue) to manage time slots</li>
                          <li>Use the edit button to modify dates for the next quarter</li>
                          <li>Only future dates can be selected and managed</li>
                          <li>Current focus: Preparing Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year} schedule</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

                {/* Time Slots Management Area */}
                <Card className="h-fit sticky top-4 bg-white rounded-xl shadow">
                  <CardHeader
                    title={
                      <div className="flex items-center gap-2">
                        <Clock size={20} />
                        <span>Time Slots</span>
                      </div>
                    }
                    className="flex items-center justify-between px-6 py-4"
                  />
                  <CardContent className="space-y-4">
                    {selectedDateForTimeSlots ? (
                      <>
                        <div className="text-sm font-medium text-center p-3 bg-blue-50 rounded-lg border">
                          <div className="flex items-center justify-center gap-2 text-blue-700">
                            <CalendarIcon size={16} />
                            <span>{selectedDateForTimeSlots.toLocaleString('default', { weekday: 'long' })}</span>
                          </div>
                          <div className="text-lg font-semibold text-blue-800 mt-1">
                            {formatDate(selectedDateForTimeSlots, "long")}
                          </div>
                          {isDateInNextQuarter(selectedDateForTimeSlots) ? (
                            <div className="text-xs text-green-600 mt-1 bg-green-50 px-2 py-1 rounded">
                              Part of Q{currentQuarterInfo?.quarter} {currentQuarterInfo?.year} - Editable
                            </div>
                          ) : null}
                        </div>

                        {/* Existing Time Slots */}
                        <div>
                          <Label className="text-sm font-medium">Available Time Slots</Label>
                          {isLoadingTimeSlots ? (
                            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                              {[1, 2, 3].map((_, index) => (
                                <div key={index} className="p-3 border rounded-lg animate-pulse">
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                              {fetchedTimeSlots.filter(slot => slot.sd_id === currentSdId).length === 0 ? (
                                <div className="text-center py-8">
                                  <Clock size={32} className="mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500">No time slots available</p>
                                  <p className="text-xs text-gray-400">
                                    {isTimeSlotEditingRestricted() 
                                      ? "Time slot editing restricted during quarterly edit mode"
                                      : "Add your first time slot below"
                                    }
                                  </p>
                                </div>
                              ) : (
                                fetchedTimeSlots
                                  .filter(slot => slot.sd_id === currentSdId)
                                  .map(slot => (
                                    <div
                                      key={slot.st_id}
                                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                        slot.st_is_booked
                                          ? "bg-red-50 border-red-200 hover:bg-red-100"
                                          : "bg-green-50 border-green-200 hover:bg-green-100"
                                      } ${isDateInNextQuarter(selectedDateForTimeSlots) ? "border-l-4 border-l-green-400" : ""}`}
                                    >
                                      <div className="flex-1">
                                        <div className="text-sm font-medium">
                                          {formatTime(slot.st_start_time)}
                                        </div>
                                        <div className={`text-xs ${slot.st_is_booked ? "text-red-600" : "text-green-600"}`}>
                                          {slot.st_is_booked ? "Booked" : "Available"}
                                        </div>
                                        {isDateInNextQuarter(selectedDateForTimeSlots) && (
                                          <div className="text-xs text-green-500 mt-1">
                                            Q{currentQuarterInfo?.quarter} Schedule
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex gap-1">
                                        <ConfirmationModal
                                          title="Confirm Delete Time Slot"
                                          description={
                                            isTimeSlotEditingRestricted()
                                              ? "Time slot editing is restricted to next quarter dates during edit mode."
                                              : "Are you sure you want to delete this time slot? This action cannot be undone."
                                          }
                                          trigger={
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              disabled={slot.st_is_booked || isTimeSlotEditingRestricted()}
                                            >
                                              <Trash2 size={12} color={isTimeSlotEditingRestricted() ? "gray" : "red"} />
                                            </Button>
                                          }
                                          onClick={() => handleDeleteTimeSlot(Number(slot.st_id))}
                                          actionLabel="Confirm"
                                        />
                                      </div>
                                    </div>
                                  ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* Add New Time Slot */}
                        <Button 
                          className="w-full mt-3" 
                          variant="outline"
                          onClick={handleAddTimeSlotClick}
                          disabled={!selectedDateForTimeSlots || !isDateInNextQuarter(selectedDateForTimeSlots)}
                        >
                          <Plus size={14} className="mr-2" /> 
                          Add Time Slot
                        </Button>

                        <DialogLayout
                          trigger={<div style={{ display: 'none' }} />} // Hidden trigger since we're using custom button
                          title={`Add new time slots for ${formatDate(selectedDateForTimeSlots, "long")}`}
                          description={
                            isTimeSlotEditingRestricted()
                              ? `Time slot editing is restricted to Q${currentQuarterInfo?.quarter} dates during edit mode.`
                              : "Add or manage time slots for the selected date"
                          }
                          mainContent={
                            <SummonTimeSlot
                              sd_id={currentSdId}
                              onSuccess={handleTimeSlotSuccess}
                            />
                          }
                          isOpen={isDialogOpen}
                          onOpenChange={setIsDialogOpen}
                        />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Date</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {editMode 
                            ? "Click on highlighted green dates to select/deselect them for the next quarter"
                            : "Click on an enabled date from the calendar to view and manage time slots"
                          }
                        </p>
                        <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium mb-1">💡 Tip:</p>
                          <p>
                            {editMode 
                              ? `During edit mode, time slot management is restricted to Q${currentQuarterInfo?.quarter} dates only.`
                              : "Only dates that are enabled (highlighted) can have time slots"
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </Container>
        </Box>
      </div>
    </div>
  );
};

export default SummonCalendar;