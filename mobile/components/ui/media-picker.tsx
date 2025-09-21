import React from "react"
import { View, Text, TouchableOpacity, Image, FlatList, Modal, StyleSheet, Alert, ActivityIndicator } from "react-native"
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
  const [isLoadingGallery, setIsLoadingGallery] = React.useState<boolean>(false)
  const [isProcessingImages, setIsProcessingImages] = React.useState<boolean>(false)

  const cameraRef = React.useRef<Camera>(null)
  const device = useCameraDevice("back")
  const { hasPermission, requestPermission } = useCameraPermission()

  // Cache for gallery assets to avoid repeated API calls
  const galleryCache = React.useRef<{
    assets: MediaLibrary.Asset[]
    timestamp: number
  } | null>(null)

  // Cache timeout (5 minutes)
  const CACHE_TIMEOUT = 5 * 60 * 1000

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

  const fetchGalleryAssets = async (useCache = true) => {
    try {
      setIsLoadingGallery(true)
      
      // Check cache first
      if (useCache && galleryCache.current) {
        const { assets, timestamp } = galleryCache.current
        const isExpired = Date.now() - timestamp > CACHE_TIMEOUT
        
        if (!isExpired) {
          setGalleryAssets(assets)
          setIsLoadingGallery(false)
          return assets
        }
      }

      // Fetch from API
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 200, // Increased for better UX
        sortBy: ["creationTime"],
      })

      // Update cache
      galleryCache.current = {
        assets: media.assets,
        timestamp: Date.now()
      }

      setGalleryAssets(media.assets)
      setIsLoadingGallery(false)
      return media.assets
    } catch (error) {
      console.error("Error fetching gallery:", error)
      setIsLoadingGallery(false)
      return []
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

    // Show modal immediately for better UX
    setGalleryVisible(true)
    
    // Fetch assets (with caching)
    const assets = await fetchGalleryAssets()
    
    // Pre-select already selected items
    const preSelectedItems = new Set<string>()
    selectedImages.forEach(selectedImage => {
      const matchingAsset = assets.find(asset => asset.uri === selectedImage.uri)
      if (matchingAsset) {
        preSelectedItems.add(matchingAsset.id)
      }
    })
    
    setSelectedGalleryItems(preSelectedItems)
  }

  // Optimized image processing - defer base64 conversion
  const handleSelectedImages = async (imageData: Array<{uri: string, filename?: string}>) => {
    if (imageData.length === 0) return;
    
    setIsProcessingImages(true)
    
    try {
      // Create media items without base64 first for immediate UI update
      const quickMediaItems = imageData.map((data) => ({
        uri: data.uri,
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: `media_${data.filename || 'image'}_${Date.now()}.jpg`,
        type: 'image/jpeg', // Default, will be updated
        file: undefined, // Will be populated later
      }))

      // Update UI immediately
      if (multiple) {
        setSelectedImages((prev) => {
          const newImages = [...prev, ...quickMediaItems];
          const limitedImages = newImages.slice(0, maxImages);
          return limitedImages;
        });
      } else {
        setSelectedImages(quickMediaItems.slice(0, 1));
      }

      // Process base64 and mime types in background
      setTimeout(async () => {
        try {
          const processedItems = await Promise.all(
            quickMediaItems.map(async (item, index) => {
              try {
                const originalData = imageData[index];
                
                // Get mime type
                const mimeType = await getMimeType(originalData.uri);
                
                // Convert to base64 (this is the expensive operation)
                const base64Data = await FileSystem.readAsStringAsync(originalData.uri, {
                  encoding: FileSystem.EncodingType.Base64
                });

                return {
                  ...item,
                  type: mimeType || 'image/jpeg',
                  file: base64Data,
                  name: `media_${originalData.filename || 'image'}_${Date.now()}.${mimeType?.split('/')[1] || 'jpg'}`
                };
              } catch (err) {
                console.error("Error processing image:", err);
                return item; // Return original item if processing fails
              }
            })
          );

          // Update with processed data
          setSelectedImages((prev) => {
            return prev.map((item) => {
              const processed = processedItems.find(p => p.id === item.id);
              return processed || item;
            });
          });
        } catch (error) {
          console.error("Error in background processing:", error);
        } finally {
          setIsProcessingImages(false);
        }
      }, 100); // Small delay to allow UI update first

    } catch (error) {
      console.error("Error handling selected images:", error);
      Alert.alert("Error", "Failed to process images. Please try again.");
      setIsProcessingImages(false);
    }
  };

  const handleGallerySelection = (item: MediaLibrary.Asset) => {
    if (!editable || isProcessingImages) return;
    
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
        return
      }
    }
    setSelectedGalleryItems(newSelected)
  }

  const confirmGallerySelection = () => {
    if (isProcessingImages) return;
    
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
    if (cameraRef.current && !isProcessingImages) {
      try {
        setIsProcessingImages(true)
        
        const photo = await cameraRef.current.takePhoto({
          flash: "off",
        })
        
        const asset = await MediaLibrary.createAssetAsync(`file://${photo.path}`)
        handleSelectedImages([{uri: asset.uri, filename: `photo_${Date.now()}.jpg`}])
        setCameraVisible(false)

        // Invalidate cache since we added a new photo
        galleryCache.current = null
      } catch (error) {
        console.error("Error taking photo:", error)
        Alert.alert("Camera Error", "Failed to capture photo. Please try again.")
        setIsProcessingImages(false)
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

  // Optimized render function with memoization
  const renderImageItem = React.useCallback(({ item, index }: { item: MediaItem; index: number }) => {
    const isExistingImage = initialImageIds.includes(item.id || '');
    const showRemoveButton = canRemoveImage(item, index);
    const isProcessing = !item.file && isProcessingImages;
    
    return (
      <View className="bg-white rounded-xl mx-2 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-center p-3">
          {/* Image Thumbnail */}
          <View className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 mr-3 shadow-sm relative">
            <Image 
              source={{ uri: item.uri }} 
              className="w-full h-full" 
              resizeMode="cover"
            />
            {isProcessing && (
              <View className="absolute inset-0 bg-black bg-opacity-30 justify-center items-center">
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
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
              {isProcessing && (
                <View className="ml-2 bg-yellow-100 px-2 py-1 rounded-full">
                  <Text className="text-yellow-600 text-xs font-medium">Processing...</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Remove Button */}
          {showRemoveButton && (
            <TouchableOpacity
              className="w-8 h-8 bg-red-50 rounded-full justify-center items-center ml-2"
              onPress={() => removeImage(index)}
              disabled={isProcessingImages}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [initialImageIds, isProcessingImages, canRemoveImage]);

  // Optimized gallery item render
  const renderGalleryItem = React.useCallback(({ item }: { item: MediaLibrary.Asset }) => {
    const isSelected = selectedGalleryItems.has(item.id)
    return (
      <TouchableOpacity
        className="flex-1 m-1 aspect-square relative"
        onPress={() => handleGallerySelection(item)}
        disabled={isProcessingImages}
      >
        <Image 
          source={{ uri: item.uri }} 
          className="w-full h-full rounded" 
          resizeMode="cover"
        />
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
        {isProcessingImages && (
          <View className="absolute inset-0 bg-black bg-opacity-20" />
        )}
      </TouchableOpacity>
    )
  }, [selectedGalleryItems, multiple, isProcessingImages]);

  const canSelectMore = multiple && selectedImages?.length < maxImages
  const removableCount = getRemovableImagesCount()

  if (!device) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1778F2" />
        <Text className="mt-2 text-gray-600">Loading camera...</Text>
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
                disabled={isProcessingImages}
              >
                <Text className="text-red-600 text-sm font-medium">
                  {onlyRemoveNewImages ? `Clear New (${removableCount})` : `Clear All`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Optimized List View */}
          <FlatList
            data={selectedImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={10}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>
      ) : (
        <TouchableOpacity
          className="w-full bg-white justify-center rounded-3xl items-center overflow-hidden border-2 border-primaryBlue shadow-lg shadow-blue-500"
          onPress={editable ? openGallery : undefined}
          disabled={isProcessingImages}
        >
          <View className="items-center p-5">
            <View className="bg-blue-50 p-3 rounded-full">
              {isProcessingImages ? (
                <ActivityIndicator size="small" color="#1778F2" />
              ) : (
                <CloudUpload className="text-primaryBlue"/>
              )}
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
            disabled={isProcessingImages}
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
            <TouchableOpacity onPress={() => setGalleryVisible(false)} disabled={isProcessingImages}>
              <Ionicons name="close" size={28} color={isProcessingImages ? "#ccc" : "black"} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">
              Gallery {multiple && `(${selectedGalleryItems.size}/${maxImages})`}
              {isLoadingGallery && " - Loading..."}
            </Text>
            {multiple && selectedGalleryItems.size > 0 ? (
              <TouchableOpacity onPress={confirmGallerySelection} disabled={isProcessingImages}>
                <Text className={`font-semibold ${isProcessingImages ? 'text-gray-400' : 'text-[#1778F2]'}`}>
                  Done
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="w-7" />
            )}
          </View>
          
          {isLoadingGallery ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#1778F2" />
              <Text className="mt-2 text-gray-600">Loading gallery...</Text>
            </View>
          ) : (
            <FlatList
              data={galleryAssets}
              numColumns={3}
              renderItem={renderGalleryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 4 }}
              removeClippedSubviews={true}
              maxToRenderPerBatch={15}
              windowSize={21}
              getItemLayout={(data, index) => ({
                length: 120, // Approximate item height
                offset: 120 * Math.floor(index / 3),
                index,
              })}
            />
          )}
          
          {editable && !isLoadingGallery && (
            <TouchableOpacity
              className="flex-row bg-[#1778F2] p-4 rounded mx-4 my-4 justify-center items-center"
              onPress={takePhoto}
              disabled={!hasPermission || isProcessingImages}
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
            <TouchableOpacity 
              className="absolute top-10 left-5" 
              onPress={closeCamera}
              disabled={isProcessingImages}
            >
              <Ionicons name="arrow-back" size={28} color={isProcessingImages ? "#ccc" : "white"} />
            </TouchableOpacity>

            <TouchableOpacity 
              className="self-center" 
              onPress={capturePhoto}
              disabled={isProcessingImages}
            >
              <View className={`w-16 h-16 rounded-[32px] border-4 border-white bg-transparent ${isProcessingImages ? 'opacity-50' : ''}`}>
                {isProcessingImages && (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
