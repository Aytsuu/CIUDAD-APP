import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, SafeAreaView, StatusBar, Platform, RefreshControl } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, AlertCircle, ChevronDown, ChevronLeft, Info } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api2 } from '@/api/api';
import { format, isWeekend } from 'date-fns';
import PageLayout from '@/screens/_PageLayout';
import { router } from 'expo-router';
import { LoadingState } from '@/components/ui/loading-state';

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
  
  // CHANGED: Store an array of pending dates strings instead of a boolean
  const [pendingDates, setPendingDates] = useState<string[]>([]);

  const { user } = useAuth();
  const rpId = user?.rp;

  const formatDateToISO = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  // NEW: Helper to check if the currently selected date is in the pending list
  const isCurrentDatePending = pendingDates.includes(formatDateToISO(selectedDate));

  const getCurrentSlot = (date: Date): Slot | undefined => {
    const dateStr = formatDateToISO(date);
    return availableSlots.find((s: Slot) => s.date === dateStr);
  };

  // UPDATED: Fetch list of pending dates
  const checkPendingStatus = useCallback(async () => {
    if (!rpId) return;
    try {
      const response = await api2.get(`/medical-consultation/check-pending-status/?rp_id=${rpId}`);
      if (response.data && Array.isArray(response.data.pending_dates)) {
        setPendingDates(response.data.pending_dates);
      } else {
        setPendingDates([]);
      }
    } catch (error) {
      console.error('Failed to check pending status:', error);
    }
  }, [rpId]);

  const fetchAvailableSlots = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await api2.get('/medical-consultation/available-slots/');
      if (!Array.isArray(response.data)) throw new Error('Invalid response');

      const slots: Slot[] = response.data;
      const validSlots = slots.filter(slot => {
        const date = new Date(slot.date);
        return !isWeekend(date);
      });

      setAvailableSlots(validSlots);

      // Initialize with valid data if not set
      const firstAvailableSlot = validSlots.find((slot: Slot) => {
        try {
          return new Date(slot.date) >= new Date();
        } catch (e) { return false; }
      });

      if (firstAvailableSlot && !selectedDate) {
        const initialDate = new Date(firstAvailableSlot.date);
        setSelectedDate(initialDate);
        setAmAvailable(firstAvailableSlot.am_available);
        setPmAvailable(firstAvailableSlot.pm_available);
      }
    } catch (error: any) {
      if (showLoader) Alert.alert('Error', 'Failed to load slots.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableSlots();
    checkPendingStatus();
  }, [fetchAvailableSlots, checkPendingStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !refreshing) {
        fetchAvailableSlots(false);
        checkPendingStatus();
      }
    }, 30000); 
    return () => clearInterval(interval);
  }, [isLoading, refreshing, fetchAvailableSlots, checkPendingStatus]);

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      if (isWeekend(selected)) {
        Alert.alert('Weekend', 'No appointments on weekends.');
        return;
      }

      // Allow selection even if pending, logic is handled in render
      setSelectedDate(selected); 
      
      const slot = getCurrentSlot(selected);
      if (slot) {
        // Only clear meridiem if the availability changed significantly
        if (!slot.am_available && selectedMeridiem === 'AM') setSelectedMeridiem('');
        if (!slot.pm_available && selectedMeridiem === 'PM') setSelectedMeridiem('');
        
        setAmAvailable(slot.am_available);
        setPmAvailable(slot.pm_available);
      } else {
        setAmAvailable(false);
        setPmAvailable(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!rpId) {
      Alert.alert('Error', 'User ID missing.');
      return;
    }
    
    // Block submission if current date is pending
    if (isCurrentDatePending) {
        Alert.alert('Pending Request', 'You already have a pending appointment on this date.');
        return;
    }

    if (!selectedDate || !selectedMeridiem || !chiefComplaint.trim()) {
      Alert.alert('Required Fields', 'Please fill all fields.');
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
       Alert.alert(
        'Success',
        'Appointment booked successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedDate(new Date());
              setSelectedMeridiem('');
              setChiefComplaint('');
              fetchAvailableSlots(false);
              checkPendingStatus();
              router.replace('/home');
            },
          },
        ],
        { cancelable: false }
      );
    }
    } catch (error: any) {
      Alert.alert('Booking Error', error.response?.data?.error || 'Failed to book.');
    } finally {
      setIsLoading(false);
    }
  };

  type MeridiemButtonProps = { meridiem: string; available: boolean };
  const MeridiemButton: React.FC<MeridiemButtonProps> = ({ meridiem, available }) => {
    const selected = selectedMeridiem === meridiem;
    const currentSlot = getCurrentSlot(selectedDate);
    const availableCount = meridiem === 'AM' ? currentSlot?.am_available_count : currentSlot?.pm_available_count;
    
    return (
      <TouchableOpacity
        className={`flex-1 rounded-xl p-3 items-center mx-1 ${selected ? 'bg-blue-600' : 'bg-gray-100'} ${!available ? 'opacity-50' : ''}`}
        onPress={() => available ? setSelectedMeridiem(meridiem) : null}
        // Disable interaction if not available OR if date is pending
        disabled={!available || isCurrentDatePending}
      >
        <Clock size={20} color={selected ? '#fff' : '#2563EB'} />
        <Text className={`font-bold mt-1 ${selected ? 'text-white' : 'text-blue-600'}`}>{meridiem}</Text>
        <Text className={`text-xs ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
            {availableCount !== undefined ? `(${availableCount} left)` : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  // Submit is disabled if loading, missing data, OR current date is pending
  const isSubmitDisabled = isLoading || !rpId || !selectedDate || !selectedMeridiem || !chiefComplaint.trim() || isCurrentDatePending;

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
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
              onRefresh={() => { fetchAvailableSlots(false); checkPendingStatus(); }}
              colors={['#2563EB']} tintColor="#2563EB"
            />
          }
        >
            {/* Warning Banner: Only show if the SELECTED date is pending */}
            {isCurrentDatePending && (
            <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex-row items-center">
                <Info size={24} color="#ea580c" />
                <View className="ml-3 flex-1">
                <Text className="text-orange-800 font-bold text-md">Date Unavailable</Text>
                <Text className="text-orange-600 text-sm mt-1">
                    You already have a pending request on this date. Please select another date.
                </Text>
                </View>
            </View>
            )}

          {isLoading && availableSlots.length === 0 ? (
            <LoadingState/>
          ) : (
            <>
                <Text className='text-lg font-semibold text-gray-700 mb-3'>1. Select Date</Text>

                {/* Date Picker is ALWAYS active */}
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
                    />
                )}

              {/* Only dim the inputs below if the current date is pending */}
              <View className={isCurrentDatePending ? 'opacity-50' : ''} pointerEvents={isCurrentDatePending ? 'none' : 'auto'}>
                <Text className='text-lg font-semibold text-gray-700 mb-3'>2. Select Time Slot</Text>
                <View className='flex-row justify-between mb-6'>
                    <MeridiemButton meridiem="AM" available={amAvailable} />
                    <MeridiemButton meridiem="PM" available={pmAvailable} />
                </View>

                <Text className='text-lg font-semibold text-gray-700 mb-3'>3. Chief Complaint</Text>
                <TextInput
                    className='bg-gray-100 rounded-xl p-4 mb-4 h-24'
                    placeholder="Briefly describe your symptoms or reason for visit"
                    placeholderTextColor="gray"
                    value={chiefComplaint}
                    onChangeText={setChiefComplaint}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isLoading && !isCurrentDatePending}
                />
              </View>

              <View className='bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-8'>
                <View className='flex-row items-center mb-2'>
                  <AlertCircle size={20} color="#b45309" />
                  <Text className='text-md text-yellow-800 ml-2 font-bold'>Reminders</Text>
                </View>
                <View className='space-y-2'>
                  <View className='flex-row'>
                    <Text className='text-yellow-700 mr-2'>•</Text>
                    <Text className='text-yellow-700 flex-1'>Appointments are dependent on the clinic schedules.</Text>
                  </View>
                  <View className='flex-row mt-2'>
                    <Text className='text-yellow-700 mr-2'>•</Text>
                    <Text className='text-yellow-700 flex-1'>Arrive 5-10 minutes before your appointment.</Text>
                  </View>
                  <View className='flex-row mt-2'>
                    <Text className='text-yellow-700 mr-2'>•</Text>
                    <Text className='text-yellow-700 flex-1'>No weekend appointments available.</Text>
                  </View>
                  <View className='flex-row mt-2'>
                    <Text className='text-yellow-700 mr-2'>•</Text>
                    <Text className='text-yellow-700 flex-1'>Please provide a detailed chief complaint for your appointment. We will review your reason before the consultation.</Text>
                  </View>
                 
                </View>
              </View>


              <TouchableOpacity
                className={`rounded-xl p-4 items-center mb-8 shadow-md ${isSubmitDisabled ? 'bg-gray-400' : isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {/* Dynamic Button Text */}
                {isCurrentDatePending ? (
                   <Text className='text-white font-bold text-lg'>Pending Request on Date</Text>
                ) : isLoading ? (
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