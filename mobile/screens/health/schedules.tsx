import * as React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ChevronLeft, MoreVertical, Calendar, Heart, Bell } from 'lucide-react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { router } from 'expo-router';

const appointments = [
  { id: 1, date: 'June 20, 2025 - Morning', type: 'Medical Consultation', isUpcoming: true },
  { id: 2, date: 'June 12, 2023 - Afternoon', type: 'Medical Consultation', isUpcoming: false },
  { id: 3, date: 'May 5, 2023 - Evening', type: 'Follow-up Checkup', isUpcoming: false },
];

const AppointmentCard = ({ date, type, isUpcoming }) => (
  <Card className="bg-[#D7E2F8] rounded-xl overflow-hidden mt-4">
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center">
          <Calendar size={20} color="#263D67" />
          <Text className="text-black ml-2 text-md">Appointment date</Text>
        </View>
        <TouchableOpacity>
          <MoreVertical size={20} color="#263D67" />
        </TouchableOpacity>
      </View>
      <Text className="text-[#263D67] font-medium text-xl mb-4">{date}</Text>
      <View className="border-t border-[#C7D7F4] pt-4 flex-row items-center">
        <Heart size={20} color={isUpcoming ? 'red' : '#263D67'} fill={isUpcoming ? 'red' : '#263D67'} />
        <Text className="text-[#263D67] font-medium text-lg ml-2">{type}</Text>
      </View>
    </View>
  </Card>
);

export default function Schedules() {
  const [activeTab, setActiveTab] = React.useState('upcoming');

  return (
    <View className="flex-1 bg-[#ECF8FF] p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableWithoutFeedback onPress={() => router.back()}>
          <Text className="text-black text-[15px]">Back</Text>
        </TouchableWithoutFeedback>
        <Bell size={24} color="#263D67" />
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold text-[#263D67] mb-6">Schedules</Text>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
        <TabsList className="flex-row w-full h-12 bg-[#D7E2F8] rounded-full p-1">
          <TabsTrigger
            value="upcoming"
            className={`flex-1 p-2 rounded-full ${activeTab === 'upcoming' ? 'bg-white shadow-lg' : 'bg-transparent'}`}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text className={`font-PoppinsSemiBold ${activeTab === 'upcoming' ? 'text-[#263D67]' : 'text-[#667085]'}`}>Upcoming</Text>
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className={`flex-1 p-2 rounded-full ${activeTab === 'past' ? 'bg-white shadow-lg' : 'bg-transparent'}`}
            onPress={() => setActiveTab('past')}
          >
            <Text className={`font-PoppinsSemiBold ${activeTab === 'past' ? 'text-[#263D67]' : 'text-[#667085]'}`}>Past</Text>
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming">
          {appointments.filter(appt => appt.isUpcoming).map(appt => (
            <AppointmentCard key={appt.id} {...appt} />
          ))}
        </TabsContent>

        {/* Past Tab */}
        <TabsContent value="past">
          {appointments.filter(appt => !appt.isUpcoming).map(appt => (
            <AppointmentCard key={appt.id} {...appt} />
          ))}
        </TabsContent>
      </Tabs>
    </View>
  );
}
