import React from "react"
import { View, Text, TouchableOpacity, Image, FlatList, Modal, StyleSheet, ScrollView, Alert } from "react-native"
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"
import * as MediaLibrary from "expo-media-library"
import * as FileSystem from 'expo-file-system';
import { Ionicons } from "@expo/vector-icons"
import { getMimeType } from "@/helpers/fileHandling";

export interface MediaItem {
  uri: string
  id: string
  name?: string
  type?: string
  file?: string
}

interface MediaPickerProps {
  selectedImages: MediaItem[]
  setSelectedImages: React.Dispatch<React.SetStateAction<MediaItem[]>>
  multiple?: boolean
  maxImages?: number
}

export default function MediaPicker({
  selectedImages,
  setSelectedImages,
  multiple = false,
  maxImages = 10,
}: MediaPickerProps) {
  const [galleryVisible, setGalleryVisible] = React.useState<boolean>(false)
  const [cameraVisible, setCameraVisible] = React.useState<boolean>(false)
  const [galleryAssets, setGalleryAssets] = React.useState<MediaLibrary.Asset[]>([])
  const [selectedGalleryItems, setSelectedGalleryItems] = React.useState<Set<string>>(new Set())

  const cameraRef = React.useRef<Camera>(null)
  const device = useCameraDevice("back")
  const { hasPermission, requestPermission } = useCameraPermission()

  React.useEffect(() => {
    let isMounted = true
    const checkPermissions = async () => {
      try {
        // Request media library permission
        const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync()
        if (mediaLibraryStatus.status !== "granted" && isMounted) {
          console.warn("Permission to access media library was denied")
        }
        // Request camera permission
        if (!hasPermission) {
          const cameraPermission = await requestPermission()
          if (!cameraPermission && isMounted) {
            console.warn("Camera permission was denied")
          }
        }
      } catch (error) {
        console.error("Permission error:", error)
      }
    }

    checkPermissions()
    return () => {
      isMounted = false
    }
  }, [hasPermission, requestPermission])

  const fetchGalleryAssets = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 100,
        sortBy: ["creationTime"],
      })
      setGalleryAssets(media.assets)
    } catch (error) {
      console.error("Error fetching gallery:", error)
    }
  }

  const openGallery = async () => {
    const { status } = await MediaLibrary.getPermissionsAsync()
    if (status !== "granted") {
      const { status: reqStatus } = await MediaLibrary.requestPermissionsAsync()
      if (reqStatus !== "granted") {
        Alert.alert("Permission Required", "Permission to access media library is required!")
        return
      }
    }
    await fetchGalleryAssets()
    setSelectedGalleryItems(new Set())
    setGalleryVisible(true)
  }

  const handleSelectedImages = async (imageData: Array<{uri: string, filename?: string}>) => {
    if (imageData.length === 0) return;
    
    try {
      const newMediaItems = await Promise.all(
        imageData.map(async (data) => {
          try {
            // Read as base64
            const base64Data = await FileSystem.readAsStringAsync(data.uri, {
              encoding: FileSystem.EncodingType.Base64
            });

            // Determine MIME type
            const mimeType = await getMimeType(data.uri);

            return {
              uri: data.uri,
              id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              name: `media_${data.filename}_${Date.now()}.${mimeType.split('/')[1]}${Math.random().toString(36).substring(2, 8)}`,
              type: mimeType || 'image/jpeg',
              file: base64Data,
            };
          } catch (err) {
            console.error("Error processing image:", err);
            return null;
          }
        })
      );

      // Filter out any null values from failed processing
      const validMediaItems = newMediaItems.filter((item) => item !== null);

      if (multiple) {
        setSelectedImages((prev) => {
          const newImages = [...prev, ...validMediaItems];
          const limitedImages = newImages.slice(0, maxImages);
          return limitedImages;
        });
      } else {
        setSelectedImages(validMediaItems.slice(0, 1));
      }
    } catch (error) {
      console.error("Error handling selected images:", error);
      Alert.alert("Error", "Failed to process images. Please try again.");
    }
  };

  const handleGallerySelection = (item: MediaLibrary.Asset) => {
    if (!multiple) {
      // Single selection mode
      handleSelectedImages([{uri: item.uri, filename: item.filename}])
      setGalleryVisible(false)
      return
    }

    // Multiple selection mode
    const newSelected = new Set(selectedGalleryItems)
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id)
    } else {
      if (newSelected.size < maxImages) {
        newSelected.add(item.id)
      } else {
        Alert.alert("Limit Reached", `You can only select up to ${maxImages} images.`)
      }
    }
    setSelectedGalleryItems(newSelected)
  }

  const confirmGallerySelection = () => {
    const selectedAssets = galleryAssets.filter((asset) => selectedGalleryItems.has(asset.id))
    const imageData = selectedAssets.map((asset) => ({uri: asset.uri, filename: asset.filename}))
    handleSelectedImages(imageData)
    setGalleryVisible(false)
  }

  const takePhoto = async () => {
    if (!hasPermission) {
      Alert.alert("Permission Required", "Camera permission is required to take photos.")
      return
    }
    setGalleryVisible(false)
    setCameraVisible(true)
  }

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: "off",
        })
        
        // Save photo to media library to get proper URI
        const asset = await MediaLibrary.createAssetAsync(`file://${photo.path}`)
        console.log("Photo captured and saved:", asset)

        handleSelectedImages([{uri: asset.uri, filename: `photo_${Date.now()}.jpg`}])
        setCameraVisible(false)

        // Refresh gallery after capturing
        setTimeout(fetchGalleryAssets, 1000)
      } catch (error) {
        console.error("Error taking photo:", error)
        Alert.alert("Camera Error", "Failed to capture photo. Please try again.")
      }
    }
  }

  const closeCamera = () => {
    setCameraVisible(false)
    setGalleryVisible(true)
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      console.log("Removed image at index", index, "Updated list:", updated)
      return updated
    })
  }

  // Function to remove all images
  const removeAllImages = () => {
    setSelectedImages([])
    console.log("All images cleared")
  }

  const canSelectMore = multiple && selectedImages.length < maxImages

  if (!device) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading camera...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1">
      {/* Display selected images as file names */}
      {selectedImages.length > 0 ? (
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
          >
            <View className="p-4">
              <Text className="text-lg font-semibold mb-3">Selected Files:</Text>
              {selectedImages.map((image, index) => {
                return (
                  <View
                    key={index}
                    className="flex-row items-center justify-between bg-gray-100 p-3 mb-2 rounded-lg"
                  >
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="image" size={20} color="#666" />
                      <Text className="ml-2 flex-1 text-gray-800" numberOfLines={1}>
                        {image.name || `image_${index + 1}.jpg`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="bg-red-500 rounded-full w-6 h-6 justify-center items-center ml-2"
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                )
              })}
            </View>
          </ScrollView>
        </View>
      ) : (
        <TouchableOpacity
          className="w-full h-[300px] bg-[#f0f2f5] justify-center items-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
          onPress={openGallery}
        >
          <View className="items-center">
            <Ionicons name="add" size={28} color="#1778F2" />
            <Text className="text-[#1778F2] text-[12px] mt-2 font-medium">{multiple ? "Add Photos" : "Add Photo"}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Clear all button for multiple mode */}
      {multiple && selectedImages.length > 1 && (
        <TouchableOpacity
          className="mt-2 p-2 bg-red-500 rounded-lg justify-center items-center"
          onPress={removeAllImages}
        >
          <Text className="text-white font-medium">Clear All ({selectedImages.length})</Text>
        </TouchableOpacity>
      )}

      {/* Add more button for multiple mode */}
      {multiple && selectedImages.length > 0 && canSelectMore && (
        <TouchableOpacity
          className="mt-2 p-3 bg-[#1778F2] rounded-lg justify-center items-center"
          onPress={openGallery}
        >
          <Text className="text-white font-medium">
            Add More Photos ({selectedImages.length}/{maxImages})
          </Text>
        </TouchableOpacity>
      )}

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
            <Text className="text-lg font-semibold">
              Gallery {multiple && `(${selectedGalleryItems.size}/${maxImages})`}
            </Text>
            {multiple && selectedGalleryItems.size > 0 ? (
              <TouchableOpacity onPress={confirmGallerySelection}>
                <Text className="text-[#1778F2] font-semibold">Done</Text>
              </TouchableOpacity>
            ) : (
              <View className="w-7" />
            )}
          </View>
          <FlatList
            data={galleryAssets}
            numColumns={3}
            renderItem={({ item }) => {
              const isSelected = selectedGalleryItems.has(item.id)
              return (
                <TouchableOpacity
                  className="flex-1 m-1 aspect-square relative"
                  onPress={() => handleGallerySelection(item)}
                >
                  <Image source={{ uri: item.uri }} className="w-full h-full rounded" resizeMode="cover" />
                  {multiple && (
                    <View className="absolute top-2 right-2">
                      <View
                        className={`w-6 h-6 rounded-full border-2 border-white ${
                          isSelected ? "bg-[#1778F2]" : "bg-transparent"
                        } justify-center items-center`}
                      >
                        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              )
            }}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 4 }}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            windowSize={5}
          />
          <TouchableOpacity
            className="flex-row bg-[#1778F2] p-4 rounded mx-4 my-4 justify-center items-center"
            onPress={takePhoto}
            disabled={!hasPermission}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text className="text-white ml-2 font-semibold">Camera</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Camera Modal */}
      <Modal visible={cameraVisible} animationType="slide" transparent={false} onRequestClose={closeCamera}>
        <View className="flex-1 relative">
          {device && (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={cameraVisible}
              photo={true}
            />
          )}

          <View className="absolute w-full bottom-0 p-5 bg-[rgba(0,0,0,0.3)]">
            <TouchableOpacity className="absolute top-10 left-5" onPress={closeCamera}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity className="self-center" onPress={capturePhoto}>
              <View className="w-16 h-16 rounded-[32px] border-4 border-white bg-transparent" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
