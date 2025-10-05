import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, SafeAreaView, StatusBar, Platform, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, AlertCircle, User, ChevronDown, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api2 } from '@/api/api';
import { format, isWeekend } from 'date-fns';
import PageLayout from '@/screens/_PageLayout';
import { router } from 'expo-router';

interface Slot {
  date: string;
  day_name: string;
  am_available: boolean;
  pm_available: boolean;
  am_available_count: number;
  pm_available_count: number;
}

const SetSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMeridiem, setSelectedMeridiem] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [amAvailable, setAmAvailable] = useState<boolean>(false);
  const [pmAvailable, setPmAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { user } = useAuth();
  const rpId = user?.rp;

  const formatDateToISO = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const getCurrentSlot = (date: Date): Slot | undefined => {
    const dateStr = formatDateToISO(date);
    return availableSlots.find((s: Slot) => s.date === dateStr);
  };

  // Filter out weekends and only show available dates
  const availableDates = availableSlots.filter(slot => {
    const date = new Date(slot.date);
    return !isWeekend(date) && (slot.am_available || slot.pm_available);
  });

  const fetchAvailableSlots = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      const response = await api2.get('/medical-consultation/available-slots/');
      
      if (!Array.isArray(response.data)) {
        throw new Error('Expected an array of slots, but received: ' + typeof response.data);
      }

      const slots: Slot[] = response.data;
      
      // Filter out weekends and validate slots
      const validSlots = slots.filter(slot => {
        if (!slot.date || !slot.day_name || typeof slot.am_available !== 'boolean' || typeof slot.pm_available !== 'boolean') {
          console.warn('Invalid slot format:', slot);
          return false;
        }
        
        const date = new Date(slot.date);
        return !isWeekend(date); // Exclude weekends
      });

      setAvailableSlots(validSlots);
      
      // Auto-select first available date
      const firstAvailableSlot = validSlots.find((slot: Slot) => {
        try {
          return new Date(slot.date) >= new Date() && (slot.am_available || slot.pm_available);
        } catch (e) {
          console.warn('Invalid date in slot:', slot.date);
          return false;
        }
      });

      if (firstAvailableSlot) {
        const initialDate = new Date(firstAvailableSlot.date);
        setSelectedDate(initialDate);
        setAmAvailable(firstAvailableSlot.am_available);
        setPmAvailable(firstAvailableSlot.pm_available);
      } else {
        setAmAvailable(false);
        setPmAvailable(false);
        if (showLoader) {
          Alert.alert('No Slots', 'No available slots in the next 90 days. Contact support.');
        }
      }
    } catch (error: any) {
      console.error('Fetch Slots Error:', {
        message: error.message,
        response: error.response,
        config: error.config,
      });
      if (showLoader) {
        Alert.alert('Error', `Failed to load available slots: ${error.message || 'Network error. Please check your connection.'}`);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  // Auto-refresh slots every 30 seconds to show updated slot counts
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !refreshing) {
        fetchAvailableSlots(false);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isLoading, refreshing, fetchAvailableSlots]);

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      // Check if selected date is weekend
      if (isWeekend(selected)) {
        Alert.alert('Weekend', 'Appointments are not available on weekends. Please select a weekday.');
        return;
      }

      const slot = getCurrentSlot(selected);
      if (slot && (slot.am_available || slot.pm_available)) {
        setSelectedDate(selected);
        setSelectedMeridiem('');
        setAmAvailable(slot.am_available);
        setPmAvailable(slot.pm_available);
      } else {
        Alert.alert('Unavailable', 'This date is not available for booking. Please select another date.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!rpId) {
      Alert.alert('Authentication Error', 'User ID is missing. Please log in again.');
      return;
    }
    
    if (!selectedDate || !selectedMeridiem || !chiefComplaint.trim()) {
      Alert.alert('Required Fields', 'Please select a date, an AM/PM slot, and describe your complaint.');
      return;
    }
    
    const appointmentData = {
      rp_id: rpId,
      scheduled_date: formatDateToISO(selectedDate),
      meridiem: selectedMeridiem,
      chief_complaint: chiefComplaint.trim(),
    };

    setIsLoading(true);
    try {
      const response = await api2.post('/medical-consultation/book-appointment/', appointmentData);
      if (response.status === 201 && response.data.success) {
        Alert.alert('Success', `Appointment booked successfully!`);
        setSelectedDate(new Date());
        setSelectedMeridiem('');
        setChiefComplaint('');
        setAmAvailable(false);
        setPmAvailable(false);
        // Refresh slots after booking to update counts
        fetchAvailableSlots(false);
      }
    } catch (error: any) {
      let errorMessage = 'Failed to book appointment. Please check the date/time slot.';
      if (error.response?.data) {
        if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        } else if (error.response.data.error) {
          errorMessage = Object.values(error.response.data.error).join(', ');
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      Alert.alert('Booking Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  type MeridiemButtonProps = { meridiem: string; available: boolean };
  const MeridiemButton: React.FC<MeridiemButtonProps> = ({ meridiem, available }) => {
    const selected = selectedMeridiem === meridiem;
    const currentSlot = getCurrentSlot(selectedDate);
    const availableCount = meridiem === 'AM' ? currentSlot?.am_available_count : currentSlot?.pm_available_count;
    const countDisplay = availableCount !== undefined ? `(${availableCount} slots left)` : '';

    return (
      <TouchableOpacity
        className={`flex-1 rounded-xl p-3 items-center mx-1 ${selected ? 'bg-blue-600' : 'bg-gray-100'} ${!available ? 'opacity-50' : ''}`}
        onPress={() => available ? setSelectedMeridiem(meridiem) : Alert.alert('Unavailable', 'This slot is not available.')}
        disabled={!available}
      >
        <Clock size={20} color={selected ? '#fff' : '#2563EB'} />
        <Text className={`font-bold mt-1 ${selected ? 'text-white' : 'text-blue-600'}`}>{meridiem}</Text>
        <Text className={`text-xs ${selected ? 'text-blue-100' : 'text-gray-500'}`}>{countDisplay}</Text>
      </TouchableOpacity>
    );
  };

  // FlatList item for date selection
  const DateItem = ({ item }: { item: Slot }) => {
    const date = new Date(item.date);
    const isSelected = formatDateToISO(selectedDate) === item.date;
    
    return (
      <TouchableOpacity
        className={`mx-2 p-4 rounded-xl border-2 ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200'}`}
        onPress={() => {
          setSelectedDate(date);
          setSelectedMeridiem('');
          setAmAvailable(item.am_available);
          setPmAvailable(item.pm_available);
        }}
      >
        <Text className={`font-bold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
          {format(date, 'EEE, MMM d')}
        </Text>
        <View className="flex-row justify-between mt-2">
          <Text className={`text-xs ${item.am_available ? 'text-green-600' : 'text-red-500'}`}>
            AM: {item.am_available_count} slots
          </Text>
          <Text className={`text-xs ${item.pm_available ? 'text-green-600' : 'text-red-500'}`}>
            PM: {item.pm_available_count} slots
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const isSubmitDisabled = isLoading || !rpId || !selectedDate || !selectedMeridiem || !chiefComplaint.trim();

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-lg">Set Medical Consultation Schedule</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <SafeAreaView className='flex-1 bg-white'>
        <StatusBar barStyle="dark-content" />
        <ScrollView 
          className='p-5'
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAvailableSlots(false)}
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
        >
          {isLoading && availableSlots.length === 0 ? (
            <View className='flex-1 items-center justify-center h-48'>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className='mt-3 text-gray-600'>Fetching available slots...</Text>
            </View>
          ) : (
            <>
              <Text className='text-lg font-semibold text-gray-700 mb-3'>1. Select Date</Text>
              
              {/* Quick Date Selection with FlatList */}
              {/* <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Quick select from available dates:</Text>
                <FlatList
                  data={availableDates.slice(0, 7)} // Show next 7 available dates
                  renderItem={DateItem}
                  keyExtractor={(item) => item.date}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 8 }}
                />
              </View> */}

              {/* Manual Date Picker */}
              <View className='flex-row items-center justify-between bg-gray-100 rounded-xl p-4 mb-4'>
                <Calendar size={20} color="#374151" />
                <Text className='text-md font-medium text-gray-800 flex-1 ml-3'>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} className='p-2 bg-white rounded-full' disabled={isLoading}>
                  <ChevronDown size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={onDateChange}
                  // Note: filterWeekends prop might not be available on all platforms
                  // You may need to handle this differently based on platform
                />
              )}
              
              <Text className='text-lg font-semibold text-gray-700 mb-3'>2. Select Time Slot</Text>
              <View className='flex-row justify-between mb-6'>
                <MeridiemButton meridiem="AM" available={amAvailable} />
                <MeridiemButton meridiem="PM" available={pmAvailable} />
              </View>
              
              <Text className='text-lg font-semibold text-gray-700 mb-3'>3. Chief Complaint</Text>
              <TextInput
                className='bg-gray-100 rounded-xl p-4 text-gray-800 mb-4 h-24'
                placeholder="Briefly describe your symptoms or reason for visit"
                value={chiefComplaint}
                onChangeText={setChiefComplaint}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
              />
              
              <View className='bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-8'>
                <View className='flex-row items-center mb-2'>
                  <AlertCircle size={20} color="#b45309" />
                  <Text className='text-md text-yellow-800 ml-2 font-bold'>Important Information</Text>
                </View>
                <View className='space-y-2'>
                  <View className='flex-row'>
                    <Text className='text-yellow-700 mr-2'>•</Text>
                    <Text className='text-yellow-700 flex-1'>Appointments are dependent on the clinic schedules. </Text>
                  </View>
                  <View className='flex-row'>
                    <Text className='text-yellow-700 mr-2'>•</Text>
                    <Text className='text-yellow-700 flex-1'>Arrive 5-10 minutes before your appointment.</Text>
                  </View>
                  <View className='flex-row'>
                    <Text className='text-yellow-700 mr-2'>•</Text>
                    <Text className='text-yellow-700 flex-1'>No weekend appointments available.</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className={`rounded-xl p-4 items-center mb-8 shadow-md ${isSubmitDisabled ? 'bg-gray-400' : isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {isLoading ? (
                  <Text className='text-white font-bold text-lg'>Booking...</Text>
                ) : (
                  <Text className='text-white font-bold text-lg'>Schedule Appointment</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </PageLayout>
  );
};

export default SetSchedule;