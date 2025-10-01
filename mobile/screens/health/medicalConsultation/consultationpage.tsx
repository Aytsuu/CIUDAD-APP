// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, SafeAreaView, StatusBar, Switch } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';

// const MedicalConsultationPage = () => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [selectedTime, setSelectedTime] = useState('');
//   const [chiefComplaint, setChiefComplaint] = useState('');
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [isPregnant, setIsPregnant] = useState(false); // New state for pregnancy status

//   // Mock user data (automatically fetched)
//   const currentUser  = {
//     name: "Maria Santos",
//     id: "BHC-2024-001",
//     contact: "09123456789"
//   };

//   // Mock unavailable dates
//   const unavailableDates = [
//     '2024-06-05',
//     '2024-06-08',
//     '2024-06-09'
//   ];

//   // Mock unavailable time slots for selected date
//   const unavailableTimeSlots: { [key: string]: string[] } = {
//     '2024-06-06': ['09:00', '10:30', '14:00'],
//     '2024-06-07': ['11:00', '15:30'],
//     '2024-06-10': ['08:00', '13:30', '16:00']
//   };

//   // Available time slots (8:00 AM to 5:00 PM, 30-minute intervals)
//   const timeSlots = [
//     '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
//     '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30'
//   ];

//   const formatDate = (date: Date): string => {
//     return date.toISOString().split('T')[0];
//   };

//   const isDateDisabled = (date: any) => {
//     const dayOfWeek = date.getDay();
//     const dateString = formatDate(date);
//     // Disable Sundays (0) and unavailable dates
//     return dayOfWeek === 0 || unavailableDates.includes(dateString);
//   };

//   const isTimeSlotDisabled = (time: string) => {
//     const dateString = formatDate(selectedDate);
//     return unavailableTimeSlots[dateString]?.includes(time) || false;
//   };

//   const onDateChange = (event: any, selected: any) => {
//     setShowDatePicker(false);
//     if (selected && !isDateDisabled(selected)) {
//       setSelectedDate(selected);
//       setSelectedTime(''); // Reset time when date changes
//     }
//   };

//   const handleSubmit = () => {
//     if (!selectedDate || !selectedTime || !chiefComplaint.trim()) {
//       Alert.alert('Error', 'Please fill in all required fields');
//       return;
//     }
    
//     // Here you would submit to your backend
//     const appointmentData = {
//       userId: currentUser .id,
//       date: formatDate(selectedDate),
//       time: selectedTime,
//       chiefComplaint: chiefComplaint.trim(),
//       isPregnant: isPregnant // Include pregnancy status
//     };
    
//     console.log(appointmentData);
//     Alert.alert('Success', 'Appointment request submitted successfully!');
//   };

//   type TimeSlotButtonProps = {
//     time: string;
//   };

//   const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({ time }) => {
//     const disabled = isTimeSlotDisabled(time);
//     const selected = selectedTime === time;
    
//     return (
//       <TouchableOpacity
//         className={`border rounded-lg p-2 ${selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'} ${disabled ? 'bg-gray-200 border-gray-300' : ''}`}
//         onPress={() => !disabled && setSelectedTime(time)}
//         disabled={disabled}
//       >
//         <Text className={`${selected ? 'text-white font-medium' : 'text-gray-800'} ${disabled ? 'text-gray-400' : ''}`}>
//           {time}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView className='flex-1 bg-gray-100'>
//       <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
//       <ScrollView className='flex-1 p-4' showsVerticalScrollIndicator={false}>
        
//         {/* Header */}
//         <View className='bg-white rounded-lg p-5 mb-4 shadow-md'>
//           <Text className='text-2xl font-bold text-gray-800 mb-1'>Medical Consultation</Text>
//           <Text className='text-sm italic text-gray-600 mb-4'>Schedule your medical consultation</Text>

//           {/* Patient Info Display */}
//           <View className='bg-blue-100 p-3 rounded-lg'>
//             <Text className='text-lg font-semibold text-gray-800'>{currentUser .name}</Text>
//             <Text className='text-sm text-gray-600 mt-1'>
//               ID: {currentUser .id} • {currentUser .contact}
//             </Text>
//           </View>
//         </View>

//         {/* Appointment Form */}
//         <View className='bg-white rounded-lg p-5 shadow-md'>
//           <Text className='text-xl font-semibold text-gray-800 mb-5'>Book Your Appointment</Text>

//           {/* Pregnancy status toggle */}
//           <View className='mb-5 flex-row items-center justify-between'>
//             <View>
//               <Text className='text-lg font-medium text-gray-700 mb-1'>Are you pregnant?</Text>
//             </View>
//             <Switch
//               value={isPregnant}
//               onValueChange={setIsPregnant}
//               thumbColor={isPregnant ? '#2563eb' : '#f4f3f4'}
//             //   trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
//             />
//           </View>

//           {/* Date Selection */}
//           <View className='mb-5'>
//             <Text className='text-lg font-medium text-gray-700 mb-2'>Select Date</Text>
//             <TouchableOpacity
//               className='border border-gray-300 rounded-lg p-3 bg-white flex-row items-center'
//               onPress={() => setShowDatePicker(true)}
//             >
//                <Text className='text-lg text-gray-800'>
//                 {selectedDate.toLocaleDateString('en-PH', {
//                   weekday: 'long',
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric'
//                 })}
//               </Text>
//             </TouchableOpacity>
//             <Text className='text-xs text-gray-500 mt-1 italic'>
//               * Sundays and holidays are not available
//             </Text>
//           </View>

//           {showDatePicker && (
//             <DateTimePicker
//               value={selectedDate}
//               mode="date"
//               display="default"
//               onChange={onDateChange}
//               minimumDate={new Date()}
//               maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
//             />
//           )}

//           {/* Time Selection */}
//           <View className='mb-5'>
//             <Text className='text-lg font-medium text-gray-700 mb-2'>Select Time</Text>
//             <View className='flex flex-row flex-wrap gap-2'>
//               {timeSlots.map((time) => (
//                 <TimeSlotButton key={time} time={time} />
//               ))}
//             </View>
//           </View>

//           {/* Chief Complaint */}
//           <View className='mb-5'>
//             <Text className='text-lg font-medium text-gray-700 mb-2'>Chief Complaint</Text>
//             <TextInput
//               className='border border-gray-300 rounded-lg p-3 text-lg bg-white min-h-24'
//               value={chiefComplaint}
//               onChangeText={setChiefComplaint}
//               placeholder="Please describe your reason for consultation"
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//             />
//             <Text className='text-xs text-gray-500 mt-1'>
//               Briefly describe your symptoms or reason for visit
//             </Text>
//           </View>

//           {/* Important Notes */}
//           <View className='bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6'>
//             <Text className='text-lg font-semibold text-yellow-800 mb-2'>Important Notes:</Text>
//             <Text className='text-md text-yellow-700'>
//               • Please arrive 15 minutes before your scheduled time{'\n'}
//               • Bring a valid ID (if any) and any previous medical records{'\n'}
//               • Consultation is free of charge{'\n'}
//               • For emergencies, please go directly to the nearest hospital
//             </Text>
//           </View>

//           {/* Submit Button */}
//           <TouchableOpacity className='bg-blue-600 rounded-lg p-4 items-center' onPress={handleSubmit}>
//             <Text className='text-lg font-semibold text-white'>Schedule Appointment</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Contact Info */}
//         <View className='items-center mt-5 mb-5'>
//           <Text className='text-sm text-gray-600 text-center'>
//             Barangay health hours: Monday - Saturday, 8:00 AM - 5:00 PM
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default MedicalConsultationPage;

