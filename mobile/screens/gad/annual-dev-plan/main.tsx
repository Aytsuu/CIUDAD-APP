import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAnnualDevPlanYears } from './restful-api/annualDevPlanGetAPI';

interface FolderItem {
  id: string;
  name: string;
  isCreate?: boolean;
  secondaryText?: string;
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
      
      // Add create folder option
      yearFolders.push({ id: 'create', name: 'Create New Plan', isCreate: true });
      
      setFolders(yearFolders);
    } catch (error) {
      console.error('Error fetching years:', error);
      Alert.alert('Error', 'Failed to load annual development plans');
      // Set default create folder if fetch fails
      setFolders([{ id: 'create', name: 'Create New Plan', isCreate: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderPress = (folder: FolderItem) => {
    if (folder.isCreate) {
      console.log('Create new plan');
      router.push('/gad/annual-dev-plan/create-plan');
    } else {
      console.log(`Opening year: ${folder.name}`);
      // Navigate to view plan for the selected year
      router.push({
        pathname: '/gad/annual-dev-plan/view-plan',
        params: { year: folder.id }
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-blue-50">
      <View className="p-4">
        <View className="pt-12 pb-4">
          <Text className="text-3xl font-bold mb-10 text-gray-800 text-center">
            Annual Development Plan
          </Text>
        </View>
        
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
                    
                    {/* Plus icon for create folder */}
                    {folder.isCreate && (
                      <View className="absolute inset-0 justify-center items-center">
                        <Ionicons name="add" size={24} color="white" />
                      </View>
                    )}
                  </View>
                  
                  {/* Secondary text (faint) for first folder */}
                  {folder.secondaryText && (
                    <Text className="text-xs text-gray-400 mb-1 opacity-60">
                      {folder.secondaryText}
                    </Text>
                  )}
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
    </ScrollView>
  );
};

export default AnnualDevPlanMain;
