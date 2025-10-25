import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { X, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectLayout } from '@/components/ui/select-layout';
import DocumentPickerComponent, { DocumentItem } from '@/components/ui/document-upload';
import { useCreateOrdinance, useUploadOrdinance } from './queries/ordinance-fetch-insert-queries';
import { api } from '@/api/api';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFileToOrdinanceBucket } from '@/helpers/ordinanceFileUpload';

// Form data interface
interface OrdinanceFormData {
  ordTitle: string;
  ordDate: string;
  ordDetails: string;
  ordCategory: string;
  ordParent?: string;
  ordIsAmend?: boolean;
  ordRepealed?: boolean;
  file?: any;
}

interface OrdinanceUploadProps {
  visible: boolean;
  onClose: () => void;
  creationMode: 'new' | 'amend' | 'repeal';
  setCreationMode: (mode: 'new' | 'amend' | 'repeal') => void;
  selectedOrdinance: string;
  setSelectedOrdinance: (value: string) => void;
  availableOrdinances: Array<{ id: string; name: string; category: string }>;
  onSuccess: () => void;
}

const categoryOptions = [
  { id: "all", name: "All" },
  { id: "Council", name: "Council" },
  { id: "Waste Committee", name: "Waste Committee" },
  { id: "GAD", name: "GAD" },
  { id: "Finance", name: "Finance" }
];

export default function OrdinanceUpload({
  visible,
  onClose,
  creationMode,
  setCreationMode,
  selectedOrdinance,
  setSelectedOrdinance,
  availableOrdinances,
  onSuccess
}: OrdinanceUploadProps) {
  const [formData, setFormData] = useState<OrdinanceFormData>({
    ordTitle: "",
    ordDate: "",
    ordDetails: "",
    ordCategory: "",
    ordParent: "",
    ordIsAmend: false,
    ordRepealed: false,
    file: null
  });
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const createOrdinanceMutation = useCreateOrdinance();
  const uploadOrdinanceMutation = useUploadOrdinance();
  const { user } = useAuth();

  // Auto-fetch category when ordinance is selected for amend/repeal
  useEffect(() => {
    if ((creationMode === 'amend' || creationMode === 'repeal') && selectedOrdinance) {
      const selectedOrd = availableOrdinances.find(ord => ord.id === selectedOrdinance);
      if (selectedOrd && selectedOrd.category) {
        setFormData(prev => ({ ...prev, ordCategory: selectedOrd.category }));
      }
    }
  }, [selectedOrdinance, creationMode, availableOrdinances]);

  // Reset form
  const resetForm = () => {
    setFormData({
      ordTitle: "",
      ordDate: "",
      ordDetails: "",
      ordCategory: "",
      ordParent: "",
      ordIsAmend: false,
      ordRepealed: false,
      file: null
    });
    setSelectedDocuments([]);
    setSelectedOrdinance("");
    setCreationMode('new');
    setShowDatePicker(false);
  };

  // Form submission
  const handleSubmit = async () => {
    if (!formData.ordTitle.trim()) {
      Alert.alert('Error', 'Please enter ordinance title');
      return;
    }
    if (!formData.ordDate) {
      Alert.alert('Error', 'Please select date');
      return;
    }
    if (!formData.ordDetails.trim()) {
      Alert.alert('Error', 'Please enter ordinance details');
      return;
    }
    if (!formData.ordCategory) {
      Alert.alert('Error', 'Please select category');
      return;
    }
    if (creationMode === 'repeal' && selectedDocuments.length === 0) {
      Alert.alert('Error', 'Please upload a document to repeal this ordinance');
      return;
    }

    setIsUploading(true);

    try {
      let fileId = null;
      
      // 1. Upload file first if exists (now handled by backend like resolution)
      if (selectedDocuments.length > 0) {
        const file = selectedDocuments[0];
        
        try {
          // Upload file using backend API (same as resolution)
          const uploadResult = await uploadFileToOrdinanceBucket({
            name: file.name || 'unnamed-file',
            type: file.type || 'application/octet-stream',
            file: file.file || ''
          });
          
          fileId = uploadResult.fileId;
        } catch (fileError: any) {
          console.error('Error uploading file:', fileError);
          console.error('Error response:', fileError?.response?.data);
          Alert.alert('Error', `Failed to upload file: ${fileError?.message || 'Unknown error'}`);
          return;
        }
      }

      // 2. Create ordinance with file ID
      const ordYear = new Date(formData.ordDate).getFullYear();
      
      const submitData = {
        ord_title: formData.ordTitle,
        ord_date_created: formData.ordDate,
        ord_details: formData.ordDetails,
        ord_category: formData.ordCategory,
        ord_repealed: formData.ordRepealed || false,
        ord_year: ordYear,
        of_id: fileId,
        staff_id: user?.staff?.staff_id,
        ...(creationMode === 'amend' && { 
          ord_parent: selectedOrdinance,
          ord_is_ammend: true,
          ord_ammend_ver: 1
        }),
        ...(creationMode === 'repeal' && { 
          ord_parent: selectedOrdinance,
          ord_repealed: true
        })
      };

      console.log("🚀 Creating ordinance with data:", submitData);
      await createOrdinanceMutation.mutateAsync(submitData);
      
      Alert.alert('Success', 'Ordinance created successfully');
      onClose();
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating ordinance:', error);
      console.error('Error response:', error?.response?.data);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create ordinance';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, ordDate: dateStr }));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl max-h-[90%]">
          {/* Modal Header */}
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">
                {creationMode === 'new' ? 'Create New Ordinance' : 
                 creationMode === 'amend' ? 'Amend Ordinance' : 'Repeal Ordinance'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal Content */}
          <ScrollView 
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <View className="space-y-4">
              {/* Creation Mode Selection */}
              <View className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <Text className="text-base font-semibold mb-3 text-blue-900">Select Type</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setCreationMode('new')}
                    className={`flex-1 py-2 px-3 rounded ${
                      creationMode === 'new' ? 'bg-blue-500' : 'bg-white'
                    }`}
                  >
                    <Text className={`text-center ${
                      creationMode === 'new' ? 'text-white' : 'text-gray-700'
                    }`}>New</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCreationMode('amend')}
                    className={`flex-1 py-2 px-3 rounded ${
                      creationMode === 'amend' ? 'bg-blue-500' : 'bg-white'
                    }`}
                    disabled={availableOrdinances.length === 0}
                  >
                    <Text className={`text-center ${
                      creationMode === 'amend' ? 'text-white' : 'text-gray-700'
                    }`}>Amend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCreationMode('repeal')}
                    className={`flex-1 py-2 px-3 rounded ${
                      creationMode === 'repeal' ? 'bg-blue-500' : 'bg-white'
                    }`}
                    disabled={availableOrdinances.length === 0}
                  >
                    <Text className={`text-center ${
                      creationMode === 'repeal' ? 'text-white' : 'text-gray-700'
                    }`}>Repeal</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Ordinance Selection for Amend/Repeal */}
              {(creationMode === 'amend' || creationMode === 'repeal') && availableOrdinances.length > 0 && (
                <View className="pt-5">
                  <Text className="text-[13px] font-PoppinsRegular">
                    Select Ordinance to {creationMode === 'amend' ? 'Amend' : 'Repeal'}
                  </Text>
                  <SelectLayout
                    options={availableOrdinances.map(ord => ({ label: ord.name, value: ord.id }))}
                    selectedValue={selectedOrdinance}
                    onSelect={(option) => setSelectedOrdinance(option.value)}
                    placeholder={`Choose ordinance to ${creationMode === 'amend' ? 'amend' : 'repeal'}`}
                    isInModal={false}
                  />
                </View>
              )}

              {/* Title Field */}
              <View className="pt-5">
                <Text className="text-[13px] font-PoppinsRegular">Ordinance Title</Text>
                <TextInput
                  value={formData.ordTitle}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, ordTitle: text }))}
                  placeholder="Enter ordinance title"
                  className="border border-gray-300 rounded-lg p-3 bg-white text-[13px] font-PoppinsRegular"
                />
              </View>

              {/* Date Field */}
              <View className="pt-5">
                <Text className="text-[13px] font-PoppinsRegular">Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-gray-300 rounded-lg p-3 bg-white flex-row items-center justify-between"
                >
                  <Text className={`text-[13px] font-PoppinsRegular ${
                    formData.ordDate ? 'text-black' : 'text-gray-500'
                  }`}>
                    {formData.ordDate ? new Date(formData.ordDate).toLocaleDateString() : 'Select Date'}
                  </Text>
                  <Calendar size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Details Field */}
              <View className="pt-5">
                <Text className="text-[13px] font-PoppinsRegular">Details</Text>
                <TextInput
                  value={formData.ordDetails}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, ordDetails: text }))}
                  placeholder="Enter ordinance details"
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded-lg p-3 bg-white text-[13px] font-PoppinsRegular"
                />
              </View>

              {/* Category Field */}
              <View className="pt-5">
                <Text className="text-[13px] font-PoppinsRegular">Category</Text>
                {(creationMode === 'amend' || creationMode === 'repeal') && selectedOrdinance ? (
                  <View className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <Text className="text-[13px] font-PoppinsRegular text-gray-700">
                      {formData.ordCategory || 'Loading...'}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Automatically set from selected ordinance
                    </Text>
                  </View>
                ) : (
                  <SelectLayout
                    options={categoryOptions.map(cat => ({ label: cat.name, value: cat.id }))}
                    selectedValue={formData.ordCategory}
                    onSelect={(option) => setFormData(prev => ({ ...prev, ordCategory: option.value }))}
                    placeholder="Select category"
                    isInModal={false}
                  />
                )}
              </View>

              {/* File Upload */}
              <View className="pt-5">
                <Text className="text-[13px] font-PoppinsRegular">
                  {creationMode === 'repeal' ? 'Repeal Document' : 'Ordinance File'}
                </Text>
                <DocumentPickerComponent
                  selectedDocuments={selectedDocuments}
                  setSelectedDocuments={setSelectedDocuments}
                  multiple={false}
                  maxDocuments={1}
                />
                {creationMode === 'repeal' && (
                  <Text className="text-xs text-gray-500 mt-1 font-PoppinsRegular">
                    Upload the document that repeals this ordinance
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <View className="pt-5 pb-4">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isUploading}
                  className={`py-3 px-4 rounded-lg ${
                    isUploading ? 'bg-gray-400' : 'bg-blue-500'
                  }`}
                >
                  <Text className="text-white text-center font-medium">
                    {isUploading ? 'Uploading...' : 'Upload Ordinance'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.ordDate ? new Date(formData.ordDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </Modal>
  );
}
