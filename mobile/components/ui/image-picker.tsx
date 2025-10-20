import React, { useState } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  Text
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CloudUpload } from "@/lib/icons/CloudUpload";
import { Ionicons } from "@expo/vector-icons";

export interface MediaItem {
  uri: string
  id: string
  name?: string
  type?: string
  file?: string
}

export default function MediaPicker({
  selectedImages = [],
  setSelectedImages,
  limit = 1,
}: {
  selectedImages?: MediaItem[];
  setSelectedImages?: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  limit?: number;
}) {
  // const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // React.useEffect(() => {
  //   setImages(selectedImages)
  // }, [selectedImages])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: limit == 1,
      aspect: [4, 3],
      quality: 1,
      selectionLimit: limit,
      allowsMultipleSelection: limit > 1,
      base64: true,
    });

    // console.log(result)
    // if (!result.canceled) {
    //   setImages(result.assets);
    // }

    if (result && !result.canceled) {
      setSelectedImages &&
        setSelectedImages(
          result.assets?.map((media: ImagePicker.ImagePickerAsset) => ({
            uri: media.uri,
            name: `media_${media.fileName?.split(".")[0] || "image"}_${Date.now()}.${
              media.mimeType?.split("/")[1] || "jpg"
            }`,
            type: media.mimeType || "image/jpeg",
            file: media.base64,
          })) as any
        );
    }
  };

  const handleClear = () => {
    setSelectedImages && setSelectedImages([])
    // setImages([])
  }

  const handleRemoveSelection = (name: string) => {
    setSelectedImages && setSelectedImages(selectedImages.filter((image: any) => image.name !== name))
    // setImages(images.filter((image: any) => image.uri !== uri))
  }

  const renderImageItem = React.useCallback(
    ({ item, index }: { item: any; index: number }) => {
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
            </View>

            {/* Image Info */}
            <View className="flex-1">
              <Text
                className="text-gray-800 font-medium text-sm"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-gray-500 text-xs">
                  {item.type || "image/jpeg"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="w-8 h-8 bg-red-50 rounded-full justify-center items-center ml-2"
              onPress={() => handleRemoveSelection(item.name)}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [selectedImages]
  );

  return (
    <View className="flex-1">
      {selectedImages?.length > 0 ? (
        <View className="flex-1">
          {/* Header with count and clear button */}
          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity
              className="bg-red-50 px-3 py-1.5 rounded-full"
              onPress={handleClear}
            >
              <Text className="text-red-600 text-sm font-medium">
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          {/* Optimized List View */}
          <FlatList
            data={selectedImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `${item.name}_${index}`}
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
          onPress={pickImage}
        >
          <View className="items-center p-5">
            <View className="bg-blue-50 p-3 rounded-full">
                <CloudUpload className="text-primaryBlue" />
            </View>
            <Text className="text-gray-700 text-[12px] mt-2">
              <Text className="text-primaryBlue font-medium">
                Click here {""}
              </Text>
              to upload your {limit > 1 ? "photos" : "photo"}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

