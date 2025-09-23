import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, Alert, ScrollView, Modal, Image } from "react-native";
import { Search, ChevronLeft, AlertCircle, User, Calendar, FileText, Pill, RefreshCw, Plus, Download, ChevronRight, MapPin, Clock, X, ArrowLeft, ArrowRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";

import { localDateFormatter } from "@/helpers/localDateFormatter";
import { SignatureModal } from "../components/signature-modal";
import {DocumentModal} from "../components/document-modal";



export const MedicineRecordCard: React.FC<{
    record: any;
  }> = ({ record }) => {
    const [docModalVisible, setDocModalVisible] = useState(false);
    const [sigModalVisible, setSigModalVisible] = useState(false);
    const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  
    const handleDocumentPress = (index: number) => {
      setSelectedDocIndex(index);
      setDocModalVisible(true);
    };
  
    return (
      <View className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm">
        {/* Header */}
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1">
                <View className="w-10 h-10 bg-blue-50 border border-blue-500 rounded-full items-center justify-center mr-3 shadow-sm">
                  <Pill color="#2563EB" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-lg text-gray-900">{record.medicine_name}</Text>
                  <Text className="text-gray-500 text-sm">{record.medicine_category}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
  
        {/* Details */}
        <View className="p-4">
          <View className="flex-row items-center mb-3">
            <Pill size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Dosage: <Text className="font-medium text-gray-900">{record.dosage}</Text> • {record.form}
            </Text>
          </View>
  
          <View className="flex-row items-center mb-3">
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Date Requested: <Text className="font-medium text-gray-900">{localDateFormatter(record.requested_at)}</Text>
            </Text>
          </View>
  
          {/* Signature Section */}
          {record.signature && (
            <View className="mb-3 pt-3 border-t border-gray-100">
              <TouchableOpacity onPress={() => setSigModalVisible(true)} className="flex-row items-center">
                <FileText size={16} color="#6B7280" />
                <Text className="ml-2 text-blue-600 text-sm">View Signature</Text>
              </TouchableOpacity>
              <SignatureModal signature={record.signature} isVisible={sigModalVisible} onClose={() => setSigModalVisible(false)} />
            </View>
          )}
  
          {/* Documents Section */}
          {record.files && record.files.length > 0 && (
            <View className="pt-3 border-t border-gray-100">
              <Text className="text-gray-600 text-sm mb-2">Documents:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {record.files.map((file: any, index: any) => (
                  <TouchableOpacity key={file.medf_id || index} onPress={() => handleDocumentPress(index)} className="mr-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <FileText size={20} color="#3B82F6" />
                    <Text className="text-xs text-gray-600 mt-1" numberOfLines={1}>
                      {file.medf_name || `Document ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <DocumentModal files={record.files} isVisible={docModalVisible} onClose={() => setDocModalVisible(false)} initialIndex={selectedDocIndex} />
            </View>
          )}
  
          {record.notes && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="text-gray-600 text-sm">
                Notes: <Text className="font-medium text-gray-900">{record.notes}</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };