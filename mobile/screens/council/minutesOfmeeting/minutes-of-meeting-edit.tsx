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
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import DocumentPickerComponent, {DocumentItem} from '@/components/ui/document-upload';
import { minutesOfMeetingEditFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
import { useUpdateMinutesOfMeeting } from "./queries/MOMUpdateQueries";

export default function MOMEdit() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const mom_id = Number(params.mom_id);
    const meetingTitle = String(params.meetingTitle || "");
    const meetingAgenda = String(params.meetingAgenda || "");
    const meetingDate = String(params.meetingDate || "");
    const meetingAreas = params.meetingAreas ? JSON.parse(String(params.meetingAreas)) : [];
    const meetingFile = params.meetingFile ? JSON.parse(String(params.meetingFile)) : [];
    const meetingSuppDocs = params.meetingSuppDocs ? JSON.parse(String(params.meetingSuppDocs)) : [];
    const parsedAreaOfFocus = Array.isArray(meetingAreas) ? meetingAreas : [];
    const [formError, setFormError] = useState<string | null>(null);

    const [selectedDocuments, setSelectedDocuments] = useState<DocumentItem[]>(
        meetingFile.map((file: any) => ({
        id: `existing-${file.momf_id}`,
        name: file.momf_name || `file-${file.momf_id}`,
        type: 'application/pdf',
        uri: file.momf_url
        }))
    );

    const [selectedImages, setSelectedImages] = useState<MediaItem[]>(
        meetingSuppDocs.map((file: any) => ({
        id: `existing-${file.momsp_id}`,
        name: file.momsp_name || `file-${file.momsp_id}`,
        type: 'image/jpeg',
        uri: file.momsp_url
        }))
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
        mom_id,
        },
    });

    const onSubmit = (values: z.infer<typeof minutesOfMeetingEditFormSchema>) => {
      setFormError(null);
      if(selectedDocuments.length === 0) {
          setFormError("Meeting File is required.");
          return;
      } 
      // updateMOM({
      //     mom_id,
      //     meetingTitle: values.meetingTitle,
      //     meetingAgenda: values.meetingAgenda,
      //     meetingDate: values.meetingDate,
      //     meetingAreaOfFocus: values.meetingAreaOfFocus,
      //     documentFiles,
      //     mediaFiles,
      // });
    };


    // const handleFormSubmit = () => {
    //     form.setValue("meetingFile", documentFiles);
    //     form.setValue("meetingSuppDoc", mediaFiles);
    //     form.handleSubmit(onSubmit)();
    // };

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
          // onPress={handleFormSubmit}
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
            <DocumentPickerComponent
                selectedDocuments={selectedDocuments}
                setSelectedDocuments={setSelectedDocuments}
                multiple={false} 
                maxDocuments={1} 
            />
            {formError && (
                <Text className="text-red-500 text-xs font-semibold">
                    {formError}
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
        </View>
      </ScrollView>
    </_ScreenLayout>
  );
}
