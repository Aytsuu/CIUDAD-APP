import * as React from 'react';
import { View, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Image } from 'react-native';
import { ChevronLeft, Calendar, FileText, ChevronRight, Heart, Baby, Dog, Activity, BriefcaseMedical, Cross, Syringe } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import PageLayout from '@/screens/_PageLayout';

interface Service {
  id: number;
  name: string;
  description: string;
  route: string;
  icon: any;
  image?: any;
  color: string;
}

export default function Records() {
  const { pat_id } = useLocalSearchParams<{ pat_id?: string }>(); // NEW: Get pat_id from params (optional for user view)
  console.log("[DEBUG] Records.tsx pat_id:", pat_id);
  
  const services: Service[] = [
   {
         id: 1,
      name: 'Animal Bites',
      description: 'View animal bite referral records',
      route: '/animalbite/my-records',
      icon: Dog,
      image: require('@/assets/images/Health/Home/animalbites.jpg'),
      color: '#059669'
    },
    {
      id: 2,
      name: 'Child Health',
      description: 'View child health records',
      route: '/child-health/my-records',
      icon: Baby,
      image: require('@/assets/images/Health/Home/child-health.jpg'),
      color: '#059669'
    },
    {
      id: 3,
      name: 'Family Planning',
      description: 'View family planning records',
      route: '/(health)/family-planning/fp-dashboard',
      icon: Heart,
      image: require('@/assets/images/Health/Home/Famplanning.jpg'),
      color: '#059669'
    },
    {
      id: 4,
      name: 'First Aid',
      description: 'View first aid treatment records',
      route: '/first-aid/my-records',
      icon: Cross,
      image: require('@/assets/images/Health/Home/first-aid.jpg'),
      color: '#059669'
    },
    {
      id: 5,
      name: 'Maternal',
      description: 'Access your maternal health records',
      route: '/maternal/my-records',
      icon: Baby,
      image: require('@/assets/images/Health/Home/Maternal1.jpg'),
      color: '#059669'
    },
    {
      id: 6,
      name: 'Medical Consultation',
      description: 'View medical consultation records',
      route: '/medical-consultation/my-records',
      icon: Activity,
      image: require('@/assets/images/Health/Home/medicalconsultation.jpg'),
      color: '#059669'
    },
    {
      id: 7,
      name: 'Medicine Records',
      description: 'View medicine records',
      route: '/medicine-records/my-records',
      icon: BriefcaseMedical,
      image: require('@/assets/images/Health/Home/child-health.jpg'),
      color: '#059669'
    },
    {
      id: 8,
      name: 'Vaccination',
      description: 'View vaccination records',
      route: '/vaccination/my-records',
      icon: Syringe,
      image: require('@/assets/images/Health/Home/vaccination.jpg'),
      color: '#059669'
    },
  ];
  
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]"></Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <View className="px-6 mt-1">
          <Text className="text-gray-900 font-semibold text-2xl">{pat_id ? 'Health Records' : 'My Health Records'}</Text>
          <Text className="text-gray-500 text-sm">
            Access medical records across different services
          </Text>
        </View>

        {/* Services Grid */}
        <View className="px-6 pt-6">
          <View className="gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
               <TouchableOpacity
                key={service.id}
                onPress={() => {
                        console.log("[DEBUG] Navigating to:", service.route, "with pat_id:", pat_id);
                        router.push({ pathname: service.route as any, params: { pat_id } })} // NEW: Pass pat_id
                 }
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                  <View className="flex-row">
                    {service.image && (
                      <Image
                        source={service.image}
                        className="w-24 h-24"
                        resizeMode="cover"
                      />
                    )}
                    
                    <View className="flex-1 p-4">
                      <View className="flex-row items-center mb-2">
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3" 
                              style={{ backgroundColor: service.color + '20' }}>
                          <Icon size={16} color={service.color} />
                        </View>
                        <Text className="text-lg font-semibold text-gray-900 flex-1">
                          {service.name}
                        </Text>
                        <ChevronRight size={16} color="#9CA3AF" />
                      </View>
                      
                      <Text className="text-sm text-gray-500 mb-2">
                        {service.description}
                      </Text>
                      
                      {/* <View className="flex-row items-center">
                        <View className={`px-2 py-1 rounded-full`}
                              style={{ backgroundColor: service.color + '20' }}>
                          <Text className="text-xs font-medium" style={{ color: service.color }}>
                            View Records
                          </Text>
                        </View>
                      </View> */}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Additional Info */}
        <View className="px-6 pt-6">

            <Text className="text-blue-800 text-sm italic">{pat_id ? "" : 'Your medical records are securely stored and only accessible to you and authorized healthcare providers.'}</Text>
            
        </View>
      </ScrollView>
    </PageLayout>
  );
}