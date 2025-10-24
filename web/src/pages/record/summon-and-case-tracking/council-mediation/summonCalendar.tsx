// import { useState, useEffect } from "react";
// import { Box, Container, CardHeader } from "@mui/material";
// import { Button } from "@/components/ui/button/button";
// import { Calendar } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Card, CardContent } from "@/components/ui/card";
// import { useAddSummonDates } from "../queries/summonInsertQueries";
// import { toast } from "sonner";
// import { CircleCheck, Plus, CalendarIcon, Clock, Trash2 } from "lucide-react";
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
//   };

//   const handleSave = () => {
//     // Prepare the payloads
//     const newDates: Date[] = [];
//     const oldDates: { sd_id: number; sd_is_checked: boolean }[] = [];

//     tempSelectedDates.forEach((date) => {
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
//     summonDates.forEach((dbDate) => {
//       const date = new Date(dbDate.sd_date);
//       const isStillSelected = tempSelectedDates.some(
//         (d) =>
//           d.getFullYear() === date.getFullYear() &&
//           d.getMonth() === date.getMonth() &&
//           d.getDate() === date.getDate()
//       );

//       if (!isStillSelected) {
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
//         },
//       }
//     );
//   };

//   const handleCancel = () => {
//     setEditMode(false);
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

//     return (
//       <div
//         className={`absolute inset-0 flex justify-between items-start p-1 rounded ${
//           isDisabled ? "cursor-not-allowed" : "cursor-pointer"
//         } ${isSelected ? "bg-indigo-100" : ""}`}
//         onClick={() => !isDisabled && handleDateSelection(date)}
//       >
//         {editMode && !isDisabled && (
//           <Checkbox checked={isSelected} onChange={() => handleDateSelection(date)} disabled={isPendingAdd} className="mt-1"/>
//         )}
//         <span
//           className={`ml-auto mt-1 text-[0.875rem] ${
//             isSelected ? "font-bold text-indigo-700" : "font-normal"
//           } ${isDisabled ? "text-gray-400" : ""}`}
//         ></span>
//       </div>
//     );
//   };

//   const dayHeaderFormat = (date: Date) => {
//     return date.toLocaleString('en-US', { weekday: 'short' });
//   };
//   // Returns "Mon", "Tue", etc.
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
//     <div className="w-full">
//     {/* Header Section - Fixed outside scroll container */}
//     <div className="flex flex-col gap-3 mb-3">
//       <div className="flex flex-row gap-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//           Summon Calendar
//         </h1>
//       </div>
//       <p className="text-xs sm:text-sm text-darkGray">
//         Manage summon schedules, timeslots, and view scheduled sessions.
//       </p>
//     </div>
//     <hr className="border-gray mb-7 sm:mb-8" />

//     {/* Scrollable Content Section - Only this part scrolls */}
//     <div className="overflow-y-auto" style={{ height: 'calc(100vh - 150px)' }}> {/* Adjust height as needed */}
//       <Box className="mb-2 flex-grow py-1" component="main">
//           <Container>
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//               {/* Calendar Area */}
//               <div className="lg:col-span-2">
//                 <Card className="bg-white rounded-xl shadow">
//                   <CardHeader title="Summon Dates"
//                     action={
//                       editMode ? (
//                         <div className="flex gap-3">
//                           <Button onClick={handleSave} disabled={isPendingAdd}>
//                             {isPendingAdd ? "Saving..." : "Save"}
//                           </Button>
//                           <Button variant="outline" onClick={handleCancel} disabled={isPendingAdd}>
//                             Cancel
//                           </Button>
//                         </div>
//                       ) : (
//                         <Button onClick={handleEditClick}>Edit</Button>
//                       )
//                     }
//                     className="flex items-center justify-between px-6 py-4"
//                   />
//                   <CardContent>
//                     <div className="mb-4 text-sm text-gray-600">
//                       {editMode
//                         ? "Select dates to add to your summon calendar"
//                         : "Click on a date to manage time slots"}
//                     </div>
//                     <Calendar localizer={localizer} events={[]} startAccessor="start" endAccessor="end" defaultView="month" selectable={false}
//                       formats={{
//                         dayHeaderFormat: dayHeaderFormat,
//                       }}
//                       components={{
//                         dateCellWrapper: ({ children, value }) => (
//                           <div className="relative h-full w-full">
//                             {children}
//                             {renderDateCell(value)}
//                           </div>
//                         ),
//                       }}
//                       style={{ height: 900, width: "100%" }}
//                     />
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Time Slots Management Area */}
//               <div className="lg:col-span-1">
//                 <Card className="h-fit sticky top-4 bg-white rounded-xl shadow">
//                   <CardHeader
//                     title={
//                       <div className="flex items-center gap-2">
//                         <Clock size={20} />
//                         <span>Time Slots</span>
//                       </div>
//                     }
//                     className="flex items-center justify-between px-6 py-4"
//                   />
//                   <CardContent className="space-y-4">
//                     {selectedDateForTimeSlots ? (
//                       <>
//                         <div className="text-sm font-medium text-center p-3 bg-blue-50 rounded-lg border">
//                           <div className="flex items-center justify-center gap-2 text-blue-700">
//                             <CalendarIcon size={16} />
//                             <span>{selectedDateForTimeSlots.toLocaleString('default', { weekday: 'long' })}</span>
//                           </div>
//                           <div className="text-lg font-semibold text-blue-800 mt-1">
//                             {formatDate(selectedDateForTimeSlots, "long")}
//                           </div>
//                         </div>

//                         {/* Existing Time Slots */}
//                         <div>
//                           <Label className="text-sm font-medium">Available Time Slots</Label>
//                           {isLoadingTimeSlots ? (
//                             <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
//                               {[1, 2, 3].map((_, index) => (
//                                 <div key={index} className="p-3 border rounded-lg animate-pulse">
//                                   <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                                   <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
//                               {fetchedTimeSlots.filter(slot => slot.sd_id === currentSdId).length === 0 ? (
//                                 <div className="text-center py-8">
//                                   <Clock size={32} className="mx-auto text-gray-400 mb-2" />
//                                   <p className="text-sm text-gray-500">No time slots available</p>
//                                   <p className="text-xs text-gray-400">Add your first time slot below</p>
//                                 </div>
//                               ) : (
//                                 fetchedTimeSlots
//                                   .filter(slot => slot.sd_id === currentSdId)
//                                   .map(slot => (
//                                     <div
//                                       key={slot.st_id}
//                                       className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
//                                         slot.st_is_booked
//                                           ? "bg-red-50 border-red-200 hover:bg-red-100"
//                                           : "bg-green-50 border-green-200 hover:bg-green-100"
//                                       }`}
//                                     >
//                                       <div className="flex-1">
//                                         <div className="text-sm font-medium">
//                                           {formatTime(slot.st_start_time)}
//                                         </div>
//                                         <div className={`text-xs ${slot.st_is_booked ? "text-red-600" : "text-green-600"}`}>
//                                           {slot.st_is_booked ? "Booked" : "Available"}
//                                         </div>
//                                       </div>
//                                       <div className="flex gap-1">
//                                         <ConfirmationModal
//                                           title="Confirm Delete Time Slot"
//                                           description="Are you sure you want to delete this time slot?"
//                                           trigger={
//                                             <Button variant="ghost" size="sm" disabled={slot.st_is_booked}>
//                                               <Trash2 size={12} color="red" />
//                                             </Button>
//                                           }
//                                           onClick={() => deleteTimeSlot(Number(slot.st_id))}
//                                           actionLabel="Confirm"
//                                         />
//                                       </div>
//                                     </div>
//                                   ))
//                               )}
//                             </div>
//                           )}
//                         </div>

//                         {/* Add New Time Slot */}
//                         <DialogLayout
//                           trigger={
//                             <Button className="w-full mt-3" variant="outline">
//                               <Plus size={14} className="mr-2" /> Add Time Slot
//                             </Button>
//                           }
//                           title={`Add new time slots for ${formatDate(selectedDateForTimeSlots, "long")}`}
//                           description="Add or manage time slots for the selected date"
//                           mainContent={
//                             <SummonTimeSlot
//                               sd_id={currentSdId}
//                               onSuccess={handleTimeSlotSuccess}
//                             />
//                           }
//                           isOpen={isDialogOpen}
//                           onOpenChange={setIsDialogOpen}
//                         />
//                       </>
//                     ) : (
//                       <div className="text-center py-12">
//                         <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
//                         <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Date</h3>
//                         <p className="text-sm text-gray-500 mb-4">
//                           Click on an enabled date from the calendar to view and manage time slots
//                         </p>
//                         <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
//                           <p className="font-medium mb-1">💡 Tip:</p>
//                           <p>Only dates that are enabled (highlighted) can have time slots</p>
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </Container>
//         </Box>
//       </div>
//     </div>
//   );
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
import { CircleCheck, Plus, CalendarIcon, Clock, Trash2, ChevronDown } from "lucide-react";
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
  
  // Quarterly Date Picker States - Integrated into calendar
  const [quarterlySelectionMode, setQuarterlySelectionMode] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

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

  // Quarterly Date Picker Functions
  const generateQuarterDates = (quarter: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const quarterMonths = [
      [0, 1, 2],   // Q1: Jan, Feb, Mar
      [3, 4, 5],   // Q2: Apr, May, Jun
      [6, 7, 8],   // Q3: Jul, Aug, Sep
      [9, 10, 11], // Q4: Oct, Nov, Dec
    ];

    const dates: Date[] = [];
    const months = quarterMonths[quarter - 1];

    months.forEach(month => {
      // Add all weekdays (Monday to Friday) of the month
      const firstDay = new Date(currentYear, month, 1);
      const lastDay = new Date(currentYear, month + 1, 0);
      
      for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, month, day);
        // Only include weekdays (Monday to Friday) and future dates
        if (date.getDay() >= 1 && date.getDay() <= 5 && date >= today) {
          dates.push(date);
        }
      }
    });

    return dates;
  };

  const isDateInSelectedQuarter = (date: Date) => {
    if (!quarterlySelectionMode) return false;
    
    const quarterMonths = [
      [0, 1, 2],   // Q1
      [3, 4, 5],   // Q2
      [6, 7, 8],   // Q3
      [9, 10, 11], // Q4
    ];
    
    const months = quarterMonths[selectedQuarter - 1];
    return months.includes(date.getMonth());
  };

  const handleQuarterlySelection = () => {
    if (quarterlySelectionMode) {
      // Apply quarterly dates
      const quarterDates = generateQuarterDates(selectedQuarter);
      setTempSelectedDates(prev => {
        const newDates = [...prev];
        quarterDates.forEach(date => {
          if (!newDates.some(d => d.toDateString() === date.toDateString())) {
            newDates.push(new Date(date));
          }
        });
        return newDates;
      });
      toast.success(`Added ${quarterDates.length} dates from Q${selectedQuarter}`);
    }
    setQuarterlySelectionMode(!quarterlySelectionMode);
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
      if (quarterlySelectionMode) {
        // In quarterly mode, only allow selection within the quarter
        if (!isDateInSelectedQuarter(date)) {
          toast.info(`Please select dates from Q${selectedQuarter} only`);
          return;
        }
      }
      
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
    setQuarterlySelectionMode(false); // Reset quarterly mode when entering edit
  };

  const handleSave = () => {
    // Prepare the payloads
    const newDates: Date[] = [];
    const oldDates: { sd_id: number; sd_is_checked: boolean }[] = [];

    tempSelectedDates.forEach((date) => {
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
    summonDates.forEach((dbDate) => {
      const date = new Date(dbDate.sd_date);
      const isStillSelected = tempSelectedDates.some(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      );

      if (!isStillSelected) {
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
          setQuarterlySelectionMode(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditMode(false);
    setQuarterlySelectionMode(false);
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
    const isInQuarter = isDateInSelectedQuarter(date);
    const isQuarterlyMode = quarterlySelectionMode;

    return (
      <div
        className={`absolute inset-0 flex justify-between items-start p-1 rounded ${
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        } ${
          isSelected ? "bg-indigo-100" : 
          isInQuarter && isQuarterlyMode ? "bg-green-50 border border-green-200" : 
          ""
        }`}
        onClick={() => !isDisabled && handleDateSelection(date)}
      >
        {editMode && !isDisabled && (
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
            isInQuarter && isQuarterlyMode ? "text-green-700 font-medium" : 
            "font-normal"
          } ${isDisabled ? "text-gray-400" : ""}`}
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
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Summon Dates</span>
                  <Skeleton className="rounded w-[100px] h-[36px]" />
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
            Summon Calendar
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage summon schedules, timeslots, and view scheduled sessions.
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
                    title="Summon Dates"
                    action={
                      editMode ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={isPendingAdd}>
                              {isPendingAdd ? "Saving..." : "Save"}
                            </Button>
                            <div className="flex gap-2">
                              <select 
                                className="p-2 border border-gray-300 rounded-md bg-white text-sm"
                                value={selectedQuarter}
                                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                                disabled={!quarterlySelectionMode}
                              >
                                <option value={1}>Q1 (Jan-Mar)</option>
                                <option value={2}>Q2 (Apr-Jun)</option>
                                <option value={3}>Q3 (Jul-Sep)</option>
                                <option value={4}>Q4 (Oct-Dec)</option>
                              </select>
                              <Button 
                                variant={quarterlySelectionMode ? "default" : "outline"}
                                onClick={handleQuarterlySelection}
                                disabled={isPendingAdd}
                              >
                                {quarterlySelectionMode ? "Apply Quarter" : "Quarterly Select"}
                              </Button>
                            </div>
                          </div>
                          <Button variant="outline" onClick={handleCancel} disabled={isPendingAdd}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={handleEditClick}>Edit</Button>
                      )
                    }
                  />
                  <CardContent>
                    <div className="mb-4 text-sm text-gray-600">
                      {editMode ? (
                        quarterlySelectionMode ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <CalendarIcon size={16} />
                            <span>Quarterly Selection Mode: Select dates from Q{selectedQuarter}. Click "Apply Quarter" to add all dates.</span>
                          </div>
                        ) : (
                          "Select dates to add to your summon calendar"
                        )
                      ) : (
                        "Click on a date to manage time slots"
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
                      style={{ height: 900, width: "100%" }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Time Slots Management Area */}
              <div className="lg:col-span-1">
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
                                  <p className="text-xs text-gray-400">Add your first time slot below</p>
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
                                      }`}
                                    >
                                      <div className="flex-1">
                                        <div className="text-sm font-medium">
                                          {formatTime(slot.st_start_time)}
                                        </div>
                                        <div className={`text-xs ${slot.st_is_booked ? "text-red-600" : "text-green-600"}`}>
                                          {slot.st_is_booked ? "Booked" : "Available"}
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <ConfirmationModal
                                          title="Confirm Delete Time Slot"
                                          description="Are you sure you want to delete this time slot?"
                                          trigger={
                                            <Button variant="ghost" size="sm" disabled={slot.st_is_booked}>
                                              <Trash2 size={12} color="red" />
                                            </Button>
                                          }
                                          onClick={() => deleteTimeSlot(Number(slot.st_id))}
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
                        <DialogLayout
                          trigger={
                            <Button className="w-full mt-3" variant="outline">
                              <Plus size={14} className="mr-2" /> Add Time Slot
                            </Button>
                          }
                          title={`Add new time slots for ${formatDate(selectedDateForTimeSlots, "long")}`}
                          description="Add or manage time slots for the selected date"
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
                          Click on an enabled date from the calendar to view and manage time slots
                        </p>
                        <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium mb-1">💡 Tip:</p>
                          <p>Only dates that are enabled (highlighted) can have time slots</p>
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