import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Image, TouchableOpacity } from 'react-native';
import { X, ArrowLeft, ArrowRight } from 'lucide-react-native';

// Document Carousel Modal Componentexport 
export const DocumentModal: React.FC<{
    files: Array<{ medf_id: string; medf_name: string; medf_url: string }>;
    isVisible: boolean;
    onClose: () => void;
    initialIndex?: number;
  }> = ({ files, isVisible, onClose, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
    useEffect(() => {
      if (isVisible) {
        setCurrentIndex(initialIndex);
      }
    }, [isVisible, initialIndex]);
  
    const goToNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % files.length);
    };
  
    const goToPrev = () => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + files.length) % files.length);
    };
  
    if (!isVisible) return null;
  
    const currentFile = files[currentIndex];
  
    return (
      <Modal visible={isVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black bg-opacity-90 justify-center items-center p-4">
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full">
            <X size={24} color="white" />
          </TouchableOpacity>
  
          {/* Navigation Arrows */}
          {files.length > 1 && (
            <>
              <TouchableOpacity onPress={goToPrev} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full">
                <ArrowLeft size={32} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={goToNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full">
                <ArrowRight size={32} color="white" />
              </TouchableOpacity>
            </>
          )}
  
          {/* Image Counter */}
          {files.length > 1 && (
            <View className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
              <Text className="text-white text-sm">
                {currentIndex + 1} / {files.length}
              </Text>
            </View>
          )}
  
          {/* Main Image */}
          <View className="max-w-full max-h-full justify-center items-center">
            <Image source={{ uri: currentFile.medf_url }} className="w-full h-80" resizeMode="contain" />
          </View>
  
          {/* Image Name */}
          <View className="absolute bottom-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
            <Text className="text-white text-sm" numberOfLines={1}>
              {currentFile.medf_name || `Document ${currentIndex + 1}`}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  
  
  