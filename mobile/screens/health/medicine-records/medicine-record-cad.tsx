import React, { useState } from "react";
import { View, Image, TouchableOpacity, Linking, Platform, Modal } from "react-native";
import { Text } from "@/components/ui/text";
import { Pill, FileText, Calendar, Clock, X } from "lucide-react-native";
import { format, parseISO, isValid } from "date-fns";

interface MedicineRecord {
  medreqitem_id: number;
  total_allocated_qty: number;
  reason: string;
  status: string;
  created_at: string;
  fulfilled_at: string | null;
  med_details: {
    med_name: string;
    catlist: string;
    med_dsg: number;
    med_dsg_unit: string;
    med_form: string;
  };
  medreq_details: {
    requested_at: string;
    signature: string | null;
  };
  medicine_files: Array<{
    medf_id: number;
    medf_name: string;
    medf_type: string;
    medf_url: string;
    created_at: string;
  }>;
}

interface MedicineRecordCardProps {
  record: MedicineRecord;
}

export function MedicineRecordCard({ record }: MedicineRecordCardProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid Date";
    } catch {
      return "Invalid Date";
    }
  };

  const renderSignature = () => {
    // Only render signature on mobile platforms (iOS/Android)
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return null; // Do not show signature on web
    }

    if (!record.medreq_details?.signature) {
      return (
        <Text className="text-gray-500 text-sm italic">No signature</Text>
      );
    }

    // Construct data URL for base64-encoded signature
    const signatureUri = `data:image/png;base64,${record.medreq_details.signature}`;
    return (
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Image
          source={{ uri: signatureUri }}
          style={{ width: 100, height: 50, resizeMode: "contain" }}
          className="mt-2"
        />
      </TouchableOpacity>
    );
  };

  const renderFiles = () => {
    if (!record.medicine_files || record.medicine_files.length === 0) {
      return (
        <Text className="text-gray-500 text-sm italic">No files</Text>
      );
    }
    return record.medicine_files.map((file) => (
      <TouchableOpacity
        key={file.medf_id}
        onPress={() => Linking.openURL(file.medf_url)}
        className="flex-row items-center mt-2"
      >
        <FileText size={16} color="#3B82F6" />
        <Text className="text-blue-600 underline text-sm ml-2 truncate">
          {file.medf_name}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <>
      <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
        <View className="flex-col">
          {/* Header: Medicine Name and Status */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Pill size={20} color="#3B82F6" />
              <Text className="ml-2 text-base font-semibold text-gray-900 truncate">
                {record.med_details.med_name} ({record.med_details.med_dsg}{record.med_details.med_dsg_unit})
              </Text>
            </View>
            <Text
              className={`text-sm font-medium ${
                record.status === "completed" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {record.status}
            </Text>
          </View>

          {/* Two-Column Row: Category and Form */}
          <View className="flex-row justify-between mb-2">
            <View className="flex-1 mr-2">
              <Text className="text-gray-600 text-sm">
                <Text className="font-medium text-black">Category: </Text>
                {record.med_details.catlist}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">
                <Text className="font-medium text-black">Form: </Text>
                {record.med_details.med_form}
              </Text>
            </View>
          </View>

          {/* Two-Column Row: Quantity and Reason */}
          <View className="flex-row justify-between mb-2">
            <View className="flex-1 mr-2">
              <Text className="text-gray-600 text-sm">
                <Text className="font-medium text-black">Qty: </Text>
                {record.total_allocated_qty}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm truncate">
                <Text className="font-medium text-black">Reason: </Text>
                {record.reason || "No reason provided"}
              </Text>
            </View>
          </View>

          {/* Requested and Fulfilled Dates */}
          <View className="mt-2 flex-row items-center">
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Requested: {formatDate(record.medreq_details.requested_at)}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center">
            <Clock size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Fulfilled: {record.fulfilled_at ? formatDate(record.fulfilled_at) : "Not yet fulfilled"}
            </Text>
          </View>

          {/* Signature Section (Mobile Only) */}
          {(Platform.OS === "ios" || Platform.OS === "android") && (
            <View className="mt-2">
              <Text className="text-gray-600 text-sm font-medium">Signature:</Text>
              {renderSignature()}
            </View>
          )}

          {/* Files Section */}
          <View className="mt-2">
            <Text className="text-gray-600 text-sm font-medium">Files:</Text>
            {renderFiles()}
          </View>
        </View>
      </View>

      {/* Modal for Enlarged Signature View */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-xl p-4 w-[90%] max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">Signature</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: `data:image/png;base64,${record.medreq_details?.signature}` }}
              style={{ width: "100%", height: 200, resizeMode: "contain" }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}