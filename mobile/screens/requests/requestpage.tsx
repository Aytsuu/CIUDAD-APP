import React from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, Settings } from 'react-native';

import { Badge, Home, MessageCircle, Search, User } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AdminRequestsPage = () => {
  // Request status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const statusText = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    return (
      <Badge className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
        {statusText[status]}
      </Badge>
    );
  };

  // Request data
  const requests = [
    {
      id: 1,
      title: 'Medicine Request',
      status: 'pending',
      resident: 'Sarah Johnson (Unit 305)',
      details: 'Paracetamol, Antihistamine',
      time: 'Today, 10:30 AM'
    },
    {
      id: 2,
      title: 'Maintenance Issue',
      status: 'in-progress',
      resident: 'Michael Chen (Unit 112)',
      details: 'Leaking kitchen faucet',
      time: 'Yesterday, 4:15 PM',
      assigned: 'Maintenance Team'
    },
    {
      id: 3,
      title: 'Grocery Delivery',
      status: 'completed',
      resident: 'Emma Rodriguez (Unit 208)',
      details: 'Milk, Eggs, Bread, Vegetables',
      time: 'Yesterday, 11:45 AM',
      completed: 'Completed today, 9:00 AM'
    },
    {
      id: 4,
      title: 'Assistance Needed',
      status: 'pending',
      resident: 'Robert Wilson (Unit 401)',
      details: 'Help with moving furniture',
      time: '2 days ago, 3:20 PM'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-bold text-gray-800">CommunityCare Admin</Text>
            <Text className="text-sm text-gray-500">Resident Requests</Text>
          </View>
          <View className="h-10 w-10 rounded-full bg-blue-100 items-center justify-center">
            <Text className="text-blue-600 font-semibold">AD</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Filters and Search */}
        <Card className="mb-6 p-3 bg-white">
          <View className="relative mb-3">
            <Input
              placeholder="Search requests..."
              className="pl-10"
            //   leftIcon={<Search size={16} color="#9CA3AF" />}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
            <View className="flex-row space-x-2">
              <Button variant="default" size="sm">All</Button>
              <Button variant="outline" size="sm">Medicine</Button>
              <Button variant="outline" size="sm">Food</Button>
              <Button variant="outline" size="sm">Assistance</Button>
              <Button variant="outline" size="sm">Maintenance</Button>
            </View>
          </ScrollView>
        </Card>

        {/* Stats Summary */}
        <View className="grid grid-cols-2  gap-3 mb-6">
          <Card className="p-3 bg-white">
            <Text className="text-sm text-gray-500">Total Requests</Text>
            <Text className="text-xl font-bold text-blue-600">48</Text>
          </Card>
          <Card className="p-3 bg-white">
            <Text className="text-sm text-gray-500">Pending</Text>
            <Text className="text-xl font-bold text-yellow-600">12</Text>
          </Card>
          <Card className="p-3 bg-white">
            <Text className="text-sm text-gray-500">In Progress</Text>
            <Text className="text-xl font-bold text-blue-400">5</Text>
          </Card>
          <Card className="p-3 bg-white">
            <Text className="text-sm text-gray-500">Completed</Text>
            <Text className="text-xl font-bold text-green-600">31</Text>
          </Card>
        </View>

        {/* Requests List */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Recent Requests</Text>
        <View className="space-y-3">
          {requests.map((request) => (
            <Pressable 
              key={request.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-start">
                <View>
                  <View className="flex-row items-center">
                    <Text className="font-semibold mr-2">{request.title}</Text>
                    <StatusBadge status={request.status} />
                  </View>
                  <Text className="text-sm text-gray-600 mt-1">From: <Text className="font-medium">{request.resident}</Text></Text>
                  <Text className="text-sm text-gray-600">Requested: <Text className="font-medium">{request.details}</Text></Text>
                </View>
                <Text className="text-xs text-gray-500">{request.time}</Text>
              </View>
              
              {request.assigned && (
                <View className="mt-3 flex-row justify-between items-center">
                  <Text className="text-xs text-gray-500">Assigned to: {request.assigned}</Text>
                  <Button variant="outline" size="sm">View Details</Button>
                </View>
              )}
              
              {request.completed && (
                <View className="mt-3 flex-row justify-between items-center">
                  <Text className="text-xs text-green-600">{request.completed}</Text>
                  <Button variant="outline" size="sm">View Details</Button>
                </View>
              )}
              
              {!request.assigned && !request.completed && (
                <View className="mt-3 flex-row justify-end space-x-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="outline" size="sm">Assign</Button>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      
    </SafeAreaView>
  );
};

export default AdminRequestsPage;