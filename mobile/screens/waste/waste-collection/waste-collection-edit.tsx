import React, { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormSelect } from '@/components/ui/form/form-select';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import WasteColSchedSchema from '@/form-schema/waste/waste-collection';
import { useGetWasteCollectors } from './queries/waste-col-fetch-queries';
import { useGetWasteDrivers } from './queries/waste-col-fetch-queries';
import { useGetWasteTrucks, type Trucks } from './queries/waste-col-fetch-queries';
import { useGetWasteSitio } from './queries/waste-col-fetch-queries';
import { useUpdateWasteSchedule } from './queries/waste-col-update-queries';
import { useUpdateCollectors } from './queries/waste-col-update-queries';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useGetWasteCollectionSchedFull } from './queries/waste-col-fetch-queries';


const dayOptions = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" }
];


function WasteColEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  const {
    wc_num,
    day,
    time,
    info,
    sitio,
    truck,
    driver,
    collectors_id
  } = params;
  
  let parsedCollectors: string[] = [];

  try {
    const parsed = JSON.parse(String(collectors_id));
    if (Array.isArray(parsed)) {
      parsedCollectors = parsed.map(String);
    }
  } catch (error) {
    console.warn("Failed to parse collectors_id:", error);
  }

  // FETCH QUERY MUTATIONS
  const { data: collectors = [], isLoading: isLoadingCollectors } = useGetWasteCollectors();
  const { data: drivers = [], isLoading: isLoadingDrivers } = useGetWasteDrivers();
  const { data: trucks = [], isLoading: isLoadingTrucks } = useGetWasteTrucks();
  const { data: sitios = [], isLoading: isLoadingSitios } = useGetWasteSitio(); 
  const { data: wasteCollectionData = [], isLoading: isLoadingWasteData} = useGetWasteCollectionSchedFull();

  const isLoading = isLoadingCollectors || isLoadingDrivers || isLoadingTrucks || isLoadingSitios || isLoadingWasteData;

  // UPDATE QUERY MUTATIONS
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateWasteSchedule();
  const { mutate: updateCollectors, isPending: isUpdatingCollectors } = useUpdateCollectors();

  // Options
  const collectorOptions = collectors.map(collector => ({
    id: collector.id,  
    name: `${collector.firstname} ${collector.lastname}`  
  }));

  const driverOptions = drivers.map(driver => ({
    label: `${driver.firstname} ${driver.lastname}`,  
    value: driver.id  
  }));

  const truckOptions = (trucks as Trucks[])
      .filter(truck => truck.truck_status === "Operational")
      .map(truck => ({
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
      day: String(day),
      time: String(time),
      additionalInstructions: String(info),
      selectedSitios: String(sitio),
      selectedCollectors: parsedCollectors,
      driver: String(driver),
      collectionTruck: String(truck),
      selectedAnnouncements: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof WasteColSchedSchema>) => {

    try {
      const [hour, minute] = values.time.split(":");
      const formattedTime = `${hour}:${minute}:00`;

      //checks for sitio with the same day
      const selectedSitioName = sitioOptions.find(sitio => sitio.value === values.selectedSitios)?.label; 
      
      const hasSameSitioSameDay = wasteCollectionData.some(schedule => 
          schedule.wc_day === values.day &&
          schedule.sitio_name === selectedSitioName &&
          schedule.wc_num !== Number(wc_num)          
      );

      //checks for overlapping day and time
      const hasDuplicateSchedule = wasteCollectionData.some(schedule => 
          schedule.wc_day === values.day && 
          schedule.wc_time === formattedTime &&
          schedule.wc_num !== Number(wc_num) 
      );     
      
      //return if there is overlapping schedule
      if (hasDuplicateSchedule) {
        
          form.setError("day", {
              type: "manual",
              message: `There is already a schedule for ${values.day} at ${values.time}.`,
          });          
          
          form.setError("time", {
              type: "manual",
              message: `There is already a schedule for ${values.day} at ${values.time}.`,
          });  

          return; 
      }           

      //return if the sitio has already a schedule for that day
      if (hasSameSitioSameDay) {
          form.setError("day", {
              type: "manual",
              message: `${selectedSitioName} already has a schedule on ${values.day}.`,
          });

          form.setError("selectedSitios", {
              type: "manual",
              message: `${selectedSitioName} already has a schedule on ${values.day}.`,
          });
          return;
      }        

      
      if(!values.additionalInstructions){
        values.additionalInstructions = "None"
      }      

      await new Promise<void>((resolve, reject) => {
        updateSchedule({
          wc_num: Number(wc_num),
          values: {
            ...values,
          }
        }, {
          onSuccess: () => {
            updateCollectors({
              wc_num: Number(wc_num),
              newCollectorIds: values.selectedCollectors.map(String),
              existingCollectorIds: parsedCollectors
            }, {
              onSuccess: () => {
                setIsEditing(false);
                resolve();
              },
              onError: reject
            });
          },
          onError: reject
        });
      });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <_ScreenLayout
      headerBetweenAction={<Text className="text-[13px]">Edit Waste Collection Schedule</Text>}
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
      loading={isLoading || isUpdating || isUpdatingCollectors}
      loadingMessage="Updating schedule..."
      footer={
        <View className="w-full">
          {!isEditing ? (
            <TouchableOpacity
              className="bg-primaryBlue py-3 rounded-md w-full items-center"
              onPress={() => setIsEditing(true)}
            >
              <Text className="text-white text-base font-semibold">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-white border border-primaryBlue py-3 rounded-md items-center"
                onPress={() => {
                  setIsEditing(false);
                  form.reset();
                }}
              >
                <Text className="text-primaryBlue text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    className="flex-1 bg-primaryBlue py-3 rounded-md items-center flex-row justify-center"
                    disabled={isUpdating || isUpdatingCollectors}
                  >
                    {isUpdating || isUpdatingCollectors ? (
                      <>
                        <Loader2 size={20} color="white" className="animate-spin mr-2" />
                        <Text className="text-white text-base font-semibold">Saving...</Text>
                      </>
                    ) : (
                      <Text className="text-white text-base font-semibold">Save</Text>
                    )}
                  </TouchableOpacity>
                }
                title="Confirm Save"
                description="Are you sure you want to save these changes?"
                actionLabel="Confirm"
                onPress={() => form.handleSubmit(onSubmit)()}
              />
            </View>
          )}
        </View>
      }
      stickyFooter={true}
    >
      <View className="w-full px-4">
        {/* Date Input */}
        <View className="relative">
          <FormSelect
              control={form.control}
              name="day"
              label="Collection Day"
              options={dayOptions}
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              activeOpacity={1}
              onPress={() => {}}
              style={{ backgroundColor: 'transparent', zIndex: 10 }}
            />
          )}
        </View>

        {/* Time Input */}
        <View className="relative">
          <FormDateTimeInput
            control={form.control}
            label="Collection Time"
            name="time"
            type="time"
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              activeOpacity={1}
              onPress={() => {}}
              style={{ backgroundColor: 'transparent', zIndex: 10 }}
            />
          )}
        </View>

        {/* Sitio Select */}
        <View className="relative">
          <FormSelect
            control={form.control}
            name="selectedSitios"
            label="Sitio"
            options={sitioOptions}
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              activeOpacity={1}
              onPress={() => {}}
              style={{ backgroundColor: 'transparent', zIndex: 10 }}
            />
          )}
        </View>

        {/* Collectors Checkbox */}
        <View className="pb-4 relative">
          <FormComboCheckbox
            control={form.control}
            name="selectedCollectors"
            label="Collectors"
            options={collectorOptions}
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              activeOpacity={1}
              onPress={() => {}}
              style={{ backgroundColor: 'transparent', zIndex: 10 }}
            />
          )}
        </View>

        {/* Driver Select */}
        <View className="relative">
          <FormSelect
            control={form.control}
            name="driver"
            label="Driver"
            options={driverOptions}
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              activeOpacity={1}
              onPress={() => {}}
              style={{ backgroundColor: 'transparent', zIndex: 10 }}
            />
          )}
        </View>

        {/* Truck Select */}
        <View className="relative">
          <FormSelect
            control={form.control}
            name="collectionTruck"
            label="Collection Truck"
            options={truckOptions}
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              activeOpacity={1}
              onPress={() => {}}
              style={{ backgroundColor: 'transparent', zIndex: 10 }}
            />
          )}
        </View>

        {/* Additional Notes */}
        <View className="relative">
          <FormTextArea
            control={form.control}
            name="additionalInstructions"
            label="Additional Notes"
            placeholder="Add notes (Optional)"
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              activeOpacity={1}
              onPress={() => {}}
              style={{ backgroundColor: 'transparent', zIndex: 10 }}
            />
          )}
        </View>
      </View>
    </_ScreenLayout>
  );
}

export default WasteColEdit;