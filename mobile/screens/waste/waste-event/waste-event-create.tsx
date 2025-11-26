import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import WasteEventSchema, { type WasteEventFormData } from '@/form-schema/waste/waste-event-schema';
import { useCreateWasteEvent } from './queries/waste-event-insert-queries';
import { useGetWasteSitio } from '@/screens/waste/waste-collection/queries/waste-col-fetch-queries';
import { useGetStaffList } from './queries/waste-event-staff-queries';
import { SelectLayout, DropdownOption } from '@/components/ui/select-layout';
import PageLayout from '@/screens/_PageLayout';

const announcementOptions = [
    { id: "all", label: "All", checked: false },
    { id: "allbrgystaff", label: "All Barangay Staff", checked: false },
    { id: "residents", label: "Residents", checked: false },
    { id: "wmstaff", label: "Waste Committee", checked: false },
    { id: "drivers", label: "Driver Loader", checked: false },
    { id: "collectors", label: "Loaders", checked: false },
];

function WasteEventCreate() {
  const router = useRouter();
  const createWasteEvent = useCreateWasteEvent();
  const { data: sitios = [] } = useGetWasteSitio();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const form = useForm<WasteEventFormData>({
    resolver: zodResolver(WasteEventSchema),
    defaultValues: {
      eventName: '',
      location: '',
      date: '',
      time: '',
      organizer: '',
      eventDescription: '',
      eventSubject: '',
      selectedAnnouncements: [],
    },
  });

  const selectedAnnouncements = form.watch('selectedAnnouncements') || [];

  const onSubmit = (values: WasteEventFormData) => {
    // Find staff name from staff ID
    const selectedStaff = staffList.find((s) => String(s.staff_id) === String(values.organizer));
    const organizerName = selectedStaff?.full_name || '';

    // Create payload with organizer name instead of ID
    // Date and time will be formatted in the insert query
    const payload = {
      ...values,
      organizer: organizerName,
    };

    createWasteEvent.mutate(payload);
  };

  // Convert sitios to dropdown options
  const sitioOptions: DropdownOption[] = sitios.map(sitio => ({
    label: sitio.sitio_name,
    value: sitio.sitio_id.toString(),
  }));

  // Convert staff to dropdown options
  const staffOptions: DropdownOption[] = staffList.map(staff => ({
    label: staff.full_name,
    value: staff.staff_id.toString(),
  }));

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Handle both YYYY-MM-DD format and ISO strings
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">Create Waste Event</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="w-full px-6">
        {/* Event Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
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
          <Text className="text-sm font-medium text-gray-700 mb-2">
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

        {/* Date and Time */}
        <View className="mb-4">
          <View className="flex-row gap-4">
            {/* Date */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">
            Date
          </Text>
              <Controller
                control={form.control}
                name="date"
                render={({ field: { onChange, value } }) => {
                  let dateValue = new Date();
                  if (value) {
                    const parsed = new Date(value);
                    if (!isNaN(parsed.getTime())) {
                      dateValue = parsed;
                    }
                  }
                  
                  return (
                    <>
              <TouchableOpacity
                className="rounded-lg px-3 py-3 border border-gray-200 bg-white"
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text className="text-base" style={{ color: value ? '#000' : '#888' }}>
                          {value ? formatDate(value) : 'Select Date'}
                        </Text>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={dateValue}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (selectedDate) {
                              // Store date as YYYY-MM-DD format
                              const year = selectedDate.getFullYear();
                              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                              const day = String(selectedDate.getDate()).padStart(2, '0');
                              onChange(`${year}-${month}-${day}`);
                            }
                          }}
                        />
                      )}
                    </>
                  );
                }}
          />
          {form.formState.errors.date && (
            <Text className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</Text>
          )}
        </View>

        {/* Time */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">
            Time
          </Text>
          <Controller
            control={form.control}
            name="time"
                render={({ field: { onChange, value } }) => {
                  const timeValue = value ? new Date(`2000-01-01T${value}`) : new Date();
                  
                  return (
                    <>
                      <TouchableOpacity
                        className="rounded-lg px-3 py-3 border border-gray-200 bg-white"
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Text className="text-base" style={{ color: value ? '#000' : '#888' }}>
                          {value ? formatTime(value) : 'Select Time'}
                        </Text>
                      </TouchableOpacity>
                      {showTimePicker && (
                        <DateTimePicker
                          value={timeValue}
                          mode="time"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedTime) => {
                            setShowTimePicker(Platform.OS === 'ios');
                            if (selectedTime) {
                              const hours = selectedTime.getHours().toString().padStart(2, '0');
                              const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                              onChange(`${hours}:${minutes}`);
                            }
                          }}
                        />
                      )}
                    </>
                  );
                }}
          />
          {form.formState.errors.time && (
            <Text className="text-red-500 text-sm mt-1">{form.formState.errors.time.message}</Text>
          )}
            </View>
          </View>
        </View>

        {/* Organizer */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Organizer
          </Text>
          <Controller
            control={form.control}
            name="organizer"
            render={({ field: { onChange, value } }) => (
              <SelectLayout
                options={staffOptions}
                selectedValue={value}
                onSelect={(option) => onChange(option.value)}
                placeholder="Select organizer"
                className="mb-3"
              />
            )}
          />
          {form.formState.errors.organizer && (
            <Text className="text-red-500 text-sm mt-1">{form.formState.errors.organizer.message}</Text>
          )}
        </View>

        {/* Event Description */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Event Description</Text>
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

        {/* Announcement Settings */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <Text className="text-sm font-medium text-gray-700">Announcement Settings</Text>
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
                        const currentValue = value || [];
                        
                        if (option.id === "all") {
                          // If "All" is checked, only select "All"
                          onChange(currentValue.includes("all") ? [] : ["all"]);
                        } else {
                          // If another option is checked, remove "All" if it exists
                          let newSelected;
                          if (currentValue.includes(option.id)) {
                            newSelected = currentValue.filter((id) => id !== option.id);
                          } else {
                            newSelected = [...currentValue.filter(id => id !== "all"), option.id];
                          }
                        onChange(newSelected);
                        }
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

        {/* Event Subject - Only show when announcements are selected */}
        {selectedAnnouncements.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Event Subject</Text>
            <Controller
              control={form.control}
              name="eventSubject"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="rounded-lg px-3 py-3 border border-gray-200 text-base bg-white"
                  placeholder="Enter event subject for announcement"
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
        )}

        {/* Submit Button */}
        <View className="px-6 py-4 border-t border-gray-200 bg-white">
          <TouchableOpacity
            className="bg-primaryBlue py-4 rounded-xl w-full items-center"
            onPress={form.handleSubmit(onSubmit)}
            disabled={createWasteEvent.isPending}
          >
            <Text className="text-white text-base font-semibold">
              {createWasteEvent.isPending ? 'Creating...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageLayout>
  );
}

export default WasteEventCreate;
