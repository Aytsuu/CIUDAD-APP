import * as React from 'react';
import { 
  View, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { ChevronLeft, Bell, Calendar, FileText, Search } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import SelectLayout from '@/components/ui/select/select-layout';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Records() {
  const services = [
    { label: 'Medical Consultation', value: 'Medical Consultation', icon: 'medical' },
    { label: 'Animal Bites', value: 'Animal Bites', icon: 'animal' },
    { label: 'Family Planning', value: 'Family Planning', icon: 'planning' },
  ];

  // State for selected service
  const [selectedService, setSelectedService] = React.useState(services[0]);
  const [records, setRecords] = React.useState<{ id: number; date: string; time: string; status?: string; }[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const mockDatabase: { [key: string]: { id: number; date: string; time: string; status?: string; }[] } = {
    "Medical Consultation": [
      { id: 1, date: "January 4, 2025", time: "Morning"},
      { id: 2, date: "February 10, 2025", time: "Afternoon" },
      { id: 3, date: "March 3, 2025", time: "Morning"}
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
    
    // Animate records appearance
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedService]);

  // const getStatusColor = (status?: string) => {
  //   switch (status) {
  //     case 'Completed':
  //       return '#10B981'; // Green
  //     case 'Scheduled':
  //       return '#F59E0B'; // Orange
  //     default:
  //       return '#6B7280'; // Gray
  //   }
  // };

  const getServiceIcon = (serviceValue: string) => {
    switch (serviceValue) {
      case 'Medical Consultation':
        return '🩺';
      case 'Animal Bites':
        return '🐕';
      case 'Family Planning':
        return '👨‍👩‍👧‍👦';
      default:
        return '📋';
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ECF8FF" />
      <View className="flex-1 bg-[#ECF8FF]">
        
        {/* Header with gradient-like effect */}
        
          <View className="flex-row justify-between items-center px-4 pt-12 pb-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="flex-row items-center py-2"
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="#263D67" />
              <Text className="text-[#263D67] text-[15px] font-PoppinsMedium ml-1">Back</Text>
            </TouchableOpacity>
            
         
        </View>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Title Section with improved spacing */}
          <View className="px-4 pt-6 pb-2">
            <Text className="text-3xl font-PoppinsBold text-[#263D67] mb-2">My Records</Text>
            <Text className="text-base font-PoppinsRegular text-[#263D67]/70">
              Track your health appointments and history
            </Text>
          </View>

          {/* Services Section with better styling */}
          <View className="px-4 mt-6">
            {/* <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-PoppinsSemiBold text-[#263D67]">Service</Text>
           
            </View> */}
            
            <View className="bg-white/60 rounded-2xl p-1 shadow-sm">
              <SelectLayout
                className="min-w-[100%] font-PoppinsRegular"
                contentClassName="w-full"
                options={services}
                selected={selectedService}
                onValueChange={(value) => setSelectedService(value!)}
              />
            </View>
            
            {/* Service Summary */}
         
          </View>

          {/* Records Section with animations */}
          <View className="px-4 mt-6">
            <Text className="text-lg font-PoppinsSemiBold text-[#263D67] mb-4">
                    {records.length} {records.length === 1 ? 'record' : 'records'} found
               
            </Text>
            
            <Animated.View style={{ opacity: fadeAnim }}>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <TouchableOpacity 
                    key={record.id}
                    activeOpacity={0.8}
                    className="mb-3"
                    onPress={() => router.push({
                      pathname: '/record-details',
                      params: {
                        recordId: record.id,
                        serviceType: selectedService.value,
                        date: record.date,
                        time: record.time,
                        status: record.status || 'Completed'
                      }
                    })}
                  >
                    <Card className="border-0 bg-white/70 rounded-2xl shadow-sm overflow-hidden">
                    
                      
                      <View className="p-5">
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center flex-1">
                            <View className="bg-[#ECF8FF] rounded-full p-3 mr-4">
                              <Calendar size={20} color="#263D67" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-lg font-PoppinsSemiBold text-[#263D67] mb-1">
                                {record.date}
                              </Text>
                              <Text className="text-sm font-PoppinsRegular text-[#263D67]/70">
                                {record.time} Appointment
                              </Text>
                            </View>
                          </View>
                          
                          <View className="items-end">
                            {/* Tap to view indicator */}
                            <View className="flex-row items-center">
                              <Text className="text-xs font-PoppinsRegular text-[#263D67]/50 mr-1">
                                Tap to view
                              </Text>
                              <ChevronLeft 
                                size={14} 
                                color="#263D67" 
                                style={{ transform: [{ rotate: '180deg' }] }}
                                opacity={0.5}
                              />
                            </View>
                          </View>
                        </View>
                        
                        {/* Scheduled appointment info */}
                        {record.status === 'Scheduled' && (
                          <View className="mt-3 pt-3 border-t border-[#263D67]/10">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-xs font-PoppinsRegular text-[#263D67]/70">
                                Upcoming Appointment
                              </Text>
                              <View className="flex-row items-center">
                                <View className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                                <Text className="text-xs font-PoppinsMedium text-orange-600">
                                  View Details
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="items-center justify-center py-12">
                  <View className="bg-white/60 rounded-full p-6 mb-4">
                    <FileText size={48} color="#263D67" opacity={0.5} />
                  </View>
                  <Text className="text-xl font-PoppinsSemiBold text-[#263D67] mb-2">
                    No Records Found
                  </Text>
                  <Text className="text-base font-PoppinsRegular text-[#263D67]/70 text-center max-w-[280px]">
                    You don't have any records for {selectedService.label} yet.
                  </Text>
                  
                  <TouchableOpacity className="bg-[#263D67] rounded-full px-6 py-3 mt-6">
                    <Text className="text-white font-PoppinsMedium">
                      Schedule Appointment
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
