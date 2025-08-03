import _ScreenLayout from '@/screens/_ScreenLayout';
import { View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import MultiImageUploader, { MediaFileType } from '@/components/ui/multi-media-upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from "zod"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CreateBudgetPlanSuppDocs (){
    const router = useRouter();
    const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);
    

    return (
        <_ScreenLayout
            customLeftAction={
            <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={30} className="text-black" />
            </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Upload Supporting Documents</Text>}
            showExitButton={false}
            // loading={isPending}
            loadingMessage='Uploading Supporting Documents...'
            stickyFooter={true}
            footer={
                <Button
                    // onPress={handleSubmit(onSubmit)}
                    className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
                    >
                    <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                </Button>
            }
        >
            <SafeAreaView>
                <View className="mb-3 mt-3">
                <Text className="text-[12px] font-PoppinsRegular pb-1">Add Supporting Documents for the Budget Plan</Text>
                    {/* {errors.garb_image && (
                <Text className="text-red-500 text-xs">
                    {errors.garb_image.message}
                </Text>
                )} */}
                <MultiImageUploader
                    mediaFiles={mediaFiles}
                    setMediaFiles={setMediaFiles}
                    maxFiles={1}
                />
                </View>
                
                {/* <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4">
                    <Button
                    // onPress={handleSubmit(onSubmit)}
                    className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
                    >
                    <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                    </Button>
                </View> */}
            </SafeAreaView>
        </_ScreenLayout>
    )
}
