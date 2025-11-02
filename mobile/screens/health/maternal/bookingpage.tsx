import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StatusBar, Modal, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import PageLayout from '@/screens/_PageLayout';
import { router } from 'expo-router';
import { ChevronLeft, UserPlus, X, AlertCircle, Calendar, Clock, Heart, Phone, MapPin } from 'lucide-react-native';
import { format } from 'date-fns';
import { calculateAge } from '@/helpers/ageCalculator';

import { useAddPrenatalAppointment, useCheckOrCreatePatient } from './queries/add';
import { useAuth } from '@/contexts/AuthContext';
import { useGetScheduler } from '../admin/admin-scheduler/queries/schedulerFetchQueries';
import { usePrenatalAppointmentRequestsByDate } from './queries/fetch';
import { LoadingState } from '@/components/ui/loading-state';

interface User {
  name: string;
  id: string;
}

interface PrenatalAppointmentData {
  requested_at: string;
  approved_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  rejected_at: string | null;
  reason: string | null;
  status: string;
  rp_id: string;
  pat_id: string;
}

const PrenatalBookingPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState<boolean>(false);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [hasPendingAppointment, setHasPendingAppointment] = useState<boolean>(false);

  const addPrenatalAppointmentMutation = useAddPrenatalAppointment();
  const checkOrCreatePatientMutation = useCheckOrCreatePatient();

  const { user } = useAuth();
  const { pat_id } = useAuth();
  const rp_id = user?.rp;

  const currentUser: User = {
    name: `${user?.personal?.per_lname}, ${user?.personal?.per_fname} ${user?.personal?.per_mname}`,
    id: rp_id || "",
  };

  const { data: schedulersData = [] } = useGetScheduler();

  const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
  const getDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

  const formattedSelectedDate = formatDate(selectedDate);
  useEffect(() => {
  console.log('Selected date:', selectedDate);
  console.log('Formatted date for API:', formattedSelectedDate);
  console.log('Current Philippines time:', new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }));
}, [selectedDate, formattedSelectedDate]);

  const { data: appointmentRequests = [], isLoading: isLoadingAppointments } = usePrenatalAppointmentRequestsByDate(
    rp_id || '', 
    formattedSelectedDate
  );

 
  
  useEffect(() => {
    if (appointmentRequests && appointmentRequests.requests) {
      const pendingAppointment = appointmentRequests.requests.find(
        (request: any) => 
          request.status === 'pending' && 
          request.requested_date === formattedSelectedDate
      );
      setHasPendingAppointment(!!pendingAppointment);
    } else {
      setHasPendingAppointment(false);
    }
  }, [appointmentRequests, formattedSelectedDate]);

   if(isLoadingAppointments){
    return <LoadingState/>

  }
  
  const availableDays = new Set(
    schedulersData
      .filter((s) => s.service_name.toLowerCase() === 'prenatal' || s.service_name.toLowerCase() === 'maternal')
      .map((s) => s.day)
  );

  const isDateDisabled = (date: Date): boolean => {
    const dayName = format(date, 'EEEE');
    const dateString = formatDate(date);

    if (availableDays.size > 0) {
      return !availableDays.has(dayName);
    } else {
      const dayOfWeek = date.getDay();
      return dayOfWeek !== 4;
    }
  };

  const onDateChange = (event: any, selected?: Date): void => {
    setShowDatePicker(false);
    if (selected) {
      if (isDateDisabled(selected)) {
        Alert.alert('Unavailable Date', 'Prenatal appointments are only available based on the scheduler. Please check the scheduler first.');
        return; 
      }
      setSelectedDate(selected);
    }
  };

  if (user?.personal?.per_sex !== 'FEMALE' || (user?.personal?.per_dob && Number(calculateAge(user?.personal?.per_dob)) <= 13)) {
    Alert.alert(
      'Access Restricted',
      'Maternal services are only available for female users above 13 years old.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/home'),
        },
      ]
    );
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">Access Restricted</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center p-6 bg-gray-50">
          <AlertCircle size={64} color="#ef4444" />
          <Text className="text-lg text-gray-800 text-center mt-4 font-medium">Maternal services are only available for female users above 13 years old.</Text>
        </View>
      </PageLayout>
    );
  }

  const handleSubmit = (): void => {
    if (hasPendingAppointment) {
      Alert.alert(
        'Pending Appointment', 
        'You already have a pending prenatal appointment for this date. Please wait for approval or select a different date.'
      );
      return;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Please select date for your prenatal appointment');
      return;
    }

    if (!pat_id && rp_id) {
      setShowRegistrationDialog(true);
    } else {
      proceedWithAppointment(pat_id || '');
    }
  };

  const handleCreatePatient = async (): Promise<void> => {
    if (!rp_id) {
      Alert.alert('Error', 'Resident ID not found');
      return;
    }

    try {
      const result = await checkOrCreatePatientMutation.mutateAsync(rp_id);
      
      if (result.patient && result.patient.pat_id) {
        setCurrentPatientId(result.patient.pat_id);
        setShowRegistrationDialog(false);
        proceedWithAppointment(result.patient.pat_id);
      }
    } catch (error: any) {
      console.error('Error creating patient:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.error || 'Failed to create patient record. Please try again.',
      );
    }
  };

  const proceedWithAppointment = (patientId: string): void => {
    const payload = {
      requested_at: new Date().toISOString(), 
      requested_date: formatDate(selectedDate), 
      approved_at: null,
      cancelled_at: null,
      completed_at: null,
      rejected_at: null,
      reason: null,
      status: 'pending',
      rp_id: rp_id || '',
      pat_id: patientId,
    };

    addPrenatalAppointmentMutation.mutateAsync(payload)
      .then(() => {
        Alert.alert(
          'Success',
          `Prenatal appointment scheduled for ${selectedDate.toLocaleDateString()}`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/home'),
            },
          ]
        );
      })
      .catch((error) => {
        const errorMsg = 'Failed to schedule appointment. Please try again.';
        Alert.alert('Error', errorMsg);
        console.error('Backend error:', error);
      });
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Prenatal Appointment</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView className='flex-1 bg-gray-50' showsVerticalScrollIndicator={false}>

        <View className='px-6 mt-6'>
          {/* Date Selection Card */}
          <View className='bg-white rounded-2xl shadow-lg p-6 mb-4'>
            <View className='flex-row items-center mb-4'>
              <View className='w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3'>
                <Calendar size={20} color="#2563eb" />
              </View>
              <Text className='text-lg font-bold text-gray-900'>Select Appointment Date</Text>
            </View>

            <TouchableOpacity
              className='bg-gray-50 border-2 border-gray-200 rounded-xl p-4 active:bg-gray-100'
              onPress={() => setShowDatePicker(true)}
            >
              <Text className='text-base font-semibold text-gray-900 mb-1'>
                {getDisplayDate(selectedDate)}
              </Text>
              <Text className='text-sm text-gray-500'>
                {selectedDate.getFullYear()}
              </Text>
            </TouchableOpacity>

            <View className='bg-blue-50 rounded-lg p-3 mt-3'>
              <Text className='text-xs text-blue-800 leading-5'>
                {availableDays.size > 0
                  ? '📅 Appointments available only on scheduled days'
                  : '📅 Check scheduler for available days'}
              </Text>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
              maximumDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)}
            />
          )}

          {/* Important Reminders Card */}
          <View className='bg-white rounded-2xl shadow-lg p-6 mb-4'>
            <View className='flex-row items-center mb-4'>
              <View className='w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3'>
                <AlertCircle size={20} color="#f59e0b" />
              </View>
              <Text className='text-lg font-bold text-gray-900'>Important Reminders</Text>
            </View>

            <View className='space-y-3'>
              <View className='flex-row items-start'>
                <View className='w-6 h-6 rounded-full bg-amber-100 items-center justify-center mr-3 mt-0.5'>
                  <Text className='text-amber-700 text-xs font-bold'>1</Text>
                </View>
                <Text className='flex-1 text-gray-700 text-sm leading-6'>Please arrive on time for your appointment</Text>
              </View>
              <View className='flex-row items-start'>
                <View className='w-6 h-6 rounded-full bg-amber-100 items-center justify-center mr-3 mt-0.5'>
                  <Text className='text-amber-700 text-xs font-bold'>2</Text>
                </View>
                <Text className='flex-1 text-gray-700 text-sm leading-6'>Wear comfortable clothing</Text>
              </View>
              <View className='flex-row items-start'>
                <View className='w-6 h-6 rounded-full bg-amber-100 items-center justify-center mr-3 mt-0.5'>
                  <Text className='text-amber-700 text-xs font-bold'>3</Text>
                </View>
                <Text className='flex-1 text-gray-700 text-sm leading-6'>Service is completely free of charge</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            className={`rounded-2xl p-5 items-center shadow-lg mb-4 ${
              hasPendingAppointment || addPrenatalAppointmentMutation.isPending
                ? 'bg-gray-300' 
                : 'bg-blue-500'
            }`} 
            onPress={handleSubmit} disabled={hasPendingAppointment || addPrenatalAppointmentMutation.isPending} >
            {addPrenatalAppointmentMutation.isPending ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="blue" />
                <Text className="text-lg font-bold text-white ml-3">Scheduling...</Text>
              </View>
            ) : hasPendingAppointment ? (
              <Text className="text-lg font-bold text-gray-600">Appointment Pending</Text>
            ) : (
              <Text className="text-lg font-bold text-white">Schedule Appointment</Text>
            )}
          </TouchableOpacity>

          {/* Warning message */}
          {hasPendingAppointment && (
            <View className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-4">
              <View className='flex-row items-start'>
                <AlertCircle size={20} color="#f59e0b" className='mt-0.5 mr-2' />
                <Text className="text-amber-900 text-sm leading-6 flex-1">
                  You already have a pending appointment for {selectedDate.toLocaleDateString()}. 
                  Please wait for approval or select a different date.
                </Text>
              </View>
            </View>
          )}

          {/* Emergency Section */}
          <View className='bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-4'>
            <View className='flex-row items-center mb-3'>
              <View className='w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3'>
                <Phone size={20} color="#dc2626" />
              </View>
              <Text className='text-lg font-bold text-red-700'>Emergency?</Text>
            </View>
            <Text className='text-sm text-red-700 leading-6'>
              For pregnancy emergencies, go directly to the nearest hospital or call emergency services immediately.
            </Text>
          </View>

          <View className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
            <View className='flex-row items-center mb-4'>
              <View className='w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3'>
                <MapPin size={20} color="#16a34a" />
              </View>
              <Text className='text-lg font-bold text-gray-900'>Brgy. Health Center</Text>
            </View>
            <View className='ml-5'>
              <View className='flex-row items-center mb-2'>
                <Clock size={16} color="#6b7280" className='mr-2' />
                <Text className='text-sm font-semibold text-gray-800'>Monday - Friday</Text>
              </View>
              <Text className='text-sm text-gray-600 ml-6'>8:00 AM - 5:00 PM</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Patient Registration Dialog */}
      <Modal
        visible={showRegistrationDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRegistrationDialog(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className='w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-3'>
                    <UserPlus size={24} color="#ffffff" />
                  </View>
                  <Text className="text-xl font-bold text-white">Patient Registration</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowRegistrationDialog(false)}
                  className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                >
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <View className="p-6">
              <View className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
                <View className="flex-row items-start">
                  <AlertCircle size={20} color="#2563eb" className="mt-1" />
                  <View className="flex-1 ml-3">
                    <Text className="text-blue-900 font-bold text-base mb-2">
                      Not Yet Registered as Patient
                    </Text>
                    <Text className="text-blue-800 text-sm leading-6">
                      You need to be registered as a patient before scheduling a prenatal appointment. 
                      Would you like to create your patient record now?
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4">
                <Text className="text-gray-700 text-sm leading-6">
                  <Text className="font-bold">Note:</Text> Creating a patient record is quick and uses your existing resident information. 
                  This is required for all health services.
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row p-6 pt-0 gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 rounded-2xl bg-gray-100 border-2 border-gray-200 active:bg-gray-200"
                onPress={() => setShowRegistrationDialog(false)}
                disabled={checkOrCreatePatientMutation.isPending}
              >
                <Text className="text-gray-700 text-center font-bold text-base">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-4 px-4 rounded-2xl ${
                  checkOrCreatePatientMutation.isPending ? 'bg-blue-400' : 'bg-blue-600'
                } shadow-lg`}
                onPress={handleCreatePatient}
                disabled={checkOrCreatePatientMutation.isPending}
              >
                {checkOrCreatePatientMutation.isPending ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white text-center font-bold text-base ml-2">Creating...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-bold text-base">Create & Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
};

export default PrenatalBookingPage;