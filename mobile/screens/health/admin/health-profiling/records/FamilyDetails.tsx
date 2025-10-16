import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useGetFamilyMembers } from "../../../../profiling/queries/profilingGetQueries";

export default function FamilyDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
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
    router.push({
      pathname: '/(profiling)/resident/details',
      params: {
        resident: JSON.stringify(member)
      }
    });
  };

  const InfoRow = ({ label, value }: { label: string, value: string | number }) => (
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-gray-900 text-sm">{value}</Text>
    </View>
  );

  const FamilyMemberCard = ({ member }: { member: any }) => (
    <View className="py-3 border-b border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-sm">{member.name}</Text>
          <Text className="text-blue-600 text-xs mt-0.5">{member.fc_role}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{member.rp_id}</Text>
      </View>
      <View className="flex-row gap-4">
        <Text className="text-gray-600 text-xs">{member.sex}</Text>
        <Text className="text-gray-600 text-xs">{member.status}</Text>
        {member.dob && <Text className="text-gray-600 text-xs">{member.dob}</Text>}
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
          Family
        </Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1"
        overScrollMode="never"
        showsHorizontalScrollIndicator={false} 
        showsVerticalScrollIndicator={false}
      >
        {/* Family Header */}
        <View className="px-5 pt-4 pb-6 border-b border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-2">
            {family.fam_id}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-600 text-sm">
              {family.members} {family.members === 1 ? 'member' : 'members'}
            </Text>
            {family.fam_indigenous && (
              <>
                <Text className="text-gray-400">•</Text>
                <Text className="text-orange-600 text-sm">Indigenous</Text>
              </>
            )}
          </View>
        </View>

        {/* Basic Information */}
        <View className="px-5 py-4">
          <InfoRow label="Household Number" value={family.household_no} />
          <InfoRow label="Location" value={`Sitio ${family.sitio}${family.street !== 'N/A' ? `, ${family.street}` : ''}`} />
          <InfoRow label="Date Registered" value={formatDate(family.fam_date_registered, "short") as string} />
          <InfoRow label="Registered By" value={family.registered_by} />
        </View>

        {/* Family Heads */}
        {(family.father || family.mother || family.guardian) && (
          <View className="px-5 py-4 border-b border-gray-100">
            <Text className="text-gray-900 font-medium text-sm mb-3">Family Heads</Text>
            {family.father && <InfoRow label="Father" value={family.father} />}
            {family.mother && <InfoRow label="Mother" value={family.mother} />}
            {family.guardian && <InfoRow label="Guardian" value={family.guardian} />}
          </View>
        )}

        {/* Family Members */}
        {members.length > 0 && (
          <View className="px-5 py-4">
            <Accordion type="single" className="border-0">
              <AccordionItem value="family-members" className="border-0">
                <AccordionTrigger className="py-3">
                  <View className="flex-row justify-between items-center flex-1 mr-2">
                    <Text className="text-gray-900 font-medium text-sm">Family Members</Text>
                    {!loadingFam && totalCount > 0 && (
                      <Text className="text-gray-500 text-xs">{totalCount}</Text>
                    )}
                  </View>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {loadingFam ? (
                    <View className="items-center py-8">
                      <ActivityIndicator size="small" color="#3B82F6" />
                      <Text className="text-gray-500 text-xs mt-2">Loading...</Text>
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
                      <Text className="text-gray-400 text-xs">No family members found</Text>
                    </View>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </View>
        )}
        
        <View className="h-6" />
      </ScrollView>
    </PageLayout>
  );
}