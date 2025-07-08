import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { Loader2, ChevronLeft } from 'lucide-react-native';
import { AddEventFormSchema } from '../../../form-schema/council-event-schema';
import { useAddCouncilEvent, useAddAttendee } from './queries';
import { useGetStaffList } from './queries';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormTimeInput } from '@/components/ui/form/form-time-input';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { formatDate } from '@/helpers/dateFormatter';
import type { Staff } from './queries';
import { useQueryClient } from '@tanstack/react-query';
import ScreenLayout from "@/screens/_ScreenLayout"

const CLCreateEvent = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, trigger } = useForm({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: '',
      eventDate: format(new Date(), 'yyyy-MM-dd'),
      roomPlace: '',
      eventCategory: 'meeting',
      eventTime: format(new Date(), 'HH:mm'),
      eventDescription: '',
      staffAttendees: [],
    },
  });

  const eventCategory = watch('eventCategory');
  const staffAttendees = watch('staffAttendees');

  const addEventMutation = useAddCouncilEvent();
  const addAttendeeMutation = useAddAttendee();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();

  // Log staffList to verify available staff IDs
  console.log('Staff List:', staffList.map(s => ({
    staff_id: s.staff_id,
    full_name: s.full_name,
    position_title: s.position_title,
  })));

  const staffOptions = useMemo(() => {
    return staffList.map((staff: Staff) => ({
      id: staff.staff_id,
      name: `${staff.full_name} (${staff.position_title || 'No Designation'})`,
    }));
  }, [staffList]);

  const selectedAttendeeDetails = useMemo(() => {
    // Log selected staffAttendees to verify input
    console.log('Selected staffAttendees:', staffAttendees);
    return staffAttendees.map((staffId: string) => {
      const staff = staffList.find(s => s.staff_id.toLowerCase() === staffId.toLowerCase());
      return {
        staff_id: staffId,
        atn_name: staff?.full_name || 'Unknown',
        atn_designation: staff?.position_title || 'No Designation',
      };
    });
  }, [staffAttendees, staffList]);

  const handlePreview = async () => {
    const isValid = await trigger();
    if (isValid) {
      console.log('Form Data Preview:', watch());
    } else {
      console.log('Form Errors:', control._formState.errors);
    }
  };

  const onSubmit = async (formData: any) => {
    const isValid = await trigger();
    if (!isValid) {
      console.log('Form Errors:', control._formState.errors);
      return;
    }
    setIsSubmitting(true);
    try {
      const [hours, minutes] = formData.eventTime.split(':');
      const formattedTime = `${hours}:${minutes}:00`;
      const eventPayload = {
        ce_title: formData.eventTitle.trim(),
        ce_place: formData.roomPlace.trim(),
        ce_date: formatDate(formData.eventDate),
        ce_time: formattedTime,
        ce_type: formData.eventCategory,
        ce_description: formData.eventDescription.trim(),
        ce_is_archive: false,
        staff_id: null,
      };
      console.log('Sending Event Payload to DB:', eventPayload);

      const newEvent = await addEventMutation.mutateAsync(eventPayload);
      console.log('Event Creation Response:', newEvent);

      if (formData.eventCategory === 'meeting' && formData.staffAttendees?.length > 0) {
        console.log(`Creating ${formData.staffAttendees.length} attendees for ce_id: ${newEvent}`);
        await Promise.all(
          formData.staffAttendees.map(async (staffId: string) => {
            const staff = staffList.find(s => s.staff_id.toLowerCase() === staffId.toLowerCase());
            if (!staff) {
              console.warn(`Skipping attendee with invalid staff_id: ${staffId}`);
              return;
            }
            const attendeePayload = {
              ce_id: newEvent,
              staff_id: staffId,
              atn_name: staff.full_name,
              atn_designation: staff.position_title || 'No Designation',
              atn_present_or_absent: 'Present',
            };
            console.log('Sending Attendee Payload to DB:', attendeePayload);
            try {
              const res = await addAttendeeMutation.mutateAsync(attendeePayload);
              console.log(`Attendee Creation Response for staff_id ${staffId}:`, res);
            } catch (error: any) {
              console.error(`Failed to add attendee ${staffId}:`, {
                error: error.message,
                response: error.response?.data || 'No response data',
                status: error.response?.status,
              });
            }
          })
        );
      }

      console.log('Invalidating attendees cache for ce_id:', newEvent);
      queryClient.invalidateQueries({ queryKey: ['attendees', newEvent] });
      console.log('Navigating back after successful event creation');
      router.back();
    } catch (error: any) {
      console.error('API Error:', {
        error: error.message,
        response: error.response?.data || 'No response data',
        status: error.response?.status,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout
       customLeftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" className="text-black" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Schedule Events</Text>}
        showExitButton={false}
        headerAlign="left"
        keyboardAvoiding={false}
        contentPadding="medium"
      scrollable={false}
    >
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4 py-4">
          <View className="space-y-4">
            <FormInput
              control={control}
              name="eventTitle"
              label="Event Title"
              placeholder="Enter event title"
            />

            <FormDateInput
              control={control}
              name="eventDate"
              label="Event Date"
            />

            <FormInput
              control={control}
              name="roomPlace"
              label="Room/Place"
              placeholder="Enter room or place"
            />

            <FormSelect
              control={control}
              name="eventCategory"
              label="Event Category"
              options={[
                { label: 'Meeting', value: 'meeting' },
                { label: 'Activity', value: 'activity' },
              ]}
            />

            <FormTimeInput
              control={control}
              name="eventTime"
              label="Event Time"
              mode="24h"
            />

            <FormTextArea
              control={control}
              name="eventDescription"
              label="Event Description"
              placeholder="Enter description"
            />

            {eventCategory === 'meeting' && (
              <View>
                <Text className="text-lg font-bold text-center text-gray-800 py-4">ATTENDEES</Text>
                {isStaffLoading ? (
                  <View className="flex-row justify-center">
                    <Text className="text-gray-500 mr-2">Loading staff...</Text>
                    <Loader2 size={20} color="gray" className="animate-spin" />
                  </View>
                ) : (
                  <FormComboCheckbox
                    control={control}
                    name="staffAttendees"
                    label="Barangay Staff"
                    options={staffOptions}
                    placeholder="Select staff attendees"
                  />
                )}
                
                <View className="mt-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Selected Attendees</Text>
                  <View className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                    {selectedAttendeeDetails.length > 0 ? (
                      selectedAttendeeDetails.map((attendee, index) => (
                        <View key={index} className="flex-row items-center py-1">
                          <MaterialIcons name="person" size={16} color="#4b5563" />
                          <Text className="text-sm text-gray-900 ml-2">
                            {attendee.atn_name} ({attendee.atn_designation})
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-sm text-gray-500">No attendees selected</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            <View className="flex-row justify-end mt-6">
              <TouchableOpacity
                className="px-6 py-3 bg-blue-500 rounded-lg flex-row items-center"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                <Text className="text-white text-lg font-medium">
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Text>
                {isSubmitting && <Loader2 size={20} color="white" className="ml-2 animate-spin" />}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

export default CLCreateEvent;