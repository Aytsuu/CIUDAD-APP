// import '@/global.css';
// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { Button } from '@/components/ui/button';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { ChevronLeft, Info } from 'lucide-react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { LoadingModal } from '@/components/ui/loading-modal';
// import { useAddSummonSchedule } from "./queries/summonInsertQueries";
// import { useGetSummonDates } from "./queries/summonFetchQueries";
// import { useGetSummonTimeSlots } from "./queries/summonFetchQueries";
// import { formatTime } from "@/helpers/timeFormatter";
// import { useGetScheduleList } from "./queries/summonFetchQueries";
// import { LoadingState } from '@/components/ui/loading-state';
// import { FormSelect } from '@/components/ui/form/form-select';
// import { zodResolver } from '@hookform/resolvers/zod';
// import SummonSchema from '@/form-schema/summon-schema';
// import { useForm } from 'react-hook-form';
// import z from 'zod';
// import { formatDate } from '@/helpers/dateHelpers';

// export default function SummonCreateForm() {
//     const router = useRouter();
//     const params = useLocalSearchParams();
//     const sc_id = params.sc_id as string || "";
    
//     const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
//     const { data: scheduleList = [], isLoading: isLoadingSchedList } = useGetScheduleList(sc_id);
//     const { data: dates = [], isLoading: isLoadingDates } = useGetSummonDates();
//     const { data: timeslots = [], isLoading: isLoadingTimeslots } = useGetSummonTimeSlots(selectedDateId || 0);

//     const currentDateStr = new Date().toISOString().split('T')[0];

//     function getMediationLevel(scheduleCount: number) {
//         if (scheduleCount === 0) {
//             return "1st MEDIATION";
//         } else if (scheduleCount === 1) {
//             return "2nd MEDIATION";
//         } else if (scheduleCount === 2) {
//             return "3rd MEDIATION";
//         } else if (scheduleCount === 3) {
//             return "1st Conciliation Proceedings";
//         } else if (scheduleCount === 4) {
//             return "2nd Conciliation Proceedings";
//         } else if (scheduleCount === 5) {
//             return "3rd Conciliation Proceedings";
//         }
//         return "None";
//     }

//     const mediationLevel = getMediationLevel(scheduleList.length);
//     const isThirdMediation = scheduleList.length === 2;
//     const isConciliation = scheduleList.length >= 3;

//     // Filter dates to only show future dates
//     const dateOptions = dates
//         .filter(date => date.sd_date > currentDateStr)
//         .map(date => ({
//             value: date.sd_id.toString(),
//             label: String(formatDate(date.sd_date, "long"))
//         }));

//     // Generate time slot options based on the selected date, excluding booked slots
//     const timeSlotOptions = timeslots
//         .filter(timeslot => !timeslot.st_is_booked)
//         .map(timeslot => ({
//             value: timeslot.st_id.toString(),
//             label: formatTime(timeslot.st_start_time)
//         }));

//     const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
//         resolver: zodResolver(SummonSchema),
//         defaultValues: {
//             sd_id: "",
//             st_id: "",
//             hs_level: mediationLevel,
//             sc_id: sc_id,
//         }
//     });

//     const selectedDate = watch("sd_id");

//     useEffect(() => {
//         setValue("hs_level", mediationLevel);
//     }, [mediationLevel, setValue]);

//     useEffect(() => {
//         if (selectedDate) {
//             const dateId = parseInt(selectedDate);
//             setSelectedDateId(dateId);
//         } else {
//             setSelectedDateId(null);
//         }
//     }, [selectedDate]);

//     const { mutate: addSched, isPending } = useAddSummonSchedule()  

//     const onSubmit = async (values: z.infer<typeof SummonSchema>) => {
//         const statusType = isConciliation ? "Lupon" : "Council";
//         addSched({ values, status_type: statusType });
//     };

//     // Loading state
//     if (isLoadingDates || isLoadingSchedList) {
//         return (
//             <View className="flex-1 justify-center items-center">
//                 <LoadingState/>
//             </View>    
//         );
//     }

//     return (
//         <_ScreenLayout
//             showExitButton={false}
//             customLeftAction={
//                 <TouchableOpacity onPress={() => router.back()}>
//                     <ChevronLeft size={30} className="text-black" />
//                 </TouchableOpacity>
//             }
//             headerBetweenAction={<Text className="text-[13px]">Create Summon Schedule</Text>}
//         >
//             <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//                 <View className="p-6">
//                     <View className="space-y-6">
//                         {/* Display the determined level */}
//                         <View className={`p-4 rounded-lg border-2 ${
//                             isConciliation 
//                                 ? "bg-purple-50 border-purple-200" 
//                                 : "bg-blue-50 border-blue-200"
//                         }`}>
//                             <Text className={`text-sm font-semibold ${
//                                 isConciliation ? "text-purple-800" : "text-blue-800"
//                             }`}>
//                                 {isConciliation ? "Conciliation" : "Mediation"} Level:{" "}
//                                 <Text className="font-bold">{mediationLevel}</Text>
//                             </Text>
//                         </View>

//                         {/* Warning for third mediation */}
//                         {isThirdMediation && (
//                             <View className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//                                 <View className="flex-row items-start space-x-2">
//                                     <Info size={16} className="text-amber-600 mt-0.5" />
//                                     <View className="flex-1">
//                                         <Text className="text-amber-800 text-sm font-semibold">
//                                             Final Mediation Notice
//                                         </Text>
//                                         <Text className="text-amber-700 text-sm mt-1">
//                                             This is the final mediation session. If the case is not resolved during this period, it will be forwarded to the Office of Lupon Tagapamayapa for further action.
//                                         </Text>
//                                     </View>
//                                 </View>
//                             </View>
//                         )}

//                         {/* Hearing Date Selection */}
//                         <View className='mt-3'>
//                             <FormSelect
//                                 control={control}
//                                 name="sd_id"
//                                 label="Hearing Date"
//                                 options={dateOptions}
//                                 placeholder="Select a date"
//                             />
//                         </View>

//                         {/* Time Slot Selection */}
//                         {selectedDateId && (
//                             <View>
//                                 {isLoadingTimeslots ? (
//                                     <View className="space-y-2">
//                                         <LoadingState />
//                                         <Text className="text-gray-500 text-sm">Loading available time slots...</Text>
//                                     </View>
//                                 ) : (
//                                     <>
//                                         <FormSelect
//                                             control={control}
//                                             name="st_id"
//                                             label="Hearing Time Slot"
//                                             options={timeSlotOptions}
//                                             placeholder="Select a time slot"
//                                         />
                                        
//                                         {timeSlotOptions.length === 0 ? (
//                                             <Text className="text-gray-500 text-sm mt-2">
//                                                 No available time slots for the selected date.
//                                             </Text>
//                                         ) : (
//                                             <Text className="text-green-600 text-sm mt-2">
//                                                 {timeSlotOptions.length} available time slot{timeSlotOptions.length !== 1 ? 's' : ''}
//                                             </Text>
//                                         )}
//                                     </>
//                                 )}
//                             </View>
//                         )}

//                         {/* Submit Button */}
//                         <View className="pt-4 pb-8">
//                             <Button
//                                 onPress={handleSubmit(onSubmit)}
//                                 disabled={!selectedDateId || isLoadingTimeslots || timeSlotOptions.length === 0 || isPending}
//                                 className={`native:h-[56px] w-full rounded-xl shadow-lg ${
//                                     (!selectedDateId || isLoadingTimeslots || timeSlotOptions.length === 0 || isPending) 
//                                         ? 'bg-gray-400' 
//                                         : 'bg-primaryBlue'
//                                 }`}
//                             >
//                                 <Text className="text-white font-PoppinsSemiBold text-[16px]">
//                                     {isPending ? "Submitting..." : "Submit Schedule"}
//                                 </Text>
//                             </Button>
//                         </View>
//                     </View>
//                 </View>
//             </ScrollView>

//             <LoadingModal visible={isPending} />
//         </_ScreenLayout>
//     );
// }

import '@/global.css';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import PageLayout from '@/screens/_PageLayout';
import { ChevronLeft, Info } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LoadingModal } from '@/components/ui/loading-modal';
import { useAddSummonSchedule } from "./queries/summonInsertQueries";
import { useGetSummonDates } from "./queries/summonFetchQueries";
import { useGetSummonTimeSlots } from "./queries/summonFetchQueries";
import { formatTime } from "@/helpers/timeFormatter";
import { useGetScheduleList } from "./queries/summonFetchQueries";
import { LoadingState } from '@/components/ui/loading-state';
import { FormSelect } from '@/components/ui/form/form-select';
import { zodResolver } from '@hookform/resolvers/zod';
import SummonSchema from '@/form-schema/summon-schema';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { formatDate } from '@/helpers/dateHelpers';

export default function SummonCreateForm() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const sc_id = params.sc_id as string || "";
    
    const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
    const { data: scheduleList = [], isLoading: isLoadingSchedList } = useGetScheduleList(sc_id);
    const { data: dates = [], isLoading: isLoadingDates } = useGetSummonDates();
    const { data: timeslots = [], isLoading: isLoadingTimeslots } = useGetSummonTimeSlots(selectedDateId || 0);

    const currentDateStr = new Date().toISOString().split('T')[0];

    function getMediationLevel(scheduleCount: number) {
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
        } else if (scheduleCount === 5) {
            return "3rd Conciliation Proceedings";
        }
        return "None";
    }

    const mediationLevel = getMediationLevel(scheduleList.length);
    const isThirdMediation = scheduleList.length === 2;
    const isConciliation = scheduleList.length >= 3;

    // Filter dates to only show future dates
    const dateOptions = dates
        .filter(date => date.sd_date > currentDateStr)
        .map(date => ({
            value: date.sd_id.toString(),
            label: String(formatDate(date.sd_date, "long"))
        }));

    // Generate time slot options based on the selected date, excluding booked slots
    const timeSlotOptions = timeslots
        .filter(timeslot => !timeslot.st_is_booked)
        .map(timeslot => ({
            value: timeslot.st_id.toString(),
            label: formatTime(timeslot.st_start_time)
        }));

    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(SummonSchema),
        defaultValues: {
            sd_id: "",
            st_id: "",
            hs_level: mediationLevel,
            sc_id: sc_id,
        }
    });

    const selectedDate = watch("sd_id");

    useEffect(() => {
        setValue("hs_level", mediationLevel);
    }, [mediationLevel, setValue]);

    useEffect(() => {
        if (selectedDate) {
            const dateId = parseInt(selectedDate);
            setSelectedDateId(dateId);
        } else {
            setSelectedDateId(null);
        }
    }, [selectedDate]);

    const { mutate: addSched, isPending } = useAddSummonSchedule()  

    const onSubmit = async (values: z.infer<typeof SummonSchema>) => {
        const statusType = isConciliation ? "Lupon" : "Council";
        addSched({ values, status_type: statusType });
    };

    // Loading state
    if (isLoadingDates || isLoadingSchedList) {
        return (
            <View className="flex-1 justify-center items-center">
                <LoadingState/>
            </View>    
        );
    }

    return (
        <PageLayout
            leftAction={
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </TouchableOpacity>
            }
            headerTitle={<Text className="text-gray-900 text-[13px]">Create Summon Schedule</Text>}
            wrapScroll={false}
        >
            <View className="flex-1 bg-gray-50">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="p-6">
                        <View className="space-y-6">
                            {/* Display the determined level */}
                            <View className={`p-4 rounded-lg border-2 ${
                                isConciliation 
                                    ? "bg-purple-50 border-purple-200" 
                                    : "bg-blue-50 border-blue-200"
                            }`}>
                                <Text className={`text-sm font-semibold ${
                                    isConciliation ? "text-purple-800" : "text-blue-800"
                                }`}>
                                    {isConciliation ? "Conciliation" : "Mediation"} Level:{" "}
                                    <Text className="font-bold">{mediationLevel}</Text>
                                </Text>
                            </View>

                            {/* Warning for third mediation */}
                            {isThirdMediation && (
                                <View className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <View className="flex-row items-start space-x-2">
                                        <Info size={16} className="text-amber-600 mt-0.5" />
                                        <View className="flex-1">
                                            <Text className="text-amber-800 text-sm font-semibold">
                                                Final Mediation Notice
                                            </Text>
                                            <Text className="text-amber-700 text-sm mt-1">
                                                This is the final mediation session. If the case is not resolved during this period, it will be forwarded to the Office of Lupon Tagapamayapa for further action.
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Hearing Date Selection */}
                            <View className='mt-3'>
                                <FormSelect
                                    control={control}
                                    name="sd_id"
                                    label="Hearing Date"
                                    options={dateOptions}
                                    placeholder="Select a date"
                                />
                            </View>

                            {/* Time Slot Selection */}
                            {selectedDateId && (
                                <View>
                                    {isLoadingTimeslots ? (
                                        <View className="space-y-2">
                                            <LoadingState />
                                            <Text className="text-gray-500 text-sm">Loading available time slots...</Text>
                                        </View>
                                    ) : (
                                        <>
                                            <FormSelect
                                                control={control}
                                                name="st_id"
                                                label="Hearing Time Slot"
                                                options={timeSlotOptions}
                                                placeholder="Select a time slot"
                                            />
                                            
                                            {timeSlotOptions.length === 0 ? (
                                                <Text className="text-gray-500 text-sm mt-2">
                                                    No available time slots for the selected date.
                                                </Text>
                                            ) : (
                                                <Text className="text-green-600 text-sm mt-2">
                                                    {timeSlotOptions.length} available time slot{timeSlotOptions.length !== 1 ? 's' : ''}
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </View>
                            )}

                            {/* Submit Button */}
                            <View className="pt-4 pb-8">
                                <Button
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={!selectedDateId || isLoadingTimeslots || timeSlotOptions.length === 0 || isPending}
                                    className={`native:h-[56px] w-full rounded-xl shadow-lg ${
                                        (!selectedDateId || isLoadingTimeslots || timeSlotOptions.length === 0 || isPending) 
                                            ? 'bg-gray-400' 
                                            : 'bg-primaryBlue'
                                    }`}
                                >
                                    <Text className="text-white font-PoppinsSemiBold text-[16px]">
                                        {isPending ? "Submitting..." : "Submit Schedule"}
                                    </Text>
                                </Button>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <LoadingModal visible={isPending} />
            </View>
        </PageLayout>
    );
}