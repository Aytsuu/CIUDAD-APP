import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
import { LoadingModal } from '@/components/ui/loading-modal';

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

  return (
    <_ScreenLayout
      showExitButton={false}
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Request a Garbage Pickup</Text>}
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
        <View className="mb-8 p-6">
          <View className="space-y-4">
            <FormTextArea
                control={control}
                label="Reason for Cancellation"
                name="reason"
                placeholder="Enter reason"
            />
          </View>
        </View>
      <LoadingModal visible={isPending} />
      </ScrollView>
    </_ScreenLayout>
  );
}