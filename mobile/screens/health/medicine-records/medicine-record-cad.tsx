import React, { useState } from "react";
import { View, Image, TouchableOpacity, Linking, Platform, Modal } from "react-native";
import { Text } from "@/components/ui/text";
import { Pill, FileText, Calendar, Clock, X, CheckCircle2, AlertCircle } from "lucide-react-native";
import { format, parseISO, isValid } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const getStatusColor = () => {
    return record.status === "completed" 
      ? "bg-emerald-50 text-emerald-000 border-emerald-200" 
      : "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusIcon = () => {
    return record.status === "completed" 
      ? <CheckCircle2 size={14} color="#059669" /> 
      : <AlertCircle size={14} color="#D97706" />;
  };

  const renderSignature = () => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return null;
    }

    if (!record.medreq_details?.signature) {
      return (
        <View className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <Text className="text-slate-400 text-xs text-center">No signature available</Text>
        </View>
      );
    }

    const signatureUri = `data:image/png;base64,${record.medreq_details.signature}`;
    return (
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className="bg-slate-50 rounded-lg p-3 border border-slate-200"
      >
        <Image
          source={{ uri: signatureUri }}
          style={{ width: "100%", height: 60, resizeMode: "contain" }}
        />
      </TouchableOpacity>
    );
  };

  const renderFiles = () => {
    if (!record.medicine_files || record.medicine_files.length === 0) {
      return (
        <View className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <Text className="text-slate-400 text-xs text-center">No files attached</Text>
        </View>
      );
    }
    return (
      <View className="space-y-2">
        {record.medicine_files.map((file, index) => (
          <TouchableOpacity
            key={file.medf_id}
            onPress={() => Linking.openURL(file.medf_url)}
            className="flex-row items-center bg-blue-50 rounded-lg p-3 border border-blue-200"
          >
            <View className="bg-blue-600 rounded-md p-1.5">
              <FileText size={14} color="#FFFFFF" />
            </View>
            <Text className="text-blue-700 text-xs ml-2 flex-1 font-medium" numberOfLines={1}>
              {file.medf_name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <>
      <Card className="mb-3 border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 flex-row items-start mr-2">
              <View className="bg-blue-600 rounded-full p-2 mr-3">
                <Pill size={18} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900 leading-tight">
                  {record.med_details.med_name}
                </Text>
                <Text className="text-xs text-slate-600 mt-0.5">
                  {record.med_details.med_dsg}{record.med_details.med_dsg_unit} · {record.med_details.med_form}
                </Text>
              </View>
            </View>
            <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${getStatusColor()}`}>
              {getStatusIcon()}
              <Text className="text-xs text-emerald-700 font-semibold ml-1 capitalize">
                {record.status}
              </Text>
            </View>
          </View>
        </CardHeader>

        <CardContent className="pt-4 gap-2">
          {/* Info Grid */}
          <View className="gap-2">
            <View className="flex-row">
              <View className="flex-1 bg-slate-50 rounded-lg p-3 mr-1.5 border border-slate-200">
                <Text className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-1">Category</Text>
                <Text className="text-sm text-slate-900 font-semibold">{record.med_details.catlist}</Text>
              </View>
              <View className="flex-1 bg-slate-50 rounded-lg p-3 ml-1.5 border border-slate-200">
                <Text className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-1">Quantity</Text>
                <Text className="text-sm text-slate-900 font-semibold">{record.total_allocated_qty}</Text>
              </View>
            </View>

            {record.reason && (
              <View className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <Text className="text-[10px] text-amber-700 font-medium uppercase tracking-wide mb-1">Reason</Text>
                <Text className="text-xs text-amber-900">{record.reason}</Text>
              </View>
            )}
          </View>

          {/* Timeline */}
          <View className="gap-2">
            <View className="flex-row items-center bg-slate-50 rounded-lg p-3 border border-slate-200">
              <View className="bg-slate-600 rounded-full p-1.5 mr-3">
                <Calendar size={12} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-slate-500 font-medium">REQUESTED</Text>
                <Text className="text-xs text-slate-900 font-semibold mt-0.5">
                  {formatDate(record.medreq_details.requested_at)}
                </Text>
              </View>
            </View>

            <View className={`flex-row items-center rounded-lg p-3 border ${
              record.fulfilled_at 
                ? "bg-emerald-50 border-emerald-200" 
                : "bg-slate-50 border-slate-200"
            }`}>
              <View className={`rounded-full p-1.5 mr-3 ${
                record.fulfilled_at ? "bg-emerald-600" : "bg-slate-400"
              }`}>
                <Clock size={12} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className={`text-[10px] font-medium ${
                  record.fulfilled_at ? "text-emerald-700" : "text-slate-500"
                }`}>
                  FULFILLED
                </Text>
                <Text className={`text-xs font-semibold mt-0.5 ${
                  record.fulfilled_at ? "text-emerald-900" : "text-slate-400"
                }`}>
                  {record.fulfilled_at ? formatDate(record.fulfilled_at) : "Pending"}
                </Text>
              </View>
            </View>
          </View>

          {/* Signature Section (Mobile Only) */}
          {(Platform.OS === "ios" || Platform.OS === "android") && (
            <View>
              <Text className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-2">
                Signature
              </Text>
              {renderSignature()}
            </View>
          )}

          {/* Files Section */}
          <View>
            <Text className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-2">
              Attached Files
            </Text>
            {renderFiles()}
          </View>
        </CardContent>
      </Card>

      {/* Modal for Enlarged Signature */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <View className="bg-slate-100 px-4 py-3 flex-row justify-between items-center border-b border-slate-200">
              <Text className="text-base font-bold text-slate-900">Signature</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="bg-slate-200 rounded-full p-1.5"
              >
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>
            <View className="p-4 bg-white">
              <Image
                source={{ uri: `data:image/png;base64,${record.medreq_details?.signature}` }}
                style={{ width: "100%", height: 200, resizeMode: "contain" }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}