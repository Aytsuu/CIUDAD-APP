import { View,Image,Text, ScrollView } from 'react-native'
import {Button} from '@/components/ui/button'
import React from 'react'

const MaternalLanding = () => {
  return (
<ScrollView>

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

      <Button className='justify-center items-center flex mt-4 bg-transparent'>
        <Text className='color-black underline font-PoppinsMedium text-lg'>MY RECORDS</Text>
      </Button>
      </View>
      </ScrollView>

  );
};

export default MaternalLanding;

