import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetAnnouncement, useDeleteAnnouncement } from './queries';

export default function AnnouncementListPage() {
  const router = useRouter();
  const { data: announcements = [], isLoading } = useGetAnnouncement();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>
          Loading announcements...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      {/* Create button */}
      <TouchableOpacity
        onPress={() => router.push('/(announcement)/announcementcreate')}
        style={{
          backgroundColor: '#007AFF',
          paddingVertical: 12,
          borderRadius: 10,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          + Create Announcement
        </Text>
      </TouchableOpacity>

      {/* Announcement List */}
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.ann_id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: '#f9f9f9',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#e1e1e1',
            }}
          >
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(announcement)/announcementview',
                  params: { ann_id: item.ann_id },
                })
              }
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  marginBottom: 6,
                  color: '#111',
                }}
              >
                {item.ann_title}
              </Text>
              <Text
                numberOfLines={2}
                style={{ fontSize: 14, color: '#555', marginBottom: 6 }}
              >
                {item.ann_details}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: '#888',
                  backgroundColor: '#e6f0ff',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                }}
              >
                {item.ann_type?.toUpperCase()}
              </Text>
            </TouchableOpacity>

            {/* Delete button */}
            <TouchableOpacity
              onPress={() => deleteAnnouncement(String(item.ann_id))}
              style={{
                marginTop: 12,
                backgroundColor: '#ff3b30',
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: 14,
                }}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
