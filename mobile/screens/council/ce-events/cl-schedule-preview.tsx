import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { Loader2, ChevronLeft } from 'lucide-react-native';
import { UpdateEventFormSchema } from '../../../form-schema/council-event-schema';
import { useAddCouncilEvent, useUpdateCouncilEvent } from './queries';
import { useGetStaffList, useGetAttendees, Staff } from './queries';
import { useUpdateAttendees, Attendee } from './queries';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormTimeInput } from '@/components/ui/form/form-time-input';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import z from 'zod';
import ScreenLayout from "@/screens/_ScreenLayout"
import { ConfirmationModal } from '@/components/ui/confirmationModal';

type UpdateEventFormValues = z.infer<typeof UpdateEventFormSchema>;
type EventFormValues = UpdateEventFormValues;
type EventCategory = 'meeting' | 'activity' | undefined;

const CLSchedulePreview = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log('Raw params.event:', params.event);
  const event = params.event ? JSON.parse(params.event as string) : null;
  const isAdding = params.isAdding === 'true';
  const isArchived = event?.is_archive || false;
  const [isEditMode, setIsEditMode] = useState(isAdding);
  const [selectedAttendees, setSelectedAttendees] = useState<Attendee[]>([]);
  const [initialAttendees, setInitialAttendees] = useState<Attendee[]>([]);

  const ceId = useMemo(() => event?.ce_id, [event]);
  console.log('Current ceId:', ceId);
  console.log('Event object from params:', event);
  console.log('isArchived:', isArchived);
  console.log('isEditMode:', isEditMode);

  const { data: attendees = [], isLoading: isAttendeesLoading, refetch, error } = useGetAttendees(ceId);
  console.log('Attendees from useGetAttendees:', attendees);
  console.log('useGetAttendees error:', error?.message, 'ceId:', ceId);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(UpdateEventFormSchema),
    defaultValues: {
      eventTitle: event?.title || event?.ce_title || '',
      eventDate: event?.ce_date || format(new Date(), 'yyyy-MM-dd'),
      roomPlace: event?.place || event?.ce_place || '',
      eventCategory: (event?.type || event?.ce_type || 'meeting') as EventCategory,
      eventTime: event?.ce_time || format(new Date(), 'HH:mm'),
      eventDescription: event?.description || event?.ce_description || '',
      staffAttendees: [],
    },
  });

  const eventCategory = watch('eventCategory');
  const staffAttendees = watch('staffAttendees') || [];

  console.log('Current eventCategory:', eventCategory);
  console.log('Original event ce_type:', event?.ce_type);
  console.log('Full event object:', JSON.stringify(event, null, 2));

  const addEventMutation = useAddCouncilEvent(() => router.back());
  const updateEventMutation = useUpdateCouncilEvent(() => {
    setIsEditMode(false);
  });
  const { mutate: updateAttendees } = useUpdateAttendees();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();

  const staffOptions = useMemo(() => {
    return staffList.map((staff: Staff) => ({
      id: staff.staff_id,
      name: `${staff.full_name} (${staff.position_title || 'No Designation'})`,
    }));
  }, [staffList]);

  const selectedAttendeeDetails = useMemo(() => {
    const filteredAttendees = attendees.filter((attendee: any) => attendee.ce_id === ceId);
    console.log('Filtered selectedAttendeeDetails:', filteredAttendees);
    return filteredAttendees.map((attendee: any): Attendee => ({
      atn_id: attendee.atn_id,
      ce_id: attendee.ce_id,
      staff_id: attendee.staff_id,
      atn_name: attendee.atn_name,
      atn_designation: attendee.atn_designation || 'No Designation',
      atn_present_or_absent: attendee.atn_present_or_absent || 'Present',
    }));
  }, [attendees, ceId]);

  const getStaffById = (id: string): Staff | undefined => {
    const normalizedId = String(id).toUpperCase().trim();
    return staffList.find(s => s.staff_id === normalizedId);
  };

  // Initialize form with attendees and handle empty case
  useEffect(() => {
    if (!isAttendeesLoading && !isAdding && ceId) {
      const attendeeIds = attendees
        .filter((a: any) => a.ce_id === ceId)
        .map((a: any) => a.staff_id)
        .filter((id: string | null): id is string => id !== null);
      console.log('Attendee IDs from API:', attendeeIds);
      setValue('staffAttendees', attendeeIds);
      setSelectedAttendees(selectedAttendeeDetails);
      setInitialAttendees(selectedAttendeeDetails);
      console.log('Initialized staffAttendees with:', attendeeIds);
      console.log('Initialized selectedAttendees with:', selectedAttendeeDetails);
      console.log('Stored initialAttendees:', selectedAttendeeDetails);
    }
  }, [attendees, isAttendeesLoading, ceId, setValue, selectedAttendeeDetails, isAdding]);

  // Update selectedAttendees in edit mode
  useEffect(() => {
    if (isEditMode && eventCategory === 'meeting' && staffAttendees.length) {
      const newAttendees = staffAttendees
        .map((id: string) => {
          const staff = getStaffById(id);
          if (!staff) {
            console.warn(`Skipping invalid staff_id: ${id}`);
            return null;
          }
          const existingAttendee = selectedAttendeeDetails.find(a => a.staff_id === staff.staff_id);
          return {
            atn_id: existingAttendee?.atn_id,
            ce_id: ceId,
            staff_id: staff.staff_id,
            atn_name: staff.full_name,
            atn_designation: staff.position_title || 'No Designation',
            atn_present_or_absent: existingAttendee?.atn_present_or_absent || 'Present',
          };
        })
        .filter((item): item is Attendee => item !== null);
      setSelectedAttendees(newAttendees);
      console.log('Updated selectedAttendees in edit mode:', newAttendees);
    }
  }, [staffAttendees, selectedAttendeeDetails, isEditMode, eventCategory, ceId]);

  // Clear attendees for 'activity' category
  useEffect(() => {
    if (eventCategory === 'activity') {
      setValue('staffAttendees', []);
      setSelectedAttendees([]);
      console.log('Cleared staffAttendees and selectedAttendees for activity category');
    }
  }, [eventCategory, setValue]);

  // Compare attendees for changes
  const haveAttendeesChanged = () => {
    if (selectedAttendees.length !== initialAttendees.length) return true;
    return selectedAttendees.some((a, i) => {
      const initial = initialAttendees[i];
      return (
        a.staff_id !== initial.staff_id ||
        a.atn_name !== initial.atn_name ||
        a.atn_designation !== initial.atn_designation ||
        a.atn_present_or_absent !== initial.atn_present_or_absent
      );
    });
  };

  const onSubmit = (data: EventFormValues) => {
    if (isArchived) {
      console.log('Blocked submit due to archived event');
      return;
    }

    const eventTime = data.eventTime || format(new Date(), 'HH:mm');
    const [hour, minute] = eventTime.split(':');
    const formattedTime = `${hour}:${minute}:00`;

    // Ensure staffAttendees is an array
    if (!data.staffAttendees || !Array.isArray(data.staffAttendees)) {
      setValue('staffAttendees', []);
      console.log('Set staffAttendees to empty array due to invalid value');
    }

    const eventData = {
      ce_title: data.eventTitle?.trim() || event?.ce_title || event?.title || '',
      ce_place: data.roomPlace?.trim() || event?.ce_place || event?.place || '',
      ce_date: data.eventDate || event?.ce_date || format(new Date(), 'yyyy-MM-dd'),
      ce_time: formattedTime,
      ce_type: data.eventCategory || event?.ce_type || 'meeting',
      ce_description: data.eventDescription?.trim() || event?.ce_description || event?.description || '',
      ce_is_archive: isArchived,
      staff_id: null,
    };

    if (isAdding) {
      addEventMutation.mutate(eventData, {
        onSuccess: (newEventId) => {
          console.log('New event created with ce_id:', newEventId);
          if (selectedAttendees.length && data.eventCategory === 'meeting') {
            const attendeePayload = {
              ce_id: newEventId,
              attendees: selectedAttendees.map((a) => ({
                atn_id: a.atn_id,
                ce_id: newEventId,
                staff_id: a.staff_id,
                atn_name: a.atn_name,
                atn_designation: a.atn_designation,
                atn_present_or_absent: a.atn_present_or_absent || 'Present',
              })),
            };
            console.log('Sending attendee payload for new event:', attendeePayload);
            updateAttendees(attendeePayload, {
              onSuccess: () => {
                console.log('Attendees updated for new event');
              },
            });
          }
          router.back();
        },
      });
    } else if (event && ceId) {
      updateEventMutation.mutate({
        ce_id: event.ce_id,
        eventInfo: eventData,
      }, {
        onSuccess: () => {
          console.log('Event updated:', eventData);
          // Preserve selectedAttendees if unchanged
          if (!haveAttendeesChanged()) {
            setSelectedAttendees(initialAttendees);
            console.log('Preserved selectedAttendees as initialAttendees:', initialAttendees);
          }
          if (data.eventCategory === 'meeting' && selectedAttendees.length && haveAttendeesChanged()) {
            const attendeePayload = {
              ce_id: event.ce_id,
              attendees: selectedAttendees.map((a) => ({
                atn_id: a.atn_id,
                ce_id: event.ce_id,
                staff_id: a.staff_id,
                atn_name: a.atn_name,
                atn_designation: a.atn_designation,
                atn_present_or_absent: a.atn_present_or_absent || 'Present',
              })),
            };
            console.log('Sending attendee payload for existing event:', attendeePayload);
            updateAttendees(attendeePayload, {
              onSuccess: () => {
                console.log('Attendees updated for existing event, refetching attendees for ceId:', ceId);
                refetch().catch((err) => console.error('Refetch error:', err.message, 'ceId:', ceId));
              },
            });
          } else {
            console.log('No attendee changes detected or no attendees selected, refetching attendees for ceId:', ceId);
            refetch().catch((err) => console.error('Refetch error:', err.message, 'ceId:', ceId));
          }
          setIsEditMode(false);
          console.log('Post-save selectedAttendees:', selectedAttendees);
          console.log('Post-save staffAttendees:', staffAttendees);
        },
      });
    }
  };

  return (
    <ScreenLayout
       customLeftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" className="text-black" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Edit Event</Text>}
        showExitButton={false}
        headerAlign="left"
        keyboardAvoiding={false}
        contentPadding="medium"
      scrollable={false}
    >
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        {isArchived && (
          <View className="bg-yellow-100 p-2 mb-4 mx-4 rounded-md">
            <Text className="text-yellow-800 text-center">This event is archived and cannot be modified</Text>
          </View>
        )}

        <ScrollView className="flex-1 px-4 py-4">
          <View className="space-y-4">
            <View className="relative">
              <FormInput
                control={control}
                name="eventTitle"
                label="Event Title"
                placeholder="Enter event title"
                returnKeyType="next"
                submitBehavior={isEditMode && !isArchived ? 'newline' : 'blurAndSubmit'}
              />
              {(!isEditMode || isArchived) && (
                <TouchableOpacity
                  className="absolute top-0 left-0 right-0 bottom-0"
                  style={{ backgroundColor: 'transparent' }}
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
                  style={{ backgroundColor: 'transparent' }}
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
                submitBehavior={isEditMode && !isArchived ? 'newline' : 'blurAndSubmit'}
              />
              {(!isEditMode || isArchived) && (
                <TouchableOpacity
                  className="absolute top-0 left-0 right-0 bottom-0"
                  style={{ backgroundColor: 'transparent' }}
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
                  { label: 'Meeting', value: 'meeting' },
                  { label: 'Activity', value: 'activity' },
                ]}
              />
              {(!isEditMode || isArchived) && (
                <TouchableOpacity
                  className="absolute top-0 left-0 right-0 bottom-0"
                  style={{ backgroundColor: 'transparent' }}
                  onPress={() => {}}
                />
              )}
            </View>

            <View className="relative">
              <FormTimeInput
                control={control}
                name="eventTime"
                label="Event Time"
                mode="24h"
                returnKeyType="next"
              />
              {(!isEditMode || isArchived) && (
                <TouchableOpacity
                  className="absolute top-0 left-0 right-0 bottom-0"
                  style={{ backgroundColor: 'transparent' }}
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
                  style={{ backgroundColor: 'transparent' }}
                  onPress={() => {}}
                />
              )}
            </View>

            {eventCategory === 'meeting' && (
              <View>
                <Text className="text-lg font-bold text-center text-gray-800 py-4">ATTENDEES</Text>
                {isAttendeesLoading || isStaffLoading ? (
                  <View className="flex-row justify-center">
                    <Text className="text-gray-500 mr-2">Loading attendees...</Text>
                    <Loader2 size={20} color="gray" className="animate-spin" />
                  </View>
                ) : (
                  <FormComboCheckbox
                    control={control}
                    name="staffAttendees"
                    label="Barangay Staff"
                    options={staffOptions}
                    readOnly={!isEditMode || isArchived}
                    placeholder="Select staff attendees"
                  />
                )}
                {!isEditMode && (
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
                )}
              </View>
            )}

            <View className="flex-row justify-end space-x-2 gap-3 mt-4">
              {isEditMode ? (
                <>
                  <TouchableOpacity
                    className="px-6 py-3 bg-gray-200 rounded-lg flex-row items-center"
                    onPress={() => {
                      setIsEditMode(false);
                      reset();
                    }}
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>

                  <ConfirmationModal
                    trigger={
                      <TouchableOpacity
                        className="px-4 py-2 bg-blue-500 rounded-lg flex-row items-center"
                        disabled={addEventMutation.isPending || updateEventMutation.isPending}
                      >
                        <Text className="text-white">{addEventMutation.isPending || updateEventMutation.isPending ? 'Saving' : 'Save'}</Text>
                        {(addEventMutation.isPending || updateEventMutation.isPending) && <Loader2 size={16} color="white" className="ml-2 animate-spin" />}
                      </TouchableOpacity>
                    }
                    title="Confirm Changes"
                    description="Are you sure you want to save these changes?"
                    actionLabel="Save"
                    onPress={() => handleSubmit(onSubmit)()}
                    loading={addEventMutation.isPending || updateEventMutation.isPending}
                  />
                </>
              ) : (
                <>
                  {!isArchived && (
                    <TouchableOpacity
                      className="px-6 py-3 bg-blue-500 rounded-lg flex-row items-center"
                      onPress={() => setIsEditMode(true)}
                    >
                      <Text className="text-white text-lg font-medium">Edit</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

export default CLSchedulePreview;