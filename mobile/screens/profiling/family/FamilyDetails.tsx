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
import { UsersRound } from "@/lib/icons/UsersRound";
import { Calendar } from "@/lib/icons/Calendar";
import { MapPin } from "@/lib/icons/MapPin";
import { UserRound } from "@/lib/icons/UserRound";
import { Home } from "@/lib/icons/Home";
import { Edit } from "@/lib/icons/Edit";
import { Phone } from "@/lib/icons/Phone";
import { Mail } from "@/lib/icons/Mail";
import PageLayout from "@/screens/_PageLayout";

export default function FamilyDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the family data from params
  const family = React.useMemo(() => {
    try {
      return JSON.parse(params.family as string);
    } catch (error) {
      console.error('Error parsing family data:', error);
      return null;
    }
  }, [params.family]);

  React.useEffect(() => {
    if (!family) {
      Alert.alert('Error', 'Family data not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [family]);

  if (!family) {
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
            Family Details
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

  const getInitials = (name: string) => {
    if (!name) return 'F';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleEdit = () => {
    Alert.alert('Edit Family', 'Edit functionality will be implemented here');
  };

  const handleViewMember = (member: any) => {
    // Navigate to individual member details
    router.push({
      pathname: '/(profiling)/resident/details',
      params: {
        resident: JSON.stringify(member)
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

  const familyName = `Family ${family.fam_id}`;
  const memberCount = family.members || 0;
  const householdNo = family.household_no || 'N/A';
  const sitio = family.sitio || 'N/A';
  const building = family.fam_building || 'N/A';
  const isIndigenous = family.fam_indigenous;
  const registeredDate = formatDate(family.fam_date_registered);
  const registeredBy = family.registered_by || 'N/A';
  
  // Parent information
  const mother = family.mother || 'N/A';
  const father = family.father || 'N/A';
  const guardian = family.guardian || 'N/A';
  
  // Mock family members data (replace with actual data from your API)
  const familyMembers = family.family_members || [];

  const renderMemberCard = ({ item, index }: { item: any; index: number }) => {
    const fullName = `${item.fname} ${item.mname ? item.mname + ' ' : ''}${item.lname}`;
    
    return (
      <TouchableOpacity
        onPress={() => handleViewMember(item)}
        className="mb-3"
        activeOpacity={0.7}
      >
        <Card className="p-3 bg-gray-50 border border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-600 font-semibold text-sm">
                  {item.fname?.charAt(0).toUpperCase() || 'M'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium text-sm" numberOfLines={1}>
                  {fullName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-gray-500 text-xs mr-3">
                    Age: {item.age || 'N/A'}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {item.gender || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
            <View className="bg-blue-100 px-2 py-1 rounded-full">
              <Text className="text-blue-600 text-xs font-medium">
                {item.relationship || 'Member'}
              </Text>
            </View>
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
          Family Details
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
        {/* Family Header */}
        <Card className="mx-5 mt-4 p-6 bg-white shadow-sm border border-gray-100">
          <View className="items-center">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-blue-600 font-bold text-2xl">
                {getInitials(familyName)}
              </Text>
            </View>
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">
              {familyName}
            </Text>
            <View className="flex-row items-center space-x-2">
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-600 font-medium text-sm">
                  ID: {family.fam_id}
                </Text>
              </View>
              {isIndigenous && (
                <View className="bg-orange-100 px-3 py-1 rounded-full">
                  <Text className="text-orange-600 font-medium text-sm">
                    Indigenous
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Family Overview */}
        <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Family Overview
          </Text>
          
          <InfoRow 
            icon={Home} 
            label="Household Number" 
            value={householdNo} 
          />
          
          <InfoRow 
            icon={UsersRound} 
            label="Family Members" 
            value={`${memberCount} ${memberCount === 1 ? 'Member' : 'Members'}`} 
          />
          
          <InfoRow 
            icon={MapPin} 
            label="Location" 
            value={`${sitio}${building !== 'N/A' ? `, ${building}` : ''}`} 
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

        {/* Family Heads */}
        <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Family Heads
          </Text>
          
          {father !== 'N/A' && (
            <InfoRow 
              icon={UserRound} 
              label="Father" 
              value={father} 
            />
          )}
          
          {mother !== 'N/A' && (
            <InfoRow 
              icon={UserRound} 
              label="Mother" 
              value={mother} 
            />
          )}
          
          {guardian !== 'N/A' && (
            <InfoRow 
              icon={UserRound} 
              label="Guardian" 
              value={guardian} 
            />
          )}
        </Card>

        {/* Family Members */}
        {familyMembers.length > 0 && (
          <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 font-semibold text-lg">
                Family Members
              </Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-600 text-xs font-medium">
                  {familyMembers.length} {familyMembers.length === 1 ? 'Member' : 'Members'}
                </Text>
              </View>
            </View>
            
            <FlatList
              data={familyMembers}
              renderItem={renderMemberCard}
              keyExtractor={(item, index) => `member-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Card>
        )}

        {/* Contact Information (if available) */}
        {(family.contact_number || family.email) && (
          <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
            <Text className="text-gray-900 font-semibold text-lg mb-4">
              Contact Information
            </Text>
            
            {family.contact_number && (
              <InfoRow 
                icon={Phone} 
                label="Contact Number" 
                value={family.contact_number} 
              />
            )}
            
            {family.email && (
              <InfoRow 
                icon={Mail} 
                label="Email Address" 
                value={family.email} 
              />
            )}
          </Card>
        )}

        {/* Additional Information */}
        <Card className="mx-5 mt-4 mb-6 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Additional Information
          </Text>
          
          {family.fam_income && (
            <InfoRow 
              icon={Home} 
              label="Family Income" 
              value={`₱${family.fam_income.toLocaleString()}`} 
            />
          )}
          
          {family.fam_type && (
            <InfoRow 
              icon={UsersRound} 
              label="Family Type" 
              value={family.fam_type} 
            />
          )}
          
          {family.fam_status && (
            <InfoRow 
              icon={Home} 
              label="Family Status" 
              value={family.fam_status} 
            />
          )}
          
          {family.remarks && (
            <View className="pt-3 border-t border-gray-100">
              <Text className="text-gray-500 text-sm mb-2">Remarks</Text>
              <Text className="text-gray-900 text-sm leading-5">
                {family.remarks}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </PageLayout>
  );
}