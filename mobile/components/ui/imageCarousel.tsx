import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Modal,
  Dimensions,
} from "react-native";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react-native";

interface ImageCarouselProps {
  images: Array<Record<string, any>>;
  title?: string;
  idKey?: string;
  urlKey?: string;
  typeKey?: string;
}

const ImageCarousel = ({
  images,
  title,
  idKey = "id",
  urlKey = "url",
  typeKey = "type",
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleOpenFile = () => {
    if (images[currentIndex][typeKey] === "application/pdf") {
      Linking.openURL(images[currentIndex][urlKey]).catch((err) => {
        console.error("Failed to open PDF:", err);
      });
    }
  };

  if (images.length === 0 || !images[currentIndex][urlKey]) return null;

  const isPDF = images[currentIndex][typeKey] === "application/pdf";

  return (
    <View className="mb-4">
      {title && <Text className="font-medium text-gray-600 mb-2">{title}</Text>}
      <View className="relative">
        {isPDF ? (
          <TouchableOpacity
            className="w-full aspect-video bg-gray-100 rounded-md justify-center items-center border border-gray-300"
            onPress={() => setIsFullScreen(true)}
          >
            <View className="items-center">
              <FileText size={48} color="#0ea5e9" />
              <Text className="text-sm mt-2">PDF Document</Text>
              <Text className="text-xs mt-1 bg-white px-2 py-1 rounded">
                Tap to view full PDF
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsFullScreen(true)}>
            <Image
              source={{ uri: images[currentIndex][urlKey] }}
              className="w-full aspect-square bg-gray-100 rounded-lg border border-gray-100 shadow-sm"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* Image counter */}
        <View className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded-full">
          {images.length > 1 && (
            <Text className="text-xs">
              {currentIndex + 1}/{images.length}
            </Text>
          )}
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

      {/* Full-screen modal */}
      <Modal
        visible={isFullScreen}
        transparent={true}
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity
            className="absolute top-10 right-5 z-10"
            onPress={() => setIsFullScreen(false)}
          >
            <X size={24} color="white" />
          </TouchableOpacity>

          {isPDF ? (
            <View className="w-full h-full justify-center items-center p-4">
              <View className="w-full max-w-md aspect-[4/3] bg-gray-100 rounded-lg justify-center items-center p-4">
                <FileText size={72} color="#0ea5e9" />
                <Text className="text-lg mt-4 font-medium">PDF Document</Text>
                <Text className="text-sm mt-2 text-center">
                  This document is in PDF format. Tap below to open it in your
                  PDF viewer.
                </Text>
                <TouchableOpacity
                  className="mt-6 bg-blue-500 px-6 py-3 rounded-md"
                  onPress={handleOpenFile}
                >
                  <Text className="text-white font-medium">Open PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Image
              source={{ uri: images[currentIndex][urlKey] }}
              style={{ width: screenWidth, height: screenHeight * 0.8 }}
              resizeMode="contain"
            />
          )}

          {images.length > 1 && (
            <View className="absolute bottom-10 flex-row">
              <TouchableOpacity
                className="mx-4 p-2 bg-black/50 rounded-full"
                onPress={prevImage}
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                className="mx-4 p-2 bg-black/50 rounded-full"
                onPress={nextImage}
              >
                <ChevronRight size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default ImageCarousel;
