import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useAuth } from '@/contexts/AuthContext';
import { LoadingModal } from '@/components/ui/loading-modal';
import { useAddHearingMinutes } from './queries/summonInsertQueries';

export default function HearingMinutesForm() {
  const {user} = useAuth()  
  const router = useRouter();
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const { mutate: addMinutes, isPending} = useAddHearingMinutes()


//   const onSubmit = (values: z.infer<typeof garbagePickupRequestCreateSchema>) => {

//     const files = selectedImages.map((media) => ({
//         name: media.name,
//         type: media.type,
//         file: media.file
//     }))

//     // addRequest({values, files})
//   };


  return (
    <_ScreenLayout
      showExitButton={false}
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Hearing Minutes Form</Text>}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-8 p-6">
          <View className="space-y-4">
          
            <View className="mb-3 mt-3">
              <Text className="text-[12px] font-PoppinsRegular pb-1">Add a Photo of Items for Pickup</Text>
              <MediaPicker
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                multiple={true}
              /> 
            </View>


            <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4">
              <Button
                // onPress={handleSubmit(onSubmit)}
                className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
              >
                <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
              </Button>
            </View>
          </View>
        </View>
        
        {/* <LoadingModal visible={isPending} /> */}
      </ScrollView>
    </_ScreenLayout>
  );
}