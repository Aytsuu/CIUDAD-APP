import * as React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ChevronLeft, Bell, Calendar } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import SelectLayout from '@/components/ui/select-layout';
import { router } from 'expo-router';

export default function Records() {
  const services = [
    { label: 'Medical Consultation', value: 'Medical Consultation' },
    { label: 'Animal Bites', value: 'Animal Bites' },
    { label: 'Family Planning', value: 'Family Planning' },
  ];

  // State for selected service
  const [selectedService, setSelectedService] = React.useState(services[0]);
  const [records, setRecords] = React.useState<{ id: number; date: string; time: string; }[]>([]);

  const mockDatabase: { [key: string]: { id: number; date: string; time: string; }[] } = {
    "Medical Consultation": [
      { id: 1, date: "January 4, 2025", time: "Morning" },
      { id: 2, date: "February 10, 2025", time: "Afternoon" },
      { id: 3, date: "March 3, 2025", time: "Morning" }
    ],
    "Animal Bites": [
      { id: 4, date: "January 15, 2025", time: "Afternoon" }
    ],
    "Family Planning": [
      { id: 5, date: "February 1, 2025", time: "Morning" },
      { id: 6, date: "March 8, 2025", time: "Afternoon" }
    ]
  };

  React.useEffect(() => {
    const fetchedRecords = mockDatabase[selectedService.value] || [];
    setRecords(fetchedRecords);
  }, [selectedService]);

  return (
    <View className="flex-1 h-full bg-[#ECF8FF] p-4">

      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableWithoutFeedback onPress={() => router.back()}>
          <Text className="text-black text-[15px]">Back</Text>
        </TouchableWithoutFeedback>
        <Bell size={24} color="#263D67" />
      </View>

      {/* Title */}
      <Text className="text-3xl font-PoppinsSemiBold text-[#263D67] mb-6">My records</Text>

      {/* Services Dropdown */}
      <Text className="text-lg font-bold font-PoppinsRegular text-[#263D67] mb-4">Services</Text>
      <SelectLayout
        className="min-w-[100%] font-PoppinsRegular"
        contentClassName="w-full "
        options={services}
        selected={selectedService}
        onValueChange={(value) => setSelectedService(value!)}
      />

      {/* Display Records Dynamically */}
      <View className="mt-6">
        {records.length > 0 ? (
          records.map((record) => (
            <Card key={record.id} className="p-4 mb-3 border-0  bg-[#D6E6F2] rounded-lg">
              <View className="flex-row items-center">
                <Calendar size={20} color="#263D67" className="mr-2" />
                <Text className="text-lg font-PoppinsMedium text-[#263D67]">
                  {record.date} - {record.time}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Text className="text-lg font-PoppinsRegular text-[#263D67] mt-4">No records found.</Text>
        )}
      </View>
    </View>
  );
}
