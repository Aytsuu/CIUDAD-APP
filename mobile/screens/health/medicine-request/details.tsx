"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, Minus, Plus } from "lucide-react-native"

import type { Medicine } from "./request-page"
import { addToCart } from "./cart-state"

export default function MedicineDetailsScreen() {
  const { id } = useLocalSearchParams()
  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for medicines (same as in index.tsx)
  const mockMedicines: Medicine[] = [
    {
      id: 1,
      name: "Biogesic",
      category: "Paracetamol",
      description:
        "Biogesic is a brand of paracetamol used to relieve mild to moderate pain such as headache, backache, menstrual pain, toothache, and help reduce fever.",
    },
    {
      id: 2,
      name: "Panadol",
      category: "Paracetamol",
      description:
        "Panadol is a pain reliever and fever reducer used to temporarily relieve mild to moderate pain and reduce fever.",
    },
    {
      id: 3,
      name: "Calpol",
      category: "Paracetamol",
      description: "Calpol is a common paracetamol-based pain and fever relief medication for children and infants.",
    },
    {
      id: 4,
      name: "Neozep",
      category: "Paracetamol",
      description: "Neozep is a combination medicine used to treat symptoms of the common cold or flu.",
    },
    {
      id: 5,
      name: "Amoxicillin",
      category: "Antibiotics",
      description: "Amoxicillin is a penicillin antibiotic that fights bacteria in the body.",
    },
    {
      id: 6,
      name: "Cefalexin",
      category: "Antibiotics",
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
        // Handle medicine not found
        Alert.alert("Error", "Medicine not found", [{ text: "OK", onPress: () => router.back() }])
      }
    } else {
      // Handle missing ID
      Alert.alert("Error", "No medicine selected", [{ text: "OK", onPress: () => router.back() }])
    }
  }, [id])

  const handleAddToCart = () => {
    if (medicine) {
      if (!reason.trim()) {
        Alert.alert("Required", "Please provide a reason for requesting this medicine")
        return
      }

      addToCart({
        ...medicine,
        quantity,
        reason,
      })

      Alert.alert("Success", "Medicine added to your bag", [{ text: "OK", onPress: () => router.back() }])
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#ECF8FF] justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    )
  }

  if (!medicine) {
    return (
      <SafeAreaView className="flex-1 bg-[#ECF8FF] justify-center items-center">
        <Text>Medicine not found</Text>
        <TouchableOpacity className="mt-4 bg-[#263D67] px-4 py-2 rounded-lg" onPress={() => router.back()}>
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ECF8FF]">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-medium">Back</Text>
        </View>

        {/* Medicine Details Card */}
        <View className="bg-white rounded-lg p-6 shadow-md">
          {/* Medicine Name */}
          <Text className="text-xl font-bold text-[#263D67] mb-4">{medicine.name}</Text>

          {/* Description */}
          <Text className="text-gray-700 mb-6">{medicine.description}</Text>

          {/* Quantity Selector */}
          <View className="mb-6">
            <Text className="text-[#263D67] font-semibold mb-2">Quantity</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="bg-[#E2EEFF] w-10 h-10 rounded-md items-center justify-center"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={20} color="#263D67" />
              </TouchableOpacity>

              <Text className="mx-4 text-lg font-semibold">{quantity}</Text>

              <TouchableOpacity
                className="bg-[#E2EEFF] w-10 h-10 rounded-md items-center justify-center"
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={20} color="#263D67" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reason Input */}
          <View className="mb-6">
            <Text className="text-[#263D67] font-semibold mb-2">Reason</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 min-h-[100px] text-gray-700"
              placeholder="Enter reason for requesting this medicine"
              multiline
              value={reason}
              onChangeText={setReason}
            />
          </View>

          {/* Add Button */}
          <TouchableOpacity className="bg-green-500 py-3 rounded-lg items-center" onPress={handleAddToCart}>
            <Text className="text-white font-bold text-lg">Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

