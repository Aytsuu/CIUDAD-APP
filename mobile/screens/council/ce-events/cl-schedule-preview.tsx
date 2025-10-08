import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react-native";
import { UpdateEventFormSchema } from "../../../form-schema/council-event-schema";
import { useAddCouncilEvent, useUpdateCouncilEvent } from "./ce-att-queries";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { FormInput } from "@/components/ui/form/form-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input";
import PageLayout from "@/screens/_PageLayout";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { EventFormValues } from "./ce-att-typeFile";

const CLSchedulePreview = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const event = useMemo(
  () => {
    const parsedEvent = params.event ? JSON.parse(params.event as string) : null;
    return parsedEvent;
  },
  [params.event]
);
  const isAdding = params.isAdding === "true";
  const isArchived = event?.is_archive || false;
  const [isEditMode, setIsEditMode] = useState(isAdding);
  const ceId = useMemo(() => event?.ce_id, [event]);

  const { control, handleSubmit, watch, setValue } = useForm<EventFormValues>({
    resolver: zodResolver(UpdateEventFormSchema),
    defaultValues: {
      eventTitle: event?.title || event?.ce_title || "",
      eventDate: event?.ce_date || format(new Date(), "yyyy-MM-dd"),
      roomPlace: event?.place || event?.ce_place || "",
      eventTime: event?.ce_time || format(new Date(), "HH:mm"),
      eventDescription: event?.description || event?.ce_description || "",
      numRows: event?.ce_rows || 0,
      staff_id: event?.staff_id,
    },
  });

  const addEventMutation = useAddCouncilEvent(() => router.back());
  const updateEventMutation = useUpdateCouncilEvent(() => setIsEditMode(false));
  const numRows = watch("numRows");

  const onSubmit = (data: EventFormValues) => {
    if (isArchived) return;
    const eventTime = data.eventTime || format(new Date(), "HH:mm");
    const [hour, minute] = eventTime.split(":");
    const formattedTime = `${hour}:${minute}:00`;

    const eventData = {
      ce_title:
        data.eventTitle?.trim() || event?.ce_title || event?.title || "",
      ce_place: data.roomPlace?.trim() || event?.ce_place || event?.place || "",
      ce_date:
        data.eventDate || event?.ce_date || format(new Date(), "yyyy-MM-dd"),
      ce_time: formattedTime,
      ce_description:
        data.eventDescription?.trim() ||
        event?.ce_description ||
        event?.description ||
        "",
      ce_is_archive: isArchived,
      ce_rows: data.numRows || 0,
      staff_id: data.staff_id || '00005250925',
    };

    if (isAdding) {
      addEventMutation.mutate(eventData, {
        onSuccess: () => {
          router.back();
        },
      });
    } else if (event && ceId) {
      updateEventMutation.mutate(
        {
          ce_id: ceId,
          eventInfo: eventData,
        },
        {
          onSuccess: () => {
            setIsEditMode(false);
          },
        }
      );
    }
  };
  

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>Schedule Events</Text>}
      rightAction={
        <TouchableOpacity>
          <ChevronLeft size={30} color="black" className="text-white" />
        </TouchableOpacity>
      }
      footer={
        <View>
          {isEditMode ? (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-white border border-primaryBlue py-3 rounded-lg"
                onPress={() => router.back()}
              >
                <Text className="text-primaryBlue text-base font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    className="flex-1 bg-primaryBlue py-3 rounded-lg flex-row justify-center items-center"
                    disabled={
                      addEventMutation.isPending ||
                      updateEventMutation.isPending
                    }
                  >
                    {addEventMutation.isPending ||
                    updateEventMutation.isPending ? (
                      <>
                        <Text className="text-white text-base font-semibold">
                          {addEventMutation.isPending
                            ? "Creating..."
                            : "Updating..."}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-white text-base font-semibold">
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                }
                title="Confirm Changes"
                description="Are you sure you want to save these changes?"
                actionLabel="Save"
                onPress={() => handleSubmit(onSubmit)()}
                loading={
                  addEventMutation.isPending || updateEventMutation.isPending
                }
              />
            </View>
          ) : (
            !isArchived && (
              <TouchableOpacity
                className="bg-primaryBlue py-3 rounded-lg"
                onPress={() => setIsEditMode(true)}
              >
                <Text className="text-white text-base font-semibold text-center">
                  Edit
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      }
    >
      {isArchived && (
        <View className="bg-yellow-100 p-4 mb-4 rounded-md">
          <Text className="text-yellow-800 text-center">
            This event is archived and cannot be modified
          </Text>
        </View>
      )}

      <View className="flex-1 p-4 px-6">
        <View className="space-y-4">
          <View className="relative">
            <FormInput
              control={control}
              name="eventTitle"
              label="Event Title"
              placeholder="Enter event title"
              editable={isEditMode && !isArchived}
            />
            {(!isEditMode || isArchived) && (
              <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                style={{ backgroundColor: "transparent" }}
                onPress={() => {}}
              />
            )}
          </View>

          <View className="relative">
            <FormDateInput
              control={control}
              name="eventDate"
              label="Event Date"
            />
            {(!isEditMode || isArchived) && (
              <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                style={{ backgroundColor: "transparent" }}
                onPress={() => {}}
              />
            )}
          </View>

          <View className="relative">
            <FormInput
              control={control}
              name="roomPlace"
              label="Room/Place"
              placeholder="Enter room or place"
              editable={isEditMode && !isArchived}
            />
            {(!isEditMode || isArchived) && (
              <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                style={{ backgroundColor: "transparent" }}
                onPress={() => {}}
              />
            )}
          </View>

          <View className="relative">
            <FormDateTimeInput
              control={control}
              name="eventTime"
              label="Event Time"
              type="time"
            />
            {(!isEditMode || isArchived) && (
              <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                style={{ backgroundColor: "transparent" }}
                onPress={() => {}}
              />
            )}
          </View>

          <View className="relative">
            <FormTextArea
              control={control}
              name="eventDescription"
              label="Event Description"
              placeholder="Enter description"
            />
            {(!isEditMode || isArchived) && (
              <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                style={{ backgroundColor: "transparent" }}
                onPress={() => {}}
              />
            )}
          </View>

          <View>
            {isEditMode && !isArchived ? (
              <View className="flex flex-col gap-2">
                <Text className="text-sm font-medium text-gray-700">
                  Expected number of attendees
                </Text>
                <FormInput
                  control={control}
                  name="numRows"
                  label=""
                  placeholder="Enter number of rows needed"
                  keyboardType="numeric"
                />
                <Text className="text-sm text-gray-500">
                  This will create rows for attendees to fill out manually
                </Text>
              </View>
            ) : (
              <View className="flex flex-col gap-2">
                <Text className="text-sm font-medium text-gray-700">
                  Expected Attendees
                </Text>
                <View className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                  <Text className="text-base text-gray-900">
                    {(numRows || 0) > 0 ? numRows : "No attendees expected"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
};

export default CLSchedulePreview;