import React, { useState } from 'react';
import { View,Text,TouchableOpacity,ScrollView,Alert,SafeAreaView,StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import PageLayout from '@/screens/_PageLayout';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

interface User {
  name: string;
  id: string;
  contact: string;
  pregnancyWeek?: number;
}

interface PrenatalAppointmentData {
  userId: string;
  date: string;
  time: string;
  appointmentType: 'prenatal';
}

interface TimeSlotButtonProps {
  time: string;
  onPress: (time: string) => void;
  isSelected: boolean;
  isDisabled: boolean;
}

const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
  time,
  onPress,
  isSelected,
  isDisabled,
}) => (
  <TouchableOpacity
    className={`border rounded-lg p-2 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'} ${isDisabled ? 'bg-gray-200 border-gray-300' : ''}`}
    onPress={() => !isDisabled && onPress(time)}
    disabled={isDisabled}
  >
    <Text
      className={`${isSelected ? 'text-white font-medium' : 'text-gray-800'} ${isDisabled ? 'text-gray-400' : ''}`}
    >
      {time}
    </Text>
  </TouchableOpacity>
);

const PrenatalBookingPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const currentUser:User = {
    name: "Maria Santos",
    id: "BHC-2024-001",
    contact: "09123456789",
    pregnancyWeek: 24
  };

  const unavailableDates: string[] = [
    '2024-06-05',
    '2024-06-06',
    '2024-06-08',
    '2024-06-09'
  ];

  const unavailableTimeSlots: Record<string, string[]> = {
    '2024-06-07': ['08:00', '09:30', '11:00'],
    '2024-06-10': ['10:00', '14:30', '15:30'],
    '2024-06-11': ['08:30', '13:00', '16:00']
  };

  const prenatalTimeSlots: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30'
  ];

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isDateDisabled = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const dateString = formatDate(date);
    // Disable all days except Thursday (4) for prenatal, and unavailable dates
    return dayOfWeek !== 4 || unavailableDates.includes(dateString);
  };

  const isTimeSlotDisabled = (time: string): boolean => {
    const dateString = formatDate(selectedDate);
    return unavailableTimeSlots[dateString]?.includes(time) || false;
  };

  const onDateChange = (event: any, selected?: Date): void => {
    setShowDatePicker(false);
    if (selected) {
      if (isDateDisabled(selected)) {
        Alert.alert('Unavailable Date', 'Prenatal appointments are only available on Thursdays that are not marked as unavailable.');
        return; // Do not update selectedDate if disabled
      }
      setSelectedDate(selected);
      setSelectedTime(''); // Reset time when date changes
    }
  };

  const handleSubmit = (): void => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for your prenatal appointment');
      return;
    }
    
    const appointmentData: PrenatalAppointmentData = {
      userId: currentUser.id,
      date: formatDate(selectedDate),
      time: selectedTime,
      appointmentType: 'prenatal'
    };
    
    console.log(appointmentData);
    Alert.alert(
      'Success', 
      `Prenatal appointment scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}`
    );
  };

  const getPregnancyStatus = (): string => {
    if (!currentUser .pregnancyWeek) return '';
    const weeks = currentUser .pregnancyWeek;
    const trimester = weeks <= 12 ? '1st' : weeks <= 27 ? '2nd' : '3rd';
    return `${weeks} weeks (${trimester} trimester)`;
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
          headerTitle={<Text className="text-gray-900 text-[13px]">Resident Details</Text>}
          rightAction={<View className="w-10 h-10" />}
        >
    
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView className='flex-1 p-4' showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className='bg-white rounded-lg p-5 mb-4 shadow-md'>
          <Text className='text-2xl font-bold text-gray-800 mb-1'>Prenatal Care</Text>
          <Text className='text-lg text-gray-600 mb-4'>Schedule Your Prenatal Check-up</Text>
          
          {/* Patient Info Display */}
          <View className='bg-blue-100 p-3 rounded-lg'>
            <Text className='text-lg font-semibold text-gray-800'>{currentUser .name}</Text>
            <Text className='text-sm text-gray-600 mt-1'>
              ID: {currentUser .id} • {currentUser .contact}
            </Text>
            {currentUser .pregnancyWeek && (
              <Text className='text-sm text-blue-600 font-semibold mt-2'>
                🤱 Pregnancy: {getPregnancyStatus()}
              </Text>
            )}
          </View>
        </View>

        {/* Appointment Form */}
        <View className='bg-white rounded-lg p-5 shadow-md'>
          <Text className='text-xl font-semibold text-gray-800 mb-5'>Book Prenatal Appointment</Text>
          
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
              Prenatal appointments available only every Thursdays
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

          {/* Time Selection */}
          <View className='mb-5'>
            <Text className='text-lg font-medium text-gray-700 mb-2'>Select Time Slot *</Text>
            <View className='flex flex-row flex-wrap gap-2'>
              {prenatalTimeSlots.map((time) => (
                <TimeSlotButton
                  key={time}
                  time={time}
                  onPress={setSelectedTime}
                  isSelected={selectedTime === time}
                  isDisabled={isTimeSlotDisabled(time)}
                />
              ))}
            </View>
          </View>

          {/* Prenatal Care Info */}
          {/* <View className='bg-blue-100 rounded-lg p-4 mb-5'>
            <Text className='text-lg font-semibold text-blue-800 mb-2'>What to expect:</Text>
            <Text className='text-md text-blue-700'>
              • Weight and blood pressure monitoring{'\n'}
              • Baby's heartbeat check{'\n'}
              • Fundal height measurement{'\n'}
              • General health assessment{'\n'}
              • Nutritional counseling{'\n'}
              • Questions and concerns discussion
            </Text>
          </View> */}

          {/* Important Notes */}
          <View className='bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6'>
            <Text className='text-lg font-semibold text-yellow-800 mb-2'>Important Reminders:</Text>
            <Text className='text-md text-yellow-700'>
              • Please arrive 10 minutes early{'\n'}
              • Wear comfortable, loose clothing{'\n'}
              • Service is completely free of charge
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity className='bg-blue-600 rounded-lg p-4 items-center' onPress={handleSubmit}>
            <Text className='text-lg font-semibold text-white'>Schedule Prenatal Appointment</Text>
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
