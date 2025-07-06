import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetAnnouncement, useDeleteAnnouncement } from './queries';
import PageLayout from '@/screens/_PageLayout';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from '@/lib/icons/ChevronLeft';
import { FileText } from '@/lib/icons/FileText';

export default function AnnouncementListPage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { data: announcements = [], isLoading, refetch } = useGetAnnouncement();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <FileText size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        No announcements yet
      </Text>
      <Text className="text-gray-400 text-center px-8">
        Announcements will appear here once added.
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading announcements...</Text>
    </View>
  );

  const RenderAnnouncementCard = React.memo(({ item, index }: { item: any; index: number }) => (
    <View key={index} className="mb-3 mx-5">
      <Card className="p-4 bg-white shadow-sm border border-gray-100">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/(announcement)/announcementview',
              params: { ann_id: item.ann_id },
            })
          }
        >
          <View className="flex-row items-center mb-2">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
              <FileText size={20} className="text-blue-600" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base" numberOfLines={2}>
                {item.ann_title}
              </Text>
              <Text className="text-gray-500 text-sm" numberOfLines={2}>
                {item.ann_details}
              </Text>
            </View>
            <ChevronLeft size={20} className="text-gray-400 ml-2 rotate-180" />
          </View>

          <View className="mb-2 self-start">
  <Text className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded-full">
    {item.ann_type?.toUpperCase()}
  </Text>
</View>
          <View>
            <Text className="text-gray-500 text-xs">
              Files: {item.files?.length > 0 ? `${item.files.length} file(s)` : 'None'}
            </Text>
            <Text className="text-gray-500 text-xs">
              Start: {item.ann_start_at || 'No start date'}
            </Text>
            <Text className="text-gray-500 text-xs">
              End: {item.ann_end_at || 'No end date'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteAnnouncement(String(item.ann_id))}
          className="flex-row items-center justify-center mt-3 bg-red-500 px-3 py-2 rounded-lg">        
          <Text className="text-white text-sm font-medium">Delete</Text>
        </TouchableOpacity>
      </Card>
    </View>
  ));

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Announcements</Text>
      }
      rightAction={
        <TouchableOpacity
          onPress={() => router.push('/(announcement)/announcementcreate')}
          className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
        >
          <Text className="text-white text-xl font-bold">+</Text>
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50 py-4">
        {/* Stats Card */}
        <Card className="flex-row items-center p-4 mb-4 bg-primaryBlue shadow-lg mx-5">
          <View className="p-3 bg-white/20 rounded-full mr-4">
            <FileText size={24} className="text-white" />
          </View>
          <View className="flex-1">
            <Text className="text-white/80 text-sm font-medium">
              Total Announcements
            </Text>
            <Text className="text-white text-2xl font-bold">
              {announcements.length}
            </Text>
          </View>
        </Card>

        {/* List */}
        <View className="flex-1">
          {isLoading && !isRefreshing ? (
            renderLoadingState()
          ) : announcements.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={announcements}
              renderItem={({ item, index }) => (
                <RenderAnnouncementCard item={item} index={index} />
              )}
              keyExtractor={(item) => item.ann_id.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#3B82F6']}
                />
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </PageLayout>
  );
}
