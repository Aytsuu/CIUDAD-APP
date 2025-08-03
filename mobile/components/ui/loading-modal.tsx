import React from 'react';
import {
  Modal,
  View,
  ActivityIndicator,
} from 'react-native';

export const LoadingModal = ({ 
  visible, 
  message = '', 
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
          <ActivityIndicator 
            size="large" 
            color="#d0d0d0" 
            className="mb-4"
          />
      </View>
    </Modal>
  );
};