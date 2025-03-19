import { Card } from '@/components/ui/card'
import { router } from 'expo-router'
import React from 'react'
import { ScrollView, View, Text, Image, StatusBar, TouchableOpacity } from 'react-native'

const FamilyPlanning = () => {
  return (
    <ScrollView>
    <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <View className="flex-row justify-between items-center px-4 py-3 bg-blue-900">
      <Card className="w-80 h-40 rounded-lg shadow-lg overflow-hidden relative">
        <Image source={require('@/assets/images/Health/Home/Famplanning.jpg')} className="w-full h-full absolute" resizeMode="cover" />
        <View className="absolute inset-0 bg-black/50" />
        <View className="absolute inset-0 p-4 justify-between">
          <View>
            <Text className="text-white text-3xl mt-2 font-PoppinsSemiBold">Family Planning</Text>
            <Text className="text-white text-sm font-PoppinsRegular italic mt-1">Your Family, Your Future Plan It Right.</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/family-planning/famplanning")} className="bg-green-600 rounded-full px-4 py-2 self-start">
            <Text className="text-white text-sm font-semibold">Learn more</Text>
          </TouchableOpacity>
        </View>
      </Card>
      </View>


    </ScrollView>
  )
}

export default FamilyPlanning
