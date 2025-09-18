import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl } from "react-native";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ArrowLeft,
  Search,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Users,
  UserCheck,
  UserPlus
} from "lucide-react-native";
import PageLayout from "@/screens/_PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useMaternalRecords, useActivepregnanciesCount } from "./queries/maternalFETCH";


export default function OverallMaternalRecordScreen() {

   const { data: maternalRecords } = useMaternalRecords();
   const { data: activePregnancies } = useActivepregnanciesCount();

  const activePregnanciesCount = activePregnancies || 0;
  const maternalPatientsCount = maternalRecords.count


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
                        {maternalPatientsCount}
                     </Text>
                     <Text className="text-sm text-center text-blue-700">Patients</Text>
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
      <View className="px-4 mb-4">
         {/* Search Bar */}
         <Card className="mb-3 bg-white border-slate-200">
            <CardContent className="p-0">
            <View className="flex-row items-center px-4 py-3">
               <Search size={18} color="#94a3b8" />
               <TextInput
                  className="flex-1 text-slate-900 ml-3"
                  placeholder="Search patients..."
                  value={("")}
                  onChangeText={() => {}}
                  accessibilityLabel="Search for maternal records..."
               />
            </View>
            </CardContent>
         </Card>

         {/* Filter */}
         {/* <Card className="bg-white border-slate-200">
            <CardContent className="p-2">
            <View className="flex-row justify-between">
               {clientTypeOptions.map((option:any) => (
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
         </Card> */}
      </View>
      </View>
   );

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
         headerTitle={<Text className="text-slate-900 text-[13px]">Maternal Records</Text>}
         rightAction={<View className="w-10 h-10" />}
         >
         <View className="flex-1 bg-slate-50">
            <FlatList
               data={[]}
               renderItem={() => null}
               keyExtractor={(item, index) => index.toString()}
               ListHeaderComponent={renderHeader}
               ListEmptyComponent={renderEmpty}
               ListFooterComponent={<View className="h-4" />}
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
