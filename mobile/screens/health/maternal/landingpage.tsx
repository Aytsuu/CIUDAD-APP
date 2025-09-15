import { View, Image, Text, ScrollView, TouchableWithoutFeedback } from 'react-native'
import { Button } from '@/components/ui/button/button'
import React from 'react'
import { router } from 'expo-router';

const MaternalLanding = () => {
  return (
    <ScrollView>

        <TouchableWithoutFeedback onPress={() => router.back()}>
          <Text className="text-black text-[15px]">Back</Text>
        </TouchableWithoutFeedback>

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
        <Button className='justify-center bg-[#263D67] items-center flex mt-4'>
          <Text className='color-white font-PoppinsSemiBold text-lg'>BOOK PRENATAL APPOINTMENT</Text>
        </Button>


      </View>
    </ScrollView>

  );
};

export default MaternalLanding;

