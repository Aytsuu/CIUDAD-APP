import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Image, TouchableOpacity } from 'react-native';
import { X, ArrowLeft, ArrowRight } from 'lucide-react-native';

export const DocumentModal: React.FC<{
    files: Array<{ medf_id: string; medf_name: string; medf_url: string }>;
    isVisible: boolean;
    onClose: () => void;
    initialIndex?: number;
}> = ({ files, isVisible, onClose, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setCurrentIndex(initialIndex);
            setImageError(false);
        }
    }, [isVisible, initialIndex]);

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % files.length);
        setImageError(false);
    };

    const goToPrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + files.length) % files.length);
        setImageError(false);
    };

    if (!isVisible) return null;

    const currentFile = files[currentIndex];

    // Fix URL encoding for React Native
    

    const encodedUrl = currentFile.medf_url;

    console.log('Original URL:', currentFile.medf_url);
    console.log('Encoded URL:', encodedUrl);

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
                    {!imageError ? (
                        <Image 
                            source={{ uri: encodedUrl }}  // FIXED: Use 'source' prop with 'uri'
                            className="w-full h-80" 
                            resizeMode="contain"
                            onError={() => {
                                console.log('Image failed to load in React Native');
                                setImageError(true);
                            }}
                            onLoad={() => console.log('Image loaded successfully in React Native')}
                            onLoadStart={() => console.log('Image loading started...')}
                            onLoadEnd={() => console.log('Image loading ended')}
                        />
                    ) : (
                        <View className="w-full h-80 bg-gray-800 justify-center items-center rounded-lg">
                            <Text className="text-white text-lg">Failed to load image</Text>
                            <Text className="text-gray-400 text-sm mt-2 text-center">
                                Check console for details
                            </Text>
                        </View>
                    )}
                </View>

                {/* Image Name */}
                <View className="absolute bottom-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                    <Text className="text-white text-sm" numberOfLines={1}>
                        {currentFile.medf_name || `Document ${currentIndex + 1}`}
                    </Text>
                </View>

                {/* Debug Info */}
                <View className="absolute bottom-20 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs">
                        Files: {files.length} | Current: {currentIndex}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};