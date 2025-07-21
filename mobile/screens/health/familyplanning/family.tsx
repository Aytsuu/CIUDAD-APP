import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function FamilyPlanning() {
  return (
    <ScrollView className="bg-white">
      <View >
        <Image
          source={require('@/assets/images/Health/Home/family.jpg')}
          resizeMode="cover"
          style={{ width: '100%', height: 250, justifyContent: 'flex-end' }}
        />
        <View className="absolute inset-0 bg-black opacity-50" />

        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 bg-white/20 p-2 rounded-full z-10"
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>

        <View className="absolute bottom-0 left-0 right-0 p-6">
          <Text className="text-white text-2xl font-bold italic">
            Your Family, Your Future
          </Text>
          <Text className="text-white text-l italic">
            Plan It Right
          </Text>
        </View>
      </View>

      {/* Information Section */}
      <View className="p-6">
        <Text className="text-gray-700 text-base text-justify">
          Family planning allows individuals and couples to decide freely and responsibly the number and spacing of their children. By practicing family planning, families can lead healthier and more prosperous lives, benefiting both parents and children.
        </Text>
      </View>

      {/* Benefits Section */}
      <View className="px-6 py-2">
        <View className="flex-row items-center mb-4">
          <View className="h-8 w-1 bg-green-500 mr-3" />
          <Text className="text-xl font-bold text-gray-800">BENEFITS</Text>
        </View>

        {/* For the Mother */}
        <View className="bg-pink-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <FontAwesome name="female" size={20} color="#F472B6" />
            <Text className="font-bold text-lg ml-3 text-pink-600">For the Mother</Text>
          </View>
          <View className="ml-7">
            <Text className="text-gray-700 mb-1">• Ensures safer pregnancies with proper birth spacing</Text>
            <Text className="text-gray-700 mb-1">• Improves health and recovery after childbirth</Text>
            <Text className="text-gray-700">• Provides time for personal growth and career</Text>
          </View>
        </View>

        {/* For the Father */}
        <View className="bg-blue-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <FontAwesome name="male" size={20} color="#3B82F6" />
            <Text className="font-bold text-lg ml-3 text-blue-600">For the Father</Text>
          </View>
          <View className="ml-7">
            <Text className="text-gray-700 mb-1">• Enhances financial stability and family planning</Text>
            <Text className="text-gray-700 mb-1">• Reduces stress with better family management</Text>
            <Text className="text-gray-700">• Encourages active decision-making in the family</Text>
          </View>
        </View>

        {/* For the Children */}
        <View className="bg-purple-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <FontAwesome name="child" size={20} color="#8B5CF6" />
            <Text className="font-bold text-lg ml-3 text-purple-600">For the Children</Text>
          </View>
          <View className="ml-7">
            <Text className="text-gray-700 mb-1">• Boosts health with proper care and nutrition</Text>
            <Text className="text-gray-700 mb-1">• Enables better education and opportunities</Text>
            <Text className="text-gray-700">• Fosters a harmonious family environment</Text>
          </View>
        </View>
      </View>

      {/* Free Supplies Section */}
      <View className="mx-6 mb-6">
        <View className="bg-blue-500 rounded-t-xl p-4">
          <Text className="text-lg font-bold text-white">Available free supplies</Text>
        </View>
        <View className="bg-blue-50 p-4 rounded-b-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
            <Text className="text-gray-700">Condoms</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
            <Text className="text-gray-700">Contraceptive pills</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
            <Text className="text-gray-700">Lubricants</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
            <Text className="text-gray-700">Implants</Text>
          </View>
        </View>
      </View>

      {/* Visit Us Section */}
      <View className="mx-6 mb-8">
        <View className="bg-green-500 rounded-t-xl p-4 flex-row items-center">
          <Text className="text-lg font-bold text-white ">VISIT US TODAY!</Text>
        </View>

        <View className="bg-green-50 p-4 rounded-b-xl shadow-sm">
          <Text className="text-gray-700 text-center">
            Services and consultations are available <Text className="font-bold">every day</Text> at the barangay hall — visit us for guidance and support!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}