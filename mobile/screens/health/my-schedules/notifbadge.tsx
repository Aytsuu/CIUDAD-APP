// notifbadge.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  showBadge: boolean;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, showBadge }) => {
  if (!showBadge) return null;

  return (
    <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
      <Text className="text-white text-xs font-bold">
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
};

export default NotificationBadge;