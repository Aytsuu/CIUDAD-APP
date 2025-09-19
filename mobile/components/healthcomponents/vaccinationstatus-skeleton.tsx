// components/skeleton/vaccinationstatus-skeleton.tsx
import React from 'react';
import { View } from 'react-native';
// import { useTailwind } from 'tailwind-rn';

export const VaccinationStatusCardsSkeleton: React.FC = () => {
  const tw = useTailwind();
  return (
    <View style={tw('flex flex-col lg:flex-row gap-6 mb-4')}>
      <View style={tw('w-full bg-white rounded-lg shadow-md p-4 animate-pulse')}>
        <View style={tw('h-6 w-3/4 bg-gray-200 rounded mb-4')} />
        <View style={tw('h-4 w-full bg-gray-200 rounded mb-2')} />
        <View style={tw('h-4 w-5/6 bg-gray-200 rounded mb-2')} />
        <View style={tw('h-4 w-3/4 bg-gray-200 rounded')} />
      </View>
      <View style={tw('w-full bg-white rounded-lg shadow-md p-4 animate-pulse')}>
        <View style={tw('h-6 w-3/4 bg-gray-200 rounded mb-4')} />
        <View style={tw('h-4 w-full bg-gray-200 rounded mb-2')} />
        <View style={tw('h-4 w-5/6 bg-gray-200 rounded mb-2')} />
        <View style={tw('h-4 w-3/4 bg-gray-200 rounded')} />
      </View>
    </View>
  );
};
