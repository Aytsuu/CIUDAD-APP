import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { EditAcceptPickupRequestSchema } from '@/form-schema/waste/garbage-pickup-schema-staff';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import z from "zod";
import { useGetDrivers, useGetCollectors, useGetTrucks } from './queries/garbagePickupStaffFetchQueries';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import { FormSelect } from '@/components/ui/form/form-select';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { useUpdateAssignmentCollectorsAndSchedule } from './queries/garbagePickupStaffUpdateQueries';
import { LoadingState } from '@/components/ui/loading-state';
import { LoadingModal } from '@/components/ui/loading-modal';

export default function EditAssignmentForm() {
    const params = useLocalSearchParams();
    const pick_id = String(params.pick_id)
    const acl_ids = typeof params.acl_id === 'string' ? params.acl_id.split(',') : [];
    const collectorIds = params.collector_ids ? (params.collector_ids as string).split(',') : [];
    const router = useRouter();
    const {data: trucks = [], isPending: pendingTrucks} = useGetTrucks()
    const {data: drivers = [], isPending: pendingDrivers} = useGetDrivers()
    const {data: collectors = [], isPending: pendingCollectors} = useGetCollectors()
    const {mutate: updateAssignment, isPending} = useUpdateAssignmentCollectorsAndSchedule();

    const { control, handleSubmit } = useForm({
      resolver: zodResolver(EditAcceptPickupRequestSchema),
      defaultValues: {
        driver: String(params.driver_id),
        collectors: collectorIds,
        truck: String(params.truck_id),
        date: String(params.date),
        time: String(params.time),
      }
    });

    const collectorOptions = collectors.map(collector => ({
        id: collector.id,  
        name: `${collector.firstname} ${collector.lastname}`  
    }));

    const driverOptions = drivers.map(driver => ({
        label: `${driver.firstname} ${driver.lastname}`,  
        value: driver.id  
    }));

    const truckOptions = trucks.filter(truck => truck.truck_status == "Operational").map(truck => ({
        label: `Model: ${truck.truck_model}, Plate Number: ${truck.truck_plate_num}`,
        value: String(truck.truck_id)
    }));

    if(pendingTrucks || pendingDrivers || pendingCollectors){
        return(
        <_ScreenLayout
            customLeftAction={
                <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={30} className="text-black" />
                </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Accept Garbage Pickup Request</Text>}
            showExitButton={false}
        >
            <View className="flex-1 justify-center items-center">
                <LoadingState/>
            </View>
        </_ScreenLayout>
        )
    }
    
    const onSubmit = (values: z.infer<typeof EditAcceptPickupRequestSchema>) => {
         updateAssignment({
            pick_id,
            acl_ids, 
            values: {
                driver: values.driver,
                truck: values.truck,
                date: values.date,
                time: values.time,
                collectors: values.collectors
            }
        })
    };

    return (
        <_ScreenLayout
        customLeftAction={
            <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} className="text-black" />
            </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Accept Garbage Pickup Request</Text>}
        showExitButton={false}
        >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="mb-8">
            <View className="space-y-4 p-6">

                <FormSelect
                    control = {control}
                    name="driver"
                    label="Driver Loader"
                    placeholder="Select a driver"
                    options={driverOptions}
                />

                <FormSelect
                    control={control}
                    name="truck"
                    label="Truck"
                    placeholder='Select a truck'
                    options={truckOptions}
                />

                <FormComboCheckbox
                    control={control}
                    name="collectors"
                    label="Loader(s)"
                    placeholder="Select collectors"
                    options={collectorOptions}
                />

                <FormDateTimeInput
                    control = {control}
                    name="date"
                    label="Date"
                    type = "date"
                />

                <FormDateTimeInput
                    control = {control}
                    name="time"
                    label="Time"
                    type = "time"
                />

                <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4">
                <Button
                    onPress={handleSubmit(onSubmit)}
                    className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
                >
                    <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                </Button>
                </View>
            </View>
            </View>
        </ScrollView>

        <LoadingModal visible={isPending} />
        
        </_ScreenLayout>
    );
}