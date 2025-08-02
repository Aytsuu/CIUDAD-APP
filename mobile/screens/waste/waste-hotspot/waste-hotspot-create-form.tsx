import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/button';
import { FormInput } from "@/components/ui/form/form-input";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import z from "zod";
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormSelect } from '@/components/ui/form/form-select';
import { WasteHotspotSchema } from '@/form-schema/waste/waste-hots-form-schema';
import { useGetSitio, useGetWatchman } from './queries/hotspotFetchQueries';
import { useAddHotspot } from './queries/hotspotInsertQueries';

export default function WasteHotspotCreate() {
  const router = useRouter();
  const {data: fetchedSitio = [], isLoading: sitioLoading} = useGetSitio()
  const {data: fetchedWatchman = [], isLoading: watchmanLoading} = useGetWatchman()
  const {mutate: hotspot, isPending} = useAddHotspot()

  const watchmanOptions = fetchedWatchman.map(watchman => ({
    value: watchman.id,  
    label: `${watchman.firstname} ${watchman.lastname}`  
  }));

  const sitioOptions = fetchedSitio.map(sitio => ({
    value: sitio.sitio_id,
    label: sitio.sitio_name
  }))

  const { control,  handleSubmit } = useForm({
    resolver: zodResolver(WasteHotspotSchema),
    defaultValues: {
        date: '',
        start_time: '',
        end_time: '',
        additionalInstructions: '',
        sitio: '',
        selectedAnnouncements: [],
        watchman: '',
    }
  });

  const onSubmit = (values: z.infer<typeof WasteHotspotSchema>) => {
     hotspot(values)
  }

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">New Hotspot Assignment</Text>}
      showExitButton={false}
      loading={sitioLoading || watchmanLoading || isPending}
      loadingMessage={ isPending ? "Submitting..." : "Loading..."}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <View className="space-y-4">
  
            <FormSelect
              control={control}
              label="Watchman"
              name="watchman"
              options={watchmanOptions}
              placeholder="Select Watchman"
            />

            <FormSelect
              control={control}
              label="Sitio"
              name="sitio"
              options={sitioOptions}
              placeholder="Select Sitio"
            />
            
            <FormDateTimeInput
              control={control}
              label="Date"
              name="date"
              type="date"
              minimumDate={new Date(Date.now() + 86400000)}
            />

            <FormDateTimeInput
              control={control}
              label="Start Time"
              name="start_time"
              type="time"
            />

            <FormDateTimeInput
              control={control}
              label="End Time"
              name="end_time"
              type="time"
            />

            <FormTextArea
              control={control}
              label="Additional Notes"
              name="additionalInstructions"
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