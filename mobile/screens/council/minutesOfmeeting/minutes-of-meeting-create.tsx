import { FormInput } from "@/components/ui/form/form-input";
import { minutesOfMeetingFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
import PageLayout from '@/screens/_PageLayout'
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from 'lucide-react-native';
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod"
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import FormComboCheckbox from "@/components/ui/form/form-combo-checkbox";
import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input";
import { useState } from "react";
import { useInsertMinutesOfMeeting } from "./queries/MOMInsertQueries";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import DocumentPickerComponent, {DocumentItem} from '@/components/ui/document-upload';
import { useAuth } from "@/contexts/AuthContext";
import { LoadingModal } from "@/components/ui/loading-modal";

export default function MOMCreate(){
    const {user} = useAuth()
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
            staff_id: user?.staff?.staff_id
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
        <PageLayout
            leftAction={
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </TouchableOpacity>
            }
            headerTitle={<Text className="text-gray-900 text-[13px]">Add New Minutes of Meeting</Text>}
            wrapScroll={false}
        >
            <View className="flex-1 bg-gray-50">
                <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                    <View className="mb-8">
                        <View>
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
                                maximumDate={new Date()}
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
                                    limit={10}
                                    editable={true}
                                />
                            </View>
                            
                        </View>

                        <View className="py-7 bg-white border-t border-gray-200">
                            <Button 
                                onPress={handleSubmit(onSubmit)}
                                className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
                            >
                                <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                            </Button>
                        </View>
                    </View>
                </ScrollView>

                <LoadingModal visible={isPending} />
            </View>
        </PageLayout>
    )
}