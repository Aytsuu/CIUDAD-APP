// components/ui/layout/main-layout-component.tsx
import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useTailwind } from 'tailwind-rn'; // Assuming you are using NativeWind or tailwind-rn

interface MainLayoutComponentProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const MainLayoutComponent: React.FC<MainLayoutComponentProps> = ({
  title,
  description,
  children,
}) => {
  const tw = useTailwind();

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-100')}>
      <ScrollView style={tw('flex-1 p-4')}>
        <View style={tw('mb-6')}>
          <Text style={tw('text-2xl font-bold text-darkBlue2 mb-1')}>{title}</Text>
          <Text style={tw('text-sm text-gray-600')}>{description}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};
