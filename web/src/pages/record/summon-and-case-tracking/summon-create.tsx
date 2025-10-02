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

function CreateSummonSched({ sr_id, onSuccess }: {
    sr_id: string;
    onSuccess: () => void
}) {
    const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
    const { data: scheduleList = [], isLoading: isLoadingSchedList} = useGetScheduleList(sr_id)
    const { data: dates = [], isLoading: isLoadingDates } = useGetSummonDates();
    const { data: timeslots = [], isLoading: isLoadingTimeslots } = useGetSummonTimeSlots(selectedDateId || 0);
    const { mutate: addSched, isPending } = useAddSummonSchedule(onSuccess);

    const currentDateStr = new Date().toISOString().split('T')[0];

    function getMediationLevel(scheduleCount: number){
        if (scheduleCount === 0) {
            return "1st MEDIATION";
        } else if (scheduleCount === 1) {
            return "2nd MEDIATION";
        } else if (scheduleCount === 2) {
            return "3rd MEDIATION";
        } else if (scheduleCount === 3) {
            return "1st Conciliation Proceedings";
        } else if (scheduleCount === 4) {
            return "2nd Conciliation Proceedings";
        } else if (scheduleCount >= 5) {
            return "3rd Conciliation Proceedings";
        }
        return "1st MEDIATION"; // Default fallback
    }
  
    const mediationLevel = getMediationLevel(scheduleList.length);

    const dateOptions = dates
        .filter(date => date.sd_date > currentDateStr)
        .map(date => ({
            id: String(date.sd_id),  
            name: `${date.sd_date}`  
        }));

    const form = useForm<z.infer<typeof SummonSchema>>({
        resolver: zodResolver(SummonSchema),
        defaultValues: {
            sd_id: "",
            st_id: "",
            ss_mediation_level: mediationLevel,
            sr_id: String(sr_id),
        },
    });

    // Update form value when mediationLevel changes
    useEffect(() => {
        form.setValue("ss_mediation_level", mediationLevel);
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
        console.log('Summonsched', values);
        addSched(values);
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Display the determined mediation level */}
                        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                            <p className="text-sm font-medium text-blue-800">
                                Mediation Level: <span className="font-bold">{mediationLevel}</span>
                            </p>
                        </div>

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
                            {isPending? "Submitting...": "Submit"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default CreateSummonSched;