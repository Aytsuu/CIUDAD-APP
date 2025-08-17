import { FormInput } from "@/components/ui/form/form-input";
import { minutesOfMeetingFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
import _ScreenLayout from '@/screens/_ScreenLayout'
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from 'lucide-react-native';
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod"
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import FormComboCheckbox from "@/components/ui/form/form-combo-checkbox";
import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input";
import { useState, useEffect } from "react";
import { useInsertMinutesOfMeeting } from "./queries/MOMInsertQueries";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import DocumentPickerComponent, {DocumentItem} from '@/components/ui/document-upload';


export default function MOMCreate(){
    const router = useRouter();
    const {mutate: addMOM, isPending} = useInsertMinutesOfMeeting()
    const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<DocumentItem[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);

    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste" }
    ];
    
    const {control, handleSubmit, setValue} = useForm({
         resolver: zodResolver(minutesOfMeetingFormSchema),
         defaultValues: {
            meetingTitle: "",
            meetingAgenda: "",
            meetingDate: "",
            meetingAreaOfFocus: [],
         }
    })


    const onSubmit = (values: z.infer<typeof minutesOfMeetingFormSchema>) => {
        setFileError(null);
        if (selectedDocuments.length === 0) {
            setFileError("Meeting File is required.");
        } else {
            const suppDocs = selectedImages.map((media) => ({
                name: media.name,
                type: media.type,
                file: media.file
            }))

            const files = selectedDocuments.map((media) => ({
                name: media.name,
                type: media.type,
                file: media.file
            }))

            const payload = {
                ...values,
                files,
                suppDocs
            }

            addMOM(payload)
        }
    }


    return(
        <_ScreenLayout
            customLeftAction={
                <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={30} className="text-black" />
                </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Add New Minutes of Meeting</Text>}
            showExitButton={false}
            loading={isPending}
            loadingMessage='Submitting...'
            stickyFooter={true}
            footer={
                  <Button onPress={handleSubmit(onSubmit)}className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg">
                        <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                    </Button>
            }
        >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="mb-8">
                    <View className="space-y-4">

                            <FormInput
                                control={control}
                                label="Meeting Title"
                                name="meetingTitle"
                                placeholder="Enter meeting title"
                            />

                            <FormInput
                                control={control}
                                label="Meeting Agenda"
                                name="meetingAgenda"
                                placeholder="Enter meeting agenda"
                            />

                            <FormDateTimeInput
                                control={control}
                                label="Meeting Date"
                                name="meetingDate"
                                type="date"
                            />

                            <FormComboCheckbox
                                control={control}
                                name="meetingAreaOfFocus"
                                label="Area of Focus"
                                options={meetingAreaOfFocus}
                                placeholder="Select Areas of Focus"
                            />   

                            <View className="pt-5">
                                <Text className="text-[13px] font-PoppinsRegular">Meeting File</Text>
                                <DocumentPickerComponent
                                    selectedDocuments={selectedDocuments}
                                    setSelectedDocuments={setSelectedDocuments}
                                    multiple={false} 
                                    maxDocuments={1} 
                                />
                                {fileError && (
                                    <Text className="text-red-500 text-xs font-semibold">
                                        {fileError}
                                    </Text>
                                )}
                            </View>

                            <View className="pt-7">
                                <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Documents</Text>
                                <MediaPicker
                                    selectedImages={selectedImages}
                                    setSelectedImages={setSelectedImages}
                                    multiple={true}
                                />
                            </View>

                            {/* <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4 mt-5">
                                <Button
                                    onPress={handleSubmit(onSubmit)}
                                    className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
                                >
                                    <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                                </Button>
                            </View> */}
                    </View>
                </View>
            </ScrollView>

        </_ScreenLayout>
    )
}