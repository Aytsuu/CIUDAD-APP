import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Trash2, ShoppingBag, Pill, X, CheckCircle, AlertTriangle } from "lucide-react-native";
import { useGlobalCartState, removeFromCart, clearCart, addUploadedFile, removeUploadedFile, UploadedFile } from "./cart-state";
import { submitMedicineRequest } from "./queries/queries";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useAuth } from "@/contexts/AuthContext";

export default function CartScreen() {
  const { cartItems, uploadedFiles } = useGlobalCartState();
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

  const requiresPrescription = cartItems.some(item => item.med_type === "Prescription");
 const { user } = useAuth(); // ✅ Move here from handleConfirm
  const userId = user?.rp;

 
  if (!userId) {
    Alert.alert("Error", "Please log in to request medicines");
    router.back();
    return null;
  }

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

  const handleMediaSelected = (mediaItems: MediaItem[] | ((prev: MediaItem[]) => MediaItem[])) => {
    // Handle both direct array and functional updates
    if (typeof mediaItems === "function") {
      // For functional updates, we need to get the current uploadedFiles and apply the function
      const currentMediaItems: MediaItem[] = uploadedFiles.map(file => ({
        id: file.id,
        uri: file.uri,
        name: file.name,
        type: file.type,
      }));
      
      const updatedMediaItems = mediaItems(currentMediaItems);
      handleMediaArrayUpdate(updatedMediaItems);
    } else if (Array.isArray(mediaItems)) {
      handleMediaArrayUpdate(mediaItems);
    }
  };

  const handleMediaArrayUpdate = (mediaItems: MediaItem[]) => {
    // Clear all existing uploaded files first
    uploadedFiles.forEach(file => removeUploadedFile(file.id));
    
    // Add new files from the MediaPicker
    const newFiles: UploadedFile[] = mediaItems.map(item => ({
      id: item.id,
      name: item.name || `image_${Date.now()}.jpg`,
      type: item.type || "image/jpeg",
      uri: item.uri,
      size: item.file ? (item.file.length * 3) / 4 : undefined,
    }));
    
    // Filter for valid files and add to global state
    const validFiles = newFiles.filter(file => checkFileSize(file.size, file.name));
    validFiles.forEach(file => addUploadedFile(file));
  };

  const removeFile = (fileId: string) => {
    removeUploadedFile(fileId);
  };

  const getFileIcon = (type: string) => {
    return <Pill size={20} color="#4F46E5" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

 const handleConfirm = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add medicines to your bag before confirming.");
      return;
    }

    const invalidItems = cartItems.filter(item => !item.minv_id || isNaN(item.minv_id));
    if (invalidItems.length > 0) {
      Alert.alert("Invalid Cart", "One or more items are missing a valid minv_id. Please reselect medicines.");
      return;
    }

    if (requiresPrescription && uploadedFiles.length === 0) {
      Alert.alert(
        "Prescription Required",
        "One or more medicines in your cart require a prescription. Please upload a doctor's prescription or consultation image.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const medicineData = cartItems.map(item => ({
        minv_id: item.minv_id,
        quantity: 0,
        reason: item.reason,
        med_type: item.med_type,
      }));
      formData.append("medicines", JSON.stringify(medicineData));

      const rpId = userId;

      if (!rpId) {
        throw new Error("User must have either a patient ID or resident ID.");
      }
      
      if (rpId) {
        console.log("Submitting with rp_id:", rpId);
        formData.append("rp_id", rpId);
      }
      
      uploadedFiles.forEach(file => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      const response = await submitMedicineRequest(formData);
      if (response.success) {
        const orderItems = cartItems.map(item => ({
          id: item.minv_id,
          name: item.name, 
          unit: "pc/s",
          reason: item.reason,
          hasPrescription: item.med_type === "Prescription",
        }));

        Alert.alert("Request Submitted", "Your medicine request has been submitted successfully!", [
          {
            text: "OK",
            onPress: () => {
              clearCart();
              router.push({
                pathname: "/medicine-request/confirmation",
                params: {
                  orderItems: JSON.stringify(orderItems),
                  medreqId: response.medreq_id.toString(),
                  status: "submitted",
                },
              });
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to submit request");
      }
    } catch (error: any) {
      console.log("Submission error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      Alert.alert("Error", error.response?.data?.error || "Failed to submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        <View className="flex-row items-center mb-6 mt-10 border-b border-gray-200 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold text-gray-800">Your Request Bag</Text>
        </View>
        
        {cartItems.length > 0 ? (
          <View className="flex-1">
            <ScrollView 
              className="flex-1 bg-white" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {cartItems.map((item, index) => (
                <View key={item.minv_id} className="bg-white rounded-lg p-6 mb-3 shadow-sm border border-gray-300">
                  <View className="flex-row items-center mb-3">
                    <Pill size={20} color="#3B82F6" />
                    <View className="flex-1 ml-3">
                      <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
                      <Text className="text-sm text-gray-600">{item.category} ({item.med_type})</Text>
                      {item.dosage && <Text className="text-xs text-gray-500">Dosage: {item.dosage}</Text>}
                    </View>
                  </View>
                  {item.reason && (
                    <View className="mt-2 p-2 bg-blue-50 rounded-md">
                      <Text className="text-gray-700 italic text-sm">Reason: {item.reason}</Text>
                    </View>
                  )}
                  {item.med_type === "Prescription" && (
                    <View className="mt-2 p-2 bg-amber-50 rounded-md">
                      <Text className="text-amber-800 text-sm">Prescription Required</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.minv_id)}
                    className="self-end mt-4 flex-row items-center px-3 py-1 bg-red-50 rounded-full"
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text className="text-red-500 ml-1 font-medium">Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Medical Documentation Section */}
              <View className="bg-white rounded-2xl p-6 shadow-md mt-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700 font-semibold">
                    Medical Documentation {requiresPrescription && <Text className="text-red-500">*</Text>}
                  </Text>
                </View>
                
                <Text className="text-gray-500 text-sm mb-4">
                  Upload prescription, doctor's note, or consultation image (JPG, PNG - Max 15MB)
                </Text>

                {/* Warning Message */}
                <View className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex-row items-start">
                  <AlertTriangle size={20} color="#F59E0B" className="mt-0.5" />
                  <View className="ml-3 flex-1">
                    <Text className="text-amber-800 font-semibold text-sm mb-1">Important Notice</Text>
                    <Text className="text-amber-700 text-sm leading-5">
                      Upload only valid prescriptions or any medical records. All documents will be check. False or forged uploads are strictly prohibited.
                    </Text>
                  </View>
                </View>

                {/* MediaPicker - Always displayed like in IRForm */}
                <View className="mb-4">
                  <MediaPicker
                    selectedImages={uploadedFiles.map(file => ({ 
                      id: file.id, 
                      uri: file.uri, 
                      name: file.name, 
                      type: file.type 
                    }))}
                    setSelectedImages={handleMediaSelected}
                    multiple={true}
                    maxImages={5}
                  />
                </View>

                {/* Selected Files List */}
             

                {requiresPrescription && uploadedFiles.length === 0 && (
                  <Text className="text-red-500 text-sm text-center mt-2">
                    * Please upload prescription image to proceed
                  </Text>
                )}
              </View>
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View className="bg-gray-50 pt-4">
              <TouchableOpacity
                className={`py-3 rounded-lg items-center justify-center shadow ${requiresPrescription && uploadedFiles.length === 0 ? "bg-gray-400" : "bg-blue-600"} ${isSubmitting ? "opacity-70" : ""}`}
                onPress={handleConfirm}
                disabled={requiresPrescription && uploadedFiles.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">Confirm Request</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="border border-blue-600 py-3 rounded-lg items-center mt-3"
                onPress={() => router.back()}
                disabled={isSubmitting}
              >
                <Text className="text-blue-600 font-medium text-base">Continue Browsing</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <ShoppingBag size={64} color="#9CA3AF" className="mb-4 opacity-50" />
            <Text className="text-gray-600 font-semibold text-lg mb-4">Your bag is empty</Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg shadow"
              onPress={() => router.back()}
            >
              <Text className="text-white font-medium text-base">Browse Medicines</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}