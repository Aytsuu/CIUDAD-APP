import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { X } from "lucide-react-native";
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import _ScreenLayout from '@/screens/_ScreenLayout';
import ImageCarousel from '@/components/ui/imageCarousel';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateWasteResReport } from '../queries/illegal-dump-update-queries';
import { ActivityIndicator } from 'react-native';


export default function WasteIllegalDumpingResDetails() {
  // Get all params from the route
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse all params
  const {
    rep_id,
    rep_matter,
    rep_location,
    rep_add_details,
    rep_violator,
    rep_complainant,
    rep_contact,
    rep_status,
    rep_date,
    rep_date_resolved,
    sitio_name,
    waste_report_file,
    waste_report_rslv_file
  } = params;

  // Parse the waste_report_file array
  const parsedFiles = waste_report_file ? JSON.parse(waste_report_file as string) : [];
  // Parse waste_report_rslv_file
  const parsedResFiles = waste_report_rslv_file ? JSON.parse(waste_report_rslv_file as string) : [];

  console.log("LENGTH RESFILES: ", parsedResFiles.length)



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

  
  
  //UPDATE MUTATION
  const { mutate: updateRep, isPending } = useUpdateWasteResReport(Number(rep_id), () => {
      setTimeout(() => {
          router.back();
      }, 600);
  });


  const handleSubmitResolution = () => {        
      const updateData = {
          rep_status: "cancelled",
      };
      
      updateRep(updateData);
  };


  return (
    <>
      <_ScreenLayout
        headerBetweenAction={<Text className="text-[18px] font-semibold">Report No. {rep_id}</Text>}
        showExitButton={true}
        showBackButton={false}
        customRightAction={
          <TouchableOpacity onPress={() => router.back()}>
            <X size={16} className="text-black" />
          </TouchableOpacity>
        }
        footer={
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
                  onPress={handleSubmitResolution}
              />              
          ) : (
              <ConfirmationModal
                  trigger={
                      <TouchableOpacity
                          className={"py-4 rounded-md mt-4 items-center bg-red-500"}
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
                              <Text className="text-white font-medium text-md">Cancel </Text>
                          )}                                    
                      </TouchableOpacity>
                  }
                  title="Cancel Report"
                  description="Are you sure you want to cancel this report?"
                  actionLabel="Confirm"
                  onPress={handleSubmitResolution}
              />                
          )        
        }
        stickyFooter={true}
      >
        <ScrollView className="p-4 pb-8">
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
                  typeKey="wrsf_type"
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

                <View className="mb-4">
                  <Text className="font-semibold text-gray-600 mb-1">Report Details</Text>
                  <Text>{rep_add_details || "No additional details provided."}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </_ScreenLayout>
    </>
  );
}