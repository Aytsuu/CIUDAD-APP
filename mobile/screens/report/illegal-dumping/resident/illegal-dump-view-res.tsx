import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { X, ChevronLeft } from "lucide-react-native";
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import PageLayout from "@/screens/_PageLayout";
import ImageCarousel from '@/components/ui/imageCarousel';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateWasteResReport } from '../queries/illegal-dump-update-queries';
import { useWasteReport } from '../queries/illegal-dump-fetch-queries';
import { ActivityIndicator } from 'react-native';
import { SelectLayout } from '@/components/ui/select-layout';

export default function WasteIllegalDumpingResDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const rep_id = String(params.rep_id);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedReasonId, setSelectedReasonId] = useState("");

  // Fetch the specific report using rep_id
  const { data: wasteReportData = { results: [], count: 0 }, isLoading, isError, refetch } = useWasteReport(
    1,           // page
    1000,        // pageSize
    "",          // searchQuery
    "",          // reportMatter
    "",          // status
    undefined,   // rp_id (not needed for fetching specific report)
    rep_id       // rep_id (the specific report ID you want to fetch)
  );

  // Extract the first result (should only be one with specific rep_id)
  const report = wasteReportData.results[0];

  // Extract data from the fetched report
  const rep_matter = report?.rep_matter || '';
  const rep_location = report?.rep_location || '';
  const rep_violator = report?.rep_violator || '';
  const rep_contact = report?.rep_contact || '';
  const rep_date = report?.rep_date || '';
  const rep_anonymous = report?.rep_anonymous || false;
  const rep_add_details = report?.rep_add_details || '';
  const rep_status = report?.rep_status || '';
  const rep_date_resolved = report?.rep_date_resolved || '';
  const rep_date_cancelled = report?.rep_date_cancelled || '';
  const rep_cancel_reason = report?.rep_cancel_reason || '';
  const sitio_id = report?.sitio_id || 0;
  const sitio_name = report?.sitio_name || '';
  const waste_report_file = report?.waste_report_file || [];
  const waste_report_rslv_file = report?.waste_report_rslv_file || [];

  const parsedFiles = waste_report_file;
  const parsedResFiles = waste_report_rslv_file;

  const isCancelled = !!rep_date_resolved || rep_status === "cancelled";

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

  const filterOptions = [
    { id: "1", name: "Duplicate report - already reported this issue" },
    { id: "2", name: "Wrong location - incorrect address or coordinates" },
    { id: "3", name: "Issue already resolved - waste has been cleaned up" },
    { id: "4", name: "False alarm - mistaken for illegal dumping" },
    { id: "5", name: "Incomplete information - need to resubmit with more details" },
    { id: "6", name: "Personal reason - no longer able to pursue this report" },
    { id: "7", name: "Other reason" },
  ];
  
  const { mutate: updateRep, isPending } = useUpdateWasteResReport(String(rep_id), () => {
    setTimeout(() => {
      router.back();
    }, 600);
  });

  const handleCancelReport = () => {
    setShowResolutionModal(true);
  };

  const handleSubmitReport = () => {        
    const selectedReason = filterOptions.find(option => option.id === selectedReasonId);    
    
    const updateData = {
      rep_status: "cancelled",
      rep_cancel_reason: selectedReason?.name
    };
    
    updateRep(updateData, {
      onSuccess: () => {
        setTimeout(() => setShowResolutionModal(false), 100);
      }
    });
  };

  const handleResubmit = async () => {
    router.push({
      pathname: '/(waste)/illegal-dumping/resident/illegal-dump-res-resubmit',
      params: {
        rep_id: rep_id,
        rep_matter: rep_matter,
        rep_location: rep_location,
        sitio_id: sitio_id,
        rep_violator: rep_violator,
        rep_contact: rep_contact,
        rep_date: rep_date,
        rep_anonymous: String(rep_anonymous),
        rep_add_details: rep_add_details,
        waste_report_file: JSON.stringify(waste_report_file)
      },
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
          rep_status === "resolved" ? null : (
            isCancelled ? (
              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    className={"py-4 rounded-md mt-4 items-center bg-blue-500"}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ActivityIndicator 
                          size="small" 
                          color="white" 
                          style={{marginRight: 8}}
                        />
                        <Text className="text-white font-medium">Loading...</Text>
                      </View>
                    ) : (
                      <Text className="text-white font-medium text-md">Re-submit Report</Text>
                    )}                                    
                  </TouchableOpacity>
                }
                title="Re-submit Report"
                description="Are you sure you want to re-submit report?"
                actionLabel="Confirm"
                onPress={handleResubmit}
              />              
            ) : (
              <TouchableOpacity
                disabled={isCancelled || isPending}
                onPress={handleCancelReport}
                className={"py-4 rounded-md mt-4 items-center bg-red-500"}
              >
                {isPending ? (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <ActivityIndicator 
                      size="small" 
                      color="white" 
                      style={{marginRight: 8}}
                    />
                    <Text className="text-white font-medium">Loading...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-medium text-md">Cancel </Text>
                )}  
              </TouchableOpacity>              
            )        
          )
        }
      >
        <ScrollView className="px-6 pb-8">
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
                    <Text className="font-semibold text-gray-600 mb-1">Contact Number</Text>
                    <Text>{rep_contact}</Text>
                  </View>
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Violator</Text>
                    <Text>{rep_violator || "Unknown"}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Date & Time</Text>
                    <Text>{formatDate(rep_date as string)}</Text>
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

                {rep_date_resolved && (
                  <View className="mb-4">
                    <Text className="font-semibold text-gray-600 mb-1">Date & Time Resolved</Text>
                    <Text>{formatDate(rep_date_resolved as string)}</Text>              
                  </View>
                )}

                {rep_date_cancelled && (
                  <View className="flex-row justify-between mb-4">
                    <View className="w-[48%]">
                      <Text className="font-semibold text-gray-600 mb-1">Date & Time Cancelled</Text>
                      <Text>{formatDate(rep_date_cancelled as string)}</Text>              
                    </View>

                    <View className="w-[48%]">
                      <Text className="font-semibold text-gray-600 mb-1">Cancel Reason</Text>
                      <Text>{rep_cancel_reason}</Text>              
                    </View>                    
                  </View>
                )}                

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
              <Text className="text-lg font-semibold">Provide a Reason for Cancelling</Text>
              <TouchableOpacity 
                onPress={() => setShowResolutionModal(false)}
                className="p-1"
              >
                <X size={20} className="text-black" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Modal Content */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text className="text-md font-medium mb-3">Reason</Text>
              <SelectLayout
                placeholder="Select Reason"
                options={filterOptions.map(({ id, name }) => ({
                  value: id,
                  label: name,
                }))}
                selectedValue={selectedReasonId}
                onSelect={(option) => setSelectedReasonId(option.value)}
                className="bg-white mb-5"
              />               

              {/* Submit Button */}
              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    className={`py-3 rounded-md mt-4 items-center ${
                      isCancelled ? "bg-gray-400" : "bg-blue-500"
                    }`}
                    disabled={isCancelled || isPending}
                  >
                    {isPending ? (
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ActivityIndicator 
                          size="small" 
                          color="white" 
                          style={{marginRight: 8}}
                        />
                        <Text className="text-white font-medium">Loading...</Text>
                      </View>
                    ) : (
                      <Text className="text-white font-medium">Submit</Text>
                    )}                                    
                  </TouchableOpacity>
                }
                title="Cancel Report"
                description="Are you sure you want to cancel this report?"
                actionLabel="Confirm"
                onPress={handleSubmitReport}
              />                     
            </ScrollView>
          </View>
        </View>
      </Modal>      
    </>
  );
}