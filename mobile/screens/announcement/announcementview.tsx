import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useGetAnnouncement, useGetAnnouncementRecipient } from './queries';
import PageLayout from '@/screens/_PageLayout';

export default function AnnouncementViewPage() {
  const router = useRouter();
  const { ann_id } = useLocalSearchParams();

  const { data: announcements = [] } = useGetAnnouncement();
  const { data: recipients = [] } = useGetAnnouncementRecipient();

  const announcement = announcements.find((a) => a.ann_id === Number(ann_id));
  const announcementRecipients = recipients.filter(
    (rec: any) => rec.announcement_id === Number(ann_id)
  );

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
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">{announcement.ann_title}</Text>
        <Text className="text-base text-gray-600 mb-6">{announcement.ann_details}</Text>

        {/* Type and Schedule */}
        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-800 font-semibold mb-2">
            Type: <Text className="font-bold">{announcement.ann_type?.toUpperCase()}</Text>
          </Text>
          <Text className="text-gray-600 mb-1">
            Start: {announcement.ann_start_at || 'No start date'}
          </Text>
          <Text className="text-gray-600">End: {announcement.ann_end_at || 'No end date'}</Text>
        </View>

        {/* Recipients */}
        {announcementRecipients.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Recipients</Text>
            {announcementRecipients.map((rec: any) => (
              <View
                key={rec.ar_id}
                className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm"
              >
                <Text className="text-gray-800 font-medium mb-1">
                  Position: <Text className="font-bold">{rec.position_title || 'N/A'}</Text>
                </Text>
                <Text className="text-gray-600 mb-1">
                  Delivery: {rec.ar_mode?.toUpperCase()}
                </Text>
                <Text className="text-gray-600">Age Group: {rec.ar_age || 'All'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Files */}
        {announcement.files?.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Attached Files</Text>
            {announcement.files.map((file: any) => (
              <Image
                key={file.af_id}
                source={{ uri: file.af_url }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 12,
                  marginBottom: 16,
                  backgroundColor: '#e5e7eb',
                }}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
}
