import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { Card } from "@/components/ui/card";
import { UserRound } from "@/lib/icons/UserRound";
import { Calendar } from "@/lib/icons/Calendar";
import { MapPin } from "@/lib/icons/MapPin";
import { Phone } from "@/lib/icons/Phone";
import { Mail } from "@/lib/icons/Mail";
import { Edit } from "@/lib/icons/Edit";
import PageLayout from "../../_PageLayout";

export default function ResidentDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the resident data from params
  const resident = React.useMemo(() => {
    try {
      return JSON.parse(params.resident as string);
    } catch (error) {
      console.error('Error parsing resident data:', error);
      return null;
    }
  }, [params.resident]);

  React.useEffect(() => {
    if (!resident) {
      Alert.alert('Error', 'Resident data not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [resident]);

  if (!resident) {
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
        headerTitle={
          <Text className="text-gray-900 text-[13px]">
            Resident Details
          </Text>
        }
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </PageLayout>
    );
  }

  const fullName = `${resident.fname} ${resident.mname ? resident.mname + ' ' : ''}${resident.lname}`;

  const handleEdit = () => {
    // Navigate to edit screen or show edit modal
    Alert.alert('Edit Resident', 'Edit functionality will be implemented here');
  };

  const InfoRow = ({ icon: Icon, label, value }: { 
    icon: any, 
    label: string, 
    value: string | number 
  }) => (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Icon size={18} className="text-gray-600" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-sm">{label}</Text>
        <Text className="text-gray-900 text-base font-medium">{value}</Text>
      </View>
    </View>
  );

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
      headerTitle={
        <Text className="text-gray-900 text-[13px]">
          Resident Details
        </Text>
      }
      rightAction={
        <TouchableOpacity
          onPress={handleEdit}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Edit size={20} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <ScrollView className="flex-1 bg-gray-50">
        {/* Profile Header */}
        <Card className="mx-5 mt-4 p-6 bg-white shadow-sm border border-gray-100">
          <View className="items-center">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-blue-600 font-bold text-3xl">
                {resident.fname?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">
              {fullName}
            </Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-medium text-sm">
                ID: {resident.rp_id}
              </Text>
            </View>
          </View>
        </Card>

        {/* Basic Information */}
        <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Basic Information
          </Text>
          
          <InfoRow 
            icon={UserRound} 
            label="Full Name" 
            value={fullName} 
          />
          
          <InfoRow 
            icon={Calendar} 
            label="Age" 
            value={`${resident.age} years old`} 
          />
          
          <InfoRow 
            icon={UserRound} 
            label="Gender" 
            value={resident.gender} 
          />
          
          {resident.birthdate && (
            <InfoRow 
              icon={Calendar} 
              label="Birth Date" 
              value={resident.birthdate} 
            />
          )}
        </Card>

        {/* Contact Information */}
        {(resident.phone || resident.email || resident.address) && (
          <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
            <Text className="text-gray-900 font-semibold text-lg mb-4">
              Contact Information
            </Text>
            
            {resident.phone && (
              <InfoRow 
                icon={Phone} 
                label="Phone Number" 
                value={resident.phone} 
              />
            )}
            
            {resident.email && (
              <InfoRow 
                icon={Mail} 
                label="Email Address" 
                value={resident.email} 
              />
            )}
            
            {resident.address && (
              <InfoRow 
                icon={MapPin} 
                label="Address" 
                value={resident.address} 
              />
            )}
          </Card>
        )}

        {/* Additional Information */}
        <Card className="mx-5 mt-4 mb-6 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Additional Information
          </Text>
          
          {resident.occupation && (
            <InfoRow 
              icon={UserRound} 
              label="Occupation" 
              value={resident.occupation} 
            />
          )}
          
          {resident.civil_status && (
            <InfoRow 
              icon={UserRound} 
              label="Civil Status" 
              value={resident.civil_status} 
            />
          )}
          
          {resident.household_head && (
            <InfoRow 
              icon={UserRound} 
              label="Household Head" 
              value={resident.household_head} 
            />
          )}
          
          {resident.created_at && (
            <InfoRow 
              icon={Calendar} 
              label="Date Registered" 
              value={new Date(resident.created_at).toLocaleDateString()} 
            />
          )}
        </Card>
      </ScrollView>
    </PageLayout>
  );
}