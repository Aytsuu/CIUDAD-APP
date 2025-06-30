import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, SafeAreaView, StatusBar, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, AlertCircle, User, Info, ChevronDown } from 'lucide-react-native';

// Corrected component name to PascalCase (React convention)
const SetSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [showTimeSlots, setShowTimeSlots] = useState<boolean>(false);

  // Type definitions
  type User = {
    name: string;
    id: string;
    contact: string;
  };

  type UnavailableTimeSlots = {
    [key: string]: string[];
  };

  // Mock data
  const currentUser: User = {
    name: "Maria Santos",
    id: "BHC-2024-001",
    contact: "09123456789"
  };

  const unavailableDates: string[] = [
    '2024-06-05',
    '2024-06-08',
    '2024-06-09'
  ];

  const unavailableTimeSlots: UnavailableTimeSlots = {
    '2024-06-06': ['09:00', '10:30', '14:00'],
    '2024-06-07': ['11:00', '15:30'],
    '2024-06-10': ['08:00', '13:30', '16:00']
  };

  const timeSlots: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Utility functions
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isDateDisabled = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const dateString = formatDate(date);
    return dayOfWeek === 0 || unavailableDates.includes(dateString);
  };

  const isTimeSlotDisabled = (time: string): boolean => {
    const dateString = formatDate(selectedDate);
    return unavailableTimeSlots[dateString]?.includes(time) || false;
  };

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected && !isDateDisabled(selected)) {
      setSelectedDate(selected);
      setSelectedTime('');
      setShowTimeSlots(true);
    }
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !chiefComplaint.trim()) {
      Alert.alert('Required Fields', 'Please select date, time, and describe your complaint');
      return;
    }
    
    const appointmentData = {
      userId: currentUser.id,
      date: formatDate(selectedDate),
      time: selectedTime,
      chiefComplaint: chiefComplaint.trim(),
      isPregnant: isPregnant
    };
    
    console.log('Appointment Data:', appointmentData);
    Alert.alert('Appointment Booked', 'Your consultation has been scheduled successfully!');
  };

  // TimeSlotButton component
  type TimeSlotButtonProps = {
    time: string;
  };

  const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({ time }) => {
    const disabled = isTimeSlotDisabled(time);
    const selected = selectedTime === time;
    
    return (
      <TouchableOpacity
        className={`rounded-lg p-3 ${selected ? 'bg-blue-600' : 'bg-gray-100'} ${disabled ? 'opacity-50' : ''}`}
        onPress={() => !disabled && setSelectedTime(time)}
        disabled={disabled}
      >
        <Text className={`text-center ${selected ? 'text-white font-bold' : 'text-gray-800'}`}>
          {time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className='bg-blue-600 px-6 pt-12 pb-6'>
        <Text className='text-2xl font-bold text-white'>Medical Consultation</Text>
        <Text className='text-blue-100 mt-1'>Schedule your appointment with our health professionals</Text>
      </View>

      <ScrollView className='flex-1 px-6' showsVerticalScrollIndicator={false}>
        {/* Patient Info Card */}
        <View className='bg-white rounded-xl shadow-md p-5 mt-6 border border-gray-100'>
          <View className='flex-row items-center mb-4'>
            <View className='bg-blue-100 p-2 rounded-full mr-3'>
              <User size={20} color="#3B82F6" />
            </View>
            <Text className='text-lg font-bold text-gray-800'>Patient Information</Text>
          </View>
          
          <View className='space-y-3'>
            <View className='flex-row'>
              <Text className='text-gray-500 flex-1'>Full Name:</Text>
              <Text className='text-gray-800 font-medium'>{currentUser.name}</Text>
            </View>
            <View className='flex-row'>
              <Text className='text-gray-500 flex-1'>Patient ID:</Text>
              <Text className='text-gray-800 font-medium'>{currentUser.id}</Text>
            </View>
            <View className='flex-row'>
              <Text className='text-gray-500 flex-1'>Contact:</Text>
              <Text className='text-gray-800 font-medium'>{currentUser.contact}</Text>
            </View>
          </View>
        </View>

        {/* Appointment Form */}
        <View className='mt-6'>
          <Text className='text-xl font-bold text-gray-800 mb-4'>Appointment Details</Text>

          {/* Pregnancy Toggle */}
          <View className='bg-gray-50 rounded-xl p-4 mb-5 flex-row justify-between items-center'>
            <View className='flex-row items-center'>
              <View className='bg-pink-100 p-2 rounded-full mr-3'>
                <Info size={18} color="#EC4899" />
              </View>
              <Text className='text-gray-700 font-medium'>Are you currently pregnant?</Text>
            </View>
            <Switch
              value={isPregnant}
              onValueChange={setIsPregnant}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={isPregnant ? '#2563EB' : '#F3F4F6'}
            />
          </View>

          {/* Date Picker */}
          <View className='mb-5'>
            <View className='flex-row items-center mb-3'>
              <View className='bg-blue-100 p-2 rounded-full mr-3'>
                <Calendar size={18} color="#3B82F6" />
              </View>
              <Text className='text-gray-700 font-medium'>Select Appointment Date</Text>
            </View>
            
            <TouchableOpacity
              className='border border-gray-200 rounded-xl p-4 bg-white flex-row justify-between items-center'
              onPress={() => setShowDatePicker(true)}
            >
              <Text className='text-gray-800'>
                {selectedDate.toLocaleDateString('en-PH', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              <ChevronDown size={18} color="#6B7280" />
            </TouchableOpacity>
            
            <Text className='text-xs text-gray-500 mt-2'>
              * Sundays and holidays are unavailable
            </Text>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
              maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            />
          )}

          {/* Time Slot Selection */}
          <View className='mb-5'>
            <TouchableOpacity 
              className='flex-row items-center mb-3'
              onPress={() => setShowTimeSlots(!showTimeSlots)}
            >
              <View className='bg-blue-100 p-2 rounded-full mr-3'>
                <Clock size={18} color="#3B82F6" />
              </View>
              <Text className='text-gray-700 font-medium'>Select Time Slot</Text>
            </TouchableOpacity>
            
            {showTimeSlots && (
              <View className='flex-row flex-wrap gap-2'>
                {timeSlots.map((time) => (
                  <TimeSlotButton key={time} time={time} />
                ))}
              </View>
            )}
            
            {selectedTime && (
              <Text className='text-green-600 text-sm mt-2'>
                Selected: {selectedTime}
              </Text>
            )}
          </View>

          {/* Chief Complaint */}
          <View className='mb-6'>
            <View className='flex-row items-center mb-3'>
              <View className='bg-blue-100 p-2 rounded-full mr-3'>
                <AlertCircle size={18} color="#3B82F6" />
              </View>
              <Text className='text-gray-700 font-medium'>Chief Complaint</Text>
            </View>
            
            <TextInput
              className='border border-gray-200 rounded-xl p-4 text-gray-800 bg-white min-h-32'
              value={chiefComplaint}
              onChangeText={setChiefComplaint}
              placeholder="Describe your symptoms or reason for consultation..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            
            <Text className='text-xs text-gray-500 mt-2'>
              Please be as detailed as possible about your symptoms
            </Text>
          </View>

          {/* Important Notes */}
          <View className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6'>
            <View className='flex-row items-center mb-2'>
              <View className='bg-yellow-100 p-2 rounded-full mr-3'>
                <Info size={18} color="#D97706" />
              </View>
              <Text className='text-yellow-800 font-bold'>Important Information</Text>
            </View>
            
            <View className='space-y-2'>
              <View className='flex-row'>
                <Text className='text-yellow-700 mr-2'>•</Text>
                <Text className='text-yellow-700 flex-1'>Arrive 15 minutes before your appointment</Text>
              </View>
              <View className='flex-row'>
                <Text className='text-yellow-700 mr-2'>•</Text>
                <Text className='text-yellow-700 flex-1'>Bring valid ID and medical records</Text>
              </View>
              <View className='flex-row'>
                <Text className='text-yellow-700 mr-2'>•</Text>
                <Text className='text-yellow-700 flex-1'>Consultations are free of charge</Text>
              </View>
              <View className='flex-row'>
                <Text className='text-yellow-700 mr-2'>•</Text>
                <Text className='text-yellow-700 flex-1'>For emergencies, go to nearest hospital</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            className='bg-blue-600 rounded-xl p-4 items-center mb-8 shadow-md'
            onPress={handleSubmit}
          >
            <Text className='text-white font-bold text-lg'>Schedule Consultation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SetSchedule;