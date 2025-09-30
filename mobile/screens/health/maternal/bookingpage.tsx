import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import PageLayout from '@/screens/_PageLayout';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { format } from 'date-fns'; // Import format from date-fns

import { useAddPrenatalAppointment } from './queries/add';
import { useAuth } from '@/contexts/AuthContext';
import { useGetScheduler } from '../admin/admin-scheduler/queries/schedulerFetchQueries';


interface User {
  name: string;
  id: string;
}

interface PrenatalAppointmentData {
  userId: string;
  reqDate: string;
  time: string;
  appointmentType: 'prenatal';
}

// Helper function to calculate age from DOB
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date('2025-09-28'); // Current date
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const PrenatalBookingPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const addPrenatalAppointmentMutation = useAddPrenatalAppointment();

  const { user } = useAuth();
  const rp_id = user?.rp;

  const currentUser: User = {
    name: `${user?.personal?.per_fname} ${user?.personal?.per_mname}${user?.personal?.per_lname}`,
    id: rp_id || "",
  };

  const { data: schedulersData = [] } = useGetScheduler(); // Fetch scheduler data

  // Compute available days for 'Prenatal' service (case-insensitive)
  const availableDays = new Set(
    schedulersData
      .filter((s) => s.service_name.toLowerCase() === 'prenatal' || s.service_name.toLowerCase() === 'maternal') // Adjust service name as needed
      .map((s) => s.day)
  );

  

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isDateDisabled = (date: Date): boolean => {
    const dayName = format(date, 'EEEE'); // Get day name (e.g., 'Thursday')
    const dateString = formatDate(date);

    if (availableDays.size > 0) {
      // If services are scheduled, only enable dates on available days
      return !availableDays.has(dayName);
    } else {
      // Fallback to Thursdays if no services are defined
      const dayOfWeek = date.getDay();
      return dayOfWeek !== 4
    }
  };

  const onDateChange = (event: any, selected?: Date): void => {
    setShowDatePicker(false);
    if (selected) {
      if (isDateDisabled(selected)) {
        Alert.alert(
          'Unavailable Date',
          availableDays.size > 0
            ? 'Prenatal appointments are only available on scheduled days.'
            : 'Prenatal appointments are only available on Thursdays that are not marked as unavailable.'
        );
        return;
      }
      setSelectedDate(selected);
    }
  };

  // Restrict access for non-female users or users <= 13 years old
  if (user?.personal?.per_sex !== 'FEMALE' || (user?.personal?.per_dob && calculateAge(user.personal.per_dob) <= 13)) {
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
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Access Restricted</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-red-600">Maternal services are only available for female users above 13 years old.</Text>
        </View>
      </PageLayout>
    );
  }

  const handleSubmit = (): void => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select date for your prenatal appointment');
      return;
    }

    const payload = {
      requested_at: `${formatDate(selectedDate)}T${selectedTime}:00`,
      confirmed_at: null,
      status: 'pending',
      rp_id: rp_id || '',
      pat_id: ''
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
        let errorMsg = 'Failed to schedule appointment. Please try again.';
        Alert.alert('Error', errorMsg);
        console.error('Backend error:', error);
      });
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Prenatal Appointment</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView className='flex-1 p-4' showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className='bg-blue-100 p-3 rounded-lg'>
          <Text className='text-lg font-semibold text-gray-800'>{currentUser.name}</Text>
          <Text className='text-sm text-gray-600 mt-1'>
            ID: {currentUser.id}
          </Text>
        </View>

        {/* Appointment Form */}
        <View className='bg-white rounded-lg p-5 shadow-md'>
          {/* Date Selection */}
          <View className='mb-5'>
            <Text className='text-lg font-medium text-gray-700 mb-2'>Select Date</Text>
            <TouchableOpacity
              className='border border-gray-300 rounded-lg p-3 bg-white'
              onPress={() => setShowDatePicker(true)}
            >
              <Text className='text-lg text-gray-800'>
                {selectedDate.toLocaleDateString('en-PH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
            <Text className='text-xs text-gray-500 mt-1'>
              {availableDays.size > 0
                ? 'Prenatal appointments available only on scheduled days'
                : 'Prenatal appointments available only every Thursday'}
            </Text>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
              maximumDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)} // 60 days ahead
            />
          )}

          {/* Important Notes */}
          <View className='bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6'>
            <Text className='text-lg font-semibold text-yellow-800 mb-2'>Important Reminders:</Text>
            <Text className='text-md text-yellow-700'>
              • Please arrive{'\n'}
              • Wear comfortable, loose clothing{'\n'}
              • Service is completely free of charge
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity className='bg-blue-600 rounded-lg p-4 items-center' onPress={handleSubmit}>
            <Text className='text-lg font-semibold text-white'>Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contact */}
        <View className='bg-red-100 border border-red-300 mt-5 rounded-lg p-4 mb-5'>
          <Text className='text-lg font-semibold text-red-600 mb-2'>🚨 Emergency?</Text>
          <Text className='text-md text-red-600'>
            For pregnancy emergencies, go directly to the nearest hospital or call emergency services.
          </Text>
        </View>

        {/* Contact Info */}
        <View className='items-center mb-5'>
          <Text className='text-sm text-gray-500 text-center'>
            Barangay health center hours {"\n"}: Monday - Saturday, 8:00 AM - 4:30 PM
          </Text>
        </View>
      </ScrollView>
    </PageLayout>
  );
};

export default PrenatalBookingPage;