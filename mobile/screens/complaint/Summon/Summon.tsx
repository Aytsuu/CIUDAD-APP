import React, { useState, useCallback, memo, useMemo } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  Platform,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  Info,
  CheckCircle,
  AlertCircle,
  Scale,
  Send,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  X,
} from "lucide-react-native";
import { router } from "expo-router";

// Configure calendar locale
LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
LocaleConfig.defaultLocale = 'en';

type TimeSlot = {
  id: string;
  display: string;
};

type BarangayAvailability = {
  office_hours: string;
  mediation_schedule: {
    days: string[];
    hours: string;
    break: string;
  };
  contact: string;
  email: string;
  notice_period: string;
  holidays: string[];
};

type BarangayAvailabilityModalProps = {
  visible: boolean;
  onClose: () => void;
  availability: BarangayAvailability;
};

export const Summon = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState<boolean>(false);

  // Barangay availability data
  const barangayAvailability: BarangayAvailability = {
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    mediation_schedule: {
      days: ["Tuesday", "Wednesday", "Thursday"],
      hours: "9:00 AM - 4:00 PM",
      break: "12:00 PM - 1:00 PM (Lunch Break)"
    },
    contact: "(032) 123-4567",
    email: "mediation@barangay.gov.ph",
    notice_period: "At least 2 business days advance notice required",
    holidays: ["2025-01-01", "2025-12-25", "2025-12-30"]
  };

  // Generate marked dates for calendar
  const markedDates = useMemo(() => {
    const today = new Date();
    const marked: any = {};
    
    // Mark unavailable dates (past dates, holidays, non-mediation days)
    const current = new Date(today);
    current.setDate(current.getDate() - 7); // Start from 7 days ago
    
    // Look ahead 60 days
    for (let i = 0; i < 60; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const isMediationDay = [2, 3, 4].includes(dayOfWeek); // Tue=2, Wed=3, Thu=4
      const isPast = date < today;
      const isAdvanceNotice = date <= new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
      const isHoliday = barangayAvailability.holidays.includes(dateStr);
      
      if (isPast || isHoliday || !isMediationDay || isAdvanceNotice) {
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          dotColor: '#EF4444',
          selected: false
        };
      }
    }
    
    // Mark today if it's available
    const todayStr = today.toISOString().split('T')[0];
    if (!marked[todayStr]) {
      marked[todayStr] = {
        selected: todayStr === selectedDate,
        selectedColor: '#10B981',
        marked: true,
        dotColor: 'white'
      };
    }
    
    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#10B981'
      };
    }
    
    return marked;
  }, [selectedDate, barangayAvailability.holidays]);

  // Available time slots
  const timeSlots: TimeSlot[] = [
    { id: "09:00", display: "9:00 AM - 10:30 AM" },
    { id: "10:30", display: "10:30 AM - 12:00 PM" },
    { id: "13:00", display: "1:00 PM - 2:30 PM" },
    { id: "14:30", display: "2:30 PM - 4:00 PM" },
  ];

  const handleDateSelect = useCallback((day: { dateString: string }) => {
    const dateStr = day.dateString;
    const date = new Date(dateStr);
    const today = new Date();
    const isPast = date < today;
    const isAdvanceNotice = date <= new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    const isHoliday = barangayAvailability.holidays.includes(dateStr);
    const dayOfWeek = date.getDay();
    const isMediationDay = [2, 3, 4].includes(dayOfWeek);

    if (!isPast && !isHoliday && isMediationDay && !isAdvanceNotice) {
      setSelectedDate(dateStr);
      setSelectedTimeSlot("");
    }
  }, [barangayAvailability.holidays]);

  const handleSubmit = useCallback(async () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert("Error", "Please select both date and time for the mediation session");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedDay = new Date(selectedDate);
      const dayName = selectedDay.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = selectedDay.toLocaleDateString();
      const selectedTime = timeSlots.find(t => t.id === selectedTimeSlot);
      
      Alert.alert(
        "Mediation Scheduled Successfully",
        `Your mediation session has been scheduled for ${dayName}, ${formattedDate} at ${selectedTime?.display}. All parties will be notified.`,
        [
          {
            text: "OK", 
            // onPress: () => router.push("/complaint-list")
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to schedule mediation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDate, selectedTimeSlot, timeSlots]);

  const selectedDayInfo = selectedDate ? new Date(selectedDate) : null;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View
        className="bg-white px-6 py-4 border-b border-gray-200"
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 40,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-gray-900 mr-2">
              Schedule Mediation
            </Text>
            <TouchableOpacity
              onPress={() => setShowAvailabilityModal(true)}
              className="p-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Info size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Calendar Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
            <Calendar
              current={new Date().toISOString()}
              minDate={new Date()}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#6B7280',
                selectedDayBackgroundColor: '#10B981',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#10B981',
                dayTextColor: '#374151',
                textDisabledColor: '#D1D5DB',
                dotColor: '#EF4444',
                selectedDotColor: '#ffffff',
                arrowColor: '#10B981',
                monthTextColor: '#111827',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12
              }}
              enableSwipeMonths={true}
              hideExtraDays={true}
              firstDay={0} // Start week on Sunday
            />
            
            {/* Legend */}
            <View className="flex-row justify-center mt-6 space-x-6">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-600 rounded-full mr-2" />
                <Text className="text-xs text-gray-600">Selected</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 border-2 border-green-500 rounded-full mr-2" />
                <Text className="text-xs text-gray-600">Today</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-full mr-2" />
                <Text className="text-xs text-gray-600">Available</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                <Text className="text-xs text-gray-600">Unavailable</Text>
              </View>
            </View>
          </View>

          {/* Selected Date Info Card */}
          {selectedDayInfo && (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 p-2 rounded-full mr-3">
                  <CalendarIcon size={20} color="#10B981" />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  {selectedDayInfo.toLocaleDateString('en-US', { weekday: 'long' })}, {selectedDayInfo.toLocaleDateString()}
                </Text>
              </View>
              
              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="bg-green-100 p-1.5 rounded-full mr-3 mt-0.5">
                    <Clock size={16} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">Office Hours</Text>
                    <Text className="text-gray-700">{barangayAvailability.office_hours}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <View className="bg-green-100 p-1.5 rounded-full mr-3 mt-0.5">
                    <Scale size={16} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">Mediation Hours</Text>
                    <Text className="text-gray-700">{barangayAvailability.mediation_schedule.hours}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <View className="bg-red-100 p-1.5 rounded-full mr-3 mt-0.5">
                    <AlertCircle size={16} color="#EF4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">Break Time</Text>
                    <Text className="text-gray-700">{barangayAvailability.mediation_schedule.break}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Time Slots Card */}
          {selectedDate && (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 p-2 rounded-full mr-3">
                  <Clock size={20} color="#10B981" />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  Select Time Slot
                </Text>
              </View>
              
              <View className="space-y-3">
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => setSelectedTimeSlot(slot.id)}
                    className={`p-4 rounded-xl border-2 mb-2 ${
                      selectedTimeSlot === slot.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Clock size={18} color="#6B7280" />
                        <Text className={`font-semibold ml-3 ${
                          selectedTimeSlot === slot.id ? "text-green-600" : "text-gray-900"
                        }`}>
                          {slot.display}
                        </Text>
                      </View>
                      {selectedTimeSlot === slot.id && (
                        <View className="bg-green-500 p-1 rounded-full">
                          <CheckCircle size={16} color="white" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Schedule Summary Card */}
          {selectedDate && selectedTimeSlot && (
            <View className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-200">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 p-2 rounded-full mr-3">
                  <CheckCircle size={20} color="#10B981" />
                </View>
                <Text className="text-lg font-bold text-green-900">
                  Schedule Summary
                </Text>
              </View>
              
              <View className="space-y-4">
                <View className="flex-row">
                  <Text className="text-sm font-medium text-green-800 w-24">Date:</Text>
                  <Text className="text-sm text-green-700 flex-1">
                    {selectedDayInfo?.toLocaleDateString('en-US', { weekday: 'long' })}, {selectedDayInfo?.toLocaleDateString()}
                  </Text>
                </View>
                
                <View className="flex-row">
                  <Text className="text-sm font-medium text-green-800 w-24">Time:</Text>
                  <Text className="text-sm text-green-700 flex-1">
                    {timeSlots.find(t => t.id === selectedTimeSlot)?.display}
                  </Text>
                </View>
                
                <View className="pt-2">
                  <Text className="text-xs text-green-600">
                    A confirmation will be sent to all parties involved.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || !selectedDate || !selectedTimeSlot}
            activeOpacity={0.8}
            className={`rounded-2xl p-5 items-center justify-center mb-8 ${
              isSubmitting || !selectedDate || !selectedTimeSlot
                ? "bg-blue-500"
                : "bg-green-600"
            }`}
            style={{
              shadowColor: "#ffffff",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-bold text-lg ml-3">
                  Scheduling Mediation...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Send size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-3">
                  Schedule Mediation Session
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barangay Availability Modal */}
      <BarangayAvailabilityModal
        visible={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        availability={barangayAvailability}
      />
    </View>
  );
};

const BarangayAvailabilityModal: React.FC<BarangayAvailabilityModalProps> = memo(({ 
  visible, 
  onClose, 
  availability 
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={false}
    presentationStyle="pageSheet"
  >
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View
        className="bg-white px-6 py-4 border-b border-gray-200"
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 40,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <X size={24} color="#374151" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-gray-900">
            Barangay Availability
          </Text>
          
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* Office Hours Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="bg-green-100 p-2 rounded-full mr-3">
              <Clock size={20} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Office Hours
            </Text>
          </View>
          <Text className="text-gray-700 text-base leading-6">
            {availability.office_hours}
          </Text>
        </View>

        {/* Mediation Schedule Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="bg-green-100 p-2 rounded-full mr-3">
              <Scale size={20} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Mediation Sessions
            </Text>
          </View>
          <View className="space-y-4">
            <View className="flex-row">
              <Text className="text-sm font-medium text-gray-500 w-24">Days:</Text>
              <Text className="text-gray-700 text-sm flex-1">
                {availability.mediation_schedule.days.join(", ")}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm font-medium text-gray-500 w-24">Hours:</Text>
              <Text className="text-gray-700 text-sm flex-1">
                {availability.mediation_schedule.hours}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm font-medium text-gray-500 w-24">Break:</Text>
              <Text className="text-gray-700 text-sm flex-1">
                {availability.mediation_schedule.break}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="bg-red-100 p-2 rounded-full mr-3">
              <Phone size={20} color="#EF4444" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Contact Information
            </Text>
          </View>
          
          <View className="space-y-4">
            <View className="flex-row items-center">
              <View className="bg-gray-100 p-1.5 rounded-full mr-3">
                <MapPin size={16} color="#6B7280" />
              </View>
              <Text className="text-gray-700">Barangay Office</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-gray-100 p-1.5 rounded-full mr-3">
                <Phone size={16} color="#6B7280" />
              </View>
              <Text className="text-gray-700">{availability.contact}</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-gray-100 p-1.5 rounded-full mr-3">
                <Mail size={16} color="#6B7280" />
              </View>
              <Text className="text-gray-700">{availability.email}</Text>
            </View>
          </View>
        </View>

        {/* Important Notice Card */}
        <View className="bg-red-50 rounded-2xl p-6 mb-6 border border-red-200">
          <View className="flex-row items-center mb-4">
            <View className="bg-red-100 p-2 rounded-full mr-3">
              <AlertCircle size={20} color="#EF4444" />
            </View>
            <Text className="text-lg font-bold text-red-900">
              Important Notice
            </Text>
          </View>
          <Text className="text-red-800 text-sm leading-5">
            {availability.notice_period}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          className={`rounded-2xl p-5 items-center justify-center mb-8 shadow-sm bg-green-600`}
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text className="text-white font-bold text-lg">
            Got It
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </Modal>
));

export default memo(Summon);