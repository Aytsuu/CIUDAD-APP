// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button/button";
// import { Form } from "@/components/ui/form/form";
// import { FormSelect } from "@/components/ui/form/form-select";
// import SummonSchema from "@/form-schema/summon-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import z from "zod";
// import { useForm } from "react-hook-form";
// import { useAddSummonSchedule } from "./queries/summonInsertQueries";
// import { useGetSummonDates } from "./queries/summonFetchQueries";
// import { useGetSummonTimeSlots } from "./queries/summonFetchQueries";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatTime } from "@/helpers/timeFormatter";
// import { useGetScheduleList } from "./queries/summonFetchQueries";
// import { formatDate } from "@/helpers/dateHelper";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { InfoIcon } from "lucide-react";

// function CreateSummonSched({ sc_id, onSuccess }: {
//     sc_id: string;
//     onSuccess: () => void
// }) {
//     const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
//     const { data: scheduleList = [], isLoading: isLoadingSchedList} = useGetScheduleList(sc_id)
//     const { data: dates = [], isLoading: isLoadingDates } = useGetSummonDates();
//     const { data: timeslots = [], isLoading: isLoadingTimeslots } = useGetSummonTimeSlots(selectedDateId || 0);

//     const currentDateStr = new Date().toISOString().split('T')[0];

//     // Function to get current quarter dates
//     function getCurrentQuarterDates() {
//         const now = new Date();
//         const currentMonth = now.getMonth();
//         const currentYear = now.getFullYear();
        
//         // Determine current quarter
//         let quarterStartMonth, quarterEndMonth;
        
//         if (currentMonth >= 0 && currentMonth <= 2) { // Q1: Jan-Mar
//             quarterStartMonth = 0;
//             quarterEndMonth = 2;
//         } else if (currentMonth >= 3 && currentMonth <= 5) { // Q2: Apr-Jun
//             quarterStartMonth = 3;
//             quarterEndMonth = 5;
//         } else if (currentMonth >= 6 && currentMonth <= 8) { // Q3: Jul-Sep
//             quarterStartMonth = 6;
//             quarterEndMonth = 8;
//         } else { // Q4: Oct-Dec
//             quarterStartMonth = 9;
//             quarterEndMonth = 11;
//         }
        
//         const quarterStart = new Date(currentYear, quarterStartMonth, 1);
//         const quarterEnd = new Date(currentYear, quarterEndMonth + 1, 0); // Last day of the quarter
        
//         return { quarterStart, quarterEnd };
//     }

//     function getMediationLevel(scheduleCount: number){
//         if (scheduleCount === 0) {
//             return "1st MEDIATION";
//         } else if (scheduleCount === 1) {
//             return "2nd MEDIATION";
//         } else if (scheduleCount === 2) {
//             return "3rd MEDIATION";
//         } else if (scheduleCount === 3) {
//             return "1st Conciliation Proceedings";
//         } else if (scheduleCount === 4){
//             return "2nd Conciliation Proceedings";
//         } else if (scheduleCount === 5){
//             return "3rd Conciliation Proceedings";
//         }
//         return "None"; 
//     }
  
//     const mediationLevel = getMediationLevel(scheduleList.length);
//     const isThirdMediation = scheduleList.length === 2; // Check if this is the 3rd mediation
//     const isConciliation = scheduleList.length >= 3; // Check if this is conciliation level

//     // Filter dates to only include current quarter dates that are in the future
//     const dateOptions = dates
//         .filter(date => {
//             const dateObj = new Date(date.sd_date);
//             const { quarterStart, quarterEnd } = getCurrentQuarterDates();
            
//             // Check if date is in current quarter AND is in the future
//             return dateObj >= quarterStart && 
//                    dateObj <= quarterEnd && 
//                    date.sd_date > currentDateStr;
//         })
//         .map(date => ({
//             id: String(date.sd_id),  
//             name: `${formatDate(date.sd_date, "long")}`  
//         }));

//     const form = useForm<z.infer<typeof SummonSchema>>({
//         resolver: zodResolver(SummonSchema),
//         defaultValues: {
//             sd_id: "",
//             st_id: "",
//             hs_level: mediationLevel,
//             sc_id: String(sc_id),
//         },
//     });

//     useEffect(() => {
//         form.setValue("hs_level", mediationLevel);
//     }, [mediationLevel, form]);

//     const selectedDate = form.watch("sd_id");

//     useEffect(() => {
//         if (selectedDate) {
//             const dateId = parseInt(selectedDate);
//             setSelectedDateId(dateId);
//         } else {
//             setSelectedDateId(null);
//         }
//     }, [selectedDate]);

//     // Generate time slot options based on the selected date, excluding booked slots
//     const timeSlotOptions = timeslots
//         .filter(timeslot => !timeslot.st_is_booked) // Exclude booked time slots
//         .map(timeslot => ({
//             id: String(timeslot.st_id),
//             name: `${formatTime(timeslot.st_start_time)}`
//         }));

//     const { mutate: addSched, isPending } = useAddSummonSchedule(onSuccess);

//     if (isLoadingDates || isLoadingSchedList) {
//         return (
//             <div className="p-4 border rounded-lg">
//                 <Skeleton className="h-8 w-1/3 mb-4" />
//                 <div className="space-y-3">
//                     <Skeleton className="h-4 w-full" />
//                     <Skeleton className="h-4 w-2/3" />
//                     <Skeleton className="h-4 w-3/4" />
//                     <Skeleton className="h-4 w-1/2" />
//                 </div>
//                 <Skeleton className="h-16 w-full mt-4" />
//             </div>
//         );
//     }

//     const onSubmit = async (values: z.infer<typeof SummonSchema>) => {
//         const statusType = isConciliation ? "Lupon" : "Council";
//         addSched({ values, status_type: statusType });
//     };

//     return (
//         <div>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)}>
//                     <div className="space-y-4">
//                         {/* Display the determined level */}
//                         <div className={`p-3 rounded-md border ${
//                             isConciliation 
//                                 ? "bg-purple-50 border-purple-200 text-purple-800" 
//                                 : "bg-blue-50 border-blue-200 text-blue-800"
//                         }`}>
//                             <p className="text-sm font-medium">
//                                 {isConciliation ? "Conciliation" : "Mediation"} Level: <span className="font-bold">{mediationLevel}</span>
//                             </p>
//                         </div>

//                         {/* Warning for third mediation */}
//                         {isThirdMediation && (
//                             <Alert className="bg-amber-50 border-amber-200">
//                                 <InfoIcon className="h-4 w-4 text-amber-600" />
//                                 <AlertDescription className="text-amber-800">
//                                     <strong>Final Mediation Notice:</strong> This is the final mediation session. If the case is not resolved during this period, it will be forwarded to the Office of Lupon Tagapamayapa for further action.
//                                 </AlertDescription>
//                             </Alert>
//                         )}

//                         <FormSelect
//                             control={form.control}
//                             name="sd_id"
//                             label="Hearing Date"
//                             options={dateOptions}
//                             placeholder="Select a date"
//                         />

//                         {dateOptions.length === 0 && !isLoadingDates && (
//                             <p className="text-sm text-gray-500">
//                                 No available dates for the current quarter. Please check back later.
//                             </p>
//                         )}

//                         {selectedDateId && (
//                             isLoadingTimeslots ? (
//                                 <div className="space-y-2">
//                                     <Skeleton className="h-4 w-1/4" />
//                                     <Skeleton className="h-10 w-full" />
//                                 </div>
//                             ) : (
//                                 <FormSelect
//                                     control={form.control}
//                                     name="st_id"
//                                     label="Hearing Time Slot"
//                                     options={timeSlotOptions}
//                                     placeholder="Select a time slot"
//                                 />
//                             )
//                         )}

//                         {selectedDateId && timeSlotOptions.length === 0 && !isLoadingTimeslots && (
//                             <p className="text-sm text-gray-500">No available time slots for the selected date.</p>
//                         )}

//                         {selectedDateId && timeSlotOptions.length > 0 && (
//                             <p className="text-sm text-green-600">
//                                 {timeSlotOptions.length} available time slot{timeSlotOptions.length !== 1 ? 's' : ''}
//                             </p>
//                         )}
//                     </div>

//                     <div className="flex justify-end mt-6 gap-2">
//                         <Button 
//                             type="submit" 
//                             disabled={!selectedDateId || isLoadingTimeslots || timeSlotOptions.length === 0 || isPending || dateOptions.length === 0} 
//                         >
//                             {isPending ? "Submitting..." : "Submit"}
//                         </Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default CreateSummonSched;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import SummonSchema from "@/form-schema/summon-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import { useAddSummonSchedule } from "./queries/summonInsertQueries";
import { useGetSummonDates } from "./queries/summonFetchQueries";
import { useGetSummonTimeSlots } from "./queries/summonFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/helpers/timeFormatter";
import { useGetScheduleList } from "./queries/summonFetchQueries";
import { formatDate } from "@/helpers/dateHelper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

function CreateSummonSched({ sc_id, onSuccess }: {
    sc_id: string;
    onSuccess: () => void
}) {
    const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
    const { data: scheduleList = [], isLoading: isLoadingSchedList} = useGetScheduleList(sc_id)
    const { data: dates = [], isLoading: isLoadingDates } = useGetSummonDates();
    const { data: timeslots = [], isLoading: isLoadingTimeslots } = useGetSummonTimeSlots(selectedDateId || 0);

    const currentDateStr = new Date().toISOString().split('T')[0];

    // Function to get current quarter dates
    function getCurrentQuarterDates() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Determine current quarter
        let quarterStartMonth, quarterEndMonth;
        
        if (currentMonth >= 0 && currentMonth <= 2) { // Q1: Jan-Mar
            quarterStartMonth = 0;
            quarterEndMonth = 2;
        } else if (currentMonth >= 3 && currentMonth <= 5) { // Q2: Apr-Jun
            quarterStartMonth = 3;
            quarterEndMonth = 5;
        } else if (currentMonth >= 6 && currentMonth <= 8) { // Q3: Jul-Sep
            quarterStartMonth = 6;
            quarterEndMonth = 8;
        } else { // Q4: Oct-Dec
            quarterStartMonth = 9;
            quarterEndMonth = 11;
        }
        
        const quarterStart = new Date(currentYear, quarterStartMonth, 1);
        const quarterEnd = new Date(currentYear, quarterEndMonth + 1, 0); // Last day of the quarter
        
        return { quarterStart, quarterEnd };
    }

    function getMediationLevel(scheduleCount: number){
        if (scheduleCount === 0) {
            return "1st MEDIATION";
        } else if (scheduleCount === 1) {
            return "2nd MEDIATION";
        } else if (scheduleCount === 2) {
            return "3rd MEDIATION";
        } else if (scheduleCount === 3) {
            return "1st Conciliation Proceedings";
        } else if (scheduleCount === 4){
            return "2nd Conciliation Proceedings";
        } else if (scheduleCount === 5){
            return "3rd Conciliation Proceedings";
        }
        return "None"; 
    }
  
    const mediationLevel = getMediationLevel(scheduleList.length);
    const isThirdMediation = scheduleList.length === 2; // Check if this is the 3rd mediation
    const isThirdConciliation = scheduleList.length === 5; // Check if this is the 3rd conciliation
    const isConciliation = scheduleList.length >= 3; // Check if this is conciliation level

    // Filter dates to only include current quarter dates that are in the future
    const dateOptions = dates
        .filter(date => {
            const dateObj = new Date(date.sd_date);
            const { quarterStart, quarterEnd } = getCurrentQuarterDates();
            
            // Check if date is in current quarter AND is in the future
            return dateObj >= quarterStart && 
                   dateObj <= quarterEnd && 
                   date.sd_date > currentDateStr;
        })
        .map(date => ({
            id: String(date.sd_id),  
            name: `${formatDate(date.sd_date, "long")}`  
        }));

    const form = useForm<z.infer<typeof SummonSchema>>({
        resolver: zodResolver(SummonSchema),
        defaultValues: {
            sd_id: "",
            st_id: "",
            hs_level: mediationLevel,
            sc_id: String(sc_id),
        },
    });

    useEffect(() => {
        form.setValue("hs_level", mediationLevel);
    }, [mediationLevel, form]);

    const selectedDate = form.watch("sd_id");

    useEffect(() => {
        if (selectedDate) {
            const dateId = parseInt(selectedDate);
            setSelectedDateId(dateId);
        } else {
            setSelectedDateId(null);
        }
    }, [selectedDate]);

    // Generate time slot options based on the selected date, excluding booked slots
    const timeSlotOptions = timeslots
        .filter(timeslot => !timeslot.st_is_booked) // Exclude booked time slots
        .map(timeslot => ({
            id: String(timeslot.st_id),
            name: `${formatTime(timeslot.st_start_time)}`
        }));

    const { mutate: addSched, isPending } = useAddSummonSchedule(onSuccess);

    if (isLoadingDates || isLoadingSchedList) {
        return (
            <div className="p-4 border rounded-lg">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-16 w-full mt-4" />
            </div>
        );
    }

    const onSubmit = async (values: z.infer<typeof SummonSchema>) => {
        const statusType = isConciliation ? "Lupon" : "Council";
        addSched({ values, status_type: statusType });
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Display the determined level */}
                        <div className={`p-3 rounded-md border ${
                            isConciliation 
                                ? "bg-purple-50 border-purple-200 text-purple-800" 
                                : "bg-blue-50 border-blue-200 text-blue-800"
                        }`}>
                            <p className="text-sm font-medium">
                                {isConciliation ? "Conciliation" : "Mediation"} Level: <span className="font-bold">{mediationLevel}</span>
                            </p>
                        </div>

                        {/* Warning for third mediation */}
                        {isThirdMediation && (
                            <Alert className="bg-amber-50 border-amber-200">
                                <InfoIcon className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800">
                                    <strong>Final Mediation Notice:</strong> This is the final mediation session. If the case is not resolved during this period, it will be forwarded to the Office of Lupon Tagapamayapa for further action.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Warning for third conciliation */}
                        {isThirdConciliation && (
                            <Alert className="bg-red-50 border-red-200">
                                <InfoIcon className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    <strong>Final Conciliation Proceedings:</strong> This is the final conciliation proceeding. If the case remains unresolved after this session, parties may need to consider escalating the matter to the appropriate court for formal legal proceedings.
                                </AlertDescription>
                            </Alert>
                        )}

                        <FormSelect
                            control={form.control}
                            name="sd_id"
                            label="Hearing Date"
                            options={dateOptions}
                            placeholder="Select a date"
                        />

                        {dateOptions.length === 0 && !isLoadingDates && (
                            <p className="text-sm text-gray-500">
                                No available dates for the current quarter. Please check back later.
                            </p>
                        )}

                        {selectedDateId && (
                            isLoadingTimeslots ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                <FormSelect
                                    control={form.control}
                                    name="st_id"
                                    label="Hearing Time Slot"
                                    options={timeSlotOptions}
                                    placeholder="Select a time slot"
                                />
                            )
                        )}

                        {selectedDateId && timeSlotOptions.length === 0 && !isLoadingTimeslots && (
                            <p className="text-sm text-gray-500">No available time slots for the selected date.</p>
                        )}

                        {selectedDateId && timeSlotOptions.length > 0 && (
                            <p className="text-sm text-green-600">
                                {timeSlotOptions.length} available time slot{timeSlotOptions.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end mt-6 gap-2">
                        <Button 
                            type="submit" 
                            disabled={!selectedDateId || isLoadingTimeslots || timeSlotOptions.length === 0 || isPending || dateOptions.length === 0} 
                        >
                            {isPending ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default CreateSummonSched;