import React, { useState, useCallback, memo, useMemo } from "react";
import { TouchableOpacity, View, Text, ScrollView, Alert, ActivityIndicator, StatusBar, Modal, Platform,} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { ChevronLeft, Calendar as CalendarIcon, Clock, Info, CheckCircle, AlertCircle, Scale, Send, Phone, Mail, MapPin, X,} from "lucide-react-native";
import { router } from "expo-router";
// import { useGetSummonDates, useGetSummonTimeSlots, type SummonTimeSlots, useGetScheduleList } from "../../api-operations/queries/SummonFetchQueries";
import { useGetSummonDates, useGetSummonTimeSlots } from "./queries/scheduleGetQueries";
import { useLocalSearchParams } from "expo-router";
import { SummonTimeSlots } from "./types";
// import { useAddSummonSchedule } from "../../api-operations/queries/ComplaintPostQueries";

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

export const SummonSchedulePicker = () => {
  const params = useLocalSearchParams()
  const sr_id = String(params.sr_id)
//   const {data: scheduleList = [], isLoading: isLoadingSchedule} = useGetScheduleList(sr_id)
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [dateId, setDateId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState<boolean>(false);
  const {data: summonDates = [], isLoading: isLoadingDates} = useGetSummonDates();
//   const {mutate: addSched, isPending} = useAddSummonSchedule()

  // Only fetch time slots when a valid dateId is selected
  const shouldFetchTimeSlots = !!dateId && dateId > 0;
  const {data: availableTimeSlots = [], isLoading: istimeslotLoading} = useGetSummonTimeSlots(
    shouldFetchTimeSlots ? dateId : 0
  );

  function getMediationLevel(scheduleCount: number){
        if (scheduleCount === 0) {
            return "1st MEDIATION";
        } else if (scheduleCount === 1) {
            return "2nd MEDIATION";
        } else if (scheduleCount === 2) {
            return "3rd MEDIATION";
        } else if (scheduleCount === 3) {
            return "1st Conciliation Proceedings";
        } else if (scheduleCount === 4) {
            return "2nd Conciliation Proceedings";
        } else if (scheduleCount >= 5) {
            return "3rd Conciliation Proceedings";
        }
        return "1st MEDIATION"; // Default fallback
    }
  
    // const ss_mediation_level = getMediationLevel(scheduleList.length);
//     console.log('Mediation', ss_mediation_level)

//   console.log('AvailableTime', availableTimeSlots)


  // Create a map of available dates with their sd_id
  const availableDatesMap = useMemo(() => {
    const map = new Map<string, number>();
    summonDates.forEach((summonDate) => {
      map.set(summonDate.sd_date, summonDate.sd_id);
    });
    return map;
  }, [summonDates]);

  // Format time slots from API data
  const formattedTimeSlots = useMemo(() => {
    return availableTimeSlots.map((slot: SummonTimeSlots) => {
      // Convert 24h time to 12h format
      const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${period}`;
      };

      const startTime = formatTime(slot.st_start_time);
      
      return {
        id: slot.st_id?.toString() || "",
        display: `${startTime}`,
        isBooked: slot.st_is_booked,
        rawData: slot
      };
    });
  }, [availableTimeSlots]);

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

  // Generate marked dates for calendar - disable all dates by default, only enable fetched ones
  const markedDates = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const marked: any = {};

    // Start from Jan 1 of current year
    const current = new Date(today.getFullYear(), 0, 1);

    for (let i = 0; i < 365; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      

      // Disable all past dates and today
      if (dateStr === todayStr) {
        marked[dateStr] = {
          disableTouchEvent: true,
          customStyles: {
            text: {
              color: "#10B981",
              fontWeight: "bold",
            },
          },
        };
        continue;
      }

      // Disable all past dates
      if (dateStr < todayStr) {
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          dotColor: "#D1D5DB",
          selected: false,
        };
        continue;
      }

      // Enable only future dates from fetched availableDatesMap
      if (availableDatesMap.has(dateStr)) {
        marked[dateStr] = {
          disabled: false,
          dotColor: "#10B981",
          selected: dateStr === selectedDate,
        };
      } else {
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          selected: false,
        };
      }
    }

    // Ensure selected date is styled correctly if valid
    if (selectedDate && availableDatesMap.has(selectedDate) && selectedDate > todayStr) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: "#10B981",
      };
    }

    return marked;
  }, [selectedDate, availableDatesMap]);


  const handleDateSelect = useCallback((day: any) => {
    console.log("Day pressed:", day); // Debug log
    
    const dateStr = day.dateString;
    
    // Check if the selected date is available
    if (availableDatesMap.has(dateStr)) {
      const sd_id = availableDatesMap.get(dateStr);
      if (sd_id !== undefined) {
        setSelectedDate(dateStr);
        setSelectedTimeSlot("");
        setDateId(sd_id); 
      } else {
        setSelectedDate("");
        setSelectedTimeSlot("");
        setDateId(null);
      }
    } else {
      console.log("Date not available:", dateStr);
      setSelectedDate("");
      setSelectedTimeSlot("");
      setDateId(null); 
    }
  }, [availableDatesMap]);

  const handleSubmit = useCallback(async () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert("Error", "Please select both date and time for the mediation session");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the IDs
      const sd_id = availableDatesMap.get(selectedDate)?.toString() || "";
      const st_id = selectedTimeSlot; 
      const payload={
        sd_id,
        st_id,
        sr_id,
        // ss_mediation_level
      }

    //   addSched(payload)
      
      console.log("Selected Date ID (sd_id):", sd_id);
      console.log("Selected Time Slot ID (st_id):", st_id);
      console.log("Selected Date:", selectedDate);
      console.log("Selected Time Slot:", selectedTimeSlot);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedDay = new Date(selectedDate);
      const dayName = selectedDay.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = selectedDay.toLocaleDateString();
      const selectedTime = formattedTimeSlots.find(t => t.id === selectedTimeSlot);
      
      Alert.alert(
        "Mediation Scheduled Successfully",
        `Your mediation session has been scheduled for ${dayName}, ${formattedDate} at ${selectedTime?.display}.\n\nDate ID: ${sd_id}\nTime Slot ID: ${st_id}`,
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
  }, [selectedDate, selectedTimeSlot, formattedTimeSlots, availableDatesMap]);

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
          {/* Loading indicator */}
          {(isLoadingDates) && (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 items-center justify-center">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="text-gray-600 mt-3">Loading available dates...</Text>
            </View>
          )}         

          {/* Calendar Card */}
          { !isLoadingDates && summonDates.length > 0 && (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
              <Calendar
                current={new Date().toISOString().split("T")[0]}
                minDate={summonDates.length > 0 ? summonDates[0].sd_date : new Date().toISOString()}
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
              <View className="flex-row justify-center mt-6 space-x-6 gap-2">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-green-600 rounded-full" />
                  <Text className="text-xs text-gray-600">Selected</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 border-2 border-green-500 rounded-full" />
                  <Text className="text-xs text-gray-600">Today</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-full" />
                  <Text className="text-xs text-gray-600">Available</Text>
                </View>
              </View>
          </View>

          )}

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

          {/* Time Slots Card - Only show when a date is selected AND we have a valid dateId */}
            {selectedDate && dateId && shouldFetchTimeSlots && (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 p-2 rounded-full mr-3">
                  <Clock size={20} color="#10B981" />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  Select Time Slot
                </Text>
              </View>
              
              {istimeslotLoading ? (
                <View className="py-8 items-center justify-center">
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text className="text-gray-600 mt-3">Loading time slots...</Text>
                </View>
              ) : formattedTimeSlots.length === 0 ? (
                <View className="py-8 items-center justify-center">
                  <AlertCircle size={32} color="#6B7280" />
                  <Text className="text-gray-600 mt-3 text-center">
                    No available time slots for this date
                  </Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {formattedTimeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => !slot.isBooked && setSelectedTimeSlot(slot.id)}
                      className={`p-4 rounded-xl border-2 mb-2 ${
                        selectedTimeSlot === slot.id
                          ? "border-green-500 bg-green-50"
                          : slot.isBooked
                          ? "border-gray-300 bg-gray-100 opacity-60"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      activeOpacity={0.7}
                      disabled={slot.isBooked}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Clock size={18} color={slot.isBooked ? "#9CA3AF" : "#6B7280"} />
                          <Text className={`font-semibold ml-3 ${
                            selectedTimeSlot === slot.id 
                              ? "text-green-600" 
                              : slot.isBooked
                              ? "text-gray-400"
                              : "text-gray-900"
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
              )}
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
                    {formattedTimeSlots.find(t => t.id === selectedTimeSlot)?.display}
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
                ? "bg-gray-400"
                : "bg-green-600"
            }`}
            style={{
              shadowColor: "#10B981",
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

export default memo(SummonSchedulePicker);