import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAnnualDevPlanYears } from './restful-api/annualDevPlanGetAPI';
import PageLayout from '@/screens/_PageLayout';

interface FolderItem {
  id: string;
  name: string;
}

const AnnualDevPlanMain = () => {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const years = await getAnnualDevPlanYears();
      const yearFolders: FolderItem[] = years.map((year: number) => ({
        id: year.toString(),
        name: `Year ${year}`,
      }));
      
      setFolders(yearFolders);
    } catch (error) {
      console.error('Error fetching years:', error);
      Alert.alert('Error', 'Failed to load annual development plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderPress = (folder: FolderItem) => {
    console.log(`Opening year: ${folder.name}`);
    // Navigate to view plan for the selected year
    router.push({
      pathname: '/(gad)/annual-dev-plan/view-plan',
      params: { year: folder.id }
    });
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">Annual Development Plan</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 p-6">
        <View className="flex-row flex-wrap justify-between">
          {isLoading ? (
            <View className="w-full items-center py-8">
              <Text className="text-gray-600">Loading...</Text>
            </View>
          ) : (
            folders.map((folder, index) => (
            <TouchableOpacity
              key={folder.id}
              className="w-[48%] mb-6 items-center"
              onPress={() => handleFolderPress(folder)}
              activeOpacity={0.7}
            >
              <View className="items-center">
                {/* Folder Icon */}
                <View className="relative">
                  <View className="w-16 h-12 bg-yellow-400 rounded-t-lg relative">
                    {/* Folder tab */}
                    <View className="absolute -top-1 left-2 w-8 h-3 bg-yellow-400 rounded-t-lg" />
                  </View>
                </View>
                
                {/* Folder name */}
                <Text className="text-sm font-medium text-gray-800 mt-2 text-center">
                  {folder.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))
          )}
        </View>
      </View>
    </PageLayout>
  );
};

export default AnnualDevPlanMain;
