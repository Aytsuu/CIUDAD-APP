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

    function getMediationLevel(scheduleCount: number){
        if (scheduleCount === 0) {
            return "1st Mediation";
        } else if (scheduleCount === 1) {
            return "2nd Mediation";
        } else if (scheduleCount === 2) {
            return "3rd Mediation";
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
    const isConciliation = scheduleList.length >= 3; // Check if this is conciliation level

    const dateOptions = dates
        .filter(date => date.sd_date > currentDateStr)
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

                        <FormSelect
                            control={form.control}
                            name="sd_id"
                            label="Hearing Date"
                            options={dateOptions}
                            placeholder="Select a date"
                        />

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
                            disabled={!selectedDateId || isLoadingTimeslots || timeSlotOptions.length === 0 || isPending} 
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

