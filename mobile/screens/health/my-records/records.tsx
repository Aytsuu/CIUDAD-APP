import * as React from 'react';
import { View, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import { ChevronLeft, Calendar, FileText, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { SelectLayout, DropdownOption } from '@/components/ui/select-layout';
import { router } from 'expo-router';

interface Service {
  label: string;
  value: string;
}

interface Record {
  id: number;
  date: string;
  time: string;
  status?: string;
}

export default function Records() {
  const services: Service[] = [
    { label: 'Maternal', value: 'Maternal' },
    { label: 'Animal Bites', value: 'Animal Bites' },
    { label: 'Family Planning', value: 'Family Planning' },
  ];

  const [selectedServiceValue, setSelectedServiceValue] = React.useState<string>(services[0].value);
  const [records, setRecords] = React.useState<Record[]>([]);

  const mockDatabase: { [key: string]: Record[] } = {
    Maternal: [
      { id: 1, date: 'January 4, 2025', time: 'Morning', status: 'Completed' },
      { id: 2, date: 'February 10, 2025', time: 'Afternoon', status: 'Completed' },
      { id: 3, date: 'November 3, 2025', time: 'Morning', status: 'Scheduled' },
    ],
    'Animal Bites': [
      { id: 4, date: 'January 15, 2025', time: 'Afternoon', status: 'Completed' },
    ],
    'Family Planning': [
      { id: 5, date: 'February 1, 2025', time: 'Morning', status: 'Completed' },
      { id: 6, date: 'March 8, 2025', time: 'Afternoon', status: 'Scheduled' },
    ],
  };

  React.useEffect(() => {
    console.log('Selected Service Value:', selectedServiceValue);
    const fetchedRecords = mockDatabase[selectedServiceValue] || [];
    console.log('Fetched Records:', fetchedRecords);
    setRecords(fetchedRecords);
  }, [selectedServiceValue]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500 text-green-800';
      case 'Scheduled':
        return 'bg-blue-500 text-blue-800';
      default:
        return 'bg-gray-500 text-gray-800';
    }
  };

  const handleServiceChange = (option: DropdownOption) => {
    console.log('Service changed to:', option);
    setSelectedServiceValue(option.value);
  };

  // Find the selected service object for display purposes
  const selectedService = services.find((service) => service.value === selectedServiceValue) || services[0];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="px-6 pt-6 pb-4 border-b border-gray-100 mt-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              console.log('Navigating back');
              router.back();
            }}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={20} color="#1e40af" />
          </TouchableOpacity>

          <Text className="text-xl font-semibold text-blue-800">My Health Records</Text>

          <View className="w-8" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Service Selector */}
        <View className="px-6 pt-6">
          <Text className="text-sm font-medium text-gray-500 mb-2">View records for</Text>
          <SelectLayout
            className="w-full"
            options={services}
            selectedValue={selectedServiceValue}
            onSelect={handleServiceChange}
            placeholder="Select a service"
            disabled={false}
          />
        </View>

        {/* Records Summary */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              {records.length} {records.length === 1 ? 'Record' : 'Records'}
            </Text>
          </View>

          {records.length > 0 ? (
            <View className="gap-4">
              {records.map((record) => (
                <TouchableOpacity
                  key={record.id}
                  onPress={() => {
                    console.log('Navigating to record details:', record);
                    router.push({
                      pathname: '/record-details',
                      params: {
                        recordId: record.id.toString(),
                        serviceType: selectedServiceValue,
                        date: record.date,
                        time: record.time,
                        status: record.status || 'Completed',
                      },
                    });
                  }}
                >
                  <Card className="p-4 border bg-white border-gray-300">
                    <View className="flex-row items-start">
                      <View className="bg-blue-50 p-3 rounded-lg mr-4">
                        <Calendar size={20} color="#1e40af" />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-base font-medium text-gray-900">
                            {selectedService.label}
                          </Text>
                          {record.status && (
                            <View className={`px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                              <Text className="text-xs font-medium">{record.status}</Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-sm text-gray-600 mt-1">
                          {record.date} • {record.time}
                        </Text>

                        <View className="flex-row items-center justify-between mt-3">
                          <Text className="text-xs text-blue-600 font-medium">View details</Text>
                          <ChevronRight size={16} color="#1e40af" />
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <View className="bg-blue-50 p-6 rounded-full mb-4">
                <FileText size={32} color="#1e40af" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">No Records Found</Text>
              <Text className="text-sm text-gray-500 text-center mb-6">
                You don’t have any records for {selectedService.label} yet.
              </Text>

              <TouchableOpacity
                className="bg-blue-600 rounded-lg px-6 py-3"
                onPress={() => {
                  console.log('Navigating to schedule appointment');
                  router.push('/schedule-appointment');
                }}
              >
                <Text className="text-white font-medium">Schedule Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}