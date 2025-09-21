import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { router } from "expo-router";
import {
  Search,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Users,
  UserCheck,
  MapPinHouse
} from "lucide-react-native";
import PageLayout from "@/screens/_PageLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useMaternalRecords, useActivepregnanciesCount } from "./queries/maternalFETCH";
import { AgeCalculation } from "@/helpers/ageCalculator";
import { date } from "zod";

// interface for maternal records
interface maternalRecords {
   pat_id: string;
   age: number;

   personal_info: {
      per_fname: string;
      per_lname: string;
      per_mname: string;
      per_sex: string;
      per_dob?: string;
      ageTime: string;
   };

   address?: {
      add_street?: string;
      add_barangay?: string;
      add_city?: string;
      add_province?: string;
      add_external_sitio?: string;
      add_sitio?: string;
   };

   pat_type: "Transient" | "Resident";
   patrec_type?: string;
}

  
// main component
export default function IndividualMaternalRecordScreen() {
   const [searchQuery, setSearchQuery] = useState("");
   const [pageSize, setPageSize] = useState(10);
   const [currentPage, setCurrentPage] = useState(1);

   const { data: maternalRecords, isLoading: maternalPatientsLoading } = useMaternalRecords();
   const { data: activePregnancies, isLoading: activePregnanciesLoading } = useActivepregnanciesCount();

   const activePregnanciesCount = activePregnancies || 0;
   const maternalPatientsCount = maternalRecords?.count || 0;   

   // filtered records based on search query
   const filteredRecords = useMemo(() => {
      let filtered = maternalRecords?.patients || [];

      if (searchQuery) {
         filtered = filtered.filter((record:any) => 
            record.personal_info.per_fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.personal_info.per_lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.personal_info.per_mname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.pat_id.toLowerCase().includes(searchQuery.toLowerCase())
         );
      }
      return filtered;
   }, [maternalRecords, searchQuery])

   // paginated records
   const paginatedRecords = useMemo(() => {
      const startIndex = (currentPage - 1) * pageSize;
      return filteredRecords.slice(startIndex, startIndex + pageSize);
   }, [filteredRecords, currentPage, pageSize])

   // total pages
   const totalPages = Math.ceil(filteredRecords.length / pageSize);

   // handle page change
   const handlePageChange = (page:number) => {
      if (page >= 1 && page <= totalPages) {
         setCurrentPage(page);
      }
   }

   // navigating to individual record
   const handleRecordPress = (patientId: string) => {
      try {
         router.push({
            pathname: "/admin/maternal/individual",
            params: { patientId },
         });
      } catch (error) {
         console.error("Error navigating to individual record: ", error);  
      }
   } 

   // badge variant based on patient type
   const getBadgeVariant = (type:string) => {
      switch(type) {
         case "Resident" :
            return "text-center bg-green-300 text-green-800";
         case "Transient" :
            return "px-2 py-1 rounded-md bg-blue-500 text-white";
         default:
            return "text-center bg-gray-300 text-gray-800";
      }
   }

   const dobLong = (date: string | undefined) =>{
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric'
      })
   }
   //  render components
   const renderHeader = () => (
      <View>
         {/* Stats Cards */}
         <View className="px-4 py-4">
            <View className="flex-row gap-3">
               <View className="flex-1">
               <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                     <View className="flex-row items-center">
                     <Users size={24} color="#3b82f6" />
                     <View className="ml-3">
                        <Text className="text-2xl font-bold text-blue-900">
                           {maternalPatientsCount || 0}
                        </Text>
                        <Text className="text-sm text-center text-blue-700">Maternal Patients</Text>
                     </View>
                     </View>
                  </CardContent>
               </Card>
               </View>
               <View className="flex-1">
               <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                     <View className="flex-row items-center">
                     <UserCheck size={24} color="#059669" />
                     <View className="ml-3">
                        <Text className="text-2xl font-bold text-green-900">
                           {activePregnanciesCount || 0}
                        </Text>
                        <Text className="text-sm text-green-700">
                           Active Pregnancies
                        </Text>
                     </View>
                     </View>
                  </CardContent>
               </Card>
               </View>
            </View>
         </View>

         {/* Search & Filter */}
         <View className="px-4 mb-2">
            {/* Search Bar */}
            <Card className="mb-3 bg-white border-slate-200">
               <CardContent className="p-0">
               <View className="flex-row items-center px-4 py-3">
                  <Search size={18} color="#94a3b8" />
                  <TextInput
                     className="flex-1 text-slate-900 ml-3"
                     placeholder="Search patients..."
                     value={searchQuery}
                     onChangeText={setSearchQuery}
                     accessibilityLabel="Search for maternal records..."
                  />
               </View>
               </CardContent>
            </Card>
         </View>
      </View>
   );

   const renderRecordItem = ({ item }: { item: maternalRecords }) => (
      <View className="px-4 mb-2">
         <Card>
            <CardContent>
               <TouchableOpacity
                  onPress={() => handleRecordPress(item.pat_id)}
                  accessibilityLabel={`View records for ${item.personal_info.per_fname} ${item.personal_info.per_lname}`}
                  className="py-4"
               >
                  <View className="flex-row items-center">
                     <View className="flex-1 gap-1">
                        <View className="flex-row items-center">
                           <Text className="text-lg font-semibold text-slate-900">{item.personal_info.per_lname}, {item.personal_info.per_fname} {item.personal_info.per_mname}</Text>
                          
                        </View>
                        
                        <View className="flex-row items-center">
                           <Text className="text-sm bg-black text-white px-1.5 border rounded-md mr-1">
                              ID: {item.pat_id}
                           </Text>
                        </View>
                        <View className="flex-row items-center mt-1 gap-8">
                           <View className="flex-col gap-1">
                              <Text className="text-sm text-slate-500">
                                 Patient Type
                              </Text>
                              <View
                                 className={getBadgeVariant(item.pat_type)}
                              >
                                 <Text className="text-[12px] text-white text-center">{item.pat_type.toUpperCase()}</Text>
                              </View>
                           </View>
                           <View className="flex-col gap-1">
                              <Text className="text-sm text-slate-500">
                                 Date of Birth 
                              </Text>
                              <View className="bg-orange-500 px-2 py-1 rounded-md">
                                 <Text className="text-[12px] text-white">
                                    {dobLong(item.personal_info.per_dob ?? "")}
                                 </Text>
                              </View>
                              
                           </View>
                           <View className="flex-col gap-1">
                              <Text className="text-sm text-slate-500">
                                 Age:
                              </Text>
                              <Text className="bg-green-600 px-2 py-1 rounded text-[12px] text-white">
                                 {AgeCalculation(item.personal_info.per_dob ?? "")} yrs old
                              </Text>
                           </View>
                        </View>
                     </View>
                     <View>
                        <ChevronRight size={20} color="#64748b" />
                     </View>
                  </View>
               </TouchableOpacity>
            </CardContent>
            <CardFooter>
               <View className="mb-0">
                     <View className="flex-row">
                        <MapPinHouse size={16} color="green" />
                        <Text className="text-sm text-slate-500 ml-2">
                           {item?.address?.add_street}, {item?.address?.add_sitio}, {item?.address?.add_barangay}, {item?.address?.add_city}, {item?.address?.add_province}
                        </Text>
                     </View>
                  </View>
            </CardFooter>
         </Card>
      </View>
   )

   const renderEmpty = () => (
      <View className="px-4">
      <Card className="bg-white border-slate-200">
         <CardContent className="items-center justify-center py-12">
            <FileText size={48} color="#94a3b8" />
            <Text className="text-lg font-medium text-slate-900 mt-4">
            No records found
            </Text>
            <Text className="text-slate-500 text-center mt-2">
            Try adjusting your search or filter criteria
            </Text>
         </CardContent>
      </Card>
      </View>
   );

   const renderFooter = () => {
      if (filteredRecords.length === 0 || totalPages === 1) return null;

      return (
         <View className="px-4 mb-3">
            <Card className="bg-white border-slate-200">
               <CardContent className="p-4">
                  <View className="flex-row items-center justify-between">
                     <Button
                        onPress={() => handlePageChange(currentPage - 1)}
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
                        {currentPage} of {totalPages}
                     </Text>
      
                     <Button
                        onPress={() => handlePageChange(currentPage + 1)}
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
      )
   }

   // loading conditions
   if (maternalPatientsLoading || activePregnanciesLoading) {
      return (
         <View>
            <Text>Loading...</Text>
         </View>
      )
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
         headerTitle={<Text className="text-slate-900 text-[13px]">Maternal Individual Records</Text>}
         rightAction={<View className="w-10 h-10" />}
         >
         <View className="flex-1 bg-slate-50">
            <FlatList
               data={paginatedRecords}
               renderItem={renderRecordItem}
               keyExtractor={(item) => item.pat_id}
               ListHeaderComponent={renderHeader}
               ListEmptyComponent={renderEmpty}
               ListFooterComponent={renderFooter}
               contentContainerStyle={{ paddingBottom: 20 }}
               showsVerticalScrollIndicator={false}
               refreshControl={
               <RefreshControl
                  refreshing={false}
                  onRefresh={() => {}}
                  tintColor="#3b82f6"
                  colors={["#3b82f6"]}
               />
               }
            />
         </View>
      </PageLayout>
   )
}
