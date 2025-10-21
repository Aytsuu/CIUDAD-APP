import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import PageLayout from '@/screens/_PageLayout';
import { useGetFamilyList } from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { ChevronLeft, Search, Users, ChevronRight } from 'lucide-react-native';

export default function FamilyRecordsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: families = [], isLoading, error } = useGetFamilyList();

  const filteredFamilies = families.filter((family: any) => {
    const searchLower = searchQuery.toLowerCase();
    const familyId = family.fam_id || '';
    const hhId = family.hh_id || '';
    return familyId.toLowerCase().includes(searchLower) || 
           hhId.toLowerCase().includes(searchLower);
  });

  const renderFamilyCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(health)/family/${item.fam_id}` as any)}
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-3">
            <Users size={24} color="#8B5CF6" />
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              Family ID: {item.fam_id}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Household: {item.hh_id || 'N/A'}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Registered: {item.fam_date_registered ? new Date(item.fam_date_registered).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
        
        <ChevronRight size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
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
            Family Records
          </Text>
        </View>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-5">
        {/* Search Bar */}
        <View className="my-4">
          <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 py-3">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="Search by Family ID or Household ID"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Family List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-gray-600 mt-4">Loading families...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-600">Error loading families</Text>
          </View>
        ) : filteredFamilies.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Users size={64} color="#D1D5DB" />
            <Text className="text-gray-600 mt-4 text-center">
              {searchQuery ? 'No families found matching your search' : 'No families registered yet'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredFamilies}
            keyExtractor={(item) => item.fam_id}
            renderItem={renderFamilyCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </PageLayout>
  );
}
