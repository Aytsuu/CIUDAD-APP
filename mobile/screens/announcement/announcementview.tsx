import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetAnnouncement } from './queries';

export default function AnnouncementViewPage() {
  const { ann_id } = useLocalSearchParams();
  const { data: announcements = [] } = useGetAnnouncement();

  const announcement = announcements.find((a) => a.ann_id === Number(ann_id));

  if (!announcement) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>Announcement not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#fff' }}>
      {/* Title */}
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 4, color: '#111' }}>
        {announcement.ann_title}
      </Text>
      <Text style={{ fontSize: 15, color: '#666', marginBottom: 16 }}>
        {announcement.ann_details}
      </Text>

      {/* Type and Schedule */}
      <View style={{
        backgroundColor: '#f8f9fb',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderColor: '#e2e6ea',
        borderWidth: 1,
      }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
          Type: <Text style={{ fontWeight: 'bold' }}>{announcement.ann_type?.toUpperCase()}</Text>
        </Text>
        <Text style={{ fontSize: 13, color: '#555', marginTop: 6 }}>
          Start: {announcement.ann_start_at || 'No start date'}
        </Text>
        <Text style={{ fontSize: 13, color: '#555' }}>
          End: {announcement.ann_end_at || 'No end date'}
        </Text>
      </View>

      {/* Files */}
      {announcement.files?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
            Attached Files
          </Text>
          {announcement.files.map((file: any) => (
            <Image
              key={file.af_id}
              source={{ uri: file.af_url }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 12,
                marginBottom: 14,
                backgroundColor: '#eee',
              }}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* Recipients */}
      {announcement.recipients?.length > 0 && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
            Recipients
          </Text>
          {announcement.recipients.map((rec: any) => (
            <View
              key={rec.ar_id}
              style={{
                backgroundColor: '#f9f9f9',
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
                borderColor: '#e2e2e2',
                borderWidth: 1,
              }}
            >
              <Text style={{ fontWeight: '500', marginBottom: 4 }}>
                Position: <Text style={{ fontWeight: 'bold' }}>{rec.position_title || 'N/A'}</Text>
              </Text>
              <Text>Delivery: {rec.ar_mode?.toUpperCase()}</Text>
              <Text>Age Group: {rec.ar_age || 'All'}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
