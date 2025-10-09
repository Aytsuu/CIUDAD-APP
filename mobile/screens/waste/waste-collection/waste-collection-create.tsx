import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form/form-input';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormSelect } from '@/components/ui/form/form-select';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormTimeInput } from '@/components/ui/form/form-time-input';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import { FormDateAndTimeInput } from '@/components/ui/form/form-date-time-input';
import { SelectLayoutWithAdd } from '@/components/ui/select-searchadd-layout';
import { Textarea } from '@/components/ui/textarea';
import _ScreenLayout from '@/screens/_ScreenLayout';
import WasteColSchedSchema from '@/form-schema/waste/waste-collection';
import { useGetWasteCollectors } from './queries/waste-col-fetch-queries';
import { useGetWasteDrivers } from './queries/waste-col-fetch-queries';
import { useGetWasteTrucks } from './queries/waste-col-fetch-queries';
import { useGetWasteSitio } from './queries/waste-col-fetch-queries';
import { useCreateWasteSchedule } from './queries/waste-col-add-queries';
import { useAssignCollectors } from './queries/waste-col-add-queries';



function WasteColCreate() {
  const router = useRouter();

  //ADD QUERY MUTATIONS
  const { mutate: createSchedule, } = useCreateWasteSchedule();
  const { mutate: assignCollectors, isPending } = useAssignCollectors();
  

  //FETCH QUERY MUTATIONS
  const { data: collectors = [], isLoading: isLoadingCollectors } = useGetWasteCollectors();
  const { data: drivers = [], isLoading: isLoadingDrivers } = useGetWasteDrivers();
  const { data: trucks = [], isLoading: isLoadingTrucks } = useGetWasteTrucks();
  const { data: sitios = [], isLoading: isLoadingSitios } = useGetWasteSitio(); 

  const isLoading = isLoadingCollectors || isLoadingDrivers || isLoadingTrucks || isLoadingSitios;


    //Options
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


    const sitioOptions = sitios.map(sitio => ({
        label: sitio.sitio_name,  
        value: String(sitio.sitio_id)  
    }));


  const form = useForm<z.infer<typeof WasteColSchedSchema>>({
    resolver: zodResolver(WasteColSchedSchema),
        defaultValues: {
            date: '',
            time: '',
            additionalInstructions: '',
            selectedSitios: '',
            selectedCollectors: [],
            driver: '',
            collectionTruck: '',
            selectedAnnouncements: [],
        },
  });


    const onSubmit = (values: z.infer<typeof WasteColSchedSchema>) => {

        if(!values.additionalInstructions){
          values.additionalInstructions = "None"
        }
        
        createSchedule(
            {
            ...values,
            },
            {
                onSuccess: (wc_num) => {
                    assignCollectors(
                    {
                        wc_num: wc_num,
                        collectorIds: values.selectedCollectors
                    },
                    {
                        onSuccess: () => {
                            router.back();
                        }
                    }
                    );
                }
            }
        );
    };

  return (
    <_ScreenLayout
      headerBetweenAction={<Text className="text-[13px]">Schedule Waste Collection</Text>}
      headerAlign="left"

      showBackButton={true}
      showExitButton={false}
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }

      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"

      // State Management
      loading={isPending}
      loadingMessage="Creating schedule..."

      footer={
            <TouchableOpacity
              className="bg-primaryBlue py-3 rounded-md w-full items-center"
              onPress={form.handleSubmit(onSubmit)}
            >
              <Text className="text-white text-base font-semibold">Schedule</Text>
            </TouchableOpacity>
      }
      stickyFooter={true}
    >
        <View className="w-full px-4">

            <FormDateTimeInput
              control={form.control}
              label="Date"
              name="date"
              type="date"
              minimumDate={new Date(Date.now() + 86400000)}
            />

            <FormDateTimeInput
              control={form.control}
              label="Time"
              name="time"
              type="time"
            />

            <FormSelect
                control={form.control}
                name="selectedSitios"
                label="Sitio"
                options={sitioOptions}
            />

            <View className="pb-4">
              <FormComboCheckbox
                  control={form.control}
                  name="selectedCollectors"
                  label="Collectors"
                  options={collectorOptions}
              />
            </View>

            <FormSelect
                control={form.control}
                name="driver"
                label="Driver"
                options={driverOptions}
            />

            <FormSelect
                control={form.control}
                name="collectionTruck"
                label="Collection Truck"
                options={truckOptions}
            />    

            <FormTextArea
                control={form.control}
                name="additionalInstructions"
                label="Additional Notes"
                placeholder="Add notes (Optional)"
            />

        </View>
    </_ScreenLayout>
  );
}

export default WasteColCreate;