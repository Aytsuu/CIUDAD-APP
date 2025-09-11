import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, User, Phone, MapPin, Calendar, Baby, Heart, Loader2, ChevronLeft, ChevronRight, UserCheck, UserPlus, Users, Filter } from 'lucide-react-native';
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
  const [pageSize, setPageSize] = useState(20); // Increased default page size
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false); // Collapsible filter

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
    <TouchableOpacity
      onPress={() => {
        if (!child.chrec_id || !child.pat_id || !child.dob) {
          console.error('Missing required fields');
          return;
        }
        router.push({
          pathname: '/admin/childhealth/individual',
          params: { ChildHealthRecord: JSON.stringify(child) },
        });
      }}
      className="bg-white border-b border-slate-100 p-3 active:bg-slate-50"
    > <View className="flex-row items-center justify-between">
        {/* Main Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
              {child.fname} {child.lname}
            </Text>
            <Badge
              variant={child.pat_type.toLowerCase() === "transient" ? "secondary" : "default"}
              className="bg-blue-600 ml-2"
            >
              <Text className="text-xs">{child.pat_type}</Text>
            </Badge>
          </View>

          <View className="flex-row items-center mb-1">
            <Text className="text-xs text-slate-500 mr-3">
              <Text>Age: {child.age}y</Text>
            </Text>
            <Text className="text-xs text-slate-500">
              <Text>Sex: {child.sex}</Text>
            </Text>
            <Text className="text-xs text-slate-500 ml-3">
              <Text>Checkups: {child.health_checkup_count}</Text>
            </Text>
          </View>


          <View className="flex-row items-center">
            <Users size={12} color="#64748b" />
            <Text className="text-xs text-slate-500 ml-1" numberOfLines={1}>
              Family #: {child.family_no}
            </Text>
          </View>

          {/* Parents - Compact */}
          <View className="flex-row items-start mt-1">
            <Text className="text-xs text-slate-400 mr-2">P:</Text>
            <View className="flex-1">
              <Text className="text-xs text-slate-600" numberOfLines={1}>
                M: {child.mother_fname} {child.mother_lname}
              </Text>
              <Text className="text-xs text-slate-600" numberOfLines={1}>
                F: {child.father_fname} {child.father_lname}
              </Text>
            </View>
          </View>
        </View>
        <ChevronRight size={16} color="#94a3b8" className="ml-2" />
      </View>
    </TouchableOpacity>
  );

  //           {/* Birth Info */}
  //           <View className="flex-row justify-between mb-3">
  //             <View className="flex-1 mr-3">
  //               <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
  //                 Birth Weight
  //               </Text>
  //               <Text className="text-sm text-slate-700 font-medium">
  //                 {child.birth_weight || 'N/A'} kg
  //               </Text>
  //             </View>
  //             <View className="flex-1 ml-3">
  //               <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
  //                 Feeding Type
  //               </Text>
  //               <Text className="text-sm text-slate-700 font-medium">
  //                 {child.type_of_feeding}
  //               </Text>
  //             </View>
  //           </View>

  //           {/* Address & Date */}
  //           <View className="pt-3 border-t border-slate-100">
  //             <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
  //               Address
  //             </Text>
  //             <Text className="text-sm text-slate-700 mb-2" numberOfLines={2}>
  //               {child.address}
  //             </Text>
  //             <Text className="text-xs text-slate-500">
  //               Born: {child.dob ? new Date(child.dob).toLocaleDateString() : 'N/A'}
  //             </Text>
  //           </View>
  //         </TouchableOpacity>
  //       </CardContent>
  //     </Card>
  //   </View>
  // );

   const renderHeader = () => (
    <View>
      {/* Stats Cards - More Compact */}
      <View className="px-4 py-3 bg-slate-50">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Card className="bg-white border-slate-200 shadow-xs">
              <CardContent className="p-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-slate-900">{stats.totalChildren}</Text>
                    <Text className="text-xs text-slate-500">Total</Text>
                  </View>
                  <Users size={20} color="#64748b" />
                </View>
              </CardContent>
            </Card>
          </View>
          <View className="flex-1">
            <Card className="bg-white border-slate-200 shadow-xs">
              <CardContent className="p-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-green-700">{stats.residentChildren}</Text>
                    <Text className="text-xs text-slate-500">Residents</Text>
                  </View>
                  <UserCheck size={20} color="#22c55e" />
                </View>
              </CardContent>
            </Card>
          </View>
          <View className="flex-1">
            <Card className="bg-white border-slate-200 shadow-xs">
              <CardContent className="p-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-amber-700">{stats.transientChildren}</Text>
                    <Text className="text-xs text-slate-500">Transients</Text>
                  </View>
                  <UserPlus size={20} color="#f59e0b" />
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </View>

      {/* Search & Filter Bar - Always Visible */}
      <View className="px-4 py-3 border-b border-slate-200 bg-white">
        <View className="flex-row items-center">
          {/* Search Input */}
          <View className="flex-1 flex-row items-center bg-slate-100 rounded-lg px-3 py-2 mr-2">
            <Search size={18} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-2 text-slate-900"
              placeholder="Search by name or family #..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {/* Filter Toggle Button */}
          <TouchableOpacity
            onPress={() => setIsFilterVisible(!isFilterVisible)}
            className={`p-2 rounded-lg ${isFilterVisible ? 'bg-blue-100' : 'bg-slate-100'}`}
          >
            <Filter size={18} color={isFilterVisible ? "#3b82f6" : "#64748b"} />
          </TouchableOpacity>
        </View>

        {/* Collapsible Filter Options */}
        {isFilterVisible && (
          <View className="flex-row justify-between mt-3">
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleFilterChange(option.id)}
                className={`flex-1 items-center py-2 rounded-lg mx-1 ${selectedFilter === option.id ? "bg-blue-600" : "bg-slate-100"}`}
              >
                <Text className={`text-xs font-medium ${selectedFilter === option.id ? "text-white" : "text-slate-700"}`}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Results Count */}
      <View className="px-4 py-2 bg-slate-50 border-b border-slate-200">
        <Text className="text-xs text-slate-500">
          Showing {paginatedData.length} of {filteredData.length} records
          {selectedFilter !== 'all' ? ` (Filtered: ${selectedFilter})` : ''}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="px-4 py-12">
      <Card className="bg-white border-slate-200">
        <CardContent className="items-center justify-center py-8">
          <Baby size={40} color="#94a3b8" />
          <Text className="text-lg font-medium text-slate-900 mt-4">
            No Records Found
          </Text>
          <Text className="text-slate-500 text-center mt-1 text-sm">
            {searchQuery || selectedFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'No child health records found.'
            }
          </Text>
        </CardContent>
      </Card>
    </View>
  );

  const renderFooter = () => {
    if (filteredData.length === 0 || totalPages <= 1) return null;
    
    return (
      <View className="px-4 py-3 bg-white border-t border-slate-200">
        <View className="flex-row items-center justify-between">
          <Button
            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <Text>Previous</Text>
          </Button>

          <Text className="text-slate-600 text-sm font-medium">
            Page {currentPage} of {totalPages}
          </Text>

          <Button
            onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <PageLayout headerTitle="Child Health Records">
        <View className="flex-1 bg-slate-50 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-slate-600 mt-3">Loading records...</Text>
        </View>
      </PageLayout>
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
      <View className="flex-1 bg-white p-2">
        <FlatList
          data={paginatedData}
          renderItem={renderChildItem}
          keyExtractor={(item) => item.chrec_id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          getItemLayout={(data, index) => ({ length: 120, offset: 120 * index, index })} // Optimizes scroll performance
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
            />
          }
        />
      </View>
    </PageLayout>
  );
}