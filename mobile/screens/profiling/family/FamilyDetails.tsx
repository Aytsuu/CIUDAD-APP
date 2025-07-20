import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
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
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useGetFamilyMembers } from "../queries/profilingGetQueries";

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

  const { data: familyMembers, isLoading: loadingFam } = useGetFamilyMembers(family?.fam_id);
  const members = familyMembers?.results || []
  const totalCount = familyMembers?.count || 0

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
    <View className="flex-row items-center py-3 border-t border-gray-100">
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Icon size={18} className="text-gray-600" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-sm">{label}</Text>
        <Text className={`text-base font-medium ${valueColor}`}>{value}</Text>
      </View>
    </View>
  );

  const FamilyMemberCard = ({ member }: { member: any }) => (
    <View className="bg-gray-50 rounded-lg p-4 mb-3">
      <View className="flex-row items-center mb-2">
        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
          <Text className="text-blue-600 font-bold text-lg">
            {member.name?.split(",")[0]?.charAt(0)?.toUpperCase() || "N"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base">{member.name}</Text>
          <Text className="text-blue-600 text-sm font-medium">{member.fc_role}</Text>
        </View>
      </View>
      <View className="ml-15">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500 text-sm">ID:</Text>
          <Text className="text-gray-700 text-sm">{member.rp_id}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500 text-sm">Gender:</Text>
          <Text className="text-gray-700 text-sm">{member.sex}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500 text-sm">Status:</Text>
          <Text className="text-gray-700 text-sm">{member.status}</Text>
        </View>
        {member.dob && (
          <View className="flex-row justify-between">
            <Text className="text-gray-500 text-sm">Birth Date:</Text>
            <Text className="text-gray-700 text-sm">{member.dob}</Text>
          </View>
        )}
      </View>
    </View>
  )

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
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 px-5"
        overScrollMode="never"
        showsHorizontalScrollIndicator={false} 
        showsVerticalScrollIndicator={false}
      >
        {/* Family Header */}
        <View className="pb-6">
          <View className="items-center">
            <Text className="text-gray-500 text-sm text-center mb-2">
              Family ID
            </Text>
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">
              {family.fam_id}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-600 font-medium text-sm">
                  {`${family.members} ${family.members === 1 ? 'Member' : 'Members'}`}
                </Text>
              </View>
              {family.fam_indigenous && (
                <View className="bg-orange-100 px-3 py-1 rounded-full">
                  <Text className="text-orange-600 font-medium text-sm">
                    Indigenous
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Family Overview */}
        <Card className="mt-4 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Family Overview
          </Text>
          
          <InfoRow icon={Home} label="Household Number" value={family.household_no} />
          <InfoRow icon={MapPin} label="Location" value={`Sitio ${family.sitio}${family.street !== 'N/A' ? `, ${family.street}` : ''}`} />
          <InfoRow icon={Calendar} label="Date Registered" 
            value={formatDate(family.fam_date_registered, true) as string} 
          />
          
          <View className="flex-row items-center py-3">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
              <UserRound size={18} className="text-gray-600" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Registered By</Text>
              <Text className="text-gray-900 text-base font-medium">{family.registered_by}</Text>
            </View>
          </View>
        </Card>

        {/* Family Heads */}
        <Card className="mt-4 p-4">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Family Heads
          </Text>
          
          {family.father !== '-' && (
            <InfoRow icon={UserRound} label="Father" value={family.father} />
          )}
          
          {family.mother !== '-' && (
            <InfoRow icon={UserRound} label="Mother" value={family.mother} />
          )}
          
          {family.guardian !== '-' && (
            <InfoRow icon={UserRound} label="Guardian" value={family.guardian} />
          )}
        </Card>

        {/* Family Members with Accordion */}
        {members.length > 0 &&  (<View className="mt-4 mb-6">
          <Accordion type="single" className="border-0">
            <AccordionItem value="family-members" className="border-0">
              <AccordionTrigger className="px-2 py-4">
                <View className="flex-row justify-between items-center flex-1">
                  <Text className="text-gray-900 font-semibold text-lg">Family Members</Text>
                  {!loadingFam && totalCount > 0 && (
                    <View className="bg-blue-100 px-2 py-1 rounded-full mr-4">
                      <Text className="text-blue-600 text-xs font-medium">
                        {totalCount} member{totalCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-4">
                {loadingFam ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-sm mt-2">Loading family members...</Text>
                  </View>
                ) : members.length > 0 ? (
                  <ScrollView className="max-h-96" 
                    showsVerticalScrollIndicator={false} 
                    overScrollMode="never"
                    nestedScrollEnabled={true}
                  >
                    {members.map((member: any, index: number) => (
                      <FamilyMemberCard key={member.rp_id || index} member={member} />
                    ))}
                  </ScrollView>
                ) : (
                  <View className="items-center py-8">
                    <UsersRound size={48} className="text-gray-300 mb-2" />
                    <Text className="text-gray-500 text-sm">No family members found</Text>
                  </View>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>)}
      </ScrollView>
    </PageLayout>
  );
}