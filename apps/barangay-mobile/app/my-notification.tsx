import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import "../global.css"; 
import { useRouter } from 'expo-router';

export default function Notification() {

  const router = useRouter();
  
    const Goback = () => {
      router.push('/my-announcement');
    }; 

  const notifications = [
    {
      id: 1,
      title: 'Testing',
      subtitle: 'Barangay Council',
      time: '3 hours ago',
      description:
        'TestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTesting',
    },
    {
      id: 2,
      title: 'Testing',
      subtitle: 'Barangay Council',
      time: '3 hours ago',
      description:
        'TestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTesting',
    },
    {
      id: 3,
      title: 'Testing',
      subtitle: 'Barangay Council',
      time: '3 hours ago',
      description:
        'TestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTesting',
    },
    {
      id: 4,
      title: 'Testing',
      subtitle: 'Barangay Council',
      time: '3 hours ago',
      description:
        'TestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTesting',
    },
    {
      id: 5,
      title: 'Testing',
      subtitle: 'Barangay Council',
      time: '3 hours ago',
      description:
        'TestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTesting',
    },
    {
      id: 6,
      title: 'Testing',
      subtitle: 'Barangay Council',
      time: '3 hours ago',
      description:
        'TestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTestingTesting',
    },
  ];

  return (
    <View className="flex-1 bg-gray-900 px-4 pt-4">
      
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-[30px] font-semibold text-white mx-auto text-center mt-11">Notification</Text>
        <TouchableOpacity onPress={Goback}>
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="h-[1px] bg-gray-700 mb-4" />

      {/* Contents */}
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        {notifications.map((notification) => (
          <View
            key={notification.id}
            className="bg-white rounded-lg shadow-md p-4 mb-4"
          >
            <Text className="text-lg font-bold text-gray-900">
              {notification.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              {notification.subtitle} - {notification.time}
            </Text>
            {notification.description && (
            <Text className="text-sm text-gray-700">
              {notification.description}
            </Text>
          )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
