import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, SafeAreaView, StatusBar, Platform, RefreshControl } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, AlertCircle, ChevronDown, ChevronLeft, Info } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api2 } from '@/api/api';
// IMPORTANT: Keep parseISO to prevent Android crashes
import { format, isWeekend, parseISO } from 'date-fns'; 
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
  
  const [pendingDates, setPendingDates] = useState<string[]>([]);

  const { user } = useAuth();
  const rpId = user?.rp;

  // DEBUG: Check if user is loaded
  useEffect(() => {
    // console.log("🟢 [SetSchedule] Component Mounted. User RP ID:", rpId);
    if (!rpId) console.warn("⚠️ [SetSchedule] Warning: No RP ID found for user.");
  }, [rpId]);

  const formatDateToISO = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const isCurrentDatePending = pendingDates.includes(formatDateToISO(selectedDate));

  const getCurrentSlot = (date: Date): Slot | undefined => {
    const dateStr = formatDateToISO(date);
    const found = availableSlots.find((s: Slot) => s.date === dateStr);
    
    // DEBUG: Log slot lookup when date changes
    // console.log(`🔍 [SetSchedule] Looking for slot on ${dateStr}:`, found ? "Found" : "Not Found");
    return found;
  };

  const checkPendingStatus = useCallback(async () => {
    if (!rpId) return;
    try {
      // console.log(`📡 [SetSchedule] Checking pending status for RP ID: ${rpId}...`);
      const response = await api2.get(`/medical-consultation/check-pending-status/?rp_id=${rpId}`);
      
      // console.log("✅ [SetSchedule] Pending status response:", response.data);
      
      if (response.data && Array.isArray(response.data.pending_dates)) {
        setPendingDates(response.data.pending_dates);
      } else {
        setPendingDates([]);
      }
    } catch (error: any) {
      console.error('❌ [SetSchedule] Failed to check pending status:', error.message);
    }
  }, [rpId]);

  const fetchAvailableSlots = useCallback(async (showLoader = true) => {
    // console.log("📡 [SetSchedule] Fetching available slots...");
    if (showLoader) {
      setIsLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
        // DEBUG: Log the baseURL to ensure it's not localhost
      // console.log("🔗 [SetSchedule] API Base URL:", api2.defaults.baseURL);
      
      const response = await api2.get('/medical-consultation/available-slots/');
      
      // console.log(`✅ [SetSchedule] Raw Slots Data (${response.data.length} items):`, JSON.stringify(response.data, null, 2));

      if (!Array.isArray(response.data)) throw new Error('Invalid response format (not an array)');

      const slots: Slot[] = response.data;

      // Filter out weekends safely
      const validSlots = slots.filter(slot => {
        const isWknd = isWeekend(parseISO(slot.date));
        // console.log(`Processing ${slot.date}: Weekend? ${isWknd}`);
        return !isWknd;
      });

      // console.log(`ℹ️ [SetSchedule] Valid Slots (Weekdays only): ${validSlots.length}`);
      setAvailableSlots(validSlots);

      // Initialize with valid data if not set
      const firstAvailableSlot = validSlots.find((slot: Slot) => {
        try {
          return parseISO(slot.date) >= new Date();
        } catch (e) { return false; }
      });

      if (firstAvailableSlot && !selectedDate) {
        // console.log("📅 [SetSchedule] Setting initial date to:", firstAvailableSlot.date);
        const initialDate = parseISO(firstAvailableSlot.date);
        setSelectedDate(initialDate);
        setAmAvailable(firstAvailableSlot.am_available);
        setPmAvailable(firstAvailableSlot.pm_available);
      }
    } catch (error: any) {
      // EXTENSIVE ERROR LOGGING
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("❌ [SetSchedule] Server Error Data:", error.response.data);
        console.error("❌ [SetSchedule] Server Error Status:", error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("❌ [SetSchedule] Network Error (No Response):", error.request);
        console.error("💡 [SetSchedule] Tip: Check your IP address in api.ts and ensure 'python manage.py runserver 0.0.0.0:8000' is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("❌ [SetSchedule] Request Setup Error:", error.message);
      }
      
      if (showLoader) Alert.alert('Error', 'Failed to load slots. Check console for details.');
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
        // console.log("🔄 [SetSchedule] Auto-refreshing slots...");
        fetchAvailableSlots(false);
        checkPendingStatus();
      }
    }, 30000); 
    return () => clearInterval(interval);
  }, [isLoading, refreshing, fetchAvailableSlots, checkPendingStatus]);

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      // console.log("📅 [SetSchedule] Date Selected:", format(selected, 'yyyy-MM-dd'));
      
      if (isWeekend(selected)) {
        // console.log("⚠️ [SetSchedule] Weekend selected - blocking.");
        Alert.alert('Weekend', 'No appointments on weekends. Please select a weekday.');
        return;
      }

      setSelectedDate(selected); 
      
      const slot = getCurrentSlot(selected);
      if (slot) {
        // console.log("✅ [SetSchedule] Slot found for date. AM:", slot.am_available, "PM:", slot.pm_available);
        
        if (!slot.am_available && selectedMeridiem === 'AM') setSelectedMeridiem('');
        if (!slot.pm_available && selectedMeridiem === 'PM') setSelectedMeridiem('');
        
        setAmAvailable(slot.am_available);
        setPmAvailable(slot.pm_available);
      } else {
        // console.log("⚠️ [SetSchedule] No slot data found for this date.");
        setAmAvailable(false);
        setPmAvailable(false);
        setSelectedMeridiem('');
      }
    }
  };

  const handleSubmit = async () => {
    // console.log("🚀 [SetSchedule] Submit triggered");

    if (!rpId) {
      // console.error("❌ [SetSchedule] Submit failed: User ID missing");
      Alert.alert('Error', 'User ID missing.');
      return;
    }
    
    if (isCurrentDatePending) {
        // console.warn("⚠️ [SetSchedule] Submit blocked: Date pending");
        Alert.alert('Pending Request', 'You already have a pending appointment on this date.');
        return;
    }

    if (!selectedDate || !selectedMeridiem || !chiefComplaint.trim()) {
      // console.warn("⚠️ [SetSchedule] Submit blocked: Missing fields");
      Alert.alert('Required Fields', 'Please fill all fields.');
      return;
    }

    const appointmentData = {
      rp_id: rpId,
      scheduled_date: formatDateToISO(selectedDate),
      meridiem: selectedMeridiem,
      chief_complaint: chiefComplaint.trim(),
    };

    // console.log("📦 [SetSchedule] Sending Appointment Payload:", appointmentData);

    setIsLoading(true);
    try {
      const response = await api2.post('/medical-consultation/book-appointment/', appointmentData);
      // console.log("✅ [SetSchedule] Booking Success:", response.data);

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
      console.error("❌ [SetSchedule] Booking Failed:", error);
      if (error.response) {
          console.error("❌ [SetSchedule] Error Response Data:", error.response.data);
      }
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
        onPress={() => {
            // console.log(`🕒 [SetSchedule] Selected ${meridiem}`);
            if (available) setSelectedMeridiem(meridiem);
        }}
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
                    <Text className='text-yellow-700 flex-1'>Please provide a detailed chief complaint for your appointment.</Text>
                  </View>
                 
                </View>
              </View>

              <TouchableOpacity
                className={`rounded-xl p-4 items-center mb-8 shadow-md ${isSubmitDisabled ? 'bg-gray-400' : isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
              >
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