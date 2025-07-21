"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, Upload, FileText, Camera, X, CheckCircle, AlertCircle, Pill } from "lucide-react-native"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"

import type { Medicine } from "./request-page"
import { addToCart } from "./cart-state"

// Extended Medicine type to include additional details
type ExtendedMedicine = Medicine & {
  dosage?: string
  inStock?: boolean
  requiresPrescription?: boolean
}

type UploadedFile = {
  id: string
  name: string
  type: string
  uri: string
  size?: number
}

export default function MedicineDetailsScreen() {
  const { id } = useLocalSearchParams()
  const [medicine, setMedicine] = useState<ExtendedMedicine | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showUploadOptions, setShowUploadOptions] = useState(false)

  // File size limit: 15MB in bytes
  const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

  // Enhanced mock data for medicines
  const mockMedicines: ExtendedMedicine[] = [
    {
      id: 1,
      name: "Biogesic",
      category: "Paracetamol",
      dosage: "500mg",
      inStock: true,
      requiresPrescription: false,
      description:
        "Biogesic is a brand of paracetamol used to relieve mild to moderate pain such as headache, backache, menstrual pain, toothache, and help reduce fever.",
    },
    {
      id: 2,
      name: "Panadol",
      category: "Paracetamol",
      dosage: "500mg",
      inStock: true,
      requiresPrescription: false,
      description:
        "Panadol is a pain reliever and fever reducer used to temporarily relieve mild to moderate pain and reduce fever.",
    },
    {
      id: 3,
      name: "Calpol",
      category: "Paracetamol",
      dosage: "250mg",
      inStock: false,
      requiresPrescription: false,
      description: "Calpol is a common paracetamol-based pain and fever relief medication for children and infants.",
    },
    {
      id: 4,
      name: "Neozep",
      category: "Cold Medicine",
      dosage: "500mg",
      inStock: true,
      requiresPrescription: false,
      description: "Neozep is a combination medicine used to treat symptoms of the common cold or flu.",
    },
    {
      id: 5,
      name: "Amoxicillin",
      category: "Antibiotics",
      dosage: "250mg",
      inStock: true,
      requiresPrescription: true,
      description: "Amoxicillin is a penicillin antibiotic that fights bacteria in the body.",
    },
    {
      id: 6,
      name: "Cefalexin",
      category: "Antibiotics",
      dosage: "500mg",
      inStock: true,
      requiresPrescription: true,
      description: "Cefalexin is an antibiotic used to treat a number of bacterial infections.",
    },
  ]

  // Find the medicine by ID
  useEffect(() => {
    setIsLoading(true)

    if (id) {
      const foundMedicine = mockMedicines.find((m) => m.id === Number.parseInt(id as string))
      if (foundMedicine) {
        setMedicine(foundMedicine)
        setIsLoading(false)
      } else {
        Alert.alert("Error", "Medicine not found", [{ text: "OK", onPress: () => router.back() }])
      }
    } else {
      Alert.alert("Error", "No medicine selected", [{ text: "OK", onPress: () => router.back() }])
    }
  }, [id])

  // Function to check file size
  const checkFileSize = (fileSize?: number, fileName?: string): boolean => {
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      Alert.alert(
        "File Too Large",
        `The file "${fileName || "selected file"}" is too large. Please select a file smaller than 15MB.`,
        [{ text: "OK" }],
      )
      return false
    }
    return true
  }

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0]

        // Check file size
        if (!checkFileSize(file.size, file.name)) {
          return
        }

        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.mimeType || "unknown",
          uri: file.uri,
          size: file.size,
        }
        setUploadedFiles((prev) => [...prev, newFile])
        setShowUploadOptions(false)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document")
    }
  }

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera roll permissions to upload images.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Removed cropping
        quality: 0.8,
        // Removed aspect ratio since we're not cropping
      })

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0]

        // Check file size (estimate based on dimensions if fileSize not available)
        const estimatedSize = image.fileSize || image.width * image.height * 3 // Rough estimate
        if (!checkFileSize(estimatedSize, `gallery_image_${Date.now()}.jpg`)) {
          return
        }

        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: `prescription_${Date.now()}.jpg`,
          type: "image/jpeg",
          uri: image.uri,
          size: estimatedSize,
        }
        setUploadedFiles((prev) => [...prev, newFile])
        setShowUploadOptions(false)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const handleCameraPicker = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera permissions to take photos.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // Removed cropping
        quality: 0.8,
        // Removed aspect ratio since we're not cropping
      })

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0]

        // Check file size (estimate based on dimensions if fileSize not available)
        const estimatedSize = image.fileSize || image.width * image.height * 3 // Rough estimate
        if (!checkFileSize(estimatedSize, `camera_photo_${Date.now()}.jpg`)) {
          return
        }

        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: `prescription_photo_${Date.now()}.jpg`,
          type: "image/jpeg",
          uri: image.uri,
          size: estimatedSize,
        }
        setUploadedFiles((prev) => [...prev, newFile])
        setShowUploadOptions(false)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo")
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) {
      return <Camera size={20} color="#4F46E5" />
    }
    return <FileText size={20} color="#4F46E5" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleAddToCart = () => {
    if (medicine) {
      if (!reason.trim()) {
        Alert.alert("Required", "Please provide a reason for requesting this medicine")
        return
      }

      if (medicine.requiresPrescription && uploadedFiles.length === 0) {
        Alert.alert(
          "Prescription Required",
          "This medicine requires a prescription. Please upload your doctor's prescription or consultation document.",
        )
        return
      }

      addToCart({
        ...medicine,
        quantity,
        reason,
        uploadedFiles,
      })

      Alert.alert("Success", "Medicine added to your request", [
        { text: "View more", onPress: () => router.back() },
        { text: "View cart", onPress: () => router.push("/medicine-request/cart") },
      ])
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center">
        <View className="bg-white p-6 rounded-2xl shadow-lg">
          <Text className="text-lg font-medium text-gray-700">Loading medicine details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!medicine) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center">
        <View className="bg-white p-6 rounded-2xl shadow-lg items-center">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">Medicine not found</Text>
          <Text className="text-gray-600 text-center mb-4">The requested medicine could not be found.</Text>
          <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-xl" onPress={() => router.back()}>
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-blue-100">
        <TouchableOpacity onPress={() => router.back()} className="mt-10 mr-3">
          <View className="bg-indigo-100 p-3 rounded-full mr-3">
            <ArrowLeft size={24} color="#4F46E5" />
          </View>
        </TouchableOpacity>

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

                <View className="flex-row items-center justify-between mt-3">
                  <Text className="text-sm font-medium">{medicine.category}</Text>

                  <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-2 ${medicine.inStock ? "bg-green-500" : "bg-red-500"}`} />
                    <Text className={`text-sm font-medium ${medicine.inStock ? "text-green-700" : "text-red-700"}`}>
                      {medicine.inStock ? "In Stock" : "Out of Stock"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Prescription Warning */}
            {medicine.requiresPrescription && (
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
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Description</Text>
              <Text className="text-gray-600 leading-6">{medicine.description}</Text>
            </View>
          </View>

          {/* Request Form Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Reason Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-3">Reason for Request</Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 min-h-[120px] text-gray-700 bg-gray-50"
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
                  Medical Documentation {medicine.requiresPrescription && <Text className="text-red-500">*</Text>}
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
              className={`py-4 rounded-xl items-center ${medicine.inStock ? "bg-green-600" : "bg-gray-400"}`}
              onPress={handleAddToCart}
              disabled={!medicine.inStock}
            >
              <Text className="text-white font-bold text-lg">
                {medicine.inStock ? "Add to Request" : "Out of Stock"}
              </Text>
            </TouchableOpacity>

            {medicine.requiresPrescription && uploadedFiles.length === 0 && (
              <Text className="text-red-500 text-sm text-center mt-2">
                * Please upload prescription document to proceed
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
