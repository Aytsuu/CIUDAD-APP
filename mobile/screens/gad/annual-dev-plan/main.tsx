import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAnnualDevPlanYears } from './restful-api/annualDevPlanGetAPI';
import PageLayout from '@/screens/_PageLayout';
import { LoadingState } from '@/components/ui/loading-state';
import { useGetArchivedAnnualDevPlans } from './queries/annualDevPlanQueries';
import { ArchivePlanContent } from './archive-plan';

interface FolderItem {
  id: string;
  name: string;
}

const AnnualDevPlanMain = () => {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'main' | 'archive'>('main');

  // Get archived plans count
  const { data: archivedData } = useGetArchivedAnnualDevPlans(1, 1);
  const archivedCount = archivedData?.count || 0;

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

  const renderContent = () => {
    if (activeTab === 'archive') {
      return <ArchivePlanContent />;
    }

    if (isLoading) {
      return <LoadingState />;
    }

    return (
      <View className="flex-1 p-6">
        <View className="flex-row flex-wrap justify-between">
          {folders.map((folder, index) => (
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
        ))}
        </View>
      </View>
    );
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">Annual Development Plan</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1">
        {/* Tab Navigation */}
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === 'main' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('main')}
            >
              <Text className={`text-sm font-medium ${
                activeTab === 'main' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Development Plans
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === 'archive' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('archive')}
            >
              <View className="flex-row items-center gap-1">
                <Ionicons 
                  name="archive-outline" 
                  size={16} 
                  color={activeTab === 'archive' ? '#2563EB' : '#6B7280'} 
                />
                <Text className={`text-sm font-medium ${
                  activeTab === 'archive' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Archived
                </Text>
                {archivedCount > 0 && (
                  <View className="bg-red-500 rounded-full px-2 py-0.5">
                    <Text className="text-white text-xs font-semibold">{archivedCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {renderContent()}
      </View>
    </PageLayout>
  );
};

export default AnnualDevPlanMain;
