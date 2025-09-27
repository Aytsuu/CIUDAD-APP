import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/button';
import { FormInput } from "@/components/ui/form/form-input";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { garbagePickupRequestCreateSchema } from '@/form-schema/waste/garbage-pickup-schema-resident';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import z from "zod";
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormSelect } from '@/components/ui/form/form-select';
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useGetSitio } from './queries/garbagePickupResidentFetchQueries';
import { useAddaGarbagePickupRequest } from './queries/garbagePickupResidentInsertQueries';
import { useAuth } from '@/contexts/AuthContext';

export default function GarbagePickupForm() {
  const {user} = useAuth()  
  const router = useRouter();
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const { data: fetchedSitio = [], isLoading: isLoadingSitio } = useGetSitio();
  const {mutate: addRequest, isPending} = useAddaGarbagePickupRequest()

  const wasteTypes = [
    {label: "Biodegradable Waste", value: "Biodegradable Waste"},
    {label: "Non-Biodegradable / Recyclable Waste", value: "Non-Biodegradable / Recyclable Waste"},
    {label: "Residual Waste", value: "Residual Waste"},
    {label: "Hazardous / Toxic Waste", value: "Hazardous / Toxic Waste"},
    {label: "Bulky Waste", value: "Bulky Waste"},
    {label: "Healthcare Waste", value: "Healthcare Waste"},
  ];

  const sitioOptions = fetchedSitio.map(sitio => ({
    value: sitio.sitio_id.toString(),  
    label: sitio.sitio_name 
  }));

  const { control,  handleSubmit,   formState: { errors },  setValue } = useForm({
    resolver: zodResolver(garbagePickupRequestCreateSchema),
    defaultValues: {
      sitio_id: '',
      garb_location: '',
      garb_pref_date: '',
      garb_pref_time: '',
      garb_waste_type: '',
      garb_additional_notes: '',
      rp_id: user?.rp  || ''
    }
  });

  const onSubmit = (values: z.infer<typeof garbagePickupRequestCreateSchema>) => {

    const files = selectedImages.map((media) => ({
        name: media.name,
        type: media.type,
        file: media.file
    }))

    addRequest({values, files})
  };

  if (isLoadingSitio) {
    return (
      <_ScreenLayout>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4">Loading...</Text>
        </View>
      </_ScreenLayout>
    );
  }

  return (
    <_ScreenLayout
      showExitButton={false}
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Request a Garbage Pickup</Text>}
      loading={isPending}
      loadingMessage='Loading...'
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-8 p-4">
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
              name="garb_location"
              placeholder="Enter location"
            />
            
            <FormSelect
              control={control}
              label="Waste Type"
              name="garb_waste_type"
              options={wasteTypes}
              placeholder="Select Waste Type"
            />
            
            <FormDateTimeInput
              control={control}
              label="Preferred Date"
              name="garb_pref_date"
              type="date"
              minimumDate={new Date(Date.now() + 86400000)}
            />

            <FormDateTimeInput
              control={control}
              label="Preferred Time"
              name="garb_pref_time"
              type="time"
            />

            <View className="mb-3 mt-3">
              <Text className="text-[12px] font-PoppinsRegular pb-1">Add a Photo of Items for Pickup</Text>
              {/* {errors.selectedImages && (
                <Text className="text-red-500 text-xs">
                  {errors.selectedImages.message}
                </Text>
              )} */}
              
              <MediaPicker
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                multiple={false}
                maxImages={1}
              /> 
            </View>

            <FormTextArea
              control={control}
              label="Additional Notes"
              name="garb_additional_notes"
              placeholder='Add additional notes (optional)'
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
    </_ScreenLayout>
  );
}