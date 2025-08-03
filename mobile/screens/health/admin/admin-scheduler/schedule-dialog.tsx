import React, { useState } from "react"
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native" // Replaced Dialog components with Modal, View, Text, TouchableOpacity
import { Edit } from "lucide-react-native" // Changed to lucide-react-native
import { WeeklySchedule } from "./schedule-types"
import ServiceScheduleForm from "./schedule-form"


interface ScheduleDialogProps {
  weeklySchedule: WeeklySchedule
  weekDays: Date[]
  services: string[]
  onSave: (schedule: WeeklySchedule) => void
  onAddService: (serviceName: string) => void
  onAddDay: (newDay: Date) => void
}

export default function ScheduleDialog({
  weeklySchedule,
  weekDays,
  services,
  onSave,
  onAddService,
  onAddDay,
}: ScheduleDialogProps) {
  const [modalVisible, setModalVisible] = useState(false)

  const handleSave = (newSchedule: WeeklySchedule) => {
    onSave(newSchedule)
    setModalVisible(false) // Close modal on save
  }

  return (
    <View>
      {/* DialogTrigger as Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center gap-2 px-4 py-2 bg-blue-600 rounded-md" // Mimics Button styling
      >
        <Text className="text-white font-semibold text-base">Edit Schedule</Text>
      </TouchableOpacity>

      {/* Dialog (Modal) */}
      <Modal
        animationType="slide" // or "fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // For Android back button
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          {/* DialogContent */}
          {/* max-w-6xl max-h-[90vh] overflow-hidden */}
          <View className="w-[95%] max-w-6xl h-[90%] bg-white rounded-lg overflow-hidden">
            {/* DialogHeader */}
            <View className="p-4 border-b border-gray-200">
              {/* DialogTitle */}
              <Text className="text-xl font-semibold text-gray-800 mb-1">Edit Weekly Schedule</Text>
              {/* DialogDescription */}
              <Text className="text-sm text-gray-500">Update your service availability for the week.</Text>
            </View>
            
            {/* ScrollView for content within the modal if it exceeds height */}
            <ScrollView className="flex-1">
              <ServiceScheduleForm
                initialSchedule={weeklySchedule}
                weekDays={weekDays}
                services={services}
                onSave={handleSave}
                onAddService={onAddService}
                onAddDay={onAddDay} // Pass onAddDay prop
                // You might need a prop to close the modal from within the form if save is handled there
                onClose={() => setModalVisible(false)} 
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}
