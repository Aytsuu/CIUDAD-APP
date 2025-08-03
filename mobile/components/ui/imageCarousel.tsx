import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface ImageCarouselProps {
  images: Array<Record<string, any>>;
  title?: string;
  idKey?: string;
  urlKey?: string;
}

const ImageCarousel = ({ 
  images, 
  title, 
  idKey = 'id',  // Default key for ID
  urlKey = 'url' // Default key for URL
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  if (images.length === 0 || !images[currentIndex][urlKey]) return null;

  return (
    <View className="mb-4">
      {title && <Text className="font-medium text-gray-600 mb-2">{title}</Text>}
      <View className="relative">
        <Image
          source={{ uri: images[currentIndex][urlKey] }}
          className="w-full aspect-video bg-gray-100 rounded-md"
          resizeMode="cover"
        />
        
        {/* Image counter */}
        <View className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded-full">
          <Text className="text-xs">
            {currentIndex + 1}/{images.length}
          </Text>
        </View>
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <TouchableOpacity 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 w-8 h-8 rounded-full justify-center items-center"
              onPress={prevImage}
            >
              <ChevronLeft size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 w-8 h-8 rounded-full justify-center items-center"
              onPress={nextImage}
            >
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default ImageCarousel;