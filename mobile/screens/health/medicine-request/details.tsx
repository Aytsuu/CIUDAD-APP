import { useState, useEffect, useMemo } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, Upload, FileText, Camera, X, CheckCircle, AlertCircle, Pill, Plus, Minus } from "lucide-react-native"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"

import { addToCart, Medicine as CartMedicineType, UploadedFile, useGlobalCartState } from "./cart-state" // Import types and addToCart

// The medicine type received from request-page.tsx
type MedicineDetailsProps = {
  id: number;
  name: string;
  category: string;
  medicine_type: string; // "Prescription" or "Over-the-Counter"
  dosage: string;
  description?: string;
  availableStock: number; // Available stock
};


export default function MedicineDetailsScreen() {
  const params = useLocalSearchParams();
  // Parse the medicineData string back into an object
  const medicine: MedicineDetailsProps | null = useMemo(() => {
    if (params.medicineData) {
      try {
        return JSON.parse(params.medicineData as string);
      } catch (e) {
        console.error("Failed to parse medicineData param:", e);
        return null;
      }
    }
    return null;
  }, [params.medicineData]);


  // const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

  // Check if prescription is required based on medicine_type
  const requiresPrescription = medicine?.medicine_type === 'Prescription';

  // Quantity handlers
  // const increaseQuantity = () => {
  //   if (medicine && quantity < medicine.minv_qty_avail) {
  //     setQuantity(prev => prev + 1);
  //   }
  // };

  // const decreaseQuantity = () => {
  //   if (quantity > 1) {
  //     setQuantity(prev => prev - 1);
  //   }
  // };

  // Function to check file size
  const checkFileSize = (fileSize?: number, fileName?: string): boolean => {
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      Alert.alert(
        "File Too Large",
        `The file "${fileName || "selected file"}" is too large. Please select a file smaller than 15MB.`,
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        if (!checkFileSize(file.size, file.name)) {
          return;
        }

        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.mimeType || "unknown",
          uri: file.uri,
          size: file.size,
        };
        setUploadedFiles((prev) => [...prev, newFile]);
        setShowUploadOptions(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera roll permissions to upload images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        const estimatedSize = image.fileSize || image.width * image.height * 3;
        if (!checkFileSize(estimatedSize, `gallery_image_${Date.now()}.jpg`)) {
          return;
        }

        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: `prescription_${Date.now()}.jpg`,
          type: "image/jpeg",
          uri: image.uri,
          size: estimatedSize,
        };
        setUploadedFiles((prev) => [...prev, newFile]);
        setShowUploadOptions(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleCameraPicker = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera permissions to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        const estimatedSize = image.fileSize || image.width * image.height * 3;
        if (!checkFileSize(estimatedSize, `camera_photo_${Date.now()}.jpg`)) {
          return;
        }

        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: `prescription_photo_${Date.now()}.jpg`,
          type: "image/jpeg",
          uri: image.uri,
          size: estimatedSize,
        };
        setUploadedFiles((prev) => [...prev, newFile]);
        setShowUploadOptions(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image")) {
      return <Camera size={20} color="#4F46E5" />;
    }
    return <FileText size={20} color="#4F46E5" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleAddToCart = () => {
    if (!medicine) return; // Should not happen if medicine is loaded

    if (!reason.trim()) {
      Alert.alert("Required Field", "Please provide a reason for requesting this medicine.");
      return;
    }

    if (requiresPrescription && uploadedFiles.length === 0) {
      Alert.alert(
        "Prescription Required",
        "This medicine requires a prescription. Please upload your doctor's prescription or consultation document to proceed.",
      );
      return;
    }

    // if (quantity === 0) {
    //     Alert.alert("Quantity Error", "Please select a quantity greater than 0.");
    //     return;
    // }
    // if (quantity > medicine.minv_qty_avail) {
    //     Alert.alert("Stock Error", `You can only request up to ${medicine.minv_qty_avail} of this medicine.`);
    //     return;
    // }

    // Add to cart with full details
    const itemToAdd: CartMedicineType = {
      id: medicine.id,
      name: medicine.name,
      category: medicine.category,
      medicine_type: medicine.medicine_type,
      dosage: medicine.dosage,
      description: medicine.description,
      minv_qty_avail: medicine.availableStock,
      reason: reason,
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,

    };

    addToCart(itemToAdd);

    Alert.alert("Success", "Medicine added to your request", [
      { text: "Continue Browsing", onPress: () => router.back() },
      { text: "View Cart", onPress: () => router.push("/medicine-request/cart") },
    ]);
  };


  if (!medicine) {
    // This state indicates medicineData was not passed correctly or could not be parsed
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center">
        <View className="bg-white p-6 rounded-2xl shadow-lg items-center">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">Medicine details not found</Text>
          <Text className="text-gray-600 text-center mb-4">Please select a medicine from the list.</Text>
          <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-xl" onPress={() => router.back()}>
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="flex-row items-center p-4 mt-10 bg-white border-b border-gray-100">
            <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                <ArrowLeft size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800 flex-1">Medicine Details</Text>
        </View>

        <View className="px-4 pt-6 pb-6">
          {/* Medicine Info Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            {/* Medicine Header */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <View className="bg-indigo-100 p-3 rounded-full mr-3">
                    <Pill size={24} color="#4F46E5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-800">{medicine.name}</Text>
                    <Text className="text-gray-500">{medicine.dosage}</Text>
                  </View>
                </View>

                {/* <View className="flex-row items-center justify-between mt-3">
                  <Text className="text-sm font-medium">{medicine.category}</Text>
                  <Text className="text-sm font-medium text-gray-700">Type: {medicine.medicine_type}</Text>
                </View> */}

                
                {/* <View className="flex-row items-center mt-2">
                    <View className={`w-2 h-2 rounded-full mr-2 ${medicine.minv_qty_avail > 0 ? "bg-green-500" : "bg-red-500"}`} />
                    <Text className={`text-sm font-medium ${medicine.minv_qty_avail > 0 ? "text-green-700" : "text-red-700"}`}>
                        {medicine.minv_qty_avail > 0 ? `${medicine.minv_qty_avail} in stock` : "Out of Stock"}
                    </Text>
                </View> */}
              </View>
            </View>

            {/* Prescription Warning */}
            {requiresPrescription && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <View className="flex-row items-center">
                  <AlertCircle size={20} color="#F59E0B" />
                  <Text className="text-amber-800 font-medium ml-2">Prescription Required</Text>
                </View>
                <Text className="text-amber-700 text-sm mt-1">
                  This medicine requires a valid prescription or doctor's consultation document.
                </Text>
              </View>
            )}

            {/* Description */}
            {/* {medicine.description && (
                <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Description</Text>
                <Text className="text-gray-600 leading-6">{medicine.description}</Text>
                </View>
            )} */}
          </View>

          {/* Request Form Card */}
          <View className="bg-white rounded-2xl p-6 shadow-md">
            {/* Quantity Selector */}
            {/* <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-3">Quantity</Text>
                <View className="flex-row items-center justify-center border border-gray-200 rounded-xl p-2 bg-gray-50">
                    <TouchableOpacity
                        onPress={decreaseQuantity}
                        disabled={quantity <= 1}
                        className={`p-2 rounded-lg ${quantity <= 1 ? 'bg-gray-200' : 'bg-blue-100'}`}
                    >
                        <Minus size={20} color={quantity <= 1 ? '#9CA3AF' : '#263D67'} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-800 mx-4 w-12 text-center">
                        {quantity}
                    </Text>
                    <TouchableOpacity
                        onPress={increaseQuantity}
                        disabled={!medicine.minv_qty_avail || quantity >= medicine.minv_qty_avail}
                        className={`p-2 rounded-lg ${!medicine.minv_qty_avail || quantity >= medicine.minv_qty_avail ? 'bg-gray-200' : 'bg-blue-100'}`}
                    >
                        <Plus size={20} color={!medicine.minv_qty_avail || quantity >= medicine.minv_qty_avail ? '#9CA3AF' : '#263D67'} />
                    </TouchableOpacity>
                </View>
                {medicine.minv_qty_avail === 0 && (
                    <Text className="text-red-500 text-sm text-center mt-2">Currently out of stock.</Text>
                )}
                {quantity > medicine.minv_qty_avail && medicine.minv_qty_avail > 0 && (
                    <Text className="text-red-500 text-sm text-center mt-2">Cannot request more than available stock ({medicine.minv_qty_avail}).</Text>
                )}
            </View> */}


            {/* Reason Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-3">Reason for Request</Text>
              <TextInput
                className="border border-gray-100 rounded-xl p-4 min-h-[120px] text-gray-700 bg-gray-50"
                placeholder="Please describe your symptoms or reason for requesting this medicine..."
                multiline
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
            </View>

            {/* File Upload Section */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 font-semibold">
                  Medical Documentation {requiresPrescription && <Text className="text-red-500">*</Text>}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowUploadOptions(!showUploadOptions)}
                  className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center"
                >
                  <Upload size={16} color="#fff" />
                  <Text className="text-white font-medium ml-2">Upload</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-gray-500 text-sm mb-4">
                Upload prescription, doctor's note, or consultation receipt (JPG, PNG, PDF - Max 15MB)
              </Text>

              {/* Upload Options */}
              {showUploadOptions && (
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <TouchableOpacity
                    onPress={handleCameraPicker}
                    className="flex-row items-center py-3 border-b border-gray-200"
                  >
                    <Camera size={20} color="#4F46E5" />
                    <Text className="ml-3 text-gray-700 font-medium">Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleImagePicker}
                    className="flex-row items-center py-3 border-b border-gray-200"
                  >
                    <Upload size={20} color="#4F46E5" />
                    <Text className="ml-3 text-gray-700 font-medium">Choose from Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleDocumentPicker} className="flex-row items-center py-3">
                    <FileText size={20} color="#4F46E5" />
                    <Text className="ml-3 text-gray-700 font-medium">Upload Document (PDF)</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <View className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <View
                      key={file.id}
                      className="bg-green-50 border border-green-200 rounded-xl p-4 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1">
                        {getFileIcon(file.type)}
                        <View className="ml-3 flex-1">
                          <Text className="text-gray-800 font-medium" numberOfLines={1}>
                            {file.name}
                          </Text>
                          <Text className="text-gray-500 text-sm">{formatFileSize(file.size)}</Text>
                        </View>
                        <CheckCircle size={20} color="#10B981" />
                      </View>
                      <TouchableOpacity onPress={() => removeFile(file.id)} className="ml-3 p-1">
                        <X size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${medicine.availableStock > 0 ? "bg-indigo-600" : "bg-gray-400"}`}
              onPress={handleAddToCart}
              disabled={medicine.availableStock === 0 || (requiresPrescription && uploadedFiles.length === 0)}
            >
              <Text className="text-white font-bold text-lg">
                {medicine.availableStock > 0 ? "Add to Request" : "Out of Stock"}
              </Text>
            </TouchableOpacity>

            {requiresPrescription && uploadedFiles.length === 0 && (
              <Text className="text-red-500 text-sm text-center mt-2">
                * Please upload prescription document to proceed
              </Text>
            )}
            {!reason.trim() && (
                <Text className="text-red-500 text-sm text-center mt-3">
                    * Reason for request is required.
                </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}