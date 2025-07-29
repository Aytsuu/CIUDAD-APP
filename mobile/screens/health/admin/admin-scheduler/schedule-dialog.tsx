// ScheduleDialog.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WeeklySchedule } from './schedule-types';
import ServiceScheduleForm from './schedule-form';

interface ScheduleDialogProps {
  weeklySchedule: WeeklySchedule;
  weekDays: Date[];
  services: string[];
  onSave: (schedule: WeeklySchedule) => void;
  onAddService: (serviceName: string) => void;
}

export default function ScheduleDialog({
  weeklySchedule,
  weekDays,
  services,
  onSave,
  onAddService,
}: ScheduleDialogProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSave = (newSchedule: WeeklySchedule) => {
    onSave(newSchedule);
    setModalVisible(false); // Close modal on save
  };

  return (
    <View>
      <TouchableOpacity className="bg-blue-500 py-2.5 px-4 rounded-lg flex-row items-center justify-center" onPress={() => setModalVisible(true)}>
        <Text className="text-white text-base font-bold ml-1">Edit Schedule</Text>
      </TouchableOpacity>

      <Modal
        // animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="m-5 bg-white rounded-2xl p-5 items-center shadow-xl w-[90%] max-h-[90%]">
           
            <ServiceScheduleForm
              initialSchedule={weeklySchedule}
              weekDays={weekDays}
              services={services}
              onSave={handleSave}
              onAddService={onAddService}
            />
            <TouchableOpacity className="mt-4 bg-gray-300 py-2.5 px-5 rounded-lg" onPress={() => setModalVisible(false)}>
              <Text className="text-gray-800 font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
