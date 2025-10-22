import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MapPin, Calendar, Clock, FileText, Users, User, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from "lucide-react-native";
import { useGetComplaintDetails } from "./queries/summonFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ComplaintRecordForSummon({
  comp_id,
}: {
  comp_id: string;
}) {
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
      <View className="flex-1 justify-center items-center p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <View className="items-center">
              <AlertTriangle size={32} className="text-red-500 mb-2" />
              <Text className="text-red-700 text-center font-medium">
                {(error as Error)?.message || "Complaint not found"}
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    );
  }

  // Info Item Component for consistent styling
  const InfoItem = ({ icon: Icon, label, value, color = "blue" }: {
    icon: any;
    label: string;
    value: string;
    color?: "blue" | "purple" | "green" | "orange";
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      green: "bg-green-50 border-green-200 text-green-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600"
    };

    return (
      <View className={`flex-row items-center p-3 rounded-lg border ${colorClasses[color]}`}>
        <Icon size={18} className={`mr-3`} />
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700">{label}</Text>
          <Text className="text-sm text-gray-900 mt-1">{value}</Text>
        </View>
      </View>
    );
  };

  // Person Card Component for complainants and accused
  const PersonCard = ({ person, type }: { person: any; type: 'complainant' | 'accused' }) => {
    const isComplainant = type === 'complainant';
    const colorClasses = isComplainant 
      ? "border-green-200 bg-green-50" 
      : "border-red-200 bg-red-50";
    const iconColor = isComplainant ? "text-green-600" : "text-red-600";

    return (
      <Card className={`border ${colorClasses}`}>
        <CardContent className="pt-4">
          <View className="flex-row items-start justify-between mb-3">
            <Text className="font-semibold text-gray-900 text-base flex-1">
              {person[isComplainant ? 'cpnt_name' : 'acsd_name'] || `Unnamed ${type}`}
            </Text>
            {isComplainant ? (
              <Users size={18} className={iconColor} />
            ) : (
              <User size={18} className={iconColor} />
            )}
          </View>

          <View className="space-y-2">
            {person[isComplainant ? 'cpnt_age' : 'acsd_age'] && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Age</Text>
                <Text className="text-sm text-gray-900 font-medium">
                  {person[isComplainant ? 'cpnt_age' : 'acsd_age']}
                </Text>
              </View>
            )}
            
            {person[isComplainant ? 'cpnt_gender' : 'acsd_gender'] && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Gender</Text>
                <Text className="text-sm text-gray-900 font-medium">
                  {person[isComplainant ? 'cpnt_gender' : 'acsd_gender']}
                </Text>
              </View>
            )}

            {isComplainant && person.cpnt_number && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Contact</Text>
                <Text className="text-sm text-gray-900 font-medium">{person.cpnt_number}</Text>
              </View>
            )}

            {isComplainant && person.cpnt_relation_to_respondent && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Relation</Text>
                <Text className="text-sm text-gray-900 font-medium">
                  {person.cpnt_relation_to_respondent}
                </Text>
              </View>
            )}
          </View>

          {(person[isComplainant ? 'cpnt_address' : 'acsd_address'] || 
            (isComplainant ? person.acsd_description : person.acsd_description)) && (
            <View className="mt-3 pt-3 border-t border-gray-200">
              {person[isComplainant ? 'cpnt_address' : 'acsd_address'] && (
                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Address</Text>
                  <Text className="text-sm text-gray-600">
                    {person[isComplainant ? 'cpnt_address' : 'acsd_address']}
                  </Text>
                </View>
              )}
              
              {!isComplainant && person.acsd_description && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Description</Text>
                  <Text className="text-sm text-gray-600">{person.acsd_description}</Text>
                </View>
              )}
            </View>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-4">
        {/* Case Overview Card */}
        <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
          <CardHeader className="pb-4 flex flex-row gap-2 items-center">
        <Text className="font-bold text-md">Complaint</Text>
           <View className="bg-blue-600 px-3 py-1 rounded-full self-start">
                <Text className="text-white font-bold text-sm tracking-wide">{complaintDetails.comp_id}</Text>
            </View>
          </CardHeader>
          <CardContent className="space-y-3 flex flex-col gap-2">
            <InfoItem 
              icon={MapPin}
              label="Location"
              value={complaintDetails.comp_location || "Location not specified"}
              color="blue"
            />
            <InfoItem 
              icon={Calendar}
              label="Incident Date"
              value={formatTimestamp(complaintDetails.comp_datetime)}
              color="purple"
            />
            <InfoItem 
              icon={Clock}
              label="Filed Date"
              value={formatTimestamp(complaintDetails.comp_created_at)}
              color="green"
            />
            <InfoItem 
              icon={FileText}
              label="Incident Type"
              value={complaintDetails.comp_incident_type}
              color="orange"
            />
          </CardContent>
        </Card>

        {/* Allegation Details Card */}
        <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
          <CardHeader>
            <View className="flex-row items-center space-x-2">
              <FileText size={20} className="text-amber-600" />
              <Text className="text-md font-bold text-gray-900">Allegation Details</Text>
            </View>
          </CardHeader>
          <CardContent>
            <Text className="text-sm leading-relaxed text-gray-700 bg-amber-50 rounded-lg p-4">
              {complaintDetails.comp_allegation || "No allegation details provided"}
            </Text>
          </CardContent>
        </Card>

        {/* Complainants Section */}
        <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
          <CardHeader>
            <TouchableOpacity 
              onPress={() => toggleSection('complainants')}
              className="flex-row justify-between items-center"
            >
              <View className="flex-row items-center space-x-2">
                <Users size={20} className="text-green-600" />
                <Text className="text-md font-bold text-gray-900">
                  Complainant/s ({complaintDetails.complainant?.length || 0})
                </Text>
              </View>
              {openSections.complainants ? 
                <ChevronUp size={20} className="text-gray-400" /> : 
                <ChevronDown size={20} className="text-gray-400" />
              }
            </TouchableOpacity>
          </CardHeader>
          
          {openSections.complainants && (
            <CardContent className="space-y-3">
              {complaintDetails.complainant && complaintDetails.complainant.length > 0 ? (
                complaintDetails.complainant.map((complainant: any, index: number) => (
                  <PersonCard 
                    key={complainant.cpnt_id || index} 
                    person={complainant} 
                    type="complainant" 
                  />
                ))
              ) : (
                <View className="items-center py-6 bg-gray-50 rounded-lg">
                  <Users size={32} className="text-gray-300 mb-2" />
                  <Text className="text-gray-500">No complainants listed</Text>
                </View>
              )}
            </CardContent>
          )}
        </Card>

        {/* Accused Persons Section */}
        <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
          <CardHeader>
            <TouchableOpacity 
              onPress={() => toggleSection('accused')}
              className="flex-row justify-between items-center"
            >
              <View className="flex-row items-center space-x-2">
                <User size={20} className="text-red-600" />
                <Text className="text-md font-bold text-gray-900">
                  Accused Person/s ({complaintDetails.accused?.length || 0})
                </Text>
              </View>
              {openSections.accused ? 
                <ChevronUp size={20} className="text-gray-400" /> : 
                <ChevronDown size={20} className="text-gray-400" />
              }
            </TouchableOpacity>
          </CardHeader>
          
          {openSections.accused && (
            <CardContent className="space-y-3">
              {complaintDetails.accused && complaintDetails.accused.length > 0 ? (
                complaintDetails.accused.map((accused: any, index: number) => (
                  <PersonCard 
                    key={accused.acsd_id || index} 
                    person={accused} 
                    type="accused" 
                  />
                ))
              ) : (
                <View className="items-center py-6 bg-gray-50 rounded-lg">
                  <User size={32} className="text-gray-300 mb-2" />
                  <Text className="text-gray-500">No accused persons listed</Text>
                </View>
              )}
            </CardContent>
          )}
        </Card>

        {/* Attached Files Section */}
        {complaintDetails.complaint_files && complaintDetails.complaint_files.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <TouchableOpacity 
                onPress={() => toggleSection('files')}
                className="flex-row justify-between items-center"
              >
                <View className="flex-row items-center space-x-2">
                  <FileText size={20} className="text-purple-600" />
                  <Text className="text-md font-bold text-gray-900">
                    Attached Files ({complaintDetails.complaint_files.length})
                  </Text>
                </View>
                {openSections.files ? 
                  <ChevronUp size={20} className="text-gray-400" /> : 
                  <ChevronDown size={20} className="text-gray-400" />
                }
              </TouchableOpacity>
            </CardHeader>
            
            {openSections.files && (
              <CardContent className="space-y-2">
                {complaintDetails.complaint_files.map((file: any) => (
                  <TouchableOpacity 
                    key={file.comp_file_id}
                    onPress={() => file.comp_file_url && handleOpenFile(file.comp_file_url)}
                    className="flex-row items-center p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <FileText size={18} className="text-purple-600 mr-3" />
                    <View className="flex-1">
                      <Text className="font-medium text-sm text-gray-800">
                        {file.comp_file_name || "Unnamed file"}
                      </Text>
                      {file.comp_file_type && (
                        <Text className="text-xs text-purple-600 mt-1">
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
  );
}