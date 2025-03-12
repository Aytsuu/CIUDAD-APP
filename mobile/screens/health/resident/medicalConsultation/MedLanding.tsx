import { View,Image,Text, ScrollView } from 'react-native'
import {Button} from '@/components/ui/button'
import React from 'react'

const MedConsultationLanding = () => {
  return (
<ScrollView>

        <View className='flex justify-center items-center'>
      
      <Image source={require('@/assets/images/Health/Home/Medical_Consultation.png')}
      className="w-30 justify-center items-center flex h-30 mt-20"
          resizeMode="contain"
      />
      <View className='items-center mr-18 '>
        <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Your Health,</Text>
        <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Our Priority.</Text>
        <Text className='font-light text-md mt-2 mb-5'>Manage your health, connect with care.</Text>

      </View>
      <Button className='justify-center bg-[#263D67] items-center flex mt-4'>
        <Text className='color-white font-PoppinsSemiBold text-lg'>BOOK APPOINTMENT</Text>
      </Button>

      
      </View>
      </ScrollView>

  );
};

export default MedConsultationLanding;

