import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/button';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { CancelGarbagePickupSchema } from '@/form-schema/waste/garbage-pickup-schema-resident';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import {z} from "zod"
import { useCancelRequest } from './queries/garbagePickupInsertQueries';
import { useLocalSearchParams } from 'expo-router';

export default function GarbageCancelRequestForm() {
  const router = useRouter();
  const params = useLocalSearchParams()
  const garb_id = params.garb_id as string
  const {mutate: cancelRequest, isPending} = useCancelRequest()
  
  const { control,  handleSubmit,   formState: { errors },  setValue } = useForm({
    resolver: zodResolver(CancelGarbagePickupSchema),
    defaultValues: {
      reason: '',
      garb_id: garb_id
    }
  });

  const onSubmit = (values: z.infer<typeof CancelGarbagePickupSchema>) => {
    cancelRequest(values)
  };

  if (isPending) {
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
      stickyFooter={true}
      footer={
         <Button
              onPress={handleSubmit(onSubmit)}
              className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
            >
              <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
        </Button>
      }
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-8 p-4">
          <View className="space-y-4">
            <FormTextArea
                control={control}
                label="Reason for Cancellation"
                name="reason"
                placeholder="Enter reason"
            />
          </View>
        </View>
      </ScrollView>
    </_ScreenLayout>
  );
}