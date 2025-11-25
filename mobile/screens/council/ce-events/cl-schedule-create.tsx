import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react-native";
import { AddEventFormSchema } from "../../../form-schema/council-event-schema";
import { useAddCouncilEvent } from "./ce-att-queries";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { FormInput } from "@/components/ui/form/form-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input";
import { formatDate } from "@/helpers/dateHelpers";
import { useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/screens/_PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingModal } from "@/components/ui/loading-modal"; // Import the LoadingModal

const CLCreateEvent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numRows, setNumberOfRows] = useState<number>(0);

  const { control, handleSubmit, trigger } = useForm({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: "",
      eventDate: format(new Date(), "yyyy-MM-dd"),
      roomPlace: "",
      eventTime: format(new Date(), "HH:mm"),
      eventDescription: "",
      numRows: 0,
    },
  });

  const addEventMutation = useAddCouncilEvent();

  const onSubmit = async (formData: any) => {
    const isValid = await trigger();
    if (!isValid) {
      return;
    }
    setIsSubmitting(true);
    try {
      const [hours, minutes] = formData.eventTime.split(":");
      const formattedTime = `${hours}:${minutes}:00`;
      const eventPayload = {
        ce_title: formData.eventTitle.trim(),
        ce_place: formData.roomPlace.trim(),
        ce_date: formatDate(formData.eventDate),
        ce_time: formattedTime,
        ce_description: formData.eventDescription.trim(),
        ce_is_archive: false,
        ce_rows: numRows,
        staff_id: user?.staff?.staff_id || null,
      };

      const newEvent = await addEventMutation.mutateAsync(eventPayload);

      queryClient.invalidateQueries({ queryKey: ["attendees", newEvent] });
      router.back();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Schedule Events</Text>}
      rightAction={<View />}
      footer={
        <View>
          <TouchableOpacity
            className="bg-primaryBlue py-3 rounded-lg"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text className="text-white text-base font-semibold text-center">
              {isSubmitting ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View className="flex-1 p-4 px-6">
        <FormInput
          control={control}
          name="eventTitle"
          label="Event Title"
          placeholder="Enter event title"
        />

        <FormDateInput control={control} name="eventDate" label="Event Date" />

        <FormInput
          control={control}
          name="roomPlace"
          label="Room/Place"
          placeholder="Enter room or place"
        />

        <FormDateTimeInput
          control={control}
          name="eventTime"
          label="Event Time"
          type="time"
        />

        <FormTextArea
          control={control}
          name="eventDescription"
          label="Event Description"
          placeholder="Enter description"
        />

        <View className="mt-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Expected number of attendees
          </Text>
          <TextInput
            className="border border-gray-300 rounded-md px-3 py-2 text-base"
            value={numRows.toString()}
            onChangeText={(text) => setNumberOfRows(parseInt(text) || 0)}
            keyboardType="numeric"
            placeholder="Enter number of rows needed"
          />
          <Text className="text-sm text-gray-500 mt-1">
            This will create empty rows for attendees to fill out manually
          </Text>
        </View>

        {/* Loading Modal for form submission */}
        <LoadingModal 
          visible={isSubmitting} 
        />
      </View>
    </PageLayout>
  );
};

export default CLCreateEvent;