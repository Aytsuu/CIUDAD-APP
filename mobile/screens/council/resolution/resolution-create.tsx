//RESOLUTION CREATE


import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form/form-input';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import DocumentUploader, { DocumentFileType } from '@/components/ui/document-upload';
import MultiImageUploader, { MediaFileType } from '@/components/ui/multi-media-upload';
import _ScreenLayout from '@/screens/_ScreenLayout';
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema';
import { useCreateResolution } from './queries/resolution-add-queries';


interface ResolutionCreateFormProps {
    onSuccess?: () => void; 
}

function ResolutionCreate({ onSuccess }: ResolutionCreateFormProps) {
    const router = useRouter();
    const [documentFiles, setDocumentFiles] = useState<DocumentFileType[]>([]);
    const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);
    
    // Create mutation
    const { mutate: createResolution, isPending } = useCreateResolution(() => {
        onSuccess?.();
        setTimeout(() => {
            router.back();
        }, 700);
    });

    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    const form = useForm<z.infer<typeof resolutionFormSchema>>({
        resolver: zodResolver(resolutionFormSchema),
        mode: 'onChange',
        defaultValues: {
            res_title: "",        
            res_date_approved: "",
            res_area_of_focus: [],
            res_file: [],
            res_supp_docs: []
        },
    });


    useEffect(() => {
        form.setValue('res_file', documentFiles.map(file => ({
            name: file.name,
            type: file.type,
            path: file.path,
            uri: file.publicUrl || file.uri
        })));
    }, [documentFiles, form]);  


    useEffect(() => {
        form.setValue('res_supp_docs', mediaFiles.map(file => ({
        name: file.name,
        type: file.type,
        path: file.path,
        uri: file.publicUrl || file.uri
        })));
    }, [mediaFiles, form]);


    const onSubmit = (values: z.infer<typeof resolutionFormSchema>) => {
        createResolution(values);
        // console.log("NEW RESOLUTION: ", values)
    };

    return (
        <_ScreenLayout
            headerBetweenAction={<Text className="text-[13px]">Add New Resolution</Text>}
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
            loading={isPending}
            loadingMessage="Saving resolution..."
            footer={
                <TouchableOpacity
                    className="bg-primaryBlue py-3 rounded-md w-full items-center"
                    onPress={form.handleSubmit(onSubmit)}
                >
                    <Text className="text-white text-base font-semibold">Save Resolution</Text>
                </TouchableOpacity>
            }
            stickyFooter={true}
        >
            <View className="w-full space-y-4 px-4 pt-5">
                {/* Resolution Title */}
                <FormTextArea
                    control={form.control}
                    name="res_title"
                    label="Resolution Title"  
                    placeholder="Enter Resolution Title" 
                />         

                {/* Resolution Date Approved */}
                <FormDateTimeInput
                    control={form.control}
                    name="res_date_approved"
                    label="Date Approved"
                    type="date"    
                />

                {/* TODO: Add file upload component for React Native */}
                {/* Currently not implemented as React Native requires different file handling */}

                {/* Resolution Area of Focus */}
                <FormComboCheckbox
                    control={form.control}
                    name="res_area_of_focus"
                    label="Select Area of Focus"
                    options={meetingAreaOfFocus}
                />                               

                <View className="pt-5">
                    <DocumentUploader
                        mediaFiles={documentFiles}
                        setMediaFiles={setDocumentFiles}
                        maxFiles={1}
                    />
                </View>

                <View className="pt-7">
                    <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Document</Text>
                    <MultiImageUploader
                        mediaFiles={mediaFiles}
                        setMediaFiles={setMediaFiles}
                        maxFiles={5}
                    />
                </View>
            </View>
        </_ScreenLayout>
    );
}

export default ResolutionCreate;