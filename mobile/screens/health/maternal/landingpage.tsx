import { View, Image, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { Button } from '@/components/ui/button'
import React from 'react'
import { router } from 'expo-router';
import PageLayout from '@/screens/_PageLayout';
import { ChevronLeft } from 'lucide-react-native';

const MaternalLanding = () => {
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
      rightAction={<View className="w-10 h-10" />}
    >

      <View className='flex justify-center items-center'>
        <Image source={require('@/assets/images/Health/Home/Maternal.png')}
          className="w-30 justify-center items-center flex h-30 mt-20"
          resizeMode="contain"
        />
        <View className='items-start mr-18 '>
          <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Your</Text>
          <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Motherhood</Text>
          <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Partner</Text>
          <Text className='font-light text-md mt-2 mb-5'>Guiding you through every step.</Text>

        </View>
        <Button className='justify-center bg-blue-800 items-center flex mt-4' onPress={() => router.push('/maternal/bookingpage')}>
          <Text className='color-white font-PoppinsSemiBold text-lg'>BOOK PRENATAL APPOINTMENT</Text>
        </Button>


      </View>
    </PageLayout>

  );
};

export default MaternalLanding;

