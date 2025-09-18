import React from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormSelect } from '@/components/ui/form/form-select';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import _ScreenLayout from '@/screens/_ScreenLayout';
import WasteColSchedSchema from '@/form-schema/waste/waste-collection';
import { useGetWasteCollectors } from './queries/waste-col-fetch-queries';
import { useGetWasteDrivers } from './queries/waste-col-fetch-queries';
import { useGetWasteTrucks } from './queries/waste-col-fetch-queries';
import { useGetWasteSitio } from './queries/waste-col-fetch-queries';
import { useCreateWasteSchedule } from './queries/waste-col-add-queries';
import { useAssignCollectors } from './queries/waste-col-add-queries';
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
  const { data: wasteCollectionData = [], isLoading: isLoadingWasteData} = useGetWasteCollectionSchedFull();

  const isLoading = isLoadingCollectors || isLoadingDrivers || isLoadingTrucks || isLoadingSitios || isLoadingWasteData;


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
            day: '',
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
        const [hour, minute] = values.time.split(":");
        const formattedTime = `${hour}:${minute}:00`;

        //checks for sitio with the same day
        const selectedSitioName = sitioOptions.find(sitio => sitio.value === values.selectedSitios)?.label; 
        

        const hasSameSitioSameDay = wasteCollectionData.some(schedule => 
            schedule.wc_day === values.day &&
            schedule.sitio_name === selectedSitioName
        );

        //checks for overlapping day and time
        const hasDuplicateSchedule = wasteCollectionData.some(schedule => 
            schedule.wc_day === values.day && 
            schedule.wc_time === formattedTime
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
      loading={isPending || isLoading}
      loadingMessage={ isPending ? "Creating schedule..." : "Loading..."}

      footer={
            <TouchableOpacity
              className="bg-primaryBlue py-4 rounded-md w-full items-center"
              onPress={form.handleSubmit(onSubmit)}
            >
              <Text className="text-white text-base font-semibold">Schedule</Text>
            </TouchableOpacity>
      }
      stickyFooter={true}
    >
        <View className="w-full px-4">

            <FormSelect
                control={form.control}
                name="day"
                label="Collection Day"
                options={dayOptions}
            />

            <FormDateTimeInput
              control={form.control}
              label="Collection Time"
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