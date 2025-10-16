import LottieView from 'lottie-react-native';
import React from 'react';
import {
  Modal,
  View,
} from 'react-native';

export const LoadingModal = ({ 
  visible, 
  transparent = true,
  animationType = 'fade'
} : {
  visible: boolean;
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
      <View className="flex-1 bg-black/80 justify-center items-center">
        <LottieView 
          source={require('@/assets/animated/loading.json')}
          autoPlay
          loop
          style={{ width: 70, height: 70 }}
        />
      </View>
    </Modal>
  );
};