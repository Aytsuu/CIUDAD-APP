import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/button';
import { FormInput } from "@/components/ui/form/form-input";
import _ScreenLayout from '@/screens/_ScreenLayout';
import IllegalDumpResSchema from '@/form-schema/waste/waste-illegal-dump-res';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import z from "zod";
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import { FormDateAndTimeInput } from '@/components/ui/form/form-date-time-input';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormSingleCheckbox } from '@/components/ui/form/form-single-checkbox';
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useEffect, useState } from 'react';
import { useGetWasteSitio } from '../queries/illegal-dump-fetch-queries';
import { useAddWasteReport } from '../queries/illegal-dum-add-queries';


export default function IllegalDumpCreateForm() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const { data: fetchedSitio = [], isLoading } = useGetWasteSitio();
  const { mutate: addReport, isPending: isCreating } = useAddWasteReport();


  const repMatterOptions = [
    {label: "Littering, Illegal dumping, Illegal disposal of garbage", value: "Littering, Illegal dumping, Illegal disposal of garbage"},
    {label: "Urinating, defecating, spitting in a public place", value: "Urinating, defecating, spitting in a public place"},
    {label: "Dirty frontage and immediate surroundings for establishment owners", value: "Dirty frontage and immediate surroundings for establishment owners"},
    {label: "Improper and untimely stacking of garbage outside residences or establishment", value: "Improper and untimely stacking of garbage outside residences or establishment"},
    {label: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)", value: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)"},
    {label: "Dirty public utility vehicles, or no trash can or receptacle", value: "Dirty public utility vehicles, or no trash can or receptacle"},
    {label: "Spilling, scattering, littering of wastes by public utility vehicles", value: "Spilling, scattering, littering of wastes by public utility vehicles"},
    {label: "Illegal posting or installed signage, billboards, posters, streamers and movie ads.", value: "Illegal posting or installed signage, billboards, posters, streamers and movie ads."},
  ];  

  const sitioOptions = fetchedSitio.map(sitio => ({
    value: sitio.sitio_id,  
    label: sitio.sitio_name 
  }));

  const { control,  handleSubmit,   formState: { errors },  setValue } = useForm({
    resolver: zodResolver(IllegalDumpResSchema),
    defaultValues: {
      sitio_id: '',
      rep_date: '',
      rep_location: '',
      rep_violator: '',
      rep_add_details: '',
      rep_matter: '',
      rep_anonymous: false,
    }
  });


  const onSubmit = (values: z.infer<typeof IllegalDumpResSchema>) => {

    const files = selectedImages.map((img: any) => ({
      name: img.name,
      type: img.type,
      file: img.file
    }))

    const allValues = {
      ...values,
      files      
    }

    addReport(allValues)
  };


  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Report Illegal Dumping</Text>}
      showExitButton={false}
      loading={ isLoading || isCreating }
      loadingMessage={
        isCreating ? "Submitting report..." : 
        "Loading..."
      }
      footer={
        <View className="w-full">
            <TouchableOpacity
                className="bg-primaryBlue py-3 rounded-md w-full items-center"
                onPress={handleSubmit(onSubmit)}
            >
                <Text className="text-white text-base font-semibold">Submit</Text>
            </TouchableOpacity>
        </View>        
      }
      stickyFooter={true}      
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-8 p-5">
          <View className="space-y-4">
            <FormSelect
              control={control}
              label="Sitio"
              name="sitio_id"
              options={sitioOptions}
              placeholder="Select Sitio"
            />

            <FormInput
              control={control}
              label="Location"
              name="rep_location"
              placeholder="Enter location"
            />
            
            <FormSelect
              control={control}
              label="Report Matter"
              name="rep_matter"
              options={repMatterOptions}
              placeholder="Select Report Matter"
            />

            <FormInput
              control={control}
              label="Violator"
              name="rep_violator"
              placeholder="Enter Violator"
            />            

            <FormDateAndTimeInput
              control={control}
              name="rep_date"
              label="Date and Time"
            />

            <FormTextArea
              control={control}
              label="Additional Notes"
              name="rep_add_details"
              placeholder='Add additional notes (optional)'
            />

            <View className="mb-6 mt-3">
              <Text className="text-[12px] font-PoppinsRegular pb-1">Add a Photo of report</Text>
              <MediaPicker
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                multiple={true}
                maxImages={3}
              /> 
            </View>

            <FormSingleCheckbox
                control={control}
                name="rep_anonymous"
                label="I prefer to remain anonymous"
            />

          </View>
        </View>
      </ScrollView>
    </_ScreenLayout>
  );
}