import "@/global.css";
import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Modal, StyleSheet} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from "@/lib/supabase";
import { v4 as uuid4 } from 'uuid';

export default function MediaPicker({selectedImage, setSelectedImage} : {
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>
}) {
  const [galleryVisible, setGalleryVisible] = React.useState(false);
  const [cameraVisible, setCameraVisible] = React.useState(false);
  const [galleryAssets, setGalleryAssets] = React.useState<MediaLibrary.Asset[]>([]);
  const cameraRef = React.useRef<Camera>(null);
  const device = useCameraDevice('back');

  React.useEffect(() => {
    (async () => {
      // Request media library permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
      }
      // Request camera permission (for react-native-vision-camera)
      await Camera.requestCameraPermission();
    })();
  }, []);
  

  const fetchGalleryAssets = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 100,
        sortBy: ['creationTime'],
      });
      setGalleryAssets(media.assets);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  // Fetch gallery assets only when gallery is opened and permission is granted
  const openGallery = async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: reqStatus } = await MediaLibrary.requestPermissionsAsync();
      if (reqStatus !== 'granted') {
        alert('Permission to access media library is required!');
        return;
      }
    }
    await fetchGalleryAssets();
    setGalleryVisible(true);
  };

  const handleSelectedImage = async (imageUri: string) => {
    setSelectedImage(imageUri);
    const compressedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1080, height: 1200 } }],
      {
        compress: 0.8, // 70% compression (0.7)
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!compressedImage.base64) {
      throw new Error("Compressed image base64 data is undefined");
    }

    const arrayBuffer = Uint8Array.from(atob(compressedImage.base64), (c) =>
      c.charCodeAt(0)
    );

    const fileName = `${uuid4()}.jpg`;
    const filePath = `uploads/${fileName}`;
    const { error } = await supabase.storage
      .from("image-bucket")
      .upload(filePath, arrayBuffer as Uint8Array, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("image-bucket").getPublicUrl(filePath);

    console.log("Upload successful!", publicUrl);

    setSelectedImage(publicUrl);
  }

  // If Camera is selected
  const takePhoto = async () => {
    setGalleryVisible(false);
    setCameraVisible(true);
  };
  
  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
        });
        handleSelectedImage(`file://${photo.path}`);
        setCameraVisible(false);
        setTimeout(fetchGalleryAssets, 1000);
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  const closeCamera = () => {
    setCameraVisible(false);
    setGalleryVisible(true);
  };

  if (!device) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center">
      {/* Main touchable that opens the gallery */}
      <TouchableOpacity 
        className="w-full h-[300px]  bg-[#f0f2f5] justify-center items-center overflow-hidden"
        onPress={openGallery}
      >
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} className="w-full h-full" />
        ) : (
          <View className="items-center">
            <Ionicons name="add" size={28} color="#1778F2" />
            <Text className="text-[#1778F2] text-[12px] mt-2 font-medium">Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Gallery Modal */}
      <Modal
        visible={galleryVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setGalleryVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-[#e9ebee]">
            <TouchableOpacity onPress={() => setGalleryVisible(false)}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Gallery</Text>
            <View className="w-7" />
          </View>

          <FlatList
            data={galleryAssets}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="flex-1 m-1 aspect-square"
                onPress={() => {
                  handleSelectedImage(item.uri);
                  setGalleryVisible(false);
                }}
              >
                <Image 
                  source={{ uri: item.uri }} 
                  className="w-full h-full rounded" 
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 4 }}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            windowSize={5}
          />

          {/* Camera button at the bottom */}
          <TouchableOpacity 
            className="flex-row bg-[#1778F2] p-4 rounded mx-4 my-4 justify-center items-center"
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text className="text-white ml-2 font-semibold">Camera</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeCamera}
      >
        <View className="flex-1 relative">
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={cameraVisible}
            photo={true}
          />
          
          <View className="absolute w-full bottom-0 p-5 bg-[rgba(0,0,0,0.3)]">
            <TouchableOpacity 
              className="absolute top-10 left-5"
              onPress={closeCamera}
            >
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="self-center"
              onPress={capturePhoto}
            >
              <View className="w-16 h-16 rounded-[32px] border-4 border-white bg-transparent" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
