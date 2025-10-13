import { View, Image, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { Button } from '@/components/ui/button'
import React from 'react'
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import PageLayout from '@/screens/_PageLayout';

const MedConsultationLanding = () => {
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>} >

      <View className='flex justify-center items-center' >
        <Image source={require('@/assets/images/Health/Home/Medical_Consultation.png')}
          className="w-30 justify-center items-center flex h-30"
          resizeMode="contain"
        />
        <View className='items-center mr-18 '>
          <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Your Health,</Text>
          <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Our Priority.</Text>
          <Text className='font-light text-md mt-2 mb-5'>Manage your health, connect with care.</Text>

        </View>
        <TouchableOpacity onPress={() => router.push("/medconsultation/setschedule")} className='justify-center p-3 rounded-2xl bg-blue-900 items-center flex mt-4'>
          <Text className='color-white font-PoppinsSemiBold text-lg'>BOOK APPOINTMENT</Text>
        </TouchableOpacity>

      </View>
    </PageLayout>

  );
};

export default MedConsultationLanding;

