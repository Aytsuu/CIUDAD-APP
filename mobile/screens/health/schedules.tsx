"use client"

import * as React from "react"
import { View, TouchableOpacity, ScrollView, StatusBar, Animated, Dimensions, Modal, Alert } from "react-native"
import { ChevronLeft, MoreVertical, Calendar, Heart, Clock, X } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { router } from "expo-router"

const { width } = Dimensions.get("window")

const initialAppointments = [
  {
    id: 1,
    date: "June 20, 2025",
    time: "Morning (9:00 AM)",
    type: "Medical Consultation",
    isUpcoming: true,
    dateTime: new Date(2025, 5, 20, 9, 0), // June 20, 2025, 9:00 AM
  },
  {
    id: 2,
    date: "June 12, 2023",
    time: "Afternoon (2:30 PM)",
    type: "Medical Consultation",
    isUpcoming: false,
    dateTime: new Date(2023, 5, 12, 14, 30),
  },
  {
    id: 3,
    date: "May 5, 2023",
    time: "Evening (5:00 PM)",
    type: "Follow-up Checkup",
    isUpcoming: false,
    dateTime: new Date(2023, 4, 5, 17, 0),
  },
]

type Appointment = {
  id: number
  date: string
  time: string
  type: string
  isUpcoming: boolean
  dateTime: Date
}

type RescheduleModalProps = {
  visible: boolean
  appointment: Appointment | null
  onClose: () => void
  onReschedule: (appointmentId: number, newDate: Date, newTime: Date) => void
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ visible, appointment, onClose, onReschedule }) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [selectedTime, setSelectedTime] = React.useState(new Date())
  const [showDatePicker, setShowDatePicker] = React.useState(false)
  const [showTimePicker, setShowTimePicker] = React.useState(false)

  React.useEffect(() => {
    if (appointment) {
      setSelectedDate(appointment.dateTime)
      setSelectedTime(appointment.dateTime)
    }
  }, [appointment])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleReschedule = () => {
    if (appointment) {
      onReschedule(appointment.id, selectedDate, selectedTime)
      onClose()
    }
  }

  if (!appointment) return null

  return (
    <Modal visible={visible}  transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-PoppinsBold text-[#263D67]">Reschedule Appointment</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#263D67" />
            </TouchableOpacity>
          </View>

          {/* Current Appointment Info */}
          <View className="bg-[#ECF8FF] rounded-2xl p-4 mb-6">
            <Text className="text-sm font-PoppinsRegular text-[#263D67]/70 mb-1">Current Appointment</Text>
            <Text className="text-lg font-PoppinsSemiBold text-[#263D67]">{appointment.type}</Text>
            <Text className="text-sm font-PoppinsRegular text-[#263D67]/70">
              {appointment.date} • {appointment.time}
            </Text>
          </View>

          {/* Date Selection */}
          <View className="mb-4">
            <Text className="text-sm font-PoppinsMedium text-[#263D67] mb-3">Select New Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-[#ECF8FF] rounded-xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Calendar size={20} color="#263D67" />
                <Text className="text-base font-PoppinsRegular text-[#263D67] ml-3">{formatDate(selectedDate)}</Text>
              </View>
              <ChevronLeft size={16} color="#263D67" style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
          </View>

          {/* Time Selection */}
          <View className="mb-6">
            <Text className="text-sm font-PoppinsMedium text-[#263D67] mb-3">Select New Time</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="bg-[#ECF8FF] rounded-xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Clock size={20} color="#263D67" />
                <Text className="text-base font-PoppinsRegular text-[#263D67] ml-3">{formatTime(selectedTime)}</Text>
              </View>
              <ChevronLeft size={16} color="#263D67" style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-[#263D67]/10 rounded-xl py-4">
              <Text className="text-[#263D67] text-center font-PoppinsMedium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReschedule} className="flex-1 bg-[#263D67] rounded-xl py-4">
              <Text className="text-white text-center font-PoppinsMedium">Reschedule</Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(false)
                if (date) setSelectedDate(date)
              }}
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="default"
              onChange={(event, time) => {
                setShowTimePicker(false)
                if (time) setSelectedTime(time)
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

type AppointmentCardProps = {
  appointment: Appointment
  onReschedule: (appointment: Appointment) => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onReschedule }) => {
  const { id, date, time, type, isUpcoming } = appointment
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleCancel = () => {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          // Handle cancel logic here
          console.log("Appointment cancelled")
        },
      },
    ])
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/appointment-details",
            params: { appointmentId: id, date, time, type, isUpcoming },
          })
        }
      > */}
        <Card className="bg-white/80 rounded-2xl overflow-hidden mt-4 shadow-sm border border-white/30">
          <View className="p-5">
            {/* Date Header */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <View className="bg-[#ECF8FF] rounded-full p-2 mr-3">
                    <Calendar size={18} color="#263D67" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-PoppinsRegular text-[#263D67]/70 uppercase tracking-wide">
                      Appointment Date
                    </Text>
                    <Text className="text-lg font-PoppinsSemiBold text-[#263D67] mt-1">{date}</Text>
                  </View>
                </View>

                {/* Time */}
                <View className="flex-row items-center ml-11">
                  <Clock size={14} color="#263D67" opacity={0.7} />
                  <Text className="text-sm font-PoppinsRegular text-[#263D67]/70 ml-2">{time}</Text>
                </View>
              </View>
            </View>

            {/* Type */}
            <View className="border-t border-[#263D67]/10 pt-4 mb-4">
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-lg font-PoppinsSemiBold text-[#263D67]">{type}</Text>
                  <Text className="text-sm font-PoppinsRegular text-[#263D67]/70">Health Service</Text>
                </View>
                {isUpcoming && (
                  <View className="bg-red-50 rounded-full p-2">
                    <Heart size={16} color="red" fill="red" />
                  </View>
                )}
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xs font-PoppinsRegular text-[#263D67]/50 mr-1">Tap for details</Text>
                <ChevronLeft size={12} color="#263D67" style={{ transform: [{ rotate: "180deg" }] }} opacity={0.5} />
              </View>

              {isUpcoming && (
                <View className="flex-row">
                  <TouchableOpacity
                    className="bg-[#263D67]/10 rounded-full px-4 py-2 mr-2"
                    onPress={(e) => {
                      e.stopPropagation()
                      onReschedule(appointment)
                    }}
                  >
                    <Text className="text-[#263D67] text-xs font-PoppinsMedium">Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-500/10 rounded-full px-4 py-2"
                    onPress={(e) => {
                      e.stopPropagation()
                      handleCancel()
                    }}
                  >
                    <Text className="text-red-500 text-xs font-PoppinsMedium">Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Card>
      {/* </TouchableOpacity> */}
    </Animated.View>
  )
}

export default function Schedules() {
  const [activeTab, setActiveTab] = React.useState("upcoming")
  const [appointments, setAppointments] = React.useState(initialAppointments)
  const [rescheduleModal, setRescheduleModal] = React.useState({
    visible: false,
    appointment: null as Appointment | null,
  })

  const handleReschedulePress = (appointment: Appointment) => {
    setRescheduleModal({
      visible: true,
      appointment,
    })
  }

  const handleRescheduleConfirm = (appointmentId: number, newDate: Date, newTime: Date) => {
    // Combine date and time
    const newDateTime = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      newTime.getHours(),
      newTime.getMinutes(),
    )

    // Format the new date and time strings
    const formattedDate = newDateTime.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const formattedTime = newDateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    // Update the appointment
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              date: formattedDate,
              time: formattedTime,
              dateTime: newDateTime,
            }
          : apt,
      ),
    )

    Alert.alert(
      "Appointment Rescheduled",
      `Your appointment has been rescheduled to ${formattedDate} at ${formattedTime}`,
      [{ text: "OK" }],
    )
  }

  const closeRescheduleModal = () => {
    setRescheduleModal({
      visible: false,
      appointment: null,
    })
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ECF8FF" />
      <View className="flex-1 bg-[#ECF8FF]">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 pt-12 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center rounded-full px-2 py-2">
            <ChevronLeft size={18} color="#263D67" />
            <Text className="text-[#263D67] text-[15px] font-PoppinsMedium ml-1">Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Page Title */}
          <View className="px-4 pt-6 pb-2">
            <Text className="text-3xl font-PoppinsBold text-[#263D67]">Schedules</Text>
            <Text className="text-base font-PoppinsRegular text-[#263D67]/70">
              Manage your appointments and bookings
            </Text>
          </View>

          {/* Tabs */}
          <View className="px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
              <TabsList className="flex-row w-full h-12 bg-[#D7E2F8] rounded-full p-1">
                <TabsTrigger
                  value="upcoming"
                  className={`flex-1 p-2 rounded-full ${activeTab === "upcoming" ? "bg-white shadow-lg" : "bg-transparent"}`}
                >
                  <Text
                    className={`font-PoppinsSemiBold ${activeTab === "upcoming" ? "text-[#263D67]" : "text-[#667085]"}`}
                  >
                    Upcoming
                  </Text>
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className={`flex-1 p-2 rounded-full ${activeTab === "past" ? "bg-white shadow-lg" : "bg-transparent"}`}
                >
                  <Text
                    className={`font-PoppinsSemiBold ${activeTab === "past" ? "text-[#263D67]" : "text-[#667085]"}`}
                  >
                    Past
                  </Text>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {appointments
                  .filter((a) => a.isUpcoming)
                  .map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onReschedule={handleReschedulePress}
                    />
                  ))}
              </TabsContent>

              <TabsContent value="past">
                {appointments
                  .filter((a) => !a.isUpcoming)
                  .map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onReschedule={handleReschedulePress}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          </View>
        </ScrollView>

        {/* Reschedule Modal */}
        <RescheduleModal
          visible={rescheduleModal.visible}
          appointment={rescheduleModal.appointment}
          onClose={closeRescheduleModal}
          onReschedule={handleRescheduleConfirm}
        />
      </View>
    </>
  )
}
