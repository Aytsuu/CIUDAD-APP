import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import "../../global.css";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';

export default function Announcements() {
  const announcements = [
    { id: 1, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing'},
    { id: 2, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing' },
    { id: 3, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing' },
    { id: 4, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing' },
    { id: 5, title: 'DSWD Ayuda', subtitle: 'Barangay Council', time: '6 hours ago', contents: 'testing testing testing testing' },
  ];

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-4"> 
      {/* Announcement Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[25px] font-semibold text-black-800 mt-9">Announcements</Text>
          <View className="flex-row items-center mt-9">
        <TouchableOpacity className="mr-3">
          <Entypo name="dots-three-horizontal" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="bell" size={24} color="black" />
        </TouchableOpacity>
      </View>
      </View>
        
      <View className="flex-row justify-end items-center mb-4">
        <TouchableOpacity>
        <Text className="text-gray-700 text-base mr-2">All <AntDesign name="down" size={16} color="gray" /></Text>
        </TouchableOpacity>
      </View>

      {/* Announcement Contents */}
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} className='mb-4'>
        {announcements.map((announcement) => (
          <View
            key={announcement.id}
            className="bg-white rounded-lg shadow-md p-4 mb-4"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-800">
                {announcement.title}
              </Text>
              <View className="w-2 h-2 bg-red-500 rounded-full" />
            </View>
            <Text className="text-sm text-gray-600">{announcement.subtitle} - {announcement.time} </Text>
            <Text className="text-sm text-gray-700 mt-2 mb-4">
              {announcement.contents}
            </Text>
            <TouchableOpacity>
              <View className='flex-row justify-end'>
              <Text  style={{ color: '#071440' }} className="text-sm font-bold">View ➔</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
