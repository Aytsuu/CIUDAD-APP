import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import PageLayout from "@/screens/_PageLayout";
import { useRouter } from "expo-router";
import { ChevronLeft, MapPin, Calendar, Clock, FileText, Users, User, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from "lucide-react-native";
import { useGetComplaintDetails } from "./queries/summonFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ComplaintRecordForSummon({
  comp_id,
}: {
  comp_id: string;
}) {
  const router = useRouter();
  const { data: complaintDetails, isLoading, error } = useGetComplaintDetails(comp_id);
  const [openSections, setOpenSections] = useState({
    complainants: true,
    accused: true,
    files: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleOpenFile = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };


  if (isLoading) {
    return (
        <View className="h-64 justify-center items-center">
            <LoadingState/>
        </View>
    );
  }

  if (error || !complaintDetails) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Complaint Details</Text>}
      >
        <View className="flex-1 justify-center items-center p-6">
          <View className="bg-red-50 border border-red-200 rounded-lg p-6 items-center">
            <AlertTriangle size={32} className="text-red-500 mb-2" />
            <Text className="text-red-700 text-center font-medium">
              {(error as Error)?.message || "Complaint not found"}
            </Text>
          </View>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Complaint Details</Text>}
    >
      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-4">
          {/* Header Card */}
          <Card className="border-l-4 border-l-blue-500 bg-white">
            <CardHeader className="pb-4">
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-xl font-bold text-blue-800">
                  Complaint #{complaintDetails.comp_id}
                </Text>
              </View>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Location */}
              <View className="flex-row items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <MapPin size={20} className="text-blue-600 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700">Location</Text>
                  <Text className="text-sm text-gray-900">
                    {complaintDetails.comp_location || "Location not specified"}
                  </Text>
                </View>
              </View>

              {/* Incident Date */}
              <View className="flex-row items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Calendar size={20} className="text-purple-600 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700">Incident Date</Text>
                  <Text className="text-sm text-gray-900">
                    {formatTimestamp(complaintDetails.comp_datetime)}
                  </Text>
                </View>
              </View>

              {/* Filed Date */}
              <View className="flex-row items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Clock size={20} className="text-green-600 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700">Filed Date</Text>
                  <Text className="text-sm text-gray-900">
                    {formatTimestamp(complaintDetails.comp_created_at)}
                  </Text>
                </View>
              </View>

              {/* Incident Type */}
              <View className="flex-row items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <FileText size={20} className="text-orange-600 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700">Incident Type</Text>
                  <Text className="text-sm text-gray-900 font-medium">
                    {complaintDetails.comp_incident_type}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Allegation Details */}
          <Card className="border-l-4 border-l-amber-500 bg-white">
            <CardHeader>
              <View className="flex-row items-center space-x-2">
                <FileText size={20} className="text-amber-600" />
                <Text className="text-lg font-bold text-amber-900">Allegation Details</Text>
              </View>
            </CardHeader>
            <CardContent>
              <View className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <Text className="text-sm leading-relaxed text-gray-800">
                  {complaintDetails.comp_allegation || "No allegation details provided"}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Complainants Section */}
          <Card className="border-l-4 border-l-green-500 bg-white">
            <CardHeader>
              <TouchableOpacity 
                onPress={() => toggleSection('complainants')}
                className="flex-row justify-between items-center"
              >
                <View className="flex-row items-center space-x-2">
                  <Users size={20} className="text-green-600" />
                  <Text className="text-lg font-bold text-green-900">
                    Complainant{complaintDetails.complainant?.length > 1 ? "s" : ""} ({complaintDetails.complainant?.length || 0})
                  </Text>
                </View>
                {openSections.complainants ? <ChevronUp size={20} className="text-green-600" /> : <ChevronDown size={20} className="text-green-600" />}
              </TouchableOpacity>
            </CardHeader>
            
            {openSections.complainants && (
              <CardContent className="space-y-4">
                {complaintDetails.complainant && complaintDetails.complainant.length > 0 ? (
                  complaintDetails.complainant.map((complainant: any, index: number) => (
                    <View key={complainant.cpnt_id || index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <Text className="font-bold text-lg text-green-900 mb-3">
                        {complainant.cpnt_name || "Unnamed Complainant"}
                      </Text>
                      
                      <View className="space-y-2">
                        {complainant.cpnt_age && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-700 font-medium">Age:</Text>
                            <Text className="text-sm text-gray-700">{complainant.cpnt_age}</Text>
                          </View>
                        )}
                        {complainant.cpnt_gender && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-700 font-medium">Gender:</Text>
                            <Text className="text-sm text-gray-700">{complainant.cpnt_gender}</Text>
                          </View>
                        )}
                        {complainant.cpnt_number && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-700 font-medium">Contact:</Text>
                            <Text className="text-sm text-gray-700">{complainant.cpnt_number}</Text>
                          </View>
                        )}
                        {complainant.cpnt_relation_to_respondent && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-700 font-medium">Relation:</Text>
                            <Text className="text-sm text-gray-700">{complainant.cpnt_relation_to_respondent}</Text>
                          </View>
                        )}
                      </View>

                      <View className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                        <View className="flex-row items-center space-x-2 mb-2">
                          <MapPin size={16} className="text-green-600" />
                          <Text className="text-sm font-medium text-green-800">Address</Text>
                        </View>
                        <Text className="text-sm text-gray-700">
                          {complainant.cpnt_address || "Address not specified"}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="items-center py-6 bg-green-50 rounded-lg border border-green-200">
                    <Users size={32} className="text-green-300 mb-2" />
                    <Text className="text-green-700 font-medium">No complainants listed</Text>
                  </View>
                )}
              </CardContent>
            )}
          </Card>

          {/* Accused Persons Section */}
          <Card className="border-l-4 border-l-red-500 bg-white">
            <CardHeader>
              <TouchableOpacity 
                onPress={() => toggleSection('accused')}
                className="flex-row justify-between items-center"
              >
                <View className="flex-row items-center space-x-2">
                  <User size={20} className="text-red-600" />
                  <Text className="text-lg font-bold text-red-900">
                    Accused Person{complaintDetails.accused?.length > 1 ? "s" : ""} ({complaintDetails.accused?.length || 0})
                  </Text>
                </View>
                {openSections.accused ? <ChevronUp size={20} className="text-red-600" /> : <ChevronDown size={20} className="text-red-600" />}
              </TouchableOpacity>
            </CardHeader>
            
            {openSections.accused && (
              <CardContent className="space-y-4">
                {complaintDetails.accused && complaintDetails.accused.length > 0 ? (
                  complaintDetails.accused.map((accused: any, index: number) => (
                    <View key={accused.acsd_id || index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <Text className="font-bold text-lg text-red-900 mb-3">
                        {accused.acsd_name || "Unnamed Accused"}
                      </Text>
                      
                      <View className="space-y-2">
                        {accused.acsd_age && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-700 font-medium">Age:</Text>
                            <Text className="text-sm text-gray-700">{accused.acsd_age}</Text>
                          </View>
                        )}
                        {accused.acsd_gender && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-700 font-medium">Gender:</Text>
                            <Text className="text-sm text-gray-700">{accused.acsd_gender}</Text>
                          </View>
                        )}
                      </View>

                      {accused.acsd_description && (
                        <View className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                          <View className="flex-row items-center space-x-2 mb-2">
                            <FileText size={16} className="text-red-600" />
                            <Text className="text-sm font-medium text-red-800">Description</Text>
                          </View>
                          <Text className="text-sm text-gray-700">
                            {accused.acsd_description}
                          </Text>
                        </View>
                      )}

                      <View className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                        <View className="flex-row items-center space-x-2 mb-2">
                          <MapPin size={16} className="text-red-600" />
                          <Text className="text-sm font-medium text-red-800">Address</Text>
                        </View>
                        <Text className="text-sm text-gray-700">
                          {accused.acsd_address || "Address not specified"}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="items-center py-6 bg-red-50 rounded-lg border border-red-200">
                    <User size={32} className="text-red-300 mb-2" />
                    <Text className="text-red-700 font-medium">No accused persons listed</Text>
                  </View>
                )}
              </CardContent>
            )}
          </Card>

          {/* Attached Files Section */}
          {complaintDetails.complaint_files && complaintDetails.complaint_files.length > 0 && (
            <Card className="border-l-4 border-l-purple-500 bg-white">
              <CardHeader>
                <TouchableOpacity 
                  onPress={() => toggleSection('files')}
                  className="flex-row justify-between items-center"
                >
                  <View className="flex-row items-center space-x-2">
                    <FileText size={20} className="text-purple-600" />
                    <Text className="text-lg font-bold text-purple-900">
                      Attached Files ({complaintDetails.complaint_files.length})
                    </Text>
                  </View>
                  {openSections.files ? <ChevronUp size={20} className="text-purple-600" /> : <ChevronDown size={20} className="text-purple-600" />}
                </TouchableOpacity>
              </CardHeader>
              
              {openSections.files && (
                <CardContent className="space-y-3">
                  {complaintDetails.complaint_files.map((file: any) => (
                    <TouchableOpacity 
                      key={file.comp_file_id}
                      onPress={() => file.comp_file_url && handleOpenFile(file.comp_file_url)}
                      className="flex-row items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
                    >
                      <FileText size={20} className="text-purple-600" />
                      <View className="flex-1">
                        <Text className="font-semibold text-sm text-gray-800">
                          {file.comp_file_name || "Unnamed file"}
                        </Text>
                        {file.comp_file_type && (
                          <Text className="text-xs text-purple-600 font-medium mt-1">
                            {file.comp_file_type}
                          </Text>
                        )}
                      </View>
                      {file.comp_file_url && (
                        <ExternalLink size={16} className="text-purple-600" />
                      )}
                    </TouchableOpacity>
                  ))}
                </CardContent>
              )}
            </Card>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}