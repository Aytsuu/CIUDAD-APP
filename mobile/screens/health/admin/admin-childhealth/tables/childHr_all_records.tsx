import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, Filter, User, Phone, MapPin, Calendar, Baby, Heart, Loader2 } from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { MainLayoutComponent } from '@/components/healthcomponents/mainlayoutcomponent';
import { SelectLayout } from '@/components/ui/select-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChildHealthRecords } from '../forms/queries/fetchQueries';
import { calculateAge } from '@/helpers/ageCalculator';
import { ChildHealthRecord } from '../forms/muti-step-form/types';
import { filterOptions } from './types';

export default function AllChildHealthRecords() {
  const router = useRouter();
  const { data: childHealthRecords, isLoading: isFetchingChildRecords } = useChildHealthRecords();

  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<ChildHealthRecord[]>([]);
  const [currentData, setCurrentData] = useState<ChildHealthRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const formatChildHealthData = useCallback((): ChildHealthRecord[] => {
    if (!childHealthRecords) {
      console.warn('No child health records received from useChildHealthRecords');
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

      if (!childRecord.chrec_id || !childRecord.pat_id || !childRecord.dob) {
        console.warn(`Invalid ChildHealthRecord: missing required fields`, {
          chrec_id: childRecord.chrec_id,
          pat_id: childRecord.pat_id,
          dob: childRecord.dob,
          record,
        });
      }

      return childRecord;
    });
  }, [childHealthRecords]);

  useEffect(() => {
    const formattedData = formatChildHealthData();
    const filtered = formattedData.filter((item) => {
      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'resident' && item.pat_type.toLowerCase() === 'resident') ||
        (selectedFilter === 'transient' && item.pat_type.toLowerCase() === 'transient');

      const matchesSearch = (
        `${item.fname} ${item.lname} ${item.mname} ` +
        `${item.mother_fname} ${item.mother_lname} ${item.mother_mname} ` +
        `${item.father_fname} ${item.father_lname} ${item.father_mname} ` +
        `${item.address} ${item.sitio} ${item.family_no} ${item.pat_type}`
      ).toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [searchQuery, selectedFilter, pageSize, childHealthRecords, formatChildHealthData]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  const formatFullName = (fname: string, mname: string, lname: string) => {
    return `${fname} ${mname ? mname + ' ' : ''}${lname}`.trim();
  };

  const getPatientTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    return lowerType === 'resident' 
      ? 'bg-emerald-100 text-emerald-800' 
      : lowerType === 'transient'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getSexColor = (sex: string) => {
    const lowerSex = sex.toLowerCase();
    return lowerSex === 'male'
      ? 'bg-blue-100 text-blue-800'
      : lowerSex === 'female'
      ? 'bg-rose-100 text-rose-800'
      : 'bg-gray-100 text-gray-800';
  };

  const ChildCard = ({ child }: { child: ChildHealthRecord }) => (
    <TouchableOpacity
      onPress={() => {
        if (!child.chrec_id || !child.pat_id || !child.dob) {
          console.error('Cannot navigate: ChildHealthRecord is missing required fields', {
            chrec_id: child.chrec_id,
            pat_id: child.pat_id,
            dob: child.dob,
            child,
          });
          return;
        }
        const params = { ChildHealthRecord: JSON.stringify(child) };
        router.push({
          pathname: '/admin/childhealth/individual',
          params,
        });
      }}
      className="mb-3"
    >
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="pb-2 px-4 pt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Baby size={24} color="#6b7280" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                  {formatFullName(child.fname, child.mname, child.lname)}
                </Text>
                <View className="flex-row items-center mt-1 gap-2">
                  <Badge className={`px-2 py-1 ${getSexColor(child.sex)}`}>
                    <Text className="text-xs font-medium">{child.sex}</Text>
                  </Badge>
                  <Badge className={`px-2 py-1 ${getPatientTypeColor(child.pat_type)}`}>
                    <Text className="text-xs font-medium">{child.pat_type}</Text>
                  </Badge>
                </View>
              </View>
            </View>
          </View>
        </CardHeader>
        
        <CardContent className="px-4 pb-4 pt-2 space-y-3">
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Calendar size={16} className="text-gray-400 mr-2" />
              <Text className="text-sm text-gray-600 flex-1">
                Age: <Text className="font-medium text-gray-900">{child.age} years</Text>
              </Text>
              <Text className="text-xs text-gray-500">
                {child.dob ? new Date(child.dob).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            
            <View className="flex-row items-start">
              <MapPin size={16} className="text-gray-400 mr-2 mt-0.5" />
              <Text className="text-sm text-gray-600 flex-1" numberOfLines={2}>
                {child.address}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Heart size={16} className="text-gray-400 mr-2" />
              <Text className="text-sm text-gray-600">
                Checkups: <Text className="font-medium text-gray-900">{child.health_checkup_count}</Text>
              </Text>
              <Text className="text-sm text-gray-600 ml-4">
                Family #: <Text className="font-medium text-gray-900">{child.family_no}</Text>
              </Text>
            </View>
          </View>

          <View className="bg-gray-50 rounded-md p-3 space-y-2">
            <Text className="text-sm font-semibold text-gray-800">Parents</Text>
            
            <View className="flex-row items-center">
              <User size={14} className="text-rose-500 mr-2" />
              <Text className="text-sm text-gray-600 flex-1">
                <Text className="font-medium text-gray-800">
                  {formatFullName(child.mother_fname, child.mother_mname, child.mother_lname) || 'Not provided'}
                </Text>
              </Text>
            </View>
            {child.mother_contact && (
              <View className="flex-row items-center ml-5">
                <Phone size={14} className="text-gray-400 mr-2" />
                <Text className="text-sm text-gray-500">{child.mother_contact}</Text>
              </View>
            )}

            <View className="flex-row items-center">
              <User size={14} className="text-blue-500 mr-2" />
              <Text className="text-sm text-gray-600 flex-1">
                <Text className="font-medium text-gray-800">
                  {formatFullName(child.father_fname, child.father_mname, child.father_lname) || 'Not provided'}
                </Text>
              </Text>
            </View>
            {child.father_contact && (
              <View className="flex-row items-center ml-5">
                <Phone size={14} className="text-gray-400 mr-2" />
                <Text className="text-sm text-gray-500">{child.father_contact}</Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-between bg-gray-50 rounded-md p-3">
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-600">Weight</Text>
              <Text className="text-sm font-semibold text-gray-900">{child.birth_weight || 'N/A'} kg</Text>
            </View>
            <View className="items-center flex-1 border-l border-gray-200">
              <Text className="text-xs text-gray-600">Height</Text>
              <Text className="text-sm font-semibold text-gray-900">{child.birth_height || 'N/A'} cm</Text>
            </View>
            <View className="items-center flex-1 border-l border-gray-200">
              <Text className="text-xs text-gray-600">Feeding</Text>
              <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>{child.type_of_feeding}</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  const LoadMoreButton = () => {
    if (currentPage >= totalPages) return null;
    
    return (
      <TouchableOpacity
        onPress={() => setCurrentPage(prev => prev + 1)}
        className="mt-4 mb-6"
      >
        <Button
          variant="outline"
          className="border-gray-200 bg-white rounded-lg"
        >
          <Text className="text-gray-700 font-medium">Load More</Text>
          <Text className="text-xs text-gray-500 mt-1">
            Showing {currentData.length} of {filteredData.length} records
          </Text>
        </Button>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayoutComponent title="Child Health Records" description="Manage and view children's health records">
      <View className="px-4 pt-4 pb-2 bg-white">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-1">
            <Input
              placeholder="Search records..."
              className="bg-gray-50 border-gray-200 rounded-lg pl-10 text-sm"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </View>
          <SelectLayout
            placeholder="Filter"
            label=""
            className="bg-gray-50 border-gray-200 rounded-lg w-24 text-sm"
            options={filterOptions}
            value={selectedFilter}
            onChange={setSelectedFilter}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">
            {filteredData.length} record{filteredData.length !== 1 ? 's' : ''} found
          </Text>
          {selectedFilter !== 'all' && (
            <Badge className="bg-gray-100 text-gray-700 px-2 py-1">
              <Text className="text-xs font-medium">{selectedFilter}</Text>
            </Badge>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {isFetchingChildRecords ? (
          <View className="flex-1 items-center justify-center py-20">
            <Loader2 size={24} className="text-gray-400 animate-spin mb-2" />
            <Text className="text-sm text-gray-500">Loading records...</Text>
          </View>
        ) : currentData.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Baby size={40} className="text-gray-300 mb-3" />
            <Text className="text-base font-medium text-gray-600 mb-1">No Records Found</Text>
            <Text className="text-sm text-gray-500 text-center px-8">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Adjust your search or filter criteria' 
                : 'Add a new child health record to begin'
              }
            </Text>
          </View>
        ) : (
          <>
            {currentData.map((child) => (
              <ChildCard key={child.chrec_id} child={child} />
            ))}
            <LoadMoreButton />
          </>
        )}
      </ScrollView>
    </MainLayoutComponent>
  );
}