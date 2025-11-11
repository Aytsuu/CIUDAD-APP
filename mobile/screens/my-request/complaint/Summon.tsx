import React, { useState, useCallback, memo, useMemo } from "react";
import { TouchableOpacity, View, Text, ScrollView, Alert, ActivityIndicator, StatusBar, Modal, Platform} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { ChevronLeft, Calendar as CalendarIcon, Clock, Info, CheckCircle, AlertCircle, Send, Phone, Mail, MapPin, X } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useGetSummonDates, useGetSummonTimeSlots } from "./queries/summon-relatedFetchQueries";
import { SummonTimeSlots } from "./types";
import PageLayout from "@/screens/_PageLayout";
import { useAddSched } from "./queries/summon-relatedInsertQueries";
import { useGetScheduleList } from "./queries/summon-relatedFetchQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { LoadingModal } from "@/components/ui/loading-modal";

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

// Helper function to get current quarter dates
const getCurrentQuarterDates = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Determine current quarter (0-indexed months)
  let quarterStartMonth, quarterEndMonth;
  
  if (currentMonth >= 0 && currentMonth <= 2) { 
    quarterStartMonth = 0;
    quarterEndMonth = 2;
  } else if (currentMonth >= 3 && currentMonth <= 5) { 
    quarterStartMonth = 3;
    quarterEndMonth = 5;
  } else if (currentMonth >= 6 && currentMonth <= 8) { 
    quarterStartMonth = 6;
    quarterEndMonth = 8;
  } else { // Q4: Oct-Dec
    quarterStartMonth = 9;
    quarterEndMonth = 11;
  }
  
  const quarterStart = new Date(currentYear, quarterStartMonth, 1);
  const quarterEnd = new Date(currentYear, quarterEndMonth + 1, 0); // Last day of quarter end month
  
  return {
    start: quarterStart,
    end: quarterEnd,
    startStr: quarterStart.toISOString().split('T')[0],
    endStr: quarterEnd.toISOString().split('T')[0]
  };
};

export const SummonSchedulePicker = () => {
  const params = useLocalSearchParams()
  const sc_id = String(params.sc_id)
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [dateId, setDateId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState<boolean>(false);
  const {data: summonDates = [], isLoading: isLoadingDates} = useGetSummonDates();
  const {data: schedList = [], isLoading: isLoadingSchedule} = useGetScheduleList(sc_id)
  const {mutate: addSched, isPending} = useAddSched()
  const schedLength = schedList.length

  // Get current quarter dates
  const currentQuarter = useMemo(() => getCurrentQuarterDates(), []);

  // Only fetch time slots when a valid dateId is selected
  const shouldFetchTimeSlots = !!dateId && dateId > 0;
  const {data: availableTimeSlots = [], isLoading: istimeslotLoading} = useGetSummonTimeSlots(
    shouldFetchTimeSlots ? dateId : 0
  );

  function getHearingLevel(scheduleCount: number){
        if (scheduleCount === 0) {
            return {level: "1st MEDIATION", type: "Council"};
        } else if (scheduleCount === 1) {
          return {level: "2nd MEDIATION", type: "Council"};
        } else if (scheduleCount === 2) {
            return {level: "3rd MEDIATION", type: "Council"};
        } else if (scheduleCount === 3) {
            return {level: "1st Conciliation Proceedings", type: "Lupon"};
        } else if (scheduleCount === 4) {
            return {level: "2nd Conciliation Proceedings", type: "Lupon"};
        } else if (scheduleCount >= 5) {
            return {level: "3rd Conciliation Proceedings", type: "Lupon"};
        }
        return { level: "None", type: "" };
    }

  // Get the current hearing level based on schedule count
  const currentHearingLevel = useMemo(() => {
    return getHearingLevel(schedLength);
  }, [schedLength]);

  // Create a map of available dates with their sd_id (only within current quarter)
  const availableDatesMap = useMemo(() => {
    const map = new Map<string, number>();
    summonDates.forEach((summonDate) => {
      const dateStr = summonDate.sd_date;
      // Only include dates within current quarter
      if (dateStr >= currentQuarter.startStr && dateStr <= currentQuarter.endStr) {
        map.set(dateStr, summonDate.sd_id);
      }
    });
    return map;
  }, [summonDates, currentQuarter]);

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

  // Generate marked dates for calendar - only show current quarter dates
  const markedDates = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const marked: any = {};

    // Start from quarter start date
    const startDate = new Date(currentQuarter.start);
    const endDate = new Date(currentQuarter.end);

    // Loop through each day in the current quarter
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];

      // Today's date styling
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
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Past dates - disable completely
      if (dateStr < todayStr) {
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          dotColor: "#D1D5DB",
          selected: false,
        };
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Future dates within quarter - enable only if available
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

      currentDate.setDate(currentDate.getDate() + 1);
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
  }, [selectedDate, availableDatesMap, currentQuarter]);

  const handleDateSelect = useCallback((day: any) => {
    console.log("Day pressed:", day); // Debug log
    
    const dateStr = day.dateString;
    
    // Check if the selected date is available and within current quarter
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
    const sd_id = availableDatesMap.get(selectedDate)?.toString() || "";
    const st_id = selectedTimeSlot; 
    const level = currentHearingLevel.level
    const type = currentHearingLevel.type

    const payload = {sd_id, st_id,  sc_id, level, type};

    addSched(payload);
  }, [selectedDate, selectedTimeSlot, formattedTimeSlots, availableDatesMap, currentHearingLevel, sc_id, addSched]);

  const selectedDayInfo = selectedDate ? new Date(selectedDate) : null;

  if(isLoadingDates || isLoadingSchedule){
    return(
      <View className="flex-1 justify-center items-center bg-gray-50">
        <LoadingState/>
      </View>
    )
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center" activeOpacity={0.7} >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={
        <View className="flex-row items-center">
           <Text className="text-gray-900 text-[13px] mr-2">
            {currentHearingLevel.level} Schedule
          </Text>
        </View>
      }
      wrapScroll={false}
    >
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Quarter Notice */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
              <View className="flex-row items-center">
                <Info size={18} color="#3B82F6" />
                <Text className="text-blue-800 text-sm font-medium ml-2 flex-1">
                  Scheduling is only available for the current quarter ({currentQuarter.start.toLocaleDateString()} - {currentQuarter.end.toLocaleDateString()})
                </Text>
              </View>
            </View>

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
                  minDate={currentQuarter.startStr}
                  maxDate={currentQuarter.endStr}
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
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-gray-300 rounded-full" />
                    <Text className="text-xs text-gray-600">Unavailable</Text>
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
                    <Text className="text-sm font-medium text-green-800 w-24">Hearing Level:</Text>
                    <Text className="text-sm text-green-700 flex-1 font-semibold">
                      {currentHearingLevel.level}
                    </Text>
                  </View>
                  
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
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !selectedDate || !selectedTimeSlot || isPending}
              activeOpacity={0.8}
              className={`rounded-2xl p-5 items-center justify-center mb-8 ${
                isSubmitting || !selectedDate || !selectedTimeSlot || isPending
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
            
            <View className="flex-row items-center">
              <Send size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-3">
                Schedule {currentHearingLevel.level}
              </Text>
            </View>
           
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Barangay Availability Modal */}
        <BarangayAvailabilityModal
          visible={showAvailabilityModal}
          onClose={() => setShowAvailabilityModal(false)}
          availability={barangayAvailability}
        />

        {/* Loading Modal for API call */}
        <LoadingModal visible={isPending || isSubmitting}/>
      </View>
    </PageLayout>
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

