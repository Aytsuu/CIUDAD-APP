// import { FormInput } from "@/components/ui/form/form-input";
// import { minutesOfMeetingEditFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
// import _ScreenLayout from '@/screens/_ScreenLayout'
// import DocumentUploader, { DocumentFileType } from '@/components/ui/document-upload';
// import { View, TouchableOpacity, Text, ScrollView } from "react-native";
// import { useRouter } from "expo-router";
// import { ChevronLeft } from 'lucide-react-native';
// import { zodResolver } from "@hookform/resolvers/zod";
// import z from "zod"
// import { Button } from "@/components/ui/button";
// import { useForm } from "react-hook-form";
// import FormComboCheckbox from "@/components/ui/form/form-combo-checkbox";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input";
// import { useState, useEffect } from "react";
// import MultiImageUploader, { MediaFileType } from '@/components/ui/multi-media-upload';
// import { useLocalSearchParams } from "expo-router";
// import { useUpdateMinutesOfMeeting } from "./queries/MOMUpdateQueries";

// export default function MOMEdit(){
//     const router = useRouter();
//     const params = useLocalSearchParams();
    
//     // Destructure all params with proper type casting
//     const mom_id = String(params.mom_id);
//     const meetingAgenda = String(params.meetingAgenda || '');
//     const meetingTitle = String(params.meetingTitle || '');
//     const meetingDate = String(params.meetingDate || '');
//     const meetingFile = params.meetingFile ? String(params.meetingFile) : '';
//     const meetingAreas = params.meetingAreas ? JSON.parse(String(params.meetingAreas)) : [];
//     const meetingSuppDocs = params.meetingSuppDocs ? JSON.parse(String(params.meetingSuppDocs)) : [];
//     const {mutate: updateMOM, isPending} = useUpdateMinutesOfMeeting();
//     const parsedAreaOfFocus = Array.isArray(meetingAreas) ? meetingAreas : [];

//     const meetingAreaOfFocus = [
//         { id: "gad", name: "GAD" },
//         { id: "finance", name: "Finance" },
//         { id: "council", name: "Council" },
//         { id: "waste", name: "Waste" }
//     ];
    
    
//     const {control, handleSubmit, setValue} = useForm({
//          resolver: zodResolver(minutesOfMeetingEditFormSchema),
//          defaultValues: {
//             meetingTitle: meetingTitle,
//             meetingAgenda: meetingAgenda,
//             meetingDate: meetingDate,
//             meetingAreaOfFocus: parsedAreaOfFocus,
//             meetingFile: [],
//             meetingSuppDoc: [],
//          }
//     });

//     // Initialize document files (main document)
//     const [documentFiles, setDocumentFiles] = useState<DocumentFileType[]>(
//         meetingFile ? [{
//             id: `existing-main-doc`,
//             uri: meetingFile,
//             name: 'Meeting Minutes Document',
//             type: 'application/pdf', // Adjust based on actual type
//             size: 0,
//             path: '',
//             publicUrl: meetingFile,
//             status: 'uploaded'
//         }] : []
//     );

//     // Initialize supporting documents
//     const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>(
//         meetingSuppDocs.map((doc: any) => ({
//             id: `existing-${doc.momsp_id}`,
//             name: doc.momsp_name,
//             type: doc.momsp_type.includes('image') ? 'image' : 'file',
//             uri: doc.momsp_url,
//             path: doc.momsp_path,
//             publicUrl: doc.momsp_url,
//             status: 'uploaded'
//         })) || []
//     );

//     // const onSubmit = (values: z.infer<typeof minutesOfMeetingEditFormSchema>) => {
//     //     const formData = {
//     //         mom_id: mom_id,
//     //         mom_title: values.meetingTitle,
//     //         mom_agenda: values.meetingAgenda,
//     //         mom_date: values.meetingDate,
//     //         areas_of_focus: values.meetingAreaOfFocus,
//     //         file: documentFiles[0], // Assuming single file for main document
//     //         supporting_docs: mediaFiles
//     //     };
        
//     //     // updateMOM(formData, {
//     //     //     onSuccess: () => {
//     //     //         router.back();
//     //     //     }
//     //     // });
//     // };

//     const onSubmit = async (values: z.infer<typeof minutesOfMeetingEditFormSchema>) => {
//         console.log(values)
//     };
//     // Update form values when params change


//     return(
//         <_ScreenLayout
//             customLeftAction={
//                 <TouchableOpacity onPress={() => router.back()}>
//                     <ChevronLeft size={30} className="text-black" />
//                 </TouchableOpacity>
//             }
//             headerBetweenAction={<Text className="text-[13px]">Edit Minutes of Meeting</Text>}
//             showExitButton={false}
//             loading={isPending}
//             loadingMessage='Updating...'
//         >
//             <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//                 <View className="mb-8">
//                     <View className="space-y-4">
//                         <FormInput
//                             control={control}
//                             label="Meeting Title"
//                             name="meetingTitle"
//                             placeholder="Enter meeting title"
//                         />

//                         <FormInput
//                             control={control}
//                             label="Meeting Agenda"
//                             name="meetingAgenda"
//                             placeholder="Enter meeting agenda"
//                         />

//                         <FormDateTimeInput
//                             control={control}
//                             label="Meeting Date"
//                             name="meetingDate"
//                             type="date"
//                         />

//                         <FormComboCheckbox
//                             control={control}
//                             name="meetingAreaOfFocus"
//                             label="Area of Focus"
//                             options={meetingAreaOfFocus}
//                             placeholder="Select Areas of Focus"
//                         />   

//                         <View className="pt-5">
//                             <Text className="text-[13px] font-PoppinsRegular">Meeting File</Text>
//                             <DocumentUploader
//                                 mediaFiles={documentFiles}
//                                 setMediaFiles={setDocumentFiles}
//                                 maxFiles={1}
//                             />
//                         </View>

//                         <View className="pt-7">
//                             <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Documents</Text>
//                             <MultiImageUploader
//                                 mediaFiles={mediaFiles}
//                                 setMediaFiles={setMediaFiles}
//                             />
//                         </View>

//                         <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4 mt-5">
//                             <Button
//                                 onPress={handleSubmit(onSubmit)}
//                                 className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
//                             >
//                                 <Text className="text-white font-PoppinsSemiBold text-[16px]">Update</Text>
//                             </Button>
//                         </View>
//                     </View>
//                 </View>
//             </ScrollView>
//         </_ScreenLayout>
//     )
// }

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import _ScreenLayout from "@/screens/_ScreenLayout";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/form-input";
import FormComboCheckbox from "@/components/ui/form/form-combo-checkbox";
import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input";
import DocumentUploader, { DocumentFileType } from "@/components/ui/document-upload";
import MultiImageUploader, { MediaFileType } from "@/components/ui/multi-media-upload";
import { minutesOfMeetingEditFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
import { useUpdateMinutesOfMeeting } from "./queries/MOMUpdateQueries";

export default function MOMEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const mom_id = Number(params.mom_id);
  const momf_id = Number(params.momf_id || 0);

  const meetingTitle = String(params.meetingTitle || "");
  const meetingAgenda = String(params.meetingAgenda || "");
  const meetingDate = String(params.meetingDate || "");
  const meetingAreas = params.meetingAreas ? JSON.parse(String(params.meetingAreas)) : [];
  const meetingFile = String(params.meetingFile || "");
  const meetingSuppDocs = params.meetingSuppDocs ? JSON.parse(String(params.meetingSuppDocs)) : [];

  const parsedAreaOfFocus = Array.isArray(meetingAreas) ? meetingAreas : [];

    const [documentFiles, setDocumentFiles] = useState<DocumentFileType[]>(
        meetingFile
        ? [
            {
                id: `existing-main-doc`,
                uri: meetingFile,
                name: "Meeting Minutes Document",
                type: "application/pdf",
                size: 0,
                path: "",
                publicUrl: meetingFile,
                status: "uploaded",
            },
            ]
        : []
    );

    const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>(
        meetingSuppDocs.map((doc: any) => ({
        id: `existing-${doc.momsp_id}`,
        name: doc.momsp_name,
        type: doc.momsp_type.includes("image") ? "image" : "file",
        uri: doc.momsp_url,
        path: doc.momsp_path,
        publicUrl: doc.momsp_url,
        status: "uploaded",
        })) || []
    );

    const { mutate: updateMOM, isPending } = useUpdateMinutesOfMeeting();

    const areaOfFocusOptions = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste" },
    ];

    const form = useForm<z.infer<typeof minutesOfMeetingEditFormSchema>>({
        resolver: zodResolver(minutesOfMeetingEditFormSchema),
        mode: "onChange",
        defaultValues: {
        meetingTitle,
        meetingAgenda,
        meetingDate,
        meetingAreaOfFocus: parsedAreaOfFocus,
        meetingFile: [],
        meetingSuppDoc: [],
        mom_id,
        momf_id,
        },
    });

    const onSubmit = (values: z.infer<typeof minutesOfMeetingEditFormSchema>) => {
      updateMOM({
          mom_id,
          momf_id,
          meetingTitle: values.meetingTitle,
          meetingAgenda: values.meetingAgenda,
          meetingDate: values.meetingDate,
          meetingAreaOfFocus: values.meetingAreaOfFocus,
          documentFiles,
          mediaFiles,
      });
    };


    const handleFormSubmit = () => {
        form.setValue("meetingFile", documentFiles);
        form.setValue("meetingSuppDoc", mediaFiles);
        form.handleSubmit(onSubmit)();
    };

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Edit Minutes of Meeting</Text>}
      showExitButton={false}
      loading={isPending}
      loadingMessage="Updating..."
      footer={
        <Button
          className="bg-primaryBlue py-3 rounded-md w-full items-center"
          onPress={handleFormSubmit}
        >
          <Text className="text-white text-base font-semibold">Update</Text>
        </Button>
      }
      stickyFooter={true}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-8 space-y-4">
          <FormInput
            control={form.control}
            label="Meeting Title"
            name="meetingTitle"
            placeholder="Enter meeting title"
          />

          <FormInput
            control={form.control}
            label="Meeting Agenda"
            name="meetingAgenda"
            placeholder="Enter meeting agenda"
          />

          <FormDateTimeInput
            control={form.control}
            label="Meeting Date"
            name="meetingDate"
            type="date"
          />

          <FormComboCheckbox
            control={form.control}
            name="meetingAreaOfFocus"
            label="Area of Focus"
            options={areaOfFocusOptions}
            placeholder="Select Areas of Focus"
          />

          <View className="pt-5">
            <Text className="text-[13px] font-PoppinsRegular">Meeting File</Text>
            <DocumentUploader
              mediaFiles={documentFiles}
              setMediaFiles={setDocumentFiles}
              maxFiles={1}
            />
          </View>

          <View className="pt-7">
            <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Documents</Text>
            <MultiImageUploader mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />
          </View>
        </View>
      </ScrollView>
    </_ScreenLayout>
  );
}
