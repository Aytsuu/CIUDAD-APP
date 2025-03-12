import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronLeft, MoreVertical, Calendar, Heart, Bell} from 'lucide-react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';


export default function Schedules() {
  const [activeTab, setActiveTab] = React.useState('upcoming');

  return (
    <View className="flex-1 bg-[#ECF8FF] p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity>
          <View className="flex-row items-center">
            <ChevronLeft size={24} color="#263D67" />
            <Text className="text-lg font-medium text-[#263D67] ml-1">Back</Text>
          </View>
        </TouchableOpacity>
        <Bell size={24} color="#263D67" />
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold text-[#263D67] mb-6">Schedules</Text>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-4"
      >
        <TabsList className="flex-row w-full h-12 bg-[#D7E2F8] rounded-full p-1">
          <TabsTrigger
            value="upcoming"
            className={`flex-1 p-2 rounded-full ${activeTab === 'upcoming' ? 'bg-white shadow-lg' : 'bg-transparent'}`}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text className={`font-PoppinsSemiBold ${activeTab === 'upcoming' ? 'text-[#263D67]' : 'text-[#667085]'}`}>
              Upcoming
            </Text>
          </TabsTrigger>
          <TabsTrigger
            value="past"
             className={`flex-1 p-2 rounded-full ${activeTab === 'past' ? 'bg-white shadow-lg' : 'bg-transparent'}`}
            onPress={() => setActiveTab('past')}
          >
            <Text className={`font-PoppinsSemiBold ${activeTab === 'past' ? 'text-[#263D67]' : 'text-[#667085]'}`}>
              Past
            </Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
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
              <Text className="text-[#263D67] font-medium text-xl mb-4">June 20, 2025 - Morning</Text>
              <View className="border-t border-[#C7D7F4] pt-4 flex-row items-center">
                <Heart size={20} color="#263D67" fill="#263D67" />
                <Text className="text-[#263D67] font-medium text-lg ml-2">Medical Consultation</Text>
              </View>
            </View>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card className="bg-[#D7E2F8] rounded-xl  overflow-hidden mt-4">
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
              <Text className="text-[#263D67] font-medium text-xl mb-4">June 12, 2023 - Morning</Text>
              <View className="border-t border-[#C7D7F4] pt-4 flex-row items-center">
                <Heart size={20} color="#263D67" fill="#263D67" />
                <Text className="text-[#263D67] font-medium text-lg ml-2">Medical Consultation</Text>
              </View>
            </View>
          </Card>

        </TabsContent>
      </Tabs>
    </View>
  );
}