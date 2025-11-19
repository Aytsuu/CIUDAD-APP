import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { X, ChevronLeft } from "lucide-react-native";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import PageLayout from "@/screens/_PageLayout";
import ImageCarousel from '@/components/ui/imageCarousel';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateWasteReport } from '../queries/illegal-dump-update-queries';
import { useWasteReport } from '../queries/illegal-dump-fetch-queries';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function WasteIllegalDumpingDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const rep_id = String(params.rep_id);

  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  // Fetch the specific report using rep_id
  const { data: wasteReportData = { results: [], count: 0 }, isLoading, isError, refetch } = useWasteReport(
    1,           // page
    1000,        // pageSize
    "",          // searchQuery
    "",          // reportMatter
    "",          // status
    undefined,   // rp_id (not needed for staff view)
    rep_id       // rep_id (the specific report ID you want to fetch)
  );

  // Extract the first result (should only be one with specific rep_id)
  const report = wasteReportData.results[0];

  // Extract data from the fetched report
  const rep_matter = report?.rep_matter || '';
  const rep_location = report?.rep_location || '';
  const rep_violator = report?.rep_violator || '';
  const rep_complainant = report?.rep_complainant || '';
  const rep_contact = report?.rep_contact || '';
  const rep_date = report?.rep_date || '';
  const rep_add_details = report?.rep_add_details || '';
  const rep_status = report?.rep_status || '';
  const rep_date_resolved = report?.rep_date_resolved || '';
  const rep_date_cancelled = report?.rep_date_cancelled || '';
  const sitio_name = report?.sitio_name || '';
  const waste_report_file = report?.waste_report_file || [];
  const waste_report_rslv_file = report?.waste_report_rslv_file || [];

  const parsedFiles = waste_report_file;
  const parsedResFiles = waste_report_rslv_file;

  const isResolved = !!rep_date_resolved || rep_status === "resolved";
  const isCancelled = rep_status === "cancelled";

  const getStatusStyle = () => {
    switch (String(rep_status)?.toLowerCase()) {
      case 'pending':
        return 'bg-blue-100 text-primaryBlue border-primaryBlue';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-500';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  };

  const { mutate: updateRep, isPending } = useUpdateWasteReport(String(rep_id), () => {
    setTimeout(() => {
      router.back();
    }, 600);
  });

  const handleMarkResolved = () => {
    setShowResolutionModal(true);
  };

  const handleSubmitResolution = () => {
    if (selectedImages.length === 0) return;

    const files = selectedImages.map((img: any) => ({
      name: img.name,
      type: img.type,
      file: img.file
    }));
    
    const updateData = {
      rep_status: "resolved",
      files: files,
      staff_id: user?.staff?.staff_id
    };
    
    updateRep(updateData, {
      onSuccess: () => {
        setTimeout(() => setShowResolutionModal(false), 100);
      }
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageLayout headerTitle="">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading report details...</Text>
        </View>
      </PageLayout>
    );
  }

  // Show error state
  if (isError || !report) {
    return (
      <PageLayout headerTitle="">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-600 text-lg font-semibold mb-2">Error</Text>
          <Text className="text-gray-600 text-center">Failed to load report details. Please try again.</Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            className="mt-4 bg-blue-500 px-6 py-3 rounded-md"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        headerTitle={<Text className="text-[18px] font-semibold text-primaryBlue">Report No. {rep_id}</Text>}
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>       
        }
        footer={
          <TouchableOpacity
            disabled={isResolved || isCancelled}
            onPress={handleMarkResolved}
            className={`py-3 rounded-md border self-center w-full items-center ${
              isResolved || isCancelled
              ? "bg-gray-50 border-gray-200" 
              : "bg-green-100 border-green-500"
            }`}
          >
            <Text className={`text-md ${
              isResolved || isCancelled  ? "text-gray-500" : "text-green-800"
            }`}>
              ✓ Mark as Resolved
            </Text>
          </TouchableOpacity>
        }
      >
        <ScrollView className="px-6 pb-8 pt-8">
          {/* Header */}
          <View className="items-center pb-10">
            <View className="bg-gray-100 px-3 py-2 rounded-md">
              <Text className="text-gray-800 text-center">{rep_matter}</Text>
            </View>
          </View>

          {/* Body */}
          <View className="flex-col">
            {/* Images Container */}
            <View className="w-full mb-4">
              {/* Original Report Image */}
              {parsedFiles.length > 0 && (
                <ImageCarousel 
                  images={parsedFiles}
                  title="Report Evidence"
                  idKey="wrf_id"
                  urlKey="wrf_url"
                  typeKey="wrf_type"
                />
              )}
              
              {/* Resolution Image - only show if exists */}
              {parsedResFiles.length > 0 && (
                <ImageCarousel 
                  images={parsedResFiles}
                  title="Resolution Evidence"
                  idKey="wrsf_id"
                  urlKey="wrsf_url"
                  typeKey="wrsf_type"
                />
              )}
            </View>

            {/* Details Container */}
            <View className="w-full">
              <View className="flex-1">
                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Sitio</Text>
                    <Text>{sitio_name}</Text>
                  </View>
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Location</Text>
                    <Text>{rep_location}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Complainant</Text>
                    <Text>{rep_complainant || "Unknown"}</Text>
                  </View>
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Violator</Text>
                    <Text>{rep_violator || "Unknown"}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Contact Number</Text>
                    <Text>{rep_contact}</Text>
                  </View>                  
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Report Status</Text>
                    <View className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle()}`}>
                      <Text>
                        {rep_status === "resolved" ? (
                          <Text className="text-green-600 text-sm font-medium ml-1">Resolved</Text>
                        ) : rep_status === "cancelled" ? (
                          <Text className="text-red-600 text-sm font-medium">Cancelled</Text>
                        ) : (
                          <Text className="text-primaryBlue text-sm font-medium">In progress</Text>                                  
                        )}
                      </Text>
                    </View>       
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Date & Time</Text>
                    <Text>{formatDate(rep_date as string)}</Text>
                  </View>
                  {rep_date_resolved ? (
                    <View className="w-[48%]">
                      <Text className="font-semibold text-gray-600 mb-1">Date & Time Resolved</Text>
                      <Text>{formatDate(rep_date_resolved as string)}</Text>
                    </View>
                  ) : rep_date_cancelled ? (
                    <View className="w-[48%]">
                      <Text className="font-semibold text-gray-600 mb-1">Date & Time Cancelled</Text>
                      <Text>{formatDate(rep_date_cancelled as string)}</Text>
                    </View>
                  ) : null}                 
                </View>                

                <View className="mb-4">
                  <Text className="font-semibold text-gray-600 mb-1">Report Details</Text>
                  <Text>{rep_add_details || "No additional details provided."}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </PageLayout>

      <Modal
        visible={showResolutionModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowResolutionModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-5 pb-10">
          <View className="w-full bg-white rounded-lg overflow-hidden">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Add Resolution Image</Text>
              <TouchableOpacity 
                onPress={() => setShowResolutionModal(false)}
                className="p-1"
              >
                <X size={20} className="text-black" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Modal Content */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text className="text-md text-gray-600 mb-3">Upload photo evidence of resolution</Text>
              <MediaPicker
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                limit={3}
              />  

              {/* Submit Button */}
              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    className={`py-3 rounded-md mt-4 items-center ${
                      isResolved || isCancelled ? "bg-gray-400" : "bg-blue-500"
                    }`}
                    disabled={isResolved || isPending}
                  >
                    {isPending ? (
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ActivityIndicator 
                          size="small" 
                          color="white" 
                          style={{marginRight: 8}}
                        />
                        <Text className="text-white font-medium">Submitting...</Text>
                      </View>
                    ) : (
                      <Text className="text-white font-medium">Submit</Text>
                    )}                                    
                  </TouchableOpacity>
                }
                title="Confirm Save"
                description="Are you sure you want to save these changes?"
                actionLabel="Confirm"
                onPress={handleSubmitResolution}
              />                     
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}