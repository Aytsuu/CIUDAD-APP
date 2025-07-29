// MultipleFiles/SchedulerMainScreen.tsx
import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import SchedulerMain from './schedule-main';

export default function SchedulerMainScreen() {
  const handleGoBack = () => {
    router.back(); // Go back to the previous screen (Homepage)
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SchedulerMain onGoBack={handleGoBack} />
    </View>
  );
}
