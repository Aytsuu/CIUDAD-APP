import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { Card } from "@/components/ui/card";
import { Home } from "@/lib/icons/Home";
import { Calendar } from "@/lib/icons/Calendar";
import { MapPin } from "@/lib/icons/MapPin";
import { UserRound } from "@/lib/icons/UserRound";
import { UsersRound } from "@/lib/icons/UsersRound";
import { Edit } from "@/lib/icons/Edit";
import { Phone } from "@/lib/icons/Phone";
import { Mail } from "@/lib/icons/Mail";
import { Building } from "@/lib/icons/Building";
import { CircleCheck } from "@/lib/icons/CircleCheck";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import PageLayout from "@/screens/_PageLayout";

export default function HouseholdDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the household data from params
  const household = React.useMemo(() => {
    try {
      return JSON.parse(params.household as string);
    } catch (error) {
      console.error('Error parsing household data:', error);
      return null;
    }
  }, [params.household]);

  React.useEffect(() => {
    if (!household) {
      Alert.alert('Error', 'Household data not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [household]);

  if (!household) {
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
            Household Details
          </Text>
        }
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </PageLayout>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    Alert.alert('Edit Household', 'Edit functionality will be implemented here');
  };

  const handleViewFamily = (family: any) => {
    // Navigate to family details
    router.push({
      pathname: '/(profiling)/family/details',
      params: {
        family: JSON.stringify(family)
      }
    });
  };

  const InfoRow = ({ icon: Icon, label, value, valueColor = "text-gray-900" }: { 
    icon: any, 
    label: string, 
    value: string | number,
    valueColor?: string
  }) => (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Icon size={18} className="text-gray-600" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-sm">{label}</Text>
        <Text className={`text-base font-medium ${valueColor}`}>{value}</Text>
      </View>
    </View>
  );

  const householdInitials = household.hh_id ? household.hh_id.substring(0, 2).toUpperCase() : 'HH';
  const fullAddress = [household.street, household.sitio].filter(Boolean).join(', ') || 'Address not specified';
  const registeredDate = formatDate(household.date_registered);
  const registeredBy = household.registered_by || 'N/A';
  
  // Mock families data (replace with actual data from your API)
  const householdFamilies = household.families || [];

  const renderFamilyCard = ({ item, index }: { item: any; index: number }) => {
    const familyName = `Family ${item.fam_id}`;
    const memberCount = item.members || 0;
    
    return (
      <TouchableOpacity
        onPress={() => handleViewFamily(item)}
        className="mb-3"
        activeOpacity={0.7}
      >
        <Card className="p-3 bg-gray-50 border border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-600 font-semibold text-sm">
                  F{item.fam_id}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium text-sm" numberOfLines={1}>
                  {familyName}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                </Text>
                {item.father && (
                  <Text className="text-gray-600 text-xs mt-1" numberOfLines={1}>
                    Head: {item.father}
                  </Text>
                )}
              </View>
            </View>
            <ChevronRight size={16} className="text-gray-400" />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

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
          Household Details
        </Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 px-5"
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Household Header */}
        <View className="pb-6">
          <View className="items-center">
            <Text className="text-gray-500 text-sm text-center mb-2">
              Household ID
            </Text>
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">
              {household.hh_id}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-600 font-medium text-sm">
                  {household.total_families} {household.total_families === 1 ? 'Family' : 'Families'}
                </Text>
              </View>
              {household.nhts && (
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-600 font-medium text-sm">
                    NHTS
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Household Overview */}
        <Card className="mt-4 p-4">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Household Overview
          </Text>
          
          <InfoRow 
            icon={Home} 
            label="Household ID" 
            value={household.hh_id} 
          />
          
          <InfoRow 
            icon={UserRound} 
            label="Household Head" 
            value={household.head || 'Not specified'} 
          />
          
          <InfoRow 
            icon={UsersRound} 
            label="Total Families" 
            value={`${household.total_families} ${household.total_families === 1 ? 'Family' : 'Families'}`} 
          />
          
          <InfoRow 
            icon={MapPin} 
            label="Address" 
            value={fullAddress} 
          />
          
          <InfoRow 
            icon={Calendar} 
            label="Date Registered" 
            value={registeredDate} 
          />
          
          <View className="flex-row items-center py-3">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
              <UserRound size={18} className="text-gray-600" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Registered By</Text>
              <Text className="text-gray-900 text-base font-medium">{registeredBy}</Text>
            </View>
          </View>
        </Card>

        {/* Location Details */}
        <Card className="mt-4 p-4">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Location Details
          </Text>
          
          {household.street && (
            <InfoRow 
              icon={MapPin} 
              label="Street" 
              value={household.street} 
            />
          )}
          
          {household.sitio && (
            <InfoRow 
              icon={MapPin} 
              label="Sitio" 
              value={household.sitio} 
            />
          )}
          
          {household.barangay && (
            <InfoRow 
              icon={Building} 
              label="Barangay" 
              value={household.barangay} 
            />
          )}
          
          {household.municipality && (
            <InfoRow 
              icon={Building} 
              label="Municipality" 
              value={household.municipality} 
            />
          )}
          
          {household.province && (
            <InfoRow 
              icon={Building} 
              label="Province" 
              value={household.province} 
            />
          )}
        </Card>

        {/* NHTS Information */}
        {household.nhts && (
          <Card className="mt-4 p-4">
            <View className="flex-row items-center mb-4">
              <CircleCheck size={20} className="text-green-600 mr-2" />
              <Text className="text-gray-900 font-semibold text-lg">
                NHTS Beneficiary
              </Text>
            </View>
            
            <View className="bg-green-50 p-3 rounded-lg">
              <Text className="text-green-800 text-sm">
                This household is registered as a beneficiary of the National Household Targeting System for Poverty Reduction (NHTS-PR).
              </Text>
            </View>
            
            {household.nhts_date && (
              <InfoRow 
                icon={Calendar} 
                label="NHTS Registration Date" 
                value={formatDate(household.nhts_date)} 
              />
            )}
          </Card>
        )}

        {/* Families in Household */}
        {householdFamilies.length > 0 && (
          <Card className="mt-4 p-4 bg-white shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 font-semibold text-lg">
                Families in Household
              </Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-600 text-xs font-medium">
                  {householdFamilies.length} {householdFamilies.length === 1 ? 'Family' : 'Families'}
                </Text>
              </View>
            </View>
            
            <FlatList
              data={householdFamilies}
              renderItem={renderFamilyCard}
              keyExtractor={(item, index) => `family-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Card>
        )}
      </ScrollView>
    </PageLayout>
  );
}