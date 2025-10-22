import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
// Signature Modal Component
export const SignatureModal: React.FC<{
    signature: string;
    isVisible: boolean;
    onClose: () => void;
  }> = ({ signature, isVisible, onClose }) => {
    if (!isVisible) return null;
  
    return (
      <Modal visible={isVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black bg-opacity-90 justify-center items-center p-4">
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full">
            <X size={24} color="white" />
          </TouchableOpacity>
  
          {/* Signature Image */}
          <View className="bg-white rounded-lg p-8">
            <Image source={{ uri: `data:image/png;base64,${signature}` }} className="w-64 h-32" resizeMode="contain" />
          </View>
  
          {/* Signature Label */}
          <View className="absolute bottom-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
            <Text className="text-white text-sm">Authorized Signature</Text>
          </View>
        </View>
      </Modal>
    );
  };