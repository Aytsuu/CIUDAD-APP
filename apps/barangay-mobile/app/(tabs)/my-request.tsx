
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import CertLogo from '@/assets/svg/CertLogo';
import MedicalLogo from '@/assets/svg/MedicalLogo';
import { useRouter } from 'expo-router';

export default function MyRequest() {
  const [selectedTab, setSelectedTab] = useState('Confirmed');

  const pendingRequests = [
    { id: 1, type: 'Certificate', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 2, type: 'Medical', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 3, type: 'Certificate', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 4, type: 'Medical', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 5, type: 'Certificate', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 6, type: 'Medical', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 7, type: 'Certificate', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 8, type: 'Medical', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 9, type: 'Certificate', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
  ];

  const confirmedRequests = [
    { id: 1, type: 'Certificate', date: '08 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 2, type: 'Medical', date: '08 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 3, type: 'Certificate', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 4, type: 'Medical', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 5, type: 'Certificate', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 6, type: 'Medical', date: '09 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },

  ];

  const receivedRequests = [
    { id: 1, type: 'Certificate', date: '07 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 2, type: 'Medical', date: '07 June 2024', content:'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 3, type: 'Medical', date: '07 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 4, type: 'Certificate', date: '07 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 5, type: 'Medical', date: '07 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 6, type: 'Certificate', date: '07 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
    { id: 7, type: 'Medical', date: '07 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#37474F', icon: <MedicalLogo/> },
    { id: 8, type: 'Certificate', date: '07 June 2024', content: 'Testing Testing Testing Testing Testing', iconColor: '#4A90E2', icon: <CertLogo/> },
  ];

  const getRequests = () => {
    switch(selectedTab) {
      case 'Pending':
        return pendingRequests;
      case 'Confirmed':
        return confirmedRequests;
      case 'Received':
        return receivedRequests;
      default:
        return confirmedRequests;
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-white px-4 pt-4 pb-4 shadow-sm">
        {/* header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[25px] font-semibold text-black-800 mt-9">My Requests</Text>
          <View className="flex-row items-center mt-9">
            <TouchableOpacity className="mr-3">
              <Entypo name="dots-three-horizontal" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons name="bell" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* tops tabs */}
        <View className="flex-row justify-around items-center rounded-md py-2">
          {/* pending */}
          <TouchableOpacity
            onPress={() => setSelectedTab('Pending')}
            className="flex-1 items-center"
          >
            <View className="flex-row items-center space-x-2">
              <Feather name="clock" size={20} color={selectedTab === 'Pending' ? '#4A90E2' : '#A1A1A1'} className="mr-2"
/>
              <Text className={`text-sm font-medium ${selectedTab === 'Pending' ? 'text-blue-500' : 'text-gray-400'}`}>Pending</Text>
            </View>
          </TouchableOpacity>

          {/* confirmed */}
          <TouchableOpacity
            onPress={() => setSelectedTab('Confirmed')}
            className="flex-1 items-center"
          >
            <View className="flex-row items-center space-x-2">
              <Feather
                name="check"
                size={20}
                color={selectedTab === 'Confirmed' ? '#4A90E2' : '#A1A1A1'}
                className="mr-2"
              />
              <Text className={`text-sm font-medium ${selectedTab === 'Confirmed' ? 'text-blue-500' : 'text-gray-400'}`}>Confirmed</Text>
            </View>
          </TouchableOpacity>

          {/* received */}
          <TouchableOpacity onPress={() => setSelectedTab('Received')} className="flex-1 items-center">
            <View className="flex-row items-center space-x-2">
              <Feather name="download" size={20} color={selectedTab === 'Received' ? '#4A90E2' : '#A1A1A1'} className="mr-2"/>
              <Text className={`text-sm font-medium ${selectedTab === 'Received' ? 'text-blue-500' : 'text-gray-400' }`}>Received</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* contents */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 16 }} style={{ backgroundColor: '#ECF8FF' }} showsVerticalScrollIndicator={false} >
        {getRequests().map((request) => (
          <View key={request.id} className="flex-row bg-white rounded-lg shadow-md mx-4 mt-4 overflow-hidden" style={{ borderColor: '#D1D5DB', height: 100 }}>
            <View style={{ backgroundColor: request.iconColor, width: 90, alignSelf: 'stretch' }} className="justify-center items-center">{request.icon}</View>

            <View className="flex-1 p-4">
              <Text className="text-lg font-semibold text-black-800">{request.type}</Text>
              <Text className="text-sm text-gray-600 mt-1">{request.content}</Text>
              <Text className="text-sm text-gray-500">{request.date}</Text>
            </View>

            <TouchableOpacity className="justify-center pr-4 mt-20">
              <Text className="text-sm font-bold text-blue-900 flex-row items-center">View ➔</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}