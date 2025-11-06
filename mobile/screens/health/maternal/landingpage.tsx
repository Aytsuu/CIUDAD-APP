import { View, Image, Text, TouchableOpacity, Alert } from 'react-native'
import { Button } from '@/components/ui/button'
import React from 'react'
import { router } from 'expo-router';
import PageLayout from '@/screens/_PageLayout';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

// Helper function to calculate age from DOB
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date('2025-09-28'); // Current date
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const MaternalLanding = () => {
  const { user } = useAuth(); // Get user from AuthContext

  // Handle button press with gender and age checks
  const handleBookingPress = () => {
    if (!user) {
      Alert.alert('Please Log In', 'You must be logged in to access maternal services.', [
        // { text: 'OK', onPress: () => router.replace('/login') },
      ]);
      return;
    }
    if (user.personal?.per_sex !== 'FEMALE') {
      Alert.alert(
        'Access Restricted',
        'Maternal services are only available for female users.',
        [
          { text: 'OK', onPress: () => router.replace('/home') },
        ]
      );
      return;
    }
    if (user.personal?.per_dob && calculateAge(user.personal.per_dob) <= 13) {
      Alert.alert(
        'Access Restricted',
        'Maternal services are only available for users above 13 years old.',
        [
          { text: 'OK', onPress: () => router.replace('/home') },
        ]
      );
      return;
    }
    router.push('/maternal/bookingpage'); // Proceed if female and age > 13
  };

  // Check eligibility (female and age > 13)
  const isEligible = user && user.personal?.per_sex === 'FEMALE' && user.personal?.per_dob && calculateAge(user.personal.per_dob) > 13;

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
        <Image
          source={require('@/assets/images/Health/Home/Maternal2.png')}
          className="w-30 justify-center items-center flex h-30 mt-10"
          resizeMode="contain"
        />
        <View className='items-start mr-18'>
          <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Your</Text>
          <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Motherhood</Text>
          <Text className='font-PoppinsSemiBold text-5xl p-1 mt-2'>Partner</Text>
          <Text className='font-light text-md mt-2 mb-5'>Guiding you through every step.</Text>
        </View>

        {/* Conditionally render button or restricted message */}
        {isEligible ? (
          <Button
            className='justify-center bg-blue-900 items-center flex mt-4'
            onPress={handleBookingPress}
          >
            <Text className='color-white font-PoppinsSemiBold  text-lg'>BOOK PRENATAL APPOINTMENT</Text>
          </Button>
        ) : (
          <View className='mt-4'>
            <Text className='text-lg max-w-xs text-red-600 text-center'>
              Maternal services are only available for female users above 13 years old.
            </Text>
          </View>
        )}
      </View>
    </PageLayout>
  );
};

export default MaternalLanding;