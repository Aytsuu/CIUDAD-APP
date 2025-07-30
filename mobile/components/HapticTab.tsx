import React from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export const HapticTab: React.FC<BottomTabBarButtonProps> = ({ 
  children, 
  onPress, 
  accessibilityState,
  ...props 
}) => {
  const handlePress = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(event);
    }
  };

  // Filter out incompatible props
  const { ref, ...pressableProps } = props as any;

  return (
    <Pressable 
      onPress={handlePress} 
      accessibilityState={accessibilityState}
      {...pressableProps}
    >
      {children}
    </Pressable>
  );
}; 