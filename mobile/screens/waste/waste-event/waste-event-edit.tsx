
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Calendar, Clock, MapPin, User, Users, FileText, Bell } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import WasteEventSchema, { type WasteEventFormData } from '@/form-schema/waste/waste-event-schema';
import { useUpdateWasteEvent } from './queries/waste-event-update-queries';
import { useGetWasteSitio } from '@/screens/waste/waste-collection/queries/waste-col-fetch-queries';
import { SelectLayout, DropdownOption } from '@/components/ui/select-layout';
import _ScreenLayout from '@/screens/_ScreenLayout';


// Announcement options matching web implementation
const announcementOptions = [
    { id: "all", label: "All", checked: false },
    { id: "allbrgystaff", label: "All Barangay Staff", checked: false },
    { id: "residents", label: "Residents", checked: false },
    { id: "wmstaff", label: "Waste Committee", checked: false },
    { id: "drivers", label: "Driver Loader", checked: false },
    { id: "collectors", label: "Loaders", checked: false },
];

function WasteEventEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const updateWasteEvent = useUpdateWasteEvent();
  const { data: sitios = [] } = useGetWasteSitio();

  const {
    weNum,
    eventName,
    location,
    date,
    time,
    organizer,
    invitees,
    description,
  } = params;

  const form = useForm<WasteEventFormData>({
    resolver: zodResolver(WasteEventSchema),
    defaultValues: {
      eventName: eventName as string || '',
      location: location as string || '',
      date: date as string || '',
      time: time as string || '',
      organizer: organizer as string || '',
      invitees: invitees as string || '',
      eventDescription: description as string || '',
      eventSubject: '',
      selectedAnnouncements: [],
    },
  });

  const onSubmit = (values: WasteEventFormData) => {
    updateWasteEvent.mutate({
      weNum: parseInt(weNum as string),
      eventData: values
    });
  };

  // Convert sitios to dropdown options
  const sitioOptions: DropdownOption[] = sitios.map(sitio => ({
    label: sitio.sitio_name,
    value: sitio.sitio_id.toString(),
  }));

  // Time options
  const timeOptions: DropdownOption[] = [
    { label: "08:00 AM", value: "08:00" },
    { label: "09:00 AM", value: "09:00" },
    { label: "10:00 AM", value: "10:00" },
    { label: "11:00 AM", value: "11:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "01:00 PM", value: "13:00" },
    { label: "02:00 PM", value: "14:00" },
    { label: "03:00 PM", value: "15:00" },
    { label: "04:00 PM", value: "16:00" },
    { label: "05:00 PM", value: "17:00" },
    { label: "06:00 PM", value: "18:00" },
    { label: "07:00 PM", value: "19:00" },
    { label: "08:00 PM", value: "20:00" },
  ];

  return (
    <_ScreenLayout
      headerBetweenAction={<Text className="text-[13px]">Edit Waste Event</Text>}
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
      loading={updateWasteEvent.isPending}
      loadingMessage="Updating event..."
      footer={
        <TouchableOpacity
          className="bg-orange-500 py-5 rounded-xl w-full items-center"
          onPress={form.handleSubmit(onSubmit)}
        >
          <Text className="text-white text-base font-semibold">Update Event</Text>
        </TouchableOpacity>
      }
      stickyFooter={true}
    >
      <View className="w-full px-6">
        {/* Event Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2 flex-row items-center">
            <FileText size={16} color="#374151" className="mr-2" />
            Event Name
          </Text>
          <Controller
            control={form.control}
            name="eventName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg px-3 py-3 border border-gray-200 text-base bg-white"
                placeholder="Enter event name"
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />
          {form.formState.errors.eventName && (
            <Text className="text-red-500 text-sm mt-1">{form.formState.errors.eventName.message}</Text>
          )}
        </View>

        {/* Location */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2 flex-row items-center">
            <MapPin size={16} color="#374151" className="mr-2" />
            Location
          </Text>
          <Controller
            control={form.control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <SelectLayout
                options={sitioOptions}
                selectedValue={value}
                onSelect={(option) => onChange(option.value)}
                placeholder="Select location"
                className="mb-3"
              />
            )}
          />
          {form.formState.errors.location && (
            <Text className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</Text>
          )}
        </View>

        {/* Date */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2 flex-row items-center">
            <Calendar size={16} color="#374151" className="mr-2" />
            Date
          </Text>
          <Controller
            control={form.control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                className="rounded-lg px-3 py-3 border border-gray-200 bg-white"
                onPress={() => {
                  // You can implement a date picker here
                  // For now, we'll use a simple text input
                }}
              >
                <TextInput
                  className="text-base"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#888"
                  value={value}
                  onChangeText={onChange}
                />
              </TouchableOpacity>
            )}
          />
          {form.formState.errors.date && (
            <Text className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</Text>
          )}
        </View>

        {/* Time */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2 flex-row items-center">
            <Clock size={16} color="#374151" className="mr-2" />
            Time
          </Text>
          <Controller
            control={form.control}
            name="time"
            render={({ field: { onChange, value } }) => (
              <SelectLayout
                options={timeOptions}
                selectedValue={value}
                onSelect={(option) => onChange(option.value)}
                placeholder="Select time"
                className="mb-3"
              />
            )}
          />
          {form.formState.errors.time && (
            <Text className="text-red-500 text-sm mt-1">{form.formState.errors.time.message}</Text>
          )}
        </View>

        {/* Organizer */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2 flex-row items-center">
            <User size={16} color="#374151" className="mr-2" />
            Organizer
          </Text>
          <Controller
            control={form.control}
            name="organizer"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg px-3 py-3 border border-gray-200 text-base bg-white"
                placeholder="Enter organizer name"
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />
          {form.formState.errors.organizer && (
            <Text className="text-red-500 text-sm mt-1">{form.formState.errors.organizer.message}</Text>
          )}
        </View>

        {/* Invitees */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2 flex-row items-center">
            <Users size={16} color="#374151" className="mr-2" />
            Invitees (Optional)
          </Text>
          <Controller
            control={form.control}
            name="invitees"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg px-3 py-3 border border-gray-200 text-base bg-white"
                placeholder="Enter invitees (comma separated)"
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />
        </View>

        {/* Event Description */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Event Description (Optional)</Text>
          <Controller
            control={form.control}
            name="eventDescription"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg px-3 py-3 border border-gray-200 text-base bg-white"
                placeholder="Enter event description"
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        {/* Event Subject */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Event Subject (Optional)</Text>
          <Controller
            control={form.control}
            name="eventSubject"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg px-3 py-3 border border-gray-200 text-base bg-white"
                placeholder="Enter event subject for announcements"
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        {/* Announcement Settings */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <Bell size={16} color="#374151" />
            <Text className="text-sm font-medium text-gray-700 ml-2">Announcement Settings</Text>
          </View>
          <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <Text className="text-sm text-gray-600 mb-3">
              Select audience for mobile app announcement:
            </Text>
            <Controller
              control={form.control}
              name="selectedAnnouncements"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {announcementOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      className={`px-3 py-2 rounded-lg border ${
                        value?.includes(option.id)
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white border-gray-300'
                      }`}
                      onPress={() => {
                        const newSelected = value?.includes(option.id)
                          ? value.filter((id) => id !== option.id)
                          : [...(value || []), option.id];
                        onChange(newSelected);
                      }}
                    >
                      <Text className={`text-sm ${
                        value?.includes(option.id) ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </_ScreenLayout>
  );
}

export default WasteEventEdit;
