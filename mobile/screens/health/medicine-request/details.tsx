import { useState, useMemo } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, AlertCircle, Pill } from "lucide-react-native"
import { addToCart, Medicine as CartMedicineType } from "./cart-state"

// The medicine type received from request-page.tsx
type MedicineDetailsProps = {
  minv_id: number;
  name: string;
  category: string;
  med_type: string; // "Prescription" or "Over-the-Counter"
  dosage: string;
  description?: string;
  availableStock: number; // Available stock
};

export default function MedicineDetailsScreen() {
  const params = useLocalSearchParams();
  const medicine: MedicineDetailsProps | null = useMemo(() => {
     if (params.medicineData) {
      try {
        const parsed = JSON.parse(params.medicineData as string);
        console.log("🔍 Parsed Medicine Data:", parsed); // Debug log
        return parsed;
      } catch (e) {
        console.error("Failed to parse medicineData param:", e);
        return null;
      }
    }
    return null;
  }, [params.medicineData]);


  const [reason, setReason] = useState("");

  // Check if prescription is required based on med_type
  const requiresPrescription = medicine?.med_type === 'Prescription';
  
   const handleAddToCart = () => {
    if (!medicine) return;

    // Add validation for minv_id
    if (!medicine.minv_id) {
      Alert.alert("Error", "This medicine is not properly configured. Please select another medicine.");
      return;
    }

    if (!reason.trim()) {
      Alert.alert("Required Field", "Please provide a reason for requesting this medicine.");
      return;
    }

    // Add to cart with full details
    const itemToAdd: CartMedicineType = {
      minv_id: medicine.minv_id,
      name: medicine.name,
      category: medicine.category,
      med_type: medicine.med_type,
      dosage: medicine.dosage,
      description: medicine.description,
      availableStock: medicine.availableStock,
      reason: reason,
    };

    addToCart(itemToAdd);
    console.log("➕ Adding to cart:", itemToAdd);
    
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
                  This medicine requires a prescription. You will need to upload a doctor's prescription or consultation document in the cart.
                </Text>
              </View>
            )}
          </View>

          {/* Request Form Card */}
          <View className="bg-white rounded-2xl p-6 shadow-md">
            {/* Reason Input */}
             <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Reason for Request *</Text>
              <Text className="text-red-600 text-sm mb-3 italic">
                Please describe your symptoms or medical condition requiring this medicine. 
                Be specific and truthful for proper evaluation.
              </Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 min-h-[120px] text-gray-700 bg-white"
                placeholder="Example: I have been experiencing fever and headache for 2 days. Temperature is 38.5°C..."
                multiline
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
              
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${medicine.availableStock > 0 ? "bg-[#2563EB]" : "bg-gray-400"}`}
              onPress={handleAddToCart}
              disabled={medicine.availableStock === 0}
            >
              <Text className="text-white font-bold text-lg">
                {medicine.availableStock > 0 ? "Add to Request" : "Out of Stock"}
              </Text>
            </TouchableOpacity>

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