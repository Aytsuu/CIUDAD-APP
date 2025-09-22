import React from "react"
import { View, Text, TouchableOpacity, Image, FlatList, Modal, StyleSheet, ScrollView, Alert } from "react-native"
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"
import * as MediaLibrary from "expo-media-library"
import * as FileSystem from 'expo-file-system';
import { Ionicons } from "@expo/vector-icons"
import { getMimeType } from "@/helpers/fileHandling";
import { CloudUpload } from "@/lib/icons/CloudUpload";

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
  editable?: boolean
  showRemoveButtons?: boolean
  showClearAllButton?: boolean
  onlyRemoveNewImages?: boolean
  initialImageIds?: string[]
}

export default function MediaPicker({
  selectedImages,
  setSelectedImages,
  multiple = false,
  maxImages = 10,
  editable = true,
  showRemoveButtons = true,
  showClearAllButton = true,
  onlyRemoveNewImages = false,
  initialImageIds = [],
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
        const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync()
        if (mediaLibraryStatus.status !== "granted" && isMounted) {
          console.warn("Permission to access media library was denied")
        }
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

    if (editable) {
      checkPermissions()
    }
    return () => {
      isMounted = false
    }
  }, [hasPermission, requestPermission, editable])

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
    if (!editable) return;
    
    const { status } = await MediaLibrary.getPermissionsAsync()
    if (status !== "granted") {
      const { status: reqStatus } = await MediaLibrary.requestPermissionsAsync()
      if (reqStatus !== "granted") {
        Alert.alert("Permission Required", "Permission to access media library is required!")
        return
      }
    }
    await fetchGalleryAssets()
    
    const preSelectedItems = new Set<string>()
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: 100,
      sortBy: ["creationTime"],
    })
    
    selectedImages.forEach(selectedImage => {
      const matchingAsset = media.assets.find(asset => asset.uri === selectedImage.uri)
      if (matchingAsset) {
        preSelectedItems.add(matchingAsset.id)
      }
    })
    
    setSelectedGalleryItems(preSelectedItems)
    setGalleryVisible(true)
  }

  const handleSelectedImages = async (imageData: Array<{uri: string, filename?: string}>) => {
    if (imageData.length === 0) return;
    
    try {
      const newMediaItems = await Promise.all(
        imageData.map(async (data) => {
          try {
            const base64Data = await FileSystem.readAsStringAsync(data.uri, {
              encoding: FileSystem.EncodingType.Base64
            });

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
    if (!editable) return;
    
    if (!multiple) {
      handleSelectedImages([{uri: item.uri, filename: item.filename}])
      setGalleryVisible(false)
      return
    }

    const newSelected = new Set(selectedGalleryItems)
    
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id)
      setSelectedImages(prev => prev.filter(selectedImage => selectedImage.uri !== item.uri))
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
    if (!editable || !hasPermission) {
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
        
        const asset = await MediaLibrary.createAssetAsync(`file://${photo.path}`)

        handleSelectedImages([{uri: asset.uri, filename: `photo_${Date.now()}.jpg`}])
        setCameraVisible(false)

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

  const canRemoveImage = (image: MediaItem, index: number) => {
    if (!editable || !showRemoveButtons) return false;
    
    if (onlyRemoveNewImages) {
      return !initialImageIds.includes(image.id || '');
    }
    
    return true;
  }

  const removeImage = (index: number) => {
    const image = selectedImages[index];
    if (!canRemoveImage(image, index)) return;
    
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const getRemovableImagesCount = () => {
    if (!onlyRemoveNewImages) return selectedImages.length;
    
    return selectedImages.filter(image => !initialImageIds.includes(image.id || '')).length;
  }

  const removeAllImages = () => {
    if (!editable || !showClearAllButton) return;
    
    if (onlyRemoveNewImages) {
      setSelectedImages((prev) => prev.filter(image => initialImageIds.includes(image.id || '')));
    } else {
      setSelectedImages([]);
    }
  }

  // Render individual image item for the clean list view
  const renderImageItem = ({ item, index }: { item: MediaItem; index: number }) => {
    const isExistingImage = initialImageIds.includes(item.id || '');
    const showRemoveButton = canRemoveImage(item, index);
    
    return (
      <View className="bg-white rounded-xl mx-2 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-center p-3">
          {/* Image Thumbnail */}
          <View className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 mr-3 shadow-sm">
            <Image 
              source={{ uri: item.uri }} 
              className="w-full h-full" 
              resizeMode="cover"
            />
          </View>
          
          {/* Image Info */}
          <View className="flex-1">
            <Text className="text-gray-800 font-medium text-sm" numberOfLines={1}>
              {item.name || `Image ${index + 1}`}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 text-xs">
                {item.type || 'image/jpeg'}
              </Text>
              {onlyRemoveNewImages && isExistingImage && (
                <View className="ml-2 bg-blue-100 px-2 py-1 rounded-full">
                  <Text className="text-blue-600 text-xs font-medium">Existing</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Remove Button */}
          {showRemoveButton && (
            <TouchableOpacity
              className="w-8 h-8 bg-red-50 rounded-full justify-center items-center ml-2"
              onPress={() => removeImage(index)}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const canSelectMore = multiple && selectedImages?.length < maxImages
  const removableCount = getRemovableImagesCount()

  if (!device) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading camera...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1">
      {selectedImages?.length > 0 ? (
        <View className="flex-1">
          {/* Header with count and clear button */}
          <View className="flex-row justify-between items-center mb-3">
            {editable && showClearAllButton && removableCount > 1 && (
              <TouchableOpacity
                className="bg-red-50 px-3 py-1.5 rounded-full"
                onPress={removeAllImages}
              >
                <Text className="text-red-600 text-sm font-medium">
                  {onlyRemoveNewImages ? `Clear New (${removableCount})` : `Clear All`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Clean List View */}
          <FlatList
            data={selectedImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>
      ) : (
        <TouchableOpacity
          className="w-full bg-white justify-center rounded-3xl items-center overflow-hidden border-2 border-primaryBlue shadow-lg shadow-blue-500"
          onPress={editable ? openGallery : undefined}
        >
          <View className="items-center p-5">
            <View className="bg-blue-50 p-3 rounded-full">
              <CloudUpload className="text-primaryBlue bg-blue-200"/>
            </View>
            <Text className="text-gray-700 text-[12px] mt-2">
              <Text className="text-primaryBlue font-medium">
                Click here {""}
              </Text>
              to upload your {multiple ? "photos" : "photo"}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Upload More Button */}
      {editable && multiple && selectedImages?.length > 0 && canSelectMore && (
        <View className="flex-row justify-center">
          <TouchableOpacity
            className="mt-2 p-3 bg-[#1778F2] justify-center items-center rounded-full"
            onPress={openGallery}
          >
            <Text className="text-white text-sm font-medium px-4">
              Upload ({selectedImages.length}/{maxImages})
            </Text>
          </TouchableOpacity>
        </View>
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
          />
          {editable && (
            <TouchableOpacity
              className="flex-row bg-[#1778F2] p-4 rounded mx-4 my-4 justify-center items-center"
              onPress={takePhoto}
              disabled={!hasPermission}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text className="text-white ml-2 font-semibold">Camera</Text>
            </TouchableOpacity>
          )}
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
  )
}