import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, User, Phone, MapPin, Calendar, Baby, Heart, Loader2, ChevronLeft, ChevronRight, UserCheck, UserPlus, Users } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChildHealthRecords } from '../forms/queries/fetchQueries';
import { calculateAge } from '@/helpers/ageCalculator';
import { ChildHealthRecord } from '../forms/muti-step-form/types';
import { filterOptions } from './types';
import PageLayout from '@/screens/_PageLayout';

export default function AllChildHealthRecords() {
  const router = useRouter();
  const { data: childHealthRecords, isLoading, isFetching, refetch } = useChildHealthRecords();

  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const formatChildHealthData = useCallback((): ChildHealthRecord[] => {
    if (!childHealthRecords) {
      return [];
    }

    return childHealthRecords.map((record: any) => {
      const childInfo = record.patrec_details?.pat_details?.personal_info || {};
      const motherInfo = record.patrec_details?.pat_details?.family_head_info?.family_heads?.mother?.personal_info || {};
      const fatherInfo = record.patrec_details?.pat_details?.family_head_info?.family_heads?.father?.personal_info || {};
      const addressInfo = record.patrec_details?.pat_details?.address || {};

      const childRecord: ChildHealthRecord = {
        chrec_id: record.chrec_id || '',
        pat_id: record.patrec_details?.pat_details?.pat_id || '',
        fname: childInfo.per_fname || '',
        lname: childInfo.per_lname || '',
        mname: childInfo.per_mname || '',
        sex: childInfo.per_sex || '',
        age: calculateAge(childInfo.per_dob).toString(),
        dob: childInfo.per_dob || '',
        householdno: record.patrec_details?.pat_details?.households?.[0]?.hh_id || '',
        address: [
          addressInfo.add_sitio,
          addressInfo.add_street,
          addressInfo.add_barangay,
          addressInfo.add_city,
          addressInfo.add_province,
        ].filter(Boolean).join(', ') || 'No address Provided',
        sitio: addressInfo.add_sitio || '',
        landmarks: addressInfo.add_landmarks || '',
        pat_type: record.patrec_details?.pat_details?.pat_type || '',
        mother_fname: motherInfo.per_fname || '',
        mother_lname: motherInfo.per_lname || '',
        mother_mname: motherInfo.per_mname || '',
        mother_contact: motherInfo.per_contact || '',
        mother_occupation: motherInfo.per_occupation || record.mother_occupation || '',
        father_fname: fatherInfo.per_fname || '',
        father_lname: fatherInfo.per_lname || '',
        father_mname: fatherInfo.per_mname || '',
        father_contact: fatherInfo.per_contact || '',
        father_occupation: fatherInfo.per_occupation || record.father_occupation || '',
        family_no: record.family_no || 'Not Provided',
        birth_weight: record.birth_weight || 0,
        birth_height: record.birth_height || 0,
        type_of_feeding: record.type_of_feeding || 'Unknown',
        delivery_type: record.place_of_delivery_type || '',
        place_of_delivery_type: record.place_of_delivery_type || '',
        pod_location: record.pod_location || '',
        pod_location_details: record.pod_location_details || '',
        health_checkup_count: record.health_checkup_count || 0,
        birth_order: record.birth_order || '',
        tt_status: record.tt_status || '',
        street: '',
        barangay: '',
        city: '',
        province: ''
      };

      return childRecord;
    });
  }, [childHealthRecords]);

  const formattedData = useMemo(() => formatChildHealthData(), [formatChildHealthData]);

  const filteredData = useMemo(() => {
    let filtered = formattedData;

    if (searchQuery) {
      filtered = filtered.filter((item) => {
        const searchText = (
          `${item.fname} ${item.lname} ${item.mname} ` +
          `${item.mother_fname} ${item.mother_lname} ${item.mother_mname} ` +
          `${item.father_fname} ${item.father_lname} ${item.father_mname} ` +
          `${item.address} ${item.sitio} ${item.family_no} ${item.pat_type}`
        ).toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      });
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((item) => 
        item.pat_type.toLowerCase() === selectedFilter
      );
    }

    return filtered;
  }, [formattedData, searchQuery, selectedFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const stats = useMemo(() => ({
    totalChildren: formattedData.length,
    residentChildren: formattedData.filter((p) => p.pat_type.toLowerCase() === "resident").length,
    transientChildren: formattedData.filter((p) => p.pat_type.toLowerCase() === "transient").length,
  }), [formattedData]);

  const handleRefresh = useCallback(async () => {
    await refetch();
    setCurrentPage(1);
  }, [refetch]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  };

  const formatFullName = (fname: string, mname: string, lname: string) => {
    return `${fname} ${mname ? mname + ' ' : ''}${lname}`.trim();
  };

  const filterOptions = [
    { id: "all", name: "All Types" },
    { id: "resident", name: "Residents" },
    { id: "transient", name: "Transients" },
  ];

  const renderChildItem = ({ item: child }: { item: ChildHealthRecord }) => (
    <View className="px-4 mb-3">
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-0">
          <TouchableOpacity
            onPress={() => {
              if (!child.chrec_id || !child.pat_id || !child.dob) {
                console.error('Cannot navigate: ChildHealthRecord is missing required fields');
                return;
              }
              const params = { ChildHealthRecord: JSON.stringify(child) };
              router.push({
                pathname: '/admin/childhealth/individual',
                params,
              });
            }}
            className="p-4"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold mb-1">
                  {formatFullName(child.fname, child.mname, child.lname)}
                </Text>
                <View className="flex-row items-center">
                  <Text 
                    // variant={child.pat_type.toLowerCase() === "transient" ? "secondary" : "default"}
                    className="mr-2"
                  >
                    <Text className="text-xs">{child.pat_type}</Text>
                  </Text>
                  <Text 
                    // variant={child.sex.toLowerCase() === "male" ? "default" : "secondary"}
                    className="mr-2"
                  >
                    <Text className="text-xs">{child.sex}</Text>
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {/* Family #{child.family_no} */}
                  </Text>
                </View>
              </View>
              <View className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                <ChevronRight size={16} color="#64748b" />
              </View>
            </View>

            {/* Child Info */}
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Age
                </Text>
                <Text className="text-sm text-slate-700 font-medium">
                  {child.age} years old
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Checkups
                </Text>
                <Text className="text-sm text-slate-700 font-medium">
                  {child.health_checkup_count} visits
                </Text>
              </View>
            </View>

            {/* Parents Section */}
            <View className="bg-slate-50 rounded-lg p-3 mb-3">
              <Text className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                Parents
              </Text>
              <View className="space-y-1">
                <View className="flex-row items-center">
                  <Text className="text-xs text-slate-500 w-12">Mother:</Text>
                  <Text className="text-sm text-slate-700 font-medium flex-1">
                    {formatFullName(child.mother_fname, child.mother_mname, child.mother_lname) || 'Not provided'}
                  </Text>
                </View>
                {child.mother_contact && (
                  <View className="flex-row items-center">
                    <Phone size={12} color="#64748b" />
                    <Text className="text-xs text-slate-500 ml-1">{child.mother_contact}</Text>
                  </View>
                )}
                <View className="flex-row items-center">
                  <Text className="text-xs text-slate-500 w-12">Father:</Text>
                  <Text className="text-sm text-slate-700 font-medium flex-1">
                    {formatFullName(child.father_fname, child.father_mname, child.father_lname) || 'Not provided'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Birth Info */}
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Birth Weight
                </Text>
                <Text className="text-sm text-slate-700 font-medium">
                  {child.birth_weight || 'N/A'} kg
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Feeding Type
                </Text>
                <Text className="text-sm text-slate-700 font-medium">
                  {child.type_of_feeding}
                </Text>
              </View>
            </View>

            {/* Address & Date */}
            <View className="pt-3 border-t border-slate-100">
              <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Address
              </Text>
              <Text className="text-sm text-slate-700 mb-2" numberOfLines={2}>
                {child.address}
              </Text>
              <Text className="text-xs text-slate-500">
                Born: {child.dob ? new Date(child.dob).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </TouchableOpacity>
        </CardContent>
      </Card>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Stats Cards */}
      <View className="px-4 py-4 ">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Card className="bg-blue-100 border-blue-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <Users size={24} color="#3b82f6" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-blue-900">
                      {stats.totalChildren}
                    </Text>
                    <Text className="text-sm text-blue-700">Total</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
          <View className="flex-1">
            <Card className="bg-green-100 border-green-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <UserCheck size={24} color="#059669" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-green-900">
                      {stats.residentChildren}
                    </Text>
                    <Text className="text-sm text-green-700">Residents</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
          <View className="flex-1">
            <Card className="bg-amber-100 border-amber-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <UserPlus size={24} color="#d97706" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-amber-900">
                      {stats.transientChildren}
                    </Text>
                    <Text className="text-sm text-amber-700">Transients</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </View>

      {/* Search & Filter */}
      <View className="px-4 mb-4">
        {/* Search Bar */}
        <Card className="mb-3 bg-white border-slate-300">
          <CardContent className="p-0">
            <View className="flex-row items-center px-4 rounded-xl py-3">
              <Search size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-slate-900 ml-3 "
                placeholder="Search children..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </CardContent>
        </Card>

        {/* Filter */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-2">
            <View className="flex-row justify-between">
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleFilterChange(option.id)}
                  className={`flex-1 items-center py-2 rounded-lg mx-1 ${
                    selectedFilter === option.id ? "bg-blue-600" : "bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedFilter === option.id ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="px-4">
      <Card className="bg-white border-slate-200">
        <CardContent className="items-center justify-center py-12">
          <Baby size={48} color="#94a3b8" />
          <Text className="text-lg font-medium text-slate-900 mt-4">
            No Records Found
          </Text>
          <Text className="text-slate-500 text-center mt-2">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Adjust your search or filter criteria' 
              : 'Add a new child health record to begin'
            }
          </Text>
        </CardContent>
      </Card>
    </View>
  );

  const renderFooter = () => {
    if (filteredData.length === 0 || totalPages <= 1) return null;
    
    return (
      <View className="px-4 mb-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between">
              <Button
                onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant={currentPage === 1 ? "secondary" : "default"}
                className={currentPage === 1 ? "bg-slate-200" : "bg-blue-600"}
              >
                <Text
                  className={`font-medium ${
                    currentPage === 1 ? "text-slate-400" : "text-white"
                  }`}
                >
                  Previous
                </Text>
              </Button>

              <Text className="text-slate-600 font-medium">
                Page {currentPage} of {totalPages}
              </Text>

              <Button
                onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant={currentPage === totalPages ? "secondary" : "default"}
                className={currentPage === totalPages ? "bg-slate-200" : "bg-blue-600"}
              >
                <Text
                  className={`font-medium ${
                    currentPage === totalPages ? "text-slate-400" : "text-white"
                  }`}
                >
                  Next
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Loader2 size={24} color="#3b82f6" />
        <Text className="text-slate-600 mt-3">Loading child health records...</Text>
      </View>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-slate-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Child Health Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-slate-50">
        <FlatList
          data={paginatedData}
          renderItem={renderChildItem}
          keyExtractor={(item) => item.chrec_id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
            />
          }
        />
      </View>
    </PageLayout>
  );
}