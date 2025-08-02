import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, ChevronLeft } from "lucide-react-native";
import { UpdateEventFormSchema } from "../../../form-schema/council-event-schema";
import { useAddCouncilEvent, useUpdateCouncilEvent } from "./queries";
import { useGetStaffList, useGetAttendees, Staff } from "./queries";
import { useUpdateAttendees, Attendee } from "./queries";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input";
import FormComboCheckbox from "@/components/ui/form/form-combo-checkbox";
import z from "zod";
import PageLayout from "@/screens/_PageLayout";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

type UpdateEventFormValues = z.infer<typeof UpdateEventFormSchema>;
type EventFormValues = UpdateEventFormValues;
type EventCategory = "meeting" | "activity" | undefined;

const normalizeString = (str: string) => str.trim().toLowerCase();

const CLSchedulePreview = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const event = useMemo(
    () => (params.event ? JSON.parse(params.event as string) : null),
    [params.event]
  );
  const isAdding = params.isAdding === "true";
  const isArchived = event?.is_archive || false;
  const [isEditMode, setIsEditMode] = useState(isAdding);
  const [selectedAttendees, setSelectedAttendees] = useState<Attendee[]>([]);
  const [initialAttendees, setInitialAttendees] = useState<Attendee[]>([]);

  const ceId = useMemo(() => event?.ce_id, [event]);
  const {
    data: attendees = [],
    isLoading: isAttendeesLoading,
    refetch,
  } = useGetAttendees(ceId);
  const { control, handleSubmit, reset, watch, getValues } =
    useForm<EventFormValues>({
      resolver: zodResolver(UpdateEventFormSchema),
      defaultValues: {
        eventTitle: event?.title || event?.ce_title || "",
        eventDate: event?.ce_date || format(new Date(), "yyyy-MM-dd"),
        roomPlace: event?.place || event?.ce_place || "",
        eventCategory: (event?.type ||
          event?.ce_type ||
          "meeting") as EventCategory,
        eventTime: event?.ce_time || format(new Date(), "HH:mm"),
        eventDescription: event?.description || event?.ce_description || "",
        staffAttendees: [],
      },
    });

  const eventCategory = watch("eventCategory");
  const staffAttendees = watch("staffAttendees") || [];

  const addEventMutation = useAddCouncilEvent(() => router.back());
  const updateEventMutation = useUpdateCouncilEvent(() => setIsEditMode(false));
  const { mutate: updateAttendees } = useUpdateAttendees();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();

  const staffOptions = useMemo(() => {
    const options = staffList.map((staff: Staff, index: number) => {
      const attendee = attendees.find(
        (a: any) =>
          normalizeString(a.atn_name) === normalizeString(staff.full_name) &&
          normalizeString(a.atn_designation) ===
            normalizeString(staff.position_title || "")
      );
      return {
        id: attendee
          ? String(attendee.atn_id)
          : String(staff.staff_id || index + 1),
        name: `${staff.full_name} (${
          staff.position_title || "No Designation"
        })`,
      };
    });
    console.log("Raw staffList:", staffList);
    console.log(
      "staffOptions:",
      options.map((o) => ({ id: o.id, name: o.name }))
    );
    return options;
  }, [staffList, attendees]);

  const selectedAttendeeDetails = useMemo(() => {
    const filteredAttendees = attendees.filter(
      (attendee: any) => String(attendee.ce_id) === String(ceId)
    );
    return filteredAttendees.map(
      (attendee: any) =>
        ({
          ce_title:
            attendee.ce_title || event?.ce_title || event?.title || "Unknown",
          atn_id: attendee.atn_id,
          ce_id: Number(attendee.ce_id),
          staff_id: attendee.staff_id || null,
          atn_name: attendee.atn_name,
          atn_designation: attendee.atn_designation || "No Designation",
          atn_present_or_absent: attendee.atn_present_or_absent || "Present",
        } as Attendee)
    );
  }, [attendees, ceId, event]);

  const getStaffById = (id: string): Staff | undefined => {
    const normalizedId = String(id).toUpperCase().trim();
    const attendee = attendees.find(
      (a: any) => String(a.atn_id) === normalizedId
    );
    if (attendee) {
      return staffList.find(
        (s) =>
          normalizeString(s.full_name) === normalizeString(attendee.atn_name) &&
          normalizeString(s.position_title || "") ===
            normalizeString(attendee.atn_designation || "")
      );
    }
    return staffList.find((s) => String(s.staff_id) === normalizedId);
  };

  useEffect(() => {
    if (!isAttendeesLoading && !isAdding && ceId && attendees.length > 0) {
      try {
        console.log("attendees in useEffect:", attendees);
        const attendeeIds = attendees
          .filter((a: any) => String(a.ce_id) === String(ceId))
          .map((a: any) => String(a.atn_id))
          .filter((id): id is string => id !== undefined && id !== null);
        console.log("Initialized staffAttendees with:", attendeeIds);
        reset({
          ...getValues(),
          staffAttendees: attendeeIds,
        });
        setSelectedAttendees(selectedAttendeeDetails);
        setInitialAttendees(selectedAttendeeDetails);
      } catch (error) {
        console.error("Error initializing staffAttendees:", error);
      }
    }
  }, [
    attendees,
    isAttendeesLoading,
    ceId,
    reset,
    selectedAttendeeDetails,
    isAdding,
    getValues,
  ]);

  useEffect(() => {
    if (
      isEditMode &&
      eventCategory === "meeting" &&
      staffAttendees.length &&
      ceId
    ) {
      const newAttendees = staffAttendees
        .map((id: string) => {
          const staff = getStaffById(id);
          if (!staff) {
            console.warn(`Skipping invalid staff id: ${id}`);
            return null;
          }
          const existingAttendee = selectedAttendeeDetails.find(
            (a) => a.atn_id === Number(id)
          );
          return {
            atn_id: existingAttendee?.atn_id || undefined,
            ce_id: Number(ceId),
            staff_id: null,
            atn_name: staff.full_name,
            atn_designation: staff.position_title || "No Designation",
            atn_present_or_absent:
              existingAttendee?.atn_present_or_absent || "Present",
            ce_title: event?.ce_title || event?.title || "Unknown",
          } as Attendee;
        })
        .filter((item): item is Attendee => item !== null);
      console.log("Updated selectedAttendees:", newAttendees);
      setSelectedAttendees(newAttendees);
    }
  }, [
    staffAttendees,
    selectedAttendeeDetails,
    isEditMode,
    eventCategory,
    ceId,
    event,
    staffList,
  ]);

  useEffect(() => {
    if (eventCategory === "activity") {
      reset({
        ...getValues(),
        staffAttendees: [],
      });
      setSelectedAttendees([]);
    }
  }, [eventCategory, reset, getValues]);

  const haveAttendeesChanged = () => {
    const hasChanged =
      selectedAttendees.length !== initialAttendees.length ||
      selectedAttendees.some((a, i) => {
        const initial = initialAttendees[i];
        if (!initial) return true;
        return (
          a.atn_id !== initial.atn_id ||
          a.atn_name !== initial.atn_name ||
          a.atn_designation !== initial.atn_designation ||
          a.atn_present_or_absent !== initial.atn_present_or_absent
        );
      });
    console.log(
      "haveAttendeesChanged:",
      hasChanged,
      "selectedAttendees:",
      selectedAttendees,
      "initialAttendees:",
      initialAttendees
    );
    return hasChanged;
  };

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
      ce_type: data.eventCategory || event?.ce_type || "meeting",
      ce_description:
        data.eventDescription?.trim() ||
        event?.ce_description ||
        event?.description ||
        "",
      ce_is_archive: isArchived,
      staff_id: null,
    };

    if (isAdding) {
      addEventMutation.mutate(eventData, {
        onSuccess: (newEventId) => {
          if (selectedAttendees.length && data.eventCategory === "meeting") {
            const attendeePayload = {
              ce_id: newEventId,
              attendees: selectedAttendees.map((a) => ({
                atn_name: a.atn_name,
                atn_designation: a.atn_designation,
                atn_present_or_absent: a.atn_present_or_absent || "Present",
              })),
            };
            console.log("updateAttendees payload (add):", attendeePayload);
            updateAttendees(attendeePayload);
          }
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
            if (
              data.eventCategory === "meeting" &&
              selectedAttendees.length &&
              haveAttendeesChanged()
            ) {
              const attendeePayload = {
                ce_id: ceId,
                attendees: selectedAttendees.map((a) => ({
                  atn_name: a.atn_name,
                  atn_designation: a.atn_designation,
                  atn_present_or_absent: a.atn_present_or_absent || "Present",
                })),
              };
              console.log("updateAttendees payload (edit):", attendeePayload);
              updateAttendees(attendeePayload, {
                onSuccess: () =>
                  refetch().catch((err) =>
                    console.error("Refetch error:", err.message)
                  ),
              });
            } else {
              console.log(
                "No attendee update triggered: eventCategory:",
                data.eventCategory,
                "selectedAttendees.length:",
                selectedAttendees.length,
                "haveAttendeesChanged:",
                haveAttendeesChanged()
              );
              refetch().catch((err) =>
                console.error("Refetch error:", err.message)
              );
            }
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
    >
      {isArchived && (
        <View className="bg-yellow-100 p-2 mb-4 mx-4 rounded-md">
          <Text className="text-yellow-800 text-center">
            This event is archived and cannot be modified
          </Text>
        </View>
      )}

      <View className="flex-1 p-4">
        <View className="space-y-4">
          <View className="relative">
            <FormInput
              control={control}
              name="eventTitle"
              label="Event Title"
              placeholder="Enter event title"
              returnKeyType="next"
              submitBehavior={
                isEditMode && !isArchived ? "newline" : "blurAndSubmit"
              }
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
              returnKeyType="next"
              submitBehavior={
                isEditMode && !isArchived ? "newline" : "blurAndSubmit"
              }
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
            <FormSelect
              control={control}
              name="eventCategory"
              label="Event Category"
              placeholder="Select category"
              options={[
                { label: "Meeting", value: "meeting" },
                { label: "Activity", value: "activity" },
              ]}
              disabled={true}
            />
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
              returnKeyType="done"
            />
            {(!isEditMode || isArchived) && (
              <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                style={{ backgroundColor: "transparent" }}
                onPress={() => {}}
              />
            )}
          </View>

          {eventCategory === "meeting" && (
            <View>
              <Text className="text-lg font-bold text-center text-gray-800 py-4">
                ATTENDEES
              </Text>
              {isAttendeesLoading || isStaffLoading ? (
                <View className="flex-row justify-center">
                  <Text className="text-gray-500 mr-2">
                    Loading attendees...
                  </Text>
                  <Loader2 size={20} color="gray" className="animate-spin" />
                </View>
              ) : (
                <>
                  <FormComboCheckbox
                    control={control}
                    name="staffAttendees"
                    label="Barangay Staff"
                    options={staffOptions}
                    readOnly={!isEditMode || isArchived}
                    placeholder="Select staff attendees"
                  />
                </>
              )}
              {/* {!isEditMode && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">Selected Attendees</Text>
                  <View className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                    {selectedAttendees.length > 0 ? (
                      selectedAttendees.map((attendee: Attendee, index: number) => (
                        <Text key={index} className="text-sm text-gray-900">
                          {attendee.atn_name} ({attendee.atn_designation})
                        </Text>
                      ))
                    ) : (
                      <Text className="text-sm text-gray-900">No attendees selected</Text>
                    )}
                  </View>
                </View>
              )} */}
            </View>
          )}

          <View className="px-4 pb-4 mt-40">
            {isEditMode ? (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-white border border-primaryBlue py-3 rounded-lg"
                  onPress={() => {
                    setIsEditMode(false);
                    reset({
                      ...getValues(),
                      staffAttendees: initialAttendees.map((a) =>
                        String(a.atn_id)
                      ),
                    });
                  }}
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
                          <Loader2
                            size={20}
                            color="white"
                            className="animate-spin mr-2"
                          />
                          <Text className="text-white text-sm font-semibold">
                            {addEventMutation.isPending
                              ? "Saving..."
                              : "Updating..."}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-white text-sm font-semibold">
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
        </View>
      </View>
    </PageLayout>
  );
};

export default CLSchedulePreview;
