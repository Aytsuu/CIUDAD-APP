import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useGetAnnouncement } from './queries';
import PageLayout from '@/screens/_PageLayout';

function formatDate(dateString?: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function AnnouncementViewPage() {
  const router = useRouter();
  const { ann_id } = useLocalSearchParams();

  const { data: announcements = [] } = useGetAnnouncement();
  const announcement = announcements.find((a) => a.ann_id === Number(ann_id));

  if (!announcement) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 text-base">Announcement not found.</Text>
      </View>
    );
  }

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Announcement Details</Text>}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Basic Information */}
        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-2">Basic Information</Text>
          <Text className="text-gray-600 mb-1">Title</Text>
          <Text className="text-gray-900 font-semibold mb-3">{announcement.ann_title}</Text>
          
          <Text className="text-gray-600 mb-1">Details</Text>
          <Text className="text-gray-700 mb-3">{announcement.ann_details}</Text>

          <Text className="text-gray-600 mb-1">Type</Text>
          <Text className="text-gray-900 font-semibold">{announcement.ann_type}</Text>
        </View>

        {/* Schedule */}
        {(announcement.ann_start_at || announcement.ann_end_at || announcement.ann_event_start || announcement.ann_event_end) && (
          <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Schedule</Text>
            {announcement.ann_start_at && (
              <Text className="text-gray-700 mb-1">Start: {formatDate(announcement.ann_start_at)}</Text>
            )}
            {announcement.ann_end_at && (
              <Text className="text-gray-700 mb-1">End: {formatDate(announcement.ann_end_at)}</Text>
            )}
            {announcement.ann_event_start && (
              <Text className="text-gray-700 mb-1">Event Start: {formatDate(announcement.ann_event_start)}</Text>
            )}
            {announcement.ann_event_end && (
              <Text className="text-gray-700">Event End: {formatDate(announcement.ann_event_end)}</Text>
            )}
          </View>
        )}

        {/* Delivery Options */}
        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-3">Delivery Options</Text>
          <Text className="text-gray-700 mb-1">
            Send via SMS: <Text className="font-bold">{announcement.ann_to_sms ? 'Yes' : 'No'}</Text>
          </Text>
          <Text className="text-gray-700">
            Send via Email: <Text className="font-bold">{announcement.ann_to_email ? 'Yes' : 'No'}</Text>
          </Text>
        </View>

        {/* Recipients */}
        {announcement.recipients?.length > 0 && (
          <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Recipients</Text>
            {announcement.recipients.map((recipient: any) => (
              <Text key={recipient.ar_id} className="text-gray-700 mb-1">
                {recipient.ar_category} {recipient.ar_type ? `- ${recipient.ar_type}` : ''}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
}
