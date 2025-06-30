import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Image, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function AnimalBites() {
  return (
    <ScrollView className="bg-white">
      <View style={{ position: 'relative' }}>
        <Image
          source={require('@/assets/images/Health/Home/animalbites.jpg')}
          resizeMode="cover"
          style={{ width: '100%', height: 250 }}
        />
        <View className="absolute inset-0 bg-black opacity-60" />

        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 bg-white/20 p-2 rounded-full z-10"
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>

        <View className="absolute bottom-0 left-0 right-0 p-6">
          <Text className="text-white text-2xl font-bold italic">
            Animal Bites: First Aid & Prevention
          </Text>
        </View>
      </View>

      {/* Information Section */}
      <View className="p-6">
        <Text className="text-gray-700 text-justify leading-6">
          Rabies is a deadly virus spread to people from the saliva of infected animals. The rabies virus is usually transmitted through a bite. Once a person begins showing signs and symptoms of rabies, the disease nearly always causes death.
        </Text>
      </View>

      {/* Rabies Information Card */}
      <View className="mx-6 mb-6">
        <View className="bg-blue-500 rounded-t-xl p-4 flex-row items-center">
          <FontAwesome name="exclamation-triangle" size={20} color="white" />
          <Text className="text-lg font-bold text-white ml-2">DID YOU KNOW?</Text>
        </View>
        <View className="bg-blue-50 p-4 rounded-b-xl shadow-sm">
          <View className="flex-row items-start mb-3">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2 mt-2" />
            <Text className="text-gray-700 flex-1">Rabies is preventable with vaccination.</Text>
          </View>
          <View className="flex-row items-start mb-3">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2 mt-2" />
            <Text className="text-gray-700 flex-1">The Philippines has 200–300 rabies deaths yearly.</Text>
          </View>
          <View className="flex-row items-start mb-4">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2 mt-2" />
            <Text className="text-gray-700 flex-1">99% of human rabies cases are caused by dog bites.</Text>
          </View>

          {/* Source */}
          <Text className="text-xs text-blue-700 italic">
            Source: https://www.who.int/news-room/fact-sheets/detail/rabies
          </Text>
        </View>
      </View>

      {/* First Aid for Animal Bites Section */}
      <View className="px-6 py-2">
        <View className="flex-row items-center mb-4">
          <View className="h-8 w-1 bg-red-500 mr-3" />
          <Text className="text-xl font-bold text-gray-800">FIRST AID FOR ANIMAL BITES</Text>
        </View>

        {/* Step 1 */}
        <View className="bg-red-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row">
            <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">1</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-red-600 mb-2">Apply Pressure</Text>
              <Text className="text-gray-700">Apply pressure to the wound using a clean cloth to stem any bleeding.</Text>
            </View>
          </View>
        </View>

        {/* Step 2 */}
        <View className="bg-red-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row">
            <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">2</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-red-600 mb-2">Clean the Wound</Text>
              <Text className="text-gray-700">Irrigate and clean the wound thoroughly with soap and water solution and rinse.</Text>
            </View>
          </View>
        </View>

        {/* Step 3 */}
        <View className="bg-red-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row">
            <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">3</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-red-600 mb-2">Cover the Wound</Text>
              <Text className="text-gray-700">Cover the wound with a clean, dry dressing and seek medical attention immediately for proper treatment.</Text>
            </View>
          </View>
        </View>

        {/* Step 4 */}
        <View className="bg-red-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row">
            <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">4</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-red-600 mb-2">Seek Medical Help</Text>
              <Text className="text-gray-700">Visit our health center immediately for animal bite referral.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Animal Scratches Section */}
      <View className="px-6 py-2">
        <View className="flex-row items-center mb-4">
          <View className="h-8 w-1 bg-orange-500 mr-3" />
          <Text className="text-xl font-bold text-gray-800">FOR ANIMAL SCRATCHES</Text>
        </View>

        {/* Step 1 */}
        <View className="bg-orange-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row">
            <View className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">1</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-orange-600 mb-2">Wash Immediately</Text>
              <Text className="text-gray-700">Wash the scratch thoroughly with soap and running water for at least 15 minutes.</Text>
            </View>
          </View>
        </View>

        {/* Step 2 */}
        <View className="bg-orange-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row">
            <View className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">2</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-orange-600 mb-2">Apply Antiseptic</Text>
              <Text className="text-gray-700">Apply an antiseptic solution like povidone-iodine to prevent infection.</Text>
            </View>
          </View>
        </View>

        {/* Step 3 */}
        <View className="bg-orange-50 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row">
            <View className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">3</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-orange-600 mb-2">Monitor for Infection</Text>
              <Text className="text-gray-700">Watch for signs of infection: redness, swelling, warmth, increasing pain, or pus.</Text>
            </View>
          </View>

        </View>
      </View>


      {/* Visit Health Center Section */}

      {/* Prevention Tips */}
      <View className="mx-6 my-6">
        <View className="flex-row items-center mb-4">
          <View className="h-8 w-1 bg-green-500 mr-3" />
          <Text className="text-xl font-bold text-gray-800">PREVENTION TIPS</Text>
        </View>


        <View className="bg-green-50 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-start mb-3">
            <FontAwesome name="check-circle" size={16} color="#10B981" className="mt-1" />
            <Text className="text-gray-700 ml-3 flex-1">Vaccinate your pets against rabies</Text>
          </View>
          <View className="flex-row items-start mb-3">
            <FontAwesome name="check-circle" size={16} color="#10B981" className="mt-1" />
            <Text className="text-gray-700 ml-3 flex-1">Avoid approaching unfamiliar animals</Text>
          </View>
          <View className="flex-row items-start mb-3">
            <FontAwesome name="check-circle" size={16} color="#10B981" className="mt-1" />
            <Text className="text-gray-700 ml-3 flex-1">Teach children to never touch strange animals</Text>
          </View>
          <View className="flex-row items-start">
            <FontAwesome name="check-circle" size={16} color="#10B981" className="mt-1" />
            <Text className="text-gray-700 ml-3 flex-1">Report stray animals to local authorities</Text>
          </View>
        </View>

        <View className="bg-blue-900 p-4 rounded-xl shadow-md mt-6">
          <Text className="text-white text-lg font-bold mb-2">If bitten or any incident, go to our barangay health center</Text>
          <Text className="text-white">Open Monday-Friday, 8:00 AM - 5:00 PM</Text>

        </View>

      </View>
    </ScrollView>
  );
}