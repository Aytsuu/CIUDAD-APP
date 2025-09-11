// request-detail.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Download, CheckCircle, XCircle, Clock, User, Pill } from "lucide-react-native";
import { useUpdateRequestStatus } from "./restful-api";



export default function RequestDetailScreen() {
  const { medreqId } = useLocalSearchParams();
  const { data: request, isLoading, refetch } = useMedicineRequestDetail(medreqId as string);
  const updateStatusMutation = useUpdateRequestStatus();

  const handleStatusUpdate = (newStatus: string, doctorNotes?: string) => {
    Alert.alert(
      "Confirm Status Change",
      `Are you sure you want to change the status to ${newStatus.replace(/_/g, ' ')}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            updateStatusMutation.mutate(
              { 
                medreq_id: parseInt(medreqId as string), 
                status: newStatus,
                doctor_notes: doctorNotes 
              },
              {
                onSuccess: () => {
                  refetch();
                  Alert.alert("Success", "Status updated successfully");
                },
                onError: (error) => {
                  Alert.alert("Error", "Failed to update status");
                }
              }
            );
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-10 border-b border-gray-200 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold text-gray-800">
            Request #{request.medreq_id}
          </Text>
        </View>

        <ScrollView>
          {/* Patient Info */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
            <View className="flex-row items-center mb-3">
              <User size={20} color="#4F46E5" />
              <Text className="ml-2 font-semibold text-gray-800">Patient Information</Text>
            </View>
            <Text className="text-gray-600">
              {request.pat_id ? `Patient ID: ${request.pat_id}` : `Resident ID: ${request.rp_id}`}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Requested: {new Date(request.requested_at).toLocaleString()}
            </Text>
          </View>

          {/* Medicines List */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
            <Text className="font-semibold text-gray-800 mb-3">Medicines Requested</Text>
            {request.items?.map((item: any) => (
              <View key={item.medreqitem_id} className="flex-row justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Pill size={16} color="#4F46E5" />
                    <Text className="ml-2 font-medium text-gray-800">{item.minv_id.med_id.med_name}</Text>
                  </View>
                  <Text className="text-gray-600 text-sm ml-6">
                    Dosage: {item.minv_id.minv_dsg} {item.minv_id.minv_dsg_unit}
                  </Text>
                  {item.reason && (
                    <Text className="text-gray-500 text-sm ml-6 italic">
                      Reason: {item.reason}
                    </Text>
                  )}
                </View>
                <Text className="text-gray-600">Qty: {item.medreqitem_qty}</Text>
              </View>
            ))}
          </View>

          {/* Prescription Files */}
          {request.items?.[0]?.medicine_files?.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
              <Text className="font-semibold text-gray-800 mb-3">Prescription Documents</Text>
              {request.items[0].medicine_files.map((file: any) => (
                <TouchableOpacity 
                  key={file.medf_id}
                  onPress={() => {/* Handle file download */}}
                  className="flex-row items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <View className="flex-row items-center flex-1">
                    <Download size={16} color="#4F46E5" />
                    <Text className="ml-2 text-gray-600 flex-1" numberOfLines={1}>
                      {file.medf_name}
                    </Text>
                  </View>
                  <Text className="text-blue-500 text-sm">View</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Status Actions */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <Text className="font-semibold text-gray-800 mb-3">Update Status</Text>
            
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity 
                onPress={() => handleStatusUpdate('confirmed')}
                className="flex-row items-center bg-green-100 px-3 py-2 rounded-lg"
              >
                <CheckCircle size={16} color="#10B981" />
                <Text className="text-green-700 font-medium ml-1">Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleStatusUpdate('referred_to_doctor')}
                className="flex-row items-center bg-amber-100 px-3 py-2 rounded-lg"
              >
                <Clock size={16} color="#F59E0B" />
                <Text className="text-amber-700 font-medium ml-1">Refer to Doctor</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleStatusUpdate('declined')}
                className="flex-row items-center bg-red-100 px-3 py-2 rounded-lg"
              >
                <XCircle size={16} color="#EF4444" />
                <Text className="text-red-700 font-medium ml-1">Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function useMedicineRequestDetail(arg0: string): { data: any; isLoading: any; refetch: any; } {
    throw new Error("Function not implemented.");
}
