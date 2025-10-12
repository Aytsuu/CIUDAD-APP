import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '@/screens/_PageLayout';
import { fetchFamilyHealthProfiling } from '@/api/health-family-profiling-api';
import { ChevronLeft, Users, Home, Droplet, Heart, FileText } from 'lucide-react-native';

export default function FamilyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: familyData, isLoading, error } = useQuery({
    queryKey: ['family-health-profiling', id],
    queryFn: () => fetchFamilyHealthProfiling(id as string),
    enabled: !!id,
  });

  const InfoCard = ({ icon: Icon, title, children, color = '#3B82F6' }: any) => (
    <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
      <View className="flex-row items-center mb-3">
        <View style={{ backgroundColor: `${color}15` }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
          <Icon size={20} color={color} />
        </View>
        <Text className="text-lg font-semibold text-gray-900">{title}</Text>
      </View>
      {children}
    </View>
  );

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">{value || 'N/A'}</Text>
    </View>
  );

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <View className="items-center">
          <Text className="text-gray-900 text-base font-semibold">
            Family Profile
          </Text>
        </View>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-gray-600 mt-4">Loading family profile...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-red-600 text-center">Error loading family profile</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="py-4">
            {/* Family Info */}
            <InfoCard icon={Users} title="Family Information" color="#8B5CF6">
              <InfoRow label="Family ID" value={familyData?.family?.fam_id} />
              <InfoRow label="Building Type" value={familyData?.family?.fam_building} />
              <InfoRow label="Indigenous" value={familyData?.family?.fam_indigenous} />
              <InfoRow label="Registration Date" value={familyData?.family?.fam_date_registered ? new Date(familyData.family.fam_date_registered).toLocaleDateString() : 'N/A'} />
            </InfoCard>

            {/* Household Info */}
            {familyData?.household && (
              <InfoCard icon={Home} title="Household Information" color="#F59E0B">
                <InfoRow label="Household ID" value={familyData.household.hh_id} />
                <InfoRow label="NHTS" value={familyData.household.hh_nhts} />
                <InfoRow label="Address" value={familyData.household.address || 'N/A'} />
              </InfoCard>
            )}

            {/* Family Members */}
            {familyData?.family_members && familyData.family_members.length > 0 && (
              <InfoCard icon={Users} title="Family Members" color="#10B981">
                {familyData.family_members.map((member: any, index: number) => (
                  <View key={index} className="py-2 border-b border-gray-100">
                    <Text className="text-sm font-medium text-gray-900">
                      {member.name || `${member.first_name} ${member.last_name}`}
                    </Text>
                    <Text className="text-xs text-gray-600 mt-1">
                      {member.role || member.fc_role} • Age: {member.age || 'N/A'}
                    </Text>
                  </View>
                ))}
              </InfoCard>
            )}

            {/* Environmental Health */}
            {familyData?.environmental && (
              <InfoCard icon={Droplet} title="Environmental Health" color="#3B82F6">
                <InfoRow label="Water Supply" value={familyData.environmental.water_supply?.type} />
                <InfoRow label="Sanitary Facility" value={familyData.environmental.sanitary_facility?.type} />
                <InfoRow label="Toilet Type" value={familyData.environmental.sanitary_facility?.toilet_type} />
                <InfoRow label="Waste Management" value={familyData.environmental.waste_management?.type} />
              </InfoCard>
            )}

            {/* Health Records */}
            {(familyData?.ncd_records?.length > 0 || familyData?.tb_records?.length > 0) && (
              <InfoCard icon={Heart} title="Health Records" color="#EF4444">
                {familyData.ncd_records?.length > 0 && (
                  <View className="mb-2">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">
                      NCD Records: {familyData.ncd_records.length}
                    </Text>
                  </View>
                )}
                {familyData.tb_records?.length > 0 && (
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-1">
                      TB Records: {familyData.tb_records.length}
                    </Text>
                  </View>
                )}
              </InfoCard>
            )}

            {/* Survey Info */}
            {familyData?.survey && (
              <InfoCard icon={FileText} title="Survey Information" color="#6366F1">
                <InfoRow label="Survey ID" value={familyData.survey.si_id} />
                <InfoRow label="Filled By" value={familyData.survey.si_filled_by} />
                <InfoRow label="Informant" value={familyData.survey.si_informant} />
                <InfoRow label="Checked By" value={familyData.survey.si_checked_by} />
                <InfoRow label="Survey Date" value={familyData.survey.si_date ? new Date(familyData.survey.si_date).toLocaleDateString() : 'N/A'} />
              </InfoCard>
            )}
          </View>
        </ScrollView>
      )}
    </PageLayout>
  );
}
