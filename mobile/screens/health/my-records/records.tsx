import * as React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ChevronLeft, Bell, Calendar } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import SelectLayout from '@/components/ui/select-layout';
import { router } from 'expo-router';

export default function Records() {
  const services: Service[] = [
    {
      id: 1,
      name: 'Family Planning',
      description: 'View your family planning records and track status',
      route: '/(health)/family-planning/fp-dashboard',
      icon: Heart,
      image: require('@/assets/images/Health/Home/Famplanning.jpg'),
      color: '#059669'
    },
    {
      id: 2,
      name: 'Maternal Records',
      description: 'Access your maternal health records',
      route: '/maternal-records',
      icon: Baby,
      image: require('@/assets/images/Health/Home/Maternal1.jpg'),
      color: '#DC2626'
    },
    {
      id: 3,
      name: 'Animal Bites',
      description: 'View animal bite treatment records',
      route: '/animalbite/my-records/',
      icon: Dog,
      image: require('@/assets/images/Health/Home/animalbites.jpg'),
      color: '#1E40AF'
    },
  ];

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
