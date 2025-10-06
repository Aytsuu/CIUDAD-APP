import "@/global.css";
import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from "@/lib/supabase";

// React Native compatible UUID generator
const uuidv4 = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for older React Native versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export type MediaFileType = {
  id: string;
  uri: string;
  name: string;
  type: string;
  path: string;
  publicUrl?: string;
  status: 'uploading' | 'uploaded' | 'error';
};

export default function MultiImageUploader({
  mediaFiles,
  setMediaFiles,
  maxFiles = 10,
  hideRemoveButton = false,
  editable = true, // New prop with default value true
}: {
  mediaFiles: MediaFileType[];
  setMediaFiles: React.Dispatch<React.SetStateAction<MediaFileType[]>>;
  maxFiles?: number;
  hideRemoveButton?: boolean;
  editable?: boolean; // New optional prop
}) {
  const [galleryVisible, setGalleryVisible] = React.useState(false);
  const [cameraVisible, setCameraVisible] = React.useState(false);
  const [galleryAssets, setGalleryAssets] = React.useState<MediaLibrary.Asset[]>([]);
  const cameraRef = React.useRef<Camera>(null);
  const device = useCameraDevice('back');

  // Request permissions on mount
  React.useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        console.warn('Permission to access media library was denied');
      }
      
      const cameraStatus = await Camera.requestCameraPermission();
      if (cameraStatus !== 'granted') {
        console.warn('Camera permission was denied');
      }
    })();
  }, []);

  // Fetch gallery assets when gallery is opened
  const fetchGalleryAssets = async () => {
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 100,
        sortBy: ['creationTime'],
      });
      setGalleryAssets(assets);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const openGallery = async () => {
    if (!editable) return; // Don't allow opening gallery if not editable
    
    if (mediaFiles.length >= maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`);
      return;
    }

    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        alert('Permission to access media library is required!');
        return;
      }
    }
    
    await fetchGalleryAssets();
    setGalleryVisible(true);
  };

  const handleImageSelection = async (imageUri: string) => {
    if (!editable) return; // Don't allow adding files if not editable
    
    if (mediaFiles.length >= maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`);
      return;
    }

    const fileName = imageUri.split('/').pop() || `${uuidv4()}.jpg`;
    const newMediaFile: MediaFileType = {
      id: uuidv4(),
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
      path: `uploads/${fileName}`,
      status: 'uploading'
    };

    // Add to state immediately
    setMediaFiles(prev => [...prev, newMediaFile]);
    
    try {
      // Compress and resize the image
      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1080, height: 1920 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!compressedImage.base64) {
        throw new Error("Compressed image base64 data is missing");
      }

      // Convert base64 to Uint8Array
      const arrayBuffer = Uint8Array.from(atob(compressedImage.base64), c => c.charCodeAt(0));

      // Upload to Supabase
      const { error } = await supabase.storage
        .from("image-bucket")
        .upload(newMediaFile.path, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("image-bucket")
        .getPublicUrl(newMediaFile.path);

      // Update state with public URL
      setMediaFiles(prev => 
        prev.map(file => 
          file.id === newMediaFile.id 
            ? { ...file, publicUrl, status: 'uploaded' } 
            : file
        )
      );
    } catch (error) {
      console.error('Upload failed:', error);
      setMediaFiles(prev => 
        prev.map(file => 
          file.id === newMediaFile.id 
            ? { ...file, status: 'error' } 
            : file
        )
      );
    }
  };

  const removeMediaFile = async (id: string) => {
    if (!editable) return; // Don't allow removing files if not editable
    
    const fileToRemove = mediaFiles.find(file => file.id === id);
    if (!fileToRemove) return;

    try {
      // Remove from Supabase if it was uploaded
      if (fileToRemove.path && fileToRemove.status === 'uploaded') {
        await supabase.storage
          .from("image-bucket")
          .remove([fileToRemove.path]);
      }
      
      // Remove from local state
      setMediaFiles(prev => prev.filter(file => file.id !== id));
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to remove file');
    }
  };

  // Camera functions
  const takePhoto = async () => {
    if (!editable) return; // Don't allow taking photos if not editable
    setGalleryVisible(false);
    setCameraVisible(true);
  };
  
  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });
      await handleImageSelection(`file://${photo.path}`);
      setCameraVisible(false);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const closeCamera = () => {
    setCameraVisible(false);
    setGalleryVisible(true);
  };

  if (!device) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Camera not available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Selected images grid */}
      <View className="flex-row flex-wrap mb-4">
        {mediaFiles.map((file) => (
          <View key={file.id} className="w-1/3 p-1 aspect-square">
            <View className="relative w-full h-full rounded-md overflow-hidden border border-gray-200">
              <Image 
                source={{ uri: file.uri }} 
                className="w-full h-full" 
                resizeMode="cover"
              />
              
              {/* Upload status overlay */}
              {file.status !== 'uploaded' && (
                <View className="absolute inset-0 bg-black/30 justify-center items-center">
                  {file.status === 'uploading' ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="warning" size={24} color="white" />
                  )}
                </View>
              )}
              
              {/* Remove button (hidden if hideRemoveButton is true or not editable) */}
              {!hideRemoveButton && editable && (
                <TouchableOpacity
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                  onPress={() => removeMediaFile(file.id)}
                >
                  <Ionicons name="close" size={14} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        
        {/* Add more button (only shows if under maxFiles limit and editable) */}
        {editable && mediaFiles.length < maxFiles && (
          <TouchableOpacity 
            className="w-1/3 p-1 aspect-square justify-center items-center bg-gray-100 rounded-md border border-dashed border-gray-300"
            onPress={openGallery}
          >
            <Ionicons name="add" size={28} color="#6b7280" />
            <Text className="text-gray-500 text-xs mt-1">Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Gallery Modal */}
      <Modal
        visible={galleryVisible}
        animationType="slide"
        onRequestClose={() => setGalleryVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setGalleryVisible(false)}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Select Photos</Text>
            <View style={{ width: 28 }} /> {/* Spacer for alignment */}
          </View>

          {/* Gallery grid */}
          <FlatList
            data={galleryAssets}
            numColumns={3}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="flex-1 m-1 aspect-square"
                onPress={() => {
                  handleImageSelection(item.uri);
                  setGalleryVisible(false);
                }}
              >
                <Image 
                  source={{ uri: item.uri }} 
                  className="w-full h-full" 
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 4 }}
            initialNumToRender={12}
            maxToRenderPerBatch={24}
            windowSize={5}
          />

          {/* Camera button */}
          {editable && (
            <TouchableOpacity 
              className="flex-row bg-blue-500 p-4 rounded-lg mx-4 my-4 justify-center items-center"
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text className="text-white ml-2 font-semibold">Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={closeCamera}
      >
        <View className="flex-1 bg-black">
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={cameraVisible}
            photo={true}
          />
          
          {/* Camera controls */}
          <View className="absolute w-full bottom-0 p-5 bg-black/30">
            {/* Back button */}
            <TouchableOpacity 
              className="absolute top-3 left-3"
              onPress={closeCamera}
            >
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            
            {/* Capture button */}
            <View className="flex-row justify-center">
              <TouchableOpacity 
                className="w-16 h-16 rounded-full border-4 border-white justify-center items-center"
                onPress={capturePhoto}
              >
                <View className="w-12 h-12 bg-white rounded-full" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});