import React from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';

export const LoadingModal = ({ 
  visible, 
  message = 'Loading...', 
  transparent = true,
  animationType = 'fade'
} : {
  visible: boolean;
  message?: string;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
}) => {
  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType={animationType || "none"}
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 min-w-[120px] items-center shadow-2xl">
          <ActivityIndicator 
            size="large" 
            color="#007AFF" 
            className="mb-4"
          />
          <Text className="text-base text-gray-800 text-center font-medium">
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};