import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react-native';
import { AddEventFormSchema } from '../../../form-schema/council-event-schema';
import { useAddCouncilEvent, useAddAttendee } from './queries';
import { useGetStaffList } from './queries';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { formatDate } from '@/helpers/dateFormatter';
import { Staff } from './ce-att-typeFile';
import { useQueryClient } from '@tanstack/react-query';
import PageLayout from '@/screens/_PageLayout';

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

  const staffOptions = useMemo(() => {
    return staffList.map((staff: Staff) => ({
      id: staff.staff_id,
      name: `${staff.full_name} (${staff.position_title || 'No Designation'})`,
    }));
  }, [staffList]);

  const selectedAttendeeDetails = useMemo(() => {
    return staffAttendees.map((staffId: string) => {
      const staff = staffList.find(s => s.staff_id.toLowerCase() === staffId.toLowerCase());
      return {
        staff_id: staffId,
        atn_name: staff?.full_name || 'Unknown',
        atn_designation: staff?.position_title || 'No Designation',
      };
    });
  }, [staffAttendees, staffList]);

  const onSubmit = async (formData: any) => {
    const isValid = await trigger();
    if (!isValid) {
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

      const newEvent = await addEventMutation.mutateAsync(eventPayload);

      if (formData.eventCategory === 'meeting' && formData.staffAttendees?.length > 0) {
        await Promise.all(
          formData.staffAttendees.map(async (staffId: string) => {
            const staff = staffList.find(s => s.staff_id.toLowerCase() === staffId.toLowerCase());
            if (!staff) {
              return;
            }
            const attendeePayload = {
              ce_id: newEvent,
              staff_id: staffId,
              atn_name: staff.full_name,
              atn_designation: staff.position_title || 'No Designation',
              atn_present_or_absent: 'Present',
            };
            try {
              const res = await addAttendeeMutation.mutateAsync(attendeePayload);
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

      queryClient.invalidateQueries({ queryKey: ['attendees', newEvent] });
      router.back();
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
        headerTitle={<Text>Schedule Events</Text>}
        rightAction={
          <View/>
        }
    >
        <View className="flex-1 p-4">
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

            {eventCategory === 'meeting' && (
              <View>
                <Text className="text-lg font-bold text-center text-gray-800 py-4">ATTENDEES</Text>
                {isStaffLoading ? (
                  <View className="flex-row justify-center">
                    <Text className="text-gray-500 mr-2">Loading staff...</Text>
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
              </View>
            )}

            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
              <TouchableOpacity
                className="bg-primaryBlue py-3 rounded-lg"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                <Text className="text-white text-base font-semibold text-center">
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Text>
                {isSubmitting}
              </TouchableOpacity>
            </View>
          </View>
    </PageLayout>
  );
};

export default CLCreateEvent;